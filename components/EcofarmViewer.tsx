'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EcofarmSceneManager } from '@/lib/three/sceneManager';
import { CameraPreset, DisplayMode, ZoneId } from '@/lib/types/plant';
import {
  calculatePlantTelemetry,
  PlantSimulationInputs,
  ZONES_DATA,
} from '@/lib/simulation/plantSimulation';
import { Language, translations } from '@/lib/i18n';
import { TopHeaderBadge } from './TopHeaderBadge';
import { BottomControlDock } from './BottomControlDock';
import { ZoneInspectorModal } from './ZoneInspectorModal';
import { AiEnergyAdvisorModal } from './AiEnergyAdvisorModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { Plus, Minus, RotateCcw, Keyboard, Check, Eye, Compass } from 'lucide-react';

export default function EcofarmViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<EcofarmSceneManager | null>(null);

  // Language state (defaults to English as requested)
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const handleToggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'fr' : 'en'));
  }, []);

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
        const prefix = lang === 'en' ? 'Selected Zone' : 'Zone sélectionnée';
        showToast(`${prefix}: ${ZONES_DATA[zoneId].name}`);
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
  }, [lang, showToast]);

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
    showToast(t.toastScreenshot);
  }, [showToast, t.toastScreenshot]);

  const handleZoom = useCallback((delta: number) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.zoom(delta);
    }
  }, []);

  // Keyboard shortcut listener ("Touches du clavier")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          showToast(!prev ? t.toastZenHide : t.toastZenShow);
          return !prev;
        });
      } else if (code === 'Space') {
        e.preventDefault();
        setFlowSpeed((prev) => {
          const newSpeed = prev === 0 ? 1 : 0;
          if (sceneManagerRef.current) {
            sceneManagerRef.current.setFlowSpeedMultiplier(newSpeed);
          }
          showToast(newSpeed === 0 ? t.toastFlowPaused : t.toastFlowResumed);
          return newSpeed;
        });
      } else if (key === 'm') {
        e.preventDefault();
        setDisplayMode((prev) => {
          const nextMode: DisplayMode =
            prev === 'realistic' ? 'cutaway' : prev === 'cutaway' ? 'thermal' : 'realistic';
          handleSetDisplayMode(nextMode);
          showToast(
            nextMode === 'realistic'
              ? t.toastModeRealistic
              : nextMode === 'cutaway'
              ? t.toastModeCutaway
              : t.toastModeThermal
          );
          return nextMode;
        });
      } else if (key === '1' || key === 'a') {
        e.preventDefault();
        handleSelectPreset('zoneA');
        setSelectedZone('zoneA');
        showToast(`${t.toastNavTo}: Zone A`);
      } else if (key === '2' || key === 'b') {
        e.preventDefault();
        handleSelectPreset('zoneB');
        setSelectedZone('zoneB');
        showToast(`${t.toastNavTo}: Zone B`);
      } else if (key === '3' || key === 'c') {
        e.preventDefault();
        handleSelectPreset('zoneC');
        setSelectedZone('zoneC');
        showToast(`${t.toastNavTo}: Zone C`);
      } else if (key === '4' || key === 'd') {
        e.preventDefault();
        handleSelectPreset('zoneD');
        setSelectedZone('zoneD');
        showToast(`${t.toastNavTo}: Zone D`);
      } else if (key === '5' || key === 'e') {
        e.preventDefault();
        handleSelectPreset('zoneE');
        setSelectedZone('zoneE');
        showToast(`${t.toastNavTo}: Zone E`);
      } else if (key === '6' || key === 'f') {
        e.preventDefault();
        handleSelectPreset('zoneF');
        setSelectedZone('zoneF');
        showToast(`${t.toastNavTo}: Zone F`);
      } else if (key === '0' || key === 'i') {
        e.preventDefault();
        handleSelectPreset('isometric');
        showToast(t.toastResetIso);
      } else if (key === 'p') {
        e.preventDefault();
        handleSelectPreset('plan');
        showToast('BIM Top-Down Plan View');
      } else if (key === '+' || key === '=' || key === 'z') {
        e.preventDefault();
        handleZoom(-4);
        showToast(t.toastZoomIn);
      } else if (key === '-' || key === 'x') {
        e.preventDefault();
        handleZoom(4);
        showToast(t.toastZoomOut);
      } else if (key === '?' || key === 'k') {
        e.preventDefault();
        setIsKeyboardModalOpen((prev) => !prev);
      } else if (key === 'escape') {
        setIsZoneModalOpen(false);
        setIsAiModalOpen(false);
        setIsKeyboardModalOpen(false);
        showToast(t.toastModalsClosed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectPreset, handleSetDisplayMode, handleZoom, showToast, t]);

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
        lang={lang}
        onToggleLang={handleToggleLang}
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
            {ZONES_DATA[hoveredZone].tag} ({t.clickToInspect})
          </span>
          <span className="text-xs font-semibold text-white">
            {ZONES_DATA[hoveredZone].name}
          </span>
        </div>
      )}

      {/* Floating Touch & Navigation Toolbar (Right Flank - Matching preview) */}
      <div className="fixed right-3.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            handleZoom(-4);
            showToast(t.toastZoomIn);
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-sky-600 text-slate-200 hover:text-white border border-sky-500/30 flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
          title={t.zoomIn}
        >
          <Plus className="w-4 h-4 text-sky-400 hover:text-white" />
        </button>
        <button
          onClick={() => {
            handleZoom(4);
            showToast(t.toastZoomOut);
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-sky-600 text-slate-200 hover:text-white border border-sky-500/30 flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
          title={t.zoomOut}
        >
          <Minus className="w-4 h-4 text-sky-400 hover:text-white" />
        </button>
        <button
          onClick={() => {
            handleSelectPreset('isometric');
            showToast(t.toastResetIso);
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-sky-600 text-slate-200 hover:text-white border border-sky-500/30 flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
          title="Isometric 3/4 View"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          onClick={() => {
            handleSelectPreset('plan');
            showToast('BIM Plan View');
          }}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-sky-600 text-slate-200 hover:text-white border border-sky-500/30 flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
          title="BIM Plan View (Top-Down)"
        >
          <Compass className="w-4 h-4 text-amber-400" />
        </button>
        <button
          onClick={() => {
            handleSetDisplayMode(displayMode === 'realistic' ? 'cutaway' : 'realistic');
            showToast(displayMode === 'realistic' ? t.toastModeCutaway : t.toastModeRealistic);
          }}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer ${
            displayMode === 'cutaway'
              ? 'bg-amber-500 border-amber-400 text-white'
              : 'bg-slate-900/90 hover:bg-sky-600 text-slate-200 hover:text-white border-sky-500/30'
          }`}
          title="Cutaway X-Ray Mode"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsKeyboardModalOpen(true)}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
          title={t.shortcutsGuide}
        >
          <Keyboard className="w-3.5 h-3.5" />
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
        lang={lang}
      />

      {/* Modals */}
      {isZoneModalOpen && selectedZone && (
        <ZoneInspectorModal
          zoneId={selectedZone}
          onClose={() => setIsZoneModalOpen(false)}
          onSelectZone={(zid) => {
            setSelectedZone(zid);
            handleSelectPreset(zid);
            showToast(`${t.toastNavTo}: ${ZONES_DATA[zid].tag}`);
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
        <KeyboardShortcutsModal
          onClose={() => setIsKeyboardModalOpen(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
