/**
 * API Tester Utility
 * 
 * This utility helps test the API connections to verify that backend APIs 
 * are working properly with your frontend application.
 * 
 * Run this from the browser console with:
 * apiTester.testAllConnections()
 */

import apiClient from '../services/api';

interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

export async function testApiConnection(endpoint: string): Promise<TestResult> {
  const start = Date.now();
  try {
    // Use apiClient instead of direct fetch for consistent URL handling
    const response = await apiClient.get(endpoint);
    const responseTime = Date.now() - start;
    
    return {
      endpoint,
      success: true,
      data: response.data,
      responseTime
    };
  } catch (error) {
    return {
      endpoint,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function testAllConnections() {
  console.log('Testing API connections...');
  
  // Define test cases for each API
  const endpoints = [
    '/api/data/health',
    '/api/data/weather?lat=47.6062&lon=-122.3321',
    '/api/data/traffic?lat=47.6062&lon=-122.3321',
    '/api/data/transit?location=seattle',
    '/api/data/comprehensive?location=downtown_seattle'
  ];
  
  const results: TestResult[] = [];
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint}...`);
    const result = await testApiConnection(endpoint);
    results.push(result);
    
    // Log individual result
    if (result.success) {
      console.log(`✅ ${endpoint} - Success (${result.responseTime}ms)`);
    } else {
      console.error(`❌ ${endpoint} - Failed: ${result.error}`);
    }
  }
  
  // Calculate summary statistics
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = (successCount / totalCount) * 100;
  
  // Print summary
  console.log('\n--- API Connection Test Summary ---');
  console.log(`✅ ${successCount}/${totalCount} endpoints working (${successRate.toFixed(0)}%)`);
  
  if (successCount < totalCount) {
    console.log('\nFailing endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.endpoint}: ${r.error}`);
    });
      console.log('\nTroubleshooting steps:');
    console.log('1. Verify that the backend server is running');
    console.log(`2. Check that API URL is correctly set to: http://localhost:8000`);
    console.log('3. Ensure all API keys are configured in the backend .env file');
    console.log('4. Check for CORS errors in the browser console');
  }
  
  return {
    results,
    summary: {
      success: successCount,
      total: totalCount,
      successRate
    }
  };
}

// Export for use in browser console
const apiTester = {
  testConnection: testApiConnection,
  testAllConnections
};

// Make available globally in development
// Commented out until @types/node is available
// if (process.env.NODE_ENV !== 'production') {
//   // @ts-ignore
//   window.apiTester = apiTester;
// }

export default apiTester;
