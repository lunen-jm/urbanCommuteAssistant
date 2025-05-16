import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchTrafficData } from '../services/api-hybrid';
import { TrafficData } from '../types';

interface LocationParams {
  latitude: number;
  longitude: number;
}

export const getTrafficData = createAsyncThunk(
  'trafficData/getTrafficData',
  async (location: LocationParams) => {
    const response = await fetchTrafficData(location);
    return response;
  }
);

interface TrafficDataState {
  data: TrafficData | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrafficDataState = {
  data: null,
  loading: false,
  error: null,
};

export const trafficDataSlice = createSlice({
  name: 'trafficData',
  initialState,
  reducers: {
    clearTrafficData: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    setTrafficData: (state, action: PayloadAction<TrafficData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrafficData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrafficData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getTrafficData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch traffic data';
      });
  },
});

export const { clearTrafficData, setTrafficData } = trafficDataSlice.actions;

export default trafficDataSlice.reducer;
