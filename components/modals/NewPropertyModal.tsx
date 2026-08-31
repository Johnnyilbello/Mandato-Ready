'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Property } from '@/lib/types';
import { getAvailablePropertyTypes } from '@/lib/propertyTaxonomy';

export const NewPropertyModal: React.FC = () => {
  const {
    isNewPropertyModalOpen,
    newPropertyModalState,
    closeNewPropertyModal,
    addNewProperty,
    updateProperty,
    properties,
    clients,
    openNewPracticeWizard,
    openNewClientModal,
    setSelectedPropertyId,
    setActiveTab,
    isHelpModeActive,
    agencyProfile,
  } = useApp();

  const taxonomyConfig = agencyProfile.workPreferences.taxonomyConfig;
  const taxonomy = useMemo(
    () => getAvailablePropertyTypes(
      taxonomyConfig?.disabledCategories || [],
      taxonomyConfig?.customCategories || [],
      taxonomyConfig?.preferredCategories || []
    ),
    [taxonomyConfig]
  );
  const propertyTypes = useMemo(() => {
    const ordered = [
      ...taxonomy.preferred,
      ...taxonomy.residenziale,
      ...taxonomy.commerciale,
      ...taxonomy.terreno_altro,
      ...taxonomy.custom,
    ];
    return [...new Set(ordered)];
  }, [taxonomy]);

  const [type, setType] = useState('Appartamento');
  const [municipality, setMunicipality] = useState('');
  const [province, setProvince] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [surface, setSurface] = useState('');
  const [statusState, setStatusState] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [floor, setFloor] = useState('');
  const [energyClass, setEnergyClass] = useState('');
  const [notes, setNotes] = useState('');
  const [cadastralSheet, setCadastralSheet] = useState('');
  const [cadastralParcel, setCadastralParcel] = useState('');
  const [cadastralSubaltern, setCadastralSubaltern] = useState('');
  const [cadastralCategory, setCadastralCategory] = useState('');
  const [cadastralNotes, setCadastralNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [savedProperty, setSavedProperty] = useState<Property | null>(null);

  const isEditing = Boolean(newPropertyModalState?.editPropertyId);

  useEffect(() => {
    if (!isNewPropertyModalOpen) return;
    const prefill = newPropertyModalState?.prefill;
    const initialType = prefill?.type || propertyTypes[0] || 'Appartamento';
    setType(initialType);
    setMunicipality(prefill?.municipality || '');
    setProvince(prefill?.province || '');
    setArea(prefill?.area || '');
    setAddress(prefill?.address || '');
    setSurface(prefill?.approximateSurface ? String(prefill.approximateSurface) : '');
    setStatusState(prefill?.statusState || '');
    setSelectedOwnerId(prefill?.owners?.[0] || '');
    setAskingPrice(prefill?.askingPrice ? String(prefill.askingPrice) : '');
    setRooms(prefill?.rooms ? String(prefill.rooms) : '');
    setBathrooms(prefill?.bathrooms ? String(prefill.bathrooms) : '');
    setFloor(prefill?.floor || '');
    setEnergyClass(prefill?.energyClass || '');
    setNotes(prefill?.notes || '');
    setCadastralSheet(prefill?.details?.cadastralDeclared?.sheet || '');
    setCadastralParcel(prefill?.details?.cadastralDeclared?.parcel || '');
    setCadastralSubaltern(prefill?.details?.cadastralDeclared?.subaltern || '');
    setCadastralCategory(prefill?.details?.cadastralDeclared?.category || '');
    setCadastralNotes(prefill?.details?.cadastralDeclared?.notes || '');
    setIgnoreDuplicate(false);
    setSavedProperty(null);
    setShowAdvanced(isEditing);
  }, [isEditing, isNewPropertyModalOpen, newPropertyModalState, propertyTypes]);

  const possibleDuplicate = useMemo(() => {
    if (!isNewPropertyModalOpen || ignoreDuplicate || address.trim().length < 4) return null;
    const cleanAddress = address.trim().toLowerCase();
    const cleanMunicipality = municipality.trim().toLowerCase();
    return properties.find((property) => {
      if (property.id === newPropertyModalState?.editPropertyId) return false;
      return property.address.trim().toLowerCase() === cleanAddress && property.municipality.trim().toLowerCase() === cleanMunicipality;
    }) || null;
  }, [address, ignoreDuplicate, isNewPropertyModalOpen, municipality, newPropertyModalState?.editPropertyId, properties]);

  if (!isNewPropertyModalOpen) return null;

  const buildPayload = (): Omit<Property, 'id'> => ({
    type,
    municipality: municipality.trim(),
    province: province.trim().toUpperCase(),
    area: area.trim() || undefined,
    address: address.trim(),
    approximateSurface: surface ? Number(surface) || undefined : undefined,
    owners: selectedOwnerId ? [selectedOwnerId] : [],
    statusState: statusState || undefined,
    askingPrice: askingPrice ? Number(askingPrice) || undefined : undefined,
    rooms: rooms ? Number(rooms) || undefined : undefined,
    bathrooms: bathrooms ? Number(bathrooms) || undefined : undefined,
    floor: floor.trim() || undefined,
    energyClass: energyClass.trim().toUpperCase() || undefined,
    notes: notes.trim() || undefined,
    details: {
      cadastralDeclared: {
        sheet: cadastralSheet.trim() || undefined,
        parcel: cadastralParcel.trim() || undefined,
        subaltern: cadastralSubaltern.trim() || undefined,
        category: cadastralCategory.trim() || undefined,
        notes: cadastralNotes.trim() || undefined,
      },
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!type || !municipality.trim()) return;
    if (possibleDuplicate && !ignoreDuplicate) return;
    const payload = buildPayload();
    const saved = isEditing && newPropertyModalState?.editPropertyId
      ? updateProperty(newPropertyModalState.editPropertyId, payload)
      : addNewProperty(payload);
    if (!saved) return;
    newPropertyModalState?.onSaveCallback?.(saved);
    if (isEditing || newPropertyModalState?.onSaveCallback) closeNewPropertyModal();
    else setSavedProperty(saved);
  };

  const linkNewOwner = () => {
    if (!savedProperty) return;
    openNewClientModal({}, (client) => {
      const updated = updateProperty(savedProperty.id, { owners: [client.id] });
      if (updated) setSavedProperty(updated);
    });
  };

  const inputClass = 'w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none focus:border-[#1a1c1a] min-w-0';
  const labelClass = 'text-[10px] sm:text-[11px] font-bold uppercase text-[#76777b] block mb-1 tracking-wide';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto" onMouseDown={(event) => event.target === event.currentTarget && closeNewPropertyModal()}>
      <div role="dialog" aria-modal="true" aria-labelledby="property-modal-title" className="bg-[#faf9f6] border-t-2 sm:border-2 border-[#1a1c1a] max-w-3xl w-full max-h-[95dvh] overflow-y-auto p-5 sm:p-8 shadow-2xl relative rounded-t-2xl sm:rounded-none">
        <button onClick={closeNewPropertyModal} className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-2" aria-label="Chiudi"><span className="material-symbols-outlined text-[20px]">close</span></button>

        {savedProperty ? (
          <div className="space-y-6 pr-8">
            <div className="p-4 bg-[#e8f5e9] border border-[#a5d6a7]">
              <h3 className="text-[20px] font-serif-display font-bold text-[#1b5e20]">Immobile salvato</h3>
              <p className="text-[13px] text-[#2e7d32] mt-1">La scheda è indipendente dalla pratica e può essere completata in seguito.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => { closeNewPropertyModal(); openNewPracticeWizard(savedProperty.owners[0] ? 'existing_client' : undefined, savedProperty.owners[0]); }} className="p-4 bg-[#1a1c1a] text-white text-left font-bold text-[13px]">Crea pratica con questo immobile</button>
              {savedProperty.owners.length === 0 ? (
                <button onClick={linkNewOwner} className="p-4 bg-white border border-[#c7c6ca] text-[#1a1c1a] text-left font-bold text-[13px]">Collega proprietario</button>
              ) : (
                <div className="p-4 bg-white border border-[#c7c6ca] text-[12px] text-[#46474a]">Proprietario collegato. Verrà riutilizzato nella pratica.</div>
              )}
              <button onClick={() => { setSelectedPropertyId(savedProperty.id); setActiveTab('immobili'); closeNewPropertyModal(); }} className="sm:col-span-2 p-3 border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider">Vedi scheda immobile</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="pr-10 pb-4 border-b border-[#c7c6ca]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a14009]">{isEditing ? 'SCHEDA IMMOBILE' : 'CREAZIONE RAPIDA'}</span>
              <h2 id="property-modal-title" className="text-[24px] font-serif-display font-bold text-[#1a1c1a]">{isEditing ? 'Completa scheda immobile' : 'Nuovo immobile'}</h2>
              <p className="text-[12px] text-[#76777b] mt-1">Solo tipologia e comune sono necessari per iniziare. Tutto il resto resta opzionale.</p>
            </div>

            {isHelpModeActive && <div className="bg-[#ffdbcd] p-3 border border-[#a14009]/30 text-[12px] text-[#6a2500]">L&apos;immobile può esistere senza proprietario e senza pratica. Nessuna valutazione è richiesta.</div>}

            {possibleDuplicate && !ignoreDuplicate && (
              <div className="bg-[#fff8e1] border-2 border-[#f57f17] p-4 space-y-3">
                <h3 className="text-[14px] font-bold text-[#8a5600]">Potrebbe essere già presente</h3>
                <p className="text-[12px] text-[#5d4037]">Esiste già un immobile con lo stesso indirizzo e comune.</p>
                <div className="p-2.5 bg-white border border-[#ffe082] text-[12px]">{possibleDuplicate.address} · {possibleDuplicate.municipality}</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={() => { setSelectedPropertyId(possibleDuplicate.id); setActiveTab('immobili'); closeNewPropertyModal(); }} className="flex-1 bg-[#1a1c1a] text-white py-2 text-[11px] font-bold uppercase">Apri esistente</button>
                  <button type="button" onClick={() => setIgnoreDuplicate(true)} className="flex-1 border border-[#b78103] text-[#8a5600] py-2 text-[11px] font-bold uppercase">Crea comunque</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={labelClass}>Tipologia *<select required value={type} onChange={(event) => setType(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case tracking-normal`}>{propertyTypes.map((propertyType) => <option key={propertyType}>{propertyType}</option>)}</select></label>
              <label className={labelClass}>Comune *<input required value={municipality} onChange={(event) => setMunicipality(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} placeholder="es. Terrasini" /></label>
              <label className={labelClass}>Zona / quartiere<input value={area} onChange={(event) => setArea(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
              <label className={labelClass}>Indirizzo<input value={address} onChange={(event) => setAddress(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} placeholder="Opzionale" /></label>
              <label className={labelClass}>Superficie approssimativa (m²)<input type="number" min="0" value={surface} onChange={(event) => setSurface(event.target.value)} className={`${inputClass} mt-1 font-normal`} placeholder="Opzionale" /></label>
              <label className={labelClass}>Stato<select value={statusState} onChange={(event) => setStatusState(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`}><option value="">Non indicato</option><option>Ottimo stato / Ristrutturato</option><option>Buono stato</option><option>Da ristrutturare</option><option>Nuova costruzione</option><option>Grezzo / Da rifinire</option></select></label>
            </div>

            <label className={labelClass}>Proprietario (opzionale)<div className="flex flex-col sm:flex-row gap-2 mt-1"><select value={selectedOwnerId} onChange={(event) => setSelectedOwnerId(event.target.value)} className={`${inputClass} font-normal normal-case flex-1`}><option value="">Nessun proprietario associato</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.companyName || `${client.firstName} ${client.lastName}`} · {client.phone}</option>)}</select><button type="button" onClick={() => openNewClientModal({}, (client) => setSelectedOwnerId(client.id))} className="px-4 py-2.5 border border-[#1a1c1a] text-[10px] uppercase font-bold tracking-wider shrink-0">+ Cliente</button></div></label>

            {!showAdvanced ? (
              <button type="button" onClick={() => setShowAdvanced(true)} className="w-full py-3 border border-dashed border-[#c7c6ca] bg-white text-[#a14009] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider">Completa scheda immobile</button>
            ) : (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-2"><span className="text-[11px] font-bold uppercase tracking-widest text-[#1a1c1a]">Dati opzionali modulari</span>{!isEditing && <button type="button" onClick={() => setShowAdvanced(false)} className="text-[11px] underline text-[#76777b]">Riduci</button>}</div>

                <fieldset><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Dati principali</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelClass}>Provincia<input value={province} onChange={(e) => setProvince(e.target.value.toUpperCase())} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Prezzo richiesto dal proprietario (€)<input type="number" min="0" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} className={`${inputClass} mt-1 font-normal`} placeholder="Opzionale" /><span className="normal-case tracking-normal font-normal text-[10px] block mt-1">Non è una stima o valutazione Mandato Ready.</span></label>
                </div></fieldset>

                <fieldset><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Composizione e caratteristiche</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelClass}>Locali<input type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Bagni<input type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Piano<input value={floor} onChange={(e) => setFloor(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                  <label className={labelClass}>Classe energetica<input value={energyClass} onChange={(e) => setEnergyClass(e.target.value.toUpperCase())} className={`${inputClass} mt-1 font-normal`} /></label>
                </div></fieldset>

                <fieldset><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Dati catastali dichiarati</legend><p className="text-[11px] text-[#76777b] mb-3">Dati inseriti dall&apos;operatore/proprietario. Mandato Ready non ne certifica la correttezza.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelClass}>Foglio<input value={cadastralSheet} onChange={(e) => setCadastralSheet(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Particella<input value={cadastralParcel} onChange={(e) => setCadastralParcel(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Subalterno<input value={cadastralSubaltern} onChange={(e) => setCadastralSubaltern(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Categoria<input value={cadastralCategory} onChange={(e) => setCadastralCategory(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={`${labelClass} sm:col-span-2`}>Note catastali<textarea rows={2} value={cadastralNotes} onChange={(e) => setCadastralNotes(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case resize-y`} /></label>
                </div></fieldset>

                <fieldset><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Note</legend><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} font-normal normal-case resize-y`} placeholder="Annotazioni operative..." /></fieldset>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-5 border-t border-[#c7c6ca] sticky bottom-0 bg-[#faf9f6] pb-1">
              <button type="button" onClick={closeNewPropertyModal} className="px-4 py-2.5 border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider">Annulla</button>
              <button type="submit" disabled={Boolean(possibleDuplicate && !ignoreDuplicate)} className="px-6 py-2.5 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">{isEditing ? 'Salva scheda' : 'Salva immobile'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
