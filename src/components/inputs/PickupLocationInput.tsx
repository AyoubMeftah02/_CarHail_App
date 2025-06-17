import React, { useState, useEffect } from 'react';
import { type LatLngExpression } from 'leaflet';
import { searchLocation, type PhotonFeature } from '@/utils/locationServices';

interface PickupLocationInputProps {
  pickup: LatLngExpression | null;
  setPickup: (location: LatLngExpression | null) => void;
  pickupQuery: string;
  setPickupQuery: (query: string) => void;
  userPosition?: LatLngExpression | null;
}

const PickupLocationInput: React.FC<PickupLocationInputProps> = ({
  setPickup,
  pickupQuery,
  setPickupQuery,
  userPosition,
}) => {
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Effect for fetching suggestions based on user's current location when input is focused
  useEffect(() => {
    if (isFocused && userPosition && pickupQuery.length === 0) {
      const [lat, lon] = Array.isArray(userPosition)
        ? userPosition
        : [userPosition.lat, userPosition.lng];
      
      searchLocation('', lat, lon).then(setSuggestions);
    }
  }, [isFocused, userPosition, pickupQuery]);

  // Effect for fetching suggestions based on typed query
  useEffect(() => {
    if (pickupQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const [lat, lon] = userPosition
        ? (Array.isArray(userPosition)
            ? userPosition
            : [userPosition.lat, userPosition.lng])
        : [undefined, undefined];
      
      const results = await searchLocation(pickupQuery, lat, lon);
      setSuggestions(results);
    }, 400);

    return () => clearTimeout(timeout);
  }, [pickupQuery, userPosition]);

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
      <label className="font-semibold">Pickup Location:</label>
      <input
        className="border rounded px-2 py-1 w-full mt-1"
        type="text"
        placeholder="Enter pickup location"
        value={pickupQuery}
        onChange={(e) => setPickupQuery(e.target.value)}
        autoComplete="off"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
      />
      {suggestions.length > 0 && (
        <ul className="bg-white border rounded shadow max-h-40 overflow-y-auto mt-1 z-10">
          {suggestions.map((suggestion, i) => (
            <li
              key={i}
              className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                const [lng, lat] = suggestion.geometry.coordinates;
                setPickup([lat, lng]);
                setPickupQuery(formatSuggestion(suggestion));
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

export default PickupLocationInput;