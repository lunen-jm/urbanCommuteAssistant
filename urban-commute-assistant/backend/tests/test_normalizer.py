import unittest
import json
from datetime import datetime, timedelta

from app.services.normalizer import DataNormalizer


class TestDataNormalizer(unittest.TestCase):
    """Test suite for the DataNormalizer service"""
    
    def setUp(self):
        """Set up test data for each test case"""
        # Sample weather data with different formats
        self.complete_weather_data = {
            "weather": [{"main": "Rain", "description": "light rain"}],
            "main": {
                "temp": 65.3,
                "feels_like": 64.8,
                "temp_min": 62.0,
                "temp_max": 68.4,
                "pressure": 1010,
                "humidity": 75
            },
            "wind": {
                "speed": 8.05,
                "deg": 180
            },
            "clouds": {"all": 75},
            "dt": int(datetime.now().timestamp())
        }
        
        self.kelvin_weather_data = {
            "weather": [{"main": "Clear", "description": "clear sky"}],
            "main": {
                "temp": 293.15,  # 20°C/68°F in Kelvin
                "feels_like": 292.15,
                "humidity": 45
            },
            "wind": {
                "speed": 4.5,
                "deg": 90
            },
            "dt": int(datetime.now().timestamp())
        }
        
        self.missing_fields_weather_data = {
            "weather": [{"main": "Clouds"}],
            "main": {
                "temp": 58.6,
                "humidity": 80
            },
            "dt": int(datetime.now().timestamp())
        }
        
        self.error_weather_data = {
            "error": "Invalid API key"
        }
        
        # Sample traffic flow data
        self.complete_traffic_flow = {
            "flowSegmentData": {
                "frc": "FRC2",
                "currentSpeed": 35,
                "freeFlowSpeed": 60,
                "currentTravelTime": 180,
                "freeFlowTravelTime": 105,
                "confidence": 0.9,
                "roadClosure": False
            }
        }
        
        self.minimal_traffic_flow = {
            "flowSegmentData": {
                "currentSpeed": 25,
                "freeFlowSpeed": 55
            }
        }
        
        # Sample traffic incidents data
        self.traffic_incidents_data = {
            "incidents": [
                {
                    "type": "ACCIDENT",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.3311, 47.6052]
                    },
                    "properties": {
                        "iconCategory": 1,
                        "magnitudeOfDelay": 3,
                        "startTime": "2023-04-15T14:30:00Z",
                        "endTime": "2023-04-15T15:30:00Z",
                        "probabilityOfOccurrence": 85,
                        "description": "Minor accident on Broadway",
                        "comments": "Police on scene"
                    }
                },
                {
                    "type": "ROAD_CLOSURE",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.3411, 47.6152]
                    },
                    "properties": {
                        "magnitudeOfDelay": 5,
                        "startTime": "2023-04-15T12:00:00Z",
                        "endTime": "2023-04-15T18:00:00Z",
                        "description": "Construction on Pine Street"
                    }
                }
            ]
        }
        
        # Sample transit alerts
        self.transit_alerts_data = [
            {
                "id": "alert-123",
                "informed_entity": [
                    {"route_id": "40"},
                    {"stop_id": "1234"},
                    {"stop_id": "5678"}
                ],
                "active_period": [
                    {"start": int(datetime.now().timestamp()), "end": int((datetime.now() + timedelta(hours=4)).timestamp())}
                ],
                "header_text": {
                    "translation": [
                        {"language": "en", "text": "Route 40 Detour"}
                    ]
                },
                "description_text": {
                    "translation": [
                        {"language": "en", "text": "Route 40 is detouring due to construction on 3rd Ave"}
                    ]
                },
                "url": {
                    "translation": [
                        {"language": "en", "text": "https://kingcounty.gov/alerts/123"}
                    ]
                },
                "cause": "CONSTRUCTION",
                "effect": "DETOUR"
            },
            {
                "id": "alert-456",
                "informed_entity": [
                    {"route_id": "8"}
                ],
                "active_period": [
                    {"start": int(datetime.now().timestamp())}
                ],
                "header_text": {
                    "translation": [
                        {"language": "en", "text": "Route 8 Suspension"}
                    ]
                },
                "description_text": {
                    "translation": [
                        {"language": "en", "text": "Route 8 is suspended due to operator shortage"}
                    ]
                },
                "cause": "OTHER_CAUSE",
                "effect": "NO_SERVICE"
            }
        ]
        
    def test_normalize_standard_weather_data(self):
        """Test normalizing standard weather data"""
        result = DataNormalizer.normalize_weather_data(self.complete_weather_data)
        
        # Check basic structure
        self.assertTrue(result['data_available'])
        self.assertEqual(result['condition'], 'Rain')
        self.assertEqual(result['description'], 'light rain')
        self.assertEqual(result['temperature'], 65.3)
        self.assertEqual(result['humidity'], 75)
        self.assertEqual(result['wind_speed'], 8.05)
        self.assertEqual(result['wind_direction'], 180)
        
        # Check timestamp formatting
        self.assertTrue(isinstance(result['timestamp'], str))
        # Should be in ISO format
        datetime.fromisoformat(result['timestamp'])
    
    def test_normalize_kelvin_temperature(self):
        """Test normalizing weather data with Kelvin temperature"""
        result = DataNormalizer.normalize_weather_data(self.kelvin_weather_data)
        
        # Temperature should be converted from Kelvin to Fahrenheit
        self.assertNotEqual(result['temperature'], 293.15)  # Not the original Kelvin value
        self.assertAlmostEqual(result['temperature'], 68.0, delta=0.2)  # ~68°F
    
    def test_normalize_weather_with_missing_fields(self):
        """Test normalizing weather data with missing fields"""
        result = DataNormalizer.normalize_weather_data(self.missing_fields_weather_data)
        
        # Should handle missing fields gracefully
        self.assertTrue(result['data_available'])
        self.assertEqual(result['condition'], 'Clouds')
        self.assertEqual(result['description'], '')  # Missing in input
        self.assertEqual(result['temperature'], 58.6)
        self.assertEqual(result['humidity'], 80)
        self.assertIsNone(result['wind_speed'])  # Missing in input
        self.assertIsNone(result['wind_direction'])  # Missing in input
    
    def test_normalize_weather_error_response(self):
        """Test normalizing weather error response"""
        result = DataNormalizer.normalize_weather_data(self.error_weather_data)
        
        # Should indicate data is not available and include error
        self.assertFalse(result['data_available'])
        self.assertEqual(result['error'], 'Invalid API key')
    
    def test_normalize_complete_traffic_flow(self):
        """Test normalizing complete traffic flow data"""
        result = DataNormalizer.normalize_traffic_flow(self.complete_traffic_flow)
        
        # Check basic structure
        self.assertTrue(result['data_available'])
        self.assertEqual(result['currentSpeed'], 35)
        self.assertEqual(result['freeFlowSpeed'], 60)
        self.assertEqual(result['currentTravelTime'], 180)
        self.assertEqual(result['freeFlowTravelTime'], 105)
        self.assertEqual(result['speedRatio'], 35/60)
        self.assertEqual(result['congestion_level'], 'high')  # 35/60 = 0.58, which is high
        self.assertFalse(result['road_closure'])
    
    def test_normalize_minimal_traffic_flow(self):
        """Test normalizing minimal traffic flow data"""
        result = DataNormalizer.normalize_traffic_flow(self.minimal_traffic_flow)
        
        # Should handle minimal data gracefully
        self.assertTrue(result['data_available'])
        self.assertEqual(result['currentSpeed'], 25)
        self.assertEqual(result['freeFlowSpeed'], 55)
        self.assertEqual(result['speedRatio'], 25/55)
        self.assertEqual(result['congestion_level'], 'high')  # 25/55 = 0.45, which is high
        self.assertIsNone(result['currentTravelTime'])  # Missing in input
        self.assertIsNone(result['freeFlowTravelTime'])  # Missing in input
    
    def test_normalize_traffic_incidents(self):
        """Test normalizing traffic incidents data"""
        result = DataNormalizer.normalize_traffic_incidents(self.traffic_incidents_data)
        
        # Should have two normalized incidents
        self.assertEqual(len(result), 2)
        
        # Check first incident
        self.assertEqual(result[0]['type'], 'ACCIDENT')
        self.assertEqual(result[0]['description'], 'Minor accident on Broadway')
        self.assertEqual(result[0]['magnitude'], 3)
        self.assertEqual(result[0]['coordinates']['latitude'], 47.6052)
        self.assertEqual(result[0]['coordinates']['longitude'], -122.3311)
        self.assertEqual(result[0]['duration_minutes'], 60)  # 1 hour
        
        # Check second incident
        self.assertEqual(result[1]['type'], 'ROAD_CLOSURE')
        self.assertEqual(result[1]['description'], 'Construction on Pine Street')
        self.assertEqual(result[1]['duration_minutes'], 360)  # 6 hours
    
    def test_normalize_transit_alerts(self):
        """Test normalizing transit service alerts"""
        result = DataNormalizer.normalize_transit_alerts(self.transit_alerts_data)
        
        # Should have two normalized alerts
        self.assertEqual(len(result), 2)
        
        # Check first alert
        self.assertEqual(result[0]['id'], 'alert-123')
        self.assertEqual(result[0]['header'], 'Route 40 Detour')
        self.assertEqual(result[0]['effect'], 'DETOUR')
        self.assertEqual(result[0]['severity'], 'medium')  # DETOUR maps to medium severity
        self.assertEqual(result[0]['affected_routes'], ['40'])
        self.assertEqual(result[0]['affected_stops'], ['1234', '5678'])
        
        # Check second alert
        self.assertEqual(result[1]['id'], 'alert-456')
        self.assertEqual(result[1]['header'], 'Route 8 Suspension')
        self.assertEqual(result[1]['effect'], 'NO_SERVICE')
        self.assertEqual(result[1]['severity'], 'high')  # NO_SERVICE maps to high severity
        self.assertEqual(result[1]['affected_routes'], ['8'])
    
    def test_normalize_combined_data(self):
        """Test normalizing combined data from all sources"""
        # Normalize individual components first
        weather_data = DataNormalizer.normalize_weather_data(self.complete_weather_data)
        traffic_flow = DataNormalizer.normalize_traffic_flow(self.complete_traffic_flow)
        traffic_incidents = DataNormalizer.normalize_traffic_incidents(self.traffic_incidents_data)
        transit_alerts = DataNormalizer.normalize_transit_alerts(self.transit_alerts_data)
        
        # Combine them
        result = DataNormalizer.normalize_combined_data(
            weather_data, traffic_flow, traffic_incidents, transit_alerts
        )
        
        # Check structure
        self.assertEqual(set(result.keys()), 
                         {'timestamp', 'data_sources', 'weather', 'traffic', 'transit', 'commute_impact'})
        
        # Check data sources flags
        self.assertTrue(result['data_sources']['weather'])
        self.assertTrue(result['data_sources']['traffic_flow'])
        self.assertTrue(result['data_sources']['traffic_incidents'])
        self.assertTrue(result['data_sources']['transit_alerts'])
        
        # Check commute impact analysis
        self.assertIn('commute_impact', result)
        self.assertIn('overall_level', result['commute_impact'])
        self.assertIn('factors', result['commute_impact'])
        
        # With rain, high traffic congestion, and incidents, impact should be significant
        self.assertEqual(result['commute_impact']['overall_level'], 'significant')
        
        # Should have multiple impact factors
        self.assertGreaterEqual(len(result['commute_impact']['factors']), 3)
        
        # Check that weather is included in factors
        weather_factors = [f for f in result['commute_impact']['factors'] if f['type'] == 'weather']
        self.assertEqual(len(weather_factors), 1)
        self.assertEqual(weather_factors[0]['severity'], 'medium')  # Rain is medium severity
        
        # Check that traffic is included in factors
        traffic_factors = [f for f in result['commute_impact']['factors'] if f['type'] == 'traffic_congestion']
        self.assertEqual(len(traffic_factors), 1)
        self.assertEqual(traffic_factors[0]['severity'], 'medium')  # High congestion is medium severity
        
        # Check that incidents are included in factors
        incident_factors = [f for f in result['commute_impact']['factors'] if f['type'] == 'traffic_incident']
        self.assertEqual(len(incident_factors), 1)
        
        # Check that transit disruptions are included in factors
        transit_factors = [f for f in result['commute_impact']['factors'] if f['type'] == 'transit_disruption']
        self.assertEqual(len(transit_factors), 1)
        self.assertEqual(transit_factors[0]['severity'], 'high')  # NO_SERVICE alert is high severity


if __name__ == '__main__':
    unittest.main()