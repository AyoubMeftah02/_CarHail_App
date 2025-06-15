import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useMapEvent } from 'react-leaflet';
import { type LatLngExpression } from 'leaflet';
import type { Driver, RideRequest, MapProps } from '@/types/ride-types';
import UserLocationMarker from './UserLocationMarker';
import DriverMarker from './DriverMarker';
import PickupLocationInput from './PickupLocationInput';
import DestinationLocationInput from './DestinationLocationInput';
import { calculateFare } from '@/utils/mapUtils';
import { Polyline } from 'react-leaflet';

interface MapClickEvent {
  latlng: {
    lat: number;
    lng: number;
  };
}

const MapClickHandler = ({
  onClick,
}: {
  onClick: (e: MapClickEvent) => void;
}) => {
  useMapEvent('click', onClick);
  return null;
};

// RouteLine component for displaying route between pickup and destination
const RouteLine = ({
  pickup,
  destination,
}: {
  pickup: LatLngExpression;
  destination: LatLngExpression;
}) => {
  if (!pickup || !destination) return null;
  return (
    <Polyline positions={[pickup, destination]} color="#3B82F6" weight={5} />
  );
};

const MapComp = ({ userAccount }: MapProps) => {
  console.log('MapComp rendering. Initial state:', { userAccount });
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(
    null,
  );
  const [mapCenter, setMapCenter] = useState<LatLngExpression | null>([
    51.505, -0.09,
  ]); // Default to London
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
  } | null>(null);
  const [pickupQuery, setPickupQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');

  // Generate mock drivers around user location
  const generateMockDrivers = (userPos: LatLngExpression): Driver[] => {
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
  };

  // Handle driver selection
  const handleDriverSelect = (driver: Driver) => {
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
  };

  // Request a ride
  const requestRide = () => {
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

    // Create ride request
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
  };

  // Cancel ride
  const cancelRide = () => {
    setRideRequest(null);
    setShowDrivers(false);
    setDrivers([]);
  };

  // Helper to check geolocation permission status (if supported)
  const checkGeolocationPermission = async () => {
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
  };

  // Function to fetch user's location
  const getUserLocation = async () => {
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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained:', position.coords);
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
        setLocationError(
          'Error getting your location. Please ensure location services are enabled and permissions are granted. Displaying default location.',
        );
        setMapCenter([51.505, -0.09]); // Fallback to default location
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Initial location fetch
  useEffect(() => {
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // In map.tsx, useEffect for calculating fare when pickup or destination changes:
  useEffect(() => {
    if (pickup && destination) {
      const details = calculateFare(pickup, destination); // calculateFare now returns the full fare breakdown
      setFareDetails(details);
    } else {
      setFareDetails(null);
    }
  }, [pickup, destination]);

  // For map click, use MapContainer's event system:
  const handleMapClick = (e: MapClickEvent) => {
    if (!pickup) {
      setPickup([e.latlng.lat, e.latlng.lng]);
    } else if (!destination) {
      setDestination([e.latlng.lat, e.latlng.lng]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full p-5 box-border bg-gray-50">
      {/* Left side: controls and info */}
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
        <button
          onClick={requestRide}
          className="py-3 px-6 mt-2 text-lg font-bold bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!pickup || !destination || !fareDetails || !!rideRequest}
        >
          Request Ride
        </button>

        {/* Ride Status Display */}
        {rideRequest && (
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
      {/* Right side: map */}
      <div className="w-full md:w-1/2 h-[400px] md:h-[600px] relative">
        {mapCenter ? (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="h-full w-full rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <MapClickHandler onClick={handleMapClick} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <UserLocationMarker position={userPosition} />

            {/* Show pickup/destination markers */}
            {pickup && <UserLocationMarker position={pickup} />}
            {destination && <UserLocationMarker position={destination} />}

            {/* Route polyline */}
            {pickup && destination && (
              <RouteLine pickup={pickup} destination={destination} />
            )}

            {/* Show driver markers when searching for rides or when a ride is matched */}
            {(showDrivers || rideRequest) &&
              drivers.map((driver) => (
                <DriverMarker
                  key={driver.id}
                  driver={driver}
                  onSelect={handleDriverSelect}
                />
              ))}

            {/* Highlight selected driver if ride is matched */}
            {rideRequest && rideRequest.driver && (
              <DriverMarker driver={rideRequest.driver} onSelect={() => {}} />
            )}
          </MapContainer>
        ) : (
          <div className="flex justify-center items-center h-full bg-gray-100 text-gray-700 rounded-lg">
            <p className="p-5 text-center text-base">
              {isLocating
                ? 'Attempting to fetch your location...'
                : locationError
                  ? locationError
                  : 'Click "Get My Location" to try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComp;
