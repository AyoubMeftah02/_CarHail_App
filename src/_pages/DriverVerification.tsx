import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Tesseract from 'tesseract.js';
import driversData from '@/data/drivers.json';
import type { Driver } from '@/types/ride';
import { 
  addDriver,
  verifyDriver,
  isDriverVerified,
  getVerifiedDriver,
  type SensitiveDriverData
} from '@/utils/driverVerification';
import { parseDriverInfo } from '@/utils/ocrUtils';

interface DriverInfo {
  name: string;
  licensePlate: string;
  carModel?: string;
  car?: string;
  initials?: string;
}

const DriverVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'unverified' | 'verified' | 'failed'
  >('unverified');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [manualDriverId, setManualDriverId] = useState('');
  const [driverInfo, setDriverInfo] = useState<DriverInfo>({
    name: '',
    licensePlate: '',
    carModel: '',
    car: '',
    initials: ''
  });

  useEffect(() => {
    // Load drivers from JSON and add verification status
    const driversWithVerification = driversData.map((driver) => ({
      ...driver,
      verified: false,
    }));
    setDrivers(driversWithVerification);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
      setOcrResult('');
      setVerificationStatus('unverified');
    }
  };

  const verifyDriverFromText = async (text: string): Promise<boolean> => {
    try {
      // Find driver by license plate or name in the OCR text
      const foundDriver = drivers.find(
        (driver) =>
          text.toLowerCase().includes(driver.licensePlate.toLowerCase()) ||
          text.toLowerCase().includes(driver.name.toLowerCase()),
      );

      if (foundDriver) {
        // If driver exists, verify them
        const updatedDrivers = drivers.map(d => 
          d.id === foundDriver.id ? { ...d, verified: true } : d
        );
        
        setDrivers(updatedDrivers);
        setDriver({ ...foundDriver, verified: true });
        setVerificationStatus('verified');
        localStorage.setItem('verifiedDriver', JSON.stringify({ ...foundDriver, verified: true }));
        return true;
      }
      
      // If driver not found, try to parse as new driver
      const parsedInfo = parseDriverInfo(text);
      if (parsedInfo) {
        const newDriver: Driver = {
          id: `driver-${Date.now()}`,
          name: parsedInfo.name,
          licensePlate: parsedInfo.licensePlate,
          carModel: parsedInfo.carModel || 'Unknown Model',
          rating: 5.0, // Default rating for new drivers
          eta: 5, // Default ETA
          verified: true,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedInfo.name)}`,
          initials: parsedInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        };

        const updatedDrivers = [...drivers, newDriver];
        setDrivers(updatedDrivers);
        setDriver(newDriver);
        setVerificationStatus('verified');
        localStorage.setItem('verifiedDriver', JSON.stringify(newDriver));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying driver:', error);
      setVerificationStatus('failed');
      return false;
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // Convert file to base64 for IPFS storage
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      // Process the image with Tesseract
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setOcrResult(text);
      
      // First try to verify against existing drivers
      const isExistingDriver = await verifyDriverFromText(text);
      
      if (!isExistingDriver) {
        // If not an existing driver, try to parse as new driver
        const parsedInfo = parseDriverInfo(text);
        
        if (parsedInfo) {
          // Prepare sensitive data for IPFS
          const sensitiveData: SensitiveDriverData = {
            licenseNumber: parsedInfo.licensePlate,
            documentImage: fileBase64,
            // Add more sensitive fields as needed
          };

          // Generate a random rating between 4.5 and 5.0 and ETA between 5-15 minutes
          const driverData = {
            name: parsedInfo.name,
            licensePlate: parsedInfo.licensePlate,
            carModel: parsedInfo.carModel || 'Unknown Model',
            rating: Number((Math.random() * 0.5 + 4.5).toFixed(1)),
            eta: Math.floor(Math.random() * 11) + 5,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedInfo.name)}&background=random`,
            initials: parsedInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
          };

          // Add the new driver with sensitive data
          const addedDriver = await addDriver(driverData, sensitiveData);
          
          // Update local state
          setDriver(addedDriver);
          setVerificationStatus('verified');
          setDrivers(prev => [...prev, addedDriver]);
          localStorage.setItem('verifiedDriver', JSON.stringify(addedDriver));
        } else {
          setVerificationStatus('failed');
          // Couldn't parse required info, show manual form
          setIsNewDriver(true);
          setDriverInfo({
            name: '',
            licensePlate: '',
            carModel: '',
            car: '',
            initials: ''
          });
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = async (): Promise<void> => {
    if (!manualDriverId) return;
    setLoading(true);

    try {
      // Try to find by ID first
      let foundDriver = drivers.find(driver => driver.id === manualDriverId);
      
      // If not found by ID, try by name
      if (!foundDriver) {
        foundDriver = drivers.find(
          driver => driver.name.toLowerCase() === manualDriverId.toLowerCase()
        );
      }

      if (foundDriver) {
        // Verify existing driver
        const verifiedDriver = verifyDriver(foundDriver.id, drivers);
        if (verifiedDriver) {
          setDriver(verifiedDriver);
          setVerificationStatus('verified');
          localStorage.setItem('verifiedDriver', JSON.stringify(verifiedDriver));
        } else {
          setVerificationStatus('failed');
        }
      } else {
        // If driver not found, show manual entry form
        setIsNewDriver(true);
        setDriverInfo({
          name: manualDriverId,
          licensePlate: '',
          carModel: '',
          car: '',
          initials: manualDriverId.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        });
      }
    } catch (error) {
      console.error('Manual verification failed:', error);
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNewDriver = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // Convert file to base64 for IPFS storage
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      // Process the image with Tesseract
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setOcrResult(text);

      // Parse driver info from OCR text
      const parsedInfo = parseDriverInfo(text);

      if (parsedInfo) {
        // Prepare sensitive data for IPFS
        const sensitiveData: SensitiveDriverData = {
          licenseNumber: parsedInfo.licensePlate,
          documentImage: fileBase64,
          // Add more sensitive fields as needed
        };

        // Generate a random rating between 4.5 and 5.0 and ETA between 5-15 minutes
        const driverData = {
          name: parsedInfo.name,
          licensePlate: parsedInfo.licensePlate,
          carModel: parsedInfo.carModel || 'Unknown Model',
          rating: Number((Math.random() * 0.5 + 4.5).toFixed(1)),
          eta: Math.floor(Math.random() * 11) + 5,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedInfo.name)}&background=random`,
          initials: parsedInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        };

        // Add the new driver with sensitive data
        const addedDriver = await addDriver(driverData, sensitiveData);

        // Set as verified
        setDriver(addedDriver);
        setVerificationStatus('verified');
        localStorage.setItem('verifiedDriver', JSON.stringify(addedDriver));
      } else {
        setVerificationStatus('failed');
        // Couldn't parse required info, show manual form
        setIsNewDriver(true);
        setDriverInfo({
          name: '',
          licensePlate: '',
          carModel: '',
          car: '',
          initials: '',
        });
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/driver/dashboard');
  };

  const filteredDrivers = searchQuery
    ? drivers.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.id.includes(searchQuery),
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Driver Verification
        </h2>

        {/* Verification Status */}
        {verificationStatus === 'verified' && driver && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800">✅ Driver Verified</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>Name: {driver.name}</div>
              <div>ID: {driver.id}</div>
              <div>Car: {driver.carModel}</div>
              <div>License: {driver.licensePlate}</div>
            </div>
            <button
              onClick={handleContinue}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800">❌ Verification Failed</h3>
            <p className="text-sm text-red-600">
              Could not verify driver information. Please try again or contact
              support.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Upload Driver ID</h3>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Upload Driver ID Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="ID Preview"
                    className="max-w-full h-auto border rounded-md"
                  />
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!file || loading}
                  className={`px-4 py-2 rounded-md text-white ${!file || loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? 'Verifying...' : 'Verify with Image'}
                </button>
              </div>
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Or Verify Manually</h3>
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showManualEntry ? 'Hide' : 'Show Manual Entry'}
              </button>
            </div>

            {showManualEntry && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Driver by Name or ID
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter driver name or ID"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {searchQuery && filteredDrivers.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    {filteredDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        onClick={() => {
                          setManualDriverId(driver.id);
                          setDriver(driver);
                          setVerificationStatus('verified');
                          localStorage.setItem(
                            'verifiedDriver',
                            JSON.stringify(driver),
                          );
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-500">
                            ID: {driver.id} • {driver.carModel}
                          </div>
                        </div>
                        {driver.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={manualDriverId}
                    onChange={(e) => setManualDriverId(e.target.value)}
                    placeholder="Enter driver ID"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleManualVerification}
                    disabled={!manualDriverId}
                    className={`px-4 py-2 rounded-md text-white ${!manualDriverId ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Verify Manually
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Verified Drivers List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Verified Drivers</h3>
            <div className="space-y-2">
              {drivers
                .filter((d) => d.verified)
                .map((driver) => (
                  <div
                    key={driver.id}
                    className="p-3 bg-gray-50 rounded-md border"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-sm text-gray-500">
                          {driver.carModel} • {driver.licensePlate}
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverVerificationPage;
function setVerified(arg0: boolean) {
  throw new Error('Function not implemented.');
}
