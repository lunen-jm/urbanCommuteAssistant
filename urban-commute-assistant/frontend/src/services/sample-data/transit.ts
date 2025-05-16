import { TransitData } from '../../types';

// This data structure is no longer type-compatible with TransitData 
// but will be transformed by the adapter
export const sampleTransitData = {
  routes: [
    {
      id: 'route-001',
      name: 'Downtown Express',
      shortName: '550',
      type: 'bus',
      color: '#007AFF',
      textColor: '#FFFFFF',
      frequency: 15,
      status: 'active'
    },
    {
      id: 'route-002',
      name: 'Eastside Connector',
      shortName: '545',
      type: 'bus',
      color: '#2ECC71',
      textColor: '#FFFFFF',
      frequency: 20,
      status: 'active'
    },
    {
      id: 'route-003',
      name: 'Link Light Rail',
      shortName: '1',
      type: 'rail',
      color: '#E74C3C',
      textColor: '#FFFFFF',
      frequency: 10,
      status: 'active'
    }
  ],
  stops: [
    {
      id: 'stop-001',
      name: 'Westlake Center',
      code: 'WSTC',
      location: {
        latitude: 47.6112,
        longitude: -122.3378
      },
      routes: ['route-001', 'route-003']
    },
    {
      id: 'stop-002',
      name: 'University Street',
      code: 'UNST',
      location: {
        latitude: 47.6076,
        longitude: -122.3359
      },
      routes: ['route-001', 'route-002']
    },
    {
      id: 'stop-003',
      name: 'Pioneer Square',
      code: 'PION',
      location: {
        latitude: 47.6021,
        longitude: -122.3324
      },
      routes: ['route-001', 'route-002', 'route-003']
    }
  ],
  tripUpdates: [
    {
      id: 'trip-001',
      routeId: 'route-001',
      timestamp: '2023-05-15T12:34:56Z',
      delay: 120,
      vehicle: {
        id: 'vehicle-001',
        label: 'Bus 1234'
      },
      stopTimeUpdates: [
        {
          stopId: 'stop-001',
          arrival: {
            time: '2023-05-15T12:40:00Z',
            delay: 120
          },
          departure: {
            time: '2023-05-15T12:42:00Z',
            delay: 120
          }
        }
      ]
    }
  ],
  vehiclePositions: [
    {
      id: 'vehicle-001',
      routeId: 'route-001',
      tripId: 'trip-001',
      timestamp: '2023-05-15T12:34:56Z',
      position: {
        latitude: 47.6090,
        longitude: -122.3370
      },
      bearing: 180,
      speed: 25.3,
      occupancyStatus: 'MANY_SEATS_AVAILABLE'
    },
    {
      id: 'vehicle-002',
      routeId: 'route-002',
      tripId: 'trip-002',
      timestamp: '2023-05-15T12:34:56Z',
      position: {
        latitude: 47.6050,
        longitude: -122.3340
      },
      bearing: 90,
      speed: 27.8,
      occupancyStatus: 'FEW_SEATS_AVAILABLE'
    }
  ],
  serviceAlerts: [
    {
      id: 'alert-001',
      routeIds: ['route-001'],
      stopIds: ['stop-001'],
      header: 'Service Delay',
      description: 'Delays due to traffic congestion',
      effect: 'SIGNIFICANT_DELAYS',
      cause: 'TRAFFIC_JAM',
      timestamp: '2023-05-15T12:00:00Z'
    }
  ]
};
