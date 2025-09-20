from sqlalchemy import Column, Float, String, DateTime
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
SQLITE_DATABASE = "sqlite:///emulator.db"
engine = create_engine(SQLITE_DATABASE)

Base = declarative_base()

class Data(Base):
    __tablename__ = 'data'
    id = Column(Float, primary_key=True)
    value = Column(String)
    datetime = Column(DateTime)

class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Float, primary_key=True)
    type = Column(String)
    coordinates = Column(String)
    edge_value = Column(Float)
    radius = Column(Float)

Base.metadata.create_all(engine)
