import React, { useContext, useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { WalletContext } from '@/providers/WalletProvider';
import { Navigate } from 'react-router-dom';
import type { Driver } from '@/types/ride';
import { mockDisputes, type Dispute } from '@/data/mockDisputes';
import { ensureStaticDrivers } from '@/utils/driverStorage';

// Filter function to only include verified drivers
const filterAllowedDrivers = (drivers: Driver[]) => {
  return drivers.filter(driver => driver.verified);
};

// DriverManagement component to display the list of drivers
const DriverManagement = ({ drivers }: { drivers: Driver[] }) => {
  const filteredDrivers = filterAllowedDrivers(drivers);

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h3>Driver Management</h3>
      </CCardHeader>
      <CCardBody>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ethereum Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.carModel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.licensePlate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono text-xs">
                      {driver.ethAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CCardBody>
    </CCard>
  );
};

const AdminDashboard = () => {
  const walletContext = useContext(WalletContext);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);

  // Load static drivers on component mount
  useEffect(() => {
    const loadDrivers = () => {
      const drivers = ensureStaticDrivers();
      setAllDrivers(drivers);
    };
    loadDrivers();
  }, []);

  const handleResolveDispute = (disputeId: string) => {
    setDisputes(disputes.map(d => d.id === disputeId ? { ...d, status: 'resolved' } : d));
  };

  if (!walletContext || !walletContext.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <CRow>
        <CCol xs={12}>
          <DriverManagement drivers={allDrivers} />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <h3>Dispute Resolution</h3>
            </CCardHeader>
            <CCardBody>
              <div className="space-y-4">
                {disputes.map(dispute => (
                  <div key={dispute.id} className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Dispute #{dispute.id}</h4>
                        <p className="text-sm text-gray-600">{dispute.reason}</p>
                        <p className="text-xs text-gray-500">Status: {dispute.status}</p>
                      </div>
                      {dispute.status === 'open' && (
                        <button
                          onClick={() => handleResolveDispute(dispute.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default AdminDashboard;
