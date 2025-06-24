// Navbar.tsx - Tailwind CSS Navbar for CarHail
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isScrolled?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled = false }) => {
  const location = useLocation();
  
  return (
    <nav 
      className={`bg-gray-900 text-white shadow mb-4 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/home"
              className={`font-bold tracking-tight text-white hover:text-blue-300 transition-colors ${
                isScrolled ? 'text-xl' : 'text-2xl'
              }`}
            >
              CarHail
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
