interface DriverInfo {
  name: string;
  id: string;
  rating: number;
}

interface VehicleInfo {
  type: string;
  licensePlate: string;
}

interface VerificationInfo {
  status: string;
  details: string;
}

interface DriverIdentification {
  driverInfo: DriverInfo;
  vehicleInfo: VehicleInfo;
  publicAddress: string;
  verification: VerificationInfo;
}

/**
 * Parses driver information from OCR text to match the driver identification card format
 * @param text Raw OCR text from driver's identification
 * @returns Parsed driver identification info or null if parsing fails
 */
export const parseDriverInfo = (text: string): DriverIdentification | null => {
  if (!text) {
    console.error('No text provided to parseDriverInfo');
    return null;
  }

  // Normalize text for easier matching
  const normalizedText = text.toLowerCase().trim();
  
  // Patterns to match the driver identification card format
  const patterns = {
    // Matches driver name (e.g., "Hamza Zerouali")
    name: /(?:driver[\s-]?name|name)[\s:]+([a-z\s.'-]+(?:\s+[a-z.'-]+)*)/i,
    
    // Matches driver ID (e.g., "HZ-2024-001")
    driverId: /(?:id|driver[\s-]?id)[\s:]+([a-z0-9-]+)/i,
    
    // Matches rating (e.g., "4.8")
    rating: /(?:rating|driver[\s-]?rating)[\s:]+(\d+(?:\.\d+)?)/i,
    
    // Matches vehicle type (e.g., "Dacia Logan")
    vehicleType: /(?:vehicle[\s-]?type|car[\s-]?model|type)[\s:]+([a-z0-9\s-]+)/i,
    
    // Matches license plate (e.g., "12345-HZ")
    licensePlate: /(?:license[\s-]?plate|plate[\s-]?number|plate)[\s:]+([a-z0-9-]+)/i,
    
    // Matches public address (e.g., "0x4521422D468D52Ed41d8c7aF")
    publicAddress: /(?:public[\s-]?address|address|wallet)[\s:]+(0x[a-f0-9]+)/i
  };
  
  // Extract data using patterns
  const extractField = (pattern: RegExp): string | null => {
    const match = normalizedText.match(pattern);
    return match ? match[1].trim() : null;
  };
  
  // Extract driver information
  const driverName = extractField(patterns.name) || 'Unknown Driver';
  const driverId = extractField(patterns.driverId) || 'N/A';
  const rating = parseFloat(extractField(patterns.rating) || '0');
  
  // Extract vehicle information
  const vehicleType = extractField(patterns.vehicleType) || 'Unknown Vehicle';
  const licensePlate = extractField(patterns.licensePlate) || 'N/A';
  
  // Extract public address
  const publicAddress = extractField(patterns.publicAddress) || '0x' + '0'.repeat(40);
  
  // Create verification info
  const verification = {
    status: 'Driver Verified',
    details: `VEHICLE INFO: ${vehicleType} - ${driverName}`
  };
  
  return {
    driverInfo: {
      name: driverName,
      id: driverId,
      rating: isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating)) // Ensure rating is between 0 and 5
    },
    vehicleInfo: {
      type: vehicleType,
      licensePlate: licensePlate
    },
    publicAddress: publicAddress,
    verification: verification
  };
}

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};
