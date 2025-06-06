// ML Utilities for Urban Commute Assistant
// Handles user preference learning and smart recommendations

class MLUtils {
  constructor() {
    this.storageKey = 'commuteML';
    this.preferences = this.loadPreferences();
  }

  // Load user preferences from local storage
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        transportMethodByDestination: {},
        destinationFrequency: {},
        timeBasedPreferences: {},
        weatherPreferences: {},
        lastSelections: [],
        userFeedback: {},      createdAt: new Date().toISOString()
      };
    } catch (error) {
      // Development logging - remove in production
      // console.error('Error loading ML preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  // Save preferences to local storage
  savePreferences() {
    try {
      this.preferences.updatedAt = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    } catch (error) {
      // Development logging - remove in production
      // console.error('Error saving ML preferences:', error);
    }
  }

  // Get default preferences structure
  getDefaultPreferences() {
    return {
      transportMethodByDestination: {},
      destinationFrequency: {},
      timeBasedPreferences: {},
      weatherPreferences: {},
      lastSelections: [],
      userFeedback: {},
      createdAt: new Date().toISOString()
    };
  }

  // Track user's commute choice
  trackUserChoice(choice, context) {
    const {
      destinationId,
      destinationName,
      transportMethod,
      weather,
      timeOfDay,
      dayOfWeek
    } = choice;

    const {
      temperature,
      condition: weatherCondition
    } = context;

    // Track transport method by destination
    this.preferences.transportMethodByDestination[destinationId] = transportMethod;

    // Track destination frequency
    this.preferences.destinationFrequency[destinationId] = 
      (this.preferences.destinationFrequency[destinationId] || 0) + 1;

    // Track time-based preferences
    const timeSlot = this.getTimeSlot(timeOfDay);
    this.preferences.timeBasedPreferences[timeSlot] = 
      this.preferences.timeBasedPreferences[timeSlot] || {};
    this.preferences.timeBasedPreferences[timeSlot][transportMethod] = 
      (this.preferences.timeBasedPreferences[timeSlot][transportMethod] || 0) + 1;

    // Track weather-based preferences
    const weatherCategory = this.getWeatherCategory(weatherCondition, temperature);
    this.preferences.weatherPreferences[weatherCategory] = 
      this.preferences.weatherPreferences[weatherCategory] || {};
    this.preferences.weatherPreferences[weatherCategory][transportMethod] = 
      (this.preferences.weatherPreferences[weatherCategory][transportMethod] || 0) + 1;

    // Store last selections (keep last 50)
    const selection = {
      timestamp: new Date().toISOString(),
      destinationId,
      destinationName,
      transportMethod,
      weather: weatherCondition,
      temperature,
      timeOfDay,
      dayOfWeek
    };

    this.preferences.lastSelections.unshift(selection);
    if (this.preferences.lastSelections.length > 50) {
      this.preferences.lastSelections = this.preferences.lastSelections.slice(0, 50);
    }

    this.savePreferences();
  }

  // Get smart default transport method for a destination
  getSmartDefault(destinationId) {
    return this.preferences.transportMethodByDestination[destinationId] || null;
  }

  // Get destinations sorted by frequency
  getFrequentDestinations() {
    const frequencies = this.preferences.destinationFrequency;
    return Object.entries(frequencies)
      .sort(([,a], [,b]) => b - a)
      .map(([destinationId, count]) => ({ destinationId: parseInt(destinationId), count }));
  }

  // Get recommended transport method based on context
  getRecommendedTransport(context) {
    const { weather, timeOfDay, temperature } = context;
    
    const timeSlot = this.getTimeSlot(timeOfDay);
    const weatherCategory = this.getWeatherCategory(weather, temperature);

    // Get preferences for current time and weather
    const timePrefs = this.preferences.timeBasedPreferences[timeSlot] || {};
    const weatherPrefs = this.preferences.weatherPreferences[weatherCategory] || {};

    // Combine preferences with weights
    const scores = {};
    
    // Time-based scoring (weight: 0.4)
    Object.entries(timePrefs).forEach(([method, count]) => {
      scores[method] = (scores[method] || 0) + (count * 0.4);
    });

    // Weather-based scoring (weight: 0.6)
    Object.entries(weatherPrefs).forEach(([method, count]) => {
      scores[method] = (scores[method] || 0) + (count * 0.6);
    });

    // Return method with highest score
    const recommended = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];

    return recommended ? recommended[0] : null;
  }

  // Check if a destination should be promoted based on frequency
  shouldPromoteDestination(destinationId, threshold = 3) {
    const frequency = this.preferences.destinationFrequency[destinationId] || 0;
    return frequency >= threshold;
  }

  // Get insights about user patterns
  getUserInsights() {
    const insights = {
      totalTrips: this.preferences.lastSelections.length,
      favoriteDestinations: this.getFrequentDestinations().slice(0, 3),
      preferredTransportMethods: this.getTransportMethodStats(),
      weatherPatterns: this.getWeatherInsights(),
      timePatterns: this.getTimeInsights()
    };

    return insights;
  }

  // Get transport method usage statistics
  getTransportMethodStats() {
    const stats = {};
    this.preferences.lastSelections.forEach(selection => {
      stats[selection.transportMethod] = (stats[selection.transportMethod] || 0) + 1;
    });

    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .map(([method, count]) => ({ method, count, percentage: Math.round((count / this.preferences.lastSelections.length) * 100) }));
  }

  // Get weather-based insights
  getWeatherInsights() {
    const patterns = {};
    this.preferences.lastSelections.forEach(selection => {
      const weather = this.getWeatherCategory(selection.weather, selection.temperature);
      patterns[weather] = patterns[weather] || {};
      patterns[weather][selection.transportMethod] = (patterns[weather][selection.transportMethod] || 0) + 1;
    });

    return patterns;
  }

  // Get time-based insights
  getTimeInsights() {
    const patterns = {};
    this.preferences.lastSelections.forEach(selection => {
      const timeSlot = this.getTimeSlot(selection.timeOfDay);
      patterns[timeSlot] = patterns[timeSlot] || {};
      patterns[timeSlot][selection.transportMethod] = (patterns[timeSlot][selection.transportMethod] || 0) + 1;
    });

    return patterns;
  }

  // Utility: Get time slot for time-based preferences
  getTimeSlot(timeOfDay) {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // Utility: Get weather category for weather-based preferences
  getWeatherCategory(condition, temperature) {
    const temp = parseInt(temperature) || 20;
    
    if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm')) {
      return 'rainy';
    }
    if (condition.toLowerCase().includes('snow') || condition.toLowerCase().includes('ice')) {
      return 'snowy';
    }
    if (temp < 5) return 'very_cold';
    if (temp < 15) return 'cold';
    if (temp > 30) return 'hot';
    if (temp > 25) return 'warm';
    return 'pleasant';
  }

  // Record user feedback on recommendations
  recordFeedback(recommendationId, feedback) {
    this.preferences.userFeedback[recommendationId] = {
      feedback,
      timestamp: new Date().toISOString()
    };
    this.savePreferences();
  }

  // Clear all ML data (for privacy/reset)
  clearAllData() {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
  }

  // Export user data (for transparency)
  exportUserData() {
    return {
      ...this.preferences,
      insights: this.getUserInsights()
    };
  }

  // Advanced: Get confidence score for recommendations
  getRecommendationConfidence(destinationId, transportMethod) {
    const history = this.preferences.lastSelections || [];
    const relevantChoices = history.filter(choice => 
      choice.destinationId === destinationId && choice.transportMethod === transportMethod
    );
    
    if (relevantChoices.length === 0) return 0;
    if (relevantChoices.length < 3) return 0.3;
    if (relevantChoices.length < 5) return 0.6;
    if (relevantChoices.length < 10) return 0.8;
    return 0.95;
  }

  // Advanced: Suggest optimal departure time based on patterns
  suggestOptimalDepartureTime(destinationId, currentTime = new Date()) {
    const history = this.preferences.lastSelections || [];
    const destinationHistory = history.filter(choice => choice.destinationId === destinationId);
    
    if (destinationHistory.length < 3) return null;
    
    // Group by hour and find most common departure times
    const hourCounts = {};
    destinationHistory.forEach(choice => {
      if (choice.timestamp) {
        const hour = new Date(choice.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    const sortedHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
    
    if (sortedHours.length > 0) {
      const mostCommonHour = sortedHours[0].hour;
      return {
        suggestedHour: mostCommonHour,
        confidence: Math.min(sortedHours[0].count / destinationHistory.length, 1),
        alternatives: sortedHours.slice(1, 3)
      };
    }
    
    return null;
  }

  // Advanced: Predict travel duration preferences
  getTravelDurationPreference() {
    const history = this.preferences.lastSelections || [];
    const durations = [];
    
    // Estimate durations based on transport method (mock data for now)
    const estimatedDurations = {
      drive: 20,
      transit: 35,
      bike: 40,
      rideshare: 25,
      walk: 60
    };
    
    history.forEach(choice => {
      if (estimatedDurations[choice.transportMethod]) {
        durations.push(estimatedDurations[choice.transportMethod]);
      }
    });
    
    if (durations.length === 0) return null;
    
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    return {
      averagePreferredDuration: Math.round(avgDuration),
      maxToleratedDuration: maxDuration,
      minAcceptableDuration: minDuration,
      preferredRange: `${minDuration}-${maxDuration} minutes`
    };
  }

  // Advanced: Environmental preference analysis
  getEnvironmentalImpactPreference() {
    const history = this.preferences.lastSelections || [];
    if (history.length === 0) return null;
    
    const co2Estimates = {
      drive: 4.2,
      transit: 0.8,
      bike: 0.0,
      rideshare: 3.8,
      walk: 0.0
    };
    
    const totalTrips = history.length;
    const ecoFriendlyTrips = history.filter(choice => 
      ['transit', 'bike', 'walk'].includes(choice.transportMethod)
    ).length;
    
    const ecoScore = (ecoFriendlyTrips / totalTrips) * 100;
    
    let ecoCategory = 'Neutral';
    if (ecoScore >= 70) ecoCategory = 'Eco-Conscious';
    else if (ecoScore >= 40) ecoCategory = 'Environmentally Aware';
    else if (ecoScore < 20) ecoCategory = 'Convenience-Focused';
    
    return {
      ecoFriendlyPercentage: Math.round(ecoScore),
      category: ecoCategory,
      recommendedImprovements: ecoScore < 50 ? [
        'Try transit on rainy days instead of driving',
        'Consider biking for short distances',
        'Walk for destinations under 1 mile'
      ] : []
    };
  }
}

// Create singleton instance
const mlUtils = new MLUtils();

export default mlUtils;
