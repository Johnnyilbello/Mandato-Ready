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
    openEditClientModal,
    openPracticeDetail,
    setSelectedPropertyId,
    setActiveTab,
  } = useApp();

  const client = getClientById(selectedClientId || undefined);

  if (!client) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-12">
        <p className="text-[#76777b]">Cliente non trovato.</p>
        <button onClick={() => setSelectedClientId(null)} className="mt-4 px-4 py-2 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-wider">Torna ai clienti</button>
      </div>
    );
  }

  const clientProperties = properties.filter((property) => property.owners.includes(client.id));
  const clientPractices = practices.filter((practice) => practice.clientId === client.id);
  const displayName = client.entityType === 'azienda'
    ? client.companyName || `${client.firstName} ${client.lastName}`
    : `${client.firstName} ${client.lastName}`;

  const residence = client.entityType === 'azienda' ? client.companyDetails?.registeredOffice : client.residence;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 font-sans space-y-8 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#c7c6ca]">
        <button onClick={() => setSelectedClientId(null)} className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] self-start">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Torna ai clienti
        </button>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button onClick={() => openEditClientModal(client.id)} className="px-4 py-2.5 border border-[#1a1c1a] text-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider hover:bg-[#efeeeb]">Completa / modifica scheda</button>
          <button onClick={() => openNewPropertyModal({ owners: [client.id] })} className="px-4 py-2.5 border border-[#1a1c1a] text-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider hover:bg-[#efeeeb]">+ Immobile</button>
          <button onClick={() => openNewPracticeWizard('existing_client', client.id)} className="px-5 py-2.5 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest hover:bg-[#333533]">+ Pratica</button>
        </div>
      </div>

      <section className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6 min-w-0">
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#efeeeb] border border-[#c7c6ca]">{client.entityType === 'azienda' ? 'Azienda / Persona giuridica' : 'Persona fisica'}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#ffdbcd] border border-[#a14009]/40 text-[#6a2500]">{client.type === 'seller' ? 'Venditore' : client.type === 'buyer' ? 'Acquirente' : 'Venditore & Acquirente'}</span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-serif-display font-bold text-[#1a1c1a] leading-tight break-words">{displayName}</h1>
          {client.contactPerson && <p className="text-[14px] text-[#46474a]"><strong>Referente:</strong> {client.contactPerson}</p>}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-[13px] font-mono text-[#46474a] pt-2 min-w-0">
            <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 hover:text-[#a14009] break-all"><span className="material-symbols-outlined text-[16px] text-[#a14009]">call</span>{client.phone}</a>
            <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-[#a14009] break-all"><span className="material-symbols-outlined text-[16px] text-[#a14009]">mail</span>{client.email}</a>
          </div>
        </div>
        <div className="bg-white p-4 border border-[#c7c6ca] text-[12px] font-mono space-y-1.5 w-full lg:w-[280px] shrink-0 min-w-0">
          <div className="text-[10px] font-sans font-bold uppercase text-[#76777b] tracking-wider mb-2 border-b border-[#c7c6ca] pb-1">Dati fiscali & profilo</div>
          {client.fiscalCode && <p className="text-[#1a1c1a] break-all"><strong>CF:</strong> {client.fiscalCode}</p>}
          {client.vatNumber && <p className="text-[#1a1c1a] break-all"><strong>P.IVA:</strong> {client.vatNumber}</p>}
          {client.companyDetails?.pec && <p className="text-[#1a1c1a] break-all"><strong>PEC:</strong> {client.companyDetails.pec}</p>}
          {client.companyDetails?.sdi && <p className="text-[#1a1c1a]"><strong>SDI:</strong> {client.companyDetails.sdi}</p>}
          <p className="text-[#76777b]">Censito: {client.createdAt}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white border border-[#c7c6ca] p-5 sm:p-6 space-y-5 min-w-0">
          <div className="border-b border-[#c7c6ca] pb-3"><h2 className="text-[18px] font-serif-display font-bold">Dati completi</h2><p className="text-[12px] text-[#76777b] mt-1">Tutti i campi restano facoltativi finché un workflow non li richiede.</p></div>

          {client.entityType !== 'azienda' && (
            <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">Dati personali</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
              <p><span className="text-[#76777b]">Nascita:</span> {client.personalData?.birthDate || '—'}</p>
              <p><span className="text-[#76777b]">Luogo:</span> {client.personalData?.birthPlace || '—'}</p>
              <p><span className="text-[#76777b]">Nazionalità:</span> {client.personalData?.nationality || '—'}</p>
              <p><span className="text-[#76777b]">Stato civile:</span> {client.personalData?.maritalStatus || '—'}</p>
            </div></div>
          )}

          <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">{client.entityType === 'azienda' ? 'Sede legale' : 'Residenza'}</h3><p className="text-[13px] text-[#46474a] break-words">{[residence?.address, residence?.postalCode, residence?.municipality, residence?.province, residence?.country].filter(Boolean).join(' · ') || 'Non completata'}</p></div>

          <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">Documento</h3><div className="text-[13px] text-[#46474a] space-y-1"><p>{client.identityDocument?.type || 'Tipo non indicato'} · {client.identityDocument?.number || 'numero non indicato'}</p><p>Rilascio: {client.identityDocument?.issueDate || '—'} · Scadenza: {client.identityDocument?.expiryDate || '—'}</p><p>Ente: {client.identityDocument?.issuingAuthority || '—'}</p></div></div>

          <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">Contatti & operatività</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-[#46474a]"><p>Telefono secondario: {client.contacts?.secondaryPhone || '—'}</p><p className="break-all">Email secondaria: {client.contacts?.secondaryEmail || '—'}</p><p>Preferenza: {client.contacts?.preferredContactMethod || '—'}</p><p>Professione: {client.operationalInfo?.profession || '—'}</p><p>Provenienza: {client.operationalInfo?.source || '—'}</p></div>{client.operationalInfo?.notes && <p className="mt-3 p-3 bg-[#faf9f6] border border-[#c7c6ca] text-[12px] break-words">{client.operationalInfo.notes}</p>}</div>

          <button onClick={() => openEditClientModal(client.id)} className="w-full p-3 border border-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider hover:bg-[#1a1c1a] hover:text-white">Completa scheda</button>
        </section>

        <div className="space-y-8 min-w-0">
          <section className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#c7c6ca]"><h2 className="text-[16px] font-serif-display font-bold">Immobili collegati ({clientProperties.length})</h2><button onClick={() => openNewPropertyModal({ owners: [client.id] })} className="text-[10px] uppercase font-bold text-[#a14009]">+ Aggiungi</button></div>
            {clientProperties.length === 0 ? <p className="text-[13px] text-[#76777b] py-3">Nessun immobile collegato. Il cliente resta comunque salvato e riutilizzabile.</p> : <div className="space-y-2">{clientProperties.map((property) => <button key={property.id} onClick={() => { setSelectedPropertyId(property.id); setActiveTab('immobili'); }} className="w-full p-4 bg-white border border-[#c7c6ca] text-left hover:border-[#1a1c1a] min-w-0"><span className="text-[10px] uppercase font-bold text-[#76777b]">{property.type}</span><strong className="block mt-1 break-words">{property.address || 'Indirizzo da definire'}</strong><span className="text-[12px] text-[#76777b]">{property.municipality}{property.approximateSurface ? ` · ~${property.approximateSurface} m²` : ''}</span></button>)}</div>}
          </section>

          <section className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#c7c6ca]"><h2 className="text-[16px] font-serif-display font-bold">Pratiche ({clientPractices.length})</h2><button onClick={() => openNewPracticeWizard('existing_client', client.id)} className="text-[10px] uppercase font-bold text-[#a14009]">+ Crea</button></div>
            {clientPractices.length === 0 ? <p className="text-[13px] text-[#76777b] py-3">Nessuna pratica collegata.</p> : <div className="space-y-2">{clientPractices.map((practice) => <button key={practice.id} onClick={() => openPracticeDetail(practice.id)} className="w-full p-4 bg-white border border-[#c7c6ca] text-left hover:border-[#1a1c1a]"><span className="font-mono text-[10px] bg-[#1a1c1a] text-white px-2 py-1">{practice.code}</span><strong className="block mt-2 text-[13px]">{practice.practiceType}</strong><span className="text-[11px] text-[#76777b]">{practice.status} · aperta {practice.openedDate}</span></button>)}</div>}
          </section>
        </div>
      </div>
    </div>
  );
};
