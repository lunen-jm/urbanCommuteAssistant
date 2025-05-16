/**
 * Debug API Integration
 * This file provides a simple API client for testing API connectivity
 * 
 * Instructions for use:
 * 1. Start your debug Flask app (simple_flask_app.py) or FastAPI app
 * 2. Load this script in your browser console or from a debug HTML page
 * 3. Call the test functions to verify API connectivity
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Weather API test function
async function testWeatherAPI() {
  console.log('Testing Weather API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/weather?lat=47.6062&lon=-122.3321`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Weather API Response:', data);
    
    // Display data on page if possible
    const resultElement = document.getElementById('api-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <h3>Weather API Test Result</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }
    
    return data;
  } catch (error) {
    console.error('Weather API Test Failed:', error);
    
    // Display error on page if possible
    const resultElement = document.getElementById('api-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <h3>Weather API Test Failed</h3>
        <p>Error: ${error.message}</p>
      `;
    }
    
    return {
      temperature: 0,
      description: 'Weather data unavailable',
      humidity: 0,
      wind_speed: 0,
      feels_like: 0,
      source: 'error'
    };
  }
}

// Traffic API test function
async function testTrafficAPI() {
  console.log('Testing Traffic API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/traffic?lat=47.6062&lon=-122.3321`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Traffic API Response:', data);
    
    // Display data on page if possible
    const resultElement = document.getElementById('api-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <h3>Traffic API Test Result</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }
    
    return data;
  } catch (error) {
    console.error('Traffic API Test Failed:', error);
    
    // Display error on page if possible
    const resultElement = document.getElementById('api-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <h3>Traffic API Test Failed</h3>
        <p>Error: ${error.message}</p>
      `;
    }
    
    return {
      current_speed: 0,
      free_flow_speed: 0,
      current_travel_time: 0,
      free_flow_travel_time: 0,
      confidence: 0,
      road_closure: false,
      congestion_level: 'Unknown',
      source: 'error'
    };
  }
}

// Health check API test function
async function testHealthAPI() {
  console.log('Testing API Health Check...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Health API Response:', data);
    
    // Display data on page if possible
    const resultElement = document.getElementById('api-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <h3>API Health Check Result</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }
    
    return data;
  } catch (error) {
    console.error('Health API Test Failed:', error);
    
    // Display error on page if possible
    const resultElement = document.getElementById('api-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <h3>API Health Check Failed</h3>
        <p>Error: ${error.message}</p>
      `;
    }
    
    return {
      weather_api: { key_configured: false, health: false },
      traffic_api: { key_configured: false, health: false },
      transit_api: { key_configured: false, health: false }
    };
  }
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.testWeatherAPI = testWeatherAPI;
  window.testTrafficAPI = testTrafficAPI;
  window.testHealthAPI = testHealthAPI;
}

// Auto-run tests if the page includes an api-test element
document.addEventListener('DOMContentLoaded', () => {
  const testElement = document.getElementById('api-test');
  if (testElement) {
    testHealthAPI()
      .then(() => testWeatherAPI())
      .then(() => testTrafficAPI())
      .catch(error => console.error('API Tests failed:', error));
  }
});
