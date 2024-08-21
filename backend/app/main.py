
from fastapi import FastAPI
from .routers import entity_relationships, network_views, time_based_network, network_analytics
from .database import engine
from . import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(entity_relationships.router)
app.include_router(network_views.router)
app.include_router(time_based_network.router)
app.include_router(network_analytics.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Political Corruption Identification API"}
project_root/backend/app/database.py
 from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
