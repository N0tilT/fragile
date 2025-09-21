from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import *
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
import logging
from logging_loki import LokiHandler
from dotenv import dotenv_values
import os
import asyncio
import json


emulator_number = os.getenv('NUMBER','0')
emulator_interval= int(os.getenv('INTERVAL','10'))
clients =[]

def setup_loki_logging():
    logger = logging.getLogger(f'fragile-emulator{emulator_number}')
    logger.setLevel(logging.DEBUG)
    
    loki_handler = LokiHandler(
        url='http://loki:3100/loki/api/v1/push',
        tags={"application": f"fragile-emulator{emulator_number}"},
        version="1"
    )
    
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    loki_handler.setFormatter(formatter)
    logger.addHandler(loki_handler)
    
    return logger

logger = setup_loki_logging()

class Settings(BaseModel):
    type: str
    coordinates: str
    edge_value: float
    radius: float
    
def custom_datetime_parser(date_str):
    return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%f')

async def send_message_to_clients():
    disconnected_clients = []
    for client in clients:
        try:
            data = create_data()
            settings = get_settings()
            if float(data.value) > settings.edge_value:
                data.level = "DANGER"
            elif float(data.value) > settings.edge_value - 20:
                data.level = "UNSTABLE"
            else:
                data.level = "CALM"
            json_data = json.dumps({
                "value": data.value,
                "datetime": data.datetime.isoformat(),
                "radius": settings.radius,
                "coordinates": settings.coordinates,
                "type": settings.type,
                "level": data.level
            })
            await client.send_text(json_data)
        except (WebSocketDisconnect, RuntimeError) as e:
            logger.error(f"Client disconnected: {e}")
            disconnected_clients.append(client)
        except Exception as e:
            logger.error(f"Unexpected error when sending data: {e}")
            disconnected_clients.append(client)
    
    for client in disconnected_clients:
        if client in clients:
            clients.remove(client)

def job():
        asyncio.run(send_message_to_clients())
scheduler = BackgroundScheduler()
scheduler.add_job(job, 'interval', seconds=emulator_interval)
scheduler.start()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://fragile-client:8137", "http://fragile-client:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.on_event("startup")
async def startup_event(): 
    create_settings()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.datetime.now()
    
    try:
        response = await call_next(request)
        process_time = (datetime.datetime.now() - start_time).total_seconds() * 1000
        
        logger.info(
            "Request processed",
            extra={
                'tags': {
                    'method': request.method,
                    'url': str(request.url),
                    'status_code': response.status_code,
                    'process_time_ms': process_time,
                    'client_host': request.client.host if request.client else None
                }
            }
        )
        
        return response
        
    except Exception as e:
        process_time = (datetime.datetime.now()- start_time).total_seconds() * 1000
        logger.error(
            f"Request failed: {str(e)}",
            extra={
                'tags': {
                    'method': request.method,
                    'url': str(request.url),
                    'process_time_ms': process_time,
                    'error': str(e)
                }
            }
        )
        raise

@app.get("/get_data_by_datetime/{datetime}")
def get_all_data_by_datetime(datetime: datetime.datetime):
    settings = get_settings()
    return {"data": get_data_by_datetime(datetime), "radius": settings.radius, "coordinates": settings.coordinates, "type": settings.type}


@app.post("/post_setiings")
async def post_settings(settings: Settings):
    return {"settings":change_settings(settings.type, settings.coordinates, settings.edge_value, settings.radius)} 

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        clients.remove(websocket)
        logger.info("Client disconnected")
    except Exception as e:
        clients.remove(websocket)
        logger.error(f"Unexpected error: {e}")