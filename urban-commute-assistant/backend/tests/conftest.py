# backend/tests/conftest.py

import pytest

@pytest.fixture(scope='session')
def test_client():
    from backend.app.main import app
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_data():
    return {
        "location": "Downtown",
        "destination": "Uptown",
        "preferences": {
            "notifications": True,
            "alternative_routes": True
        }
    }