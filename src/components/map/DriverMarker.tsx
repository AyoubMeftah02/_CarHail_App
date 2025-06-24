import { Marker, Popup } from 'react-leaflet';
import { type Driver } from '@/types/ride';
import L from 'leaflet';

// Inline SVG for car icon
const carIconSvg = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="currentColor"/>
  </svg>
`;

// Convert SVG to data URL
const carIconUrl = `data:image/svg+xml;base64,${btoa(carIconSvg)}`;

const driverIcon = new L.Icon({
  iconUrl: carIconUrl,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const DriverMarker = ({
  driver,
  onSelect,
}: {
  driver: Driver;
  onSelect: (driver: Driver) => void;
}) => {
  return (
    <Marker position={driver.position} icon={driverIcon}>
      <Popup>
        <div className="text-center min-w-[200px]">
          <strong className="text-lg">{driver.name}</strong>
          <br />
          <div className="text-sm text-gray-600 mt-1">
            <div> {driver.rating}/5.0</div>
            <div> {driver.carModel}</div>
            <div> {driver.licensePlate}</div>
            <div>⏱ {driver.eta} min away</div>
          </div>
          <button
            onClick={() => onSelect(driver)}
            className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            Select Driver
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default DriverMarker;
