import  { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useMapLogic from './MapLogic';
import MapControls from './MapControls';
import MapContainerWrapper from './MapContainerWrapper';  
import type { MapProps as MapPropsType } from '@/types/ride';

interface MapProps extends MapPropsType {
  className?: string;
}

/**
 * MapComp - Main map component for the decentralized ride-hailing application
 * Handles the integration of map controls, driver locations, and ride requests
 * 
 * @param userAccount - The connected wallet address of the user
 * @param className - Optional CSS class name for the map container
 */
const MapComp = ({ 
  userAccount, 
  className = '',
  pickup: propPickup,
  destination: propDestination,
  userLocation: propUserLocation 
}: MapProps) => {
  console.log('MapComp - Rendering with props:', {
    userAccount,
    propPickup,
    propDestination,
    propUserLocation,
    className
  });
  const location = useLocation();
  const locationState = location.state as {
    pickup?: any;
    destination?: any;
    pickupQuery?: string;
    destinationQuery?: string;
  } | undefined;

  // Initialize map logic with potential location state and props
  const {
    userPosition,
    mapCenter,
    locationError,
    isLocating,
    drivers,
    rideRequest,
    showDrivers,
    pickup: logicPickup,
    destination: logicDestination,
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
  } = useMapLogic({
    initialPickup: propPickup || locationState?.pickup || null,
    initialDestination: propDestination || locationState?.destination || null,
    initialPickupQuery: locationState?.pickupQuery || '',
    initialDestinationQuery: locationState?.destinationQuery || '',
  });
  
  // Debugging logs
  console.log('MapComp - propPickup:', propPickup);
  console.log('MapComp - propDestination:', propDestination);
  console.log('MapComp - propUserLocation:', propUserLocation);
  console.log('MapComp - mapCenter:', mapCenter);
  console.log('MapComp - userPosition:', userPosition);
  console.log('MapComp - logicPickup:', logicPickup);
  console.log('MapComp - logicDestination:', logicDestination);

  // Update map state when location state or props change
  useEffect(() => {
    // First check for props, then fall back to location state
    if (propPickup) {
      setPickup(propPickup);
    } else if (locationState?.pickup) {
      setPickup(locationState.pickup);
    }
    
    if (propDestination) {
      setDestination(propDestination);
    } else if (locationState?.destination) {
      setDestination(locationState.destination);
    }

    if (propUserLocation) {
      // Update user position if provided via props
      // Note: You might need to adjust this based on how userPosition is used in your app
    }

    // Handle query parameters from location state if needed
    if (locationState) {
      if (locationState.pickupQuery) setPickupQuery(locationState.pickupQuery);
      if (locationState.destinationQuery) setDestinationQuery(locationState.destinationQuery);
    }
  }, [
    locationState, 
    propPickup, 
    propDestination, 
    propUserLocation,
    setPickup, 
    setDestination, 
    setPickupQuery, 
    setDestinationQuery
  ]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Interactive map with markers and routes */}
      <MapContainerWrapper
        mapCenter={mapCenter}
        userPosition={userPosition}
        pickup={logicPickup}
        destination={logicDestination}
        showDrivers={showDrivers}
        drivers={drivers}
        rideRequest={rideRequest}
        handleMapClick={handleMapClick}
        handleDriverSelect={handleDriverSelect} 
      />
      
      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 z-[1000] max-w-xs w-full">
        <MapControls
          userAccount={userAccount}
          userPosition={userPosition}
          pickup={logicPickup}
          destination={logicDestination}
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
      </div>
    </div>
  );
};

export default MapComp;
