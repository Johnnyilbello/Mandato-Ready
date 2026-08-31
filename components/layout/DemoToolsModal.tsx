'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export const DemoToolsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    resetDemoData,
    seedNewOpportunity,
    resetOnboarding,
    resetHints,
    seedCoherentDemoData,
    openPracticeDetail,
  } = useApp();

  return (
    <div className="fixed bottom-3 right-3 z-50">
      {!isOpen ? (
        <button
          id="btn-demo-tools-trigger"
          onClick={() => setIsOpen(true)}
          className="bg-[#faf9f6]/90 backdrop-blur-md hover:bg-[#ffffff] text-[#46474a] hover:text-[#1a1c1a] border border-[#c7c6ca]/80 px-3 py-1.5 text-[11px] font-mono flex items-center gap-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all cursor-pointer hover:shadow-md"
          title="Strumenti Prototipo & Demo"
        >
          <span className="material-symbols-outlined text-[15px] text-[#a14009]">tune</span>
          <span className="font-semibold">Demo Tools</span>
        </button>
      ) : (
        <div className="bg-[#faf9f6]/95 backdrop-blur-lg border-2 border-[#1a1c1a] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.15)] w-80 text-[#1a1c1a] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex justify-between items-center pb-2 mb-3 border-b border-[#c7c6ca]">
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#a14009]">
              PROTOTYPE CONTROLS
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#76777b] hover:text-[#1a1c1a] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <p className="text-[11px] text-[#76777b] mb-3 leading-relaxed">
            Utility di collaudo per testare onboarding, percorsi di avvio e sincronizzazione localStorage.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => {
                resetOnboarding();
                setIsOpen(false);
              }}
              className="w-full bg-[#a14009] text-white py-1.5 px-3 text-[11px] uppercase tracking-wider font-semibold hover:bg-[#7d2d00] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Riavvia Onboarding (4 Passi)</span>
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            </button>

            <button
              onClick={() => {
                resetHints();
                setIsOpen(false);
              }}
              className="w-full border border-[#c7c6ca] hover:bg-[#f4f3f1] py-1.5 px-3 text-[11px] uppercase tracking-wider text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Mostra Suggerimenti & Guida</span>
              <span className="material-symbols-outlined text-[14px]">help_outline</span>
            </button>

            <button
              onClick={() => {
                seedCoherentDemoData();
                setIsOpen(false);
              }}
              className="w-full border border-[#c7c6ca] hover:bg-[#f4f3f1] py-1.5 px-3 text-[11px] uppercase tracking-wider text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Carica Dati Demo Completi</span>
              <span className="material-symbols-outlined text-[14px]">dataset</span>
            </button>

            <button
              onClick={() => {
                seedNewOpportunity();
                setIsOpen(false);
              }}
              className="w-full bg-[#1a1c1a] text-white py-1.5 px-3 text-[11px] uppercase tracking-wider font-semibold hover:bg-[#333533] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>+ Crea Nuova Opportunità</span>
              <span className="material-symbols-outlined text-[14px]">bolt</span>
            </button>

            <button
              onClick={() => {
                openPracticeDetail('prat-1');
                setIsOpen(false);
              }}
              className="w-full border border-[#c7c6ca] hover:bg-[#f4f3f1] py-1.5 px-3 text-[11px] uppercase tracking-wider text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Apri Pratica Mario Rossi</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>

            <button
              onClick={() => {
                resetDemoData();
                setIsOpen(false);
              }}
              className="w-full border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/40 py-1.5 px-3 text-[11px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-between cursor-pointer mt-3"
            >
              <span>Ripristina Dati Iniziali</span>
              <span className="material-symbols-outlined text-[14px]">refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
