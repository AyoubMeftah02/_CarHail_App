import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type LatLngExpression } from 'leaflet';
import LocationInput from '@/components/map/LocationInput';

interface RideFormProps {
  initialPickup?: LatLngExpression | null;
  initialDestination?: LatLngExpression | null;
  initialPickupQuery?: string;
  initialDestinationQuery?: string;
  userPosition?: LatLngExpression | null;
  onSubmit?: (data: { pickup: LatLngExpression; destination: LatLngExpression }) => void;
  showSubmitButton?: boolean;
}

const RideForm: React.FC<RideFormProps> = ({
  initialPickup = null,
  initialDestination = null,
  initialPickupQuery = '',
  initialDestinationQuery = '',
  userPosition = null,
  onSubmit,
  showSubmitButton = true,
}) => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<LatLngExpression | null>(initialPickup);
  const [destination, setDestination] = useState<LatLngExpression | null>(initialDestination);
  const [pickupQuery, setPickupQuery] = useState(initialPickupQuery);
  const [destinationQuery, setDestinationQuery] = useState(initialDestinationQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!pickup || !destination) {
      setError('Please select both pickup and destination locations');
      return;
    }
    
    if (JSON.stringify(pickup) === JSON.stringify(destination)) {
      setError('Pickup and destination cannot be the same');
      return;
    }

    setError('');
    setIsLoading(true);

    if (onSubmit) {
      onSubmit({ pickup, destination });
    } else {
      // Navigate to home page with location state
      navigate('/home', {
        state: {
          pickup,
          destination,
          pickupQuery: pickupQuery || '',
          destinationQuery: destinationQuery || '',
        },
      });
    }
  };

  const handleReset = () => {
    setPickup(null);
    setDestination(null);
    setPickupQuery('');
    setDestinationQuery('');
    setError('');
  };

  const handlePickupSelect = (location: any) => {
    if (location) {
      setPickup([location.lat, location.lon]);
      setPickupQuery(location.display_name);
    }
  };

  const handleDestinationSelect = (location: any) => {
    if (location) {
      setDestination([location.lat, location.lon]);
      setDestinationQuery(location.display_name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
          <LocationInput
            placeholder="Enter pickup location"
            userLocation={userPosition ? { lat: userPosition[0], lng: userPosition[1] } : undefined}
            onSelect={handlePickupSelect}
            value={pickupQuery}
            onChange={(value: string) => setPickupQuery(value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <LocationInput
            placeholder="Enter destination"
            userLocation={userPosition ? { lat: userPosition[0], lng: userPosition[1] } : undefined}
            onSelect={handleDestinationSelect}
            value={destinationQuery}
            onChange={(value: string) => setDestinationQuery(value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          disabled={isLoading || (!pickup && !destination)}
        >
          Reset
        </button>
        
        {showSubmitButton && (
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            disabled={isLoading || !pickup || !destination}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Request Ride'
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default RideForm;
