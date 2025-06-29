import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useCallback } from 'react';
import {
  ArrowPathIcon,
  WalletIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ethers } from 'ethers';
import type { EscrowState, WalletState, EscrowTransaction } from '@/types/escrow.types';
import { ESCROW_ABI } from '@/ABI/Escrow';

type PaymentModalProps = {
  onRelease: () => Promise<void>;
  // Callback to release funds to driver
  
  showPaymentModal: boolean;
  onClose: () => void;
  paymentStep: 'connect' | 'deploy' | 'deposit' | 'complete';
  rideAmount: bigint;
  escrowState: EscrowState;
  walletState: WalletState;
  transactions: EscrowTransaction[];
  isDeploying: boolean;
  rideStatus: 'inProgress' | 'completed';
  rideProgress: number;
  onConnectWallet: () => void;
  onDeployContract: () => void;
  onDeposit: () => void;
};

export default function PaymentModal({
  onRelease,
  
  showPaymentModal,
  onClose,
  paymentStep,
  rideAmount,
  escrowState: initialEscrowState,
  walletState,
  transactions,
  isDeploying,
  onConnectWallet,
  onDeployContract,
  onDeposit,
  rideStatus,
  rideProgress,
}: PaymentModalProps) {
  const [escrowState, setEscrowState] = useState<EscrowState>({
    ...initialEscrowState,
  });

  const handleDeposit = async () => {
    try {
      await onDeposit();
    } catch (error) {
      console.error('Deposit failed:', error);
      // Display error to user
    }
  };

  const renderStepContent = () => {
    switch (paymentStep) {
      case 'connect':
        return (
          <div className="text-center">
            <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Connect Your Wallet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please connect your Ethereum wallet to proceed with the payment.
            </p>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={onConnectWallet}
                disabled={walletState.isConnecting}
              >
                {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        );
      case 'deploy':
        return (
          <div className="text-center">
            <ArrowPathIcon
              className={`mx-auto h-12 w-12 text-gray-400 ${
                isDeploying ? 'animate-spin' : ''
              }`}
            />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Deploy Escrow Contract
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              A secure escrow contract will be deployed for your ride.
            </p>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={onDeployContract}
                disabled={isDeploying}
              >
                {isDeploying ? 'Deploying...' : 'Deploy Contract'}
              </button>
            </div>
          </div>
        );
      case 'deposit':
        return (
          <div className="text-center">
            <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Deposit Funds
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Ride Amount: <span className="font-medium">{ethers.formatEther(rideAmount)} ETH</span>
                </p>
                <p className="text-sm font-semibold text-gray-800 pt-2 border-t">
                  Total:{' '}
                  <span className="font-bold">
                    {ethers.formatEther(rideAmount)} ETH
                  </span>
                </p>
              </div>
            </p>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={handleDeposit}
                disabled={false}
              >
                Deposit Funds
              </button>
            </div>
          </div>
        );
      case 'complete':
          {
            /* Show release button if not yet completed */
            const needRelease = !escrowState.isCompleted;
          }

        return (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Payment Successful!
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {rideStatus === 'inProgress' && `Ride in progress... (${rideProgress}%) Funds are locked in escrow.`}
              {rideStatus === 'completed' &&
                (escrowState.isCompleted
                  ? 'Ride completed. Funds have been released to the driver.'
                  : 'Ride completed. Releasing funds to the driver...')}
            </p>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Transition appear show={showPaymentModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center"
                >
                  Ride Payment
                </Dialog.Title>
                <div className="mt-4">{renderStepContent()}</div>

                {/* Transaction Status */}
                {transactions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-800 mb-2">
                      Transaction Status
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {transactions.map((tx, index) => (
                        <div key={index} className="flex items-center">
                          {tx.status === 'pending' && (
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin text-blue-500" />
                          )}
                          {tx.status === 'success' && (
                            <svg
                              className="h-4 w-4 mr-2 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                          )}
                          {tx.status === 'failed' && (
                            <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-red-500" />
                          )}
                          <span>
                            {tx.description ? `${tx.description}: ` : ''}
                            {tx.hash ? (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Transaction
                              </a>
                            ) : (
                              tx.status
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}