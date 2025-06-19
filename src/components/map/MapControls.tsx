import React from 'react';
import { type LatLngExpression } from 'leaflet';
import PickupLocationInput from '@/components/inputs/PickupLocationInput';
import DestinationLocationInput from '@/components/inputs/DestinationLocationInput';
import { type RideRequest } from '@/types/ride';

interface FareDetails {
  distance: string;
  estimatedFare: string;
  platformFee: string;
  driverEarnings: string;
  duration: number;
}

interface MapControlsProps {
  setFareDetails: (fareDetails: FareDetails | null) => void;
  userAccount: string;
  pickup: LatLngExpression | null;
  setPickup: (latlng: LatLngExpression | null) => void;
  destination: LatLngExpression | null;
  setDestination: (latlng: LatLngExpression | null) => void;
  pickupQuery: string;
  setPickupQuery: (query: string) => void;
  destinationQuery: string;
  setDestinationQuery: (query: string) => void;
  fareDetails: FareDetails | null;
  requestRide: () => void;
  cancelRide: () => void;
  rideRequest: RideRequest | null;
  showDrivers: boolean;
  userPosition: LatLngExpression | null;
}

const MapControls: React.FC<MapControlsProps> = ({
  setFareDetails,
  userAccount,
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
  userPosition,
}) => {
  return (
    <div className="w-full md:w-1/2 mb-5 md:mb-0 md:pr-4 flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Welcome to ########
      </h1>
      <p className="text-sm text-gray-600 mb-3">
        Connected wallet: {userAccount}
      </p>
      {/* Location Name Inputs */}
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
      {/* Fare Estimate */}
      {fareDetails && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <div className="font-semibold text-yellow-700">Fare Estimate</div>
          <div>Distance: {fareDetails.distance} km</div>
          <div>
            Total Fare:{' '}
            <span className="font-mono">{fareDetails.estimatedFare} ETH</span>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={requestRide}
           className="py-1.5 px-3 text-sm font-medium bg-green-600 
           text-white rounded shadow hover:bg-green-700 transition-colors 
           duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          disabled={!pickup || !destination || !fareDetails || !!rideRequest}
        >
          Request Ride
        </button>
        {rideRequest && (
          <button
            onClick={cancelRide}
            className="w-full py-2.5 px-4 mt-4 text-base font-semibold bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <strong>Estimated Fare:</strong> {rideRequest.estimatedFare}
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
