import type { Driver } from '@/types/ride';

const STORAGE_KEY = 'staticDrivers';

export const STATIC_DRIVERS: Driver[] = [
  {
    id: 'hamza-zeroual',
    name: 'Hamza Zeroual',
    carModel: 'Dacia Logan',
    licensePlate: '12345-HZ',
    rating: 4.8,
    eta: '5 min',
    verified: true,
    ethAddress: '0x4521422D468d52Ed41d8c7aF4cf86b59D1D2901b',
    price: '0.005 ETH',
    image: 'https://ui-avatars.com/api/?name=Hamza+Zeroual&background=random',
    initials: 'HZ',
  },
  {
    id: 'yahya-chraibi',
    name: 'Yahya Chraibi',
    carModel: 'Renault Clio',
    licensePlate: '67890-YC',
    rating: 4.9,
    eta: '6 min',
    verified: true,
    ethAddress: '0xFFE011071051AaAeE7e4C766d4E61c3B84718926',
    price: '0.006 ETH',
    image: 'https://ui-avatars.com/api/?name=Yahya+Chraibi&background=random',
    initials: 'YC',
  },
  {
    id: 'ibrahim-bouzidi',
    name: 'Ibrahim Bouzidi',
    carModel: 'Peugeot 208',
    licensePlate: '34567-IB',
    rating: 4.7,
    eta: '4 min',
    verified: true,
    ethAddress: '0xC4c5bD09581aCc6ABee9FF71922e332BE5A24E6D',
    price: '0.007 ETH',
    image: 'https://ui-avatars.com/api/?name=Ibrahim+Bouzidi&background=random',
    initials: 'IB',
  },
];

function readFromStorage(): Driver[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Driver[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(drivers: Driver[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
  } catch {
    /* ignore */
  }
}

/**
 * Ensure our three static drivers exist in localStorage and return the full list.
 */
export function ensureStaticDrivers(): Driver[] {
  const stored = readFromStorage();
  const byId = new Map(stored.map((d) => [d.id, d] as const));
  let changed = false;
  for (const d of STATIC_DRIVERS) {
    if (!byId.has(d.id)) {
      byId.set(d.id, d);
      changed = true;
    }
  }
  if (changed) writeToStorage(Array.from(byId.values()));
  return Array.from(byId.values());
}
