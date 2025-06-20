export interface Driver {
  id: string;
  name: string;
  rating: number;
  eta: number;
  carModel: string;
  licensePlate: string;
  verified?: boolean;
}

export const verifyDriver = (driverId: string, drivers: Driver[]): Driver | null => {
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return null;
  
  const verifiedDriver = { ...driver, verified: true };
  // Store in localStorage
  localStorage.setItem('verifiedDriver', JSON.stringify(verifiedDriver));
  return verifiedDriver;
};

export const getVerifiedDriver = (): Driver | null => {
  const stored = localStorage.getItem('verifiedDriver');
  return stored ? JSON.parse(stored) : null;
};

export const isDriverVerified = (driverId: string): boolean => {
  const stored = getVerifiedDriver();
  return stored?.id === driverId && stored?.verified === true;
};
