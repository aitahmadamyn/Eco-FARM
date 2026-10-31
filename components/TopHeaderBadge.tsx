'use client';

import React from 'react';
import { PlantTelemetry, ZoneId } from '@/lib/types/plant';
import {
  Flame,
  Sun,
  Zap,
  Activity,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Camera,
  Keyboard,
} from 'lucide-react';

interface TopHeaderBadgeProps {
  telemetry: PlantTelemetry;
  selectedZone: ZoneId | null;
  onOpenAiModal: () => void;
  onOpenZoneModal: () => void;
  onCaptureScreenshot: () => void;
  onOpenKeyboardModal?: () => void;
}

export function TopHeaderBadge({
  telemetry,
  selectedZone,
  onOpenAiModal,
  onOpenZoneModal,
  onCaptureScreenshot,
  onOpenKeyboardModal,
}: TopHeaderBadgeProps) {
  return (
    <header className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
      {/* Title & Facility Identity */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-2xl pointer-events-auto flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
          ECO
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
              ECOFARM CIRCULAR
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PILOT PLANT v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Intelligent Biomass Pyrolysis • Hybrid Sand Thermal Battery • Automated Drying
          </p>
        </div>
      </div>

      {/* Live SCADA Telemetry Bar */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 backdrop-blur-md shadow-2xl pointer-events-auto text-xs font-mono">
        {/* Sand Battery Stat */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">SAND CORE</span>
            <span className="font-bold text-amber-300">{telemetry.sandCoreTempC.toFixed(0)}°C</span>
            <span className="text-[10px] text-slate-400 ml-1">({telemetry.sandBatterySocPercent.toFixed(0)}%)</span>
          </div>
        </div>

        {/* PV & Solar Stat */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">SOLAR PV+TH</span>
            <span className="font-bold text-yellow-300">
              {(telemetry.pvPowerOutputKw + telemetry.solarThermalOutputKw).toFixed(1)} kW
            </span>
          </div>
        </div>

        {/* Pyrolysis Syngas & Biochar */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
          <Activity className="w-3.5 h-3.5 text-red-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">PYROLYSIS FLUE</span>
            <span className="font-bold text-red-300">{telemetry.syngasHeatRecoveryKw.toFixed(1)} kW</span>
            <span className="text-[10px] text-emerald-400 ml-1">({telemetry.biocharYieldKgH.toFixed(1)} kg/h C)</span>
          </div>
        </div>

        {/* Automated Interlock Indicator */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
            telemetry.dryerInterlockEngaged
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {telemetry.dryerInterlockEngaged ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <div>
            <span className="text-[10px] opacity-75 block leading-tight">DRYER INTERLOCK</span>
            <span className="font-bold text-[11px]">
              {telemetry.dryerInterlockEngaged ? 'INHIBITED (<180°C)' : 'ARMED & RUNNING'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Badges */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenZoneModal}
          className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg"
          title="Inspect Zone Specifications"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Zone P&ID</span>
        </button>

        <button
          onClick={onOpenAiModal}
          className="px-3 py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-900/30"
          title="AI-Assisted Energy Management Optimization"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Energy Dispatch</span>
        </button>

        {onOpenKeyboardModal && (
          <button
            onClick={onOpenKeyboardModal}
            className="px-2.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors shadow-lg"
            title="Guide des Touches (Raccourcis Clavier & Tactile)"
          >
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Touches</span>
          </button>
        )}

        <button
          onClick={onCaptureScreenshot}
          className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition-colors shadow-lg"
          title="Capture High-Res Architectural Render"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </header>
  );
}
