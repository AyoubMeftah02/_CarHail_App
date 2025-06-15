import { Marker, Popup } from 'react-leaflet';
import { type Driver } from '@/types/ride-types';
import L from 'leaflet';
import car from '@/assets/car.svg';

const driverIcon = new L.Icon({
  iconUrl: car,
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
