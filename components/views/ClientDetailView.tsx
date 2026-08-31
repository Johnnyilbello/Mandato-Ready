'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const ClientDetailView: React.FC = () => {
  const {
    selectedClientId,
    setSelectedClientId,
    getClientById,
    properties,
    practices,
    openNewPracticeWizard,
    openNewPropertyModal,
    openPracticeDetail,
    setSelectedPropertyId,
    setActiveTab,
  } = useApp();

  const client = getClientById(selectedClientId || undefined);

  if (!client) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        <p className="text-[#76777b]">Cliente non trovato.</p>
        <button
          onClick={() => setSelectedClientId(null)}
          className="mt-4 px-4 py-2 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-wider"
        >
          Torna ai clienti
        </button>
      </div>
    );
  }

  const clientProperties = properties.filter((p) => p.owners.includes(client.id));
  const clientPractices = practices.filter((p) => p.clientId === client.id);

  const displayName =
    client.entityType === 'azienda'
      ? client.companyName || `${client.firstName} ${client.lastName}`
      : `${client.firstName} ${client.lastName}`;

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans space-y-8 animate-in fade-in duration-150">
      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c7c6ca]">
        <button
          onClick={() => setSelectedClientId(null)}
          className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Torna ai clienti</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openNewPropertyModal({ owners: [client.id] })}
            className="px-4 py-2 border border-[#1a1c1a] text-[#1a1c1a] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_home</span>
            <span>+ Aggiungi immobile</span>
          </button>
          <button
            onClick={() => openNewPracticeWizard('existing_client', client.id)}
            className="px-5 py-2 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Crea pratica</span>
          </button>
        </div>
      </div>

      {/* Main Client Profile Header Card */}
      <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#efeeeb] border border-[#c7c6ca] text-[#1a1c1a]">
              {client.entityType === 'azienda' ? 'Azienda / Persona Giuridica' : 'Persona Fisica'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#ffdbcd] border border-[#a14009]/40 text-[#6a2500]">
              {client.type === 'seller' ? 'Venditore' : client.type === 'buyer' ? 'Acquirente' : 'Venditore & Acquirente'}
            </span>
          </div>

          <h1 className="text-[28px] md:text-[36px] font-serif-display font-bold text-[#1a1c1a] leading-tight">
            {displayName}
          </h1>

          {client.contactPerson && (
            <p className="text-[14px] text-[#46474a]">
              <strong>Referente:</strong> {client.contactPerson}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-[13px] font-mono text-[#46474a] pt-2">
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-1.5 hover:text-[#a14009] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#a14009]">call</span>
              {client.phone}
            </a>
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-1.5 hover:text-[#a14009] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#a14009]">mail</span>
              {client.email}
            </a>
            {client.city && (
              <span className="flex items-center gap-1.5 text-[#76777b]">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {client.city}
              </span>
            )}
          </div>
        </div>

        {/* Legal & Fiscal Info */}
        <div className="bg-white p-4 border border-[#c7c6ca] text-[12px] font-mono space-y-1.5 min-w-[220px]">
          <div className="text-[10px] font-sans font-bold uppercase text-[#76777b] tracking-wider mb-2 border-b border-[#c7c6ca] pb-1">
            Dati Fiscali & Profilo
          </div>
          {client.fiscalCode && (
            <p className="text-[#1a1c1a]">
              <strong>CF:</strong> {client.fiscalCode}
            </p>
          )}
          {client.vatNumber && (
            <p className="text-[#1a1c1a]">
              <strong>P.IVA:</strong> {client.vatNumber}
            </p>
          )}
          <p className="text-[#76777b]">Censito il: {client.createdAt}</p>
        </div>
      </div>

      {/* Grid: Immobili Collegati & Pratiche Attive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Immobili Collegati */}
        <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#c7c6ca]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a14009] text-[20px]">domain</span>
              <h2 className="text-[16px] font-serif-display font-bold text-[#1a1c1a]">
                Immobili Collegati ({clientProperties.length})
              </h2>
            </div>
            <button
              onClick={() => openNewPropertyModal({ owners: [client.id] })}
              className="text-[11px] font-bold uppercase tracking-wider text-[#a14009] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Aggiungi
            </button>
          </div>

          {clientProperties.length === 0 ? (
            <div className="p-6 bg-white border border-dashed border-[#c7c6ca] text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#76777b]">home_work</span>
              <p className="text-[13px] font-bold text-[#1a1c1a]">Nessun immobile collegato</p>
              <p className="text-[12px] text-[#76777b] max-w-xs mx-auto">
                Puoi aggiungere un immobile a questo cliente in qualsiasi momento.
              </p>
              <button
                onClick={() => openNewPropertyModal({ owners: [client.id] })}
                className="mt-2 px-4 py-2 bg-[#1a1c1a] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#333533] cursor-pointer"
              >
                + Aggiungi immobile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {clientProperties.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPropertyId(p.id);
                    setActiveTab('immobili');
                  }}
                  className="p-4 bg-white border border-[#c7c6ca] hover:border-[#1a1c1a] transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#efeeeb] text-[#1a1c1a] border border-[#c7c6ca]">
                      {p.type}
                    </span>
                    <h3 className="text-[15px] font-bold text-[#1a1c1a] group-hover:text-[#a14009] transition-colors mt-2">
                      {p.address}
                    </h3>
                    <p className="text-[12px] text-[#76777b]">
                      {p.municipality} ({p.province}) · ~{p.approximateSurface} m²
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
                Pratiche Attive ({clientPractices.length})
              </h2>
            </div>
            <button
              onClick={() => openNewPracticeWizard('existing_client', client.id)}
              className="text-[11px] font-bold uppercase tracking-wider text-[#a14009] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Crea
            </button>
          </div>

          {clientPractices.length === 0 ? (
            <div className="p-6 bg-white border border-dashed border-[#c7c6ca] text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#76777b]">folder_off</span>
              <p className="text-[13px] font-bold text-[#1a1c1a]">Nessuna pratica collegata</p>
              <p className="text-[12px] text-[#76777b] max-w-xs mx-auto">
                Questo cliente è salvato nel tuo archivio ma non ha ancora un fascicolo attivo.
              </p>
              <button
                onClick={() => openNewPracticeWizard('existing_client', client.id)}
                className="mt-2 px-4 py-2 bg-[#1a1c1a] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#333533] cursor-pointer"
              >
                + Crea pratica
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {clientPractices.map((pr) => (
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
