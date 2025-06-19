import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Map from '@/components/map/Map';
import { useWallet } from '@/providers/WalletProvider';
import {
  FaUser,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
} from 'react-icons/fa';

const Home = () => {
  const { userAccount, formatAddress, logout } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      {/* Top Bar with Wallet Info */}
      {userAccount && (
        <div
          className={`sticky top-0 z-50 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/90 backdrop-blur-sm shadow-md'
              : 'bg-transparent'
          }`}
        >
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaUser className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {formatAddress(userAccount)}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Disconnect wallet"
            >
              <FaSignOutAlt className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}

      <main className="relative pt-4">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <Map userAccount={userAccount || ''} />
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-4 mt-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p> {new Date().getFullYear()} CarHail. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
