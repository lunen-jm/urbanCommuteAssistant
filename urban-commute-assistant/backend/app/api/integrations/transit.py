import os
import time
import json
import requests
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from google.transit import gtfs_realtime_pb2
import pandas as pd
from io import BytesIO
import zipfile
from datetime import datetime
import redis

from app.core.config import Config
from app.schemas.transit import (
    TransitRoute, 
    TransitStop, 
    TripUpdate, 
    VehiclePosition, 
    ServiceAlert, 
    StopTimeUpdate
)

router = APIRouter()

class KingCountyMetroService:
    def __init__(self):
        self.gtfs_url = Config.KC_METRO_GTFS_URL
        self.gtfs_rt_url = Config.KC_METRO_GTFS_RT_URL
        self.redis = redis.from_url(Config.REDIS_URL)
        
        # Feed URLs
        self.trip_updates_url = f"{self.gtfs_rt_url}/tripupdates.pb"
        self.vehicle_positions_url = f"{self.gtfs_rt_url}/vehiclepositions.pb"
        self.service_alerts_url = f"{self.gtfs_rt_url}/alerts.pb"
        
    def get_static_schedules(self):
        """Fetch and process static GTFS data (schedules, routes, stops)"""
        cache_key = "kc_metro_static_data"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
            
        try:
            # Download the GTFS zip file
            response = requests.get(self.gtfs_url)
            response.raise_for_status()
            
            data = {}
            with zipfile.ZipFile(BytesIO(response.content)) as z:
                # Process key files from the GTFS feed
                for filename in ['routes.txt', 'stops.txt', 'trips.txt', 'stop_times.txt']:
                    if filename in z.namelist():
                        with z.open(filename) as f:
                            df = pd.read_csv(f)
                            data[filename.replace('.txt', '')] = df.to_dict(orient='records')
            
            # Cache for 24 hours (static data changes infrequently)
            self.redis.setex(cache_key, 24 * 60 * 60, json.dumps(data))
            return data
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch GTFS data: {str(e)}")
    
    def get_trip_updates(self):
        """Fetch real-time trip updates (delays, cancellations, etc.)"""
        cache_key = "kc_metro_trip_updates"
        cached_data = self.redis.get(cache_key)
        
        # Short cache time for real-time data
        if cached_data:
            return json.loads(cached_data)
        
        try:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(self.trip_updates_url)
            response.raise_for_status()
            feed.ParseFromString(response.content)
            
            updates = []
            for entity in feed.entity:
                if entity.HasField('trip_update'):
                    update = {
                        'trip_id': entity.trip_update.trip.trip_id,
                        'route_id': entity.trip_update.trip.route_id,
                        'schedule_relationship': entity.trip_update.trip.schedule_relationship,
                        'stop_time_updates': []
                    }
                    
                    for stop_time_update in entity.trip_update.stop_time_update:
                        update['stop_time_updates'].append({
                            'stop_id': stop_time_update.stop_id,
                            'arrival_delay': stop_time_update.arrival.delay if stop_time_update.HasField('arrival') else None,
                            'departure_delay': stop_time_update.departure.delay if stop_time_update.HasField('departure') else None
                        })
                    
                    updates.append(update)
            
            # Cache for 60 seconds
            self.redis.setex(cache_key, 60, json.dumps(updates))
            return updates
            
        except Exception as e:
            # Return empty list on error
            return []
    
    def get_vehicle_positions(self):
        """Fetch real-time vehicle positions"""
        cache_key = "kc_metro_vehicle_positions"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        try:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(self.vehicle_positions_url)
            response.raise_for_status()
            feed.ParseFromString(response.content)
            
            positions = []
            for entity in feed.entity:
                if entity.HasField('vehicle'):
                    position = {
                        'vehicle_id': entity.vehicle.vehicle.id,
                        'trip_id': entity.vehicle.trip.trip_id,
                        'route_id': entity.vehicle.trip.route_id,
                        'latitude': entity.vehicle.position.latitude,
                        'longitude': entity.vehicle.position.longitude,
                        'speed': entity.vehicle.position.speed,
                        'bearing': entity.vehicle.position.bearing,
                        'occupancy_status': entity.vehicle.occupancy_status if entity.vehicle.HasField('occupancy_status') else None,
                        'timestamp': entity.vehicle.timestamp
                    }
                    positions.append(position)
            
            # Cache for 30 seconds
            self.redis.setex(cache_key, 30, json.dumps(positions))
            return positions
            
        except Exception as e:
            # Return empty list on error
            return []
    
    def get_service_alerts(self):
        """Fetch service alerts (disruptions, detours, etc.)"""
        cache_key = "kc_metro_service_alerts"
        cached_data = self.redis.get(cache_key)
        
        # Cache alerts for 5 minutes
        if cached_data:
            return json.loads(cached_data)
        
        try:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(self.service_alerts_url)
            response.raise_for_status()
            feed.ParseFromString(response.content)
            
            alerts = []
            for entity in feed.entity:
                if entity.HasField('alert'):
                    alert = {
                        'id': entity.id,
                        'effect': entity.alert.effect,
                        'header_text': entity.alert.header_text.translation[0].text,
                        'description': entity.alert.description_text.translation[0].text if entity.alert.description_text.translation else "",
                        'affected_routes': [],
                        'affected_stops': []
                    }
                    
                    for informed_entity in entity.alert.informed_entity:
                        if informed_entity.HasField('route_id'):
                            alert['affected_routes'].append(informed_entity.route_id)
                        if informed_entity.HasField('stop_id'):
                            alert['affected_stops'].append(informed_entity.stop_id)
                    
                    alerts.append(alert)
            
            # Cache for 5 minutes
            self.redis.setex(cache_key, 5 * 60, json.dumps(alerts))
            return alerts
            
        except Exception as e:
            # Return empty list on error
            return []

# API Endpoints for King County Metro data

@router.get("/transit/routes", response_model=List[TransitRoute])
async def get_routes():
    """Get all available transit routes"""
    service = KingCountyMetroService()
    gtfs_data = service.get_static_schedules()
    
    if not gtfs_data or 'routes' not in gtfs_data:
        raise HTTPException(status_code=404, detail="Route data not found")
    
    return gtfs_data['routes']

@router.get("/transit/stops", response_model=List[TransitStop])
async def get_stops():
    """Get all transit stops"""
    service = KingCountyMetroService()
    gtfs_data = service.get_static_schedules()
    
    if not gtfs_data or 'stops' not in gtfs_data:
        raise HTTPException(status_code=404, detail="Stop data not found")
    
    return gtfs_data['stops']

@router.get("/transit/vehicles", response_model=List[VehiclePosition])
async def get_vehicle_positions(route_id: Optional[str] = Query(None)):
    """Get real-time vehicle positions with optional filtering by route"""
    service = KingCountyMetroService()
    positions = service.get_vehicle_positions()
    
    if route_id:
        positions = [p for p in positions if p['route_id'] == route_id]
        
    return positions

@router.get("/transit/alerts", response_model=List[ServiceAlert])
async def get_service_alerts(route_id: Optional[str] = Query(None)):
    """Get service alerts with optional filtering by route"""
    service = KingCountyMetroService()
    alerts = service.get_service_alerts()
    
    if route_id:
        alerts = [a for a in alerts if route_id in a['affected_routes']]
        
    return alerts

@router.get("/transit/trips/updates", response_model=List[TripUpdate])
async def get_trip_updates(route_id: Optional[str] = Query(None)):
    """Get trip updates with optional filtering by route"""
    service = KingCountyMetroService()
    updates = service.get_trip_updates()
    
    if route_id:
        updates = [u for u in updates if u['route_id'] == route_id]
        
    return updates

# Legacy placeholder endpoints - keeping for backward compatibility
@router.get("/transit/schedule/{location}")
async def get_transit_schedule(location: str):
    try:
        # Now delegates to our King County Metro service for Seattle area
        service = KingCountyMetroService()
        updates = service.get_trip_updates()
        return {"location": location, "updates": updates}
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@router.get("/transit/disruptions/{location}")
async def get_transit_disruptions(location: str):
    try:
        # Now delegates to our King County Metro service for Seattle area
        service = KingCountyMetroService()
        alerts = service.get_service_alerts()
        return {"location": location, "alerts": alerts}
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))