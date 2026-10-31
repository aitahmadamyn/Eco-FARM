'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EcofarmSceneManager } from '@/lib/three/sceneManager';
import { CameraPreset, DisplayMode, ZoneId } from '@/lib/types/plant';
import {
  calculatePlantTelemetry,
  PlantSimulationInputs,
  ZONES_DATA,
} from '@/lib/simulation/plantSimulation';
import { TopHeaderBadge } from './TopHeaderBadge';
import { BottomControlDock } from './BottomControlDock';
import { ZoneInspectorModal } from './ZoneInspectorModal';
import { AiEnergyAdvisorModal } from './AiEnergyAdvisorModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { Plus, Minus, RotateCcw, Keyboard, Check } from 'lucide-react';

export default function EcofarmViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<EcofarmSceneManager | null>(null);

  // Active state
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('isometric');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('realistic');
  const [flowSpeed, setFlowSpeed] = useState<number>(1.0);
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneId | null>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Modals state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);

  // Toast notification for user action feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Simulation parameters
  const [simulationInputs, setSimulationInputs] = useState<PlantSimulationInputs>({
    solarIrradianceWm2: 820,
    biomassInfeedKgH: 120,
    biomassMoisturePercent: 45,
    sandBatterySocTargetPercent: 78,
    pyrolysisTempC: 520,
  });

  // Calculate live telemetry based on simulation inputs
  const telemetry = calculatePlantTelemetry(simulationInputs);

  // Initialize Three.js scene manager
  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new EcofarmSceneManager(mountRef.current, {
      onZoneSelected: (zoneId: ZoneId) => {
        setSelectedZone(zoneId);
        setCurrentPreset(zoneId);
        setIsZoneModalOpen(true);
        showToast(`Zone sélectionnée : ${ZONES_DATA[zoneId].name}`);
      },
      onZoneHovered: (zoneId: ZoneId | null) => {
        setHoveredZone(zoneId);
      },
    });

    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, [showToast]);

  const handleSelectPreset = useCallback((preset: CameraPreset) => {
    setCurrentPreset(preset);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraPreset(preset);
    }
  }, []);

  const handleSetDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplayMode(mode);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setDisplayMode(mode);
    }
  }, []);

  const handleSetFlowSpeed = useCallback((speed: number) => {
    setFlowSpeed(speed);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setFlowSpeedMultiplier(speed);
    }
  }, []);

  const handleUpdateSimulationInput = useCallback(
    (key: keyof PlantSimulationInputs, value: number) => {
      setSimulationInputs((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleCaptureScreenshot = useCallback(() => {
    if (!sceneManagerRef.current) return;
    const dataUrl = sceneManagerRef.current.captureScreenshot();
    const link = document.createElement('a');
    link.download = `ECOFARM-CIRCULAR-3D-RENDER-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('Capture d’écran 3D haute résolution téléchargée !');
  }, [showToast]);

  const handleZoom = useCallback((delta: number) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.zoom(delta);
    }
  }, []);

  // Keyboard shortcut listener ("Touches du clavier")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === 'h') {
        e.preventDefault();
        setIsDockCollapsed((prev) => {
          showToast(`Touche [H] : ${!prev ? 'Panneau masqué (Mode Zen)' : 'Panneau affiché'}`);
          return !prev;
        });
      } else if (code === 'Space') {
        e.preventDefault();
        setFlowSpeed((prev) => {
          const newSpeed = prev === 0 ? 1 : 0;
          if (sceneManagerRef.current) {
            sceneManagerRef.current.setFlowSpeedMultiplier(newSpeed);
          }
          showToast(newSpeed === 0 ? 'Touche [Espace] : Flux en pause' : 'Touche [Espace] : Flux repris (1x)');
          return newSpeed;
        });
      } else if (key === 'm') {
        e.preventDefault();
        setDisplayMode((prev) => {
          const nextMode: DisplayMode =
            prev === 'realistic' ? 'cutaway' : prev === 'cutaway' ? 'thermal' : 'realistic';
          handleSetDisplayMode(nextMode);
          showToast(
            `Touche [M] : Mode ${
              nextMode === 'realistic' ? 'Réaliste PBR' : nextMode === 'cutaway' ? 'Écorché X-Ray' : 'Thermique'
            }`
          );
          return nextMode;
        });
      } else if (key === '1' || key === 'a') {
        e.preventDefault();
        handleSelectPreset('zoneA');
        setSelectedZone('zoneA');
        showToast('Touche [1] / [A] : Zone A - Réception & Broyage');
      } else if (key === '2' || key === 'b') {
        e.preventDefault();
        handleSelectPreset('zoneB');
        setSelectedZone('zoneB');
        showToast('Touche [2] / [B] : Zone B - Séchoir Continu');
      } else if (key === '3' || key === 'c') {
        e.preventDefault();
        handleSelectPreset('zoneC');
        setSelectedZone('zoneC');
        showToast('Touche [3] / [C] : Zone C - Unité de Pyrolyse');
      } else if (key === '4' || key === 'd') {
        e.preventDefault();
        handleSelectPreset('zoneD');
        setSelectedZone('zoneD');
        showToast('Touche [4] / [D] : Zone D - Batterie à Sable');
      } else if (key === '5' || key === 'e') {
        e.preventDefault();
        handleSelectPreset('zoneE');
        setSelectedZone('zoneE');
        showToast('Touche [5] / [E] : Zone E - Solaire PV & Thermique');
      } else if (key === '6' || key === 'f') {
        e.preventDefault();
        handleSelectPreset('zoneF');
        setSelectedZone('zoneF');
        showToast('Touche [6] / [F] : Zone F - Salle de Contrôle SCADA');
      } else if (key === '0' || key === 'i') {
        e.preventDefault();
        handleSelectPreset('isometric');
        showToast('Touche [0] / [I] : Vue Isométrique Globale');
      } else if (key === 'p') {
        e.preventDefault();
        handleSelectPreset('plan');
        showToast('Touche [P] : Vue en Plan BIM');
      } else if (key === '+' || key === '=' || key === 'z') {
        e.preventDefault();
        handleZoom(-4);
        showToast('Touche [+] : Zoom Avant');
      } else if (key === '-' || key === 'x') {
        e.preventDefault();
        handleZoom(4);
        showToast('Touche [-] : Zoom Arrière');
      } else if (key === '?' || key === 'k') {
        e.preventDefault();
        setIsKeyboardModalOpen((prev) => !prev);
      } else if (key === 'escape') {
        setIsZoneModalOpen(false);
        setIsAiModalOpen(false);
        setIsKeyboardModalOpen(false);
        showToast('Touche [Échap] : Fenêtres fermées');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectPreset, handleSetDisplayMode, handleZoom, showToast]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Mount Container (supports touch, mouse, stylus) */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 w-full h-full touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* Top Header Badge */}
      <TopHeaderBadge
        telemetry={telemetry}
        selectedZone={selectedZone}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenZoneModal={() => {
          if (!selectedZone) setSelectedZone('zoneD');
          setIsZoneModalOpen(true);
        }}
        onCaptureScreenshot={handleCaptureScreenshot}
        onOpenKeyboardModal={() => setIsKeyboardModalOpen(true)}
      />

      {/* Floating Visual Toast for Key Presses ("La touche") */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 border border-sky-500/80 text-sky-200 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hovered Zone Pin Indicator in Viewport */}
      {hoveredZone && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-slate-900/90 border border-sky-400/60 rounded-xl px-4 py-2 text-center shadow-xl animate-fadeIn">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block font-bold">
            {ZONES_DATA[hoveredZone].tag} (CLIQUEZ / TOUCHEZ POUR INSPECTER)
          </span>
          <span className="text-xs font-semibold text-white">
            {ZONES_DATA[hoveredZone].name}
          </span>
        </div>
      )}

      {/* Floating Touch & Navigation Toolbar (Right Flank - Never occludes model center) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            handleZoom(-4);
            showToast('Zoom Avant (+)');
          }}
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer"
          title="Zoom Avant (Touche +)"
        >
          <Plus className="w-4 h-4 text-sky-400" />
        </button>
        <button
          onClick={() => {
            handleZoom(4);
            showToast('Zoom Arrière (-)');
          }}
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer"
          title="Zoom Arrière (Touche -)"
        >
          <Minus className="w-4 h-4 text-sky-400" />
        </button>
        <button
          onClick={() => {
            handleSelectPreset('isometric');
            showToast('Réinitialisation Vue Isométrique 3/4');
          }}
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer"
          title="Réinitialiser Vue (Touche 0 ou I)"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          onClick={() => setIsKeyboardModalOpen(true)}
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer"
          title="Guide des Touches (Raccourcis Clavier & Tactile)"
        >
          <Keyboard className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Unified Bottom Control Dock */}
      <BottomControlDock
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        displayMode={displayMode}
        onSetDisplayMode={handleSetDisplayMode}
        flowSpeed={flowSpeed}
        onSetFlowSpeed={handleSetFlowSpeed}
        simulationInputs={simulationInputs}
        onUpdateSimulationInput={handleUpdateSimulationInput}
        telemetry={telemetry}
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
      />

      {/* Modals */}
      {isZoneModalOpen && selectedZone && (
        <ZoneInspectorModal
          zoneId={selectedZone}
          onClose={() => setIsZoneModalOpen(false)}
          onSelectZone={(zid) => {
            setSelectedZone(zid);
            handleSelectPreset(zid);
            showToast(`Navigation vers : ${ZONES_DATA[zid].tag}`);
          }}
        />
      )}

      {isAiModalOpen && (
        <AiEnergyAdvisorModal
          telemetry={telemetry}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}

      {isKeyboardModalOpen && (
        <KeyboardShortcutsModal onClose={() => setIsKeyboardModalOpen(false)} />
      )}
    </div>
  );
}
