/**
 * Soviet Republic: Workers & Logistics (Edição Santa Esperança – BR)
 * Building & Vehicle Inspector Card matching image_d92ebf14.png
 */

import React from 'react';
import { Building, Vehicle } from '../game/types';
import { BUILDING_BLUEPRINTS } from '../game/rules';
import { sound } from '../game/sound';
import {
  X,
  Pin,
  CheckCircle,
  Truck,
  Package,
  HardHat,
  Zap,
  Route,
  Fuel,
  ChevronRight,
  Warehouse,
  Flame,
} from 'lucide-react';

interface BuildingInspectorProps {
  building: Building | null;
  vehicle?: Vehicle | null;
  onClose: () => void;
  onAssignWorkers: (buildingId: string, delta: number) => void;
  onOpenRouteManager: (vehicleId?: string) => void;
  fundsReais: number;
}

export const BuildingInspector: React.FC<BuildingInspectorProps> = ({
  building,
  vehicle,
  onClose,
  onAssignWorkers,
  onOpenRouteManager,
  fundsReais,
}) => {
  // If inspecting a vehicle
  if (vehicle) {
    return (
      <div className="absolute top-16 right-5 z-40 w-[350px] bg-[#121619]/95 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col font-sans text-white overflow-hidden select-none backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f766e] text-white">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal-200" />
            <h2 className="font-bold text-sm tracking-wide truncate">{vehicle.name}</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          {/* Status & Fuel */}
          <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Status da Frota:</span>
              <span
                className={`font-semibold capitalize ${
                  vehicle.status === 'traveling'
                    ? 'text-teal-400'
                    : vehicle.status === 'no_road'
                    ? 'text-red-400'
                    : vehicle.status === 'no_fuel'
                    ? 'text-amber-400'
                    : 'text-stone-300'
                }`}
              >
                {vehicle.status === 'no_road'
                  ? 'Sem Estrada Conectada'
                  : vehicle.status === 'no_fuel'
                  ? 'Sem Combustível Diesel'
                  : vehicle.status}
              </span>
            </div>

            {/* Fuel gauge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-300">
                <span className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  Tanque Diesel:
                </span>
                <span>{Math.floor(vehicle.fuel)}%</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    vehicle.fuel > 25 ? 'bg-teal-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${vehicle.fuel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cargo */}
          <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-stone-300">
              <span className="text-stone-400">Carga Transportada:</span>
              <span className="font-bold text-white font-mono">
                {vehicle.cargoAmount.toFixed(1)} / {vehicle.maxCapacity} t
              </span>
            </div>
            <div className="text-[11px] text-teal-400 capitalize">
              {vehicle.cargoResource || 'Vazio (Aguardando Ordem)'}
            </div>
          </div>

          {/* Route management */}
          <button
            onClick={() => onOpenRouteManager(vehicle.id)}
            className="w-full py-2 bg-[#0f766e] hover:bg-[#115e59] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Route className="w-4 h-4" />
            <span>Configurar Rota Automatizada</span>
          </button>
        </div>
      </div>
    );
  }

  if (!building) return null;
  const bp = BUILDING_BLUEPRINTS[building.type];

  // Calculate capacities
  const currentTotalStored = Object.values(building.inventory).reduce((acc, v) => acc + v, 0);
  const storageCapacity = building.maxStorage || bp?.maxStorage || 500;
  const storagePercent = Math.min(100, Math.round((currentTotalStored / storageCapacity) * 100));

  const maxVehicles = building.maxVehicles || bp?.maxVehicles || 12;
  const currentVehicles = Math.min(maxVehicles, 8);

  return (
    <div className="absolute top-16 right-5 z-40 w-[380px] bg-[#121619]/95 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col font-sans text-white overflow-hidden select-none backdrop-blur-xl">
      {/* 1. Header (Dark Teal conforme image_d92ebf14.png) */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f766e] text-white">
        <div className="flex items-center gap-2.5">
          <Warehouse className="w-5 h-5 text-teal-200" />
          <h2 className="font-bold text-sm tracking-wide truncate">{building.name}</h2>
        </div>
        <div className="flex items-center gap-1.5 text-stone-200">
          <button title="Fixar" className="hover:text-white p-1">
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            title="Fechar"
            className="hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Facility Realistic Render / Preview Container (conforme image_d92ebf14.png) */}
      <div className="relative w-full h-36 bg-gradient-to-b from-[#1e293b] to-[#0f172a] flex items-center justify-center overflow-hidden border-b border-stone-800">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="flex flex-col items-center text-center p-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-teal-900/60 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-xl mb-1.5">
            <Warehouse className="w-7 h-7" />
          </div>
          <span className="font-semibold text-xs text-stone-200">{building.name}</span>
          <span className="text-[10px] text-stone-400">Setor Logístico Municipal</span>
        </div>
      </div>

      {/* 3. Metric Rows with Horizontal Progress Bars (Fiel à image_d92ebf14.png) */}
      <div className="p-4 space-y-3 text-xs">
        {/* Row 1: Conexão rodoviária */}
        <div className="flex items-center justify-between p-2.5 bg-stone-900/80 border border-stone-800 rounded-xl hover:bg-stone-800/60 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-mono font-bold">/ \</span>
            <span className="font-semibold text-stone-200">Conexão rodoviária</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4 fill-emerald-500/20" />
            <span>Conectado</span>
            <ChevronRight className="w-4 h-4 text-stone-500" />
          </div>
        </div>

        {/* Row 2: Veículos (12 / 18) com barra teal */}
        <div className="p-2.5 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-200">
              <Truck className="w-4 h-4 text-stone-400" />
              <span className="font-semibold">Veículos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-white">
                {currentVehicles} / {maxVehicles}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </div>
          </div>
          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${(currentVehicles / maxVehicles) * 100}%` }}
            />
          </div>
        </div>

        {/* Row 3: Estoque (68%) com barra amber */}
        <div className="p-2.5 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-200">
              <Package className="w-4 h-4 text-stone-400" />
              <span className="font-semibold">Estoque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-white">{storagePercent}%</span>
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </div>
          </div>
          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>

        {/* Row 4: Em construção (73% concluído) com ícone de guindaste e barra teal */}
        {!building.isConstructed && (
          <div className="p-2.5 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300">
                <HardHat className="w-4 h-4" />
                <span className="font-semibold">Em construção</span>
              </div>
              <span className="font-mono font-bold text-teal-400">
                {building.progressPercent}% concluído
              </span>
            </div>
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${building.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Direct Action: Manage Routes for this Facility */}
        <button
          onClick={() => onOpenRouteManager()}
          className="w-full py-2 bg-[#0f766e] hover:bg-[#115e59] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Route className="w-4 h-4" />
          <span>Vincular Rotas Automatizadas a esta Unidade</span>
        </button>
      </div>
    </div>
  );
};
