import { StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Driver } from '@/types/ride';

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

type DriverCardProps = {
  driver: Driver;
  isSelected: boolean;
  onSelect: (driver: Driver) => void;
};

export default function DriverCard({
  driver,
  isSelected,
  onSelect,
}: DriverCardProps) {
  return (
    <div
      key={driver.id}
      onClick={() => onSelect(driver)}
      className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? 'border-green-300 bg-green-50 shadow-sm'
          : 'border-transparent bg-white hover:border-green-100 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start">
        <div
          className={`h-14 w-14 rounded-full flex items-center justify-center text-white font-medium text-base shadow-sm ${
            avatarColors[parseInt(driver.id) % avatarColors.length]
          } flex-shrink-0 ring-2 ring-white ring-offset-2 ${
            isSelected
              ? 'ring-green-200'
              : 'ring-gray-50 group-hover:ring-green-50'
          }`}
        >
          {driver.initials || getInitials(driver.name)}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-gray-900 text-base">
              {driver.name}
            </h3>
            {isSelected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Selected
              </span>
            )}
          </div>
          <div className="mt-2 space-y-2">
            {/* Car Information */}
            <div className="flex items-start">
              <div className="w-16 flex-shrink-0">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {driver.car || 'Not specified'}
                  {driver.carModel && driver.carModel !== driver.car && (
                    <span className="text-gray-500 ml-1">• {driver.carModel}</span>
                  )}
                </p>
                {driver.licensePlate && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-gray-100 text-gray-800">
                      {driver.licensePlate}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Driver Info */}
            <div className="flex items-start pt-1">
              <div className="w-16 flex-shrink-0">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {typeof driver.rating === 'number' 
                      ? driver.rating.toFixed(1) 
                      : driver.rating || 'N/A'}
                  </span>
                  <span className="mx-1 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    {typeof driver.eta === 'number' 
                      ? `${driver.eta} min` 
                      : driver.eta || 'ETA N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-4 pt-3 border-t border-green-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert(`Ride confirmed with ${driver.name}!`);
            }}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
          >
            <span>Confirm {driver.name.split(' ')[0]}</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}