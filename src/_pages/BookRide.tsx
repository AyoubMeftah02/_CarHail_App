import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { LatLngExpression } from 'leaflet';
import Navbar from '@/components/layout/Navbar';
import MapComp from '@/components/map/Map';
import { useWallet } from '@/providers/WalletProvider';
import type { Driver } from '@/types/ride';
import { loadVerifiedDrivers } from '@/utils/driverVerification';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

// Avatar colors for driver avatars
const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-indigo-500',
];

// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const BookRide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userAccount } = useWallet();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Load drivers from the verified_drivers key in localStorage
  const loadDrivers = async (): Promise<Driver[]> => {
    try {
      setIsLoading(true);
      // Get all drivers from the verified_drivers key
      const allDrivers: Driver[] = loadVerifiedDrivers();
      // Filter for verified drivers and add any missing required fields
      const verifiedDrivers: Driver[] = allDrivers
        .filter(
          (driver): driver is Driver & { verified: true } => !!driver.verified,
        )
        .map((driver: Driver) => ({
          ...driver,
          price: driver.price || '0.005 ETH',
          eta:
            typeof driver.eta === 'number'
              ? `${driver.eta} min`
              : driver.eta || '5 min',
          image:
            driver.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`,
          initials: driver.initials || getInitials(driver.name),
          position: driver.position || ([51.505, -0.09] as LatLngExpression),
          car: driver.car || driver.carModel || 'Car',
        }));
      setDrivers(verifiedDrivers);
      if (verifiedDrivers.length === 1) {
        setSelectedDriver(verifiedDrivers[0]);
      }
      return verifiedDrivers;
    } catch (error) {
      console.error('Error loading drivers:', error);
      setDrivers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh drivers list
  const refreshDrivers = async () => {
    await loadDrivers();
  };

  // Load drivers on component mount
  useEffect(() => {
    loadDrivers();
  }, []);

  // Get location data from navigation state
  const { pickup, dropoff, userLocation } = location.state as {
    pickup: Location;
    dropoff: Location;
    userLocation?: { lat: number; lon: number };
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Filter drivers based on search query
  const filteredDrivers = searchQuery
    ? drivers.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.carModel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.licensePlate
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : drivers;

  // Set default map center to first driver's position or default location
  const defaultMapCenter: LatLngExpression =
    filteredDrivers.length > 0 && filteredDrivers[0].position
      ? filteredDrivers[0].position
      : [51.505, -0.09];

  // Debugging logs
  console.log('BookRide - pickup:', pickup);
  console.log('BookRide - dropoff:', dropoff);
  console.log('BookRide - userLocation:', userLocation);
  console.log('BookRide - filteredDrivers count:', filteredDrivers.length);

  // Show message if no verified drivers are available
  const noDriversAvailable = drivers.length === 0;

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    // In a real app, you would confirm the ride with the selected driver
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header with back button and trip summary */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="ml-4 flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                Available Rides
              </h1>
              {pickup && dropoff && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="truncate">{pickup.name}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 mx-1.5 flex-shrink-0" />
                  <span className="truncate">{dropoff.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-120px)] bg-gray-50">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Driver Selection */}
          <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Choose your driver
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredDrivers.length}{' '}
                    {filteredDrivers.length === 1 ? 'driver' : 'drivers'}{' '}
                    available
                  </p>
                </div>
                <button
                  onClick={refreshDrivers}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Refresh drivers"
                  disabled={isLoading}
                >
                  <ArrowPathIcon
                    className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {filteredDrivers.length}{' '}
                {filteredDrivers.length === 1 ? 'driver' : 'drivers'}
              </span>
            </div>

            {/* Drivers list container with scroll */}
            <div className="overflow-y-auto h-[calc(100vh-180px)] pr-2">
              {!isLoading && drivers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No drivers are currently available. Please try again later.
                </div>
              ) : drivers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No drivers match your search.
                </div>
              ) : isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-100 rounded-xl p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {filteredDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      onClick={() => handleSelectDriver(driver)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedDriver?.id === driver.id
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-white border border-gray-100 hover:border-green-100'
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                            avatarColors[
                              parseInt(driver.id) % avatarColors.length
                            ]
                          } flex-shrink-0`}
                        >
                          {driver.initials}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {driver.name}
                            </h3>
                            <div className="flex items-center bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              <StarIcon className="h-3 w-3 mr-1" />
                              <span>{driver.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {driver.car}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span>{driver.eta} away</span>
                            </div>
                            <span className="text-base font-bold text-green-600">
                              {driver.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedDriver?.id === driver.id && (
                        <div className="mt-3 pt-3 border-t border-green-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(
                                `Ride confirmed with ${selectedDriver.name}!`,
                              );
                            }}
                            className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            <span>Confirm {driver.name}</span>
                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Map */}
          <div
            className="flex-1 relative bg-gray-100"
            style={{ height: 'calc(100vh - 120px)' }}
          >
            {userAccount ? (
              <div className="absolute inset-0 w-full h-full z-0">
                <MapComp
                  userAccount={userAccount}
                  className="w-full h-full"
                  pickup={pickup ? [pickup.lat, pickup.lon] : null}
                  destination={dropoff ? [dropoff.lat, dropoff.lon] : null}
                  userLocation={
                    userLocation ? [userLocation.lat, userLocation.lon] : null
                  }
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0">
                <p className="text-gray-600">Connecting to wallet...</p>
              </div>
            )}

            {/* Location Pins Overlay */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 max-w-xs">
                <div className="flex items-start space-x-2">
                  <div className="flex flex-col items-center pt-0.5">
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                    <div className="w-px h-4 bg-gray-300 my-0.5"></div>
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pickup?.name || 'Pickup location'}
                    </p>
                    <div className="h-4 flex items-center justify-center">
                      <div className="w-px h-full bg-gray-300"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {dropoff?.name || 'Drop-off location'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Selection Card */}
            {selectedDriver && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                          avatarColors[
                            parseInt(selectedDriver.id) % avatarColors.length
                          ]
                        } flex-shrink-0`}
                      >
                        {selectedDriver.initials}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedDriver.name}
                          </h3>
                          <div className="flex items-center bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            <StarIcon className="h-3 w-3 mr-1" />
                            <span>{selectedDriver.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {selectedDriver.car}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                            <span>{selectedDriver.eta} away</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {selectedDriver.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedDriver(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Change Driver
                    </button>
                    <button
                      onClick={() =>
                        alert(`Ride confirmed with ${selectedDriver.name}!`)
                      }
                      className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <span>Confirm Ride</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookRide;
