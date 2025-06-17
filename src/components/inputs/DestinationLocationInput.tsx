import React, { useState, useEffect } from 'react';
import { type LatLngExpression } from 'leaflet';
import { searchLocation, type PhotonFeature } from '@/utils/locationServices';

interface DestinationLocationInputProps {
  destination: LatLngExpression | null;
  setDestination: (location: LatLngExpression | null) => void;
  destinationQuery: string;
  setDestinationQuery: (query: string) => void;
  userPosition?: LatLngExpression | null;
}

const DestinationLocationInput: React.FC<DestinationLocationInputProps> = ({
  setDestination,
  destinationQuery,
  setDestinationQuery,
  userPosition,
}) => {
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);

  // Effect for fetching suggestions based on typed query
  useEffect(() => {
    if (destinationQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const [lat, lon] = userPosition
        ? (Array.isArray(userPosition)
            ? userPosition
            : [userPosition.lat, userPosition.lng])
        : [undefined, undefined];
      
      const results = await searchLocation(destinationQuery, lat, lon);
      setSuggestions(results);
    }, 400);

    return () => clearTimeout(timeout);
  }, [destinationQuery, userPosition]);

  const formatSuggestion = (feature: PhotonFeature): string => {
    const { properties } = feature;
    const parts = [
      properties.street,
      properties.housenumber,
      properties.postcode,
      properties.city,
      properties.state,
      properties.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  };

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
      {suggestions.length > 0 && (
        <ul className="bg-white border rounded shadow max-h-40 overflow-y-auto mt-1 z-10">
          {suggestions.map((suggestion, i) => (
            <li
              key={i}
              className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                const [lng, lat] = suggestion.geometry.coordinates;
                setDestination([lat, lng]);
                setDestinationQuery(formatSuggestion(suggestion));
                setSuggestions([]);
              }}
            >
              {formatSuggestion(suggestion)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DestinationLocationInput;