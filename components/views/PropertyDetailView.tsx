'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const PropertyDetailView: React.FC = () => {
  const {
    selectedPropertyId,
    setSelectedPropertyId,
    getPropertyById,
    clients,
    practices,
    openNewPracticeWizard,
    openNewClientModal,
    openPracticeDetail,
    setSelectedClientId,
    setActiveTab,
  } = useApp();

  const property = getPropertyById(selectedPropertyId || undefined);

  if (!property) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        <p className="text-[#76777b]">Immobile non trovato.</p>
        <button
          onClick={() => setSelectedPropertyId(null)}
          className="mt-4 px-4 py-2 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-wider"
        >
          Torna agli immobili
        </button>
      </div>
    );
  }

  const ownerClients = clients.filter((c) => property.owners.includes(c.id));
  const activePractices = practices.filter((pr) => pr.propertyId === property.id);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans space-y-8 animate-in fade-in duration-150">
      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c7c6ca]">
        <button
          onClick={() => setSelectedPropertyId(null)}
          className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Torna agli immobili</span>
        </button>

        <div className="flex items-center gap-3">
          {ownerClients.length === 0 && (
            <button
              onClick={() => {
                openNewClientModal({}, (newClient) => {
                  property.owners = [newClient.id];
                });
              }}
              className="px-4 py-2 border border-[#1a1c1a] text-[#1a1c1a] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>+ Collega cliente</span>
            </button>
          )}
          <button
            onClick={() => openNewPracticeWizard('existing_client', ownerClients[0]?.id)}
            className="px-5 py-2 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Crea pratica</span>
          </button>
        </div>
      </div>

      {/* Main Property Profile Header Card */}
      <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#efeeeb] border border-[#c7c6ca] text-[#1a1c1a]">
              {property.type}
            </span>
            {property.statusState && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20]">
                {property.statusState}
              </span>
            )}
          </div>

          <h1 className="text-[28px] md:text-[36px] font-serif-display font-bold text-[#1a1c1a] leading-tight">
            {property.address}
          </h1>

          <p className="text-[16px] text-[#46474a]">
            {property.municipality} ({property.province}) {property.area ? `· Zona ${property.area}` : ''}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-[13px] font-mono text-[#46474a] pt-2">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#a14009]">square_foot</span>
              ~{property.approximateSurface} m²
            </span>
            {property.energyClass && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#a14009]">bolt</span>
                Classe Energetica {property.energyClass}
              </span>
            )}
          </div>
        </div>

        {/* Condizioni Economiche & Dati */}
        <div className="bg-white p-4 border border-[#c7c6ca] text-[12px] font-mono space-y-2 min-w-[220px]">
          <div className="text-[10px] font-sans font-bold uppercase text-[#76777b] tracking-wider mb-2 border-b border-[#c7c6ca] pb-1">
            Condizioni Economiche
          </div>
          {property.askingPrice || property.estimatedValue ? (
            <div>
              <span className="text-[10px] text-[#76777b] uppercase block">Prezzo richiesto dal proprietario</span>
              <span className="text-[18px] font-bold text-[#1a1c1a]">
                € {(property.askingPrice || property.estimatedValue)?.toLocaleString('it-IT')}
              </span>
            </div>
          ) : (
            <p className="text-[#76777b]">Prezzo non specificato</p>
          )}
          {property.notes && (
            <div className="pt-2 border-t border-[#c7c6ca]/60 text-[11px] text-[#46474a] italic">
              &quot;{property.notes}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Grid: Proprietario / Clienti Collegati & Pratiche Attive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Clienti Proprietari */}
        <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#c7c6ca]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a14009] text-[20px]">group</span>
              <h2 className="text-[16px] font-serif-display font-bold text-[#1a1c1a]">
                Proprietario / Clienti ({ownerClients.length})
              </h2>
            </div>
            {ownerClients.length === 0 && (
              <button
                onClick={() => {
                  openNewClientModal({}, (newClient) => {
                    property.owners = [newClient.id];
                  });
                }}
                className="text-[11px] font-bold uppercase tracking-wider text-[#a14009] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                Collega
              </button>
            )}
          </div>

          {ownerClients.length === 0 ? (
            <div className="p-6 bg-white border border-dashed border-[#c7c6ca] text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#76777b]">person_off</span>
              <p className="text-[13px] font-bold text-[#1a1c1a]">Nessun cliente collegato</p>
              <p className="text-[12px] text-[#76777b] max-w-xs mx-auto">
                Questo immobile è registrato nell archivio ma non ha ancora un proprietario associato.
              </p>
              <button
                onClick={() => {
                  openNewClientModal({}, (newClient) => {
                    property.owners = [newClient.id];
                  });
                }}
                className="mt-2 px-4 py-2 bg-[#1a1c1a] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#333533] cursor-pointer"
              >
                + Collega cliente
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {ownerClients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setActiveTab('clienti');
                  }}
                  className="p-4 bg-white border border-[#c7c6ca] hover:border-[#1a1c1a] transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#efeeeb] text-[#1a1c1a] border border-[#c7c6ca]">
                      {c.entityType === 'azienda' ? 'Azienda' : 'Persona Fisica'}
                    </span>
                    <h3 className="text-[15px] font-bold text-[#1a1c1a] group-hover:text-[#a14009] transition-colors mt-2">
                      {c.entityType === 'azienda' ? c.companyName : `${c.firstName} ${c.lastName}`}
                    </h3>
                    <p className="text-[12px] font-mono text-[#76777b]">
                      {c.phone} · {c.email}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#76777b] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Pratiche Attive */}
        <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#c7c6ca]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a14009] text-[20px]">folder_open</span>
              <h2 className="text-[16px] font-serif-display font-bold text-[#1a1c1a]">
                Pratiche Attive ({activePractices.length})
              </h2>
            </div>
            <button
              onClick={() => openNewPracticeWizard('existing_client', ownerClients[0]?.id)}
              className="text-[11px] font-bold uppercase tracking-wider text-[#a14009] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Crea
            </button>
          </div>

          {activePractices.length === 0 ? (
            <div className="p-6 bg-white border border-dashed border-[#c7c6ca] text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#76777b]">folder_off</span>
              <p className="text-[13px] font-bold text-[#1a1c1a]">Nessuna pratica attiva</p>
              <p className="text-[12px] text-[#76777b] max-w-xs mx-auto">
                Questo immobile non è ancora legato a un fascicolo operativo di compravendita o locazione.
              </p>
              <button
                onClick={() => openNewPracticeWizard('existing_client', ownerClients[0]?.id)}
                className="mt-2 px-4 py-2 bg-[#1a1c1a] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#333533] cursor-pointer"
              >
                + Crea pratica
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activePractices.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => openPracticeDetail(pr.id)}
                  className="p-4 bg-white border border-[#c7c6ca] hover:border-[#1a1c1a] transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#1a1c1a] text-white">
                        {pr.code}
                      </span>
                      <span className="text-[11px] font-bold uppercase text-[#a14009]">
                        {pr.status}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold text-[#1a1c1a] group-hover:text-[#a14009] transition-colors">
                      {pr.practiceType}
                    </h3>
                    <p className="text-[12px] text-[#76777b]">
                      Aperta il: {pr.openedDate}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#76777b] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
