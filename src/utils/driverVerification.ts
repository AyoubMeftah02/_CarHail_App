import Tesseract from 'tesseract.js';
import type { Driver } from '@/types/ride';

// Key for storing drivers in localStorage
const DRIVERS_STORAGE_KEY = 'carhail_drivers';
const VERIFIED_DRIVERS_KEY = 'verified_drivers';

// Re-export the Driver interface from ride.ts
export type { Driver } from '@/types/ride';

// Interface for the parsed driver info (matches Driver but with optional fields for parsing)
interface ParsedDriverInfo extends Omit<Driver, 'id' | 'verified' | 'rating' | 'eta'> {
  rating: number; // Make rating required with default value
  eta: string | number; // Make eta required with default value
}

/**
 * Scans a driver's license image using Tesseract OCR and extracts driver information
 * @param imageFile The image file to scan (File or Blob)
 * @returns Promise with parsed driver information or null if parsing fails
 */
export const scanDriverLicense = async (
  imageFile: File | Blob
): Promise<ParsedDriverInfo | null> => {
  try {
    console.log('Starting OCR scan of driver license...');
    
    // Step 1: Perform OCR on the image
    const { data: { text } } = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: m => console.log('OCR Progress:', m.status, m.progress * 100 + '%'),
        // Configure Tesseract to be more accurate with IDs and names
        // Note: tessedit_char_whitelist is not a valid option in the current Tesseract.js types
        // We'll rely on post-processing for text filtering
      }
    );
    
    console.log('OCR Text extracted:', text);
    
    if (!text || !text.trim()) {
      console.error('No text could be extracted from the image');
      return null;
    }
    
    // Step 2: Parse the extracted text
    const driverInfo = parseDriverInfo(text);
    
    if (!driverInfo) {
      console.error('Could not parse driver information from extracted text');
      return null;
    }
    
    console.log('Successfully parsed driver info:', driverInfo);
    return driverInfo;
    
  } catch (error) {
    console.error('Error scanning driver license:', error);
    throw new Error('Failed to process driver license image. Please try again with a clearer image.');
  }
};

/**
 * Parses driver information from OCR text
 * @param text Raw OCR text from driver's license or ID
 * @returns Parsed driver info or null if parsing fails
 */
export const parseDriverInfo = (text: string): ParsedDriverInfo | null => {
  console.log('Raw OCR text:', text);
  
  if (!text || !text.trim()) {
    console.error('No text provided to parseDriverInfo');
    return null;
  }

  // Helper function to clean and normalize text
  const cleanText = (str: string): string => {
    return str
      .trim()
      .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\u00B4\u02B9\u02BB\u02BC\u02C8\u02EE\u0301\u0384\u1FBD\u1FBF\u1FEF\uFF07]+/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u2034\u2037"]+/g, '"')
      .replace(/[^\p{L}\p{N}\s\-']/gu, ' ') // Remove special chars but keep letters, numbers, spaces, hyphens, and apostrophes
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Normalize and clean the input text
  const normalizedText = cleanText(text);
  console.log('Normalized text:', normalizedText);

  // Patterns for extracting name
  const namePatterns = [
    // Matches formats like "NOM: EL OUED" or "NOM ET PRENOM: OMAR EL OUED"
    /(?:NOM[\s\-]*(?:ET[\s\-]*PR[ÉE]NOM)?|IDENTIT[ÉE])[\s:]*([A-Z][A-Z\s\-']+)(?:\n|$)/i,
    // Matches full name in all caps at the start of a line
    /^([A-Z][A-Z\s\-']+[A-Z])(?:\n|$)/m,
    // Matches name before common license number patterns
    /^([A-Z][A-Z\s\-']+[A-Z])(?=\s*(?:\n|\d|LICENSE|PERMIS|MATR|N°|ID|\b[0-9]{6,}\b))/i,
  ];

  // Patterns for extracting license number/ID
  const licensePatterns = [
    // Matches formats like "N°: 175074037252" or "ID: 175074037252"
    /(?:N°|NUMÉRO|NUMERO|ID|IDENTIFIANT|MATRICULE?)[\s:]*([A-Z0-9\-\s]{6,15})/i,
    // Matches 10-12 digit numbers (common for Moroccan IDs)
    /\b(\d{10,12})\b/,
    // Matches alphanumeric IDs with common patterns
    /\b([A-Z0-9]{2,3}[\-\s]?\d{4,8}[A-Z0-9]?)\b/i,
  ];

  // Patterns for extracting car model
  const carModelPatterns = [
    // Matches formats like "VEHICULE: HONDA CIVIC 2021"
    /(?:VÉHICULE?|VOITURE|MOD[EÈ]LE?|MARQUE|IMMATRICULATION|MODEL)[\s:]+([A-Z0-9\s\-]+)(?:\n|$)/i,
    // Matches common car model patterns (Brand + Model + Year)
    /\b([A-Z]{2,}[A-Z0-9\s\-]+(?:\d{4})?)\b/,
  ];

  // Extract name
  let name = 'Unknown Driver';
  for (const pattern of namePatterns) {
    const match = normalizedText.match(pattern);
    if (match?.[1]) {
      name = cleanText(match[1])
        .replace(/^(MR|MRS|MISS|MS|DR|PROF|ENG|ING)\.?\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (name.length >= 3) break;
    }
  }

  // Extract license number/ID
  let licensePlate = '';
  for (const pattern of licensePatterns) {
    const match = normalizedText.match(pattern);
    const matchedText = match?.[1] || match?.[0];
    if (matchedText) {
      licensePlate = matchedText
        .replace(/[^A-Z0-9]/g, '')
        .toUpperCase();
      if (licensePlate.length >= 6) break;
    }
  }

  // Extract car model
  let carModel = 'Unknown Vehicle';
  for (const pattern of carModelPatterns) {
    const match = normalizedText.match(pattern);
    const matchedText = match?.[1] || match?.[0];
    if (matchedText) {
      carModel = cleanText(matchedText)
        .replace(/[0-9]{2,}/, '')
        .replace(/\b(?:MODEL|MODELE|MARQUE|VÉHICULE|VOITURE|IMMATRICULATION|TYPE)\b/gi, '')
        .replace(/[^\w\s\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (carModel.length >= 3) break;
    }
  }

  // Generate initials from name
  const commonPrefixes = ['EL', 'AL', 'BEN', 'BENT', 'OULED', 'OULD', 'AL-'];
  const initials = name
    .split(/\s+/)
    .filter(n => n.length > 0 && !commonPrefixes.includes(n.toUpperCase()))
    .slice(0, 2)
    .map(n => n[0] || '')
    .join('')
    .toUpperCase()
    .substring(0, 2) || '??';

  // Validate required fields
  if (!name || name === 'Unknown Driver' || !licensePlate) {
    console.warn('Failed to extract required driver information');
    console.debug('Available text:', normalizedText);
    return null;
  }

  // Create and return the driver info object
  return {
    name,
    licensePlate,
    carModel,
    car: carModel, // Set car to carModel for consistency
    rating: 5, // Default rating
    eta: '5 min', // Default ETA
    initials,
    position: [0, 0] as [number, number],
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
  };
};

/**
 * Verifies if a driver exists in the system based on OCR text
 * @param text The OCR text to verify
 * @param drivers Optional array of drivers to check against (defaults to all loaded drivers)
 * @returns boolean indicating if a matching driver was found
 */
export const verifyDriverFromText = (
  text: string,
  drivers: Driver[] = loadDrivers(),
): boolean => {
  try {
    if (!text || !text.trim()) return false;
    
    const searchText = text.toLowerCase();
    
    return drivers.some((driver) => {
      const driverName = (driver.name || '').toLowerCase();
      const licensePlate = (driver.licensePlate || '').toLowerCase();
      
      return (
        searchText.includes(driverName) ||
        searchText.includes(licensePlate)
      );
    });
  } catch (error) {
    console.error('Error in verifyDriverFromText:', error);
    return false;
  }
};

/**
 * Loads all drivers from localStorage
 * @returns Array of Driver objects
 */
export const loadDrivers = (): Driver[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    return storedDrivers ? JSON.parse(storedDrivers) : [];
  } catch (error) {
    console.error('Error loading drivers:', error);
    return [];
  }
};

/**
 * Saves drivers to localStorage
 * @param drivers Array of Driver objects to save
 */
export const saveDrivers = (drivers: Driver[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
  } catch (error) {
    console.error('Error saving drivers:', error);
  }
};

/**
 * Adds a new driver to the system
 * @param driver The driver data to add
 * @returns The newly added driver with generated ID and defaults
 */
export const addDriver = (
  driver: Omit<Driver, 'id' | 'verified'> & { name: string; carModel: string; licensePlate: string }
): Driver => {
  try {
    const drivers = loadDrivers();
    
    // Create a complete driver object with all required fields
    const newDriver: Driver = {
      ...driver,
      id: `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      verified: true,
      // Set defaults for optional fields
      rating: driver.rating || 5,
      eta: driver.eta || '5 min',
      position: driver.position || [0, 0],
      image: driver.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`,
      car: driver.car || driver.carModel,
      // Additional fields initialized
    };

    // Add the new driver
    drivers.push(newDriver);
    
    // Save to localStorage
    saveDrivers(drivers);
    
    return newDriver;
  } catch (error) {
    console.error('Error adding driver:', error);
    throw new Error('Failed to add driver. Please try again.');
  }
};

// Keep for backward compatibility
export const loadDriversFromFile = loadDrivers;

/**
 * Loads verified drivers from localStorage
 * @returns Array of verified Driver objects
 */
export const loadVerifiedDrivers = (): Driver[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(VERIFIED_DRIVERS_KEY);
    if (!stored) return [];
    
    const drivers = JSON.parse(stored);
    
    // Ensure all required fields have proper defaults
    return drivers.map((driver: Partial<Driver> & { [key: string]: any }) => ({
      id: driver.id || `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: driver.name || 'Unknown Driver',
      licensePlate: driver.licensePlate || '',
      carModel: driver.carModel || 'Unknown Vehicle',
      car: driver.car || driver.carModel || 'Unknown Vehicle',
      rating: driver.rating || 5,
      eta: driver.eta || '5 min',
      verified: true,
      position: Array.isArray(driver.position) ? 
        [Number(driver.position[0] || 0), Number(driver.position[1] || 0)] : 
        [0, 0],
      image: driver.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || '')}&background=random`,
      ...driver
    }));
  } catch (error) {
    console.error('Error loading verified drivers:', error);
    return [];
  }
};

/**
 * Saves a verified driver to localStorage
 * @param driverData The driver data to save
 * @returns Promise with the saved driver
 */
export const saveDriverToStorage = async (
  driverData: Partial<Driver> & { name: string; carModel: string; licensePlate: string }
): Promise<Driver> => {
  try {
    const existingDrivers = loadVerifiedDrivers();
    
    // Create a complete driver object without spreading driverData first to avoid property overwrites
    const driverToSave: Driver = {
      // Spread driverData first to allow overrides below
      ...driverData,
      // Then set specific fields, overriding any from the spread
      id: driverData.id || `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: driverData.name || 'Unknown Driver',
      licensePlate: driverData.licensePlate || '',
      carModel: driverData.carModel || 'Unknown Vehicle',
      car: driverData.car || driverData.carModel || 'Unknown Vehicle',
      rating: driverData.rating ?? 5,
      eta: typeof driverData.eta === 'number' ? driverData.eta : '5 min',
      verified: true,
      position: driverData.position || [0, 0],
      image: driverData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(driverData.name || '')}&background=random`
    };

    // Check if driver already exists (by id or licensePlate)
    const existingIndex = existingDrivers.findIndex((d) => 
      (d.id && driverData.id && d.id === driverData.id) ||
      (d.licensePlate && driverData.licensePlate && d.licensePlate === driverData.licensePlate)
    );

    // Add or update the driver
    if (existingIndex >= 0) {
      existingDrivers[existingIndex] = { ...existingDrivers[existingIndex], ...driverToSave };
    } else {
      existingDrivers.push(driverToSave);
    }

    // Save back to localStorage
    localStorage.setItem(VERIFIED_DRIVERS_KEY, JSON.stringify(existingDrivers));
    
    return driverToSave;
  } catch (error) {
    console.error('Error saving driver to storage:', error);
    throw error;
  }
};