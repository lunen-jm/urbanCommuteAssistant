import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mlUtils from '../utils/mlUtils';
import './SmartFavorites.css';

const SmartFavorites = () => {
  const [insights, setInsights] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [userFeedback, setUserFeedback] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Load ML insights and recommendations
    const loadMLData = () => {
      const userInsights = mlUtils.getUserInsights();
      const frequentDestinations = mlUtils.getFrequentDestinations();
      
      setInsights(userInsights);
      setRecommendations(frequentDestinations);
    };

    loadMLData();
  }, []);

  const handleFeedback = (recommendationId, feedback) => {
    mlUtils.recordFeedback(recommendationId, feedback);
    setUserFeedback(prev => ({
      ...prev,
      [recommendationId]: feedback
    }));
  };

  const goToDestination = (destination) => {
    navigate('/', { 
      state: { 
        selectedDestination: destination 
      } 
    });
  };

  return (
    <div className="smart-favorites-container">
      {/* Header */}
      <div className="header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Smart Favorites</h1>
      </div>

      {/* ML Insights Section */}
      <div className="insights-section">
        <h2>Your Commute Patterns</h2>
        
        {insights.mostUsedTransport && (
          <div className="insight-card">
            <div className="insight-icon">🚗</div>
            <div className="insight-content">
              <h3>Preferred Transport</h3>
              <p>You usually choose <strong>{insights.mostUsedTransport}</strong> for your commutes</p>
            </div>
          </div>
        )}

        {insights.peakCommuteTime && (
          <div className="insight-card">
            <div className="insight-icon">🕐</div>
            <div className="insight-content">
              <h3>Peak Commute Time</h3>
              <p>You typically commute during <strong>{insights.peakCommuteTime}</strong></p>
            </div>
          </div>
        )}

        {insights.weatherPreference && (
          <div className="insight-card">
            <div className="insight-icon">🌤️</div>
            <div className="insight-content">
              <h3>Weather Preference</h3>
              <p>In {insights.weatherPreference.condition} weather, you prefer <strong>{insights.weatherPreference.transport}</strong></p>
            </div>
          </div>
        )}
      </div>

      {/* Frequent Destinations */}
      <div className="frequent-destinations-section">
        <h2>Your Frequent Destinations</h2>
        <div className="destinations-grid">
          {recommendations.slice(0, 6).map((dest, index) => (
            <div 
              key={`${dest.destinationId}-${index}`}
              className="destination-card"
              onClick={() => goToDestination({ id: dest.destinationId, name: dest.name })}
            >
              <div className="destination-header">
                <span className="destination-icon">⭐</span>
                <h3>{dest.name || `Destination ${dest.destinationId}`}</h3>
              </div>
              <div className="destination-stats">
                <p className="visit-count">{dest.count} visits</p>
                <p className="frequency">#{index + 1} most visited</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="recommendations-section">
        <h2>Smart Recommendations</h2>
        <div className="recommendation-card">
          <div className="recommendation-header">
            <span className="recommendation-icon">🧠</span>
            <h3>Based on your patterns</h3>
          </div>
          <div className="recommendation-content">
            <p>Try taking transit on rainy days - it's often faster than driving in bad weather.</p>
            <div className="feedback-buttons">
              <button 
                className={`feedback-btn ${userFeedback['weather-transit'] === 'helpful' ? 'active' : ''}`}
                onClick={() => handleFeedback('weather-transit', 'helpful')}
              >
                👍 Helpful
              </button>
              <button 
                className={`feedback-btn ${userFeedback['weather-transit'] === 'not-helpful' ? 'active' : ''}`}
                onClick={() => handleFeedback('weather-transit', 'not-helpful')}
              >
                👎 Not helpful
              </button>
            </div>
          </div>
        </div>

        <div className="recommendation-card">
          <div className="recommendation-header">
            <span className="recommendation-icon">⏰</span>
            <h3>Time-based suggestion</h3>
          </div>
          <div className="recommendation-content">
            <p>Consider leaving 10 minutes earlier during your usual commute time to avoid peak traffic.</p>
            <div className="feedback-buttons">
              <button 
                className={`feedback-btn ${userFeedback['time-suggestion'] === 'helpful' ? 'active' : ''}`}
                onClick={() => handleFeedback('time-suggestion', 'helpful')}
              >
                👍 Helpful
              </button>
              <button 
                className={`feedback-btn ${userFeedback['time-suggestion'] === 'not-helpful' ? 'active' : ''}`}
                onClick={() => handleFeedback('time-suggestion', 'not-helpful')}
              >
                👎 Not helpful
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-section">
        <div className="privacy-card">
          <h3>🔒 Your Privacy</h3>
          <p>All data is stored locally on your device. We don't share your commute patterns with anyone.</p>
        </div>
      </div>
    </div>
  );
};

export default SmartFavorites;
