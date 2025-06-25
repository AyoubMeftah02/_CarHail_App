import { storeJSON, retrieveJSON } from './ipfs';
import type { Driver } from '../types/ride';

// Key for storing drivers in localStorage
const DRIVERS_STORAGE_KEY = 'carhail_drivers';

// Sensitive driver data that should be stored in IPFS
export interface SensitiveDriverData {
  licenseNumber: string;
  documentImage?: string; // Base64 or URL of the document
  address?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  timestamp?: string; // ISO timestamp when the record was created
}

/**
 * Loads drivers from localStorage.
 * Falls back to an empty array if no drivers are found.
 * Merges with any static drivers if provided.
 */
// Export all necessary functions at the top for better visibility

export const loadDrivers = (): Driver[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    const drivers: Driver[] = storedDrivers ? JSON.parse(storedDrivers) : [];

    // Add any new static drivers that don't exist in localStorage
    const staticDrivers = require('../data/drivers.json') as Driver[];
    const existingIds = new Set(drivers.map((d) => d.id));

    staticDrivers.forEach((staticDriver) => {
      if (!existingIds.has(staticDriver.id)) {
        drivers.push(staticDriver);
        existingIds.add(staticDriver.id);
      }
    });

    // Save back to localStorage if we added any static drivers
    if (
      drivers.length > (storedDrivers ? JSON.parse(storedDrivers).length : 0)
    ) {
      saveDrivers(drivers);
    }

    return drivers;
  } catch (error) {
    console.error('Error loading drivers:', error);
    return [];
  }
};

// Keep for backward compatibility
export const loadDriversFromFile = loadDrivers;

import fs from 'fs';
import path from 'path';

/**
 * Saves drivers array to both localStorage and drivers.json file.
 * @param drivers Array of Driver objects to save
 */
export const saveDrivers = (drivers: Driver[]): void => {
  try {
    // Ensure we don't store sensitive data
    const sanitizedDrivers = drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      licensePlate: driver.licensePlate,
      carModel: driver.carModel,
      car: driver.car,
      rating: driver.rating,
      eta: driver.eta,
      image: driver.image,
      initials: driver.initials,
      position: driver.position,
      price: driver.price,
      verified: driver.verified,
      ipfsHash: driver.ipfsHash,
    }));

    // Save to localStorage if in browser
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        DRIVERS_STORAGE_KEY,
        JSON.stringify(sanitizedDrivers),
      );
    }

    // Save to drivers.json file (for development/testing)
    try {
      const driversPath = path.join(process.cwd(), 'src/data/drivers.json');
      fs.writeFileSync(driversPath, JSON.stringify(sanitizedDrivers, null, 2));
      console.log('Successfully saved drivers to file');
    } catch (fileError) {
      console.warn(
        'Could not save to drivers.json (expected in production):',
        fileError,
      );
    }
  } catch (error) {
    console.error('Error saving drivers:', error);
    throw new Error('Failed to save drivers. Please try again.');
  }
};

// Keep for backward compatibility
const saveDriversToFile = saveDrivers;

/**
 * Adds or updates a verified driver in localStorage, preventing duplicates by id or licensePlate.
 * @param driver Driver object to add or update
 * @returns The updated list of drivers
 */
export function updateOrAddVerifiedDriver(driver: Driver): Driver[] {
  try {
    const drivers = loadDrivers();
    // Find and remove any existing driver with the same id or licensePlate
    const existingDriverIndex = drivers.findIndex(
      (d) => d.id === driver.id || d.licensePlate === driver.licensePlate,
    );

    const updatedDriver = { ...driver, verified: true };

    if (existingDriverIndex >= 0) {
      // Update existing driver
      drivers[existingDriverIndex] = updatedDriver;
    } else {
      // Add new driver
      drivers.push(updatedDriver);
    }

    saveDrivers(drivers);
    return drivers;
  } catch (error) {
    console.error('Error updating/adding verified driver:', error);
    throw new Error('Failed to update driver information. Please try again.');
  }
}

export const verifyDriver = (
  driverId: string,
  drivers: Driver[],
): Driver | null => {
  const driver = drivers.find((d) => d.id === driverId);
  if (!driver) return null;
  const verifiedDriver = { ...driver, verified: true };
  // Store in localStorage
  localStorage.setItem('verifiedDriver', JSON.stringify(verifiedDriver));
  // Persist to drivers.json
  updateOrAddVerifiedDriver(verifiedDriver);
  return verifiedDriver;
};

/**
 * Get all drivers from localStorage, merged with any static drivers
 * @returns Array of all available drivers
 */
export const getDrivers = (): Driver[] => {
  return loadDrivers();
};

// Store sensitive driver data in IPFS
export const storeSensitiveDriverData = async (
  data: SensitiveDriverData,
): Promise<string> => {
  try {
    const { cid } = await storeJSON(data);
    return cid;
  } catch (error) {
    console.error('Failed to store sensitive data in IPFS:', error);
    throw new Error('Failed to store driver data. Please try again.');
  }
};

// Retrieve sensitive driver data from IPFS
export const getSensitiveDriverData = async (
  cid: string,
): Promise<SensitiveDriverData> => {
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

/**
 * Add a new driver with optional sensitive data
 * @param driver Driver data (excluding id, verified, and ipfsHash)
 * @param sensitiveData Optional sensitive data to store in IPFS
 * @returns The newly created driver
 */
export const addDriver = async (
  driver: Omit<Driver, 'id' | 'verified' | 'ipfsHash'>,
  sensitiveData?: SensitiveDriverData,
): Promise<Driver> => {
  try {
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

    // Create new driver object
    const newDriver: Driver = {
      ...driver,
      id: `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      verified: true,
      ipfsHash,
      // Ensure all required fields have defaults
      rating: driver.rating || 5,
      eta: driver.eta || 5,
      position: driver.position || { lat: 0, lng: 0 },
      price: driver.price || '0',
      image:
        driver.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || '')}&background=random`,
      initials:
        driver.initials ||
        (driver.name || '')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2),
    };

    // Save the new driver
    updateOrAddVerifiedDriver(newDriver);

    return newDriver;
  } catch (error) {
    console.error('Error adding driver:', error);
    throw new Error('Failed to add driver. Please try again.');
  }
};

/**
 * Verify if a driver exists based on OCR text
 * @param text Raw OCR text from driver's license
 * @param drivers Optional array of drivers to check against (defaults to loaded drivers)
 * @returns True if a matching driver is found, false otherwise
 */
export const verifyDriverFromText = (
  text: string,
  drivers: Driver[] = loadDrivers(),
): boolean => {
  const parsedDriver = parseDriverInfo(text);
  if (!parsedDriver) return false;

  const existingDriver = drivers.find(
    (d) => d.licensePlate === parsedDriver.licensePlate,
  );
  return existingDriver !== undefined;
};

export const parseDriverInfo = (
  text: string,
): Omit<Driver, 'id' | 'verified' | 'rating' | 'eta' | 'ipfsHash'> | null => {
  console.log('Raw OCR text:', text); // Debug log

  // Normalize text: convert to uppercase and replace common OCR errors
  const normalizedText = text
    .toUpperCase()
    .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]+/g, "'") // Normalize apostrophes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u2034\u2037"]+/g, '"') // Normalize quotes
    .replace(
      /[\u00B4\u02B9\u02BB\u02BC\u02C8\u02EE\u0301\u0384\u1FBD\u1FBF\u1FEF\uFF07]+/g,
      "'",
    ); // More quote normalization

  // Try multiple patterns to extract name (Moroccan driver's license format)
  const nameMatch =
    normalizedText.match(
      /(?:NOM|NAME|NOM\s*ET\s*PR[ÉE]NOM)[\s:]+([A-Z\s\-']+)(?:\n|$)/,
    ) || normalizedText.match(/^([A-Z\s\-']+)(?:\n|$)/m);

  // Try multiple patterns to extract license number (Moroccan format)
  const licenseMatch =
    normalizedText.match(
      /(?:N°|NUMERO?|ID|LICENSE|PERMIS|PERMIS\s*DE\s*CONDUIRE)[\s:]*([A-Z0-9\-\s]{6,15})/,
    ) ||
    normalizedText.match(
      /\b([A-Z0-9]{1,2}\s*[A-Z0-9]{4,6}[\s\-]?[A-Z0-9]{0,4})\b/,
    );

  // Try to extract car model (Moroccan format)
  const carModelMatch =
    normalizedText.match(
      /(?:VEHICULE?|VOITURE|MOD[EÈ]LE?|MARQUE)[\s:]+([A-Z0-9\s\-]+)(?:\n|$)/i,
    ) || normalizedText.match(/\b([A-Z]{2,}\s+[A-Z0-9]+(?:\s+[A-Z0-9]+)*)\b/);

  // Extract date of birth if available (for additional verification)
  const dobMatch = normalizedText.match(
    /(?:DATE\s*DE\s*NAISSANCE?|N[ÉE]\s*LE?)[\s:]+([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
  );

  console.log('Parsed matches:', {
    nameMatch: nameMatch?.[0],
    licenseMatch: licenseMatch?.[0],
    carModelMatch: carModelMatch?.[0],
    dobMatch: dobMatch?.[0],
  });

  if (!nameMatch || !licenseMatch) {
    console.warn('Failed to extract required driver information');
    console.debug('Available text:', normalizedText);
    return null;
  }

  // Clean up extracted data
  const name = nameMatch[1]?.trim().replace(/\s+/g, ' ') || 'Unknown Driver';
  const licensePlate = licenseMatch[1].replace(/[^A-Z0-9]/g, '').toUpperCase();
  const carModel = carModelMatch
    ? carModelMatch[1].trim().replace(/\s+/g, ' ')
    : 'Unknown Model';

  // Generate initials from name (first letters of first two words)
  const initials = name
    .split(/\s+/)
    .filter(
      (n) =>
        n.length > 0 &&
        !['EL', 'AL', 'BEN', 'BENT', 'OULED', 'OULD'].includes(n),
    )
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  console.log('Parsed driver info:', {
    name,
    licensePlate,
    carModel,
    initials,
  });

  return {
    name,
    licensePlate,
    carModel,
    car: carModel,
    initials,
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    position: { lat: 0, lng: 0 }, // Default position
    price: '0', // Default price as string to match Driver interface
  };
};
export const isDriverVerified = (driverId: string): boolean => {
  const stored = getVerifiedDriver();
  return stored?.id === driverId && stored?.verified === true;
};

/**
 * Save a verified driver to localStorage under 'verified_drivers'.
 * Adds a timestamp and unique ID if not present.
 */
export function saveDriverToStorage(
  driver: Omit<Driver, 'id'> & Partial<Pick<Driver, 'id'>>,
) {
  const key = 'verified_drivers';
  const drivers: Driver[] = JSON.parse(localStorage.getItem(key) || '[]');
  // Ensure unique ID
  const id =
    driver.id ||
    `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  // Remove any existing driver with same licensePlate or id
  const filtered = drivers.filter(
    (d) => d.licensePlate !== driver.licensePlate && d.id !== id,
  );
  const newDriver: Driver = {
    ...driver,
    id,
    verified: true,
    rating: driver.rating || 5,
    eta: driver.eta || 5,
    position: driver.position || { lat: 0, lng: 0 },
    price: driver.price || '0',
    image:
      driver.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || '')}&background=random`,
    initials:
      driver.initials ||
      (driver.name || '')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
    // Add timestamp as a custom property (not in Driver interface)
    // @ts-ignore
    timestamp,
  };
  filtered.push(newDriver);
  localStorage.setItem(key, JSON.stringify(filtered));
  return newDriver;
}

/**
 * Loads verified drivers from localStorage under 'verified_drivers'.
 * Returns an array of Driver objects or an empty array if none found.
 */
export function loadVerifiedDrivers(): Driver[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('verified_drivers');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading verified drivers:', e);
    return [];
  }
}
