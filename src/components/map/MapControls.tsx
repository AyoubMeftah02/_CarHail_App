import React from 'react';
import { type LatLngExpression } from 'leaflet';
import PickupLocationInput from '@/components/inputs/PickupLocationInput';
import DestinationLocationInput from '@/components/inputs/DestinationLocationInput';
import { type RideRequest } from '@/types/ride';

/**
 * FareDetails interface for ride cost breakdown
 */
interface FareDetails {
  distance: string;
  estimatedFare: string;
  platformFee: string;
  driverEarnings: string;
  duration: number;
}

/**
 * Props interface for MapControls component
 */
interface MapControlsProps {
  userAccount: string;
  userPosition: LatLngExpression | null;
  pickup: LatLngExpression | null;
  setPickup: (latlng: LatLngExpression | null) => void;
  destination: LatLngExpression | null;
  setDestination: (latlng: LatLngExpression | null) => void;
  pickupQuery: string;
  setPickupQuery: (query: string) => void;
  destinationQuery: string;
  setDestinationQuery: (query: string) => void;
  fareDetails: FareDetails | null;
  setFareDetails: (fareDetails: FareDetails | null) => void;
  requestRide: () => void;
  cancelRide: () => void;
  rideRequest: RideRequest | null;
  showDrivers: boolean;
}

/**
 * MapControls - Component for handling ride booking controls and fare estimation
 * Provides interface for users to input locations, view fare estimates, and manage ride requests
 */
const MapControls: React.FC<MapControlsProps> = ({
  setFareDetails,
  userAccount,
  userPosition,
  pickup,
  setPickup,
  destination,
  setDestination,
  pickupQuery,
  setPickupQuery,
  destinationQuery,
  setDestinationQuery,
  fareDetails,
  requestRide,
  cancelRide,
  rideRequest,
  showDrivers,
}) => {
  return (
    <div className="w-full md:w-1/2 mb-5 md:mb-0 md:pr-4 flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Welcome to ########
      </h1>
      <p className="text-sm text-gray-600 mb-3">
        Connected wallet: {userAccount}
      </p>
      
      {/* Location Input Section */}
      <div className="flex flex-col gap-2 mb-3">
        <PickupLocationInput
          pickup={pickup}
          setPickup={setPickup}
          pickupQuery={pickupQuery}
          setPickupQuery={setPickupQuery}
          userPosition={userPosition}
        />
        <DestinationLocationInput
          destination={destination}
          setDestination={setDestination}
          destinationQuery={destinationQuery}
          setDestinationQuery={setDestinationQuery}
          userPosition={userPosition}
        />
        <button
          className="py-1 px-3 bg-gray-200 rounded text-xs w-fit"
          onClick={() => {
            setPickup(null);
            setDestination(null);
            setFareDetails(null);
            setPickupQuery('');
            setDestinationQuery('');
          }}
          disabled={!pickup && !destination}
        >
          Reset Points
        </button>
      </div>

      {/* Fare Estimate Section */}
      {fareDetails && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <div className="font-semibold text-yellow-700">Fare Estimate</div>
          <div>Distance: {fareDetails.distance} km</div>
          <div>
            Total Fare:{' '}
            <span className="font-mono">{fareDetails.estimatedFare} ETH</span>
          </div>
          <div className="text-sm text-yellow-600 mt-1">
            Platform Fee: {fareDetails.platformFee} ETH
          </div>
          <div className="text-sm text-yellow-600">
            Driver Earnings: {fareDetails.driverEarnings} ETH
          </div>
          <div className="text-sm text-yellow-600">
            Estimated Duration: {fareDetails.duration} minutes
          </div>
        </div>
      )}

      {/* Ride Request Controls */}
      <div className="flex gap-2">
        <button
          onClick={requestRide}
          className="flex-1 py-3 px-6 mt-2 text-lg font-bold bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!pickup || !destination || !fareDetails || !!rideRequest}
        >
          Request Ride
        </button>
        {rideRequest && (
          <button
            onClick={cancelRide}
            className="py-3 px-6 mt-2 text-lg font-bold bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Ride Status Display */}
      {rideRequest &&
        (rideRequest.status === 'matched' ||
          rideRequest.status === 'searching') && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Ride Matched!</h3>
            <div className="text-sm text-green-700">
              <p>
                <strong>Driver:</strong> {rideRequest.driver?.name}
              </p>
              <p>
                <strong>Vehicle:</strong> {rideRequest.driver?.carModel} (
                {rideRequest.driver?.licensePlate})
              </p>
              <p>
                <strong>Rating:</strong> {rideRequest.driver?.rating}/5.0
              </p>
              <p>
                <strong>ETA:</strong> {rideRequest.driver?.eta} minutes
              </p>
              <p>
                <strong>Estimated Fare:</strong> {rideRequest.estimatedFare} ETH
              </p>
            </div>
          </div>
        )}

      {/* Driver Search Status */}
      {showDrivers && !rideRequest && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold">
            Searching for nearby drivers...
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Click on a driver marker to select them!
          </p>
        </div>
      )}
    </div>
  );
};

export default MapControls;
