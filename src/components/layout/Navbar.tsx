// Navbar.tsx - Tailwind CSS Navbar for CarHail
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="bg-gray-900 text-white shadow mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/home"
              className="text-2xl font-bold tracking-tight text-white hover:text-blue-300 transition-colors"
            >
              ####
            </Link>
            <Link
              to="/home"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/home'
                  ? 'bg-gray-800 text-blue-400'
                  : 'hover:bg-gray-800 hover:text-blue-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/passengers"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/passengers'
                  ? 'bg-gray-800 text-blue-400'
                  : 'hover:bg-gray-800 hover:text-blue-300'
              }`}
            >
              Passengers
            </Link>
            <Link
              to="/drivers"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/drivers'
                  ? 'bg-gray-800 text-blue-400'
                  : 'hover:bg-gray-800 hover:text-blue-300'
              }`}
            >
              Driver Verification
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
