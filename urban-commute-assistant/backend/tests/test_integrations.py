import unittest
from unittest.mock import patch, MagicMock
import json
import os
from datetime import datetime, timedelta

from app.api.integrations.weather import WeatherService
from app.api.integrations.traffic import TomTomTrafficService
from app.api.integrations.transit import KingCountyMetroService
from app.services.circuit_breaker import CircuitBreaker, CircuitBreakerError


class TestWeatherService(unittest.TestCase):
    """Test suite for WeatherService integration"""
    
    def setUp(self):
        self.weather_service = WeatherService()
        # Sample response data for mocking
        self.sample_weather_response = {
            "weather": [{"main": "Clear", "description": "clear sky"}],
            "main": {
                "temp": 75.2,
                "feels_like": 76.1,
                "temp_min": 72.0,
                "temp_max": 78.4,
                "pressure": 1012,
                "humidity": 65
            },
            "wind": {
                "speed": 5.82,
                "deg": 220
            },
            "clouds": {"all": 0},
            "dt": int(datetime.now().timestamp())
        }
        
        self.sample_forecast_response = {
            "list": [
                {
                    "dt": int((datetime.now() + timedelta(hours=3)).timestamp()),
                    "main": {
                        "temp": 76.5,
                        "feels_like": 77.3,
                        "pressure": 1011,
                        "humidity": 68
                    },
                    "weather": [{"main": "Clouds", "description": "few clouds"}],
                    "wind": {"speed": 6.2, "deg": 225}
                },
                {
                    "dt": int((datetime.now() + timedelta(hours=6)).timestamp()),
                    "main": {
                        "temp": 72.1,
                        "feels_like": 73.0,
                        "pressure": 1012,
                        "humidity": 72
                    },
                    "weather": [{"main": "Rain", "description": "light rain"}],
                    "wind": {"speed": 5.0, "deg": 210}
                }
            ]
        }
    
    @patch('app.api.integrations.weather.requests.get')
    def test_get_current_weather(self, mock_get):
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.sample_weather_response
        mock_get.return_value = mock_response
        
        # Call the method
        result = self.weather_service.get_current_weather(47.6062, -122.3321)
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertEqual(result.get('condition'), 'Clear')
        self.assertEqual(result.get('temperature'), 75.2)
        self.assertEqual(result.get('humidity'), 65)
        
        # Verify mock was called with correct parameters
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        self.assertIn('lat=47.6062', kwargs['url'])
        self.assertIn('lon=-122.3321', kwargs['url'])
    
    @patch('app.api.integrations.weather.requests.get')
    def test_get_weather_forecast(self, mock_get):
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.sample_forecast_response
        mock_get.return_value = mock_response
        
        # Call the method
        result = self.weather_service.get_weather_forecast(47.6062, -122.3321)
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertEqual(len(result), 2)  # Two forecast periods
        self.assertEqual(result[0].get('condition'), 'Clouds')
        self.assertEqual(result[1].get('condition'), 'Rain')
        
        # Verify mock was called with correct parameters
        mock_get.assert_called_once()
    
    @patch('app.api.integrations.weather.requests.get')
    def test_api_error_handling(self, mock_get):
        # Configure the mock to simulate an API error
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {"error": "Invalid API key"}
        mock_response.raise_for_status.side_effect = Exception("API Error")
        mock_get.return_value = mock_response
        
        # Call the method and expect appropriate error handling
        result = self.weather_service.get_current_weather(47.6062, -122.3321)
        
        # Assertions for error case
        self.assertIsNotNone(result)
        self.assertTrue('error' in result)
        self.assertEqual(result.get('data_available'), False)


class TestTrafficService(unittest.TestCase):
    """Test suite for TomTomTrafficService integration"""
    
    def setUp(self):
        self.traffic_service = TomTomTrafficService()
        
        # Sample traffic flow response
        self.sample_flow_response = {
            "flowSegmentData": {
                "frc": "FRC2",
                "currentSpeed": 52,
                "freeFlowSpeed": 65,
                "currentTravelTime": 124,
                "freeFlowTravelTime": 92,
                "confidence": 0.95,
                "roadClosure": False,
                "coordinates": {
                    "coordinate": [
                        {"latitude": 47.6062, "longitude": -122.3321},
                        {"latitude": 47.6082, "longitude": -122.3341}
                    ]
                }
            }
        }
        
        # Sample traffic incidents response
        self.sample_incidents_response = {
            "incidents": [
                {
                    "type": "ACCIDENT",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.3311, 47.6052]
                    },
                    "properties": {
                        "iconCategory": 1,
                        "magnitudeOfDelay": 4,
                        "startTime": "2023-04-15T14:30:00Z",
                        "endTime": "2023-04-15T16:30:00Z",
                        "probabilityOfOccurrence": 90,
                        "description": "Accident on I-5 northbound",
                        "comments": "Multiple vehicles involved"
                    }
                }
            ]
        }
    
    @patch('app.api.integrations.traffic.requests.get')
    def test_get_traffic_flow(self, mock_get):
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.sample_flow_response
        mock_get.return_value = mock_response
        
        # Call the method
        result = self.traffic_service.get_traffic_flow(47.6062, -122.3321, 1000)
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertIn('currentSpeed', result)
        self.assertEqual(result.get('currentSpeed'), 52)
        self.assertEqual(result.get('speedRatio'), 52/65)  # Current/FreeFlow
        
        # Verify mock was called with correct parameters
        mock_get.assert_called_once()
    
    @patch('app.api.integrations.traffic.requests.get')
    def test_get_traffic_incidents(self, mock_get):
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.sample_incidents_response
        mock_get.return_value = mock_response
        
        # Call the method
        result = self.traffic_service.get_traffic_incidents(47.6062, -122.3321, 1000)
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].get('type'), 'ACCIDENT')
        self.assertEqual(result[0].get('description'), 'Accident on I-5 northbound')
        
        # Verify mock was called with correct parameters
        mock_get.assert_called_once()


class TestCircuitBreaker(unittest.TestCase):
    """Test suite for the CircuitBreaker pattern implementation"""
    
    def test_successful_call(self):
        """Test that successful calls work normally"""
        cb = CircuitBreaker(failure_threshold=3, name="test")
        
        # Create a mock function that succeeds
        mock_func = MagicMock(return_value="success")
        
        # Apply circuit breaker
        protected_func = cb(mock_func)
        
        # Call the function and check result
        result = protected_func("test_arg")
        self.assertEqual(result, "success")
        mock_func.assert_called_once_with("test_arg")
    
    def test_circuit_opens_after_failures(self):
        """Test that circuit opens after reaching the failure threshold"""
        cb = CircuitBreaker(failure_threshold=3, name="test")
        
        # Create a mock function that always fails
        mock_func = MagicMock(side_effect=Exception("API Error"))
        
        # Apply circuit breaker
        protected_func = cb(mock_func)
        
        # Call until circuit should open
        for _ in range(3):
            with self.assertRaises(Exception):
                protected_func()
        
        # Now circuit should be open
        self.assertEqual(cb.state.name, "OPEN")
        
        # Next call should raise CircuitBreakerError
        with self.assertRaises(CircuitBreakerError):
            protected_func()


if __name__ == '__main__':
    unittest.main()