import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Initial user state - will be populated when user logs in or provides data
const initialUserData = {
  id: null,
  name: '',
  email: '',
  location: null,  savedLocations: [
    {
      id: '1',
      name: 'Home (Bellevue)',
      address: '123 Main St, Bellevue, WA 98004',
      type: 'home',
      favorite: true,
      lat: 47.6101,
      lng: -122.2015
    },
    {
      id: '2', 
      name: 'Microsoft (Redmond)',
      address: '1 Microsoft Way, Redmond, WA 98052',
      type: 'work',
      favorite: true,
      lat: 47.6423,
      lng: -122.1373
    },
    {
      id: '3',
      name: 'Crossroads Planet Fitness',
      address: '15600 NE 8th St, Bellevue, WA 98008',
      type: 'gym',
      favorite: false,
      lat: 47.6205,
      lng: -122.1370
    },
    {
      id: '4',
      name: 'GIX (Global Innovation Exchange)',
      address: '12280 NE District Way, Bellevue, WA 98005',
      type: 'school',
      favorite: false,
      lat: 47.6545,
      lng: -122.1365
    }
  ],
  selectedLocation: '2', // Default to Work
  useCurrentLocation: true, // Default to using current location
  preferences: {
    theme: 'light',
    transitTypes: ['bus', 'rail'],
    commuteTimes: {
      morningStart: '08:00',
      morningEnd: '09:30',
      eveningStart: '17:00',
      eveningEnd: '18:30',
    },
  },
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/token`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for getting user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    const { user } = getState();
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({  name: 'user',
  initialState: {
    token: null,
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    // Initialize with empty user data
    ...initialUserData,
    // Location state for the refactored location system
    currentLocation: null,
    locationStatus: 'unknown', // 'unknown' | 'loading' | 'success' | 'error'
    locationError: null,
  },  reducers: {
    logout: (state) => {
      state.token = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUserLocation: (state, action) => {
      state.location = action.payload;
    },
    selectSavedLocation: (state, action) => {
      state.selectedLocation = action.payload;
      // Don't overwrite the user's actual current location when selecting destinations
      // The selectedLocation is just the destination, not the user's current position
    },    addSavedLocation: (state, action) => {
      // Generate a new ID - in a real app you'd want to ensure uniqueness
      const newId = String(state.savedLocations.length + 1);
      const newLocation = { 
        id: newId, 
        name: action.payload.name, 
        address: action.payload.address || '',
        lat: action.payload.lat, 
        lng: action.payload.lng,
        type: action.payload.type || 'other',
        favorite: action.payload.favorite || false
      };
      state.savedLocations.push(newLocation);
    },
    updateSavedLocation: (state, action) => {
      const { id, updates } = action.payload;
      const locationIndex = state.savedLocations.findIndex(loc => loc.id === id);
      if (locationIndex !== -1) {
        state.savedLocations[locationIndex] = { ...state.savedLocations[locationIndex], ...updates };
      }
    },
    deleteSavedLocation: (state, action) => {
      const locationId = action.payload;
      state.savedLocations = state.savedLocations.filter(loc => loc.id !== locationId);
      // If the deleted location was selected, reset to the first available location
      if (state.selectedLocation === locationId && state.savedLocations.length > 0) {
        state.selectedLocation = state.savedLocations[0].id;
      }
    },
    toggleUseCurrentLocation: (state, action) => {
      state.useCurrentLocation = action.payload;
    },
    // New location actions for refactored location system
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      state.locationStatus = 'success';
      state.locationError = null;
    },
    setLocationLoading: (state) => {
      state.locationStatus = 'loading';
      state.locationError = null;
    },
    setLocationError: (state, action) => {
      state.locationStatus = 'error';
      state.locationError = action.payload;
    },    clearLocationError: (state) => {
      state.locationError = null;
      if (state.locationStatus === 'error') {
        state.locationStatus = 'unknown';
      }
    },
    updateUserProfile: (state, action) => {
      // Update user profile data like name, preferences, etc.
      const updates = action.payload;
      if (updates.name !== undefined) {
        state.name = updates.name;
      }
      if (updates.preferences) {
        state.preferences = { ...state.preferences, ...updates.preferences };
      }
      if (updates.email !== undefined) {
        state.email = updates.email;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile';
      });
  },
});

export const { 
  logout, 
  updateUserLocation, 
  selectSavedLocation, 
  addSavedLocation, 
  updateSavedLocation,
  deleteSavedLocation,
  toggleUseCurrentLocation,
  setCurrentLocation,
  setLocationLoading,
  setLocationError,
  clearLocationError,
  updateUserProfile,
} = userSlice.actions;
export default userSlice.reducer;
