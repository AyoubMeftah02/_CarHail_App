import type { Driver } from '@/types/ride';
import Tesseract from 'tesseract.js';

// Helper function to format dates from various formats to YYYY-MM-DD
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  
  // Try to parse various date formats
  const formats = [
    // YYYY-MM-DD
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/,
    // DD/MM/YYYY or DD-MM-YYYY
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/,
    // MM/DD/YYYY or MM-DD-YYYY
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year = match[1];
      let month = match[2];
      let day = match[3];

      // Handle 2-digit years
      if (year.length === 2) year = `20${year}`;
      
      // Ensure 2-digit month and day
      month = month.padStart(2, '0');
      day = day.padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  }
  
  return '';
};

// Helper function to extract a match from text using a pattern
const extractMatch = (text: string, patterns: RegExp | RegExp[]): string | null => {
  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  const normalizedText = text.toLowerCase();
  
  for (const pattern of patternArray) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

/**
 * Parses driver information from OCR text
 * @param text Raw OCR text from driver's license or ID
 * @returns Parsed driver info or null if parsing fails
 */

interface ParsedDriverInfo {
  id: string;
  name: string;
  licenseId: string;
  car: string;
  issueDate: string; // Date in YYYY-MM-DD format
  expiry: string; // Date in YYYY-MM-DD format
  // Additional fields for backward compatibility
  licensePlate?: string;
  carModel?: string;
  price?: string;
  rating?: number;
  eta?: string;
  image?: string;
  initials: string;
  position: [number, number];
}

export const parseDriverInfo = (text: string): ParsedDriverInfo | null => {
  console.log('Raw OCR text:', text); // Debug log
  if (!text) {
    console.error('No text provided to parseDriverInfo');
    return null;
  }

  // Normalize text for easier matching
  const normalizedText = text.toLowerCase().trim();
  
  // More flexible patterns to match different ID formats
  const patterns = {
    // Matches formats like "Name: John Doe" or "Full Name: John A. Doe"
    name: [
      /(?:name|full[\s-]?name)[:\s]+([a-z\s.'-]+(?:\s+[a-z.'-]+)*)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)(?:\s|$)/,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)(?=\s*\d)/
    ],
    // Matches formats like "DL: AB123456" or "License #: AB-1234"
    license: [
      /(?:license|id|number|dl)[\s:]+([a-z0-9-\s]+)/i,
      /\b([A-Z0-9]{5,20})\b/,
      /\b(?:[A-Z0-9]{2,3}[-\s]?[0-9]{4,6})\b/
    ],
    // Matches car model formats
    carModel: [
      /(?:vehicle|car|model|make\/model)[\s:]+([a-z0-9\s-]+)/i,
      /(toyota|honda|ford|bmw|mercedes|audi|hyundai|kia|nissan|volkswagen|chevrolet|tesla|subaru|mazda|lexus|jeep|ram|gmc|buick|cadillac|acura|infiniti|porsche|jaguar|land rover|volvo|mini|mitsubishi|chrysler|dodge|fiat|alfa romeo|maserati|ferrari|lamborghini|bentley|rolls-royce|mclaren|aston martin|lotus|genesis|suzuki|proton|perodua|proton|perodua|tata|mahindra|mg|haval|great wall|chery|geely|brilliance|jac|dongfeng|faw|byd|changan|gac|jac|jac|jac)\b/i
    ]
  };

  // Helper function to find first matching pattern
  const findMatch = (text: string, patterns: RegExp[]): string | null => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  };

  // Extract information using patterns
  const extractedName = findMatch(normalizedText, patterns.name) || '';
  const extractedLicense = findMatch(normalizedText, patterns.license) || '';
  const extractedCarModel = findMatch(normalizedText, patterns.carModel) || '';

  // If we couldn't find name/license in the expected format, try to extract them from raw text
  let finalName = extractedName;
  let finalLicense = extractedLicense;
  
  if (!extractedName || !extractedLicense) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Try to find name in the first few lines
    if (!finalName && lines.length > 0) {
      const nameLine = lines[0];
      const nameMatch = nameLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z.]*)*)/);
      if (nameMatch) finalName = nameMatch[1].trim();
    }
    
    // Try to find license plate in the remaining lines
    if (!finalLicense && lines.length > 1) {
      for (let i = 1; i < Math.min(5, lines.length); i++) {
        const licenseMatch = lines[i].match(/\b([A-Z0-9]{4,10})\b/);
        if (licenseMatch) {
          finalLicense = licenseMatch[1].trim();
          break;
        }
      }
    }
  };

  // Prepare final values with fallbacks
  const name = finalName || 'Unknown Driver';
  const licenseId = finalLicense || '';
  const car = extractedCarModel || 'Unknown Vehicle';
  const licensePlate = licenseId.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // For dates, we'll use current date + 1 year as default
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  // Generate a unique ID for the driver
  const generateId = () => `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create and return the parsed driver object
  const driver: ParsedDriverInfo = {
    id: generateId(),
    name,
    licenseId: licenseId || 'UNKNOWN',
    car,
    carModel: car, // For backward compatibility
    licensePlate, // For backward compatibility
    issueDate: today,
    expiry: oneYearLater,
    // Additional fields for backward compatibility
    price: '0.01 ETH',
    rating: 5,
    eta: '5 min',
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    initials: name
      .split(' ')
      .map((n) => n[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2),
    position: [0, 0] as [number, number]
  };

  return driver;
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};
