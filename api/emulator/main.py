from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, HTTPException
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
    for client in clients:
        data=create_data()
        settings = get_settings()
        if float(data.value) > settings.edge_value:
            data.level = "DANGER"
        elif float(data.value) > settings.edge_value-20:
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

def job():
        asyncio.run(send_message_to_clients())
scheduler = BackgroundScheduler()
scheduler.add_job(job, 'interval', seconds=30)
scheduler.start()

app = FastAPI()

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
    clients.append(websocket)
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Вы сказали: {data}")