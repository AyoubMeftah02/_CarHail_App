import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useEscrow } from '@/hooks/useEscrow';
import type { RideDetails } from '@/types/escrow.types';

const RideBooking: React.FC = () => {
  const {
    walletState,
    connectWallet,
    depositForRide,
    transactions,
  } = useEscrow();

  const [rideDetails, setRideDetails] = useState<RideDetails>({
    pickupLocation: '',
    destination: '',
    estimatedFare: ethers.parseEther('0.01'), // Default 0.01 ETH
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRideDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const fareInEth = e.target.value;
      const fareInWei = ethers.parseEther(fareInEth);
      setRideDetails(prev => ({ ...prev, estimatedFare: fareInWei }));
      setError(null);
    } catch (err) {
      setError('Invalid fare amount');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletState.isConnected) {
      await connectWallet();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await depositForRide(rideDetails.estimatedFare);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book ride');
    } finally {
      setIsLoading(false);
    }
  };

  const isPending = Object.values(transactions).some(tx => tx.status === 'pending');

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Book a Ride</h2>

      {!walletState.isConnected && (
        <button
          onClick={connectWallet}
          disabled={walletState.isConnecting}
          className="w-full mb-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
          <input
            type="text"
            name="pickupLocation"
            value={rideDetails.pickupLocation}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <input
            type="text"
            name="destination"
            value={rideDetails.destination}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fare (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={ethers.formatEther(rideDetails.estimatedFare)}
            onChange={handleFareChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading || isPending || !walletState.isConnected}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading || isPending ? 'Processing...' : 'Book Ride'}
        </button>
      </form>
    </div>
  );
};

export default RideBooking;