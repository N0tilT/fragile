import dotenv
from sqlalchemy import Column, Float, String, DateTime, Integer
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
import datetime
import random
from datetime import timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

SQLITE_DATABASE = "sqlite:///emulator.db"
engine = create_engine(SQLITE_DATABASE)

emulator_type=os.getenv('TYPE','radio'), 
emulator_coordinates=os.getenv('COORDINATES','[37.623082, 55.75254]'), 
emulator_edge_value=float(os.getenv('EDGE_VALUE','70')), 
emulator_radius=float(os.getenv('RADIUS','1000'))

Base = declarative_base()

######## Модели данных
class Data(Base):
    __tablename__ = 'data'
    id = Column(Integer, primary_key=True, autoincrement=True)
    value = Column(String)
    datetime = Column(DateTime, nullable=False)

class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String)
    coordinates = Column(String)
    edge_value = Column(Float)
    radius = Column(Float)

Base.metadata.create_all(engine)

#Репозиторий

Session = sessionmaker(bind=engine)
db = Session()


def create_settings():
    if db.query(Settings).first() is not None:
        return
    settings = Settings(type=emulator_type, coordinates=emulator_coordinates, edge_value=float(emulator_edge_value), radius=float(emulator_radius))
    db.add(settings)
    db.commit()

def get_data_by_datetime(datetime):
    datas = db.query(Data).filter(Data.datetime > datetime).all()
    edge_value = db.query(Settings).first().edge_value
    for data in datas:
        if float(data.value) > edge_value:
            data.level = "DANGER"
        elif float(data.value) > edge_value-20:
            data.level = "UNSTABLE"
        else:
            data.level = "CALM"

    # TODO: add level to each data.
    # edge_value = 70
    # for data in datas:
    #   if data > 70:
    #        level = "DANGER"
    #   if data > 50:
    #        level = "UNSTABLE" 
    #   else:
    #        level = "CALM"
    # data:[
    #    {"value":100,"level":"DANGER"},{"value":60,"level":"UNSTABLE"},{"value":5,"level":"CALM"}
    #]
    return datas
def change_settings(type, coordinates, edge_value, radius):
    settings_original = db.query(Settings).first()
    settings_original.type = type
    settings_original.coordinates = coordinates
    settings_original.edge_value = edge_value
    settings_original.radius = radius
    db.add(settings_original)
    db.commit()
    print(settings_original.type, settings_original.coordinates, settings_original.edge_value, settings_original.radius)
    return settings_original

def get_settings():
    return db.query(Settings).first()
def generate_data():
    datas = []
    current_datetime = datetime.datetime.now().replace(hour=0, minute=0, second=0)
    while current_datetime < datetime.datetime.now():
        current_datetime += timedelta(seconds=30)
        data = Data(value = random.randint(0, 100), datetime = current_datetime)
        datas.append(data)
    db.add_all(datas)
    db.commit()
#Создание одного объекта data  для периодического пополнения бд
def create_data():
    data = Data(value = random.randint(0, 100), datetime = datetime.datetime.now())
    db.add(data)
    db.commit()
    print(f'Data:{data.value}, {data.datetime}')
    return data
