import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Navbar from '@/components/layout/Navbar';
import DriverList from '@/components/ride/DriverList';
import SelectedDriverCard from '@/components/ride/SelectedDriverCard';
import PaymentModal from '@/components/ride/PaymentModal';
import LocationPinsOverlay from '@/components/ride/LocationPinsOverlay';
import MapComp from '@/components/map/Map';
import { useWallet } from '@/providers/WalletProvider';
import { useEscrow } from '@/hooks/useEscrow';
import type { Driver } from '@/types/ride';
import { ethers } from 'ethers';
import useRideProgress from '@/hooks/useRideProgress';
import { ensureStaticDrivers } from '@/utils/driverStorage';
import type { EscrowState } from '@/types/escrow.types';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const BookRide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userAccount } = useWallet();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rideAmount] = useState(ethers.parseEther('0.01')); // Default to 0.01 ETH
  const [paymentStep, setPaymentStep] = useState<'connect' | 'deploy' | 'deposit' | 'complete'>('connect');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rideStatus, setRideStatus] = useState<'inProgress' | 'completed'>('inProgress');
  // Generate a simple ride ID for demo; in prod this comes from backend
  const rideId = selectedDriver ? `ride-${selectedDriver.id || 'tmp'}` : null;
  const rideProgress = useRideProgress(rideId);

  const {
    escrowState,
    walletState,
    contractAddress,
    isDeploying,
    connectWallet,
    deployContract,
    depositForRide,
    approvePayment,
  } = useEscrow();

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      // Use ensureStaticDrivers to get drivers from storage
      const storedDrivers = ensureStaticDrivers();
      const driverData = storedDrivers.map((driver) => ({
        ...driver,
        position: driver.position || [31.7917, -7.0926],
        car: driver.car || driver.carModel || 'Car',
        image: driver.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || '')}&background=random`,
        initials: driver.initials || getInitials(driver.name || '')
      }));
      setDrivers(driverData);
      if (driverData.length > 0) {
        setSelectedDriver(driverData[0]);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const { pickup, dropoff, userLocation } = location.state as {
    pickup: Location;
    dropoff: Location;
    userLocation?: { lat: number; lon: number };
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = searchQuery
    ? drivers.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.carModel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : drivers;

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handlePayClick = () => {
    if (!selectedDriver) {
      alert('Please select a driver.');
      return;
    }
    setShowPaymentModal(true);
    if (!walletState.isConnected) {
      setPaymentStep('connect');
    } else if (!contractAddress) {
      setPaymentStep('deploy');
    } else {
      setPaymentStep('deposit');
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setPaymentStep('deploy');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleDeployContract = async () => {
    if (!selectedDriver) return;
    try {
      const driverAddress = selectedDriver.ethAddress;
      if (!driverAddress) {
        alert('Selected driver has no Ethereum address assigned.');
        return;
      }
      await deployContract(driverAddress, rideAmount);
      setPaymentStep('deposit');
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      alert('Failed to deploy escrow contract. Please try again.');
    }
  };

  const handleDeposit = async () => {
    try {
      await depositForRide(rideAmount);
      setPaymentStep('complete');
    } catch (error) {
      console.error('Failed to deposit:', error);
      const message = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      alert(message);
    }
  };

  const handleMarkRideCompleted = () => {
    setRideStatus('completed');
  };

  // When ride progress hits 100%, mark it completed (demo behaviour)
  useEffect(() => {
    if (rideStatus === 'inProgress' && rideProgress >= 100) {
      setRideStatus('completed');
      handleMarkRideCompleted();
    }
  }, [rideProgress, rideStatus]);

  // Auto release funds after ride completion
  useEffect(() => {
    const autoRelease = async () => {
      if (rideStatus === 'completed' && !escrowState?.isCompleted && contractAddress) {
        try {
          await approvePayment();
        } catch (err) {
          console.error('Auto release failed:', err);
        }
      }
    };
    autoRelease();
  }, [rideStatus, escrowState?.isCompleted, contractAddress]);

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    if (paymentStep !== 'complete') {
      setPaymentStep('connect');
    }
  };

  const effectiveEscrowState: EscrowState = escrowState ?? {
    passenger: walletState.address || '',
    driver: selectedDriver?.id || '',
    amount: 0n,
    isCompleted: false,
    isDepositing: false,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="ml-4 flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                Available Rides
              </h1>
              {pickup && dropoff && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="truncate">{pickup.name}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 mx-1.5 flex-shrink-0" />
                  <span className="truncate">{dropoff.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col h-[calc(100vh-120px)] bg-gray-50">
        <div className="flex flex-1 overflow-hidden">
          <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
            <DriverList
              drivers={filteredDrivers}
              isLoading={isLoading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDriver={selectedDriver}
              onSelectDriver={handleSelectDriver}
              onRefresh={loadDrivers}
            />
          </div>

          <div
            className="flex-1 relative bg-gray-100"
            style={{ height: 'calc(100vh - 120px)' }}
          >
            {userAccount ? (
              <div className="absolute inset-0 w-full h-full z-0">
                <MapComp
                  userAccount={userAccount}
                  className="w-full h-full"
                  pickup={pickup ? [pickup.lat, pickup.lon] : null}
                  destination={dropoff ? [dropoff.lat, dropoff.lon] : null}
                  userLocation={userLocation ? [userLocation.lat, userLocation.lon] : null}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0">
                <p className="text-gray-600">Connecting to wallet...</p>
              </div>
            )}

            <LocationPinsOverlay pickup={pickup} dropoff={dropoff} />

            {selectedDriver && (
              <SelectedDriverCard
                selectedDriver={selectedDriver}
                rideAmount={rideAmount}
                onPayClick={handlePayClick}
                onChangeDriver={() => setSelectedDriver(null)}
              />
            )}
          </div>
        </div>
      </main>

      {showPaymentModal && (
        <PaymentModal
          showPaymentModal={showPaymentModal}
          onClose={closePaymentModal}
          paymentStep={paymentStep}
          rideAmount={rideAmount}
          escrowState={effectiveEscrowState}
          walletState={walletState}
          transactions={[]}
          contractAddress={contractAddress}
          isDeploying={isDeploying}
          onConnectWallet={handleConnectWallet}
          onDeployContract={handleDeployContract}
          onDeposit={handleDeposit}
           onRelease={approvePayment}
          rideStatus={rideStatus}
          rideProgress={rideProgress}
        />
      )}
    </div>
  );
};

export default BookRide;
