'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    openNewClientModal,
    openNewPropertyModal,
    openNewPracticeWizard,
    isHelpModeActive,
  } = useApp();

  if (!isQuickAddOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all"
      onClick={closeQuickAdd}
    >
      <div
        className="bg-[#faf9f6] border-t-2 sm:border-2 border-[#1a1c1a] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative rounded-t-2xl sm:rounded-none animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-[#c7c6ca] rounded-full mx-auto mb-4 sm:hidden" />

        <button
          onClick={closeQuickAdd}
          className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-1 cursor-pointer"
          aria-label="Chiudi"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="mb-6 pb-3 border-b border-[#c7c6ca]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-1">
            CREAZIONE RAPIDA
          </div>
          <h2 className="text-[22px] sm:text-[24px] font-serif-display font-bold text-[#1a1c1a]">
            Cosa vuoi aggiungere?
          </h2>
          {isHelpModeActive && (
            <p className="text-[12px] text-[#a14009] mt-1 bg-[#ffdbcd] p-2 border border-[#a14009]/30">
              💡 <strong>+ Nuovo:</strong> Da qui puoi aggiungere rapidamente un cliente, un immobile o una pratica.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {/* Nuovo cliente */}
          <button
            onClick={() => {
              closeQuickAdd();
              openNewClientModal();
            }}
            className="w-full text-left p-4 bg-white border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] transition-all group cursor-pointer flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-[#efeeeb] group-hover:bg-[#1a1c1a] group-hover:text-white transition-colors flex items-center justify-center border border-[#c7c6ca] shrink-0">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#1a1c1a] group-hover:text-[#a14009] transition-colors">
                  Nuovo cliente
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#76777b] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-[12px] text-[#46474a] mt-0.5 leading-snug">
                Salva una nuova persona o azienda nei tuoi contatti.
              </p>
            </div>
          </button>

          {/* Nuovo immobile */}
          <button
            onClick={() => {
              closeQuickAdd();
              openNewPropertyModal();
            }}
            className="w-full text-left p-4 bg-white border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] transition-all group cursor-pointer flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-[#efeeeb] group-hover:bg-[#1a1c1a] group-hover:text-white transition-colors flex items-center justify-center border border-[#c7c6ca] shrink-0">
              <span className="material-symbols-outlined text-[22px]">home_work</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#1a1c1a] group-hover:text-[#a14009] transition-colors">
                  Nuovo immobile
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#76777b] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-[12px] text-[#46474a] mt-0.5 leading-snug">
                Inserisci una nuova proprietà nel tuo archivio.
              </p>
            </div>
          </button>

          {/* Nuova pratica */}
          <button
            onClick={() => {
              closeQuickAdd();
              openNewPracticeWizard();
            }}
            className="w-full text-left p-4 bg-[#1a1c1a] text-white border border-[#1a1c1a] hover:bg-[#333533] transition-all group cursor-pointer flex items-start gap-4 shadow-sm"
          >
            <div className="w-10 h-10 bg-white/10 text-white flex items-center justify-center border border-white/20 shrink-0">
              <span className="material-symbols-outlined text-[22px]">create_new_folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-white group-hover:text-[#ffdbcd] transition-colors">
                  Nuova pratica
                </span>
                <span className="material-symbols-outlined text-[18px] text-white/70 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-[12px] text-white/80 mt-0.5 leading-snug">
                Avvia un nuovo lavoro collegando cliente e immobile.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
