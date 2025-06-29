import { mockRides } from './mockRides';

export interface Dispute {
  id: string;
  rideId: string;
  reason: string;
  status: 'open' | 'resolved';
  raisedBy: 'passenger' | 'driver';
  createdAt: string;
}

export const mockDisputes: Dispute[] = [
  {
    id: 'dispute-1',
    rideId: mockRides[0].id,
    reason: 'Passenger claims the driver took a longer route than necessary.',
    status: 'open',
    raisedBy: 'passenger',
    createdAt: new Date('2023-10-26T12:00:00Z').toISOString(),
  },
  {
    id: 'dispute-2',
    rideId: mockRides[3].id,
    reason: 'Driver claims the passenger damaged the vehicle.',
    status: 'open',
    raisedBy: 'driver',
    createdAt: new Date('2023-10-25T11:00:00Z').toISOString(),
  },
    {
    id: 'dispute-3',
    rideId: mockRides[1].id,
    reason: 'Fare was higher than estimated.',
    status: 'resolved',
    raisedBy: 'passenger',
    createdAt: new Date('2023-10-27T18:00:00Z').toISOString(),
  },
];
