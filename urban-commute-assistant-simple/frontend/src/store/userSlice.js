import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Sample user data for testing without backend
const testUser = {
  id: '1',
  name: 'Test User',
  email: 'testuser@example.com',
  location: { lat: 47.6062, lng: -122.3321 }, // Seattle
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

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    // For demo purposes, we'll use a default user
    // In a real app, this would come from the API
    ...testUser,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUserLocation: (state, action) => {
      state.location = action.payload;
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

export const { logout, updateUserLocation } = userSlice.actions;
export default userSlice.reducer;
