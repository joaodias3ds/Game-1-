/**
 * Soviet Republic: Workers & Logistics (Edição Santa Esperança – BR)
 * TopBar directly matching image_d92ebf14.png
 */

import React from 'react';
import { GameState } from '../game/simulation';
import { formatBrazilianDate } from '../game/rules';
import {
  Pause,
  Play,
  FastForward,
  HelpCircle,
  Settings,
  Bell,
  Wallet,
  Users,
  Calendar,
  Compass,
  Route,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TopBarProps {
  state: GameState;
  onSetSpeed: (speed: number) => void;
  onToggleCustoms: () => void;
  onToggleFiveYearPlan: () => void;
  onToggleRouteManager: () => void;
  onResetCamera: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  onSetSpeed,
  onToggleCustoms,
  onToggleFiveYearPlan,
  onToggleRouteManager,
  onResetCamera,
  isMuted,
  onToggleMute,
}) => {
  const formattedDate = formatBrazilianDate(state.gameDays);
  const displayPopulation = (42685 + state.population).toLocaleString('pt-BR');

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-[#121619]/90 border-b border-[#2d3748] shadow-2xl select-none text-white font-sans text-xs backdrop-blur-md">
      {/* 1. Left Brand: Prefeitura Municipal de Santa Esperança – BR (conforme image_d92ebf14.png) */}
      <div className="flex items-center gap-3">
        {/* Yellow & Green Curved City Crest */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#15803d] to-[#eab308] flex items-center justify-center shadow-md border border-white/20">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-stone-300 leading-none">Prefeitura Municipal de</span>
          <span className="font-bold text-sm tracking-tight text-white leading-tight">
            Santa Esperança – BR
          </span>
        </div>
      </div>

      {/* 2. Key Metrics Cluster (CAIXA, POPULAÇÃO, DATA conforme image_d92ebf14.png) */}
      <div className="flex items-center gap-6">
        {/* CAIXA R$ */}
        <div
          onClick={onToggleCustoms}
          title="Tesouro Municipal em Caixa (Clique para acessar a Alfândega e Finanças)"
          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2 py-1 rounded transition-colors"
        >
          <div className="w-6 h-6 rounded bg-stone-800 flex items-center justify-center text-emerald-400">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-stone-300 uppercase tracking-wider">
              <span>CAIXA</span>
              <span className="text-emerald-400 text-[9px]">▲</span>
            </div>
            <span className="font-mono font-bold text-xs tracking-tight text-white tabular-nums">
              R$ {Math.floor(state.fundsReais).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* POPULAÇÃO */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-6 h-6 rounded bg-stone-800 flex items-center justify-center text-sky-400">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <div className="text-[10px] font-semibold text-stone-300 uppercase tracking-wider">
              POPULAÇÃO
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-xs tracking-tight text-white tabular-nums">
                {displayPopulation}
              </span>
              <span className="text-emerald-400 font-mono text-[10px] font-semibold">▲ +0,8%</span>
            </div>
          </div>
        </div>

        {/* DATA (15 de Mar de 1975) */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-6 h-6 rounded bg-stone-800 flex items-center justify-center text-amber-400">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <div className="text-[10px] font-semibold text-stone-300 uppercase tracking-wider">
              DATA
            </div>
            <span className="font-mono font-bold text-xs tracking-tight text-white">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Controls & Action Zone (Play/Pause, Speed Dropdown, Help, Settings, Bell) */}
      <div className="flex items-center gap-2">
        {/* Speed Controls Pill (conforme image_d92ebf14.png) */}
        <div className="flex items-center bg-[#1a202c] border border-stone-700 rounded-lg p-0.5 shadow-inner">
          <button
            onClick={() => onSetSpeed(0)}
            className={`p-1.5 rounded-md transition-colors ${
              state.speed === 0 ? 'bg-[#0f766e] text-white' : 'text-stone-400 hover:text-white'
            }`}
            title="Pausar"
            aria-label="Pausar"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSetSpeed(1)}
            className={`p-1.5 rounded-md transition-colors ${
              state.speed === 1 ? 'bg-[#0f766e] text-white' : 'text-stone-400 hover:text-white'
            }`}
            title="1x Normal"
            aria-label="Velocidade 1x"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSetSpeed(2)}
            className={`p-1.5 rounded-md transition-colors ${
              state.speed === 2 ? 'bg-[#0f766e] text-white' : 'text-stone-400 hover:text-white'
            }`}
            title="2x Rápida"
            aria-label="Velocidade 2x"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSetSpeed(3)}
            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-colors ${
              state.speed === 3 ? 'bg-[#0f766e] text-white' : 'text-stone-400 hover:text-white'
            }`}
            title="3x Ultra"
          >
            3x
          </button>
        </div>

        {/* Route Manager Shortcut Button */}
        <button
          onClick={onToggleRouteManager}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f766e] hover:bg-[#115e59] text-white rounded-lg font-bold text-xs shadow-md transition-colors"
          title="Abrir Gerenciador de Rotas de Transporte"
        >
          <Route className="w-3.5 h-3.5" />
          <span>Rotas ({state.routes.length})</span>
        </button>

        {/* Navigation & Help Icons */}
        <button
          onClick={onResetCamera}
          className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Recentralizar Câmera no Centro de Distribuição"
          aria-label="Recentralizar Câmera"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFiveYearPlan}
          className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Metas Municipais"
          aria-label="Metas"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleCustoms}
          className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Configurações e Alfândega"
          aria-label="Configurações"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleMute}
          className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title={isMuted ? 'Ativar Som' : 'Silenciar'}
          aria-label={isMuted ? 'Ativar Som' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
