import React, { useState } from 'react';
import { testAllConnections, testApiConnection } from '../../utils/apiTester';

interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

const ApiTester: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [customEndpoint, setCustomEndpoint] = useState<string>('/api/data/health');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<{ success: number, total: number, successRate: number } | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const { results: testResults, summary: testSummary } = await testAllConnections();
      setResults(testResults);
      setSummary(testSummary);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomEndpoint = async () => {
    setIsLoading(true);
    try {
      const result = await testApiConnection(customEndpoint);
      setResults([result]);
      setSummary({
        success: result.success ? 1 : 0,
        total: 1,
        successRate: result.success ? 100 : 0
      });
    } catch (error) {
      console.error('Error testing custom endpoint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? '#4CAF50' : '#F44336';
  };

  const formatData = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Connection Tester</h2>
      <p>Use this tool to verify that your backend API connections are working properly.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runTests} 
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Testing...' : 'Test All Endpoints'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Custom Endpoint</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Enter API endpoint (e.g., /api/data/health)"
          />
          <button
            onClick={testCustomEndpoint}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            Test
          </button>
        </div>
      </div>

      {summary && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: summary.successRate === 100 ? '#E8F5E9' : '#FFEBEE',
          borderRadius: '4px' 
        }}>
          <h3>Summary</h3>
          <p>
            {summary.success}/{summary.total} endpoints working ({summary.successRate.toFixed(0)}%)
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h3>Test Results</h3>
          {results.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '15px', 
                padding: '15px', 
                borderRadius: '4px',
                border: `1px solid ${getStatusColor(result.success)}`,
                backgroundColor: result.success ? '#E8F5E9' : '#FFEBEE'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{result.endpoint}</h4>
                <span style={{ 
                  backgroundColor: getStatusColor(result.success),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
              
              {result.responseTime && (
                <p style={{ margin: '5px 0' }}>Response time: {result.responseTime}ms</p>
              )}
              
              {result.error && (
                <div>
                  <h5>Error:</h5>
                  <pre style={{ 
                    backgroundColor: '#FFF8E1', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {result.error}
                  </pre>
                </div>
              )}
              
              {result.success && result.data && (
                <div>
                  <h5>Response Data:</h5>
                  <pre style={{ 
                    backgroundColor: '#F5F5F5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {formatData(result.data)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!results.length && !isLoading && (
        <div style={{ textAlign: 'center', color: '#757575', padding: '20px' }}>
          No test results yet. Click "Test All Endpoints" to begin.
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', color: '#2196F3', padding: '20px' }}>
          Running tests, please wait...
        </div>
      )}
    </div>
  );
};

export default ApiTester;
