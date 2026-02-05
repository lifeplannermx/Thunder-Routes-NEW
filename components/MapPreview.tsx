import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationData } from '../types';

// Fix for default Leaflet marker icons in React by using CDN URLs directly
// instead of importing image files which fails in browser ESM environments.
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPreviewProps {
  locations: LocationData[];
}

const BoundsHandler = ({ locations }: { locations: LocationData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat || 0, l.lng || 0]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

const MapPreview: React.FC<MapPreviewProps> = ({ locations }) => {
  const validLocations = locations.filter(l => l.lat !== undefined && l.lng !== undefined);
  
  if (validLocations.length === 0) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
        <p>Vista previa del mapa no disponible</p>
      </div>
    );
  }

  // Calculate center based on first location or world 0,0
  const center: [number, number] = validLocations.length > 0 
    ? [validLocations[0].lat!, validLocations[0].lng!] 
    : [0, 0];

  const polylinePositions = validLocations.map(l => [l.lat!, l.lng!] as [number, number]);

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {validLocations.map((loc, idx) => (
        <Marker key={loc.id} position={[loc.lat!, loc.lng!]}>
          <Popup>
            <div className="text-sm">
              <span className="font-bold block">Parada #{idx + 1}</span>
              {loc.name}<br/>
              <span className="text-xs text-gray-500">{loc.address}</span>
            </div>
          </Popup>
        </Marker>
      ))}

      <Polyline positions={polylinePositions} color="#3b82f6" weight={4} opacity={0.7} />
      <BoundsHandler locations={validLocations} />
    </MapContainer>
  );
};

export default MapPreview;