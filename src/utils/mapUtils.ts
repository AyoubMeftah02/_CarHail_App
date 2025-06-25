import { type LatLngExpression } from 'leaflet';

export const ratePerKm = 0.0005; // ETH per km
export const platformFeeRate = 0.05; // 5%

export const toRad = (x: number) => {
  return (x * Math.PI) / 180;
}

export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const calculateFare = (
  pickup: LatLngExpression,
  dest: LatLngExpression,
) => {
  const [lat1, lon1] = Array.isArray(pickup)
    ? pickup
    : [pickup.lat, pickup.lng];
  const [lat2, lon2] = Array.isArray(dest) ? dest : [dest.lat, dest.lng];
  const distance = haversineDistance(lat1, lon1, lat2, lon2);
  const rawFare = distance * ratePerKm;
  const platformFee = rawFare * platformFeeRate;
  const driverEarnings = rawFare - platformFee;
  return {
    distance: distance.toFixed(2),
    estimatedFare: rawFare.toFixed(6),
    platformFee: platformFee.toFixed(6),
    driverEarnings: driverEarnings.toFixed(6),
  };
}

export const getLatLngArray = (pos: LatLngExpression): [number, number] => {
  if (Array.isArray(pos)) return [pos[0], pos[1]];
  return [pos.lat, pos.lng];
}

export const geocodeLocation = async (
  query: string,
): Promise<Array<{ display_name: string; lat: string; lon: string }>> => {
  if (!query) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export const reverseGeocodeLocation = async (
  lat: number,
  lon: number,
): Promise<Array<{ display_name: string; lat: string; lon: string }>> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  // Nominatim reverse geocoding returns a single object, not an array
  // We'll wrap it in an array to match the expected type for suggestions
  const data = await res.json();
  if (data && data.display_name) {
    return [{ display_name: data.display_name, lat: data.lat, lon: data.lon }];
  }
  return [];
}


export const sortSuggestionsByDistance = (
  suggestions: Array<{ display_name: string; lat: string; lon: string }>,
  userLat: number,
  userLon: number,
): Array<{ display_name: string; lat: string; lon: string; distance: number }> => {
  return suggestions
    .map(suggestion => ({
      ...suggestion,
      distance: haversineDistance(
        userLat,
        userLon,
        parseFloat(suggestion.lat),
        parseFloat(suggestion.lon)
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}
