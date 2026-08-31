'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PracticeStatus } from '@/lib/types';

export const PraticheListView: React.FC = () => {
  const {
    practices,
    getClientById,
    getPropertyById,
    getDocumentsByPracticeId,
    openPracticeDetail,
    openNewPracticeWizard,
    openNewClientModal,
    openNewPropertyModal,
    isHelpModeActive,
  } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = practices.filter((p) => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const c = getClientById(p.clientId);
      const pr = getPropertyById(p.propertyId);
      const matchClient = c ? `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) : false;
      const matchAddress = pr ? `${pr.address} ${pr.municipality}`.toLowerCase().includes(q) : false;
      const matchCode = p.code.toLowerCase().includes(q);
      return matchClient || matchAddress || matchCode;
    }
    return true;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-6 border-b border-[#c7c6ca] gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
            FASCICOLI OPERATIVI
          </div>
          <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a]">
            Pratiche
          </h1>
          <p className="text-[14px] text-[#46474a] mt-1">
            Gestisci tutti i fascicoli immobiliari, lo stato dei documenti e il prossimo passo operativo.
          </p>
        </div>
      </div>

      {/* Compact Quick Action Area (Requirement #4) */}
      <div className="bg-[#faf9f6] border border-[#c7c6ca] p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#76777b]">
            AZIONI RAPIDE
          </div>
          <h2 className="text-[16px] font-serif-display font-bold text-[#1a1c1a]">
            Cosa vuoi fare?
          </h2>
          {isHelpModeActive && (
            <p className="text-[11px] text-[#a14009] mt-0.5">
              💡 Puoi avviare una nuova pratica oppure registrare un cliente/immobile separatamente.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary: Nuova pratica */}
          <button
            onClick={() => openNewPracticeWizard()}
            className="bg-[#1a1c1a] text-white px-5 py-2.5 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            + Nuova pratica
          </button>

          {/* Secondary: Nuovo cliente */}
          <button
            onClick={() => openNewClientModal()}
            className="bg-white text-[#1a1c1a] border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] px-4 py-2.5 text-[12px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#a14009]">person_add</span>
            + Nuovo cliente
          </button>

          {/* Secondary: Nuovo immobile */}
          <button
            onClick={() => openNewPropertyModal()}
            className="bg-white text-[#1a1c1a] border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] px-4 py-2.5 text-[12px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#a14009]">home_work</span>
            + Nuovo immobile
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-[#c7c6ca] pb-3 sm:pb-0">
          <span className="text-[11px] font-bold uppercase text-[#76777b] mr-2">Stato:</span>
          {['ALL', 'In corso', 'In attesa', 'Conclusa'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-[11px] font-bold uppercase cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'bg-[#1a1c1a] text-white'
                  : 'text-[#76777b] hover:bg-[#e3e2e0] hover:text-[#1a1c1a]'
              }`}
            >
              {st === 'ALL' ? 'Tutte' : st}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#76777b] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca cliente, indirizzo, codice..."
            className="w-full pl-9 pr-3 py-2 border border-[#c7c6ca] bg-white text-[13px] text-[#1a1c1a] placeholder-[#76777b]"
          />
        </div>
      </div>

      {/* Practice Table / Cards */}
      <div className="border border-[#c7c6ca] bg-[#faf9f6] divide-y divide-[#c7c6ca]">
        {filtered.map((practice) => {
          const client = getClientById(practice.clientId);
          const property = getPropertyById(practice.propertyId);
          const docs = getDocumentsByPracticeId(practice.id);
          const completedDocs = docs.filter((d) => d.status === 'Disponibile').length;

          return (
            <div
              key={practice.id}
              onClick={() => openPracticeDetail(practice.id)}
              className="p-6 hover:bg-[#f4f3f1] transition-colors cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Column: Title & Subject */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-bold text-[#76777b] bg-[#efeeeb] px-2 py-0.5 border border-[#c7c6ca]">
                    {practice.code}
                  </span>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#efeeeb] border border-[#c7c6ca] text-[#1a1c1a]">
                    {practice.practiceType}
                  </span>
                  <span className="text-[12px] font-mono text-[#76777b]">
                    Aperta il {practice.openedDate}
                  </span>
                </div>

                <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a]">
                  {client?.firstName} {client?.lastName}{' '}
                  <span className="text-[#76777b] font-sans font-normal text-[16px]">
                    · {property?.address} ({property?.municipality})
                  </span>
                </h3>

                <p className="text-[13px] text-[#46474a]">
                  <strong>Prossimo passo:</strong> {practice.nextAction.description}
                </p>
              </div>

              {/* Center Status Indicators */}
              <div className="flex flex-wrap items-center gap-6 border-y lg:border-y-0 lg:border-x border-[#c7c6ca] py-3 lg:py-0 lg:px-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block">
                    Documenti
                  </span>
                  <span className="text-[14px] font-mono font-bold text-[#1a1c1a]">
                    {completedDocs}/{docs.length}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block">
                    Incarico
                  </span>
                  <span
                    className={`text-[12px] font-bold uppercase ${
                      practice.mandateStatus === 'firmato' ? 'text-[#1a1c1a]' : 'text-[#a14009]'
                    }`}
                  >
                    {practice.mandateStatus === 'firmato' ? 'Firmato' : 'Da firmare'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block">
                    AML
                  </span>
                  <span className="text-[12px] uppercase text-[#76777b]">
                    {practice.amlStatus}
                  </span>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPracticeDetail(practice.id);
                  }}
                  className="w-full lg:w-auto px-5 py-2.5 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apri Fascicolo</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
