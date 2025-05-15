import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { TrafficData, TrafficIncident, FlowSegment } from '../types/index';

interface TrafficState {
  data: TrafficData | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrafficState = {
  data: null,
  loading: false,
  error: null
};

// Async thunk for fetching traffic data
export const fetchTrafficData = createAsyncThunk(
  'traffic/fetchTrafficData',
  async (location: { lat: number; lng: number, radius?: number }, { rejectWithValue }) => {
    try {
      // This would be replaced with an actual API call
      console.log('Fetching traffic data for', location);      // Mock data for now
      const mockTrafficData: TrafficData = {
        congestionLevel: 'Moderate',
        incidents: [
          {
            id: 'inc-1',
            type: 'Accident',
            severity: 'Medium',
            description: 'Multi-vehicle accident',
            location: 'Interstate 5, Northbound',
            coordinates: { lat: 47.612, lng: -122.331 },
            startTime: '2023-05-02T14:30:00Z'
          },
          {
            id: 'inc-2',
            type: 'Construction',
            severity: 'Low',
            description: 'Road work - lane closure',
            location: 'Pike Street',
            coordinates: { lat: 47.608, lng: -122.337 },
            startTime: '2023-05-01T08:00:00Z',
            endTime: '2023-05-05T17:00:00Z'
          },
          {
            id: 'inc-3',
            type: 'Congestion',
            severity: 'High',
            description: 'Heavy traffic due to rush hour',
            location: 'SR 520, Westbound',
            coordinates: { lat: 47.645, lng: -122.308 },
            startTime: '2023-05-02T16:00:00Z',
            endTime: '2023-05-02T19:00:00Z'
          }
        ],
        lastUpdated: new Date().toISOString(),
        flowSegments: [
          {
            id: 'flow-1',
            currentSpeed: 35,
            freeFlowSpeed: 60,
            roadName: 'Interstate 5',
            location: { lat: 47.615, lng: -122.335 },
            length: 2.5
          },
          {
            id: 'flow-2',
            currentSpeed: 25,
            freeFlowSpeed: 40,
            roadName: 'Pike Street',
            location: { lat: 47.610, lng: -122.340 },
            length: 1.2
          }
        ]
      };
      
      return mockTrafficData;
    } catch (error) {
      return rejectWithValue('Failed to fetch traffic data');
    }
  }
);

const trafficSlice = createSlice({
  name: 'traffic',
  initialState,
  reducers: {
    clearTrafficData(state) {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrafficData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })      .addCase(fetchTrafficData.fulfilled, (state, action: PayloadAction<TrafficData>) => {
        state.loading = false;
        
        // Normalize incident data to ensure consistent structure
        if (action.payload?.incidents) {
          action.payload.incidents = action.payload.incidents.map(incident => {
            // Create a normalized incident object
            const normalizedIncident: TrafficIncident = {
              ...incident,
              // Ensure severity is in the right format
              severity: incident.severity
            };
            
            return normalizedIncident;
          });
        }
        
        // Ensure flowSegments exists
        if (!action.payload.flowSegments) {
          action.payload.flowSegments = [];
        }
        
        state.data = action.payload;
      })
      .addCase(fetchTrafficData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
      });
  }
});

export const { clearTrafficData } = trafficSlice.actions;

export default trafficSlice.reducer;