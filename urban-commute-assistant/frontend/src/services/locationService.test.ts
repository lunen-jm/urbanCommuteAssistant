/**
 * Basic test file for LocationService
 * This can be run in the browser console or as part of a test suite
 */

import { locationService, LocationCoordinates } from './locationService';

// Test the LocationService functionality
export const testLocationService = async () => {
  console.log('🧪 Testing LocationService...');

  // Test 1: Check if geolocation is supported
  console.log('1. Geolocation supported:', locationService.isSupported());

  // Test 2: Get fallback location
  console.log('2. Fallback location:', locationService.getFallbackLocation());

  // Test 3: Get cached location (should be null initially)
  console.log('3. Cached location (initial):', locationService.getCachedLocation());

  // Test 4: Try to get current location
  try {
    console.log('4. Attempting to get current location...');
    const location = await locationService.getCurrentLocation();
    console.log('✅ Current location:', location);
  } catch (error) {
    console.log('❌ Location error:', error);
  }

  // Test 5: Test location watching
  console.log('5. Setting up location watcher...');
  const cleanup = locationService.watchPosition(
    (location: LocationCoordinates) => {
      console.log('📍 Location update:', location);
    },
    (error) => {
      console.log('❌ Location watch error:', error);
    }
  );

  // Test 6: Get cached location after initial request
  setTimeout(() => {
    console.log('6. Cached location (after request):', locationService.getCachedLocation());
    
    // Cleanup after 10 seconds
    setTimeout(() => {
      console.log('7. Cleaning up location watcher...');
      cleanup();
      console.log('✅ LocationService test completed!');
    }, 10000);
  }, 2000);
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testLocationService = testLocationService;
}
