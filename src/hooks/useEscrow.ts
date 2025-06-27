import { useState, useEffect } from 'react';
import type {
  EscrowState,
  WalletState,
  EscrowTransaction,
  EscrowHookReturn,
} from '@/types/escrow.types';
import { blockchainService } from '@/utils/blockchainService';

// Using the same ethereum type as blockchainService
type EthereumRequest =
  | { method: 'eth_requestAccounts' }
  | { method: 'wallet_switchEthereumChain'; params: [{ chainId: string }] }
  | {
      method: 'wallet_addEthereumChain';
      params: [
        {
          chainId: string;
          chainName: string;
          nativeCurrency: {
            name: string;
            symbol: string;
            decimals: number;
          };
          rpcUrls: string[];
          blockExplorerUrls: string[] | null;
        },
      ];
    };

export function useEscrow(): EscrowHookReturn {
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
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Convert bigint to number safely

  // Connect wallet and switch to Hardhat network
  const connectWallet = async () => {
    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

      // Connect wallet using blockchain service
      const result = await blockchainService.connectWallet();

      if (!result.success) {
        throw new Error(result.error);
      }

      setWalletState({
        address: result.account || null,
        chainId: 31337, // Hardhat chainId
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

  // Deploy escrow contract
  const deployContract = async (driverAddress: string) => {
    try {
      setIsDeploying(true);
      const result = await blockchainService.deployEscrowContract(
        driverAddress,
        3600, // 1 hour release timeout
        7200, // 2 hours refund timeout
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      setContractAddress(result.contractAddress || null);
      return result;
    } finally {
      setIsDeploying(false);
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
    if (!contractAddress) throw new Error('Contract not initialized');

    const result = await blockchainService.depositToEscrow(
      contractAddress,
      amount.toString(),
    );
    if (!result.success) {
      throw new Error(result.error);
    }
    updateTransaction(result.transactionHash || '', 'pending');
    updateTransaction(result.transactionHash || '', 'success');
    await getEscrowStatus();
  };

  const approvePayment = async () => {
    if (!contractAddress) throw new Error('Contract not initialized');

    const result = await blockchainService.releaseFunds(contractAddress);
    if (!result.success) {
      throw new Error(result.error);
    }
    updateTransaction(result.transactionHash || '', 'pending');
    updateTransaction(result.transactionHash || '', 'success');
    await getEscrowStatus();
  };

  const requestRefund = async () => {
    if (!contractAddress) throw new Error('Contract not initialized');

    const result = await blockchainService.refundToPassenger(contractAddress);
    if (!result.success) {
      throw new Error(result.error);
    }
    updateTransaction(result.transactionHash || '', 'pending');
    updateTransaction(result.transactionHash || '', 'success');
    await getEscrowStatus();
  };

  const getEscrowStatus = async (): Promise<EscrowState> => {
    if (!contractAddress) throw new Error('Contract not initialized');

    const state = await blockchainService.getContractState(contractAddress);
    if (!state) {
      throw new Error('Failed to get contract state');
    }

    const escrowState: EscrowState = {
      passenger: state.passenger,
      driver: state.driver,
      amount: BigInt(state.amount),
      isCompleted: state.isCompleted,
    };

    setEscrowState(escrowState);
    return escrowState;
  };

  // Setup event listeners
  useEffect(() => {
    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) {
        setWalletState((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
        }));
      } else if (accounts[0] !== walletState.address) {
        // Call connectWallet but don't await (event handler must be sync)
        connectWallet();
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
  }, [walletState.address]);

  return {
    escrowState,
    walletState,
    transactions,
    contractAddress,
    isDeploying,
    connectWallet,
    deployContract,
    depositForRide,
    approvePayment,
    requestRefund,
    getEscrowStatus,
  };
}
