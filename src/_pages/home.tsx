import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/providers/WalletProvider';
import Navbar from '@/components/layout/Navbar';
import LocationInput from '@/components/map/LocationInput';
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { userAccount, formatAddress = (addr: string) => addr } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get user's current location if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);

  const handleLocationSelect = (location: any, type: 'pickup' | 'dropoff') => {
    const locationData = {
      lat: location.lat,
      lon: location.lon,
      name: location.display_name,
    };
    
    if (type === 'pickup') {
      setPickup(locationData);
    } else {
      setDropoff(locationData);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isScrolled={isScrolled} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Select your destination</h1>
            {userAccount && (
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Connected: {formatAddress(userAccount)}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Plan a new ride</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <LocationInput
                    id="pickup"
                    placeholder="Enter pickup location"
                    userLocation={userLocation || undefined}
                    onSelect={(location) => handleLocationSelect(location, 'pickup')}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700 mb-1">
                    Drop-off Location
                  </label>
                  <LocationInput
                    id="dropoff"
                    placeholder="Enter destination"
                    userLocation={userLocation || undefined}
                    onSelect={(location) => handleLocationSelect(location, 'dropoff')}
                    className="w-full"
                  />
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      if (pickup && dropoff) {
                        setIsLoading(true);
                        navigate('/book-ride', {
                          state: {
                            pickup,
                            dropoff,
                            userLocation: userLocation || undefined
                          }
                        });
                      }
                    }}
                    disabled={!pickup || !dropoff || isLoading}
                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                      !pickup || !dropoff || isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isLoading ? (
                      'Finding rides...'
                    ) : (
                      <>
                        Book Ride <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>

                {(pickup || dropoff) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Selected Locations</h3>
                    {pickup && (
                      <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <MapPinIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Pickup:</p>
                          <p className="text-gray-600">{pickup.name}</p>
                        </div>
                      </div>
                    )}
                    {dropoff && (
                      <div className="flex items-start space-x-2 text-sm text-gray-700 mt-2">
                        <MapPinIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Drop-off:</p>
                          <p className="text-gray-600">{dropoff.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
