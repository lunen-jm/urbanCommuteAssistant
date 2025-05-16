import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/api-real';

export interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
  feels_like: number;
  source: string;
  // Fields for future use
  precipitation?: number;
  forecast?: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

interface WeatherState {
  data: WeatherData;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: WeatherState = {
  data: {
    temperature: 0,
    description: 'Weather data unavailable',
    humidity: 0,
    wind_speed: 0,
    feels_like: 0,
    source: 'pending'
  },
  loading: false,
  error: null,
  lastUpdated: null
};

// Async thunk for fetching weather data
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (location: { lat: number; lng: number }, { rejectWithValue }) => {
    try {
      // Call to real API service
      const response = await apiService.getWeatherData(location.lat, location.lng);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch weather data');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    resetWeatherStatus: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action: PayloadAction<WeatherData>) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch weather data';
        // Keep the current data with placeholder values
      });
  },
});

export const { resetWeatherStatus } = weatherSlice.actions;
export default weatherSlice.reducer;