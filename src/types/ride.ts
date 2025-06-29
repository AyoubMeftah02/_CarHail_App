import { type LatLngExpression } from 'leaflet';

export interface Driver {
  id: string;
  name: string;
  rating: number;
  eta: number | string; // Can be number (minutes) or string (formatted time)
  carModel: string;
  licensePlate: string;
  verified?: boolean;
  image?: string;
  initials?: string;
  car?: string;
  createdAt?: string;
  ethAddress?: string; // Ethereum address assigned after verification
  licenseId?: string;
  issueDate?: string;
  expiryDate?: string;
  // Map-related properties
  position?: LatLngExpression;
  price?: string;
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

export interface MapProps {
  userAccount: string;
  className?: string;
  pickup?: LatLngExpression | null;
  destination?: LatLngExpression | null;
  userLocation?: LatLngExpression | null;
}
