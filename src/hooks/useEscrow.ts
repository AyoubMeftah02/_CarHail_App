import { useState, useEffect, useCallback } from 'react';
import { ethers, Contract, JsonRpcSigner } from 'ethers';
import type {
  EscrowState,
  WalletState,
  EscrowTransaction,
  EscrowHookReturn,
} from '../types/escrow.types';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Contract ABI - import from your contract artifacts
const ESCROW_ABI = [
  'function deposit() external payable',
  'function approveRelease() external',
  'function refund() external',
  'function passenger() external view returns (address)',
  'function driver() external view returns (address)',
  'function amount() external view returns (uint256)',
  'function isCompleted() external view returns (bool)',
  'event Deposited(address indexed passenger, uint256 amount)',
  'event Released(address indexed driver, uint256 amount)',
  'event Refunded(address indexed passenger, uint256 amount)',
];

// Contract addresses for different networks
const CONTRACT_ADDRESSES: Record<number, string> = {
  11155111: '0xd9145CCE52D386f254917e481eB44e9943F39138', // Sepolia
};

export function useEscrow(): EscrowHookReturn {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [escrowState, setEscrowState] = useState<EscrowState | null>(null);
  const [transactions, setTransactions] = useState<
    Record<string, EscrowTransaction>
  >({});
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Convert bigint to number safely
  const bigIntToNumber = (value: bigint): number => {
    return Number(value.toString());
  };

  // Initialize ethers provider and contract
  const initializeContract = useCallback(
    async (chainId: number, signerInstance: JsonRpcSigner) => {
      const address = CONTRACT_ADDRESSES[chainId];
      if (!address) {
        throw new Error('Contract not deployed on this network');
      }
      return new ethers.Contract(address, ESCROW_ABI, signerInstance);
    },
    [],
  );

  // Connect wallet
  const connectWallet = async () => {
    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await provider.getSigner();
      const address = await signerInstance.getAddress();
      const { chainId: chainIdBigInt } = await provider.getNetwork();
      const chainId = bigIntToNumber(chainIdBigInt);

      setSigner(signerInstance);
      const contractInstance = await initializeContract(
        chainId,
        signerInstance,
      );
      setContract(contractInstance);

      setWalletState({
        address,
        chainId: chainId,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error:
          error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  };

  // Update transaction status
  const updateTransaction = (
    hash: string,
    status: 'pending' | 'success' | 'failed',
    error?: string,
  ) => {
    setTransactions((prev) => ({
      ...prev,
      [hash]: { hash, status, error },
    }));
  };

  // Contract interaction methods
  const depositForRide = async (amount: bigint) => {
    if (!contract || !signer) throw new Error('Contract not initialized');

    try {
      const tx = await contract.deposit({ value: amount });
      updateTransaction(tx.hash, 'pending');
      await tx.wait();
      updateTransaction(tx.hash, 'success');
      await getEscrowStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Transaction failed';
      updateTransaction(error.transaction?.hash, 'failed', errorMessage);
      throw error;
    }
  };

  const approvePayment = async () => {
    if (!contract || !signer) throw new Error('Contract not initialized');

    try {
      const tx = await contract.approveRelease();
      updateTransaction(tx.hash, 'pending');
      await tx.wait();
      updateTransaction(tx.hash, 'success');
      await getEscrowStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Transaction failed';
      updateTransaction(error.transaction?.hash, 'failed', errorMessage);
      throw error;
    }
  };

  const requestRefund = async () => {
    if (!contract || !signer) throw new Error('Contract not initialized');

    try {
      const tx = await contract.refund();
      updateTransaction(tx.hash, 'pending');
      await tx.wait();
      updateTransaction(tx.hash, 'success');
      await getEscrowStatus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Transaction failed';
      updateTransaction(error.transaction?.hash, 'failed', errorMessage);
      throw error;
    }
  };

  const getEscrowStatus = async (): Promise<EscrowState> => {
    if (!contract) throw new Error('Contract not initialized');

    const [passenger, driver, amount, isCompleted] = await Promise.all([
      contract.passenger(),
      contract.driver(),
      contract.amount(),
      contract.isCompleted(),
    ]);

    const state = { passenger, driver, amount, isCompleted };
    setEscrowState(state);
    return state;
  };

  // Setup event listeners
  useEffect(() => {
    if (!contract) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletState((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
        }));
      } else if (accounts[0] !== walletState.address) {
        await connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [contract, walletState.address]);

  return {
    escrowState,
    walletState,
    transactions,
    connectWallet,
    depositForRide,
    approvePayment,
    requestRefund,
    getEscrowStatus,
  };
}
