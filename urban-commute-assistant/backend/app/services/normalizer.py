from typing import Dict, Any, List, Optional, Union
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DataNormalizer:
    """
    Standardizes and normalizes data from different APIs to ensure consistency
    across the application. Handles edge cases and inconsistent responses.
    """
    
    @staticmethod
    def normalize_weather_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize weather data from OpenWeatherMap API.
        Handles missing fields and edge cases.
        """
        if not data or 'error' in data:
            return {
                'data_available': False,
                'error': data.get('error', 'Unknown error in weather data'),
                'timestamp': datetime.now().isoformat()
            }
        
        try:
            # Extract weather condition
            weather_condition = 'Unknown'
            weather_description = ''
            if 'weather' in data and len(data['weather']) > 0:
                weather_condition = data['weather'][0].get('main', 'Unknown')
                weather_description = data['weather'][0].get('description', '')
            
            # Extract temperature data
            main_data = data.get('main', {})
            temp = main_data.get('temp')
            feels_like = main_data.get('feels_like')
            humidity = main_data.get('humidity')
            
            # Convert temperature if needed (some APIs use Kelvin)
            if temp is not None and temp > 200:  # It's probably Kelvin
                temp = round((temp - 273.15) * 9/5 + 32, 1)  # Convert to Fahrenheit
            if feels_like is not None and feels_like > 200:
                feels_like = round((feels_like - 273.15) * 9/5 + 32, 1)
            
            # Extract wind data
            wind_data = data.get('wind', {})
            wind_speed = wind_data.get('speed')
            wind_direction = wind_data.get('deg')
            
            # Format timestamp
            dt = data.get('dt')
            if dt:
                timestamp = datetime.fromtimestamp(dt).isoformat()
            else:
                timestamp = datetime.now().isoformat()
            
            return {
                'data_available': True,
                'condition': weather_condition,
                'description': weather_description,
                'temperature': temp,
                'feels_like': feels_like,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'wind_direction': wind_direction,
                'timestamp': timestamp,
            }
        except Exception as e:
            logger.error(f"Error normalizing weather data: {e}")
            return {
                'data_available': False,
                'error': f"Failed to process weather data: {str(e)}",
                'timestamp': datetime.now().isoformat()
            }
    
    @staticmethod
    def normalize_traffic_flow(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize traffic flow data from TomTom API.
        """
        if not data:
            return {
                'data_available': False,
                'error': 'No traffic flow data received',
                'timestamp': datetime.now().isoformat()
            }
        
        try:
            flow_data = data.get('flowSegmentData', {})
            
            current_speed = flow_data.get('currentSpeed')
            free_flow_speed = flow_data.get('freeFlowSpeed')
            
            # Calculate congestion level
            congestion_level = None
            if current_speed is not None and free_flow_speed is not None and free_flow_speed > 0:
                speed_ratio = current_speed / free_flow_speed
                
                # Determine congestion level
                if speed_ratio >= 0.85:
                    congestion_level = 'low'
                elif speed_ratio >= 0.65:
                    congestion_level = 'moderate'
                elif speed_ratio >= 0.3:
                    congestion_level = 'high'
                else:
                    congestion_level = 'severe'
            
            return {
                'data_available': True,
                'currentSpeed': current_speed,
                'freeFlowSpeed': free_flow_speed,
                'currentTravelTime': flow_data.get('currentTravelTime'),
                'freeFlowTravelTime': flow_data.get('freeFlowTravelTime'),
                'speedRatio': current_speed / free_flow_speed if current_speed is not None and free_flow_speed is not None and free_flow_speed > 0 else None,
                'congestion_level': congestion_level,
                'road_closure': flow_data.get('roadClosure', False),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error normalizing traffic flow data: {e}")
            return {
                'data_available': False,
                'error': f"Failed to process traffic flow data: {str(e)}",
                'timestamp': datetime.now().isoformat()
            }
    
    @staticmethod
    def normalize_traffic_incidents(data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Normalize traffic incidents data from TomTom API.
        """
        normalized_incidents = []
        
        if not data or 'incidents' not in data:
            return normalized_incidents
        
        try:
            for incident in data.get('incidents', []):
                properties = incident.get('properties', {})
                
                # Extract coordinates
                coordinates = None
                geometry = incident.get('geometry', {})
                if geometry and geometry.get('type') == 'Point' and 'coordinates' in geometry:
                    coords = geometry['coordinates']
                    if len(coords) >= 2:
                        coordinates = {
                            'longitude': coords[0],
                            'latitude': coords[1]
                        }
                
                # Parse times
                start_time = properties.get('startTime')
                end_time = properties.get('endTime')
                
                # Calculate expected duration
                duration_minutes = None
                if start_time and end_time:
                    try:
                        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                        duration = end_dt - start_dt
                        duration_minutes = int(duration.total_seconds() / 60)
                    except ValueError:
                        pass
                
                # Normalize the incident
                normalized_incident = {
                    'type': incident.get('type'),
                    'description': properties.get('description', ''),
                    'comments': properties.get('comments', ''),
                    'coordinates': coordinates,
                    'magnitude': properties.get('magnitudeOfDelay'),
                    'start_time': start_time,
                    'end_time': end_time,
                    'duration_minutes': duration_minutes,
                    'probability': properties.get('probabilityOfOccurrence'),
                }
                
                normalized_incidents.append(normalized_incident)
                
        except Exception as e:
            logger.error(f"Error normalizing traffic incidents: {e}")
            # Add a single error incident if processing fails
            normalized_incidents.append({
                'type': 'ERROR',
                'description': f"Failed to process incidents: {str(e)}",
                'timestamp': datetime.now().isoformat()
            })
        
        return normalized_incidents
    
    @staticmethod
    def normalize_transit_alerts(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Normalize transit service alerts from GTFS-RT feed.
        """
        normalized_alerts = []
        
        if not data:
            return normalized_alerts
        
        try:
            for alert in data:
                # Extract affected entities
                affected_routes = []
                affected_stops = []
                
                for entity in alert.get('informed_entity', []):
                    if 'route_id' in entity:
                        affected_routes.append(entity['route_id'])
                    if 'stop_id' in entity:
                        affected_stops.append(entity['stop_id'])
                
                # Get active period
                active_periods = alert.get('active_period', [])
                start_time = None
                end_time = None
                
                if active_periods:
                    first_period = active_periods[0]
                    if 'start' in first_period:
                        start_time = datetime.fromtimestamp(
                            int(first_period['start'])
                        ).isoformat()
                    if 'end' in first_period:
                        end_time = datetime.fromtimestamp(
                            int(first_period['end'])
                        ).isoformat()
                
                # Get alert details
                header = ''
                description = ''
                url = ''
                
                for translation in alert.get('header_text', {}).get('translation', []):
                    if translation.get('language') == 'en':
                        header = translation.get('text', '')
                
                for translation in alert.get('description_text', {}).get('translation', []):
                    if translation.get('language') == 'en':
                        description = translation.get('text', '')
                
                for translation in alert.get('url', {}).get('translation', []):
                    if translation.get('language') == 'en':
                        url = translation.get('text', '')
                
                # Map cause and effect to standardized values
                cause = alert.get('cause', 'UNKNOWN_CAUSE')
                effect = alert.get('effect', 'UNKNOWN_EFFECT')
                
                # Create normalized alert
                normalized_alert = {
                    'id': alert.get('id', ''),
                    'header': header,
                    'description': description,
                    'url': url,
                    'cause': cause,
                    'effect': effect,
                    'start_time': start_time,
                    'end_time': end_time,
                    'affected_routes': affected_routes,
                    'affected_stops': affected_stops,
                    'severity': DataNormalizer._determine_alert_severity(effect)
                }
                
                normalized_alerts.append(normalized_alert)
                
        except Exception as e:
            logger.error(f"Error normalizing transit alerts: {e}")
            normalized_alerts.append({
                'id': 'error',
                'header': 'Error processing alerts',
                'description': str(e),
                'severity': 'unknown'
            })
        
        return normalized_alerts
    
    @staticmethod
    def _determine_alert_severity(effect: str) -> str:
        """Map GTFS-RT effect to a simpler severity level"""
        high_severity = ['NO_SERVICE', 'REDUCED_SERVICE', 'SIGNIFICANT_DELAYS']
        medium_severity = ['DETOUR', 'ADDITIONAL_SERVICE', 'MODIFIED_SERVICE']
        low_severity = ['OTHER_EFFECT', 'STOP_MOVED']
        
        if effect in high_severity:
            return 'high'
        elif effect in medium_severity:
            return 'medium'
        elif effect in low_severity:
            return 'low'
        else:
            return 'unknown'
    
    @staticmethod
    def normalize_combined_data(
        weather_data: Dict[str, Any],
        traffic_flow: Dict[str, Any],
        traffic_incidents: List[Dict[str, Any]],
        transit_alerts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Combine normalized data from different sources into a single response
        with consistent formatting and additional derived insights.
        """
        # Start with basic structure
        combined_data = {
            "timestamp": datetime.now().isoformat(),
            "data_sources": {
                "weather": weather_data.get('data_available', False),
                "traffic_flow": traffic_flow.get('data_available', False),
                "traffic_incidents": len(traffic_incidents) > 0,
                "transit_alerts": len(transit_alerts) > 0
            },
            "weather": weather_data,
            "traffic": {
                "flow": traffic_flow,
                "incidents": traffic_incidents
            },
            "transit": {
                "alerts": transit_alerts
            },
            "commute_impact": {
                "overall_level": "normal",
                "factors": []
            }
        }
        
        # Determine commute impact
        impact_factors = []
        impact_level = "normal"
        
        # Check weather impact
        if weather_data.get('data_available', False):
            weather_condition = weather_data.get('condition', '').lower()
            if weather_condition in ['thunderstorm', 'rain', 'snow', 'sleet']:
                impact_factors.append({
                    "type": "weather",
                    "description": f"{weather_condition.capitalize()} may affect commute",
                    "severity": "medium" if weather_condition == 'rain' else "high"
                })
                impact_level = "affected"
        
        # Check traffic impact
        if traffic_flow.get('data_available', False):
            congestion = traffic_flow.get('congestion_level')
            if congestion in ['high', 'severe']:
                impact_factors.append({
                    "type": "traffic_congestion",
                    "description": f"{congestion.capitalize()} traffic congestion",
                    "severity": "high" if congestion == 'severe' else "medium"
                })
                impact_level = "significant" if congestion == 'severe' else "affected"
        
        # Check incidents impact
        if traffic_incidents and len(traffic_incidents) > 0:
            major_incidents = [i for i in traffic_incidents 
                              if i.get('type') in ['ACCIDENT', 'ROAD_CLOSURE']]
            if major_incidents:
                impact_factors.append({
                    "type": "traffic_incident",
                    "description": f"{len(major_incidents)} major traffic incidents",
                    "severity": "high" if len(major_incidents) > 1 else "medium"
                })
                impact_level = "significant" if len(major_incidents) > 1 else "affected"
        
        # Check transit alerts impact
        high_severity_alerts = [a for a in transit_alerts if a.get('severity') == 'high']
        if high_severity_alerts:
            impact_factors.append({
                "type": "transit_disruption",
                "description": f"{len(high_severity_alerts)} major transit disruptions",
                "severity": "high"
            })
            impact_level = "significant"
        
        # Update the commute impact section
        combined_data["commute_impact"]["overall_level"] = impact_level
        combined_data["commute_impact"]["factors"] = impact_factors
        
        return combined_data