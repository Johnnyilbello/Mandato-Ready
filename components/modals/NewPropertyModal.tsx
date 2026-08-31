'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Property, Client } from '@/lib/types';

const PROPERTY_TYPES = [
  'Appartamento',
  'Villa',
  'Attico',
  'Terratetto / Villetta',
  'Negozio / Commerciale',
  'Ufficio',
  'Garage / Box',
  'Terreno',
  'Rustico / Casale',
  'Altro',
];

const PROPERTY_STATUSES = [
  'Ottimo stato / Ristrutturato',
  'Buono stato',
  'Da ristrutturare',
  'Nuova costruzione',
  'Grezzo / Da rifinire',
];

export const NewPropertyModal: React.FC = () => {
  const {
    isNewPropertyModalOpen,
    newPropertyModalState,
    closeNewPropertyModal,
    addNewProperty,
    properties,
    clients,
    openNewPracticeWizard,
    openNewClientModal,
    setSelectedPropertyId,
    setActiveTab,
    isHelpModeActive,
  } = useApp();

  // Form State
  const [type, setType] = useState('Appartamento');
  const [municipality, setMunicipality] = useState('Terrasini');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [surface, setSurface] = useState<string>('120');
  const [statusState, setStatusState] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [askingPrice, setAskingPrice] = useState<string>('');

  // Duplicate Override & Saved Result
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [savedProperty, setSavedProperty] = useState<Property | null>(null);

  // Search client filter inside dropdown
  const [clientSearch, setClientSearch] = useState('');

  // Track modal open state to reset form during render
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isNewPropertyModalOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setType(newPropertyModalState?.prefill?.type || 'Appartamento');
    setMunicipality(newPropertyModalState?.prefill?.municipality || 'Terrasini');
    setArea(newPropertyModalState?.prefill?.area || '');
    setAddress(newPropertyModalState?.prefill?.address || '');
    setSurface(newPropertyModalState?.prefill?.approximateSurface ? String(newPropertyModalState.prefill.approximateSurface) : '120');
    setStatusState(newPropertyModalState?.prefill?.statusState || '');
    setSelectedOwnerId(newPropertyModalState?.prefill?.owners?.[0] || '');
    setNotes(newPropertyModalState?.prefill?.notes || '');
    setAskingPrice(
      newPropertyModalState?.prefill?.askingPrice
        ? String(newPropertyModalState.prefill.askingPrice)
        : newPropertyModalState?.prefill?.estimatedValue
        ? String(newPropertyModalState.prefill.estimatedValue)
        : ''
    );
    setIgnoreDuplicate(false);
    setSavedProperty(null);
    setClientSearch('');
  } else if (!isNewPropertyModalOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // Duplicate detection logic
  let possibleDuplicate: { property: Property; reason: string } | null = null;
  if (isNewPropertyModalOpen && !ignoreDuplicate) {
    const cleanAddress = address.trim().toLowerCase();
    const cleanMuni = municipality.trim().toLowerCase();

    if (cleanAddress && cleanAddress.length >= 4) {
      for (const p of properties) {
        const pAddr = p.address.toLowerCase();
        const pMuni = p.municipality.toLowerCase();

        if (pAddr.includes(cleanAddress) && pMuni.includes(cleanMuni)) {
          possibleDuplicate = { property: p, reason: 'indirizzo e comune identici' };
          break;
        }
      }
    }
  }

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter((c) => {
      const name = c.entityType === 'azienda' ? c.companyName || '' : `${c.firstName} ${c.lastName}`;
      return name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
    });
  }, [clients, clientSearch]);

  if (!isNewPropertyModalOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!municipality.trim()) return;

    const created = addNewProperty({
      type,
      municipality: municipality.trim(),
      province: 'PA',
      area: area.trim() || undefined,
      address: address.trim() || 'Indirizzo da definire',
      approximateSurface: parseInt(surface, 10) || 100,
      owners: selectedOwnerId ? [selectedOwnerId] : [],
      statusState: statusState || undefined,
      notes: notes.trim() || undefined,
      askingPrice: askingPrice ? parseInt(askingPrice, 10) : undefined,
      estimatedValue: askingPrice ? parseInt(askingPrice, 10) : undefined,
    });

    if (newPropertyModalState?.onSaveCallback) {
      newPropertyModalState.onSaveCallback(created);
      closeNewPropertyModal();
    } else {
      setSavedProperty(created);
    }
  };

  const handleUseExistingDuplicate = (dup: Property) => {
    if (newPropertyModalState?.onSaveCallback) {
      newPropertyModalState.onSaveCallback(dup);
      closeNewPropertyModal();
    } else {
      setSelectedPropertyId(dup.id);
      setActiveTab('immobili');
      closeNewPropertyModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeNewPropertyModal}
    >
      <div
        className="bg-[#faf9f6] border-2 border-[#1a1c1a] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeNewPropertyModal}
          className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* STEP 1: SUCCESS CONFIRMATION SCREEN */}
        {savedProperty ? (
          <div className="text-left space-y-6">
            <div className="flex items-center gap-3 p-4 bg-[#e8f5e9] border border-[#a5d6a7]">
              <span className="material-symbols-outlined text-[#1b5e20] text-[28px]">check_circle</span>
              <div>
                <h3 className="text-[20px] font-serif-display font-bold text-[#1b5e20]">
                  Immobile salvato
                </h3>
                <p className="text-[13px] text-[#2e7d32]">
                  {savedProperty.type} in {savedProperty.address}, {savedProperty.municipality} è stato inserito nell archivio.
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
                  closeNewPropertyModal();
                  openNewPracticeWizard('existing_client', savedProperty.owners[0]);
                }}
                className="w-full p-4 text-left bg-[#1a1c1a] text-white hover:bg-[#333533] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] text-[#ffdbcd]">create_new_folder</span>
                  <div>
                    <span className="text-[14px] font-bold block">Crea una pratica con questo immobile</span>
                    <span className="text-[11px] text-[#c7c6ca]">Avvia subito il fascicolo di vendita o locazione.</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              {/* Action 2: Connect client if not linked */}
              {savedProperty.owners.length === 0 && (
                <button
                  onClick={() => {
                    // Open owner selector or client modal
                    openNewClientModal(
                      {},
                      (newClient) => {
                        // link owner to savedProperty
                        savedProperty.owners = [newClient.id];
                      }
                    );
                  }}
                  className="w-full p-4 text-left bg-white border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px] text-[#a14009]">person_add</span>
                    <div>
                      <span className="text-[14px] font-bold block text-[#1a1c1a]">Collega un cliente proprietario</span>
                      <span className="text-[11px] text-[#76777b]">Crea o seleziona il proprietario dell immobile.</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#76777b]">arrow_forward</span>
                </button>
              )}

              {/* Action 3: Go to Immobili / View Property Detail */}
              <button
                onClick={() => {
                  closeNewPropertyModal();
                  setSelectedPropertyId(savedProperty.id);
                  setActiveTab('immobili');
                }}
                className="w-full p-3 text-center border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider text-[#1a1c1a] hover:bg-[#e3e2e0] cursor-pointer"
              >
                Torna agli immobili / Vedi scheda
              </button>
            </div>
          </div>
        ) : (
          /* STEP 0: FORM SCREEN */
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#c7c6ca]">
              <span className="material-symbols-outlined text-[#a14009] text-[24px]">home_work</span>
              <h3 className="text-[22px] font-serif-display font-bold text-[#1a1c1a]">
                Nuovo immobile
              </h3>
            </div>

            {isHelpModeActive && (
              <div className="mb-4 bg-[#ffdbcd] p-2.5 border border-[#a14009]/30 text-[12px] text-[#6a2500]">
                💡 <strong>Immobile:</strong> Puoi salvarlo indipendentemente e collegarlo successivamente a cliente e pratica.
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-[14px]">
              {/* Duplicate Detection Warning */}
              {possibleDuplicate && (
                <div className="bg-[#fff8e1] border-2 border-[#f57f17] p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#f57f17] text-[22px] shrink-0">warning</span>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#b78103]">Potrebbe essere già presente</h4>
                      <p className="text-[12px] text-[#5d4037] mt-0.5">
                        Trovato un immobile con indirizzo analogo:
                      </p>
                      <div className="mt-2 bg-white p-2.5 border border-[#ffe082] text-[12px] font-mono">
                        <div className="font-bold text-[#1a1c1a]">{possibleDuplicate.property.address}</div>
                        <div className="text-[#76777b]">{possibleDuplicate.property.municipality} ({possibleDuplicate.property.type})</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#ffe082]">
                    <button
                      type="button"
                      onClick={() => handleUseExistingDuplicate(possibleDuplicate.property)}
                      className="flex-1 bg-[#1a1c1a] text-white py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-[#333533] cursor-pointer"
                    >
                      Apri esistente
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

              {/* Tipologia & Comune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Tipologia Immobile
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] font-medium outline-none"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Comune <span className="text-[#a14009]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="es. Terrasini"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none"
                  />
                </div>
              </div>

              {/* Address & Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Indirizzo e Civico (opzionale)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="es. Via Roma 18"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Zona / Quartiere
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="es. Centro Storico"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none"
                  />
                </div>
              </div>

              {/* Surface, Status, Estimated Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Superficie (m²)
                  </label>
                  <input
                    type="number"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    placeholder="120"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none font-mono text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Stato immobile
                  </label>
                  <select
                    value={statusState}
                    onChange={(e) => setStatusState(e.target.value)}
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] text-[13px] outline-none"
                  >
                    <option value="">-- Seleziona stato --</option>
                    {PROPERTY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                    Prezzo richiesto dal proprietario (€)
                  </label>
                  <input
                    type="number"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="250000 (opzionale)"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] outline-none font-mono text-[13px]"
                  />
                  <p className="text-[10px] text-[#76777b] mt-1">
                    Prezzo desiderato dal proprietario (opzionale). Non costituisce stima o valutazione.
                  </p>
                </div>
              </div>

              {/* Owner Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase text-[#76777b]">
                    Proprietario (opzionale)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      openNewClientModal({}, (newClient) => {
                        setSelectedOwnerId(newClient.id);
                      });
                    }}
                    className="text-[11px] text-[#a14009] font-bold uppercase hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Crea nuovo cliente
                  </button>
                </div>

                <select
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                  className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] text-[13px] outline-none"
                >
                  <option value="">Nessun proprietario ancora associato</option>
                  {clients.map((c) => {
                    const name = c.entityType === 'azienda' ? `${c.companyName} (Azienda)` : `${c.firstName} ${c.lastName}`;
                    return (
                      <option key={c.id} value={c.id}>
                        {name} · {c.phone}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">
                  Note aggiuntive (opzionale)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dettagli catastali, presenza ascensore, chiavi in agenzia..."
                  className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a] text-[13px] outline-none resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c7c6ca]">
                <button
                  type="button"
                  onClick={closeNewPropertyModal}
                  className="px-4 py-2.5 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] cursor-pointer shadow-sm"
                >
                  Salva immobile
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
