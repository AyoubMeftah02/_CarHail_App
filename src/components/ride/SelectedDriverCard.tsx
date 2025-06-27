import { WalletIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Driver } from '@/types/ride';
import { ethers } from 'ethers';

type SelectedDriverCardProps = {
  selectedDriver: Driver;
  rideAmount: bigint;
  onPayClick: () => void;
  onChangeDriver: () => void;
};

export default function SelectedDriverCard({
  selectedDriver,
  rideAmount,
  onPayClick,
  onChangeDriver,
}: SelectedDriverCardProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-xl z-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Driver
        </h3>
        <button
          onClick={onChangeDriver}
          className="text-sm font-medium text-green-600 hover:text-green-700"
        >
          Change Driver
        </button>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={selectedDriver.image}
          alt={selectedDriver.name}
          className="h-16 w-16 rounded-full object-cover shadow-md"
        />
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900">
            {selectedDriver.name}
          </p>
          <p className="text-sm text-gray-600">
            {selectedDriver.car} ({selectedDriver.licensePlate})
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">
            {ethers.formatEther(rideAmount)} ETH
          </p>
          <p className="text-sm text-gray-500">Estimated Fare</p>
        </div>
      </div>
      <button
        onClick={onPayClick}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-green-700 transition-colors flex items-center justify-center"
      >
        <WalletIcon className="h-6 w-6 mr-2" />
        Pay Now
        <ArrowRightIcon className="h-5 w-5 ml-2" />
      </button>
    </div>
  );
}