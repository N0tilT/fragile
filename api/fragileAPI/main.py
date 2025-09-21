from database import DatabaseConfig, DatabaseConnection
from migrations import MigrationManager
from device_repository import DeviceRepository
from incident_repository import IncidentRepository
from data_repository import DataRepository
from device import Device
from incident import Incident
from data import Data
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import logging
from logging_loki import LokiHandler
import json
from apscheduler.schedulers.background import BackgroundScheduler
import script

def setup_loki_logging():
    logger = logging.getLogger('fragile-api')
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

db_config = DatabaseConfig(
    'fragiledb',
    'postgres',
    'postgres',
    '123Secret_a',
    5432
)

replicantdb_config = DatabaseConfig(
    'fragiledb2',
    'postgres2',
    'postgres',
    '123Secret_a',
    5432
)

db_connection = DatabaseConnection(db_config)

migration_manager = MigrationManager(db_config)
migration_manager.create_tables()
migration_manager.prefill_devices()

replicant_migration_manager = MigrationManager(replicantdb_config)
replicant_migration_manager.create_tables()
replicant_migration_manager.prefill_devices()

device_repository = DeviceRepository(db_connection)
incident_repository = IncidentRepository(db_connection)
data_repository = DataRepository(db_connection)


scheduler = BackgroundScheduler()
scheduler.add_job(script.replicate_database, 'interval',  args=[db_config,replicantdb_config],seconds=90)
scheduler.start()

app = FastAPI(title="FragileAPI")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://fragile-client3:8137", "http://fragile-client3:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    try:
        response = await call_next(request)
        process_time = (datetime.now() - start_time).total_seconds() * 1000
        logger.info(
            f"Request processed - {request.method} {request.url.path}",
            extra={
                'method': request.method,
                'path': request.url.path,
                'status_code': response.status_code,
                'process_time_ms': str(process_time),
                'client_host': request.client.host if request.client else 'unknown'
            }
        )
        
        return response
        
    except Exception as e:
        process_time = (datetime.now() - start_time).total_seconds() * 1000
        logger.error(
            f"Request failed: {str(e)}",
            extra={
                'method': request.method,
                'path': request.url.path,
                'process_time_ms': str(process_time),
                'error': str(e)
            }
        )
        raise

@app.get("/test-logs")
async def test_logs():
    logger.debug("This is a DEBUG message")
    logger.info("This is an INFO message")
    logger.warning("This is a WARNING message")
    logger.error("This is an ERROR message")
    return {"status": "test logs generated"}

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Device Monitoring API"}

# Devices endpoints
@app.get("/devices")
async def get_devices():
    try:
        logger.info("Fetching all devices")
        devices = device_repository.get_all()
        logger.info(f"Retrieved {len(devices)} devices")
        return devices
    except Exception as e:
        logger.error(f"Error fetching devices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении устройств: {str(e)}")

@app.post("/devices")
async def create_device(device_data: dict):
    try:
        logger.info(f"Creating new device: {device_data}")
        device = Device(
            name=device_data['name'],
            type=device_data['type'],
            coordinates=device_data['coordinates']
        )
        created_device = device_repository.create_device(device)
        logger.info(f"Device created successfully: {created_device.id}")
        return created_device
    except Exception as e:
        logger.error(f"Error creating device: {str(e)}", extra={'device_data': device_data})
        raise HTTPException(status_code=500, detail=f"Ошибка при добавлении устройства: {str(e)}")

# Incidents endpoints
@app.get("/incidents")
async def get_incidents():
    try:
        logger.info("Fetching all incidents")
        incidents = incident_repository.get_all()
        incidents = sorted(incidents, key=lambda x: x.datetime, reverse=True)[:10]
        logger.info(f"Retrieved {len(incidents)} incidents")
        return incidents
    except Exception as e:
        logger.error(f"Error fetching incidents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении инцидентов: {str(e)}")

@app.post("/incidents")
async def create_incident(incident_data: dict):
    try:
        logger.info(f"Creating new incident: {incident_data}")
        incident = Incident(
            name=incident_data['name'],
            description=incident_data['description'],
            status=incident_data['status'],
            coordinates=incident_data['coordinates'],
            device_id=incident_data['device_id'],
            datetime=datetime.now()
        )
        created_incident = incident_repository.create_incident(incident)
        logger.info(f"Incident created successfully: {created_incident.id}")
        return created_incident
    except Exception as e:
        logger.error(f"Error creating incident: {str(e)}", extra={'incident_data': incident_data})
        raise HTTPException(status_code=500, detail=f"Ошибка при добавлении инцидента: {str(e)}")

# Data endpoints
@app.get("/data")
async def get_data():
    try:
        logger.info("Fetching all data entries")
        data_entries = data_repository.get_all()
        data_entries = sorted(data_entries, key=lambda x: x.datetime, reverse=True)[:10]
        logger.info(f"Retrieved {len(data_entries)} data entries")
        return data_entries
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении данных: {str(e)}")

@app.get("/data/device/{device_id}")
async def get_data_by_device(device_id: int):
    try:
        logger.info(f"Fetching data for device: {device_id}")
        data_entries = data_repository.get_by_device_id(device_id)
        data_entries = sorted(data_entries, key=lambda x: x.datetime, reverse=True)[:10]
        logger.info(f"Retrieved {len(data_entries)} data entries for device {device_id}")
        return data_entries
    except Exception as e:
        logger.error(f"Error fetching device data: {str(e)}", extra={'device_id': device_id})
        raise HTTPException(status_code=500, detail=f"Ошибка при получении данных устройства: {str(e)}")

@app.post("/data")
async def create_data(data_data: dict):
    try:
        logger.info(f"Creating new data entry: {data_data}")
        data = Data(
            device_id=data_data['device_id'],
            value=data_data['value'],
            datetime=datetime.now(timezone.utc)
        )
        created_data = data_repository.create_data(data)
        logger.info(f"Data entry created successfully: {created_data.id}")
        return created_data
    except Exception as e:
        logger.error(f"Error creating data entry: {str(e)}", extra={'data_data': data_data})
        raise HTTPException(status_code=500, detail=f"Ошибка при добавлении данных: {str(e)}")

@app.get("/health")
async def health_check():
    try:
        conn = db_connection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        
        logger.info("Health check passed")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    logger.info("Starting Device Monitoring API")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)