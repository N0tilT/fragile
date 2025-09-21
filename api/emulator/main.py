from fastapi import FastAPI, Request
from models import *
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
import logging
from logging_loki import LokiHandler
from dotenv import dotenv_values

env = dotenv_values(".env")

def setup_loki_logging():
    logger = logging.getLogger(f'fragile-emulator{env['NUMBER']}')
    logger.setLevel(logging.DEBUG)
    
    loki_handler = LokiHandler(
        url='http://loki:3100/loki/api/v1/push',
        tags={"application": "fragile-api"},
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


scheduler = BackgroundScheduler()
scheduler.add_job(create_data, 'interval', seconds=30)
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
async def get_all_data_by_datetime(datetime: datetime.datetime):
    data = get_data_by_datetime(datetime)

    return {"data": get_data_by_datetime(datetime), "radius": get_settings_radius()}


@app.post("/post_setiings")
async def post_settings(settings: Settings):
    return {"settings":change_settings(settings.type, settings.coordinates, settings.edge_value, settings.radius)} 
