 from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    risk_score = Column(Float)

class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("entities.id"))
    target_id = Column(Integer, ForeignKey("entities.id"))
    type = Column(String)
    amount = Column(Float)
    timestamp = Column(DateTime)

class NetworkView(Base):
    __tablename__ = "network_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    data = Column(String)  # JSON string

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
