import React, { useState } from 'react';
import { useEscrow } from '@/hooks/useEscrow';

const PaymentActions: React.FC = () => {
  const {
    escrowState,
    walletState,
    transactions,
    approvePayment,
    requestRefund,
  } = useEscrow();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprovePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await approvePayment();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await requestRefund();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request refund');
    } finally {
      setIsLoading(false);
    }
  };

  if (!walletState.isConnected || !escrowState) {
    return null;
  }

  const isPassenger = walletState.address?.toLowerCase() === escrowState.passenger.toLowerCase();
  const isDriver = walletState.address?.toLowerCase() === escrowState.driver.toLowerCase();
  const isPending = Object.values(transactions).some(tx => tx.status === 'pending');

  if (!isPassenger && !isDriver) {
    return null;
  }

  if (escrowState.isCompleted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-600">This ride has been completed</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {isPassenger ? 'Passenger Actions' : 'Driver Actions'}
      </h2>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isPassenger && (
        <button
          onClick={handleApprovePayment}
          disabled={isLoading || isPending}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading || isPending ? 'Processing...' : 'Approve Payment'}
        </button>
      )}

      {isDriver && (
        <button
          onClick={handleRequestRefund}
          disabled={isLoading || isPending}
          className="w-full py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {isLoading || isPending ? 'Processing...' : 'Request Refund'}
        </button>
      )}

      <div className="text-sm text-gray-500">
        {isPassenger ? (
          <p>Approve payment to release funds to the driver after a successful ride</p>
        ) : (
          <p>Request a refund if there are issues with the ride</p>
        )}
      </div>
    </div>
  );
};

export default PaymentActions;