import { type LatLngExpression } from 'leaflet';

// Photon API for geocoding and autocomplete
const PHOTON_API_URL = 'https://photon.komoot.io/api/';

// move to types folder
export interface PhotonFeature {
  properties: {
    name: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_id: number;
    osm_type: string;
    osm_key: string;
    osm_value: string;
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}
// move to types folder
export interface PhotonResponse {
  features: PhotonFeature[];
}

export const searchLocation = async (
  query: string,
  lat?: number,
  lon?: number,
  limit: number = 5
): Promise<PhotonFeature[]> => {
  if (!query) return [];
  
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    ...(lat && lon ? { lat: lat.toString(), lon: lon.toString() } : {}),
  });

  try {
    const response = await fetch(`${PHOTON_API_URL}?${params}`);
    if (!response.ok) return [];
    const data: PhotonResponse = await response.json();
    return data.features;
  } catch (error) {
    console.error('Error fetching from Photon:', error);
    return [];
  }
}

// OSRM API for routing
const OSRM_API_URL = 'https://router.project-osrm.org/route/v1';

// move to types folder
export interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    distance: number; // in meters
    duration: number; // in seconds
    geometry: string; // encoded polyline
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        distance: number;
        duration: number;
        geometry: string;
      }>;
    }>;
  }>;
}

export const getRoute = async (
  start: LatLngExpression,
  end: LatLngExpression
): Promise<OSRMRouteResponse | null> => {
  const [startLng, startLat] = Array.isArray(start) ? start : [start.lng, start.lat];
  const [endLng, endLat] = Array.isArray(end) ? end : [end.lng, end.lat];

  try {
    const response = await fetch(
      `${OSRM_API_URL}/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    return null;
  }
};

// Helper function to decode OSRM polyline
export function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;

    do {
      const b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      const b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat * 1e-5, lng * 1e-5]);
  }

  return poly;
} 