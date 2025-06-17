import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { useEscrow } from '@/hooks/useEscrow';

const RideDashboard: React.FC = () => {
  const {
    escrowState,
    walletState,
    transactions,
    getEscrowStatus,
  } = useEscrow();

  useEffect(() => {
    if (walletState.isConnected) {
      getEscrowStatus().catch(console.error);
    }
  }, [walletState.isConnected]);

  if (!walletState.isConnected) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-600">Please connect your wallet to view ride details</p>
      </div>
    );
  }

  if (!escrowState) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-600">Loading escrow details...</p>
      </div>
    );
  }

  const pendingTransactions = Object.values(transactions).filter(tx => tx.status === 'pending');
  const failedTransactions = Object.values(transactions).filter(tx => tx.status === 'failed');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold mb-6">Ride Status</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Status</span>
          <span className={`font-medium ${escrowState.isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
            {escrowState.isCompleted ? 'Completed' : 'Active'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Passenger</span>
          <span className="font-medium">{formatAddress(escrowState.passenger)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Driver</span>
          <span className="font-medium">{formatAddress(escrowState.driver)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium">
            {ethers.formatEther(escrowState.amount)} ETH
          </span>
        </div>

        {pendingTransactions.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800">Pending Transactions</h3>
            <ul className="mt-2 text-sm text-yellow-700">
              {pendingTransactions.map(tx => (
                <li key={tx.hash}>Transaction: {formatAddress(tx.hash)}</li>
              ))}
            </ul>
          </div>
        )}

        {failedTransactions.length > 0 && (
          <div className="bg-red-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Failed Transactions</h3>
            <ul className="mt-2 text-sm text-red-700">
              {failedTransactions.map(tx => (
                <li key={tx.hash}>
                  Transaction: {formatAddress(tx.hash)}
                  {tx.error && <p className="text-xs mt-1">{tx.error}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideDashboard;