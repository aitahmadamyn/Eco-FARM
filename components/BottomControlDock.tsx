'use client';

import React, { useState } from 'react';
import { CameraPreset, DisplayMode, PlantTelemetry } from '@/lib/types/plant';
import { PlantSimulationInputs } from '@/lib/simulation/plantSimulation';
import { Language, translations } from '@/lib/i18n';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
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
  lang = 'en',
}: BottomControlDockProps) {
  const t = translations[lang];
  const [showSimDrawer, setShowSimDrawer] = useState(false);

  const zones: { id: CameraPreset; label: string }[] = [
    { id: 'zoneA', label: lang === 'en' ? 'Zone A (Biomass)' : 'Zone A (Biomasse)' },
    { id: 'zoneB', label: lang === 'en' ? 'Zone B (Dryer)' : 'Zone B (Séchoir)' },
    { id: 'zoneC', label: lang === 'en' ? 'Zone C (Pyrolysis)' : 'Zone C (Pyrolyse)' },
    { id: 'zoneD', label: lang === 'en' ? 'Zone D (Sand)' : 'Zone D (Sable)' },
    { id: 'zoneE', label: lang === 'en' ? 'Zone E (Solar)' : 'Zone E (Solaire)' },
    { id: 'zoneF', label: lang === 'en' ? 'Zone F (SCADA)' : 'Zone F (SCADA)' },
  ];

  if (isCollapsed) return null;

  return (
    <div className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[96vw]">
      {/* Optional Simulation Drawer (Slide Up) */}
      {showSimDrawer && (
        <div className="mb-2 w-full max-w-3xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 backdrop-blur-xl shadow-2xl text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-xs tracking-wider uppercase text-sky-300">
                {t.thermoSim}
              </span>
            </div>
            <button
              onClick={() => setShowSimDrawer(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Input 1 */}
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

            {/* Input 2 */}
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

            {/* Input 3 */}
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

      {/* Main Single-Tier Dock Bar (Identical to Preview Photo) */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-2.5 py-1.5 backdrop-blur-xl shadow-2xl overflow-x-auto max-w-full">
        {/* Group 1: Global Views */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700/80 shrink-0">
          <button
            onClick={() => onSelectPreset('isometric')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer shrink-0 ${
              currentPreset === 'isometric'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
            }`}
          >
            Isometric 3/4
          </button>
          <button
            onClick={() => onSelectPreset('plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer shrink-0 ${
              currentPreset === 'plan'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
            }`}
          >
            BIM Plan
          </button>
        </div>

        {/* Group 2: Functional Zones */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700/80 shrink-0">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => onSelectPreset(z.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer shrink-0 ${
                currentPreset === z.id
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/30'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/40'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Group 3: Modes & Simulation */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onSetDisplayMode(displayMode === 'realistic' ? 'cutaway' : 'realistic')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
              displayMode === 'cutaway'
                ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
            }`}
          >
            {displayMode === 'cutaway' ? 'X-Ray: ON' : 'Cutaway X-Ray'}
          </button>

          <button
            onClick={() => onSetFlowSpeed(flowSpeed === 0 ? 1 : 0)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
              flowSpeed > 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
            }`}
          >
            {flowSpeed > 0 ? 'Flow: Active' : 'Flow: Paused'}
          </button>

          <button
            onClick={() => setShowSimDrawer(!showSimDrawer)}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer shrink-0 ${
              showSimDrawer
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
            }`}
            title="Thermodynamic Sliders"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
