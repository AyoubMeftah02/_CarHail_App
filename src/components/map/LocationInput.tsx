import { useState, useEffect, useCallback, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

interface Location {
  name: string;
  street?: string;
  city?: string;
  country?: string;
  postcode?: string;
  lat: number;
  lon: number;
  osm_id: number;
  display_name: string;
  distance?: number;
}

interface LocationInputProps {
  placeholder?: string;
  userLocation?: { lat: number; lon: number };
  onSelect: (location: Location) => void;
  onMapCenter?: (lat: number, lon: number) => void;
  className?: string;
  id?: string;
  [key: string]: any; // Allow other HTML input props
}

const LocationInput: React.FC<LocationInputProps> = ({
  placeholder = 'Enter a location',
  userLocation,
  onSelect,
  onMapCenter,
  className = '',
  id,
  ...props
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchLocations = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=7`;
        
        if (userLocation) {
          url += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        const locations = data.features.map((feature: any) => ({
          name: feature.properties.name || '',
          street: feature.properties.street,
          city: feature.properties.city,
          country: feature.properties.country,
          postcode: feature.properties.postcode,
          lat: parseFloat(feature.geometry.coordinates[1]),
          lon: parseFloat(feature.geometry.coordinates[0]),
          osm_id: feature.properties.osm_id,
          display_name: feature.properties.name,
          distance: feature.properties.distance,
        }));

        setSuggestions(locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [userLocation]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      searchLocations.cancel();
    };
  }, [searchLocations]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length > 2) {
      searchLocations(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (location: Location) => {
    setSelected(location);
    setQuery(location.display_name);
    onSelect(location);
    
    if (onMapCenter) {
      onMapCenter(location.lat, location.lon);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Combobox value={selected} onChange={handleSelect}>
        {({ open }) => (
          <>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <Combobox.Input
                id={id}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                displayValue={(location: Location) => location?.display_name || ''}
                {...props}
              />
            </div>

            <Transition
              show={open && (isLoading || suggestions.length > 0)}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options 
                className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-96"
                static
              >
                {isLoading ? (
                  <div className="px-4 py-2 text-sm text-gray-700">Searching...</div>
                ) : (
                  suggestions.map((location) => (
                    <Combobox.Option
                      key={`${location.osm_id}-${location.lat}-${location.lon}`}
                      value={location}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                          active ? 'text-white bg-indigo-600' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            <MapPinIcon
                              className={`h-5 w-5 flex-shrink-0 ${
                                active ? 'text-white' : 'text-gray-400'
                              }`}
                              aria-hidden="true"
                            />
                            <div className="ml-3 truncate">
                              <p className={`text-sm ${selected ? 'font-semibold' : 'font-normal'}`}>
                                {location.name}
                              </p>
                              <p className={`text-xs ${active ? 'text-indigo-200' : 'text-gray-500'}`}>
                                {[location.street, location.city, location.country, location.postcode]
                                  .filter(Boolean)
                                  .join(', ')}
                                {location.distance && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    {Math.round(location.distance)}m away
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </>
        )}
      </Combobox>
    </div>
  );
};

export default LocationInput;
