/**
 * Soviet Republic: Workers & Logistics (Edição Desenvolvimento & Logística Nacional)
 * Full-viewport Game Shell Title Screen matching game craft guidelines
 */

import React, { useEffect } from 'react';
import { sound } from '../game/sound';
import { Play } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.playStampTrade();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#1e231b]/95 via-[#181a16]/95 to-[#0f110e] text-[#f5eedc] font-serif select-none">
      {/* Top Banner */}
      <div className="flex items-center gap-2 pt-4">
        <span className="text-[#15803d] text-xl">★</span>
        <span className="text-xs uppercase tracking-widest text-[#eab308] font-semibold">
          República dos Trabalhadores: Desenvolvimento &amp; Logística Nacional
        </span>
        <span className="text-[#15803d] text-xl">★</span>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup */}
      <div className="flex flex-col items-center text-center max-w-2xl px-4 my-auto">
        {/* SVG Crest */}
        <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="6,4" />
            <polygon
              points="50,12 61,38 88,38 66,54 75,80 50,64 25,80 34,54 12,38 39,38"
              fill="#b91c1c"
              stroke="#eab308"
              strokeWidth="2"
            />
            <circle cx="50" cy="52" r="7" fill="#fef08a" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-wider text-[#f5eedc] uppercase drop-shadow-md">
          Soviet Republic
        </h1>
        <div className="h-0.5 w-48 bg-[#15803d] my-3" />
        <h2 className="text-lg md:text-xl font-bold tracking-widest text-[#eab308] uppercase">
          Workers &amp; Logistics · Brasil
        </h2>

        <p className="mt-4 text-xs md:text-sm text-[#d4c6a9] max-w-lg leading-relaxed">
          Assuma a liderança da economia planificada em Reais (R$) e Dólares ($). Gerencie linhas de transporte automatizadas,
          frotas rodoviárias pesadas, abastecimento diesel e as 3 etapas de construção civil.
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => {
            sound.playStampTrade();
            onStart();
          }}
          className="mt-8 px-8 py-3.5 bg-[#15803d] hover:bg-[#166534] text-white font-sans font-bold text-sm tracking-wider uppercase rounded shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#86efac]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Iniciar Desenvolvimento Industrial (Enter)</span>
        </button>

        {/* Features highlights */}
        <div className="grid grid-cols-3 gap-6 mt-10 text-left border-t border-[#3d4436] pt-6 max-w-xl text-[11px] text-[#c7ba9d]">
          <div>
            <strong className="text-[#f5eedc] block font-sans">Gerenciador de Rotas</strong>
            Linhas automatizadas de coleta e entrega entre fábricas, armazéns e obras.
          </div>
          <div>
            <strong className="text-[#f5eedc] block font-sans">Física &amp; Rede Viária</strong>
            Veículos rodam estritamente por rodovias construídas, com aceleração e combustível.
          </div>
          <div>
            <strong className="text-[#f5eedc] block font-sans">Etapas de Construção</strong>
            Terraplanagem, estrutura de concreto e acabamento com pré-moldados.
          </div>
        </div>
      </div>

      {/* Flat Control-Hint Line */}
      <div className="text-[11px] text-[#9c917d] tracking-wide font-sans">
        WASD Mover Câmera · Botão Direito Órbita · Scroll Zoom · Espaço Pausa · Clique nos Prédios ou Veículos para Inspecionar
      </div>
    </div>
  );
};
