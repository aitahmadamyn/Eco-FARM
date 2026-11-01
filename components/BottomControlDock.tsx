'use client';

import React, { useState } from 'react';
import { CameraPreset, DisplayMode, PlantTelemetry } from '@/lib/types/plant';
import { PlantSimulationInputs } from '@/lib/simulation/plantSimulation';
import { Language, translations } from '@/lib/i18n';
import {
  Camera,
  Eye,
  SlidersHorizontal,
  Pause,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BottomControlDockProps {
  currentPreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  displayMode: DisplayMode;
  onSetDisplayMode: (mode: DisplayMode) => void;
  flowSpeed: number;
  onSetFlowSpeed: (speed: number) => void;
  simulationInputs: PlantSimulationInputs;
  onUpdateSimulationInput: (key: keyof PlantSimulationInputs, value: number) => void;
  telemetry: PlantTelemetry;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  lang?: Language;
}

export function BottomControlDock({
  currentPreset,
  onSelectPreset,
  displayMode,
  onSetDisplayMode,
  flowSpeed,
  onSetFlowSpeed,
  simulationInputs,
  onUpdateSimulationInput,
  telemetry,
  isCollapsed = false,
  onToggleCollapse,
  lang = 'en',
}: BottomControlDockProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'camera' | 'render' | 'sim'>('camera');

  const presetCards: { id: CameraPreset; title: string; subtitle: string }[] = [
    {
      id: 'isometric',
      title: 'Isometric 3/4',
      subtitle: lang === 'en' ? 'Full Facility' : 'Installation Complète',
    },
    {
      id: 'plan',
      title: 'BIM Plan',
      subtitle: lang === 'en' ? 'Top-Down Layout' : 'Vue Zénithale',
    },
    {
      id: 'zoneA',
      title: 'Zone A',
      subtitle: lang === 'en' ? 'Biomass Intake' : 'Réception Biomasse',
    },
    {
      id: 'zoneB',
      title: 'Zone B',
      subtitle: lang === 'en' ? 'Dryer System' : 'Système Séchoir',
    },
    {
      id: 'zoneC',
      title: 'Zone C',
      subtitle: lang === 'en' ? 'Pyrolysis Unit' : 'Unité Pyrolyse',
    },
    {
      id: 'zoneD',
      title: 'Zone D',
      subtitle: lang === 'en' ? 'Sand Battery' : 'Batterie Sable',
    },
    {
      id: 'zoneE',
      title: 'Zone E',
      subtitle: lang === 'en' ? 'Renewables' : 'Énergies Renouvelables',
    },
    {
      id: 'zoneF',
      title: 'Zone F',
      subtitle: lang === 'en' ? 'SCADA Control' : 'Contrôle SCADA',
    },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[96vw]">
      {/* Zen View Toggle Button (pill centered above the dock) */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="mb-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium flex items-center gap-1 backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.zenShow}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.zenHide}</span>
            </>
          )}
        </button>
      )}

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 backdrop-blur-xl shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Top Sub-Bar (Tabs on Left, Circuit Speeds on Right) */}
          <div className="flex items-center justify-between gap-3 px-1 border-b border-slate-800 pb-2">
            {/* Left Action Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.cameraViews}</span>
              </button>

              <button
                onClick={() => {
                  const nextMode: DisplayMode =
                    displayMode === 'realistic' ? 'cutaway' : displayMode === 'cutaway' ? 'thermal' : 'realistic';
                  onSetDisplayMode(nextMode);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  displayMode === 'cutaway'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : displayMode === 'thermal'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
                title="Toggle Realistic, X-Ray Cutaway, or Thermal Heatmap"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {displayMode === 'realistic'
                    ? t.renderCutaway
                    : displayMode === 'cutaway'
                    ? `${t.cutawayMode}`
                    : `${t.thermalMode}`}
                </span>
              </button>

              <button
                onClick={() => setActiveTab((prev) => (prev === 'sim' ? 'camera' : 'sim'))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'sim'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.thermoSim}</span>
              </button>
            </div>

            {/* Right Circuit Flow Speed Controls */}
            <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase hidden sm:inline">
                {t.circuits}
              </span>
              <button
                onClick={() => onSetFlowSpeed(0)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  flowSpeed === 0
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
                title={t.speedPause}
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSetFlowSpeed(1)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  flowSpeed === 1
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => onSetFlowSpeed(2)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  flowSpeed === 2
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                2x
              </button>
              <button
                onClick={() => onSetFlowSpeed(5)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  flowSpeed === 5
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                5x
              </button>
            </div>
          </div>

          {/* Conditional Simulation Drawer when 'sim' tab is clicked */}
          {activeTab === 'sim' && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl mb-1 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Solar Irradiance */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>{t.solarIrradiance}</span>
                    <span className="font-mono text-amber-300">{simulationInputs.solarIrradianceWm2} W/m²</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1200"
                    step="20"
                    value={simulationInputs.solarIrradianceWm2}
                    onChange={(e) => onUpdateSimulationInput('solarIrradianceWm2', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Biomass Infeed */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>{t.biomassInfeed}</span>
                    <span className="font-mono text-emerald-300">{simulationInputs.biomassInfeedKgH} kg/h</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="250"
                    step="5"
                    value={simulationInputs.biomassInfeedKgH}
                    onChange={(e) => onUpdateSimulationInput('biomassInfeedKgH', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Pyrolysis Temp */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>{t.pyrolysisTemp}</span>
                    <span className="font-mono text-rose-300">{simulationInputs.pyrolysisTempC} °C</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="650"
                    step="10"
                    value={simulationInputs.pyrolysisTempC}
                    onChange={(e) => onUpdateSimulationInput('pyrolysisTempC', Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lower Row: 8 Navigation Cards (Exact Match to Preview Screenshot) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5">
            {presetCards.map((card) => {
              const isActive = currentPreset === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => onSelectPreset(card.id)}
                  className={`min-w-[105px] sm:min-w-[115px] px-3 py-2 rounded-xl text-left transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-sky-950/70 border-sky-400 ring-1 ring-sky-400/40 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div
                    className={`text-xs font-semibold tracking-wide ${
                      isActive ? 'text-sky-300' : 'text-slate-100'
                    }`}
                  >
                    {card.title}
                  </div>
                  <div
                    className={`text-[10px] leading-tight mt-0.5 truncate ${
                      isActive ? 'text-sky-400/80 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {card.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
