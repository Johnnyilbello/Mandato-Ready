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
    isHelpModeActive,
  } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'clienti' | 'immobili'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  if (activeSubTab === 'clienti' && selectedClientId) return <ClientDetailView />;
  if (activeSubTab === 'immobili' && selectedPropertyId) return <PropertyDetailView />;

  const query = searchQuery.trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    if (!query) return true;
    const name = client.entityType === 'azienda'
      ? client.companyName || ''
      : `${client.firstName} ${client.lastName}`;
    return [name, client.phone, client.email, client.fiscalCode || '']
      .some((value) => value.toLowerCase().includes(query));
  });

  const filteredProperties = properties.filter((property) => {
    if (!query) return true;
    const owner = clients.find((client) => property.owners.includes(client.id));
    const ownerName = owner
      ? owner.entityType === 'azienda'
        ? owner.companyName || ''
        : `${owner.firstName} ${owner.lastName}`
      : '';
    return [property.address, property.municipality, property.type, ownerName]
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 font-sans min-w-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#c7c6ca] gap-4 min-w-0">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">CLIENTI & ASSET IMMOBILIARI</div>
          <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a] break-words">
            {activeSubTab === 'clienti' ? 'Clienti' : 'Immobili'}
          </h1>
          <p className="text-[14px] text-[#46474a] mt-1">
            {activeSubTab === 'clienti'
              ? 'Gestisci contatti, venditori e acquirenti registrati in agenzia.'
              : 'Gestisci gli immobili in archivio indipendentemente dalle pratiche.'}
          </p>
        </div>
        <button
          id={activeSubTab === 'clienti' ? 'btn-nuovo-cliente' : 'btn-nuovo-immobile'}
          onClick={() => activeSubTab === 'clienti' ? openNewClientModal() : openNewPropertyModal()}
          className="bg-[#1a1c1a] text-white px-5 py-2.5 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] flex items-center justify-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">{activeSubTab === 'clienti' ? 'person_add' : 'home_work'}</span>
          {activeSubTab === 'clienti' ? '+ Nuovo cliente' : '+ Nuovo immobile'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c7c6ca] mb-8 pb-3 min-w-0">
        <div className="flex items-center gap-5 sm:gap-6 min-w-0">
          <button
            onClick={() => {
              setActiveSubTab('clienti');
              setSelectedClientId(null);
            }}
            className={`text-[12px] sm:text-[13px] uppercase font-bold tracking-wider pb-2 -mb-3 ${activeSubTab === 'clienti' ? 'text-[#1a1c1a] border-b-2 border-[#1a1c1a]' : 'text-[#76777b] hover:text-[#1a1c1a]'}`}
          >
            Clienti ({clients.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('immobili');
              setSelectedPropertyId(null);
            }}
            className={`text-[12px] sm:text-[13px] uppercase font-bold tracking-wider pb-2 -mb-3 ${activeSubTab === 'immobili' ? 'text-[#1a1c1a] border-b-2 border-[#1a1c1a]' : 'text-[#76777b] hover:text-[#1a1c1a]'}`}
          >
            Immobili ({properties.length})
          </button>
        </div>
        <label className="relative max-w-xs w-full min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#76777b] text-[18px]">search</span>
          <span className="sr-only">Cerca</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={activeSubTab === 'clienti' ? 'Cerca cliente, telefono, CF...' : 'Cerca indirizzo, comune, proprietario...'}
            className="w-full pl-9 pr-3 py-2 border border-[#c7c6ca] bg-white text-[12px] outline-none min-w-0"
          />
        </label>
      </div>

      <div className="bg-[#f4f3f1] border-l-4 border-[#1a1c1a] p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] block mb-0.5">
            {activeSubTab === 'clienti' ? 'ANAGRAFICA INDIPENDENTE' : 'ARCHIVIO IMMOBILI'}
          </span>
          <h2 className="text-[16px] font-serif-display font-bold text-[#1a1c1a]">
            {activeSubTab === 'clienti' ? 'Salva qui i tuoi clienti' : 'Salva qui gli immobili'}
          </h2>
          <p className="text-[13px] text-[#46474a] mt-0.5">
            {activeSubTab === 'clienti'
              ? 'Il Cliente resta un record condiviso e può essere collegato a immobili e pratiche in seguito.'
              : 'L’Immobile può esistere senza pratica e può essere collegato a Cliente e Pratica in seguito.'}
          </p>
          {isHelpModeActive && (
            <p className="text-[11px] text-[#a14009] mt-1 font-semibold">
              I record salvati qui vengono riutilizzati: la creazione di una pratica non genera copie nascoste.
            </p>
          )}
        </div>
        <button
          onClick={() => activeSubTab === 'clienti' ? openNewClientModal() : openNewPropertyModal()}
          className="px-4 py-2 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-wider shrink-0"
        >
          {activeSubTab === 'clienti' ? '+ Nuovo cliente' : '+ Nuovo immobile'}
        </button>
      </div>

      {activeSubTab === 'clienti' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 min-w-0">
          {filteredClients.map((client) => {
            const clientPractices = practices.filter((practice) => practice.clientId === client.id);
            const clientProperties = properties.filter((property) => property.owners.includes(client.id));
            const displayName = client.entityType === 'azienda'
              ? client.companyName || `${client.firstName} ${client.lastName}`
              : `${client.firstName} ${client.lastName}`;
            return (
              <button
                type="button"
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 text-left hover:border-[#1a1c1a] transition-all group min-w-0"
              >
                <div className="flex items-center justify-between gap-3 mb-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#efeeeb] border border-[#c7c6ca] shrink-0">
                    {client.entityType === 'azienda' ? 'Azienda' : client.type === 'seller' ? 'Venditore' : client.type === 'buyer' ? 'Acquirente' : 'Venditore & Acquirente'}
                  </span>
                  <span className="text-[12px] font-mono text-[#76777b] truncate">{client.city || 'Comune non indicato'}</span>
                </div>
                <h3 className="text-[20px] font-serif-display font-bold group-hover:text-[#a14009] break-words">{displayName}</h3>
                {client.contactPerson && <p className="text-[12px] text-[#46474a] mt-0.5 break-words">Ref: {client.contactPerson}</p>}
                <div className="space-y-1 mt-3 text-[13px] font-mono text-[#46474a] min-w-0">
                  <p className="break-all">{client.phone}</p>
                  <p className="break-all">{client.email}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#c7c6ca]/60 text-[12px] space-y-1">
                  <p className="text-[#76777b]">Pratiche: <strong className="text-[#1a1c1a]">{clientPractices.length}</strong></p>
                  <p className="text-[#76777b]">Immobili: <strong className="text-[#1a1c1a]">{clientProperties.length}</strong></p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider group-hover:text-[#a14009]">Vedi scheda cliente →</div>
              </button>
            );
          })}
        </div>
      )}

      {activeSubTab === 'immobili' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 min-w-0">
          {filteredProperties.map((property) => {
            const owner = clients.find((client) => property.owners.includes(client.id));
            const ownerName = owner
              ? owner.entityType === 'azienda'
                ? owner.companyName || `${owner.firstName} ${owner.lastName}`
                : `${owner.firstName} ${owner.lastName}`
              : 'Nessun cliente collegato';
            const activePractice = practices.find((practice) => practice.propertyId === property.id);
            return (
              <button
                type="button"
                key={property.id}
                onClick={() => setSelectedPropertyId(property.id)}
                className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 text-left hover:border-[#1a1c1a] transition-all group min-w-0"
              >
                <div className="flex items-center justify-between gap-3 mb-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#efeeeb] border border-[#c7c6ca] shrink-0">{property.type}</span>
                  <span className="text-[12px] font-mono text-[#76777b] text-right">
                    {property.approximateSurface ? `~${property.approximateSurface} m²` : 'Superficie non indicata'}
                  </span>
                </div>
                <h3 className="text-[18px] font-serif-display font-bold group-hover:text-[#a14009] break-words">
                  {property.address || 'Indirizzo da definire'}
                </h3>
                <p className="text-[13px] text-[#76777b] break-words">
                  {property.municipality}{property.province ? ` (${property.province})` : ''}{property.area ? ` · ${property.area}` : ''}
                </p>
                <div className="mt-4 pt-3 border-t border-[#c7c6ca]/60 space-y-1.5 text-[13px] min-w-0">
                  <p className="text-[#46474a] break-words"><strong>Proprietario:</strong> {ownerName}</p>
                  <p className="text-[#76777b] text-[12px] break-words">
                    Fascicolo Pratica: <strong className={activePractice ? 'text-[#a14009]' : 'text-[#76777b]'}>{activePractice ? activePractice.code : 'Nessuna pratica attiva'}</strong>
                  </p>
                  {property.askingPrice !== undefined && (
                    <p className="text-[#1a1c1a] font-mono break-words">
                      <strong>Prezzo richiesto dal proprietario:</strong> € {property.askingPrice.toLocaleString('it-IT')}
                    </p>
                  )}
                </div>
                <div className="mt-5 pt-4 border-t border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider group-hover:text-[#a14009]">Vedi scheda immobile →</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
