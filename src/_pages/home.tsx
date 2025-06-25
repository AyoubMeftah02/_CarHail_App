import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../providers/WalletProvider';
import Navbar from '../components/layout/Navbar';
import LocationInput from '../components/map/LocationInput';
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { loadDriversFromFile } from '../utils/driverVerification';

const Home = () => {
  const { userAccount, formatAddress = (addr: string) => addr } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pickup, setPickup] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBookRide = async () => {
    if (!pickup || !dropoff) return;
    
    setIsLoading(true);
    
    try {
      // Load drivers from the JSON file
      const drivers = loadDriversFromFile();
      
      // Filter for verified drivers only
      const verifiedDrivers = drivers.filter(driver => driver.verified === true);
      
      if (verifiedDrivers.length === 0) {
        // No verified drivers available
        setError('No verified drivers available right now. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      // Navigate to book-ride with the verified drivers
      navigate('/book-ride', {
        state: {
          pickup,
          dropoff,
          userLocation: userLocation || undefined,
          drivers: verifiedDrivers
        }
      });
    } catch (error) {
      console.error('Error loading drivers:', error);
      setError('Failed to load available drivers. Please try again.');
      setIsLoading(false);
    }
  };

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

                <div className="mt-6 space-y-4">
                  <button
                    onClick={handleBookRide}
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
                  
                  {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
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
