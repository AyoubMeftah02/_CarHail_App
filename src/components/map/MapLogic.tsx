import React, { useState, useEffect, useCallback } from 'react';
import type { LatLngExpression } from 'leaflet';
import type { Driver, RideRequest } from '@/types/ride';
import { calculateFare, ratePerKm, platformFeeRate } from '@/utils/mapUtils';
import { getRoute } from '@/utils/locationServices';

interface MapLogicState {
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
  setUserPosition: React.Dispatch<
    React.SetStateAction<LatLngExpression | null>
  >;
  setMapCenter: React.Dispatch<React.SetStateAction<LatLngExpression | null>>;
  setLocationError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLocating: React.Dispatch<React.SetStateAction<boolean>>;
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  setRideRequest: React.Dispatch<React.SetStateAction<RideRequest | null>>;
  setShowDrivers: React.Dispatch<React.SetStateAction<boolean>>;
  setPickup: React.Dispatch<React.SetStateAction<LatLngExpression | null>>;
  setDestination: React.Dispatch<React.SetStateAction<LatLngExpression | null>>;
  setFareDetails: React.Dispatch<
    React.SetStateAction<{
      distance: string;
      estimatedFare: string;
      platformFee: string;
      driverEarnings: string;
      duration: number;
    } | null>
  >;
  setPickupQuery: React.Dispatch<React.SetStateAction<string>>;
  setDestinationQuery: React.Dispatch<React.SetStateAction<string>>;
  handleDriverSelect: (driver: Driver) => void;
  requestRide: () => void;
  cancelRide: () => void;
  handleMapClick: (e: { latlng: { lat: number; lng: number } }) => void;
}

const useMapLogic = (): MapLogicState => {
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(
    null,
  );
  const [mapCenter, setMapCenter] = useState<LatLngExpression | null>([
    51.505, -0.09,
  ]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [showDrivers, setShowDrivers] = useState<boolean>(false);
  const [pickup, setPickup] = useState<LatLngExpression | null>(null);
  const [destination, setDestination] = useState<LatLngExpression | null>(null);
  const [fareDetails, setFareDetails] = useState<{
    distance: string;
    estimatedFare: string;
    platformFee: string;
    driverEarnings: string;
    duration: number;
  } | null>(null);
  const [pickupQuery, setPickupQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');

  // Generate mock drivers around user location
  const generateMockDrivers = useCallback(
    (userPos: LatLngExpression): Driver[] => {
      const [userLat, userLng] = Array.isArray(userPos)
        ? userPos
        : [userPos.lat, userPos.lng];
      return [
        {
          id: '1',
          name: 'John Smith',
          position: [userLat + 0.005, userLng + 0.003],
          rating: 4.8,
          eta: 3,
          carModel: 'Toyota Camry',
          licensePlate: 'ABC-123',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          position: [userLat - 0.003, userLng + 0.007],
          rating: 4.9,
          eta: 5,
          carModel: 'Honda Civic',
          licensePlate: 'XYZ-789',
        },
        {
          id: '3',
          name: 'Mike Davis',
          position: [userLat + 0.008, userLng - 0.002],
          rating: 4.7,
          eta: 7,
          carModel: 'Nissan Altima',
          licensePlate: 'DEF-456',
        },
        {
          id: '4',
          name: 'Emily Chen',
          position: [userLat - 0.006, userLng - 0.005],
          rating: 4.9,
          eta: 4,
          carModel: 'Hyundai Elantra',
          licensePlate: 'GHI-321',
        },
      ];
    },
    [],
  );

  // Handle driver selection
  const handleDriverSelect = useCallback(
    (driver: Driver) => {
      if (!pickup || !destination || !fareDetails) return;
      const newRideRequest: RideRequest = {
        id: Date.now().toString(),
        status: 'matched',
        driver,
        estimatedFare: Number(fareDetails.estimatedFare),
        pickup,
        destination,
      };
      setRideRequest(newRideRequest);
      setShowDrivers(false);
    },
    [pickup, destination, fareDetails],
  );

  // Request a ride
  const requestRide = useCallback(() => {
    if (!userPosition) {
      alert('Please enable location first');
      return;
    }
    if (!pickup || !destination) {
      alert('Please select both pickup and destination locations');
      return;
    }
    if (!fareDetails) {
      alert('Fare calculation is required before requesting a ride');
      return;
    }

    const newRideRequest = {
      id: Date.now().toString(),
      pickup,
      destination,
      fare: fareDetails.estimatedFare,
      status: 'searching' as const,
      timestamp: new Date().toISOString(),
    };

    setRideRequest({
      id: newRideRequest.id,
      pickup: newRideRequest.pickup,
      destination: newRideRequest.destination,
      estimatedFare: Number(newRideRequest.fare),
      status: newRideRequest.status,
      timestamp: newRideRequest.timestamp,
    });
    setShowDrivers(true);
    const mockDrivers = generateMockDrivers(userPosition);
    setDrivers(mockDrivers);
  }, [userPosition, pickup, destination, fareDetails, generateMockDrivers]);

  // Cancel ride
  const cancelRide = useCallback(() => {
    setRideRequest(null);
    setShowDrivers(false);
    setDrivers([]);
  }, []);

  // Helper to check geolocation permission status (if supported)
  const checkGeolocationPermission = useCallback(async () => {
    if (navigator.permissions) {
      try {
        console.log('Checking geolocation permission...');
        const status = await navigator.permissions.query({
          name: 'geolocation',
        });
        console.log('Geolocation permission status:', status.state);
        if (status.state === 'denied') {
          setLocationError(
            'Location permission denied. Please enable it in your browser settings.',
          );
          return false;
        }
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
        setLocationError(
          'Unable to check location permissions. Proceeding with location request.',
        );
      }
    }
    return true;
  }, []);

  // Function to fetch user's location
  const getUserLocation = useCallback(async () => {
    console.log('Getting user location...');
    setIsLocating(true);
    setLocationError(null);
    const hasPermission = await checkGeolocationPermission();
    if (!hasPermission) {
      setIsLocating(false);
      return;
    }
    const slowFetchTimeout = setTimeout(() => {
      setLocationError(
        'Still fetching your location... Please wait or check your browser settings.',
      );
    }, 5000);
    // Try high accuracy first, then fallback to lower accuracy if needed
    const tryGetLocation = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(
            'Location obtained:',
            position.coords,
            'Accuracy:',
            position.coords.accuracy,
            'meters',
          );
          clearTimeout(slowFetchTimeout);
          const newPos: LatLngExpression = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserPosition(newPos);
          setMapCenter(newPos);
          setLocationError(null);
          setIsLocating(false);

          // Generate mock drivers around user location
          const mockDrivers = generateMockDrivers(newPos);
          setDrivers(mockDrivers);
        },
        (error) => {
          console.error('Error getting location:', error);
          clearTimeout(slowFetchTimeout);

          // If high accuracy failed, try with lower accuracy
          if (
            highAccuracy &&
            (error.code === error.TIMEOUT ||
              error.code === error.POSITION_UNAVAILABLE)
          ) {
            console.log('High accuracy failed, trying with lower accuracy...');
            tryGetLocation(false);
            return;
          }

          let errorMessage = 'Error getting your location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                'Location access denied. Please enable location permissions.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage +=
                'Location information unavailable. Please check your GPS/network.';
              break;
            default:
              errorMessage += 'Unknown error occurred.';
          }

          setLocationError(errorMessage + ' Displaying default location.');
          setMapCenter([51.505, -0.09]); // Fallback to default location
          setIsLocating(false);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 15000 : 10000,
          maximumAge: highAccuracy ? 0 : 60000,
        },
      );
    };

    tryGetLocation(true);
  }, [checkGeolocationPermission, generateMockDrivers]);

  // Initial location fetch
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Calculate fare when pickup or destination changes
  useEffect(() => {
    if (pickup && destination) {
      const fetchRouteAndCalculateFare = async () => {
        try {
          const response = await getRoute(pickup, destination);
          if (response?.routes?.[0]) {
            const { distance, duration } = response.routes[0];
            const distanceInKm = distance / 1000; // Convert meters to kilometers
            const rawFare = distanceInKm * ratePerKm;
            const platformFee = rawFare * platformFeeRate;
            const driverEarnings = rawFare - platformFee;

            setFareDetails({
              distance: distanceInKm.toFixed(2),
              estimatedFare: rawFare.toFixed(6),
              platformFee: platformFee.toFixed(6),
              driverEarnings: driverEarnings.toFixed(6),
              duration: Math.ceil(duration / 60), // Convert seconds to minutes
            });
          }
        } catch (error) {
          console.error('Error calculating fare:', error);
          setFareDetails(null);
        }
      };

      fetchRouteAndCalculateFare();
    } else {
      setFareDetails(null);
    }
  }, [pickup, destination]);

  // Handle map click
  const handleMapClick = useCallback(
    (e: { latlng: { lat: number; lng: number } }) => {
      if (!pickup) {
        setPickup([e.latlng.lat, e.latlng.lng]);
      } else if (!destination) {
        setDestination([e.latlng.lat, e.latlng.lng]);
      }
    },
    [pickup, destination],
  );

  return {
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
    setUserPosition,
    setMapCenter,
    setLocationError,
    setIsLocating,
    setDrivers,
    setRideRequest,
    setShowDrivers,
    setPickup,
    setDestination,
    setFareDetails,
    setPickupQuery,
    setDestinationQuery,
    handleDriverSelect,
    requestRide,
    cancelRide,
    handleMapClick,
  };
};

export default useMapLogic;
