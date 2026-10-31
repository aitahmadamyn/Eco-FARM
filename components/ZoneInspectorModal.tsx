'use client';

import React from 'react';
import { ZoneId } from '@/lib/types/plant';
import { ZONES_DATA } from '@/lib/simulation/plantSimulation';
import {
  X,
  Layers,
  Wrench,
  Gauge,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ZoneInspectorModalProps {
  zoneId: ZoneId;
  onClose: () => void;
  onSelectZone: (zoneId: ZoneId) => void;
}

export function ZoneInspectorModal({
  zoneId,
  onClose,
  onSelectZone,
}: ZoneInspectorModalProps) {
  const zone = ZONES_DATA[zoneId];
  const allZones: ZoneId[] = ['zoneA', 'zoneB', 'zoneC', 'zoneD', 'zoneE', 'zoneF'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono text-xs font-bold">
              {zone.tag}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">{zone.name}</h2>
              <p className="text-xs text-slate-400">{zone.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone Selector Pill Tabs */}
        <div className="flex overflow-x-auto p-2 bg-slate-950/60 border-b border-slate-800 gap-1.5 scrollbar-none">
          {allZones.map((zid) => {
            const z = ZONES_DATA[zid];
            return (
              <button
                key={zid}
                onClick={() => onSelectZone(zid)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  zoneId === zid
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{z.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Overview Description */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 leading-relaxed text-slate-300">
            {zone.description}
          </div>

          {/* Operational Parameters Grid */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-slate-100 font-semibold uppercase tracking-wider text-[11px]">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Operational Telemetry & Parameters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {zone.operationalParameters.map((param, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <span className="text-slate-400 block text-[11px]">{param.label}</span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      Nominal: {param.nominal}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-sky-300">
                      {param.value}
                    </span>{' '}
                    <span className="text-[10px] text-slate-400">{param.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mechanical Equipment Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-slate-100 font-semibold uppercase tracking-wider text-[11px]">
              <Wrench className="w-4 h-4 text-sky-400" />
              <span>Engineered Equipment Specifications</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {zone.equipmentList.map((eq, i) => (
                <div
                  key={i}
                  className="bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/50 text-slate-300 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span>{eq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Engineering Details */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-slate-100 font-semibold uppercase tracking-wider text-[11px]">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Design Architecture & System Logic</span>
            </div>
            <div className="space-y-2">
              {zone.keyEngineeringSpecs.map((spec, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50"
                >
                  <span className="font-semibold text-slate-200 block mb-0.5">
                    {spec.title}
                  </span>
                  <span className="text-slate-400">{spec.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Interlocks */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-slate-100 font-semibold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Safety Relays & Automated Interlocks</span>
            </div>
            <ul className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-slate-300">
              {zone.safetyAndInterlocks.map((safety, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{safety}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Process Connections */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-slate-100 font-semibold uppercase tracking-wider text-[11px]">
              <ArrowRight className="w-4 h-4 text-indigo-400" />
              <span>P&ID Material & Energy Interfaces</span>
            </div>
            <div className="space-y-2">
              {zone.connections.map((conn, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300">{conn.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-slate-300">{conn.to}</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                    style={{
                      borderColor: conn.color + '60',
                      backgroundColor: conn.color + '20',
                      color: conn.color,
                    }}
                  >
                    {conn.media}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            ECOFARM CIRCULAR P&ID Document Ref: EFC-BIM-2026-REV3
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
