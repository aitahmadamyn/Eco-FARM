'use client';

import React, { useState } from 'react';
import { CameraPreset, DisplayMode, PlantTelemetry } from '@/lib/types/plant';
import { PlantSimulationInputs } from '@/lib/simulation/plantSimulation';
import {
  Camera,
  Layers,
  Activity,
  Play,
  Pause,
  Sliders,
  ChevronDown,
  ChevronUp,
  Eye,
  Thermometer,
  ShieldAlert,
  CheckCircle,
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
  isCollapsed: externalIsCollapsed,
  onToggleCollapse,
}: BottomControlDockProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalIsCollapsed(!internalIsCollapsed));
  const [activeTab, setActiveTab] = useState<'camera' | 'modes' | 'simulation'>('camera');

  const presets: { id: CameraPreset; label: string; tag: string }[] = [
    { id: 'isometric', label: 'Isometric 3/4', tag: 'Full Facility' },
    { id: 'plan', label: 'BIM Plan', tag: 'Top-Down Layout' },
    { id: 'zoneA', label: 'Zone A', tag: 'Biomass Intake' },
    { id: 'zoneB', label: 'Zone B', tag: 'Dryer System' },
    { id: 'zoneC', label: 'Zone C', tag: 'Pyrolysis Unit' },
    { id: 'zoneD', label: 'Zone D', tag: 'Sand Battery' },
    { id: 'zoneE', label: 'Zone E', tag: 'Renewables' },
    { id: 'zoneF', label: 'Zone F', tag: 'SCADA Control' },
  ];

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-300"
      style={{ maxWidth: 'min(940px, 94vw)', width: '100%' }}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="mb-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-full text-[11px] font-mono tracking-wider flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
        title="Raccourci clavier : Touche H"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Show Engineering Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Hide Dock (Zen View)</span>
          </>
        )}
      </button>

      {/* Main Unified Bottom Dock Panel */}
      {!isCollapsed && (
        <div className="w-full bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3 backdrop-blur-xl shadow-2xl text-slate-200">
          {/* Top Bar: Navigation Tabs & Global Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Views</span>
              </button>
              <button
                onClick={() => setActiveTab('modes')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'modes'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Render & Cutaway</span>
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'simulation'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Thermodynamic Sim</span>
              </button>
            </div>

            {/* Process Flow Animation Controls */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[11px] text-slate-400 hidden sm:inline">CIRCUITS:</span>
              <button
                onClick={() => onSetFlowSpeed(flowSpeed === 0 ? 1 : 0)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  flowSpeed > 0
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title={flowSpeed > 0 ? 'Pause Streamlines' : 'Resume Streamlines'}
              >
                {flowSpeed > 0 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onSetFlowSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      flowSpeed === spd
                        ? 'bg-sky-500/30 text-sky-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab 1: Camera Presets */}
          {activeTab === 'camera' && (
            <div className="pt-2.5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    currentPreset === preset.id
                      ? 'bg-sky-500/20 border-sky-400/60 text-sky-200 shadow-md shadow-sky-950/40'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <span className="block font-semibold text-xs leading-tight truncate">
                    {preset.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                    {preset.tag}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Tab 2: Render & Cutaway Modes */}
          {activeTab === 'modes' && (
            <div className="pt-2.5 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] flex gap-2">
                <button
                  onClick={() => onSetDisplayMode('realistic')}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    displayMode === 'realistic'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Realistic PBR Industrial</span>
                </button>

                <button
                  onClick={() => onSetDisplayMode('cutaway')}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    displayMode === 'cutaway'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>X-Ray / Internal Cutaway</span>
                </button>

                <button
                  onClick={() => onSetDisplayMode('thermal')}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    displayMode === 'thermal'
                      ? 'bg-red-500/20 border-red-400 text-red-200'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <span>Thermal Heatmap</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60 max-w-sm">
                <span className="font-semibold text-slate-200 block">Cutaway Inspection:</span>
                Reveals the internal quartz sand core, immersion heaters, coil exchangers, pyrolysis auger, and dryer trays.
              </div>
            </div>
          )}

          {/* Tab 3: Thermodynamic Simulation Parameters & Interlocks */}
          {activeTab === 'simulation' && (
            <div className="pt-2.5 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Solar Irradiance Slider */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-slate-400">Solar Irradiance:</span>
                    <span className="font-bold text-yellow-300">
                      {simulationInputs.solarIrradianceWm2} W/m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="25"
                    value={simulationInputs.solarIrradianceWm2}
                    onChange={(e) =>
                      onUpdateSimulationInput('solarIrradianceWm2', parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    PV: {telemetry.pvPowerOutputKw.toFixed(1)} kW | Solar Th: {telemetry.solarThermalOutputKw.toFixed(1)} kW
                  </span>
                </div>

                {/* Biomass Feed Rate */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-slate-400">Biomass Infeed:</span>
                    <span className="font-bold text-emerald-300">
                      {simulationInputs.biomassInfeedKgH} kg/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="10"
                    value={simulationInputs.biomassInfeedKgH}
                    onChange={(e) =>
                      onUpdateSimulationInput('biomassInfeedKgH', parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Biochar: {telemetry.biocharYieldKgH.toFixed(1)} kg/h | Moisture: {simulationInputs.biomassMoisturePercent}%
                  </span>
                </div>

                {/* Sand Battery SOC / Temp Slider */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-slate-400">Sand Battery SOC:</span>
                    <span className="font-bold text-amber-300">
                      {simulationInputs.sandBatterySocTargetPercent}% ({telemetry.sandCoreTempC.toFixed(0)}°C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={simulationInputs.sandBatterySocTargetPercent}
                    onChange={(e) =>
                      onUpdateSimulationInput('sandBatterySocTargetPercent', parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Stored Thermal Energy: {telemetry.storedThermalMwh.toFixed(2)} MWh
                  </span>
                </div>

                {/* Pyrolysis Retort Temp */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-slate-400">Pyrolysis Temp:</span>
                    <span className="font-bold text-red-300">
                      {simulationInputs.pyrolysisTempC}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="650"
                    step="10"
                    value={simulationInputs.pyrolysisTempC}
                    onChange={(e) =>
                      onUpdateSimulationInput('pyrolysisTempC', parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-400"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Syngas Flue Heat: {telemetry.syngasHeatRecoveryKw.toFixed(1)} kW
                  </span>
                </div>
              </div>

              {/* AUTOMATED DRYER INTERLOCK BANNER */}
              <div
                className={`p-2 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  telemetry.dryerInterlockEngaged
                    ? 'bg-rose-950/40 border-rose-600/60 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {telemetry.dryerInterlockEngaged ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>
                    <strong className="font-semibold uppercase tracking-wider">
                      {telemetry.dryerInterlockEngaged ? 'INTERLOCK ACTIVE:' : 'NORMAL OPERATION:'}
                    </strong>{' '}
                    {telemetry.dryerInterlockEngaged
                      ? 'Biomass Dryer automatically paused. Sand Battery stored thermal energy is below minimum threshold (<180°C / 35% SOC).'
                      : 'Sand Battery threshold satisfied (>180°C). Supplying continuous clean convection heat to Zone B Dryer.'}
                  </span>
                </div>
                <span className="font-mono text-[11px] shrink-0 opacity-80">
                  Duty: {telemetry.dryerHeatDemandKw.toFixed(1)} kW
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
