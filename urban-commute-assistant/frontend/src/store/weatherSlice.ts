import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  precipitation: number;
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: WeatherState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null
};

// Async thunk for fetching weather data
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (location: { lat: number; lng: number }, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      console.log('Fetching weather data for', location);
      
      // Mock data for now
      const mockWeatherData: WeatherData = {
        temperature: 68,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        feelsLike: 66,
        precipitation: 10,
        forecast: [
          { date: '2023-05-03', high: 72, low: 58, condition: 'Sunny' },
          { date: '2023-05-04', high: 68, low: 56, condition: 'Partly Cloudy' },
          { date: '2023-05-05', high: 65, low: 54, condition: 'Rain' },
        ]
      };
      
      return mockWeatherData;
    } catch (error) {
      return rejectWithValue('Failed to fetch weather data');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearWeatherData(state) {
      state.data = null;
      state.error = null;
    }
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
        state.error = action.payload as string || 'Unknown error occurred';
      });
  }
});

export const { clearWeatherData } = weatherSlice.actions;

export default weatherSlice.reducer;