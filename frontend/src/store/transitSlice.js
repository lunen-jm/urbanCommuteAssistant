import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Async thunk for fetching transit data
export const fetchTransitData = createAsyncThunk(
  'transit/fetchTransitData',
  async ({ lat, lng, radius = 500 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transit`, {
        params: { lat, lon: lng, radius }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch transit data');
    }
  }
);

const transitSlice = createSlice({
  name: 'transit',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTransitData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransitData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransitData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTransitData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch transit data';
      });
  },
});

export const { clearTransitData } = transitSlice.actions;
export default transitSlice.reducer;
