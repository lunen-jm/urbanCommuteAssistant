import { TrafficData } from '../../types';

// This data structure is no longer type-compatible with TrafficData 
// but will be transformed by the adapter
export const sampleTrafficData = {
  currentSpeed: 35.4,
  freeFlowSpeed: 45.0,
  travelTimeMinutes: 23,
  congestion: 'moderate',
  incidents: [
    {
      id: 'incident-001',
      type: 'accident',
      description: 'Vehicle accident',
      severity: 'moderate',
      location: {
        latitude: 47.6062,
        longitude: -122.3321
      }
    },
    {
      id: 'incident-002',
      type: 'roadwork',
      description: 'Lane closure due to road work',
      severity: 'minor',
      location: {
        latitude: 47.6082,
        longitude: -122.3351
      }
    }
  ],
  timestamp: new Date().toISOString(),
  flowSegments: []
};
