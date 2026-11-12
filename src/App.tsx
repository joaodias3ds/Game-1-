/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  GameState,
  createInitialGameState,
  tickSimulation,
  executeCustomsTrade,
  hireForeignWorkers,
  placeBuilding,
  purchaseVehicle,
  saveAutomatedRoute,
  deleteAutomatedRoute,
} from './game/simulation';
import { initThreeScene, SceneController } from './game/threeScene';
import { TopBar } from './components/TopBar';
import { BottomToolbar } from './components/BottomToolbar';
import { CustomsModal } from './components/CustomsModal';
import { BuildingInspector } from './components/BuildingInspector';
import { RouteManager } from './components/RouteManager';
import { FiveYearPlanModal } from './components/FiveYearPlanModal';
import { TitleScreen } from './components/TitleScreen';
import { sound } from './game/sound';
import { AutomatedRoute } from './game/types';

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') === '1';
    }
    return false;
  });

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [isFiveYearPlanOpen, setIsFiveYearPlanOpen] = useState(false);
  const [isRouteManagerOpen, setIsRouteManagerOpen] = useState(false);
  const [routeManagerVehicleId, setRouteManagerVehicleId] = useState<string | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(false);

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneControllerRef = useRef<SceneController | null>(null);
  const stateRef = useRef<GameState>(gameState);

  stateRef.current = gameState;

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const controller = initThreeScene(
      canvasMountRef.current,
      (selectedBuildingId) => {
        sound.playClick();
        setGameState((prev) => {
          if (selectedBuildingId === 'customs_zhodcaw') {
            return {
              ...prev,
              isCustomsOpen: true,
              selectedBuildingId: null,
              selectedVehicleId: null,
            };
          }
          return {
            ...prev,
            selectedBuildingId,
            selectedVehicleId: null,
            isCustomsOpen: false,
          };
        });
      },
      (selectedVehicleId) => {
        sound.playClick();
        setGameState((prev) => ({
          ...prev,
          selectedVehicleId,
          selectedBuildingId: null,
        }));
      },
      (blueprintType, x, z) => {
        setGameState((prev) => placeBuilding(prev, blueprintType, x, z));
      }
    );

    sceneControllerRef.current = controller;

    return () => {
      controller.destroy();
      sceneControllerRef.current = null;
    };
  }, []);

  // Update Three.js scene controller tool selection
  useEffect(() => {
    sceneControllerRef.current?.setBuildTool(gameState.activeBuildTool);
  }, [gameState.activeBuildTool]);

  // Main Simulation Loop (10 ticks per second)
  useEffect(() => {
    let lastTime = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.2);
      lastTime = now;

      setGameState((prev) => {
        const nextState = tickSimulation(prev, dt);
        sceneControllerRef.current?.update(nextState, dt);
        return nextState;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Handlers for UI actions
  const handleSetSpeed = (speed: number) => {
    sound.playClick();
    setGameState((prev) => ({ ...prev, speed }));
  };

  const handleToggleCustoms = () => {
    sound.playClick();
    setGameState((prev) => ({
      ...prev,
      isCustomsOpen: !prev.isCustomsOpen,
      selectedBuildingId: null,
      selectedVehicleId: null,
    }));
  };

  const handleToggleFiveYearPlan = () => {
    sound.playClick();
    setIsFiveYearPlanOpen(!isFiveYearPlanOpen);
  };

  const handleToggleRouteManager = (vehicleId?: string) => {
    sound.playClick();
    setRouteManagerVehicleId(vehicleId);
    setIsRouteManagerOpen(!isRouteManagerOpen);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handleResetCamera = () => {
    sound.playClick();
    sceneControllerRef.current?.resetCamera();
  };

  const handleSelectBuildTool = (tool: string | null) => {
    setGameState((prev) => ({ ...prev, activeBuildTool: tool }));
  };

  const handleTrade = (
    resourceId: string,
    amount: number,
    currency: 'reais' | 'dollars',
    isExport: boolean
  ) => {
    setGameState((prev) => executeCustomsTrade(prev, resourceId, amount, currency, isExport));
  };

  const handleHireWorkers = (count: number) => {
    setGameState((prev) => hireForeignWorkers(prev, count));
  };

  const handlePurchaseVehicle = (
    type: 'dump_truck' | 'flatbed' | 'bus' | 'concrete_mixer',
    name: string,
    cost: number
  ) => {
    setGameState((prev) => purchaseVehicle(prev, type, name, cost));
  };

  const handleSaveRoute = (route: AutomatedRoute) => {
    setGameState((prev) => saveAutomatedRoute(prev, route));
  };

  const handleDeleteRoute = (routeId: string) => {
    setGameState((prev) => deleteAutomatedRoute(prev, routeId));
  };

  const handleAssignWorkers = (buildingId: string, delta: number) => {
    sound.playClick();
    setGameState((prev) => {
      const bld = prev.buildings.find((b) => b.id === buildingId);
      if (!bld) return prev;

      const targetWorkers = Math.max(0, Math.min(bld.maxWorkers, bld.assignedWorkers + delta));
      const workerDelta = targetWorkers - bld.assignedWorkers;

      if (workerDelta > 0 && prev.availableWorkers < workerDelta) {
        sound.playWarning();
        return prev;
      }

      const updatedBuildings = prev.buildings.map((b) => {
        if (b.id === buildingId) {
          return { ...b, assignedWorkers: targetWorkers };
        }
        return b;
      });

      return {
        ...prev,
        availableWorkers: prev.availableWorkers - workerDelta,
        buildings: updatedBuildings,
      };
    });
  };

  const selectedBuilding = gameState.selectedBuildingId
    ? gameState.buildings.find((b) => b.id === gameState.selectedBuildingId) || null
    : null;

  const selectedVehicle = gameState.selectedVehicleId
    ? gameState.vehicles.find((v) => v.id === gameState.selectedVehicleId) || null
    : null;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#1c1917] select-none font-serif"
      data-testid="game-root"
      data-state={isPlaying ? 'playing' : 'title'}
    >
      {/* 1. Isolated 3D WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 cursor-crosshair"
        onClick={(e) => sceneControllerRef.current?.onPointerClick(e.nativeEvent)}
      />

      {/* 2. Title Screen Overlay */}
      {!isPlaying && <TitleScreen onStart={() => setIsPlaying(true)} />}

      {/* 3. In-Game HUD Overlays */}
      {isPlaying && (
        <>
          {/* Top Status Bar */}
          <TopBar
            state={gameState}
            onSetSpeed={handleSetSpeed}
            onToggleCustoms={handleToggleCustoms}
            onToggleFiveYearPlan={handleToggleFiveYearPlan}
            onToggleRouteManager={() => handleToggleRouteManager()}
            onResetCamera={handleResetCamera}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Bottom Construction Ribbon */}
          <BottomToolbar
            activeBuildTool={gameState.activeBuildTool}
            onSelectBuildTool={handleSelectBuildTool}
            fundsReais={gameState.fundsReais}
          />

          {/* Customs House Modal */}
          {gameState.isCustomsOpen && (
            <CustomsModal
              state={gameState}
              onClose={() => setGameState((prev) => ({ ...prev, isCustomsOpen: false }))}
              onTrade={handleTrade}
              onHireWorkers={handleHireWorkers}
              onPurchaseVehicle={handlePurchaseVehicle}
              onOpenRouteManager={() => setIsRouteManagerOpen(true)}
            />
          )}

          {/* Building or Vehicle Inspector Modal */}
          {(selectedBuilding || selectedVehicle) && (
            <BuildingInspector
              building={selectedBuilding}
              vehicle={selectedVehicle}
              onClose={() =>
                setGameState((prev) => ({
                  ...prev,
                  selectedBuildingId: null,
                  selectedVehicleId: null,
                }))
              }
              onAssignWorkers={handleAssignWorkers}
              onOpenRouteManager={handleToggleRouteManager}
              fundsReais={gameState.fundsReais}
            />
          )}

          {/* Route Manager Modal */}
          {isRouteManagerOpen && (
            <RouteManager
              state={gameState}
              onClose={() => setIsRouteManagerOpen(false)}
              onSaveRoute={handleSaveRoute}
              onDeleteRoute={handleDeleteRoute}
              initialVehicleId={routeManagerVehicleId}
            />
          )}

          {/* Five-Year Plan / Metas Quinquenal Modal */}
          {isFiveYearPlanOpen && (
            <FiveYearPlanModal
              tasks={gameState.fiveYearTasks}
              onClose={() => setIsFiveYearPlanOpen(false)}
            />
          )}

          {/* Notifications Toast */}
          <div className="absolute top-14 right-4 z-20 flex flex-col gap-1.5 pointer-events-none max-w-sm">
            {gameState.notifications.map((n) => (
              <div
                key={n.id}
                className={`px-3 py-1.5 rounded shadow-lg text-xs font-sans border transition-all ${
                  n.type === 'success'
                    ? 'bg-[#14532d]/95 text-emerald-100 border-emerald-600'
                    : n.type === 'warning'
                    ? 'bg-[#78350f]/95 text-amber-100 border-amber-600'
                    : 'bg-[#292524]/95 text-stone-200 border-stone-600'
                }`}
              >
                {n.text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
