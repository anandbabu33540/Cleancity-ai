from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="citizen") # 'admin' or 'citizen'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Ward(Base):
    __tablename__ = "wards"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    latitude = Column(Float)
    longitude = Column(Float)

class WasteReport(Base):
    __tablename__ = "waste_reports"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String)
    waste_type = Column(String)
    confidence = Column(Float)
    category = Column(String)
    severity = Column(String)
    description = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    status = Column(String, default="Pending") # Pending, In Progress, Resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
