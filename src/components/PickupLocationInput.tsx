import React, { useState, useEffect } from 'react';
import { type LatLngExpression } from 'leaflet';
import { geocodeLocation, sortSuggestionsByDistance, reverseGeocodeLocation } from '@/utils/mapUtils';

interface PickupLocationInputProps {
  pickup: LatLngExpression | null;
  setPickup: (location: LatLngExpression | null) => void;
  pickupQuery: string;
  setPickupQuery: (query: string) => void;
  userPosition?: LatLngExpression | null;
}

interface GeocodeSuggestion {
  lat: string;
  lon: string;
  display_name: string;
  distance?: number;
}

const PickupLocationInput: React.FC<PickupLocationInputProps> = ({
  setPickup,
  pickupQuery,
  setPickupQuery,
  userPosition,
}) => {
  const [pickupSuggestions, setPickupSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Geocode pickup
  // Effect for fetching suggestions based on user's current location when input is focused
  useEffect(() => {
    if (isFocused && userPosition && pickupQuery.length === 0) {
      const fetchReverseGeocode = async () => {
        const [lat, lon] = Array.isArray(userPosition)
          ? userPosition
          : [userPosition.lat, userPosition.lng];
        const suggestions = await reverseGeocodeLocation(lat, lon);
        if (suggestions.length > 0) {
          // Sort by distance, though for reverse geocode of current location, distance is ~0
          const sortedSuggestions = sortSuggestionsByDistance(suggestions, lat, lon);
          setPickupSuggestions(sortedSuggestions);
        } else {
          setPickupSuggestions([]);
        }
      };
      fetchReverseGeocode();
    }
  }, [isFocused, userPosition, pickupQuery]);

  // Geocode pickup based on typed query
  useEffect(() => {
    if (pickupQuery.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const suggestions = await geocodeLocation(pickupQuery);
      if (userPosition && suggestions.length > 0) {
        const [userLat, userLon] = Array.isArray(userPosition) 
          ? userPosition 
          : [userPosition.lat, userPosition.lng];
        const sortedSuggestions = sortSuggestionsByDistance(suggestions, userLat, userLon);
        setPickupSuggestions(sortedSuggestions);
      } else {
        setPickupSuggestions(suggestions);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [pickupQuery, userPosition]);

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
        onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay blur to allow click on suggestions
      />
      {pickupSuggestions.length > 0 && (
        <ul className="bg-white border rounded shadow max-h-40 overflow-y-auto mt-1 z-10">
          {pickupSuggestions.map((s, i) => (
            <li
              key={i}
              className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                setPickup([parseFloat(s.lat), parseFloat(s.lon)]);
                setPickupQuery(s.display_name);
                setPickupSuggestions([]);
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

export default PickupLocationInput;