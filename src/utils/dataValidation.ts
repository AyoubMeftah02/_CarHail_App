export const validateLicenseFormat = (license: string): boolean => {
  // Implement license format validation logic
  return /^[A-Z0-9]{1,7}$/.test(license);
};

export const sanitizeDriverName = (name: string): string => {
  // Remove unwanted characters and trim spaces
  return name.replace(/[^a-zA-Z\s]/g, '').trim();
};

export const handleCorruptedData = (data: string): string => {
  // Logic to handle and clean corrupted OCR data
  return data.replace(/\s+/g, ' ').trim();
};
