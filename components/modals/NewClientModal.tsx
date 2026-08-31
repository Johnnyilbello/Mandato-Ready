'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Client, ClientType, EntityType } from '@/lib/types';

export const NewClientModal: React.FC = () => {
  const {
    isNewClientModalOpen,
    newClientModalState,
    closeNewClientModal,
    addNewClient,
    updateClient,
    clients,
    openNewPracticeWizard,
    openNewPropertyModal,
    setSelectedClientId,
    setActiveTab,
    isHelpModeActive,
  } = useApp();

  const [entityType, setEntityType] = useState<EntityType>('persona');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [clientType, setClientType] = useState<ClientType>('seller');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [savedClient, setSavedClient] = useState<Client | null>(null);

  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [nationality, setNationality] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');

  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceMunicipality, setResidenceMunicipality] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('Italia');

  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentIssueDate, setDocumentIssueDate] = useState('');
  const [documentExpiryDate, setDocumentExpiryDate] = useState('');
  const [documentAuthority, setDocumentAuthority] = useState('');

  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'telefono' | 'whatsapp' | 'email' | 'altro'>('whatsapp');

  const [profession, setProfession] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [pec, setPec] = useState('');
  const [sdi, setSdi] = useState('');
  const [registeredOfficeAddress, setRegisteredOfficeAddress] = useState('');
  const [registeredOfficeMunicipality, setRegisteredOfficeMunicipality] = useState('');
  const [registeredOfficePostalCode, setRegisteredOfficePostalCode] = useState('');
  const [registeredOfficeProvince, setRegisteredOfficeProvince] = useState('');

  const isEditing = Boolean(newClientModalState?.editClientId);

  useEffect(() => {
    if (!isNewClientModalOpen) return;
    const prefill = newClientModalState?.prefill;
    const detectedEntityType = prefill?.entityType || (prefill?.companyName ? 'azienda' : 'persona');
    setEntityType(detectedEntityType);
    setFirstName(prefill?.firstName || '');
    setLastName(prefill?.lastName || '');
    setCompanyName(prefill?.companyName || '');
    setContactPerson(prefill?.contactPerson || '');
    setPhone(prefill?.phone || '');
    setEmail(prefill?.email || '');
    setFiscalCode(prefill?.fiscalCode || prefill?.companyDetails?.fiscalCode || '');
    setVatNumber(prefill?.vatNumber || '');
    setClientType(prefill?.type || 'seller');
    setBirthDate(prefill?.personalData?.birthDate || '');
    setBirthPlace(prefill?.personalData?.birthPlace || '');
    setNationality(prefill?.personalData?.nationality || '');
    setMaritalStatus(prefill?.personalData?.maritalStatus || '');
    setResidenceAddress(prefill?.residence?.address || prefill?.address || '');
    setResidenceMunicipality(prefill?.residence?.municipality || prefill?.city || '');
    setPostalCode(prefill?.residence?.postalCode || '');
    setProvince(prefill?.residence?.province || '');
    setCountry(prefill?.residence?.country || 'Italia');
    setDocumentType(prefill?.identityDocument?.type || '');
    setDocumentNumber(prefill?.identityDocument?.number || '');
    setDocumentIssueDate(prefill?.identityDocument?.issueDate || '');
    setDocumentExpiryDate(prefill?.identityDocument?.expiryDate || '');
    setDocumentAuthority(prefill?.identityDocument?.issuingAuthority || '');
    setSecondaryPhone(prefill?.contacts?.secondaryPhone || '');
    setSecondaryEmail(prefill?.contacts?.secondaryEmail || '');
    setPreferredContactMethod(prefill?.contacts?.preferredContactMethod || 'whatsapp');
    setProfession(prefill?.operationalInfo?.profession || '');
    setSource(prefill?.operationalInfo?.source || '');
    setNotes(prefill?.operationalInfo?.notes || prefill?.notes || '');
    setInternalNotes(prefill?.operationalInfo?.internalNotes || '');
    setPec(prefill?.companyDetails?.pec || '');
    setSdi(prefill?.companyDetails?.sdi || '');
    setRegisteredOfficeAddress(prefill?.companyDetails?.registeredOffice?.address || '');
    setRegisteredOfficeMunicipality(prefill?.companyDetails?.registeredOffice?.municipality || '');
    setRegisteredOfficePostalCode(prefill?.companyDetails?.registeredOffice?.postalCode || '');
    setRegisteredOfficeProvince(prefill?.companyDetails?.registeredOffice?.province || '');
    setIgnoreDuplicate(false);
    setSavedClient(null);
    setShowAdvanced(isEditing);
  }, [isEditing, isNewClientModalOpen, newClientModalState]);

  const possibleDuplicate = useMemo(() => {
    if (!isNewClientModalOpen || ignoreDuplicate) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const cleanFiscalCode = fiscalCode.trim().toUpperCase();
    const cleanVat = vatNumber.trim().toUpperCase();

    for (const client of clients) {
      if (client.id === newClientModalState?.editClientId) continue;
      if (cleanPhone.length > 5 && client.phone.replace(/\D/g, '') === cleanPhone) {
        return { client, reason: 'stesso numero di telefono' };
      }
      if (cleanEmail && client.email.trim().toLowerCase() === cleanEmail) {
        return { client, reason: 'stessa email' };
      }
      if (cleanFiscalCode.length > 5 && client.fiscalCode?.toUpperCase() === cleanFiscalCode) {
        return { client, reason: 'stesso codice fiscale' };
      }
      if (cleanVat.length > 5 && client.vatNumber?.toUpperCase() === cleanVat) {
        return { client, reason: 'stessa partita IVA' };
      }
    }
    return null;
  }, [clients, email, fiscalCode, ignoreDuplicate, isNewClientModalOpen, newClientModalState?.editClientId, phone, vatNumber]);

  if (!isNewClientModalOpen) return null;

  const buildPayload = (): Omit<Client, 'id' | 'createdAt'> => {
    const contactParts = contactPerson.trim().split(/\s+/).filter(Boolean);
    const companyFirstName = contactParts[0] || companyName.trim();
    const companyLastName = contactParts.slice(1).join(' ');
    return {
      entityType,
      firstName: entityType === 'persona' ? firstName.trim() : companyFirstName,
      lastName: entityType === 'persona' ? lastName.trim() : companyLastName,
      companyName: entityType === 'azienda' ? companyName.trim() : undefined,
      contactPerson: entityType === 'azienda' ? contactPerson.trim() : undefined,
      phone: phone.trim(),
      email: email.trim(),
      fiscalCode: fiscalCode.trim().toUpperCase() || undefined,
      vatNumber: entityType === 'azienda' ? vatNumber.trim().toUpperCase() || undefined : undefined,
      type: clientType,
      city: residenceMunicipality.trim() || registeredOfficeMunicipality.trim() || undefined,
      address: residenceAddress.trim() || registeredOfficeAddress.trim() || undefined,
      notes: notes.trim() || undefined,
      personalData: entityType === 'persona' ? {
        birthDate: birthDate || undefined,
        birthPlace: birthPlace.trim() || undefined,
        nationality: nationality.trim() || undefined,
        maritalStatus: maritalStatus.trim() || undefined,
      } : undefined,
      residence: entityType === 'persona' ? {
        address: residenceAddress.trim() || undefined,
        municipality: residenceMunicipality.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        province: province.trim().toUpperCase() || undefined,
        country: country.trim() || undefined,
      } : undefined,
      identityDocument: {
        type: documentType || undefined,
        number: documentNumber.trim() || undefined,
        issueDate: documentIssueDate || undefined,
        expiryDate: documentExpiryDate || undefined,
        issuingAuthority: documentAuthority.trim() || undefined,
      },
      contacts: {
        secondaryPhone: secondaryPhone.trim() || undefined,
        secondaryEmail: secondaryEmail.trim() || undefined,
        preferredContactMethod,
      },
      operationalInfo: {
        profession: profession.trim() || undefined,
        source: source.trim() || undefined,
        notes: notes.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
      },
      companyDetails: entityType === 'azienda' ? {
        pec: pec.trim() || undefined,
        sdi: sdi.trim() || undefined,
        fiscalCode: fiscalCode.trim().toUpperCase() || undefined,
        registeredOffice: {
          address: registeredOfficeAddress.trim() || undefined,
          municipality: registeredOfficeMunicipality.trim() || undefined,
          postalCode: registeredOfficePostalCode.trim() || undefined,
          province: registeredOfficeProvince.trim().toUpperCase() || undefined,
          country: 'Italia',
        },
      } : undefined,
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!phone.trim() || !email.trim()) return;
    if (entityType === 'persona' && (!firstName.trim() || !lastName.trim())) return;
    if (entityType === 'azienda' && (!companyName.trim() || !contactPerson.trim())) return;
    if (possibleDuplicate && !ignoreDuplicate) return;

    const payload = buildPayload();
    const saved = isEditing && newClientModalState?.editClientId
      ? updateClient(newClientModalState.editClientId, payload)
      : addNewClient(payload);

    if (!saved) return;
    newClientModalState?.onSaveCallback?.(saved);

    if (isEditing || newClientModalState?.onSaveCallback) {
      closeNewClientModal();
    } else {
      setSavedClient(saved);
    }
  };

  const useExisting = (client: Client) => {
    newClientModalState?.onSaveCallback?.(client);
    setSelectedClientId(client.id);
    if (!newClientModalState?.onSaveCallback) setActiveTab('clienti');
    closeNewClientModal();
  };

  const inputClass = 'w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none focus:border-[#1a1c1a] min-w-0';
  const labelClass = 'text-[10px] sm:text-[11px] font-bold uppercase text-[#76777b] block mb-1 tracking-wide';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto" onMouseDown={(event) => event.target === event.currentTarget && closeNewClientModal()}>
      <div role="dialog" aria-modal="true" aria-labelledby="client-modal-title" className="bg-[#faf9f6] border-t-2 sm:border-2 border-[#1a1c1a] max-w-3xl w-full max-h-[95dvh] overflow-y-auto p-5 sm:p-8 shadow-2xl relative rounded-t-2xl sm:rounded-none">
        <button onClick={closeNewClientModal} className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-2" aria-label="Chiudi">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {savedClient ? (
          <div className="space-y-6 pr-8">
            <div className="p-4 bg-[#e8f5e9] border border-[#a5d6a7]">
              <h3 className="text-[20px] font-serif-display font-bold text-[#1b5e20]">Cliente salvato</h3>
              <p className="text-[13px] text-[#2e7d32] mt-1">L&apos;anagrafica è indipendente e potrà essere completata o riutilizzata in altre pratiche.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => { closeNewClientModal(); openNewPracticeWizard('existing_client', savedClient.id); }} className="p-4 bg-[#1a1c1a] text-white text-left font-bold text-[13px]">Crea pratica con questo cliente</button>
              <button onClick={() => { closeNewClientModal(); openNewPropertyModal({ owners: [savedClient.id] }); }} className="p-4 bg-white border border-[#c7c6ca] text-[#1a1c1a] text-left font-bold text-[13px]">Aggiungi immobile</button>
              <button onClick={() => { setSelectedClientId(savedClient.id); setActiveTab('clienti'); closeNewClientModal(); }} className="sm:col-span-2 p-3 border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider">Vedi scheda cliente</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="pr-10 pb-4 border-b border-[#c7c6ca]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a14009]">{isEditing ? 'ANAGRAFICA COMPLETA' : 'CREAZIONE RAPIDA'}</span>
              <h2 id="client-modal-title" className="text-[24px] font-serif-display font-bold text-[#1a1c1a]">{isEditing ? 'Completa scheda cliente' : 'Nuovo cliente'}</h2>
              <p className="text-[12px] text-[#76777b] mt-1">I campi avanzati sono opzionali finché un workflow non li richiede.</p>
            </div>

            {isHelpModeActive && <div className="bg-[#ffdbcd] p-3 border border-[#a14009]/30 text-[12px] text-[#6a2500]">Salva subito i dati essenziali; potrai completare la scheda in seguito senza creare duplicati.</div>}

            <div className="grid grid-cols-2 gap-2">
              {(['persona', 'azienda'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setEntityType(value)} className={`p-2.5 border text-[11px] sm:text-[12px] font-bold uppercase tracking-wider ${entityType === value ? 'bg-[#1a1c1a] text-white border-[#1a1c1a]' : 'bg-white text-[#46474a] border-[#c7c6ca]'}`}>
                  {value === 'persona' ? 'Persona fisica' : 'Azienda'}
                </button>
              ))}
            </div>

            {possibleDuplicate && !ignoreDuplicate && (
              <div className="bg-[#fff8e1] border-2 border-[#f57f17] p-4 space-y-3">
                <h3 className="text-[14px] font-bold text-[#8a5600]">Potrebbe essere già presente</h3>
                <p className="text-[12px] text-[#5d4037]">Trovato un contatto con {possibleDuplicate.reason}.</p>
                <div className="p-2.5 bg-white border border-[#ffe082] text-[12px] break-all">{possibleDuplicate.client.companyName || `${possibleDuplicate.client.firstName} ${possibleDuplicate.client.lastName}`} · {possibleDuplicate.client.phone} · {possibleDuplicate.client.email}</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={() => useExisting(possibleDuplicate.client)} className="flex-1 bg-[#1a1c1a] text-white py-2 text-[11px] font-bold uppercase">Usa cliente esistente</button>
                  <button type="button" onClick={() => setIgnoreDuplicate(true)} className="flex-1 border border-[#b78103] text-[#8a5600] py-2 text-[11px] font-bold uppercase">Crea comunque</button>
                </div>
              </div>
            )}

            {entityType === 'persona' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={labelClass}>Nome *<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                <label className={labelClass}>Cognome *<input required value={lastName} onChange={(event) => setLastName(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={labelClass}>Ragione sociale *<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                <label className={labelClass}>Referente *<input required value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={labelClass}>Telefono / WhatsApp *<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
              <label className={labelClass}>Email *<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
              {entityType === 'persona' && <label className={labelClass}>Codice fiscale (opzionale)<input value={fiscalCode} onChange={(event) => setFiscalCode(event.target.value.toUpperCase())} className={`${inputClass} mt-1 font-mono font-normal`} /></label>}
            </div>

            {!showAdvanced ? (
              <button type="button" onClick={() => setShowAdvanced(true)} className="w-full py-3 border border-dashed border-[#c7c6ca] bg-white text-[#a14009] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider">+ Aggiungi altri dati</button>
            ) : (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-2"><span className="text-[11px] font-bold uppercase tracking-widest text-[#1a1c1a]">Dati avanzati opzionali</span>{!isEditing && <button type="button" onClick={() => setShowAdvanced(false)} className="text-[11px] underline text-[#76777b]">Riduci</button>}</div>

                {entityType === 'persona' && (
                  <fieldset className="space-y-3"><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Dati personali</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={labelClass}>Data di nascita<input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                    <label className={labelClass}>Luogo di nascita<input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                    <label className={labelClass}>Nazionalità<input value={nationality} onChange={(e) => setNationality(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                    <label className={labelClass}>Stato civile<input value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                  </div></fieldset>
                )}

                {entityType === 'persona' ? (
                  <fieldset className="space-y-3"><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Residenza</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`${labelClass} sm:col-span-2`}>Indirizzo<input value={residenceAddress} onChange={(e) => setResidenceAddress(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                    <label className={labelClass}>Comune<input value={residenceMunicipality} onChange={(e) => setResidenceMunicipality(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                    <label className={labelClass}>CAP<input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                    <label className={labelClass}>Provincia<input value={province} onChange={(e) => setProvince(e.target.value.toUpperCase())} className={`${inputClass} mt-1 font-normal`} /></label>
                    <label className={labelClass}>Paese<input value={country} onChange={(e) => setCountry(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                  </div></fieldset>
                ) : (
                  <fieldset className="space-y-3"><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Dati azienda</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={labelClass}>P.IVA<input value={vatNumber} onChange={(e) => setVatNumber(e.target.value.toUpperCase())} className={`${inputClass} mt-1 font-normal`} /></label>
                    <label className={labelClass}>Codice fiscale<input value={fiscalCode} onChange={(e) => setFiscalCode(e.target.value.toUpperCase())} className={`${inputClass} mt-1 font-normal`} /></label>
                    <label className={labelClass}>PEC<input type="email" value={pec} onChange={(e) => setPec(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                    <label className={labelClass}>SDI<input value={sdi} onChange={(e) => setSdi(e.target.value.toUpperCase())} className={`${inputClass} mt-1 font-normal`} /></label>
                    <label className={`${labelClass} sm:col-span-2`}>Sede legale<input value={registeredOfficeAddress} onChange={(e) => setRegisteredOfficeAddress(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                    <label className={labelClass}>Comune<input value={registeredOfficeMunicipality} onChange={(e) => setRegisteredOfficeMunicipality(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                    <label className={labelClass}>CAP<input value={registeredOfficePostalCode} onChange={(e) => setRegisteredOfficePostalCode(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                    <label className={labelClass}>Provincia<input value={registeredOfficeProvince} onChange={(e) => setRegisteredOfficeProvince(e.target.value.toUpperCase())} className={`${inputClass} mt-1 font-normal`} /></label>
                  </div></fieldset>
                )}

                <fieldset className="space-y-3"><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Documento</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelClass}>Tipo<select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`}><option value="">Non indicato</option><option>Carta di identità</option><option>Passaporto</option><option>Patente</option></select></label>
                  <label className={labelClass}>Numero<input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Data rilascio<input type="date" value={documentIssueDate} onChange={(e) => setDocumentIssueDate(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={labelClass}>Data scadenza<input type="date" value={documentExpiryDate} onChange={(e) => setDocumentExpiryDate(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
                  <label className={`${labelClass} sm:col-span-2`}>Ente rilascio<input value={documentAuthority} onChange={(e) => setDocumentAuthority(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                </div></fieldset>

                <fieldset className="space-y-3"><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Contatti</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelClass}>Telefono secondario<input value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                  <label className={labelClass}>Email secondaria<input type="email" value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                  <label className={`${labelClass} sm:col-span-2`}>Contatto preferito<select value={preferredContactMethod} onChange={(e) => setPreferredContactMethod(e.target.value as 'telefono' | 'whatsapp' | 'email' | 'altro')} className={`${inputClass} mt-1 font-normal normal-case`}><option value="whatsapp">WhatsApp</option><option value="telefono">Telefono</option><option value="email">Email</option><option value="altro">Altro</option></select></label>
                </div></fieldset>

                <fieldset className="space-y-3"><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Informazioni operative</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelClass}>Professione<input value={profession} onChange={(e) => setProfession(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                  <label className={labelClass}>Provenienza contatto<input value={source} onChange={(e) => setSource(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case`} /></label>
                  <label className={`${labelClass} sm:col-span-2`}>Note<textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case resize-y`} /></label>
                  <label className={`${labelClass} sm:col-span-2`}>Note interne<textarea rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className={`${inputClass} mt-1 font-normal normal-case resize-y`} /></label>
                </div></fieldset>

                <fieldset><legend className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">Ruolo operativo</legend><div className="grid grid-cols-3 gap-2">{(['seller', 'buyer', 'both'] as const).map((role) => <button key={role} type="button" onClick={() => setClientType(role)} className={`p-2 border text-[10px] sm:text-[11px] font-bold uppercase ${clientType === role ? 'border-[#a14009] bg-[#ffdbcd] text-[#6a2500]' : 'border-[#c7c6ca] bg-white'}`}>{role === 'seller' ? 'Venditore' : role === 'buyer' ? 'Acquirente' : 'Entrambi'}</button>)}</div></fieldset>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-5 border-t border-[#c7c6ca] sticky bottom-0 bg-[#faf9f6] pb-1">
              <button type="button" onClick={closeNewClientModal} className="px-4 py-2.5 border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider">Annulla</button>
              <button type="submit" disabled={Boolean(possibleDuplicate && !ignoreDuplicate)} className="px-6 py-2.5 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">{isEditing ? 'Salva scheda' : 'Salva cliente'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
