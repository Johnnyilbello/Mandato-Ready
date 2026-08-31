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
    openEditPropertyModal,
    updateProperty,
    openPracticeDetail,
    setSelectedClientId,
    setActiveTab,
  } = useApp();

  const property = getPropertyById(selectedPropertyId || undefined);

  if (!property) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-12">
        <p className="text-[#76777b]">Immobile non trovato.</p>
        <button onClick={() => setSelectedPropertyId(null)} className="mt-4 px-4 py-2 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-wider">Torna agli immobili</button>
      </div>
    );
  }

  const ownerClients = clients.filter((client) => property.owners.includes(client.id));
  const activePractices = practices.filter((practice) => practice.propertyId === property.id);
  const displayAddress = property.address?.trim() || 'Indirizzo da definire';

  const linkOwner = () => {
    openNewClientModal({}, (client) => {
      updateProperty(property.id, { owners: [...new Set([...property.owners, client.id])] });
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 font-sans space-y-8 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#c7c6ca]">
        <button onClick={() => setSelectedPropertyId(null)} className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] self-start">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Torna agli immobili
        </button>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button onClick={() => openEditPropertyModal(property.id)} className="px-4 py-2.5 border border-[#1a1c1a] text-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider hover:bg-[#efeeeb]">Completa / modifica scheda</button>
          {ownerClients.length === 0 && <button onClick={linkOwner} className="px-4 py-2.5 border border-[#1a1c1a] text-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider hover:bg-[#efeeeb]">+ Collega cliente</button>}
          <button onClick={() => openNewPracticeWizard(ownerClients[0] ? 'existing_client' : undefined, ownerClients[0]?.id)} className="px-5 py-2.5 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest hover:bg-[#333533]">+ Crea pratica</button>
        </div>
      </div>

      <section className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6 min-w-0">
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#efeeeb] border border-[#c7c6ca]">{property.type}</span>
            {property.statusState && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20]">{property.statusState}</span>}
          </div>
          <h1 className="text-[28px] md:text-[36px] font-serif-display font-bold text-[#1a1c1a] leading-tight break-words">{displayAddress}</h1>
          <p className="text-[16px] text-[#46474a] break-words">{property.municipality}{property.province ? ` (${property.province})` : ''}{property.area ? ` · Zona ${property.area}` : ''}</p>
          <div className="flex flex-wrap items-center gap-5 text-[13px] font-mono text-[#46474a] pt-2">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#a14009]">square_foot</span>{property.approximateSurface ? `~${property.approximateSurface} m²` : 'Superficie non indicata'}</span>
            {property.energyClass && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#a14009]">bolt</span>Classe {property.energyClass}</span>}
          </div>
        </div>

        <div className="bg-white p-4 border border-[#c7c6ca] text-[12px] font-mono space-y-2 w-full lg:w-[290px] shrink-0">
          <div className="text-[10px] font-sans font-bold uppercase text-[#76777b] tracking-wider mb-2 border-b border-[#c7c6ca] pb-1">Condizioni economiche</div>
          {property.askingPrice ? (
            <div><span className="text-[10px] text-[#76777b] uppercase block">Prezzo richiesto dal proprietario</span><span className="text-[18px] font-bold text-[#1a1c1a]">€ {property.askingPrice.toLocaleString('it-IT')}</span><p className="font-sans text-[10px] text-[#76777b] mt-1">Dato dichiarato, non valutazione Mandato Ready.</p></div>
          ) : <p className="text-[#76777b]">Prezzo non specificato</p>}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white border border-[#c7c6ca] p-5 sm:p-6 space-y-5 min-w-0">
          <div className="border-b border-[#c7c6ca] pb-3"><h2 className="text-[18px] font-serif-display font-bold">Scheda immobile</h2><p className="text-[12px] text-[#76777b] mt-1">Struttura modulare pronta per essere estesa con il modulo reale dell&apos;agenzia.</p></div>
          <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">Dati principali</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-[#46474a]"><p>Tipologia: <strong>{property.type}</strong></p><p>Comune: <strong>{property.municipality}</strong></p><p>Zona: <strong>{property.area || '—'}</strong></p><p>Stato: <strong>{property.statusState || '—'}</strong></p></div></div>
          <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">Composizione & caratteristiche</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-[#46474a]"><p>Locali: <strong>{property.rooms ?? '—'}</strong></p><p>Bagni: <strong>{property.bathrooms ?? '—'}</strong></p><p>Piano: <strong>{property.floor || '—'}</strong></p><p>Classe energetica: <strong>{property.energyClass || '—'}</strong></p></div></div>
          <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">Dati catastali dichiarati</h3><p className="text-[11px] text-[#76777b] mb-2">Informazioni dichiarate: non sono verificate né certificate da Mandato Ready.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-[#46474a]"><p>Foglio: <strong>{property.details?.cadastralDeclared?.sheet || '—'}</strong></p><p>Particella: <strong>{property.details?.cadastralDeclared?.parcel || '—'}</strong></p><p>Subalterno: <strong>{property.details?.cadastralDeclared?.subaltern || '—'}</strong></p><p>Categoria: <strong>{property.details?.cadastralDeclared?.category || '—'}</strong></p></div>{property.details?.cadastralDeclared?.notes && <p className="mt-3 p-3 bg-[#faf9f6] border border-[#c7c6ca] text-[12px] break-words">{property.details.cadastralDeclared.notes}</p>}</div>
          {property.notes && <div><h3 className="text-[10px] uppercase tracking-widest font-bold text-[#a14009] mb-2">Note</h3><p className="p-3 bg-[#faf9f6] border border-[#c7c6ca] text-[12px] text-[#46474a] whitespace-pre-wrap break-words">{property.notes}</p></div>}
          <button onClick={() => openEditPropertyModal(property.id)} className="w-full p-3 border border-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider hover:bg-[#1a1c1a] hover:text-white">Completa scheda immobile</button>
        </section>

        <div className="space-y-8 min-w-0">
          <section className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#c7c6ca]"><h2 className="text-[16px] font-serif-display font-bold">Proprietari / clienti ({ownerClients.length})</h2>{ownerClients.length === 0 && <button onClick={linkOwner} className="text-[10px] uppercase font-bold text-[#a14009]">+ Collega</button>}</div>
            {ownerClients.length === 0 ? <p className="text-[13px] text-[#76777b] py-3">Nessun proprietario richiesto per salvare la scheda. Puoi collegarlo in seguito.</p> : <div className="space-y-2">{ownerClients.map((client) => <button key={client.id} onClick={() => { setSelectedClientId(client.id); setActiveTab('clienti'); }} className="w-full p-4 bg-white border border-[#c7c6ca] text-left hover:border-[#1a1c1a] min-w-0"><span className="text-[10px] uppercase font-bold text-[#76777b]">{client.entityType === 'azienda' ? 'Azienda' : 'Persona fisica'}</span><strong className="block mt-1 break-words">{client.companyName || `${client.firstName} ${client.lastName}`}</strong><span className="text-[12px] text-[#76777b] break-all">{client.phone} · {client.email}</span></button>)}</div>}
          </section>

          <section className="bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#c7c6ca]"><h2 className="text-[16px] font-serif-display font-bold">Pratiche ({activePractices.length})</h2><button onClick={() => openNewPracticeWizard(ownerClients[0] ? 'existing_client' : undefined, ownerClients[0]?.id)} className="text-[10px] uppercase font-bold text-[#a14009]">+ Crea</button></div>
            {activePractices.length === 0 ? <p className="text-[13px] text-[#76777b] py-3">Nessuna pratica attiva. L&apos;immobile rimane disponibile per essere riutilizzato.</p> : <div className="space-y-2">{activePractices.map((practice) => <button key={practice.id} onClick={() => openPracticeDetail(practice.id)} className="w-full p-4 bg-white border border-[#c7c6ca] text-left hover:border-[#1a1c1a]"><span className="font-mono text-[10px] bg-[#1a1c1a] text-white px-2 py-1">{practice.code}</span><strong className="block mt-2 text-[13px]">{practice.practiceType}</strong><span className="text-[11px] text-[#76777b]">{practice.status} · aperta {practice.openedDate}</span></button>)}</div>}
          </section>
        </div>
      </div>
    </div>
  );
};
