import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton/BackButton';
import mlUtils from '../utils/mlUtils';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('week');
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);
  const loadAnalytics = () => {
    const insights = mlUtils.getUserInsights();
    const frequentDestinations = mlUtils.getFrequentDestinations();
    const preferences = mlUtils.loadPreferences();

    // Calculate analytics based on data
    const totalTrips = Object.values(preferences.destinationFrequency || {})
      .reduce((sum, count) => sum + count, 0);
    
    const transportMethods = Object.values(preferences.transportMethodByDestination || {});
    const transportCounts = transportMethods.reduce((acc, method) => {
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const weatherPrefs = preferences.weatherPreferences || {};
    const timePrefs = preferences.timeBasedPreferences || {};

    // Get advanced insights
    const durationPreference = mlUtils.getTravelDurationPreference();
    const environmentalImpact = mlUtils.getEnvironmentalImpactPreference();

    setAnalytics({
      totalTrips,
      frequentDestinations: frequentDestinations.slice(0, 5),
      transportBreakdown: transportCounts,
      weatherPatterns: weatherPrefs,
      timePatterns: timePrefs,
      insights: {
        ...insights,
        durationPreference,
        environmentalImpact
      }
    });
  };

  const getTransportIcon = (method) => {
    const icons = {
      drive: '🚗',
      transit: '🚊',
      bike: '🚴',
      rideshare: '🚙',
      walk: '🚶'
    };
    return icons[method] || '🚗';
  };

  const formatPercentage = (value, total) => {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };
  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <BackButton />
        <h1>Your Commute Analytics</h1>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-section">
        <div className="time-range-buttons">
          <button 
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </button>
          <button 
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
          <button 
            className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{analytics.totalTrips || 0}</h3>
              <p>Total Trips</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <h3>{analytics.frequentDestinations?.length || 0}</h3>
              <p>Destinations</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <h3>{Object.keys(analytics.transportBreakdown || {}).length}</h3>
              <p>Transport Types</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Method Breakdown */}
      <div className="chart-section">
        <h2>Transport Method Usage</h2>
        <div className="transport-breakdown">
          {Object.entries(analytics.transportBreakdown || {}).map(([method, count]) => (
            <div key={method} className="transport-item">
              <div className="transport-info">
                <span className="transport-icon">{getTransportIcon(method)}</span>
                <span className="transport-name">{method.charAt(0).toUpperCase() + method.slice(1)}</span>
              </div>
              <div className="transport-stats">
                <span className="transport-count">{count} trips</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: formatPercentage(count, analytics.totalTrips),
                      backgroundColor: method === 'drive' ? '#ff6b6b' : 
                                    method === 'transit' ? '#4ecdc4' :
                                    method === 'bike' ? '#45b7d1' : '#96ceb4'
                    }}
                  ></div>
                </div>
                <span className="transport-percentage">
                  {formatPercentage(count, analytics.totalTrips)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Destinations */}
      <div className="destinations-section">
        <h2>Top Destinations</h2>
        <div className="destinations-list">
          {analytics.frequentDestinations?.map((dest, index) => (
            <div key={`${dest.destinationId}-${index}`} className="destination-item">
              <div className="destination-rank">#{index + 1}</div>
              <div className="destination-info">
                <h3>{dest.name || `Destination ${dest.destinationId}`}</h3>
                <p>{dest.count} visits</p>
              </div>
              <div className="destination-chart">
                <div 
                  className="visit-bar"
                  style={{ 
                    width: `${(dest.count / (analytics.frequentDestinations[0]?.count || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns & Insights */}
      <div className="patterns-section">
        <h2>Your Commute Patterns</h2>
        
        {analytics.insights?.mostUsedTransport && (
          <div className="pattern-card">
            <div className="pattern-icon">🚗</div>
            <div className="pattern-content">
              <h3>Favorite Transport Method</h3>
              <p>You prefer <strong>{analytics.insights.mostUsedTransport}</strong> for most of your trips</p>
            </div>
          </div>
        )}

        {analytics.insights?.peakCommuteTime && (
          <div className="pattern-card">
            <div className="pattern-icon">⏰</div>
            <div className="pattern-content">
              <h3>Peak Commute Time</h3>
              <p>You usually travel during <strong>{analytics.insights.peakCommuteTime}</strong></p>
            </div>
          </div>
        )}

        {analytics.insights?.weatherPreference && (
          <div className="pattern-card">
            <div className="pattern-icon">🌤️</div>
            <div className="pattern-content">
              <h3>Weather Adaptation</h3>
              <p>In {analytics.insights.weatherPreference.condition} weather, you choose <strong>{analytics.insights.weatherPreference.transport}</strong></p>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Insights */}
      <div className="advanced-insights-section">
        <h2>Advanced Insights</h2>
        
        {analytics.insights?.durationPreference && (
          <div className="insight-card">
            <div className="insight-icon">⏱️</div>
            <div className="insight-content">
              <h3>Travel Duration Preference</h3>
              <p>You typically prefer trips around <strong>{analytics.insights.durationPreference.averagePreferredDuration} minutes</strong></p>
              <p className="insight-detail">Range: {analytics.insights.durationPreference.preferredRange}</p>
            </div>
          </div>
        )}

        {analytics.insights?.environmentalImpact && (
          <div className="insight-card">
            <div className="insight-icon">🌱</div>
            <div className="insight-content">
              <h3>Environmental Impact</h3>
              <p>You're <strong>{analytics.insights.environmentalImpact.category}</strong> with {analytics.insights.environmentalImpact.ecoFriendlyPercentage}% eco-friendly trips</p>
              {analytics.insights.environmentalImpact.recommendedImprovements?.length > 0 && (
                <div className="improvement-suggestions">
                  <h4>Suggestions:</h4>
                  <ul>
                    {analytics.insights.environmentalImpact.recommendedImprovements.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ML Data Management */}
      <div className="data-section">
        <h2>Data & Privacy</h2>
        <div className="data-card">
          <div className="data-info">
            <h3>🔒 Your Data is Safe</h3>
            <p>All analytics are computed locally on your device. Your commute patterns stay private and are never shared.</p>
          </div>
          <div className="data-actions">
            <button 
              className="clear-data-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all ML data? This cannot be undone.')) {
                  localStorage.removeItem('commuteML');
                  window.location.reload();
                }
              }}
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
