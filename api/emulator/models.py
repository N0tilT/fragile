import dotenv
from sqlalchemy import Column, Float, String, DateTime, Integer
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
import datetime
import random
from datetime import timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import dotenv_values, load_dotenv
import os


SQLITE_DATABASE = "sqlite:///emulator.db"
engine = create_engine(SQLITE_DATABASE)

env = dotenv_values(".env")

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
    settings = Settings(type=env['TYPE'], coordinates=env['COORDINATES'], edge_value=float(env['EDGE_VALUE']), radius=float(env['RADIUS']))
    db.add(settings)
    db.commit()

def get_data_by_datetime(datetime):
    datas = db.query(Data).filter(Data.datetime > datetime).all()
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

def get_settings_radius():
    return db.query(Settings).first().radius
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
