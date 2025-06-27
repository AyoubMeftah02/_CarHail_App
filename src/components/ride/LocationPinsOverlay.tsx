import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

type LocationPinsOverlayProps = {
  pickup: Location;
  dropoff: Location;
};

export default function LocationPinsOverlay({
  pickup,
  dropoff,
}: LocationPinsOverlayProps) {
  return (
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
              {pickup.name}
            </p>
            <p className="text-sm text-gray-500 truncate mt-1">
              {dropoff.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}