'use client';

import React from 'react';
import { PlantTelemetry, ZoneId } from '@/lib/types/plant';
import { Language, translations } from '@/lib/i18n';
import {
  Flame,
  Sun,
  Activity,
  Layers,
  CheckCircle2,
  Cpu,
  Camera,
  Keyboard,
  Globe,
  ShieldAlert,
} from 'lucide-react';

interface TopHeaderBadgeProps {
  telemetry: PlantTelemetry;
  selectedZone: ZoneId | null;
  onOpenAiModal: () => void;
  onOpenZoneModal: () => void;
  onCaptureScreenshot: () => void;
  onOpenKeyboardModal?: () => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export function TopHeaderBadge({
  telemetry,
  selectedZone,
  onOpenAiModal,
  onOpenZoneModal,
  onCaptureScreenshot,
  onOpenKeyboardModal,
  lang = 'en',
  onToggleLang,
}: TopHeaderBadgeProps) {
  const t = translations[lang];

  return (
    <header className="absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-start justify-between gap-3 pointer-events-none z-20">
      {/* Top Left: Facility Branding & Quick Action Toolbar */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Main Branding Card */}
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl px-4 py-2.5 backdrop-blur-xl shadow-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-sm tracking-wider shadow-inner">
            ECO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                {t.appTitle}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                {t.appBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Toolbar (Directly beneath branding, exactly matching screenshot) */}
        <div className="flex items-center gap-1.5 font-medium text-xs">
          {/* Language Toggle */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-sky-300 border border-slate-700/80 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
              title={lang === 'en' ? 'Switch to French' : 'Basculer en Anglais'}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono font-bold">{lang.toUpperCase()}</span>
            </button>
          )}

          {/* Zone P&ID Modal */}
          <button
            onClick={onOpenZoneModal}
            className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
            title="Inspect System P&ID Schematic"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.zonePidBtn}</span>
          </button>

          {/* AI Energy Dispatch Modal (Prominent purple button) */}
          <button
            onClick={onOpenAiModal}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 rounded-xl flex items-center gap-1.5 font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            title="AI Thermodynamic Dispatch & Advisory"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t.aiDispatchBtn}</span>
          </button>

          {/* Keyboard Shortcuts */}
          {onOpenKeyboardModal && (
            <button
              onClick={onOpenKeyboardModal}
              className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-slate-700/80 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer font-mono"
              title={t.shortcutsGuide}
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.shortcutsBtn}</span>
            </button>
          )}

          {/* Capture Screenshot */}
          <button
            onClick={onCaptureScreenshot}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
            title={t.captureTooltip}
          >
            <Camera className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Top Right: Live SCADA Telemetry Pill Badges */}
      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Sand Core Battery Telemetry */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-xl text-xs font-mono">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{t.sandCore}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-amber-300">{telemetry.sandCoreTempC.toFixed(0)}°C</span>
              <span className="text-[10px] text-slate-400">({telemetry.sandBatterySocPercent.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Solar PV + Thermal Telemetry */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-xl text-xs font-mono">
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
          <div>
            <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{t.solarPvTh}</span>
            <span className="font-bold text-yellow-300">
              {(telemetry.pvPowerOutputKw + telemetry.solarThermalOutputKw).toFixed(1)} kW
            </span>
          </div>
        </div>

        {/* Pyrolysis Flue Heat & Biochar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-xl text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <div>
            <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider">{t.pyroFlue}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-rose-300">{telemetry.syngasHeatRecoveryKw.toFixed(1)} kW</span>
              <span className="text-[10px] text-emerald-400">({telemetry.biocharYieldKgH.toFixed(1)} kg/h C)</span>
            </div>
          </div>
        </div>

        {/* Automated Dryer Interlock Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl shadow-xl text-xs font-mono ${
            telemetry.dryerInterlockEngaged
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {telemetry.dryerInterlockEngaged ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <div>
            <span className="text-[9.5px] opacity-75 block uppercase tracking-wider">{t.dryerInterlock}</span>
            <span className="font-bold text-[10.5px]">
              {telemetry.dryerInterlockEngaged ? t.interlockInhibited : t.interlockArmed}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
