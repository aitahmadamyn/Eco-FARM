'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
  lang?: Language;
}

export function KeyboardShortcutsModal({ onClose, lang = 'en' }: KeyboardShortcutsModalProps) {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {t.shortcutsTitle}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t.shortcutsSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
          {t.shortcutsList.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-sky-500/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <kbd className="px-2.5 py-1 bg-slate-800 border border-slate-600 rounded-md font-mono font-bold text-sky-300 text-xs shadow-sm">
                  {sc.key}
                </kbd>
                <span className="text-slate-300">{sc.desc}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {sc.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {t.shortcutsTip}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}
