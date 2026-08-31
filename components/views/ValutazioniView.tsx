'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const ValutazioniView: React.FC = () => {
  const { properties, setActiveTab } = useApp();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 font-sans min-w-0">
      <div className="mb-8 pb-6 border-b border-[#c7c6ca] min-w-0">
        <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
          MODULO SEPARATO
        </div>
        <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a] break-words">
          Valutazioni
        </h1>
        <p className="text-[14px] text-[#46474a] mt-1 max-w-3xl">
          Il motore di valutazione immobiliare non fa parte di Mandato Ready Phase 1. In questa fase il sistema non calcola valori di mercato, prezzi al m², forbici consigliate o stime automatiche.
        </p>
      </div>

      <section className="border-2 border-[#1a1c1a] bg-[#faf9f6] p-5 sm:p-8 max-w-4xl min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 min-w-0">
          <div className="w-12 h-12 shrink-0 bg-[#1a1c1a] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">lock_clock</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#a14009]">NON ATTIVO IN PHASE 1</span>
            <h2 className="text-[22px] sm:text-[26px] font-serif-display font-bold text-[#1a1c1a] mt-1 break-words">
              Nessuna valutazione viene generata automaticamente
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#46474a] mt-3 leading-relaxed">
              Gli immobili continuano a essere gestiti come record condivisi. L’unico dato economico semplice previsto nella scheda Immobile è l’eventuale “Prezzo richiesto dal proprietario”, che resta un dato dichiarato e non una valutazione Mandato Ready.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <div className="border border-[#c7c6ca] bg-white p-4 min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#76777b]">Immobili in archivio</span>
                <strong className="block text-[24px] font-mono mt-1">{properties.length}</strong>
                <p className="text-[11px] text-[#76777b] mt-1">Record gestiti senza stima automatica.</p>
              </div>
              <div className="border border-[#c7c6ca] bg-white p-4 min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#76777b]">Stato modulo</span>
                <strong className="block text-[16px] mt-2">Differito</strong>
                <p className="text-[11px] text-[#76777b] mt-1">Eventuale sviluppo futuro, fuori dal perimetro Phase 1.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-[#c7c6ca]">
              <button
                type="button"
                onClick={() => setActiveTab('immobili')}
                className="px-5 py-3 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest hover:bg-[#333533]"
              >
                Vai agli immobili
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pratiche')}
                className="px-5 py-3 border border-[#1a1c1a] text-[#1a1c1a] text-[11px] uppercase font-bold tracking-widest hover:bg-[#efeeeb]"
              >
                Vai alle pratiche
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
