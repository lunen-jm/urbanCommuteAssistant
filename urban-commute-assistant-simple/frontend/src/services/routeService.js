// TomTom Routing API utility
// Usage: getRouteTomTom([lat1, lng1], [lat2, lng2])
import axios from 'axios';

const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
const BASE_URL = 'https://api.tomtom.com/routing/1/calculateRoute';

export async function getRouteTomTom(from, to) {
  if (!TOMTOM_API_KEY) throw new Error('TomTom API key not set');
  const url = `${BASE_URL}/${from[0]},${from[1]}:${to[0]},${to[1]}/json`;
  const params = {
    key: TOMTOM_API_KEY,
    traffic: false,
    computeBestOrder: false,
    routeType: 'fastest',
    travelMode: 'car',
  };
  const response = await axios.get(url, { params });
  // Extract polyline and ETA from response
  const route = response.data.routes?.[0];
  const points = route?.legs?.[0]?.points;
  const summary = route?.summary;
  if (!points) throw new Error('No route found');
  // ETA in seconds
  const etaSeconds = summary?.travelTimeInSeconds;
  return {
    coords: points.map(pt => [pt.latitude, pt.longitude]),
    etaSeconds: etaSeconds || null,
  };
}
