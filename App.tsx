import React, { useState, useCallback } from 'react';
import LocationInput from './components/LocationInput';
import RouteList from './components/RouteList';
import MapPreview from './components/MapPreview';
import { LocationData, RouteState, RouteStatus } from './types';
import { resolveLocationsWithGemini } from './services/gemini';
import { optimizeRouteLocations, generateGoogleMapsUrl } from './utils/geoUtils';
import { Route, Share2, AlertCircle, Menu, X, RotateCcw, HelpCircle } from 'lucide-react';

export default function App() {
  const [routeState, setRouteState] = useState<RouteState>({
    locations: [],
    status: RouteStatus.IDLE
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputKey, setInputKey] = useState(0); 

  const handleResolveLocations = useCallback(async (start: string, stops: string[], end: string) => {
    setRouteState(prev => ({ ...prev, status: RouteStatus.LOADING, errorMessage: undefined }));
    
    try {
      // Create ordered list of inputs to resolve
      const allInputs = [start, ...stops];
      if (end.trim()) allInputs.push(end);

      // 1. Resolve locations using Gemini (Maps Grounding)
      const resolved = await resolveLocationsWithGemini(allInputs);
      
      // 2. Optimize the route (Client-side TSP with fixed Start and End)
      setRouteState(prev => ({ ...prev, status: RouteStatus.OPTIMIZING }));
      
      const optimized = optimizeRouteLocations(resolved);
      
      setRouteState({
        locations: optimized,
        status: RouteStatus.READY
      });
    } catch (error: any) {
      console.error("Error processing route:", error);
      setRouteState({
        locations: [],
        status: RouteStatus.ERROR,
        errorMessage: error.message || "No se pudieron resolver las ubicaciones. Por favor, verifica tu conexión e inténtalo de nuevo."
      });
    }
  }, []);

  const openGoogleMaps = () => {
    const url = generateGoogleMapsUrl(routeState.locations);
    window.open(url, '_blank');
  };

  const handleShare = () => {
     const url = generateGoogleMapsUrl(routeState.locations);
     if (navigator.share) {
         navigator.share({
             title: 'Mi Ruta en Thunder Routes',
             text: `¡Mira la ruta optimizada que he creado!`,
             url: url
         }).catch(console.error);
     } else {
         navigator.clipboard.writeText(url);
         alert("¡Enlace de Google Maps copiado al portapapeles!");
     }
  };

  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar la ruta actual y empezar de nuevo?")) {
        setRouteState({ locations: [], status: RouteStatus.IDLE });
        setInputKey(prev => prev + 1); 
        setIsMenuOpen(false);
    }
  };

  const handleHelp = () => {
      alert("1. Introduce el punto de partida.\n2. Añade paradas intermedias.\n3. Especifica un destino final fijo.\n4. Reordenaremos las paradas intermedias para el trayecto más eficiente entre tu inicio y tu meta.");
      setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Route className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Thunder Routes</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {routeState.status === RouteStatus.READY && (
                <button 
                onClick={handleShare}
                className="hidden sm:flex p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title="Compartir Ruta"
                >
                <Share2 className="w-5 h-5" />
                </button>
            )}

            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors focus:outline-none"
                    aria-label="Menú"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menú</p>
                            </div>
                            
                            <button 
                                onClick={handleReset}
                                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4 text-slate-400" />
                                Nueva Ruta
                            </button>
                            
                            <button 
                                onClick={handleHelp}
                                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                            >
                                <HelpCircle className="w-4 h-4 text-slate-400" />
                                Ayuda y Consejos
                            </button>
                            
                            {routeState.status === RouteStatus.READY && (
                                <button 
                                    onClick={() => { handleShare(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 sm:hidden border-t border-slate-50 mt-1 pt-3"
                                >
                                    <Share2 className="w-4 h-4 text-slate-400" />
                                    Compartir Ruta
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-50 flex flex-col border-r border-slate-200 overflow-y-auto z-10">
            <div className="p-4 space-y-4 flex-grow">
                {routeState.status === RouteStatus.ERROR && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 text-sm border border-red-100">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">No se pudo planificar la ruta</p>
                            <p>{routeState.errorMessage}</p>
                        </div>
                    </div>
                )}

                <LocationInput 
                    key={inputKey}
                    onResolve={handleResolveLocations} 
                    isLoading={routeState.status === RouteStatus.LOADING || routeState.status === RouteStatus.OPTIMIZING} 
                />

                {routeState.status === RouteStatus.READY && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <RouteList 
                            locations={routeState.locations} 
                            openGoogleMaps={openGoogleMaps}
                        />
                    </div>
                )}
                
                {routeState.status === RouteStatus.IDLE && (
                    <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Route className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800">Planifica tu viaje perfecto</h3>
                        <p className="text-slate-500 mt-2 text-sm">
                            Fija un inicio y un final. Nosotros nos encargamos de que las paradas intermedias sigan el camino más corto con el poder de Thunder Routes.
                        </p>
                    </div>
                )}
            </div>
            
            <footer className="p-4 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
                Thunder Routes &copy; 2024 | Impulsado por Gemini 2.5 y Google Maps
            </footer>
        </div>

        {/* Map Area */}
        <div className="flex-grow bg-slate-200 relative">
             <div className="absolute inset-0 z-0">
                 <MapPreview locations={routeState.locations} />
             </div>
             
             {(routeState.status === RouteStatus.LOADING || routeState.status === RouteStatus.OPTIMIZING) && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                     <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                     <p className="text-slate-700 font-medium">
                        {routeState.status === RouteStatus.LOADING ? 'Buscando ubicaciones...' : 'Calculando ruta óptima...'}
                     </p>
                 </div>
             )}
        </div>
      </main>
    </div>
  );
}