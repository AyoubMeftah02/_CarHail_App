import { useState } from 'react';
import type { EIP6963ProviderDetail } from '@/types/eip6963';
import { useSyncProviders } from '@/hooks/useSyncProviders';

interface MMError {
  code: number;
  message: string;
}

interface AuthenticationProps {
  onAuthenticated: (userAccount: string) => void;
}

const Authentication = ({ onAuthenticated }: AuthenticationProps) => {
  // State for the currently selected wallet provider's details
  const [, setSelectedWallet] = useState<EIP6963ProviderDetail | undefined>();
  // Fetches the list of available EIP-6963 providers
  const providers = useSyncProviders();

  // State for storing error messages
  const [errorMessage, setErrorMessage] = useState('');
  // Function to clear the error message
  const clearError = () => setErrorMessage('');
  // Function to set an error message
  const setError = (error: string) => setErrorMessage(error);
  // Boolean flag indicating if there is an active error message
  const isError = !!errorMessage;

  // Handles the connection process when a wallet provider is selected
  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      // Request accounts from the selected provider
      const accounts = (await providerWithInfo.provider.request({
        method: 'eth_requestAccounts',
      })) as string[];

      // Update state with the selected wallet and user account
      setSelectedWallet(providerWithInfo);
      const userAccount = accounts?.[0];
      clearError(); // Clear any previous errors on successful connection

      // Call the callback to notify parent component of successful authentication
      if (userAccount) {
        onAuthenticated(userAccount);
      }
    } catch (error) {
      console.error('Connection Error:', error);
      const mmError: MMError = error as MMError;
      setError(`Code: ${mmError.code} \n Error Message: ${mmError.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Connect Your Wallet to Continue
        </h2>
        <div className="grid gap-4 mb-6">
          {providers.length > 0 ? (
            providers?.map((provider: EIP6963ProviderDetail) => (
              <button
                key={provider.info.uuid}
                onClick={() => handleConnect(provider)}
                className="flex items-center w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-gray-100 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <img
                  src={provider.info.icon}
                  alt={provider.info.name}
                  className="w-8 h-8 mr-3"
                />
                <span className="font-medium text-gray-700">
                  {provider.info.name}
                </span>
              </button>
            ))
          ) : (
            <div className="text-blue-700 bg-blue-50 border border-blue-200 rounded p-3 text-center">
              No Announced Wallet Providers
            </div>
          )}
        </div>
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-4">
            <div className="font-bold mb-1">Error</div>
            <p className="whitespace-pre-line">{errorMessage}</p>
            <button
              onClick={clearError}
              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Authentication;
