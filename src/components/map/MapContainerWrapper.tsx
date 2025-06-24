import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvent, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { Driver, RideRequest } from '@/types/ride';
import UserLocationMarker from './UserLocationMarker';
import DriverMarker from './DriverMarker';
import { getRoute, decodePolyline } from '@/utils/locationServices';

interface MapClickEvent {
  latlng: {
    lat: number;
    lng: number;
  };
}

interface MapContainerWrapperProps {
  mapCenter: LatLngExpression | null;
  userPosition: LatLngExpression | null;
  pickup: LatLngExpression | null;
  destination: LatLngExpression | null;
  drivers: Driver[];
  rideRequest: RideRequest | null;
  showDrivers: boolean;
  handleMapClick: (e: MapClickEvent) => void;
  handleDriverSelect: (driver: Driver) => void;
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
  const [route, setRoute] = React.useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickup || !destination) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await getRoute(pickup, destination);
        if (response?.routes?.[0]?.geometry) {
          const decodedRoute = decodePolyline(response.routes[0].geometry);
          setRoute(decodedRoute);
        } else {
          setError('No route found');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        setError('Failed to fetch route');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [pickup, destination]);

  if (!pickup || !destination || route.length === 0) return null;

  if (error) {
    return (
      <div className="absolute top-2 left-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-[1000]">
        {error}
      </div>
    );
  }

  return (
    <Polyline
      positions={route}
      color="#3B82F6"
      weight={5}
      opacity={isLoading ? 0.5 : 1}
    />
  );
};

interface MapContainerWrapperProps {
  mapCenter: LatLngExpression | null;
  userPosition: LatLngExpression | null;
  pickup: LatLngExpression | null;
  destination: LatLngExpression | null;
  drivers: Driver[];
  rideRequest: RideRequest | null;
  showDrivers: boolean;
  handleMapClick: (e: MapClickEvent) => void;
  handleDriverSelect: (driver: Driver) => void;
  className?: string;
}

const MapContainerWrapper: React.FC<MapContainerWrapperProps> = ({
  mapCenter,
  userPosition,
  pickup,
  destination,
  drivers,
  rideRequest,
  showDrivers,
  handleMapClick,
  handleDriverSelect,
  className = '',
}) => {
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Debugging logs
  console.log('MapContainerWrapper - mapCenter:', mapCenter);
  console.log('MapContainerWrapper - userPosition:', userPosition);
  console.log('MapContainerWrapper - pickup:', pickup);
  console.log('MapContainerWrapper - destination:', destination);
  console.log('MapContainerWrapper - drivers count:', drivers?.length);

  if (!mapCenter) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-gray-50 ${className}`}>
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 z-[1000] rounded">
          <div className="text-red-700 p-4">
            <h3 className="font-semibold mb-2">Map Error</h3>
            <p>{mapError}</p>
            <button
              onClick={() => setMapError(null)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <MapContainer
          center={mapCenter || [51.505, -0.09]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapClickHandler onClick={handleMapClick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              error: () =>
                setMapError(
                  'Failed to load map tiles. Please check your internet connection.',
                ),
            }}
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
                key={`driver-${driver.id}`}
                driver={driver}
                onSelect={() => handleDriverSelect(driver)}
              />
            ))}

          {/* Highlight selected driver if ride is matched */}
          {rideRequest?.driver && (
            <DriverMarker
              key={`selected-driver-${rideRequest.driver.id}`}
              driver={rideRequest.driver}
              onSelect={() => handleDriverSelect(rideRequest.driver)}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default MapContainerWrapper;
