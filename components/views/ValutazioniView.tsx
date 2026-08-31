'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const ValutazioniView: React.FC = () => {
  const {
    properties,
    clients,
    openNewPracticeWizard,
    agencyProfile,
    setActiveTab,
  } = useApp();

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#c7c6ca] gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
            STIME & ANALISI COMPARATIVA
          </div>
          <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a]">
            Valutazioni Mandato Ready
          </h1>
          <p className="text-[14px] text-[#46474a] mt-1">
            Indici di prezzo di mercato, valori OMI e comparabili sul territorio di Terrasini, Cinisi e Palermo.
          </p>
        </div>

        <button
          onClick={() => openNewPracticeWizard()}
          className="bg-[#1a1c1a] text-white px-6 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_chart</span>
          Nuova Valutazione
        </button>
      </div>

      {/* Grid of Estimates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {properties.map((p) => {
          const owner = clients.find((c) => p.owners.includes(c.id));
          const pricePerSqm = p.estimatedValue ? Math.round(p.estimatedValue / p.approximateSurface) : 2200;

          return (
            <div key={p.id} className="bg-[#faf9f6] border border-[#c7c6ca] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#efeeeb] border border-[#c7c6ca] text-[#1a1c1a]">
                    {p.type}
                  </span>
                  <span className="text-[12px] font-mono text-[#a14009] font-bold">
                    € {pricePerSqm} / m²
                  </span>
                </div>

                <h3 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">
                  {p.address}
                </h3>
                <p className="text-[13px] text-[#76777b] mb-4">
                  {p.municipality} ({p.province}) · ~{p.approximateSurface} m²
                </p>

                <div className="bg-[#f4f3f1] p-4 border border-[#c7c6ca] space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#76777b]">Valore stimato:</span>
                    <strong className="text-[#1a1c1a] font-mono">
                      € {p.estimatedValue ? p.estimatedValue.toLocaleString('it-IT') : '250.000'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#76777b]">Forbice consigliata:</span>
                    <span className="text-[#1a1c1a] font-mono text-[12px]">
                      -5% / +3%
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#76777b]">Proprietario:</span>
                    <span className="text-[#1a1c1a] font-medium truncate">
                      {owner ? `${owner.firstName} ${owner.lastName}` : 'N.D.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#c7c6ca]">
                <button
                  onClick={() => openNewPracticeWizard('existing_client', owner?.id)}
                  className="w-full py-2 border border-[#1a1c1a] text-[#1a1c1a] hover:bg-[#1a1c1a] hover:text-white transition-colors text-[11px] uppercase font-bold tracking-widest cursor-pointer"
                >
                  Trasforma in Mandato
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agency Profile & Settings Link */}
      <div className="border-t border-[#c7c6ca] pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#faf9f6] border p-6">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-[#a14009] block mb-0.5">
            CONFIGURAZIONE & METODO DI LAVORO
          </span>
          <h3 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">
            {agencyProfile.agencyName} · {agencyProfile.city}
          </h3>
          <p className="text-[13px] text-[#46474a]">
            Referente: {agencyProfile.agentName} · Modulo AML: {agencyProfile.workPreferences?.enableAmlModule ? 'Attivo' : 'Disattivato'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('impostazioni')}
          className="px-5 py-2.5 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] uppercase font-bold tracking-widest transition-colors cursor-pointer shrink-0 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">settings</span>
          Apri Impostazioni
        </button>
      </div>
    </div>
  );
};
