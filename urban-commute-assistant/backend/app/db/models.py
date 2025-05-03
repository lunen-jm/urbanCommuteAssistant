from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(100), nullable=True)
    disabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    notifications = relationship("Notification", back_populates="owner")
    commute_routes = relationship("CommuteRoute", back_populates="user")
    preferences = relationship("UserPreference", back_populates="user", uselist=False)

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    message = Column(Text)
    type = Column(String(50))  # e.g., "weather", "traffic", "transit", "system"
    is_read = Column(Boolean, default=False)
    severity = Column(String(20), default="info")  # e.g., "info", "warning", "critical"
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="notifications")

class CommuteRoute(Base):
    __tablename__ = 'commute_routes'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String(100))
    start_location = Column(String(255))
    start_latitude = Column(Float)
    start_longitude = Column(Float)
    end_location = Column(String(255))
    end_latitude = Column(Float)
    end_longitude = Column(Float)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="commute_routes")

class UserPreference(Base):
    __tablename__ = 'user_preferences'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    preferred_transport = Column(String(50))  # e.g., "car", "bus", "bike", "walk"
    notifications_enabled = Column(Boolean, default=True)
    weather_alerts = Column(Boolean, default=True)
    traffic_alerts = Column(Boolean, default=True)
    transit_alerts = Column(Boolean, default=True)
    theme = Column(String(20), default="light")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="preferences")

class ApiUsage(Base):
    __tablename__ = 'api_usage'

    id = Column(Integer, primary_key=True, index=True)
    api_name = Column(String(50))  # e.g., "weather", "traffic", "transit"
    endpoint = Column(String(255))
    request_count = Column(Integer, default=1)
    last_request_at = Column(DateTime, default=datetime.utcnow)
    date = Column(String(10))  # YYYY-MM-DD format for daily tracking