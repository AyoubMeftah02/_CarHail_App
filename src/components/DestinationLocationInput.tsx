import React, { useState, useEffect } from 'react';
import { type LatLngExpression } from 'leaflet';
import { geocodeLocation, sortSuggestionsByDistance } from '@/utils/mapUtils';

interface DestinationLocationInputProps {
  destination: LatLngExpression | null;
  setDestination: (location: LatLngExpression | null) => void;
  destinationQuery: string;
  setDestinationQuery: (query: string) => void;
  userPosition?: LatLngExpression | null;
}

interface GeocodeSuggestion {
  lat: string;
  lon: string;
  display_name: string;
  distance?: number;
}

const DestinationLocationInput: React.FC<DestinationLocationInputProps> = ({
  setDestination,
  destinationQuery,
  setDestinationQuery,
  userPosition,
}) => {
  const [destinationSuggestions, setDestinationSuggestions] = useState<GeocodeSuggestion[]>([]);

  // Geocode destination
  useEffect(() => {
    if (destinationQuery.length < 3) {
      setDestinationSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const suggestions = await geocodeLocation(destinationQuery);
      if (userPosition && suggestions.length > 0) {
        const [userLat, userLon] = Array.isArray(userPosition) 
          ? userPosition 
          : [userPosition.lat, userPosition.lng];
        const sortedSuggestions = sortSuggestionsByDistance(suggestions, userLat, userLon);
        setDestinationSuggestions(sortedSuggestions);
      } else {
        setDestinationSuggestions(suggestions);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [destinationQuery, userPosition]);

  return (
    <div>
      <label className="font-semibold">Destination Location:</label>
      <input
        className="border rounded px-2 py-1 w-full mt-1"
        type="text"
        placeholder="Enter destination location"
        value={destinationQuery}
        onChange={(e) => setDestinationQuery(e.target.value)}
        autoComplete="off"
      />
      {destinationSuggestions.length > 0 && (
        <ul className="bg-white border rounded shadow max-h-40 overflow-y-auto mt-1 z-10">
          {destinationSuggestions.map((s, i) => (
            <li
              key={i}
              className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                setDestination([parseFloat(s.lat), parseFloat(s.lon)]);
                setDestinationQuery(s.display_name);
                setDestinationSuggestions([]);
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DestinationLocationInput;