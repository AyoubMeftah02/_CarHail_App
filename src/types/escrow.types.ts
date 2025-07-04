type BigNumber = bigint;

export interface EscrowState {
  passenger: string;
  driver: string;
  amount: BigNumber;
  isCompleted: boolean;
  isDepositing?: boolean; // Optional flag for UI state
}

export interface EscrowTransaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  description?: string; // Optional description for UI display
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
  setWalletState: React.Dispatch<React.SetStateAction<WalletState>>;
  transactions: Record<string, EscrowTransaction>;
  setTransactions: React.Dispatch<React.SetStateAction<Record<string, EscrowTransaction>>>;
  contractAddress: string | null;
  isDeploying: boolean;
  connectWallet: () => Promise<void>;
  deployContract: (driverAddress: string, rideAmount: BigNumber) => Promise<{ success: boolean; contractAddress?: string; error?: string }>;
  depositForRide: (amount: BigNumber) => Promise<void>;
  approvePayment: () => Promise<void>;
  requestRefund: () => Promise<void>;
  getEscrowStatus: () => Promise<EscrowState>;
}
