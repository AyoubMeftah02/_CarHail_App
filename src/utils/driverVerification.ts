import { storeJSON, retrieveJSON } from './ipfs';
import type { Driver } from '@/types/ride';

// Sensitive driver data that should be stored in IPFS
export interface SensitiveDriverData {
  licenseNumber: string;
  documentImage?: string; // Base64 or URL of the document
  address?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export const verifyDriver = (driverId: string, drivers: Driver[]): Driver | null => {
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return null;
  
  const verifiedDriver = { ...driver, verified: true };
  // Store in localStorage
  localStorage.setItem('verifiedDriver', JSON.stringify(verifiedDriver));
  return verifiedDriver;
};

// Get all drivers
export const getDrivers = (): Driver[] => {
  const stored = localStorage.getItem('drivers');
  return stored ? JSON.parse(stored) : [];
};

// Save all drivers
const saveDrivers = (drivers: Driver[]) => {
  localStorage.setItem('drivers', JSON.stringify(drivers));
};

// Store sensitive driver data in IPFS
export const storeSensitiveDriverData = async (data: SensitiveDriverData): Promise<string> => {
  try {
    const { cid } = await storeJSON(data);
    return cid;
  } catch (error) {
    console.error('Failed to store sensitive data in IPFS:', error);
    throw new Error('Failed to store driver data. Please try again.');
  }
};

// Retrieve sensitive driver data from IPFS
export const getSensitiveDriverData = async (cid: string): Promise<SensitiveDriverData> => {
  try {
    return await retrieveJSON(cid);
  } catch (error) {
    console.error('Failed to retrieve sensitive data from IPFS:', error);
    throw new Error('Failed to retrieve driver data. Please try again.');
  }
};

export const getVerifiedDriver = (): Driver | null => {
  const stored = localStorage.getItem('verifiedDriver');
  return stored ? JSON.parse(stored) : null;
};

// Add a new driver
export const addDriver = async (
  driver: Omit<Driver, 'id' | 'verified' | 'ipfsHash'>,
  sensitiveData?: SensitiveDriverData
): Promise<Driver> => {
  const drivers = getDrivers();
  
  // Generate IPFS hash for sensitive data if provided
  let ipfsHash: string | undefined;
  if (sensitiveData) {
    try {
      ipfsHash = await storeSensitiveDriverData(sensitiveData);
    } catch (error) {
      console.error('Failed to store sensitive data in IPFS:', error);
      // Continue without storing in IPFS if it fails
    }
  }

  const newDriver: Driver = {
    ...driver,
    id: Date.now().toString(), // Simple ID generation
    verified: true,
    ipfsHash,
  };
  
  drivers.push(newDriver);
  saveDrivers(drivers);
  return newDriver;
};

// Parse driver info from OCR text
const parseDriverInfo = (text: string): Omit<Driver, 'id' | 'verified' | 'rating' | 'eta'> | null => {
  
  const nameMatch = text.match(/NAME[:\s]+([A-Za-z\s]+)/i);
  const licenseMatch = text.match(/([A-Z0-9-]{6,12})/);
  const carModelMatch = text.match(/VEHICLE[:\s]+([A-Za-z0-9\s]+)/i);

  if (!nameMatch || !licenseMatch) return null;

  return {
    name: nameMatch[1].trim(),
    licensePlate: licenseMatch[1].trim(),
    carModel: carModelMatch ? carModelMatch[1].trim() : 'Unknown Model',
    car: carModelMatch ? carModelMatch[1].trim() : 'Unknown Car',
    initials: nameMatch[1].split(' ').map(n => n[0]).join('').toUpperCase(),
  };
};

export const isDriverVerified = (driverId: string): boolean => {
  const stored = getVerifiedDriver();
  return stored?.id === driverId && stored?.verified === true;
};
