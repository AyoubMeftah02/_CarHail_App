import { FaUser, FaSignOutAlt } from 'react-icons/fa';

interface WalletTopBarProps {
  userAccount: string | null;
  formatAddress: (address: string) => string;
  logout: () => void;
  isScrolled: boolean;
}

export const WalletTopBar = ({
  userAccount,
  formatAddress,
  logout,
  isScrolled,
}: WalletTopBarProps) => {
  if (!userAccount) return null;

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-md' : 'bg-transparent'
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
  );
};
