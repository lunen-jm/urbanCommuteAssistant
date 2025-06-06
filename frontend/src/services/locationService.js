/**
 * Centralized Location Service for Urban Commute Assistant
 * 
 * This service provides a single, reliable interface for all location-related operations
 * including GPS positioning, location watching, and fallback handling.
 */

class LocationService {
  static instance = null;
  
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.callbacks = new Set();
    this.errorCallbacks = new Set();
    this.lastUpdateTime = 0;
    this.CACHE_DURATION = 60000; // 1 minute cache
    this.DEFAULT_TIMEOUT = 10000; // 10 seconds
    this.DEFAULT_MAX_AGE = 60000; // 1 minute
  }

  // Singleton pattern
  static getInstance() {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get current location with caching support
   */
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: this.DEFAULT_TIMEOUT,
      maximumAge: this.DEFAULT_MAX_AGE,
      ...options
    };

    // Return cached location if still valid
    if (this.currentPosition && this.isCacheValid()) {
      return this.currentPosition;
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = {
          code: 0,
          message: 'Geolocation not supported by this browser'
        };
        this.notifyErrorCallbacks(error);
        reject(error);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = this.formatLocation(position);
          this.updateCurrentPosition(location);
          resolve(location);
        },
        (error) => {
          const locationError = this.formatError(error);
          this.notifyErrorCallbacks(locationError);
          
          // Fallback to default location on error
          const fallbackLocation = this.getFallbackLocation();
          this.updateCurrentPosition(fallbackLocation);
          resolve(fallbackLocation);
        },
        defaultOptions
      );
    });
  }

  /**
   * Start watching position changes
   */
  watchPosition(callback, errorCallback, options = {}) {
    // Add callbacks to sets
    this.callbacks.add(callback);
    if (errorCallback) {
      this.errorCallbacks.add(errorCallback);
    }

    // Return current position immediately if available and valid
    if (this.currentPosition && this.isCacheValid()) {
      callback(this.currentPosition);
    }

    // Start watching if not already watching
    if (!this.watchId && navigator.geolocation) {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: this.DEFAULT_TIMEOUT,
        maximumAge: this.DEFAULT_MAX_AGE,
        ...options
      };

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = this.formatLocation(position);
          this.updateCurrentPosition(location);
          this.notifyCallbacks(location);
        },
        (error) => {
          const locationError = this.formatError(error);
          this.notifyErrorCallbacks(locationError);
          
          // Continue with fallback location
          const fallbackLocation = this.getFallbackLocation();
          this.updateCurrentPosition(fallbackLocation);
          this.notifyCallbacks(fallbackLocation);
        },
        defaultOptions
      );
    } else if (!navigator.geolocation) {
      // Handle browsers without geolocation
      const error = {
        code: 0,
        message: 'Geolocation not supported by this browser'
      };
      if (errorCallback) {
        errorCallback(error);
      }
      
      // Provide fallback location
      const fallbackLocation = this.getFallbackLocation();
      callback(fallbackLocation);
    }

    // Return cleanup function
    return () => {
      this.callbacks.delete(callback);
      if (errorCallback) {
        this.errorCallbacks.delete(errorCallback);
      }

      // Stop watching if no more callbacks
      if (this.callbacks.size === 0 && this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    };
  }

  /**
   * Get fallback location (Bellevue, WA)
   */
  getFallbackLocation() {
    return {
      lat: 47.6101,
      lng: -122.2015,
      accuracy: 1000, // Indicate this is not accurate GPS data
      timestamp: Date.now()
    };
  }

  /**
   * Get current cached position without triggering new location request
   */
  getCachedLocation() {
    return this.currentPosition;
  }

  /**
   * Check if geolocation is supported
   */
  isSupported() {
    return 'geolocation' in navigator;
  }

  /**
   * Clear all watchers and reset service
   */
  clearAll() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.callbacks.clear();
    this.errorCallbacks.clear();
    this.currentPosition = null;
    this.lastUpdateTime = 0;
  }

  // Private helper methods

  formatLocation(position) {
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now()
    };
  }

  formatError(error) {
    const messages = {
      1: 'Location access denied by user',
      2: 'Location information unavailable',
      3: 'Location request timed out'
    };

    return {
      code: error.code,
      message: messages[error.code] || 'Unknown location error'
    };
  }

  updateCurrentPosition(location) {
    this.currentPosition = location;
    this.lastUpdateTime = Date.now();
  }

  isCacheValid() {
    return Date.now() - this.lastUpdateTime < this.CACHE_DURATION;
  }
  notifyCallbacks(location) {
    this.callbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        // Development logging - remove in production
        // console.error('Error in location callback:', error);
      }
    });
  }

  notifyErrorCallbacks(error) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        // Development logging - remove in production
        // console.error('Error in location error callback:', callbackError);
      }
    });
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();

// Export the class for testing purposes
export { LocationService };
