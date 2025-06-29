import './main.css';
import 'leaflet/dist/leaflet.css';
import ReactDOM from 'react-dom/client';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from "@/_pages/home";
import BookRide from "@/_pages/BookRide";
import DriverVerificationPage from "@/_pages/DriverVerification";
import Authentication from "@/_pages/Authentication";
import AdminDashboard from "@/_pages/AdminDashboard"; 
import AboutUs from "@/_pages/AboutUs";
import { WalletProvider, useWallet } from '@/providers/WalletProvider';

const AppRoutes = () => {
  const { isAuthenticated, setUserAccount } = useWallet();

  const handleAuthenticated = (account: string) => {
    setUserAccount(account);
  };

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/home" element={<Home />} />
          <Route path="/book-ride" element={<BookRide />} />
          <Route path="/drivers" element={<DriverVerificationPage />} />
          <Route path="/admin" element={<AdminDashboard />} /> 
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      ) : (
        <>
          <Route
            path="/"
            element={<Authentication onAuthenticated={handleAuthenticated} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

const Main = () => {
  return (
    <WalletProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </WalletProvider>
  );
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<Main />);
}
