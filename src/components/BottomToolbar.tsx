/**
 * Soviet Republic: Workers & Logistics (Edição Santa Esperança – BR)
 * Bottom Construction Ribbon matching image_d92ebf14.png
 */

import React, { useState } from 'react';
import { BUILDING_BLUEPRINTS } from '../game/rules';
import { sound } from '../game/sound';
import {
  Package,
  Layers,
  Zap,
  Users,
  Factory,
  HardHat,
  ChevronDown,
  ChevronUp,
  X,
  Hammer,
  Truck,
  Warehouse,
} from 'lucide-react';

interface BottomToolbarProps {
  activeBuildTool: string | null;
  onSelectBuildTool: (tool: string | null) => void;
  fundsReais: number;
}

type MainCategory = 'transport' | 'logistics' | 'utilities' | 'citizens' | 'industry' | 'construction';

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  activeBuildTool,
  onSelectBuildTool,
  fundsReais,
}) => {
  const [activeCategory, setActiveCategory] = useState<MainCategory>('logistics');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categoryItems = Object.values(BUILDING_BLUEPRINTS).filter(
    (b) => b.category === activeCategory
  );

  const handleToolClick = (toolType: string) => {
    sound.playClick();
    if (activeBuildTool === toolType) {
      onSelectBuildTool(null);
    } else {
      onSelectBuildTool(toolType);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none max-w-[95vw]">
      {/* Collapse / Expand Toggle */}
      <button
        onClick={() => {
          sound.playClick();
          setIsCollapsed(!isCollapsed);
        }}
        className="px-4 py-1 mb-1.5 bg-[#1a202c]/90 hover:bg-[#2d3748] border border-stone-700/80 rounded-full text-stone-300 font-sans text-[11px] font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-teal-400" />
            <span>Exibir Menu de Obras &amp; Infraestrutura</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-teal-400" />
            <span>Ocultar Menu (Modo Panorâmico)</span>
          </>
        )}
      </button>

      {/* Main Dock Container (conforme image_d92ebf14.png) */}
      {!isCollapsed && (
        <div className="bg-[#121619]/95 border border-stone-700/80 rounded-2xl shadow-2xl p-2 flex flex-col gap-2 backdrop-blur-xl text-white">
          {/* Active Tool Banner */}
          {activeBuildTool && (
            <div className="flex items-center justify-between px-3 py-1 bg-teal-900/80 border border-teal-500 rounded-lg text-xs font-semibold text-teal-200">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-teal-400 animate-bounce" />
                <span>
                  Modo de Construção: <strong>{BUILDING_BLUEPRINTS[activeBuildTool]?.name || activeBuildTool}</strong>
                </span>
                <span className="text-[11px] font-normal text-stone-300">
                  (Clique no terreno para assentar o canteiro)
                </span>
              </div>
              <button
                onClick={() => onSelectBuildTool(null)}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[11px]"
              >
                <X className="w-3 h-3" />
                Cancelar
              </button>
            </div>
          )}

          {/* Upper Shelf: Cards Grid (conforme image_d92ebf14.png com Depósito aberto, Armazém, Silo, Centro de distribuição, Doca) */}
          <div className="flex items-center gap-2.5 px-1 py-1 overflow-x-auto max-w-[880px] scrollbar-thin">
            {categoryItems.map((item) => {
              const isSelected = activeBuildTool === item.type;
              const canAfford = fundsReais >= item.costReais;

              return (
                <button
                  key={item.type}
                  onClick={() => handleToolClick(item.type)}
                  disabled={!canAfford}
                  className={`flex flex-col items-center justify-between p-2 min-w-[145px] h-[105px] rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'bg-teal-950/80 border-teal-400 shadow-lg ring-2 ring-teal-400/50'
                      : canAfford
                      ? 'bg-[#1a202c]/80 hover:bg-[#2d3748]/90 border-stone-700/60 shadow-md'
                      : 'bg-stone-900/60 border-stone-800 opacity-40 cursor-not-allowed'
                  }`}
                  title={`${item.name} - ${item.description}`}
                >
                  {/* Clean Icon Container */}
                  <div className="w-9 h-9 rounded-lg bg-stone-800/80 border border-stone-700 flex items-center justify-center text-teal-400 shadow-inner">
                    {item.category === 'logistics' && <Warehouse className="w-5 h-5" />}
                    {item.category === 'industry' && <Factory className="w-5 h-5" />}
                    {item.category === 'transport' && <Truck className="w-5 h-5" />}
                    {item.category === 'citizens' && <Users className="w-5 h-5" />}
                    {item.category === 'construction' && <HardHat className="w-5 h-5" />}
                    {item.category === 'utilities' && <Zap className="w-5 h-5" />}
                  </div>

                  {/* Title */}
                  <span className="font-sans font-semibold text-xs leading-tight text-stone-100 line-clamp-2">
                    {item.name}
                  </span>

                  {/* Cost */}
                  <span className="font-mono text-[11px] font-bold text-teal-400 tabular-nums">
                    R$ {item.costReais.toLocaleString('pt-BR')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lower Row: Category Tabs Pill (conforme image_d92ebf14.png) */}
          <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-stone-800">
            {/* TRANSPORTE */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('transport');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeCategory === 'transport'
                  ? 'bg-[#0f766e] text-white shadow-md'
                  : 'bg-stone-800/70 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Transporte</span>
            </button>

            {/* LOGÍSTICA (active por padrão como no screenshot) */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('logistics');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeCategory === 'logistics'
                  ? 'bg-[#0f766e] text-white shadow-md ring-1 ring-teal-400/50'
                  : 'bg-stone-800/70 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-teal-300" />
              <span>Logística</span>
            </button>

            {/* REDES */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('utilities');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeCategory === 'utilities'
                  ? 'bg-[#0f766e] text-white shadow-md'
                  : 'bg-stone-800/70 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Redes</span>
            </button>

            {/* CIDADÃOS */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('citizens');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeCategory === 'citizens'
                  ? 'bg-[#0f766e] text-white shadow-md'
                  : 'bg-stone-800/70 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cidadãos</span>
            </button>

            {/* INDÚSTRIA */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('industry');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeCategory === 'industry'
                  ? 'bg-[#0f766e] text-white shadow-md'
                  : 'bg-stone-800/70 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Indústria</span>
            </button>

            {/* CONSTRUÇÃO */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('construction');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeCategory === 'construction'
                  ? 'bg-[#0f766e] text-white shadow-md'
                  : 'bg-stone-800/70 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Construção</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
