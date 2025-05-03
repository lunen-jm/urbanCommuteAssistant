import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define custom interfaces instead of importing from Leaflet
interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface LatLngBounds {
  _southWest: LatLngLiteral;
  _northEast: LatLngLiteral;
}

interface MapState {
  zoom: number;
  center: {
    lat: number;
    lng: number;
  };
  bounds: LatLngBounds | null;
  activeLayers: {
    traffic: boolean;
    weather: boolean;
    transit: boolean;
  };
}

const initialState: MapState = {
  zoom: 13,
  center: {
    lat: 47.6062, // Default to Seattle
    lng: -122.3321
  },
  bounds: null,
  activeLayers: {
    traffic: true,
    weather: true,
    transit: true
  }
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = action.payload;
    },
    zoomIn(state) {
      state.zoom = Math.min(state.zoom + 1, 18);
    },
    zoomOut(state) {
      state.zoom = Math.max(state.zoom - 1, 3);
    },
    setCenter(state, action: PayloadAction<{lat: number; lng: number}>) {
      state.center = action.payload;
    },
    setBounds(state, action: PayloadAction<LatLngBounds>) {
      state.bounds = action.payload;
    },
    resetView(state) {
      state.zoom = initialState.zoom;
      state.center = initialState.center;
    },
    toggleLayer(state, action: PayloadAction<keyof MapState['activeLayers']>) {
      const layer = action.payload;
      state.activeLayers[layer] = !state.activeLayers[layer];
    },
    setLayerVisibility(state, action: PayloadAction<{layer: keyof MapState['activeLayers'], visible: boolean}>) {
      const { layer, visible } = action.payload;
      state.activeLayers[layer] = visible;
    }
  }
});

export const { 
  setZoom, 
  zoomIn, 
  zoomOut, 
  setCenter, 
  setBounds, 
  resetView, 
  toggleLayer,
  setLayerVisibility
} = mapSlice.actions;

export default mapSlice.reducer;