import React from 'react';
import { MapContainer } from 'react-leaflet';
import useMapLogic from './MapLogic';
import MapControls from './MapControls';
import MapContainerWrapper from './MapContainerWrapper';
import type { MapProps } from '@/types/ride';

/**
 * MapComp - Main map component for the decentralized ride-hailing application
 * Handles the integration of map controls, driver locations, and ride requests
 * 
 * @param userAccount - The connected wallet address of the user
 */
const MapComp = ({ userAccount }: MapProps) => {
  // Custom hook that manages all map-related state and logic
  const {
    userPosition,
    mapCenter,
    locationError,
    isLocating,
    drivers,
    rideRequest,
    showDrivers,
    pickup,
    destination,
    fareDetails,
    pickupQuery,
    destinationQuery,
    setPickup,
    setDestination,
    setFareDetails,
    setPickupQuery,
    setDestinationQuery,
    handleDriverSelect,
    requestRide,
    cancelRide,
    handleMapClick,
  } = useMapLogic();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full p-5 box-border bg-gray-50">
      {/* Left panel: Controls for ride booking and fare estimation */}
      <MapControls
        userAccount={userAccount}
        userPosition={userPosition}
        pickup={pickup}
        destination={destination}
        fareDetails={fareDetails}
        pickupQuery={pickupQuery}
        setPickupQuery={setPickupQuery}
        destinationQuery={destinationQuery}
        setDestinationQuery={setDestinationQuery}
        requestRide={requestRide}
        cancelRide={cancelRide}
        rideRequest={rideRequest}
        showDrivers={showDrivers}
        setPickup={setPickup}
        setDestination={setDestination}
        setFareDetails={setFareDetails}
      />
      
      {/* Right panel: Interactive map with markers and routes */}
      <MapContainerWrapper
        mapCenter={mapCenter}
        userPosition={userPosition}
        pickup={pickup}
        destination={destination}
        showDrivers={showDrivers}
        drivers={drivers}
        rideRequest={rideRequest}
        handleMapClick={handleMapClick}
        handleDriverSelect={handleDriverSelect} 
      />
    </div>
  );
};

export default MapComp;
