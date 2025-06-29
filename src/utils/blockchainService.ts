import { ethers } from 'ethers';
import { ESCROW_ABI, ESCROW_BYTECODE } from '@/ABI/Escrow';

// Error types for blockchain operations
export interface EthereumProviderError extends Error {
  code: number;
  data?: unknown;
}

export interface MetaMaskError extends Error {
  code: number;
  message: string;
}

export interface ContractError extends Error {
  message: string;
  data?: {
    message?: string;
    code?: string | number;
    [key: string]: unknown;
  };
}

// Types for contract interaction
export interface EscrowContractData {
  address: string;
  passenger: string;
  driver: string;
  amount: string;
  isCompleted: boolean;
  depositTimestamp: number;
  releaseTimeout: number;
  refundTimeout: number;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  /**
   * Initialize connection to MetaMask
   */
  async connectWallet(): Promise<{
    success: boolean;
    account?: string;
    chainId?: number;
    error?: string;
  }> {
    try {
      if (!window.ethereum) {
        return {
          success: false,
          error: 'MetaMask not found. Please install MetaMask.',
        };
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts.length === 0) {
        return { success: false, error: 'No accounts found' };
      }

      this.signer = await this.provider.getSigner();
      const account = await this.signer.getAddress();

      // Check if connected to Sepolia testnet
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        // Try to switch to Sepolia testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
          });
        } catch (switchError: unknown) {
          if ((switchError as EthereumProviderError).code === 4902) {
            // Network not added, add Sepolia
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Testnet',
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc.sepolia.org'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
          }
        }
      }

      return { success: true, account, chainId: Number(network.chainId) };
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to connect wallet',
      };
    }
  }

  /**
   * Deploy a new Escrow contract
   */
  async deployEscrowContract(
    driverAddress: string,
    releaseTimeout: number = 3600, // 1 hour
    refundTimeout: number = 7200, // 2 hours
  ): Promise<{ success: boolean; contractAddress?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const contractFactory = new ethers.ContractFactory(
        ESCROW_ABI,
        ESCROW_BYTECODE,
        this.signer,
      );
      const contract = await contractFactory.deploy(
        driverAddress,
        releaseTimeout,
        refundTimeout,
      );
      await contract.waitForDeployment();

      const contractAddress = await contract.getAddress();

      return { success: true, contractAddress };
    } catch (error: unknown) {
      console.error('Error deploying contract:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to deploy contract',
      };
    }
  }

  /**
   * Get contract instance
   */
  private getContract(contractAddress: string): ethers.Contract {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return new ethers.Contract(contractAddress, ESCROW_ABI, this.signer);
  }

  /**
   * Deposit ETH into escrow contract
   */
  async depositToEscrow(
    contractAddress: string,
    amountInEth: string,
  ): Promise<TransactionResult> {
    try {
      const contract = this.getContract(contractAddress);
      const amountInWei = ethers.parseEther(amountInEth);

      const tx = await contract.deposit({ value: amountInWei });
      await tx.wait();

      return { success: true, transactionHash: tx.hash };
    } catch (error: unknown) {
      console.error('Error depositing to escrow:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to deposit',
      };
    }
  }

  /**
   * Release funds to driver
   */
  async releaseFunds(contractAddress: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract(contractAddress);
      const tx = await contract.approveRelease();
      await tx.wait();

      return { success: true, transactionHash: tx.hash };
    } catch (error: unknown) {
      console.error('Error releasing funds:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to release funds',
      };
    }
  }

  /**
   * Refund to passenger
   */
  async refundToPassenger(contractAddress: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract(contractAddress);
      const tx = await contract.refund();
      await tx.wait();

      return { success: true, transactionHash: tx.hash };
    } catch (error: unknown) {
      console.error('Error refunding:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to refund',
      };
    }
  }

  /**
   * Auto release funds (driver only, after timeout)
   */
  async autoReleaseFunds(contractAddress: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract(contractAddress);
      const tx = await contract.autoRelease();
      await tx.wait();

      return { success: true, transactionHash: tx.hash };
    } catch (error: unknown) {
      console.error('Error auto-releasing funds:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to auto-release funds',
      };
    }
  }

  /**
   * Auto refund (passenger only, after timeout)
   */
  async autoRefund(contractAddress: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract(contractAddress);
      const tx = await contract.autoRefund();
      await tx.wait();

      return { success: true, transactionHash: tx.hash };
    } catch (error: unknown) {
      console.error('Error auto-refunding:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to auto-refund',
      };
    }
  }

  /**
   * Get contract state
   */
  async getContractState(
    contractAddress: string,
  ): Promise<EscrowContractData | null> {
    try {
      const contract = this.getContract(contractAddress);

      const [
        passenger,
        driver,
        amount,
        isCompleted,
        depositTimestamp,
        releaseTimeout,
        refundTimeout,
      ] = await Promise.all([
        contract.passenger(),
        contract.driver(),
        contract.amount(),
        contract.isCompleted(),
        contract.depositTimestamp(),
        contract.releaseTimeout(),
        contract.refundTimeout(),
      ]);

      return {
        address: contractAddress,
        passenger,
        driver,
        amount: ethers.formatEther(amount),
        isCompleted,
        depositTimestamp: Number(depositTimestamp),
        releaseTimeout: Number(releaseTimeout),
        refundTimeout: Number(refundTimeout),
      };
    } catch (error: unknown) {
      console.error('Error getting contract state:', error);
      return null;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address?: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not connected');
      }

      const targetAddress = address || (await this.signer?.getAddress());
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error: unknown) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  /**
   * Listen to contract events
   */
  listenToContractEvents(
    contractAddress: string,
    onDeposited?: (passenger: string, amount: string) => void,
    onReleased?: (driver: string, amount: string) => void,
    onRefunded?: (passenger: string, amount: string) => void,
  ) {
    try {
      const contract = this.getContract(contractAddress);

      if (onDeposited) {
        contract.on('Deposited', (passenger, amount) => {
          onDeposited(passenger, ethers.formatEther(amount));
        });
      }

      if (onReleased) {
        contract.on('Released', (driver, amount) => {
          onReleased(driver, ethers.formatEther(amount));
        });
      }

      if (onRefunded) {
        contract.on('Refunded', (passenger, amount) => {
          onRefunded(passenger, ethers.formatEther(amount));
        });
      }
    } catch (error: unknown) {
      console.error('Error setting up event listeners:', error);
    }
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners(contractAddress: string) {
    try {
      const contract = this.getContract(contractAddress);
      contract.removeAllListeners();
    } catch (error: unknown) {
      console.error('Error removing event listeners:', error);
    }
  }
}

// Global instance
export const blockchainService = new BlockchainService();

// Type declarations for window.ethereum
// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
      isMetaMask?: boolean;
    };
  }
}
