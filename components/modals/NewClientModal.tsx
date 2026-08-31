'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Client, EntityType, ClientType } from '@/lib/types';

export const NewClientModal: React.FC = () => {
  const {
    isNewClientModalOpen,
    newClientModalState,
    closeNewClientModal,
    addNewClient,
    clients,
    openNewPracticeWizard,
    openNewPropertyModal,
    setSelectedClientId,
    setActiveTab,
    isHelpModeActive,
  } = useApp();

  // Form State
  const [entityType, setEntityType] = useState<EntityType>('persona');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [city, setCity] = useState('Terrasini');
  const [notes, setNotes] = useState('');
  const [clientType, setClientType] = useState<ClientType>('seller');

  // Duplicate Override & Saved Result
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [savedClient, setSavedClient] = useState<Client | null>(null);

  // Progressive Disclosure State (Requirement #3)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Track modal open state to reset form during render
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isNewClientModalOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setEntityType('persona');
    setFirstName(newClientModalState?.prefill?.firstName || '');
    setLastName(newClientModalState?.prefill?.lastName || '');
    setCompanyName(newClientModalState?.prefill?.companyName || '');
    setContactPerson(newClientModalState?.prefill?.contactPerson || '');
    setPhone(newClientModalState?.prefill?.phone || '');
    setEmail(newClientModalState?.prefill?.email || '');
    setFiscalCode(newClientModalState?.prefill?.fiscalCode || '');
    setVatNumber(newClientModalState?.prefill?.vatNumber || '');
    setCity(newClientModalState?.prefill?.city || 'Terrasini');
    setNotes(newClientModalState?.prefill?.notes || '');
    setClientType(newClientModalState?.prefill?.type || 'seller');
    setIgnoreDuplicate(false);
    setSavedClient(null);
    setShowAdvanced(false);
  } else if (!isNewClientModalOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // Duplicate detection logic
  let possibleDuplicate: { client: Client; reason: string } | null = null;
  if (isNewClientModalOpen && !ignoreDuplicate) {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();
    const cleanCF = fiscalCode.trim().toUpperCase();
    const cleanVat = vatNumber.trim().toUpperCase();
    const cleanCompany = companyName.trim().toLowerCase();

    for (const c of clients) {
      if (cleanPhone && cleanPhone.length > 5 && c.phone.replace(/\D/g, '').includes(cleanPhone)) {
        possibleDuplicate = { client: c, reason: 'stesso numero di telefono' };
        break;
      }
      if (cleanEmail && cleanEmail.length > 3 && c.email.toLowerCase() === cleanEmail) {
        possibleDuplicate = { client: c, reason: 'stessa email' };
        break;
      }
      if (cleanCF && cleanCF.length > 5 && c.fiscalCode?.toUpperCase() === cleanCF) {
        possibleDuplicate = { client: c, reason: 'stesso codice fiscale' };
        break;
      }
      if (cleanVat && cleanVat.length > 5 && c.vatNumber?.toUpperCase() === cleanVat) {
        possibleDuplicate = { client: c, reason: 'stessa partita IVA' };
        break;
      }
      if (
        entityType === 'azienda' &&
        cleanCompany &&
        cleanCompany.length > 3 &&
        c.companyName?.toLowerCase() === cleanCompany
      ) {
        possibleDuplicate = { client: c, reason: 'stessa ragione sociale' };
        break;
      }
    }
  }

  if (!isNewClientModalOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (entityType === 'persona') {
      if (!firstName.trim() || !lastName.trim()) return;
    } else {
      if (!companyName.trim()) return;
    }

    const created = addNewClient({
      entityType,
      firstName: entityType === 'persona' ? firstName.trim() : (contactPerson.trim().split(' ')[0] || 'Referente'),
      lastName: entityType === 'persona' ? lastName.trim() : (contactPerson.trim().split(' ').slice(1).join(' ') || companyName.trim()),
      companyName: entityType === 'azienda' ? companyName.trim() : undefined,
      contactPerson: entityType === 'azienda' ? contactPerson.trim() : undefined,
      phone: phone.trim() || '+39 340 0000000',
      email: email.trim() || 'cliente@email.it',
      fiscalCode: fiscalCode.trim().toUpperCase() || undefined,
      vatNumber: vatNumber.trim().toUpperCase() || undefined,
      city: city.trim() || 'Terrasini',
      notes: notes.trim() || undefined,
      type: clientType,
    });

    if (newClientModalState?.onSaveCallback) {
      newClientModalState.onSaveCallback(created);
      closeNewClientModal();
    } else {
      setSavedClient(created);
    }
  };

  const handleUseExistingDuplicate = (dup: Client) => {
    if (newClientModalState?.onSaveCallback) {
      newClientModalState.onSaveCallback(dup);
      closeNewClientModal();
    } else {
      setSelectedClientId(dup.id);
      setActiveTab('clienti');
      closeNewClientModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeNewClientModal}
    >
      <div
        className="bg-[#faf9f6] border-2 border-[#1a1c1a] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeNewClientModal}
          className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* STEP 1: SUCCESS CONFIRMATION SCREEN */}
        {savedClient ? (
          <div className="text-left space-y-6">
            <div className="flex items-center gap-3 p-4 bg-[#e8f5e9] border border-[#a5d6a7]">
              <span className="material-symbols-outlined text-[#1b5e20] text-[28px]">check_circle</span>
              <div>
                <h3 className="text-[20px] font-serif-display font-bold text-[#1b5e20]">
                  Cliente salvato
                </h3>
                <p className="text-[13px] text-[#2e7d32]">
                  {savedClient.entityType === 'azienda'
                    ? savedClient.companyName
                    : `${savedClient.firstName} ${savedClient.lastName}`}{' '}
                  è stato aggiunto correttamente all anagrafica globale.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block">
                Cosa vuoi fare ora?
              </span>

              {/* Action 1: Create Practice */}
              <button
                onClick={() => {
                  closeNewClientModal();
                  openNewPracticeWizard('existing_client', savedClient.id);
                }}
                className="w-full p-4 text-left bg-[#1a1c1a] text-white hover:bg-[#333533] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] text-[#ffdbcd]">create_new_folder</span>
                  <div>
                    <span className="text-[14px] font-bold block">Crea una pratica con questo cliente</span>
                    <span className="text-[11px] text-[#c7c6ca]">Avvia subito un fascicolo di vendita o locazione.</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              {/* Action 2: Add Property */}
              <button
                onClick={() => {
                  closeNewClientModal();
                  openNewPropertyModal({ owners: [savedClient.id] });
                }}
                className="w-full p-4 text-left bg-white border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] text-[#a14009]">add_home</span>
                  <div>
                    <span className="text-[14px] font-bold block text-[#1a1c1a]">Aggiungi un immobile</span>
                    <span className="text-[11px] text-[#76777b]">Inserisci una proprietà in gestione intestata a questo cliente.</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#76777b]">arrow_forward</span>
              </button>

              {/* Action 3: Go to clients list / view detail */}
              <button
                onClick={() => {
                  closeNewClientModal();
                  setSelectedClientId(savedClient.id);
                  setActiveTab('clienti');
                }}
                className="w-full p-3 text-center border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider text-[#1a1c1a] hover:bg-[#e3e2e0] cursor-pointer"
              >
                Torna ai clienti / Vedi scheda
              </button>
            </div>
          </div>
        ) : (
          /* STEP 0: FORM SCREEN */
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#c7c6ca]">
              <span className="material-symbols-outlined text-[#a14009] text-[24px]">person_add</span>
              <h3 className="text-[22px] font-serif-display font-bold text-[#1a1c1a]">
                Nuovo cliente
              </h3>
            </div>

            {isHelpModeActive && (
              <div className="mb-4 bg-[#ffdbcd] p-2.5 border border-[#a14009]/30 text-[12px] text-[#6a2500]">
                💡 <strong>Cliente:</strong> Puoi salvarlo subito e collegarlo a un immobile o a una pratica quando vuoi.
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-[14px]">
              {/* Type Switcher */}
              <div>
                <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                  Tipologia Soggetto
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntityType('persona')}
                    className={`p-2.5 border text-[12px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all ${
                      entityType === 'persona'
                        ? 'border-[#1a1c1a] bg-[#1a1c1a] text-white'
                        : 'border-[#c7c6ca] bg-white text-[#46474a] hover:border-[#1a1c1a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Persona fisica
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityType('azienda')}
                    className={`p-2.5 border text-[12px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all ${
                      entityType === 'azienda'
                        ? 'border-[#1a1c1a] bg-[#1a1c1a] text-white'
                        : 'border-[#c7c6ca] bg-white text-[#46474a] hover:border-[#1a1c1a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">domain</span>
                    Azienda / P.IVA
                  </button>
                </div>
              </div>

              {/* Duplicate Detection Warning */}
              {possibleDuplicate && (
                <div className="bg-[#fff8e1] border-2 border-[#f57f17] p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#f57f17] text-[22px] shrink-0">warning</span>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#b78103]">Potrebbe essere già presente</h4>
                      <p className="text-[12px] text-[#5d4037] mt-0.5">
                        Trovato un contatto esistente con {possibleDuplicate.reason}:
                      </p>
                      <div className="mt-2 bg-white p-2.5 border border-[#ffe082] text-[12px] font-mono">
                        <div className="font-bold text-[#1a1c1a]">
                          {possibleDuplicate.client.entityType === 'azienda'
                            ? possibleDuplicate.client.companyName
                            : `${possibleDuplicate.client.firstName} ${possibleDuplicate.client.lastName}`}
                        </div>
                        <div className="text-[#76777b]">
                          {possibleDuplicate.client.phone} · {possibleDuplicate.client.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#ffe082]">
                    <button
                      type="button"
                      onClick={() => handleUseExistingDuplicate(possibleDuplicate.client)}
                      className="flex-1 bg-[#1a1c1a] text-white py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-[#333533] cursor-pointer"
                    >
                      Usa cliente esistente
                    </button>
                    <button
                      type="button"
                      onClick={() => setIgnoreDuplicate(true)}
                      className="px-3 py-2 border border-[#b78103] text-[#b78103] text-[11px] font-bold uppercase tracking-wider hover:bg-[#fff3e0] cursor-pointer"
                    >
                      Crea comunque
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Fields based on EntityType */}
              {entityType === 'persona' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                      Nome <span className="text-[#a14009]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="es. Mario"
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] focus:border-[#1a1c1a] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                      Cognome <span className="text-[#a14009]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="es. Rossi"
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] focus:border-[#1a1c1a] outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                      Ragione Sociale <span className="text-[#a14009]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="es. Immobiliare Palermo S.r.l."
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] focus:border-[#1a1c1a] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                      Referente / Amministratore (opzionale)
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="es. Ing. Giuseppe Verdi"
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] focus:border-[#1a1c1a] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Telefono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+39 333 1234567"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] focus:border-[#1a1c1a] outline-none font-mono text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario.rossi@email.it"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] focus:border-[#1a1c1a] outline-none font-mono text-[13px]"
                  />
                </div>
              </div>

              {/* Progressive Disclosure Toggle */}
              {!showAdvanced ? (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(true)}
                  className="w-full py-2.5 px-3 border border-dashed border-[#c7c6ca] hover:border-[#1a1c1a] bg-white text-[#a14009] hover:bg-[#faf9f6] text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle_outline</span>
                  <span>+ Aggiungi altri dati (Codice Fiscale, Indirizzo, Note...)</span>
                </button>
              ) : (
                <div className="space-y-4 pt-2 border-t border-[#c7c6ca]/60 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-[#76777b]">
                      Informazioni Avanzate (Opzionali)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(false)}
                      className="text-[11px] text-[#76777b] hover:text-[#1a1c1a] underline cursor-pointer"
                    >
                      Riduci
                    </button>
                  </div>

                  {/* CF / P.IVA & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {entityType === 'persona' ? (
                      <div>
                        <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                          Codice Fiscale
                        </label>
                        <input
                          type="text"
                          value={fiscalCode}
                          onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
                          placeholder="RSSMRA80A01H501U"
                          className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] font-mono text-[12px] uppercase outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                          Partita IVA / CF Azienda
                        </label>
                        <input
                          type="text"
                          value={vatNumber}
                          onChange={(e) => setVatNumber(e.target.value.toUpperCase())}
                          placeholder="IT01234567890"
                          className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] font-mono text-[12px] uppercase outline-none"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                        Comune di residenza / sede
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Terrasini"
                        className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                      Ruolo Cliente
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['seller', 'buyer', 'both'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setClientType(r)}
                          className={`p-2 border text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                            clientType === r
                              ? 'border-[#a14009] bg-[#ffdbcd] text-[#6a2500]'
                              : 'border-[#c7c6ca] bg-white text-[#1a1c1a]'
                          }`}
                        >
                          {r === 'seller' ? 'Venditore' : r === 'buyer' ? 'Acquirente' : 'Entrambi'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                      Note generali (opzionale)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Annotazioni su esigenze, orari di contatto, budget..."
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] text-[13px] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c7c6ca]">
                <button
                  type="button"
                  onClick={closeNewClientModal}
                  className="px-4 py-2.5 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] cursor-pointer shadow-sm"
                >
                  Salva cliente
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
