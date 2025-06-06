import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Async thunk for fetching traffic data
export const fetchTrafficData = createAsyncThunk(
  'traffic/fetchTrafficData',
  async ({ lat, lng, radius = 5000 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/traffic`, {
        params: { lat, lon: lng, radius }
      });
      return response.data;
    } catch (error) {
      // Better error handling to normalize error structure
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data || 
                          error.message || 
                          'Failed to fetch traffic data';
      return rejectWithValue(errorMessage);
    }
  }
);

const trafficSlice = createSlice({
  name: 'traffic',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTrafficData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrafficData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrafficData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTrafficData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch traffic data';
      });
  },
});

export const { clearTrafficData } = trafficSlice.actions;
export default trafficSlice.reducer;
