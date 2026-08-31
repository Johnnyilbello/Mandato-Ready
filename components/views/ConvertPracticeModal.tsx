'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Opportunity } from '@/lib/types';

interface ConvertPracticeModalProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
}

export const ConvertPracticeModal: React.FC<ConvertPracticeModalProps> = ({
  opportunity,
  isOpen,
  onClose,
}) => {
  const {
    getClientById,
    getPropertyById,
    convertOpportunityToPractice,
    openPracticeDetail,
  } = useApp();

  if (!isOpen) return null;

  const client = getClientById(opportunity.clientId);
  const property = getPropertyById(opportunity.propertyId);

  const handleConfirm = () => {
    const practice = convertOpportunityToPractice(opportunity.id);
    if (!practice) return;
    onClose();
    openPracticeDetail(practice.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#faf9f6] border-2 border-[#1a1c1a] max-w-2xl w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 min-w-0">
        <button
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-9 h-9 bg-[#1a1c1a] text-white flex shrink-0 items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">transform</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#a14009]">
              PASSAGGIO ALLA FASE OPERATIVA
            </span>
            <h2 className="text-[24px] font-serif-display font-bold text-[#1a1c1a] break-words">
              Converti in nuova pratica
            </h2>
          </div>
        </div>

        <p className="text-[14px] text-[#46474a] mb-6 leading-relaxed">
          Cliente, Immobile e documenti dichiarati saranno riutilizzati come record condivisi. La conversione non crea copie delle anagrafiche esistenti.
        </p>

        <div className="bg-[#efeeeb] border border-[#c7c6ca] p-4 mb-6 space-y-3 min-w-0">
          <div className="flex items-center gap-2 text-[12px] font-bold text-[#a14009] uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Dati condivisi
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] min-w-0">
            <div className="min-w-0">
              <span className="text-[#76777b] text-[11px] uppercase block">Proprietario</span>
              <strong className="text-[#1a1c1a] break-words">
                {client ? `${client.firstName} ${client.lastName}` : 'Cliente non disponibile'}
              </strong>
              <span className="text-[#76777b] block text-[12px] font-mono break-all">{client?.phone}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[#76777b] text-[11px] uppercase block">Immobile</span>
              <strong className="text-[#1a1c1a] break-words">
                {property ? `${property.address || 'Indirizzo da definire'}, ${property.municipality}` : 'Immobile non disponibile'}
              </strong>
              <span className="text-[#76777b] block text-[12px] break-words">
                {property?.type}{property?.approximateSurface ? ` · ~${property.approximateSurface} m²` : ''}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#c7c6ca]/60 text-[12px] text-[#46474a]">
            <strong>Documenti dichiarati:</strong>{' '}
            {opportunity.declaredDocuments.filter((document) => document.declaredPresent).length} disponibili,{' '}
            {opportunity.declaredDocuments.filter((document) => !document.declaredPresent).length} da recuperare.
          </div>
        </div>

        <div className="flex items-start gap-2 text-[12px] text-[#46474a] mb-6 bg-[#f4f3f1] p-3 border border-[#c7c6ca]">
          <span className="material-symbols-outlined text-[#a14009] text-[18px] shrink-0">info</span>
          <span>La pratica viene creata solo dopo la conferma. L’apertura del dettaglio avviene esplicitamente da questo dialogo.</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#c7c6ca]">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-[#c7c6ca] text-[#1a1c1a] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={!client || !property}
            className="px-8 py-3 bg-[#a14009] hover:bg-[#7d2d00] text-white text-[12px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Conferma e apri pratica</span>
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
