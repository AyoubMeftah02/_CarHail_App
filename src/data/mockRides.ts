import type { RideRequest } from '@/types/ride';
import { STATIC_DRIVERS } from '@/utils/driverStorage';

export const mockRides: RideRequest[] = [
  {
    id: 'ride-1',
    status: 'completed',
    driver: STATIC_DRIVERS[0],
    estimatedFare: 25.50,
    pickup: [34.0522, -118.2437], // Los Angeles
    destination: [34.0522, -118.2437], // Same for simplicity
    timestamp: new Date('2023-10-26T10:00:00Z').toISOString(),
  },
  {
    id: 'ride-2',
    status: 'inProgress',
    driver: STATIC_DRIVERS[1],
    estimatedFare: 15.75,
    pickup: [40.7128, -74.0060], // New York
    destination: [40.7128, -74.0060],
    timestamp: new Date('2023-10-27T14:30:00Z').toISOString(),
  },
  {
    id: 'ride-3',
    status: 'searching',
    estimatedFare: 30.00,
    pickup: [41.8781, -87.6298], // Chicago
    destination: [41.8781, -87.6298],
    timestamp: new Date('2023-10-27T15:00:00Z').toISOString(),
  },
  {
    id: 'ride-4',
    status: 'completed',
    driver: STATIC_DRIVERS[2],
    estimatedFare: 45.00,
    pickup: [29.7604, -95.3698], // Houston
    destination: [29.7604, -95.3698],
    timestamp: new Date('2023-10-25T09:00:00Z').toISOString(),
  },
];
