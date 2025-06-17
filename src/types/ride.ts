import { type LatLngExpression } from 'leaflet';

export interface Driver {
  id: string;
  name: string;
  position: LatLngExpression;
  rating: number;
  eta: number;
  carModel: string;
  licensePlate: string;
}

export interface RideRequest {
  id: string;
  status: 'searching' | 'matched' | 'pickup' | 'inProgress' | 'completed';
  driver?: Driver;
  estimatedFare: number;
  pickup: LatLngExpression;
  destination: LatLngExpression;
  timestamp?: string;
}

export interface FareDetails {
  distance: string;
  estimatedFare: string;
  platformFee: string;
  driverEarnings: string;
  duration: number;
}

export interface MapProps {
  userAccount: string;
  userPosition: LatLngExpression | null;
  mapCenter: LatLngExpression | null;
  locationError: string | null;
  isLocating: boolean;
  drivers: Driver[];
  rideRequest: RideRequest | null;
  showDrivers: boolean;
  pickup: LatLngExpression | null;
  destination: LatLngExpression | null;
  fareDetails: {
    distance: string;
    estimatedFare: string;
    platformFee: string;
    driverEarnings: string;
    duration: number;
  } | null;
  pickupQuery: string;
  destinationQuery: string;
  setPickup: (latlng: LatLngExpression | null) => void;
  setDestination: (latlng: LatLngExpression | null) => void;
  setFareDetails: (fareDetails: FareDetails | null) => void;
  setPickupQuery: (query: string) => void;
  setDestinationQuery: (query: string) => void;
  handleDriverSelect: (driver: Driver) => void;
  requestRide: () => void;
  cancelRide: () => void;
  handleMapClick: (event: any) => void;
}
