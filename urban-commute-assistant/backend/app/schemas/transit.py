from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TransitRoute(BaseModel):
    route_id: str
    agency_id: Optional[str] = None
    route_short_name: Optional[str] = None
    route_long_name: Optional[str] = None
    route_type: int
    route_color: Optional[str] = None
    route_text_color: Optional[str] = None

class TransitStop(BaseModel):
    stop_id: str
    stop_name: str
    stop_lat: float
    stop_lon: float
    location_type: Optional[int] = None
    parent_station: Optional[str] = None
    
class StopTimeUpdate(BaseModel):
    stop_id: str
    arrival_delay: Optional[int] = None
    departure_delay: Optional[int] = None

class TripUpdate(BaseModel):
    trip_id: str
    route_id: str
    schedule_relationship: int
    stop_time_updates: List[StopTimeUpdate]

class VehiclePosition(BaseModel):
    vehicle_id: str
    trip_id: str
    route_id: str
    latitude: float
    longitude: float
    speed: Optional[float] = None
    bearing: Optional[float] = None
    occupancy_status: Optional[int] = None
    timestamp: int

class ServiceAlert(BaseModel):
    id: str
    effect: int
    header_text: str
    description: str
    affected_routes: List[str]
    affected_stops: List[str]