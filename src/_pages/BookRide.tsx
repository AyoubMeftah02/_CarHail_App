import {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { LatLngExpression } from 'leaflet';
import Navbar from '@/components/layout/Navbar';
import DriverList from '@/components/ride/DriverList';
import SelectedDriverCard from '@/components/ride/SelectedDriverCard';
import PaymentModal from '@/components/ride/PaymentModal';
import LocationPinsOverlay from '@/components/ride/LocationPinsOverlay';
import MapComp from '@/components/map/Map';
import { useWallet } from '@/providers/WalletProvider';
import { useEscrow } from '@/hooks/useEscrow';
import type { Driver } from '@/types/ride';
import { loadVerifiedDrivers } from '@/utils/driverVerification';
import { ethers } from 'ethers';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

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

const BookRide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userAccount } = useWallet();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rideAmount] = useState(ethers.parseEther('0.005')); // 0.005 ETH ride amount
  const [paymentStep, setPaymentStep] = useState<'connect' | 'deploy' | 'deposit' | 'complete'>('connect');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Initialize escrow hook
  const {
    escrowState,
    walletState,
    contractAddress,
    isDeploying,
    connectWallet,
    deployContract,
    depositForRide,
    approvePayment,
    requestRefund,
  } = useEscrow();

  // Load drivers from the verified_drivers key in localStorage
  const loadDrivers = async (): Promise<Driver[]> => {
    try {
      setIsLoading(true);
      // Get all drivers from the verified_drivers key
      const allDrivers: Driver[] = loadVerifiedDrivers();
      
      // Create a map to remove duplicates by driver ID
      const uniqueDrivers = new Map<string, Driver>();
      
      // Process and deduplicate drivers
      allDrivers
        .filter((driver): driver is Driver & { verified: true } => !!driver.verified)
        .forEach((driver: Driver) => {
          if (!uniqueDrivers.has(driver.id)) {
            uniqueDrivers.set(driver.id, {
              ...driver,
              price: driver.price || '0.005 ETH',
              eta: typeof driver.eta === 'number' 
                ? `${driver.eta} min` 
                : driver.eta || '5 min',
              image: driver.image || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`,
              initials: driver.initials || getInitials(driver.name),
              position: driver.position || ([51.505, -0.09] as LatLngExpression),
              car: driver.car || driver.carModel || 'Car',
              rating: driver.rating || 4.8, // Add default rating if missing
            });
          }
        });
      
      const verifiedDrivers = Array.from(uniqueDrivers.values());
      setDrivers(verifiedDrivers);
      
      if (verifiedDrivers.length === 1) {
        setSelectedDriver(verifiedDrivers[0]);
      }
      
      return verifiedDrivers;
    } catch (error) {
      console.error('Error loading drivers:', error);
      setDrivers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh drivers list
  const refreshDrivers = async () => {
    await loadDrivers();
  };

  // Load drivers on component mount
  useEffect(() => {
    loadDrivers();
  }, []);

  // Get location data from navigation state
  const { pickup, dropoff, userLocation } = location.state as {
    pickup: Location;
    dropoff: Location;
    userLocation?: { lat: number; lon: number };
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Filter drivers based on search query
  const filteredDrivers = searchQuery
    ? drivers.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.carModel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.licensePlate
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : drivers;

  // Debugging logs
  console.log('BookRide - pickup:', pickup);
  console.log('BookRide - dropoff:', dropoff);
  console.log('BookRide - userLocation:', userLocation);
  console.log('BookRide - filteredDrivers count:', filteredDrivers.length);

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    // In a real app, you would confirm the ride with the selected driver
  };

  // Payment flow handlers
  const handlePayClick = async () => {
    if (!selectedDriver) return;
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
      // Use a hardcoded driver address for demo (Account 2 from Hardhat)
      const driverAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
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
      alert('Payment successful! Your ride is confirmed.');
    } catch (error) {
      console.error('Failed to deposit:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleReleasePayment = async () => {
    try {
      await approvePayment();
      alert('Payment released to driver successfully!');
    } catch (error) {
      console.error('Failed to release payment:', error);
      alert('Failed to release payment. Please try again.');
    }
  };

  const handleRefund = async () => {
    try {
      await requestRefund();
      alert('Refund processed successfully!');
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert('Failed to process refund. Please try again.');
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStep('connect');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header with back button and trip summary */}
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

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-120px)] bg-gray-50">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Driver Selection */}
          <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
            <DriverList
              drivers={filteredDrivers}
              isLoading={isLoading}
              searchQuery={searchQuery}
              selectedDriver={selectedDriver}
              onSelectDriver={handleSelectDriver}
              onRefresh={refreshDrivers}
              onClearSearch={() => setSearchQuery('')}
            />
          </div>

          {/* Right Column - Map */}
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
                  userLocation={
                    userLocation ? [userLocation.lat, userLocation.lon] : null
                  }
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0">
                <p className="text-gray-600">Connecting to wallet...</p>
              </div>
            )}

            {/* Location Pins Overlay */}
            <LocationPinsOverlay pickup={pickup} dropoff={dropoff} />

            {/* Driver Selection Card */}
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          showPaymentModal={showPaymentModal}
          onClose={closePaymentModal}
          paymentStep={paymentStep}
          rideAmount={rideAmount}
          escrowState={escrowState}
          walletState={walletState}
          transactions={[]}
          contractAddress={contractAddress}
          isDeploying={isDeploying}
          onConnectWallet={handleConnectWallet}
          onDeployContract={handleDeployContract}
          onDeposit={handleDeposit}
        />
      )}
    </div>
  );
};

export default BookRide;
