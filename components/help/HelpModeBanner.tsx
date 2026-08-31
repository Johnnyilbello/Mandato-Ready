'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const HelpModeBanner: React.FC = () => {
  const { isHelpModeActive, setIsHelpModeActive, setIsHelpPanelOpen } = useApp();

  if (!isHelpModeActive) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-30 bg-[#a14009] text-white px-4 md:px-8 py-2.5 shadow-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="flex items-center gap-2.5 text-[13px] font-medium min-w-0">
        <span className="w-5 h-5 rounded-full bg-white text-[#a14009] flex items-center justify-center font-bold text-[11px] shrink-0">
          ?
        </span>
        <span className="truncate">
          <strong>Modalità Aiuto attiva</strong> — seleziona un <code className="bg-white/20 px-1 py-0.5 font-bold">?</code> per capire cosa significa.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsHelpPanelOpen(true)}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">menu_book</span>
          Indice Guida
        </button>
        <button
          id="btn-exit-help-mode"
          onClick={() => setIsHelpModeActive(false)}
          className="px-3 py-1 bg-white text-[#a14009] hover:bg-[#efeeeb] text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          Esci dall&apos;aiuto
        </button>
      </div>
    </div>
  );
};
