"""
Minimal Flask API for API key testing
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

@app.route('/api/health')
def health_check():
    """Simple health check for API keys"""
    
    # Get API Keys
    weather_api_key = os.getenv("WEATHER_API_KEY")
    traffic_api_key = os.getenv("TRAFFIC_API_KEY")
    kc_metro_gtfs_url = os.getenv("KC_METRO_GTFS_URL")
    
    # Weather API health check
    weather_health = False
    if weather_api_key:
        try:
            params = {
                "lat": 47.6062,
                "lon": -122.3321,
                "units": "metric",
                "appid": weather_api_key
            }
            response = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params, timeout=5)
            weather_health = response.status_code == 200
        except:
            pass
    
    # Traffic API health check
    traffic_health = False
    if traffic_api_key:
        try:
            base_url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
            params = {
                "point": "47.608013,-122.335167",
                "unit": "MPH",
                "key": traffic_api_key
            }
            response = requests.get(base_url, params=params, timeout=5)
            traffic_health = response.status_code == 200
        except:
            pass
    
    # Transit API health check
    transit_health = False
    if kc_metro_gtfs_url:
        try:
            response = requests.head(kc_metro_gtfs_url, timeout=5)
            transit_health = response.status_code == 200
        except:
            pass
    
    return jsonify({
        "weather_api": {
            "key_configured": bool(weather_api_key and len(weather_api_key) > 10),
            "health": weather_health
        },
        "traffic_api": {
            "key_configured": bool(traffic_api_key and len(traffic_api_key) > 10),
            "health": traffic_health
        },        "transit_api": {
            "key_configured": bool(kc_metro_gtfs_url and kc_metro_gtfs_url.endswith(".zip")),
            "health": transit_health
        }
    })

@app.route('/api/weather')
def get_weather():
    """Get real-time weather data from OpenWeatherMap API"""
    
    # Parse coordinates from request
    try:
        lat = float(request.args.get('lat', '47.6062'))
        lon = float(request.args.get('lon', '-122.3321'))
    except ValueError:
        return jsonify({
            "error": "Invalid coordinates format. Please provide valid lat and lon values."
        }), 400
    
    # Get API Key
    weather_api_key = os.getenv("WEATHER_API_KEY")
    
    if not weather_api_key:
        return jsonify({
            "temperature": 0,
            "description": "Weather API key not configured",
            "humidity": 0,
            "wind_speed": 0,
            "feels_like": 0,
            "source": "error"
        })
    
    # Call OpenWeatherMap API
    try:
        params = {
            "lat": lat,
            "lon": lon,
            "units": "metric",
            "appid": weather_api_key
        }
        
        response = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        if "main" not in data:
            return jsonify({
                "temperature": 0, 
                "description": "Unexpected API response format",
                "humidity": 0,
                "wind_speed": 0,
                "feels_like": 0,
                "source": "error"
            })
        
        return jsonify({
            "temperature": data["main"]["temp"],
            "description": data["weather"][0]["description"] if "weather" in data and len(data["weather"]) > 0 else "Unknown",
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"] if "wind" in data and "speed" in data["wind"] else 0,
            "feels_like": data["main"]["feels_like"] if "feels_like" in data["main"] else data["main"]["temp"],
            "source": "openweathermap"
        })
    except Exception as e:
        print(f"Weather API error: {str(e)}")
        return jsonify({
            "temperature": 0,
            "description": f"Weather data unavailable: {str(e)}",
            "humidity": 0,
            "wind_speed": 0,
            "feels_like": 0,
            "source": "error"
        })

@app.route('/api/traffic')
def get_traffic():
    """Get real-time traffic data from TomTom Traffic API"""
    
    # Parse coordinates from request
    try:
        lat = float(request.args.get('lat', '47.6062'))
        lon = float(request.args.get('lon', '-122.3321'))
    except ValueError:
        return jsonify({
            "error": "Invalid coordinates format. Please provide valid lat and lon values."
        }), 400
    
    # Get API Key
    traffic_api_key = os.getenv("TRAFFIC_API_KEY")
    
    if not traffic_api_key:
        return jsonify({
            "current_speed": 0,
            "free_flow_speed": 0,
            "current_travel_time": 0,
            "free_flow_travel_time": 0,
            "confidence": 0,
            "road_closure": False,
            "congestion_level": "Traffic API key not configured",
            "source": "error"
        })
    
    # Call TomTom Traffic API
    try:
        base_url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        params = {
            "point": f"{lat},{lon}",
            "unit": "MPH",
            "key": traffic_api_key
        }
        
        response = requests.get(base_url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        if "flowSegmentData" not in data:
            return jsonify({
                "current_speed": 0,
                "free_flow_speed": 0,
                "current_travel_time": 0,
                "free_flow_travel_time": 0,
                "confidence": 0,
                "road_closure": False,
                "congestion_level": "Unexpected API response format",
                "source": "error"
            })
        
        flow_data = data["flowSegmentData"]
        
        # Calculate congestion level
        congestion_level = "Unknown"
        if "currentSpeed" in flow_data and "freeFlowSpeed" in flow_data and flow_data["freeFlowSpeed"] > 0:
            congestion_ratio = flow_data["currentSpeed"] / flow_data["freeFlowSpeed"]
            
            if congestion_ratio >= 0.9:
                congestion_level = "Free flow"
            elif congestion_ratio >= 0.7:
                congestion_level = "Light"
            elif congestion_ratio >= 0.5:
                congestion_level = "Moderate"
            elif congestion_ratio >= 0.3:
                congestion_level = "Heavy"
            else:
                congestion_level = "Severe"
        
        return jsonify({
            "current_speed": flow_data.get("currentSpeed", 0),
            "free_flow_speed": flow_data.get("freeFlowSpeed", 0),
            "current_travel_time": flow_data.get("currentTravelTime", 0),
            "free_flow_travel_time": flow_data.get("freeFlowTravelTime", 0),
            "confidence": flow_data.get("confidence", 0),
            "road_closure": flow_data.get("roadClosure", False),
            "congestion_level": congestion_level,
            "source": "tomtom"
        })
    except Exception as e:
        print(f"Traffic API error: {str(e)}")
        return jsonify({
            "current_speed": 0,
            "free_flow_speed": 0,
            "current_travel_time": 0,
            "free_flow_travel_time": 0,
            "confidence": 0,
            "road_closure": False,
            "congestion_level": f"Traffic data unavailable: {str(e)}",
            "source": "error"
        })

if __name__ == '__main__':
    # Add a message about the available endpoints
    print("\n=== Urban Commute Assistant Debug API ===")
    print("Available endpoints:")
    print("  http://localhost:8000/api/health")
    print("  http://localhost:8000/api/weather?lat=47.6062&lon=-122.3321")
    print("  http://localhost:8000/api/traffic?lat=47.6062&lon=-122.3321")
    print("\n")
    app.run(debug=True, port=8000)
