import React, { useState } from 'react';
import { Plus, X, MapPin, FileText, List, Flag, Home } from 'lucide-react';

interface LocationInputProps {
  onResolve: (start: string, stops: string[], end: string) => void;
  isLoading: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ onResolve, isLoading }) => {
  const [mode, setMode] = useState<'list' | 'bulk'>('list');
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [inputs, setInputs] = useState<string[]>(['']); 
  const [bulkText, setBulkText] = useState('');

  const toggleMode = () => {
    if (mode === 'list') {
      const all = [startInput, ...inputs, endInput].map(i => i.trim()).filter(i => i !== '');
      setBulkText(all.join('\n'));
      setMode('bulk');
    } else {
      const lines = bulkText.split('\n').filter(l => l.trim() !== '');
      if (lines.length > 0) {
        setStartInput(lines[0]);
        if (lines.length > 1) {
          setEndInput(lines[lines.length - 1]);
          setInputs(lines.slice(1, -1).length > 0 ? lines.slice(1, -1) : ['']);
        } else {
          setEndInput('');
          setInputs(['']);
        }
      }
      setMode('list');
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addField = () => {
    setInputs([...inputs, '']);
  };

  const removeField = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs.length > 0 ? newInputs : ['']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'list') {
      const validStops = inputs.filter(i => i.trim() !== '');
      onResolve(startInput, validStops, endInput);
    } else {
      const lines = bulkText.split('\n').filter(i => i.trim() !== '');
      if (lines.length >= 2) {
        onResolve(lines[0], lines.slice(1, -1), lines[lines.length - 1]);
      } else if (lines.length === 1) {
        onResolve(lines[0], [], '');
      }
    }
  };

  const isSubmitDisabled = isLoading || (mode === 'list' ? !startInput.trim() : !bulkText.trim());

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
            <MapPin className="w-5 h-5 text-blue-500" />
            Configurar Ruta
        </h2>
        <button 
            onClick={toggleMode}
            type="button"
            className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1 hover:bg-slate-50 rounded"
        >
            {mode === 'list' ? (
                <><FileText className="w-4 h-4" /> Entrada Masiva</>
            ) : (
                <><List className="w-4 h-4" /> Vista de Lista</>
            )}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'list' ? (
            <div className="space-y-4">
                {/* START FIELD */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 block">Punto de Partida</label>
                    <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                            type="text"
                            value={startInput}
                            onChange={(e) => setStartInput(e.target.value)}
                            placeholder="¿Desde dónde sales?"
                            className="w-full pl-10 pr-4 py-2 bg-blue-50/30 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                    </div>
                </div>

                {/* STOPS FIELDS */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Paradas Intermedias</label>
                    {inputs.map((input, index) => (
                    <div key={index} className="flex gap-2">
                        <div className="relative flex-grow">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                                {index + 1}
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                placeholder="Añadir parada..."
                                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                    <button
                        type="button"
                        onClick={addField}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir otra parada
                    </button>
                </div>

                {/* END FIELD */}
                <div className="relative pt-2 border-t border-slate-50">
                    <label className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1 block">Destino Final (Fijo)</label>
                    <div className="relative">
                        <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                        <input
                            type="text"
                            value={endInput}
                            onChange={(e) => setEndInput(e.target.value)}
                            placeholder="¿Dónde termina el viaje?"
                            className="w-full pl-10 pr-4 py-2 bg-red-50/30 border border-red-100 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
                        />
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Primera línea: Inicio&#10;Líneas centrales: Paradas&#10;Última línea: Destino Final"
                    className="w-full h-64 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none custom-scrollbar leading-relaxed"
                />
                <p className="mt-2 text-xs text-slate-400">
                    La primera línea será el inicio y la última el destino final fijo.
                </p>
            </div>
        )}

        <div className="pt-4 flex justify-end">
            <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg ${
                    isSubmitDisabled
                    ? 'bg-slate-300 shadow-none cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95'
                }`}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Optimizar Ruta'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default LocationInput;