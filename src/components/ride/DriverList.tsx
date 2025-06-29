import { ArrowPathIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Driver } from '@/types/ride';
import DriverCard from './DriverCard';

type DriverListProps = {
  drivers: Driver[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDriver: Driver | null;
  onSelectDriver: (driver: Driver) => void;
  onRefresh: () => void;
};

export default function DriverList({
  drivers,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedDriver,
  onSelectDriver,
  onRefresh,
}: DriverListProps) {
  return (
    <div className="overflow-y-auto h-[calc(100vh-180px)] pr-2">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drivers..."
            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          title="Refresh drivers"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-50 rounded-xl p-5 border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? 'No matching drivers' : 'No drivers available'}
          </h3>
          <p className="text-gray-500 max-w-md">
            {searchQuery
              ? 'Try adjusting your search or click the refresh button.'
              : 'Please check back later or try refreshing the list.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              isSelected={selectedDriver?.id === driver.id}
              onSelect={onSelectDriver}
            />
          ))}
        </div>
      )}
    </div>
  );
}
