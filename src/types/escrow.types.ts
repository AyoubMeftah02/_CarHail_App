import { BigNumber } from 'ethers';

export interface EscrowState {
  passenger: string;
  driver: string;
  amount: BigNumber;
  isCompleted: boolean;
}

export interface EscrowTransaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export interface RideDetails {
  pickupLocation: string;
  destination: string;
  estimatedFare: BigNumber;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface EscrowHookReturn {
  escrowState: EscrowState | null;
  walletState: WalletState;
  transactions: Record<string, EscrowTransaction>;
  connectWallet: () => Promise<void>;
  depositForRide: (amount: BigNumber) => Promise<void>;
  approvePayment: () => Promise<void>;
  requestRefund: () => Promise<void>;
  getEscrowStatus: () => Promise<EscrowState>;
}
