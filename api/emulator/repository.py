from .models import engine
from .models import Data, Settings
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random

Session = sessionmaker(bind=engine)
db = Session()

def get_data_by_datetime(datetime):
    return db.query(Data).filter(Data.datetime > datetime).first()
def post_setiings(settings):
    settings_original = db.query(Settings).first()
    settings_original.type = settings.type
    settings_original.coordinates = settings.coordinates
    settings_original.edge_value = settings.edge_value
    settings_original.radius = settings.radius

    db.add(settings)
    db.commit()
def get_settings():
    return db.query(Settings).first()
def generate_data(data):
    settings = get_settings()
    datas = []
    current_datetime = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    for i in range(2880):
        current_day = current_day + timedelta(seconds=30)
        data = Data(value = random.randint(0, 100), datetime = current_day)
        datas.append(data)
    db.add_all(datas)
    db.commit()

