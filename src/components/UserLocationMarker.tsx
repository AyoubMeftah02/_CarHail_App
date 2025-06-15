import { Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { type LatLngExpression } from 'leaflet';
import L from 'leaflet';

const userIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const UserLocationMarker = ({
  position,
}: {
  position: LatLngExpression | null;
}) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 18);
    }
  }, [position, map]);
  if (!position) return null;
  return (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <strong>Your Location</strong>
          <br />
          <span className="text-sm text-gray-600">You are here</span>
        </div>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;
