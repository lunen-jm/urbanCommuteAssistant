from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Urban Commute Assistant API!"}

def test_get_traffic_data():
    response = client.get("/api/traffic")
    assert response.status_code == 200
    assert "traffic_conditions" in response.json()

def test_get_weather_data():
    response = client.get("/api/weather")
    assert response.status_code == 200
    assert "current_weather" in response.json()

def test_get_transit_data():
    response = client.get("/api/transit")
    assert response.status_code == 200
    assert "transit_schedule" in response.json()

def test_user_authentication():
    response = client.post("/api/auth/login", json={"username": "testuser", "password": "testpass"})
    assert response.status_code == 200
    assert "access_token" in response.json()