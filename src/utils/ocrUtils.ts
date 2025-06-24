import type { Driver } from '@/types/ride';

/**
 * Parses driver information from OCR text
 * @param text Raw OCR text from driver's license or ID
 * @returns Parsed driver info or null if parsing fails
 */
export const parseDriverInfo = (text: string): Omit<Driver, 'id' | 'verified' | 'rating' | 'eta' | 'image' | 'initials' | 'position' | 'price' | 'car'> | null => {
  if (!text) return null;

  // Normalize text for easier matching
  const normalizedText = text.toLowerCase().trim();
  
  // Simple regex patterns to extract information
  const nameMatch = normalizedText.match(/(?:name|full name)[:\s]+([a-z\s]+)/i);
  const licenseMatch = normalizedText.match(/(?:license|id|number)[:\s]+([a-z0-9\-\s]+)/i);
  
  // Extract car model if present (this is a simple example, adjust as needed)
  let carModel: string | undefined;
  const carModelMatch = normalizedText.match(/(?:vehicle|car|model)[:\s]+([a-z0-9\s]+)/i);
  if (carModelMatch) {
    carModel = carModelMatch[1].trim();
  }

  const name = nameMatch ? nameMatch[1].trim() : '';
  const licensePlate = licenseMatch ? licenseMatch[1].trim().toUpperCase() : '';

  if (!name || !licensePlate) {
    return null;
  }

  return {
    name,
    licensePlate,
    carModel,
  };
};

/**
 * Extracts text from an image using Tesseract.js
 * @param imageFile Image file to process
 * @returns Extracted text
 */
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    // This is a placeholder - in a real app, you would use Tesseract.js
    // const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
    // return text;
    
    // For now, return a mock response
    return 'MOCK OCR TEXT: Name: John Doe\nLicense: ABC123\nVehicle: Tesla Model 3';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};
