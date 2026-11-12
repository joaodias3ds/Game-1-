/**
 * Soviet Republic: Workers & Logistics
 * Route Manager Component ("Gerenciador de Linhas & Rotas de Transporte")
 */

import React, { useState } from 'react';
import { GameState } from '../game/simulation';
import { AutomatedRoute, RouteStop, Building, Vehicle } from '../game/types';
import { INITIAL_MARKET_PRICES } from '../game/rules';
import { sound } from '../game/sound';
import {
  X,
  Route,
  Plus,
  Play,
  Pause,
  Trash2,
  Truck,
  ArrowRight,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RouteManagerProps {
  state: GameState;
  onClose: () => void;
  onSaveRoute: (route: AutomatedRoute) => void;
  onDeleteRoute: (routeId: string) => void;
  initialVehicleId?: string;
}

export const RouteManager: React.FC<RouteManagerProps> = ({
  state,
  onClose,
  onSaveRoute,
  onDeleteRoute,
  initialVehicleId,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [originBuildingId, setOriginBuildingId] = useState(state.buildings[0]?.id || '');
  const [destBuildingId, setDestBuildingId] = useState(
    state.buildings.find((b) => !b.isConstructed)?.id || state.buildings[1]?.id || ''
  );
  const [selectedResource, setSelectedResource] = useState('brita');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    initialVehicleId ? [initialVehicleId] : []
  );

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim() || !originBuildingId || !destBuildingId) return;

    const newRoute: AutomatedRoute = {
      id: `route_${Date.now()}`,
      name: routeName.trim(),
      isActive: true,
      totalTrips: 0,
      tonsTransported: 0,
      assignedVehicleIds: selectedVehicleIds,
      stops: [
        {
          buildingId: originBuildingId,
          action: 'load',
          resourceId: selectedResource,
          targetPercent: 100,
        },
        {
          buildingId: destBuildingId,
          action: 'unload',
          resourceId: selectedResource,
          targetPercent: 0,
        },
      ],
    };

    onSaveRoute(newRoute);
    setIsCreatingNew(false);
    setRouteName('');
    sound.playStampTrade();
  };

  const toggleRouteActive = (route: AutomatedRoute) => {
    onSaveRoute({
      ...route,
      isActive: !route.isActive,
    });
    sound.playClick();
  };

  const getBuildingName = (id: string) => {
    return state.buildings.find((b) => b.id === id)?.name || id;
  };

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 w-[620px] max-w-[95vw] max-h-[85vh] bg-[#fbf5e8] border-2 border-[#b91c1c] rounded shadow-2xl flex flex-col font-serif text-[#1c1917] overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#991b1b] text-white">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-yellow-400" />
          <h2 className="font-bold text-sm tracking-wide">
            Gerenciador de Linhas &amp; Rotas Automatizadas
          </h2>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="hover:text-white hover:bg-[#b91c1c] p-1 rounded transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description Banner */}
      <div className="px-4 py-2.5 bg-[#f5ecda] border-b border-[#ddceb3] text-xs text-stone-700 flex items-center justify-between">
        <div>
          <span className="font-bold text-stone-900 block">
            Logística Centralizada de Abastecimento
          </span>
          Programe pontos de carga e descarga automáticos. Os veículos seguirão estritamente as rodovias conectadas.
        </div>
        {!isCreatingNew && (
          <button
            onClick={() => {
              sound.playClick();
              setIsCreatingNew(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded font-sans text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova Rota
          </button>
        )}
      </div>

      {/* Route Creator Form */}
      {isCreatingNew ? (
        <form onSubmit={handleCreateRoute} className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center justify-between border-b border-[#dfcfb4] pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wide text-red-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Configurar Nova Rota Logística
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Cancelar
            </button>
          </div>

          {/* Route Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Nome Identificador da Linha:
            </label>
            <input
              type="text"
              required
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Ex: Rota Brita: Pedreira -> Usina de Britagem"
              className="w-full px-3 py-1.5 bg-[#fffdf8] border border-[#cfc0a3] rounded text-xs text-stone-900 font-sans focus:outline-none focus:ring-1 focus:ring-[#b91c1c]"
            />
          </div>

          {/* Stop 1: Pickup / Load */}
          <div className="p-2.5 bg-[#fdf9f0] border border-[#e5d8be] rounded space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Parada 1: Ponto de Coleta (Carga)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                  Edifício de Origem:
                </label>
                <select
                  value={originBuildingId}
                  onChange={(e) => setOriginBuildingId(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#cfc0a3] rounded text-xs text-stone-900 font-sans"
                >
                  {state.buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                  Recurso Transportado:
                </label>
                <select
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#cfc0a3] rounded text-xs text-stone-900 font-sans capitalize"
                >
                  {INITIAL_MARKET_PRICES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stop 2: Drop-off / Unload */}
          <div className="p-2.5 bg-[#fdf9f0] border border-[#e5d8be] rounded space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Parada 2: Ponto de Destino (Descarga)</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                Edifício de Destino (Armazém, Obra ou Fábrica):
              </label>
              <select
                value={destBuildingId}
                onChange={(e) => setDestBuildingId(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-[#cfc0a3] rounded text-xs text-stone-900 font-sans"
              >
                {state.buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {!b.isConstructed ? '(Canteiro de Obras)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Assignment */}
          <div className="p-2.5 bg-[#fdf9f0] border border-[#e5d8be] rounded space-y-1.5 text-xs">
            <label className="block font-semibold text-stone-800">
              Caminhões da Frota Designados:
            </label>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {state.vehicles.map((v) => (
                <label key={v.id} className="flex items-center gap-2 cursor-pointer font-sans text-xs">
                  <input
                    type="checkbox"
                    checked={selectedVehicleIds.includes(v.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVehicleIds([...selectedVehicleIds, v.id]);
                      } else {
                        setSelectedVehicleIds(selectedVehicleIds.filter((id) => id !== v.id));
                      }
                    }}
                    className="rounded text-red-700 focus:ring-0"
                  />
                  <span>
                    {v.name} ({v.type}) · Combustível: {Math.floor(v.fuel)}%
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded font-sans text-xs font-bold shadow-md transition-colors"
          >
            Salvar e Ativar Rota Automática
          </button>
        </form>
      ) : (
        /* Existing Routes List */
        <div className="p-4 space-y-2.5 overflow-y-auto max-h-[60vh] scrollbar-thin">
          {state.routes.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs italic">
              Nenhuma linha automatizada configurada. Clique em "Nova Rota" acima para programar o transporte entre edifícios.
            </div>
          ) : (
            state.routes.map((route) => (
              <div
                key={route.id}
                className="p-3 bg-[#f8f1e2] border border-[#dfcfb4] rounded shadow-xs space-y-2"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRouteActive(route)}
                      className={`p-1 rounded ${
                        route.isActive ? 'bg-emerald-700 text-white' : 'bg-stone-300 text-stone-700'
                      }`}
                      title={route.isActive ? 'Pausar Linha' : 'Retomar Linha'}
                    >
                      {route.isActive ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <span className="font-bold text-xs text-stone-900">{route.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold ${
                        route.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {route.isActive ? 'Ativa' : 'Pausada'}
                    </span>
                    <button
                      onClick={() => onDeleteRoute(route.id)}
                      className="text-stone-400 hover:text-red-700 p-0.5"
                      title="Excluir Rota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Path itinerary display */}
                <div className="flex items-center gap-2 text-[11px] text-stone-700 font-sans bg-[#fdfaf3] p-2 rounded border border-[#e8ddc7]">
                  <div className="flex items-center gap-1 text-amber-900 font-semibold truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                    <span>{getBuildingName(route.stops[0]?.buildingId)}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <div className="flex items-center gap-1 text-emerald-900 font-semibold truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>{getBuildingName(route.stops[1]?.buildingId)}</span>
                  </div>
                  <div className="ml-auto font-mono text-stone-600 shrink-0 capitalize">
                    {route.stops[0]?.resourceId}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-[11px] text-stone-600 font-mono pt-0.5">
                  <span>Veículos na linha: {route.assignedVehicleIds.length}</span>
                  <span>Viagens completadas: {route.totalTrips}</span>
                  <span>Total transportado: {route.tonsTransported.toFixed(1)} t</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
