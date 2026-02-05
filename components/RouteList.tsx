import React from 'react';
import { LocationData } from '../types';
import { GripVertical, Navigation, Map } from 'lucide-react';

interface RouteListProps {
  locations: LocationData[];
  onReorder?: (newLocations: LocationData[]) => void;
  openGoogleMaps: () => void;
}

const RouteList: React.FC<RouteListProps> = ({ locations, openGoogleMaps }) => {
  if (locations.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-500" />
            Ruta Optimizada
        </h2>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
            {locations.length} Paradas
        </span>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {locations.map((loc, index) => (
          <div key={loc.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
            <div className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
              <GripVertical className="w-4 h-4" />
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-slate-900 truncate pr-2">
                    <span className="text-slate-400 font-normal mr-2">#{index + 1}</span>
                    {loc.name || loc.originalInput}
                </h3>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {loc.address || "Dirección no encontrada"}
              </p>
              {loc.googleMapsUri && (
                  <a href={loc.googleMapsUri} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                      Ver detalles
                  </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={openGoogleMaps}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/20 transition-all active:scale-95"
        >
          <Map className="w-5 h-5" />
          Iniciar Navegación en Google Maps
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">
            Abre las indicaciones estándar de Google Maps con todas las paradas precargadas.
        </p>
      </div>
    </div>
  );
};

export default RouteList;