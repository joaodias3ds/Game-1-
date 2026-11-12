/**
 * Soviet Republic: Workers & Logistics
 * Customs House window matching Screenshot 2 with Real (R$), storage limits, and Route Manager access
 */

import React, { useState } from 'react';
import { GameState } from '../game/simulation';
import { INITIAL_MARKET_PRICES } from '../game/rules';
import { sound } from '../game/sound';
import {
  X,
  Eye,
  Pin,
  AlertTriangle,
  UserPlus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Route,
  Warehouse,
} from 'lucide-react';

interface CustomsModalProps {
  state: GameState;
  onClose: () => void;
  onTrade: (
    resourceId: string,
    amount: number,
    currency: 'reais' | 'dollars',
    isExport: boolean
  ) => void;
  onHireWorkers: (count: number) => void;
  onPurchaseVehicle: (
    type: 'dump_truck' | 'flatbed' | 'bus' | 'concrete_mixer',
    name: string,
    cost: number
  ) => void;
  onOpenRouteManager: () => void;
}

export const CustomsModal: React.FC<CustomsModalProps> = ({
  state,
  onClose,
  onTrade,
  onHireWorkers,
  onPurchaseVehicle,
  onOpenRouteManager,
}) => {
  const [activeTab, setActiveTab] = useState<'trade' | 'vehicles' | 'stockpile'>('trade');
  const [selectedCurrency, setSelectedCurrency] = useState<'reais' | 'dollars'>('reais');

  const customs = state.buildings.find((b) => b.isCustoms);
  const currentTotalStored = customs
    ? Object.values(customs.inventory).reduce((acc, v) => acc + v, 0)
    : 0;

  return (
    <div className="absolute top-12 left-4 z-40 w-[440px] max-h-[85vh] bg-[#fbf5e8] border-2 border-[#b91c1c] rounded-t-sm shadow-2xl flex flex-col font-serif text-[#1c1917] overflow-hidden select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#991b1b] text-white">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">★</span>
          <h2 className="font-bold text-sm tracking-wide truncate">
            Posto de Fronteira &amp; Alfândega Interestadual
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-stone-200">
          <button title="Inspecionar" className="hover:text-white p-0.5">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button title="Fixar Janela" className="hover:text-white p-0.5">
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            title="Fechar"
            className="hover:text-white hover:bg-[#b91c1c] p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4 font-bold" />
          </button>
        </div>
      </div>

      {/* Top Banner & Storage Capacity Notice */}
      <div className="p-3 bg-[#f5ecda] border-b border-[#ddceb3] flex flex-col gap-2">
        <div className="flex items-start gap-2 bg-[#fffbeb] p-2 border border-[#fde68a] rounded">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="text-red-700 font-semibold">
              Regra de Importação: Necessário capacidade de depósito ou canteiro de obras ativo.
            </span>
            <span className="text-stone-700 mt-0.5">
              Capacidade do pátio alfandegário:{' '}
              <strong>
                {currentTotalStored.toFixed(1)} / {customs?.maxStorage || 1000} t
              </strong>
            </span>
          </div>
        </div>

        {/* Foreign Workers & Route Manager Shortcut */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-red-800">Trabalhadores disponíveis:</span>
            <span className="font-mono font-bold text-red-900 text-sm">
              {state.foreignWorkersAtCustoms}
            </span>
            <button
              onClick={() => onHireWorkers(5)}
              disabled={state.foreignWorkersAtCustoms < 5 || state.fundsReais < 750}
              className="px-2 py-0.5 bg-[#b91c1c] hover:bg-[#991b1b] disabled:opacity-40 text-white rounded text-[11px] font-sans font-semibold flex items-center gap-1 shadow-xs"
              title="Contratar 5 operários na fronteira (-R$ 750)"
            >
              <UserPlus className="w-3 h-3" />
              +5 Operários
            </button>
          </div>

          <button
            onClick={onOpenRouteManager}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0369a1] hover:bg-[#075985] text-white rounded font-sans text-xs font-semibold shadow-xs"
            title="Abrir Gerenciador de Rotas de Transporte"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Gerenciar Rotas</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center bg-[#eae0cb] border-b border-[#cfbf9e] px-2 pt-1 gap-1">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('trade');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors ${
            activeTab === 'trade'
              ? 'bg-[#fbf5e8] border-[#cfbf9e] text-red-900 border-b-0 -mb-[1px]'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Preços de Insumos (R$ / $)
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('vehicles');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors ${
            activeTab === 'vehicles'
              ? 'bg-[#fbf5e8] border-[#cfbf9e] text-red-900 border-b-0 -mb-[1px]'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Concessionária de Frotas
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('stockpile');
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-colors ${
            activeTab === 'stockpile'
              ? 'bg-[#fbf5e8] border-[#cfbf9e] text-red-900 border-b-0 -mb-[1px]'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Pátio Alfandegário
        </button>
      </div>

      {/* Tab 1: Live Market Trading in Reais & Dollars */}
      {activeTab === 'trade' && (
        <div className="flex flex-col flex-1 overflow-hidden p-3">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#e5d8be]">
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wide">
              Moeda de Negociação:
            </span>
            <div className="flex items-center gap-1 bg-[#ede4ce] p-0.5 rounded border border-[#cfc0a3]">
              <button
                onClick={() => setSelectedCurrency('reais')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  selectedCurrency === 'reais' ? 'bg-[#15803d] text-white' : 'text-stone-700'
                }`}
              >
                Reais (R$)
              </button>
              <button
                onClick={() => setSelectedCurrency('dollars')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  selectedCurrency === 'dollars' ? 'bg-[#1e3a5f] text-white' : 'text-stone-700'
                }`}
              >
                Dólares ($)
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[380px] scrollbar-thin">
            {INITIAL_MARKET_PRICES.map((item) => {
              const price = selectedCurrency === 'reais' ? item.priceReais : item.priceDollars;
              const currencySymbol = selectedCurrency === 'reais' ? 'R$' : '$';
              const currentStock = customs?.inventory[item.id] || 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-[#f6eee0] hover:bg-[#efe4cf] border border-[#e2d5bd] rounded text-xs transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-900">{item.name}</span>
                    <span className="font-mono text-[10px] text-stone-600">
                      Cotação: {currencySymbol} {price.toFixed(2)} / 1t · Pátio:{' '}
                      <strong className="text-stone-800">{currentStock.toFixed(1)}t</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTrade(item.id, 10, selectedCurrency, false)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#15803d] hover:bg-[#166534] text-white rounded font-sans text-[11px] font-semibold shadow-xs"
                      title={`Importar 10t de ${item.name}`}
                    >
                      <ArrowDownToLine className="w-3 h-3" />
                      +10t
                    </button>

                    <button
                      onClick={() => onTrade(item.id, 10, selectedCurrency, true)}
                      disabled={currentStock < 10}
                      className="flex items-center gap-1 px-2 py-1 bg-[#b91c1c] hover:bg-[#991b1b] disabled:opacity-30 text-white rounded font-sans text-[11px] font-semibold shadow-xs"
                      title={`Exportar 10t de ${item.name}`}
                    >
                      <ArrowUpFromLine className="w-3 h-3" />
                      -10t
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Vehicle Concessionária */}
      {activeTab === 'vehicles' && (
        <div className="flex flex-col flex-1 p-3 space-y-2 max-h-[420px] overflow-y-auto">
          <p className="text-xs text-stone-700 italic mb-1">
            Aquisição de frota rodoviária para o Escritório de Construção e linhas automatizadas:
          </p>

          <div className="p-2.5 bg-[#f6eee0] border border-[#e2d5bd] rounded flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-900 text-xs">Caminhão Basculante Pesado 6x4</div>
              <div className="text-[11px] text-stone-600">
                Capacidade: 14t (Brita, Cascalho, Minério, Cimento)
              </div>
            </div>
            <button
              onClick={() => onPurchaseVehicle('dump_truck', 'Caminhão Basculante 6x4', 18500)}
              disabled={state.fundsReais < 18500}
              className="px-2.5 py-1 bg-[#15803d] hover:bg-[#166534] disabled:opacity-40 text-white rounded font-sans text-xs font-bold"
            >
              R$ 18.500
            </button>
          </div>

          <div className="p-2.5 bg-[#f6eee0] border border-[#e2d5bd] rounded flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-900 text-xs">Cavalo Mecânico Prancha Aberta</div>
              <div className="text-[11px] text-stone-600">
                Capacidade: 12t (Painéis pré-fabricados, Aço, Madeira)
              </div>
            </div>
            <button
              onClick={() => onPurchaseVehicle('flatbed', 'Cavalo Mecânico Prancha', 15200)}
              disabled={state.fundsReais < 15200}
              className="px-2.5 py-1 bg-[#15803d] hover:bg-[#166534] disabled:opacity-40 text-white rounded font-sans text-xs font-bold"
            >
              R$ 15.200
            </button>
          </div>

          <div className="p-2.5 bg-[#f6eee0] border border-[#e2d5bd] rounded flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-900 text-xs">Ônibus Coletivo de Operários</div>
              <div className="text-[11px] text-stone-600">
                Capacidade: 40 operários para canteiros de obras e indústrias
              </div>
            </div>
            <button
              onClick={() => onPurchaseVehicle('bus', 'Ônibus Coletivo Rodoviário', 12800)}
              disabled={state.fundsReais < 12800}
              className="px-2.5 py-1 bg-[#15803d] hover:bg-[#166534] disabled:opacity-40 text-white rounded font-sans text-xs font-bold"
            >
              R$ 12.800
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Stockpile */}
      {activeTab === 'stockpile' && (
        <div className="p-3 flex flex-col flex-1 max-h-[420px] overflow-y-auto">
          <p className="text-xs text-stone-700 mb-2">
            Inventário atual nos pátios alfandegários:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {customs &&
              Object.entries(customs.inventory).map(([resKey, amt]) => (
                <div
                  key={resKey}
                  className="p-2 bg-[#f6eee0] border border-[#e2d5bd] rounded flex items-center justify-between"
                >
                  <span className="capitalize font-semibold text-stone-800">{resKey}</span>
                  <span className="font-mono font-bold text-emerald-800">{amt.toFixed(1)}t</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
