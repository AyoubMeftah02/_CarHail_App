import type { Driver } from '@/types/ride';
import Tesseract from 'tesseract.js';

// Validate license format
export const validateLicenseFormat = (license: string): boolean => {
  return /^[A-Z0-9]{1,7}$/.test(license);
};

// Sanitize driver name
export const sanitizeDriverName = (name: string): string => {
  return name.replace(/[^a-zA-Z\s]/g, '').trim();
};

// Handle corrupted OCR data
export const handleCorruptedData = (data: string): string => {
  return data.replace(/\s+/g, ' ').trim();
};

// Format dates to YYYY-MM-DD
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const formats = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/,
  ];
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    }
  }
  return '';
};

// Extract text from image
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  const { data: { text } } = await Tesseract.recognize(imageFile);
  return text;
};

// Parse driver info from OCR text
export const parseDriverInfo = (text: string): Driver | null => {
  // Implement parsing logic here
  return null;
};
