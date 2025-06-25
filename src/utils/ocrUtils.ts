import type { Driver } from '@/types/ride';
import Tesseract from 'tesseract.js';

/**
 * Parses driver information from OCR text
 * @param text Raw OCR text from driver's license or ID
 * @returns Parsed driver info or null if parsing fails
 */
export interface ParsedDriverInfo {
  name: string;
  licensePlate: string;
  carModel: string;
  car: string;
  price: string;
  rating: number;
  eta: number;
  image: string;
  initials: string;
  position: { lat: number; lng: number };
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
  let name = findMatch(normalizedText, patterns.name) || '';
  let licensePlate = findMatch(normalizedText, patterns.license) || '';
  const carModel = findMatch(normalizedText, patterns.carModel) || undefined;

  // If we couldn't find name/license in the expected format, try to extract them from raw text
  if (!name || !licensePlate) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Try to find name in the first few lines
    if (!name && lines.length > 0) {
      const nameLine = lines[0];
      const nameMatch = nameLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z.]*)*)/);
      if (nameMatch) name = nameMatch[1].trim();
    }
    
    // Try to find license plate in the remaining lines
    if (!licensePlate && lines.length > 1) {
      for (let i = 1; i < Math.min(5, lines.length); i++) {
        const licenseMatch = lines[i].match(/\b([A-Z0-9]{4,10})\b/);
        if (licenseMatch) {
          licensePlate = licenseMatch[1].trim();
          break;
        }
      }
    }
  }

  // Final validation
  if (!name || !licensePlate) {
    console.error('Failed to extract required information:', { name, licensePlate });
    return null;
  }

  // Clean up the extracted data
  name = name.replace(/\s+/g, ' ').trim();
  licensePlate = licensePlate.replace(/[^A-Z0-9]/g, '').toUpperCase();

  console.log('Parsed driver info:', { name, licensePlate, carModel }); // Debug log

  // Generate initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '??';

  return {
    name,
    licensePlate,
    carModel: carModel || 'Unknown Model',
    car: carModel || 'Unknown Car',
    price: '0',
    rating: 5,
    eta: 5,
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    initials,
    position: { lat: 0, lng: 0 }
  };
};

/**
 * Extracts text from an image using Tesseract.js
 * @param imageFile Image file to process
 * @returns Extracted text
 */
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};
