'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ClientDetailView } from './ClientDetailView';
import { PropertyDetailView } from './PropertyDetailView';

export const ClientiImmobiliView: React.FC<{ initialTab?: 'clienti' | 'immobili' }> = ({
  initialTab = 'clienti',
}) => {
  const {
    clients,
    properties,
    practices,
    selectedClientId,
    setSelectedClientId,
    selectedPropertyId,
    setSelectedPropertyId,
    openNewClientModal,
    openNewPropertyModal,
    openNewPracticeWizard,
    openPracticeDetail,
    isHelpModeActive,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'clienti' | 'immobili'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // If a client is selected while on 'clienti' tab, render ClientDetailView
  if (activeSubTab === 'clienti' && selectedClientId) {
    return <ClientDetailView />;
  }

  // If a property is selected while on 'immobili' tab, render PropertyDetailView
  if (activeSubTab === 'immobili' && selectedPropertyId) {
    return <PropertyDetailView />;
  }

  // Filter clients
  const filteredClients = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = c.entityType === 'azienda' ? c.companyName || '' : `${c.firstName} ${c.lastName}`;
    return (
      name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.fiscalCode && c.fiscalCode.toLowerCase().includes(q))
    );
  });

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const owner = clients.find((c) => p.owners.includes(c.id));
    const ownerName = owner ? (owner.entityType === 'azienda' ? owner.companyName : `${owner.firstName} ${owner.lastName}`) : '';
    return (
      p.address.toLowerCase().includes(q) ||
      p.municipality.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      (ownerName && ownerName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#c7c6ca] gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
            CLIENTI & ASSET IMMOBILIARI
          </div>
          <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a]">
            {activeSubTab === 'clienti' ? 'Clienti' : 'Immobili'}
          </h1>
          <p className="text-[14px] text-[#46474a] mt-1">
            {activeSubTab === 'clienti'
              ? 'Gestisci tutti i tuoi contatti, venditori e acquirenti registrati in agenzia.'
              : 'Gestisci il patrimonio immobiliare in portafoglio, indipendentemente dalle pratiche.'}
          </p>
        </div>

        {/* Primary Page Action */}
        <div className="flex items-center gap-3">
          {activeSubTab === 'clienti' ? (
            <button
              id="btn-nuovo-cliente"
              onClick={() => openNewClientModal()}
              className="bg-[#1a1c1a] text-white px-5 py-2.5 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              + Nuovo cliente
            </button>
          ) : (
            <button
              id="btn-nuovo-immobile"
              onClick={() => openNewPropertyModal()}
              className="bg-[#1a1c1a] text-white px-5 py-2.5 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">home_work</span>
              + Nuovo immobile
            </button>
          )}
        </div>
      </div>

      {/* Subtab navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c7c6ca] mb-8 pb-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setActiveSubTab('clienti');
              setSelectedClientId(null);
            }}
            className={`text-[13px] uppercase font-bold tracking-wider cursor-pointer pb-2 -mb-3 transition-colors ${
              activeSubTab === 'clienti'
                ? 'text-[#1a1c1a] border-b-2 border-[#1a1c1a]'
                : 'text-[#76777b] hover:text-[#1a1c1a]'
            }`}
          >
            Clienti ({clients.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('immobili');
              setSelectedPropertyId(null);
            }}
            className={`text-[13px] uppercase font-bold tracking-wider cursor-pointer pb-2 -mb-3 transition-colors ${
              activeSubTab === 'immobili'
                ? 'text-[#1a1c1a] border-b-2 border-[#1a1c1a]'
                : 'text-[#76777b] hover:text-[#1a1c1a]'
            }`}
          >
            Immobili ({properties.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#76777b] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'clienti' ? 'Cerca cliente, telefono, CF...' : 'Cerca indirizzo, comune, proprietario...'}
            className="w-full pl-9 pr-3 py-1.5 border border-[#c7c6ca] bg-white text-[12px] text-[#1a1c1a] placeholder-[#76777b] outline-none"
          />
        </div>
      </div>

      {/* FIRST-USE DISCOVERABILITY BANNERS (Requirement #12) */}
      {activeSubTab === 'clienti' ? (
        <div className="bg-[#f4f3f1] border-l-4 border-[#1a1c1a] p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] block mb-0.5">
              ANAGRAFICA INDIPENDENTE
            </span>
            <h3 className="text-[16px] font-serif-display font-bold text-[#1a1c1a]">
              Salva qui i tuoi clienti
            </h3>
            <p className="text-[13px] text-[#46474a] mt-0.5">
              Puoi aggiungere un cliente anche senza creare subito una pratica. Lo ritroverai sempre disponibile per il futuro.
            </p>
            {isHelpModeActive && (
              <p className="text-[11px] text-[#a14009] mt-1 font-semibold">
                💡 Cliente: Puoi salvarlo subito e collegarlo a un immobile o a una pratica quando vuoi.
              </p>
            )}
          </div>
          <button
            onClick={() => openNewClientModal()}
            className="px-4 py-2 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-wider hover:bg-[#333533] shrink-0 cursor-pointer"
          >
            + Nuovo cliente
          </button>
        </div>
      ) : (
        <div className="bg-[#f4f3f1] border-l-4 border-[#1a1c1a] p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] block mb-0.5">
              ARCHIVIO IMMOBILI
            </span>
            <h3 className="text-[16px] font-serif-display font-bold text-[#1a1c1a]">
              Salva qui gli immobili
            </h3>
            <p className="text-[13px] text-[#46474a] mt-0.5">
              Puoi inserire un immobile e collegarlo a cliente e pratica anche in seguito.
            </p>
            {isHelpModeActive && (
              <p className="text-[11px] text-[#a14009] mt-1 font-semibold">
                💡 Immobile: Puoi salvarlo indipendentemente e collegarlo successivamente a cliente e pratica.
              </p>
            )}
          </div>
          <button
            onClick={() => openNewPropertyModal()}
            className="px-4 py-2 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-wider hover:bg-[#333533] shrink-0 cursor-pointer"
          >
            + Nuovo immobile
          </button>
        </div>
      )}

      {/* CLIENTS TAB LIST */}
      {activeSubTab === 'clienti' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((c) => {
            const clientPractices = practices.filter((p) => p.clientId === c.id);
            const clientProperties = properties.filter((p) => p.owners.includes(c.id));
            const displayName = c.entityType === 'azienda' ? c.companyName || `${c.firstName} ${c.lastName}` : `${c.firstName} ${c.lastName}`;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className="bg-[#faf9f6] border border-[#c7c6ca] p-6 flex flex-col justify-between hover:border-[#1a1c1a] transition-all cursor-pointer group hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#efeeeb] border border-[#c7c6ca] text-[#1a1c1a]">
                      {c.entityType === 'azienda' ? 'Azienda' : c.type === 'seller' ? 'Venditore' : c.type === 'buyer' ? 'Acquirente' : 'Venditore & Acquirente'}
                    </span>
                    <span className="text-[12px] font-mono text-[#76777b]">{c.city || 'Sicilia'}</span>
                  </div>

                  <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a] group-hover:text-[#a14009] transition-colors">
                    {displayName}
                  </h3>

                  {c.contactPerson && (
                    <p className="text-[12px] text-[#46474a] mt-0.5">
                      Ref: {c.contactPerson}
                    </p>
                  )}

                  <div className="space-y-1 mt-3 text-[13px] font-mono text-[#46474a]">
                    <p className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#76777b]">call</span>
                      {c.phone}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[15px] text-[#76777b]">mail</span>
                      {c.email}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#c7c6ca]/60 text-[12px] space-y-1">
                    <p className="text-[#76777b]">
                      Pratiche attive: <strong className="text-[#1a1c1a]">{clientPractices.length > 0 ? `${clientPractices.length} pratica/e` : 'Nessuna pratica'}</strong>
                    </p>
                    <p className="text-[#76777b]">
                      Immobili in proprietà: <strong className="text-[#1a1c1a]">{clientProperties.length > 0 ? `${clientProperties.length} immobile/i` : 'Nessuno'}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#c7c6ca] flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#1a1c1a] group-hover:text-[#a14009] flex items-center gap-1">
                    <span>Vedi scheda cliente</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROPERTIES TAB LIST */}
      {activeSubTab === 'immobili' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((p) => {
            const owner = clients.find((c) => p.owners.includes(c.id));
            const ownerName = owner ? (owner.entityType === 'azienda' ? owner.companyName : `${owner.firstName} ${owner.lastName}`) : 'Nessun cliente collegato';
            const activePrat = practices.find((pr) => pr.propertyId === p.id);

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className="bg-[#faf9f6] border border-[#c7c6ca] p-6 flex flex-col justify-between hover:border-[#1a1c1a] transition-all cursor-pointer group hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#efeeeb] border border-[#c7c6ca] text-[#1a1c1a]">
                      {p.type}
                    </span>
                    <span className="text-[12px] font-mono text-[#76777b]">
                      ~{p.approximateSurface} m²
                    </span>
                  </div>

                  <h3 className="text-[18px] font-serif-display font-bold text-[#1a1c1a] group-hover:text-[#a14009] transition-colors">
                    {p.address}
                  </h3>
                  <p className="text-[13px] text-[#76777b]">
                    {p.municipality} ({p.province}) {p.area ? `· ${p.area}` : ''}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#c7c6ca]/60 space-y-1.5 text-[13px]">
                    <p className="text-[#46474a]">
                      <strong>Proprietario:</strong> {ownerName}
                    </p>
                    <p className="text-[#76777b] text-[12px]">
                      Fascicolo Pratica: <strong className={activePrat ? 'text-[#a14009]' : 'text-[#76777b]'}>{activePrat ? activePrat.code : 'Nessuna pratica attiva'}</strong>
                    </p>
                    {(p.askingPrice || p.estimatedValue) && (
                      <p className="text-[#1a1c1a] font-mono">
                        <strong>Prezzo richiesto:</strong> € {(p.askingPrice || p.estimatedValue)?.toLocaleString('it-IT')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#c7c6ca] flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#1a1c1a] group-hover:text-[#a14009] flex items-center gap-1">
                    <span>Vedi scheda immobile</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
