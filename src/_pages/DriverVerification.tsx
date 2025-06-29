import React, { useState, useCallback, useEffect, JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Tesseract from 'tesseract.js';
import type { Driver } from '@/types/ride';
import {
  verifyDriverFromText,
  parseDriverInfo,
  addDriver,
  saveDriverToStorage,
  loadDrivers,
} from '@/utils/driverVerification';

type VerificationStatus = 'unverified' | 'verifying' | 'verified' | 'failed';

interface DriverVerificationState {
  file: File | null;
  imagePreview: string;
  verificationStatus: VerificationStatus;
  loading: boolean;
  driver: (Driver & { verified: boolean }) | null;
  ocrResult: string;
  error: string | null;
  drivers: Driver[];
}

const DriverVerification: React.FC = (): JSX.Element => {
  const navigate = useNavigate();

  const [state, setState] = useState<DriverVerificationState>({
    file: null,
    imagePreview: '',
    verificationStatus: 'unverified',
    loading: false,
    driver: null,
    ocrResult: '',
    error: null,
    drivers: [],
  });

  const {
    file,
    imagePreview,
    verificationStatus,
    loading,
    driver,
    ocrResult,
    error,
    drivers,
  } = state;

  const updateState = useCallback(
    (updates: Partial<DriverVerificationState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Load drivers on component mount
  useEffect(() => {
    const loadDriverData = async () => {
      try {
        const loadedDrivers = await loadDrivers();
        updateState({ drivers: loadedDrivers });
      } catch (error) {
        console.error('Failed to load drivers:', error);
        updateState({ error: 'Failed to load driver data' });
      }
    };

    loadDriverData();
  }, [updateState]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        updateState({
          file: selectedFile,
          imagePreview: URL.createObjectURL(selectedFile),
          verificationStatus: 'unverified',
          driver: null,
          error: null,
          ocrResult: '',
        });
      }
    },
    [updateState],
  );

  const handleVerify = useCallback(async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    console.log('Starting verification process...');
    updateState({
      loading: true,
      verificationStatus: 'verifying' as const,
      error: null,
    });

    try {


      // Process the image with Tesseract
      console.log('Processing image with Tesseract...');
      const {
        data: { text },
      } = await Tesseract.recognize(file, 'eng');
      console.log('OCR Text extracted:', text);
      updateState({ ocrResult: text });

      // First try to verify against existing drivers
      console.log('Verifying driver from text...');
      const existingDriver = await verifyDriverFromText(text);
      // Use a fuzzy matching strategy to find a similar driver if exact match is not found
      let matchedDriver = null;
      if (
        existingDriver &&
        typeof existingDriver === 'object' &&
        !Array.isArray(existingDriver)
      ) {
        matchedDriver = existingDriver;
      } else {
        // Try fuzzy matching by comparing OCR text with driver names and license plates
        const lowerText = text.toLowerCase();
        matchedDriver = drivers.find(
          (d) =>
            lowerText.includes(d.name.toLowerCase()) ||
            lowerText.includes(d.licensePlate.toLowerCase()),
        );
      }

      if (matchedDriver) {
        console.log('Found matched driver:', matchedDriver);
        // Save to localStorage as verified
        saveDriverToStorage(matchedDriver);
        updateState({
          driver: { ...matchedDriver, verified: true },
          verificationStatus: 'verified' as const,
          loading: false,
        });
        // Show success message in the UI
        console.log('Driver verification successful!');
      } else {
        console.log(
          'No matching driver found, attempting to parse as new driver...',
        );
        const parsedInfo = parseDriverInfo(text);

        if (!parsedInfo) {
          throw new Error(
            'Could not parse driver information from the provided image',
          );
        }

        // Create new driver data
        const newDriver: Omit<Driver, 'id' | 'verified'> = {
          ...parsedInfo,
          rating: 5, // Default rating
          eta: '5 min', // Default ETA
          position: [0, 0], // Default position
          price: '0.01 ETH', // Default price
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedInfo.name)}&background=random`,
          initials:
            parsedInfo.initials ||
            parsedInfo.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2),
        };

        console.log('Adding new driver with data:', newDriver);
        
        // Add the new driver
        const addedDriver = await addDriver(newDriver);
        // Save to localStorage as verified
        saveDriverToStorage(addedDriver);
        // Update state with the new driver
        setState((prevState: DriverVerificationState) => ({
          ...prevState,
          driver: { ...addedDriver, verified: true },
          verificationStatus: 'verified' as const,
          loading: false,
          drivers: [...prevState.drivers, addedDriver],
        }));
        // Show success message in the UI
        console.log('New driver added and verified successfully!');
      }
    } catch (error) {
      console.error('Verification error:', error);
      updateState({
        verificationStatus: 'failed',
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to verify driver',
        driver: null,
      });
      alert(
        'Verification failed. Please ensure the image is clear and try again.',
      );
    }
  }, [file, updateState]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Driver Verification
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Driver's License
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <img
              src={imagePreview}
              alt="Driver's License Preview"
              className="max-w-full h-auto rounded-md border border-gray-200"
            />
          </div>
        )}

        {/* Verification Status */}
        {verificationStatus === 'verifying' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">Verifying driver information...</p>
          </div>
        )}

        {verificationStatus === 'verified' && driver && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800">✅ Driver Verified</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>Name: {driver.name}</div>
              <div>License: {driver.licensePlate}</div>
              {driver.carModel && <div>Car: {driver.carModel}</div>}
            </div>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800">❌ Verification Failed</h3>
            {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
          </div>
        )}

        {/* Verification Button */}
        <div className="mt-6">
          <button
            onClick={handleVerify}
            disabled={!file || loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !file || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify Driver'}
          </button>
        </div>

        {/* OCR Result (for debugging) */}
        {process.env.NODE_ENV === 'development' && ocrResult && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              OCR Result (Debug)
            </h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {ocrResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverVerification;
