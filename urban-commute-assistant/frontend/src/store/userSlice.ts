import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, LocationCoordinates, LocationError, SavedLocation, LocationStatus } from '../types';

const initialState: UserState = {
  id: null,
  name: '',
  email: '',
  // Location-related initial state
  currentLocation: null,
  locationStatus: 'unknown',
  locationError: null,
  selectedDestination: null,
  savedLocations: [
    // Default saved locations (Bellevue area for testing)
    {
      id: '1',
      name: 'Home',
      address: 'Bellevue residential area',
      lat: 47.6101,
      lng: -122.2015
    },
    {
      id: '2',
      name: 'Work',
      address: 'Microsoft Redmond Campus',
      lat: 47.6423,
      lng: -122.1301
    },
    {
      id: '3',
      name: 'School',
      address: 'Global Innovation Exchange (GIX), Bellevue',
      lat: 47.6160,
      lng: -122.1896
    }
  ],
  // User preferences
  preferences: {
    darkMode: false,
    preferredTransportModes: [],
    notificationSettings: {
      email: false,
      push: false,
      sms: false
    }
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // User management actions
    setUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
    clearUser() {
      return initialState;
    },
    updatePreferences(state, action: PayloadAction<Partial<UserState['preferences']>>) {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Location management actions
    setCurrentLocation(state, action: PayloadAction<LocationCoordinates>) {
      state.currentLocation = action.payload;
      state.locationStatus = 'success';
      state.locationError = null;
    },
    
    setLocationLoading(state) {
      state.locationStatus = 'loading';
      state.locationError = null;
    },
    
    setLocationError(state, action: PayloadAction<LocationError>) {
      state.locationStatus = 'error';
      state.locationError = action.payload;
      // Don't clear currentLocation on error - keep last known location
    },
    
    clearLocationError(state) {
      state.locationError = null;
      if (state.locationStatus === 'error') {
        state.locationStatus = state.currentLocation ? 'success' : 'unknown';
      }
    },
    
    setSelectedDestination(state, action: PayloadAction<SavedLocation | null>) {
      state.selectedDestination = action.payload;
    },
    
    addSavedLocation(state, action: PayloadAction<Omit<SavedLocation, 'id'>>) {
      // Generate a simple ID based on current timestamp and array length
      const newId = `${Date.now()}_${state.savedLocations.length}`;
      const newLocation: SavedLocation = {
        ...action.payload,
        id: newId
      };
      state.savedLocations.push(newLocation);
    },
    
    removeSavedLocation(state, action: PayloadAction<string>) {
      const locationId = action.payload;
      state.savedLocations = state.savedLocations.filter(loc => loc.id !== locationId);
      // If the removed location was selected as destination, clear selection
      if (state.selectedDestination?.id === locationId) {
        state.selectedDestination = null;
      }
    },
    
    updateSavedLocation(state, action: PayloadAction<SavedLocation>) {
      const updatedLocation = action.payload;
      const index = state.savedLocations.findIndex(loc => loc.id === updatedLocation.id);
      if (index !== -1) {
        state.savedLocations[index] = updatedLocation;
        // Update selectedDestination if it's the same location
        if (state.selectedDestination?.id === updatedLocation.id) {
          state.selectedDestination = updatedLocation;
        }
      }
    },
  },
});

export const { 
  // User management actions
  setUser, 
  clearUser, 
  updatePreferences,
  // Location management actions
  setCurrentLocation,
  setLocationLoading,
  setLocationError,
  clearLocationError,
  setSelectedDestination,
  addSavedLocation,
  removeSavedLocation,
  updateSavedLocation,
} = userSlice.actions;

export default userSlice.reducer;