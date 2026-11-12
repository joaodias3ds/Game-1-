/**
 * Soviet Republic: Workers & Logistics
 * Five-Year Plan ("Plano de Metas & Quinquenal") Target Modal in Reais (R$)
 */

import React from 'react';
import { FiveYearPlanTask } from '../game/types';
import { sound } from '../game/sound';
import { X, Target, CheckCircle2 } from 'lucide-react';

interface FiveYearPlanModalProps {
  tasks: FiveYearPlanTask[];
  onClose: () => void;
}

export const FiveYearPlanModal: React.FC<FiveYearPlanModalProps> = ({ tasks, onClose }) => {
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none">
      <div className="w-[560px] max-w-[95vw] bg-[#fbf5e8] border-2 border-[#b91c1c] rounded shadow-2xl overflow-hidden font-serif text-[#1c1917] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#991b1b] text-white">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold text-lg">★</span>
            <h2 className="font-bold text-base tracking-wide">
              Plano de Metas &amp; Desenvolvimento Econômico Nacional
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="hover:text-white hover:bg-[#b91c1c] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Banner */}
        <div className="p-4 bg-[#f5ecda] border-b border-[#ddceb3] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              Diretrizes do Planejamento Estratégico da República
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Concretize as metas industriais e habitacionais para consolidar a soberania e a auto-suficiência do país.
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-lg text-emerald-800">
              {completedCount} / {tasks.length}
            </div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider">
              Metas Cumpridas
            </span>
          </div>
        </div>

        {/* Task List */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 border rounded transition-all ${
                task.completed
                  ? 'bg-[#ecfdf5] border-[#a7f3d0]'
                  : 'bg-[#f8f1e2] border-[#dfcfb4]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Target className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">{task.title}</h4>
                    <p className="text-[11px] text-stone-600 mt-0.5">{task.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-emerald-800">
                    +R$ {task.rewardReais.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#e2d4bc] rounded-full overflow-hidden border border-[#cfc0a3]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      task.completed ? 'bg-emerald-600' : 'bg-[#b91c1c]'
                    }`}
                    style={{
                      width: `${Math.min(100, (task.current / task.target) * 100)}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] font-bold text-stone-700">
                  {Math.floor(task.current)} / {task.target} {task.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#ede4ce] border-t border-[#dfcfb4] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded font-sans text-xs font-semibold shadow-xs"
          >
            Retornar à Operação
          </button>
        </div>
      </div>
    </div>
  );
};
