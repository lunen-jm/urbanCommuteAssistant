# Urban Commute Assistant Test Suite

This directory contains the test suite for the Urban Commute Assistant backend. The tests are designed to validate the functionality of the API endpoints, integration services, authentication system, and utility components.

## Test Structure

The test suite is organized into the following files:

- `test_api.py`: Tests for FastAPI endpoints and route handlers
- `test_auth.py`: Authentication and authorization tests
- `test_integrations.py`: Tests for external API integrations (Weather, Traffic, Transit)
- `conftest.py`: Pytest fixtures and configuration

## Running the Tests

### Prerequisites

- Python 3.9+
- All dependencies installed from `requirements.txt`
- Environment variables configured (can use `.env.test` for testing)

### Standard Test Execution

To run all tests:

```bash
# From the backend directory
pytest

# With verbose output
pytest -v

# Run a specific test file
pytest tests/test_integrations.py
```

### Coverage Report

To generate a test coverage report:

```bash
# Install coverage package if not already installed
pip install coverage

# Run with coverage
coverage run -m pytest

# Generate report
coverage report

# Generate HTML report for detailed view
coverage html
# View the report at htmlcov/index.html
```

## Test Categories

### API Tests (`test_api.py`)

These tests verify the FastAPI endpoints function correctly:

- Status codes are as expected
- Response bodies contain required fields
- API parameters are properly validated
- Error handling works as expected

**Success criteria**: All endpoints return expected status codes and response formats.

### Authentication Tests (`test_auth.py`)

These tests verify the authentication system:

- Users can register and login
- JWT tokens are issued and validated correctly
- Protected routes require authentication
- Permission checks are enforced

**Success criteria**: Authentication flow works correctly, and protected routes are secured.

### Integration Tests (`test_integrations.py`)

These tests verify the external API integrations:

- Weather service correctly processes API responses
- Traffic service handles data properly
- Transit service normalizes GTFS data
- Circuit breaker opens after failures
- Error handling provides graceful degradation

**Success criteria**: 
- Services correctly process both successful API responses and errors
- Data normalization works for various edge cases
- Circuit breaker opens after expected number of failures

## Mocking Strategy

The tests use Python's `unittest.mock` to simulate external API responses:

- API calls are mocked to return predefined responses
- Error conditions are simulated to test error handling
- No actual external API calls are made during testing

Example:
```python
@patch('app.api.integrations.weather.requests.get')
def test_get_current_weather(self, mock_get):
    # Configure the mock
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = self.sample_weather_response
    mock_get.return_value = mock_response
    
    # Call the method to test
    result = self.weather_service.get_current_weather(47.6062, -122.3321)
    
    # Assertions to verify expected behavior
    self.assertIsNotNone(result)
    self.assertEqual(result.get('condition'), 'Clear')
```

## Debugging Failed Tests

If tests fail:

1. Check the error message and traceback for specific failures
2. Verify environment variables are correctly set
3. Ensure all dependencies are installed and up-to-date
4. For mocked API tests, verify that the service implementation matches the expected response format

## Continuous Integration

The test suite is integrated with GitHub Actions and runs automatically:

- On push to main branch
- On pull requests to main branch
- Nightly runs to catch time-dependent issues

The CI pipeline will notify of any test failures before changes are merged.

## Adding New Tests

When adding new functionality:

1. Create corresponding test cases before or alongside implementation
2. Follow existing patterns for mocking external dependencies
3. Ensure tests are atomic and independent of each other
4. Use descriptive test names that explain the expected behavior

## Manual Testing vs. Automated Tests

While automated tests cover most functionality, some aspects require manual testing:

- Visual UI components and layouts
- Complex user workflows
- Performance under load
- Cross-browser compatibility

Document manual test procedures in the main project wiki when automated tests are insufficient.