'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Practice, Property } from '@/lib/types';
import { PropertyTypeSelector } from '@/components/common/PropertyTypeSelector';

type WizardStep = 1 | 2 | 3 | 4;
type WizardOrigin = 'opportunity' | 'existing_client' | 'new_client';

const asPracticeType = (value: string): Practice['practiceType'] | null => {
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith('compravendita')) return 'Compravendita';
  if (normalized.startsWith('locazione')) return 'Locazione';
  if (normalized.includes('valutazione') && normalized.includes('incarico')) return 'Valutazione e Incarico';
  return null;
};

export const NuovaPraticaWizard: React.FC = () => {
  const {
    opportunities,
    clients,
    properties,
    agencyProfile,
    wizardPreset,
    setActiveTab,
    setSelectedPracticeId,
    createPracticeFromWizard,
    convertOpportunityToPractice,
    addNewClient,
    addNewProperty,
    updateProperty,
    openPracticeDetail,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<WizardStep>(() => (wizardPreset?.mode ? 2 : 1));
  const [selectedOrigin, setSelectedOrigin] = useState<WizardOrigin>(() => wizardPreset?.mode || 'opportunity');
  const [selectedOppId, setSelectedOppId] = useState(() =>
    wizardPreset?.mode === 'opportunity' && wizardPreset.sourceId ? wizardPreset.sourceId : ''
  );
  const [selectedClientId, setSelectedClientId] = useState(() =>
    wizardPreset?.mode === 'existing_client' && wizardPreset.sourceId ? wizardPreset.sourceId : ''
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropMunicipality, setNewPropMunicipality] = useState('');
  const [newPropType, setNewPropType] = useState('');
  const [newPropSurface, setNewPropSurface] = useState('');

  const configuredPracticeTypes = useMemo<Practice['practiceType'][]>(
    () => {
      const values = agencyProfile.workPreferences.practiceTypes
        .map(asPracticeType)
        .filter((value): value is Practice['practiceType'] => value !== null);
      return [...new Set(values)];
    },
    [agencyProfile.workPreferences.practiceTypes]
  );
  const selectablePracticeTypes: Practice['practiceType'][] = configuredPracticeTypes.length
    ? configuredPracticeTypes
    : ['Compravendita', 'Locazione'];
  const [practiceType, setPracticeType] = useState<Practice['practiceType']>(() =>
    selectablePracticeTypes[0] || 'Compravendita'
  );
  const [availableDocs, setAvailableDocs] = useState<string[]>([]);
  const [createdPractice, setCreatedPractice] = useState<Practice | null>(null);
  const [formError, setFormError] = useState('');

  const selectableProperties = useMemo(
    () => selectedClientId
      ? properties.filter((property) => property.owners.length === 0 || property.owners.includes(selectedClientId))
      : [],
    [properties, selectedClientId]
  );

  const checklist = agencyProfile.workPreferences.defaultDocs;

  const toggleDoc = (label: string) => {
    setAvailableDocs((previous) =>
      previous.includes(label) ? previous.filter((item) => item !== label) : [...previous, label]
    );
  };

  const returnToPractices = () => {
    setSelectedPracticeId(null);
    setActiveTab('pratiche');
  };

  const goBack = () => {
    setFormError('');
    if (currentStep === 3) return setCurrentStep(2);
    if (currentStep === 2 && !wizardPreset?.mode) return setCurrentStep(1);
    returnToPractices();
  };

  const validateSubjects = () => {
    if (selectedOrigin === 'opportunity') return selectedOppId ? '' : 'Seleziona un’opportunità.';
    if (selectedOrigin === 'existing_client') {
      if (!selectedClientId) return 'Seleziona un cliente esistente.';
      if (!selectedPropertyId) return 'Seleziona un immobile esistente.';
      return '';
    }
    if (!newClientFirstName.trim()) return 'Inserisci il nome del cliente.';
    if (!newClientLastName.trim()) return 'Inserisci il cognome del cliente.';
    if (!newClientPhone.trim()) return 'Inserisci telefono o WhatsApp del cliente.';
    if (!newClientEmail.trim()) return 'Inserisci l’email del cliente.';
    if (!newPropType.trim()) return 'Seleziona la tipologia dell’immobile.';
    if (!newPropMunicipality.trim()) return 'Inserisci il comune dell’immobile.';
    if (newPropSurface.trim() && Number(newPropSurface) <= 0) return 'La superficie, se indicata, deve essere maggiore di zero.';
    return '';
  };

  const continueToDetails = () => {
    const error = validateSubjects();
    if (error) return setFormError(error);
    setFormError('');
    setCurrentStep(3);
  };

  const resolveExistingProperty = (): Property | undefined => {
    const property = properties.find((item) => item.id === selectedPropertyId);
    if (!property) return undefined;
    if (property.owners.includes(selectedClientId)) return property;
    if (property.owners.length > 0) return undefined;
    return updateProperty(property.id, { owners: [selectedClientId] });
  };

  const handleFinalize = () => {
    const validationError = validateSubjects();
    if (validationError) {
      setFormError(validationError);
      setCurrentStep(2);
      return;
    }

    try {
      let practice: Practice | undefined;

      if (selectedOrigin === 'opportunity') {
        practice = convertOpportunityToPractice(selectedOppId);
      } else if (selectedOrigin === 'existing_client') {
        const client = clients.find((item) => item.id === selectedClientId);
        const property = resolveExistingProperty();
        if (!client || !property) {
          setFormError('Cliente o immobile non sono più disponibili o risultano collegati a un altro proprietario.');
          setCurrentStep(2);
          return;
        }
        practice = createPracticeFromWizard({
          client,
          property,
          practiceType,
          availableDocLabels: availableDocs,
        });
      } else {
        const client = addNewClient({
          firstName: newClientFirstName.trim(),
          lastName: newClientLastName.trim(),
          phone: newClientPhone.trim(),
          email: newClientEmail.trim(),
          type: 'seller',
          city: newPropMunicipality.trim(),
          address: newPropAddress.trim() || undefined,
        });
        const property = addNewProperty({
          address: newPropAddress.trim(),
          municipality: newPropMunicipality.trim(),
          province: '',
          type: newPropType.trim(),
          approximateSurface: newPropSurface.trim() ? Number(newPropSurface) : undefined,
          owners: [client.id],
        });
        practice = createPracticeFromWizard({
          client,
          property,
          practiceType,
          availableDocLabels: availableDocs,
        });
      }

      if (!practice) {
        setFormError('Impossibile creare la pratica con i dati selezionati.');
        return;
      }
      setCreatedPractice(practice);
      setFormError('');
      setCurrentStep(4);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Errore durante la creazione della pratica.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] flex flex-col font-sans min-w-0">
      <header className="flex justify-between items-center gap-3 py-5 px-4 sm:px-6 md:px-16 border-b border-[#c7c6ca] bg-[#faf9f6] sticky top-0 z-30 min-w-0">
        <button onClick={goBack} className="flex items-center gap-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:text-[#a14009] min-w-0">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Indietro</span>
        </button>
        <h1 className="text-[13px] sm:text-[16px] font-bold tracking-widest uppercase font-serif-display text-center min-w-0">NUOVA PRATICA</h1>
        <button onClick={returnToPractices} className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-[#76777b] hover:text-[#ba1a1a]">Annulla</button>
      </header>

      <main className="flex-1 flex flex-col items-center py-8 md:py-14 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto w-full min-w-0">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 select-none w-full max-w-md min-w-0" aria-label="Avanzamento procedura">
          {[
            { step: 1 as const, label: 'Origine' },
            { step: 2 as const, label: 'Soggetti' },
            { step: 3 as const, label: 'Dettagli' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              {index > 0 && <div className="flex-1 max-w-12 h-px bg-[#c7c6ca] mb-4" />}
              <div className={`flex flex-col items-center gap-1.5 ${currentStep < item.step ? 'opacity-40' : ''}`}>
                <div className={`w-7 h-7 flex items-center justify-center text-[12px] font-bold ${currentStep >= item.step ? 'bg-[#1a1c1a] text-white' : 'border border-[#c7c6ca] text-[#76777b]'}`}>{item.step}</div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest">{item.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {formError && <div role="alert" className="w-full max-w-2xl mb-5 border border-[#ba1a1a] bg-[#fff3f1] px-4 py-3 text-[13px] text-[#7a1b12]">{formError}</div>}

        {currentStep === 1 && (
          <section className="w-full max-w-2xl space-y-4" data-testid="practice-origin-step">
            <h2 className="text-[28px] md:text-[34px] font-serif-display font-bold text-center mb-8">Da dove vuoi iniziare?</h2>
            {[
              { origin: 'opportunity' as const, icon: 'analytics', title: 'Da un’opportunità Mandato Ready', description: 'Riusa Cliente, Immobile e informazioni già presenti.' },
              { origin: 'existing_client' as const, icon: 'groups', title: 'Da un cliente esistente', description: 'Collega record Cliente e Immobile già censiti.' },
              { origin: 'new_client' as const, icon: 'person_add', title: 'Da un nuovo cliente', description: 'Crea i record minimi senza inventare dati mancanti.' },
            ].map((item) => (
              <button key={item.origin} onClick={() => { setSelectedOrigin(item.origin); setFormError(''); setCurrentStep(2); }} className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] text-left min-w-0">
                <span className="flex gap-4 items-start min-w-0">
                  <span className="w-11 h-11 flex shrink-0 items-center justify-center border border-[#c7c6ca] bg-[#f4f3f1]"><span className="material-symbols-outlined text-[22px]">{item.icon}</span></span>
                  <span className="min-w-0"><strong className="block text-[17px] font-serif-display break-words">{item.title}</strong><span className="block text-[13px] text-[#46474a] mt-1 break-words">{item.description}</span></span>
                </span>
                <span className="material-symbols-outlined text-[#76777b] shrink-0">arrow_forward</span>
              </button>
            ))}
          </section>
        )}

        {currentStep === 2 && (
          <section className="w-full max-w-2xl space-y-6" data-testid="practice-subjects-step">
            <h2 className="text-[27px] font-serif-display font-bold text-center">
              {selectedOrigin === 'opportunity' ? 'Seleziona l’opportunità' : selectedOrigin === 'existing_client' ? 'Seleziona Cliente e Immobile' : 'Dati essenziali'}
            </h2>

            {selectedOrigin === 'opportunity' && (
              <div className="space-y-3">
                {opportunities.filter((item) => item.status === 'active').map((opportunity) => {
                  const client = clients.find((item) => item.id === opportunity.clientId);
                  const property = properties.find((item) => item.id === opportunity.propertyId);
                  return (
                    <button key={opportunity.id} type="button" onClick={() => setSelectedOppId(opportunity.id)} className={`w-full p-4 sm:p-5 border text-left flex justify-between gap-4 min-w-0 ${selectedOppId === opportunity.id ? 'border-2 border-[#1a1c1a] bg-[#ffdbcd]/30' : 'border-[#c7c6ca] hover:bg-[#f4f3f1]'}`}>
                      <span className="min-w-0"><strong className="block break-words">{client ? `${client.firstName} ${client.lastName}` : 'Cliente non disponibile'}</strong><span className="text-[13px] text-[#46474a] break-words">{property ? `${property.address || 'Indirizzo da definire'} · ${property.municipality} · ${property.type}` : 'Immobile non disponibile'}</span></span>
                      <span className="text-[11px] font-mono shrink-0">{opportunity.priority}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedOrigin === 'existing_client' && (
              <div className="space-y-4">
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#76777b]">
                  Cliente registrato
                  <select data-testid="existing-client-select" value={selectedClientId} onChange={(event) => { setSelectedClientId(event.target.value); setSelectedPropertyId(''); }} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white text-[#1a1c1a] normal-case font-normal">
                    <option value="">-- Seleziona un cliente --</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.firstName} {client.lastName} · {client.phone}</option>)}
                  </select>
                </label>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#76777b]">
                  Immobile condiviso
                  <select data-testid="existing-property-select" value={selectedPropertyId} onChange={(event) => setSelectedPropertyId(event.target.value)} disabled={!selectedClientId} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white text-[#1a1c1a] normal-case font-normal disabled:opacity-50">
                    <option value="">-- Seleziona immobile --</option>
                    {selectableProperties.map((property) => <option key={property.id} value={property.id}>{property.address || 'Indirizzo da definire'} · {property.municipality} · {property.type}{property.owners.length === 0 ? ' · senza proprietario' : ''}</option>)}
                  </select>
                </label>
                {selectedClientId && selectableProperties.length === 0 && <p className="text-[12px] text-[#76777b]">Non ci sono immobili compatibili: crea prima un Immobile condiviso oppure usa il flusso “Nuovo cliente”.</p>}
              </div>
            )}

            {selectedOrigin === 'new_client' && (
              <div className="space-y-6 bg-[#f4f3f1] p-4 sm:p-6 border border-[#c7c6ca] min-w-0">
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-[#c7c6ca] pb-2 mb-4">Cliente</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input data-testid="new-client-first-name" aria-label="Nome" placeholder="Nome *" value={newClientFirstName} onChange={(event) => setNewClientFirstName(event.target.value)} className="p-3 border border-[#c7c6ca] bg-white min-w-0" />
                    <input data-testid="new-client-last-name" aria-label="Cognome" placeholder="Cognome *" value={newClientLastName} onChange={(event) => setNewClientLastName(event.target.value)} className="p-3 border border-[#c7c6ca] bg-white min-w-0" />
                    <input data-testid="new-client-phone" aria-label="Telefono o WhatsApp" placeholder="Telefono / WhatsApp *" value={newClientPhone} onChange={(event) => setNewClientPhone(event.target.value)} className="p-3 border border-[#c7c6ca] bg-white min-w-0" />
                    <input data-testid="new-client-email" aria-label="Email" type="email" placeholder="Email *" value={newClientEmail} onChange={(event) => setNewClientEmail(event.target.value)} className="p-3 border border-[#c7c6ca] bg-white min-w-0" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-[#c7c6ca] pb-2 mb-4">Immobile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                    <div className="min-w-0"><label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Tipologia *</label><PropertyTypeSelector value={newPropType} onChange={setNewPropType} /></div>
                    <input data-testid="new-property-municipality" aria-label="Comune" placeholder="Comune *" value={newPropMunicipality} onChange={(event) => setNewPropMunicipality(event.target.value)} className="p-3 border border-[#c7c6ca] bg-white min-w-0 self-end" />
                    <input data-testid="new-property-address" aria-label="Indirizzo" placeholder="Indirizzo (opzionale)" value={newPropAddress} onChange={(event) => setNewPropAddress(event.target.value)} className="p-3 border border-[#c7c6ca] bg-white min-w-0" />
                    <input data-testid="new-property-surface" aria-label="Superficie" type="number" min="1" placeholder="Superficie m² (opzionale)" value={newPropSurface} onChange={(event) => setNewPropSurface(event.target.value)} className="p-3 border border-[#c7c6ca] bg-white min-w-0" />
                  </div>
                  <p className="text-[11px] text-[#76777b] mt-3">Nessun indirizzo, prezzo o dato tecnico viene inventato se non lo inserisci.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-5 border-t border-[#c7c6ca]">
              <button onClick={() => wizardPreset?.mode ? returnToPractices() : setCurrentStep(1)} className="px-6 py-2.5 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0]">Indietro</button>
              <button data-testid="continue-practice-details" onClick={continueToDetails} className="px-8 py-2.5 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533]">Avanti: dettagli</button>
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="w-full max-w-2xl space-y-6" data-testid="practice-details-step">
            <h2 className="text-[27px] font-serif-display font-bold text-center">Configura fascicolo operativo</h2>
            <div className="border border-[#c7c6ca] p-4 sm:p-6 space-y-6 min-w-0">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] block mb-2">Tipo di pratica</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectablePracticeTypes.map((type) => (
                    <button key={type} type="button" onClick={() => setPracticeType(type)} className={`p-3 border text-[12px] font-bold uppercase tracking-wider break-words ${practiceType === type ? 'border-[#a14009] bg-[#ffdbcd] text-[#6a2500]' : 'border-[#c7c6ca] bg-white'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] block mb-2">Documenti già disponibili</span>
                <div className="space-y-2">
                  {checklist.map((label) => (
                    <button key={label} type="button" onClick={() => toggleDoc(label)} className="w-full flex items-center gap-3 p-3 border border-[#c7c6ca] bg-white text-left min-w-0">
                      <span className={`material-symbols-outlined text-[20px] shrink-0 ${availableDocs.includes(label) ? 'text-[#a14009]' : 'text-[#76777b]'}`}>{availableDocs.includes(label) ? 'check_box' : 'check_box_outline_blank'}</span>
                      <span className="text-[13px] break-words min-w-0">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-5 border-t border-[#c7c6ca]">
              <button onClick={() => setCurrentStep(2)} className="px-6 py-2.5 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider">Indietro</button>
              <button data-testid="create-practice" onClick={handleFinalize} className="px-8 py-3 bg-[#a14009] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#7d2d00]">Crea pratica</button>
            </div>
          </section>
        )}

        {currentStep === 4 && createdPractice && (
          <section className="w-full max-w-2xl" data-testid="practice-success">
            <div className="border-2 border-[#1a1c1a] p-5 sm:p-8 min-w-0">
              <div className="text-center mb-7 pb-6 border-b border-[#c7c6ca]">
                <div className="w-12 h-12 bg-[#1a1c1a] text-white flex items-center justify-center mx-auto mb-3"><span className="material-symbols-outlined text-[28px]">task_alt</span></div>
                <h2 className="text-[27px] font-serif-display font-bold">Pratica creata</h2>
                <p className="text-[13px] text-[#46474a] mt-2 break-words" data-testid="created-practice-id">{createdPractice.code} · {createdPractice.id}</p>
              </div>
              <div className="space-y-4 mb-7">
                <div className="border border-[#c7c6ca] bg-[#f4f3f1] p-4 min-w-0">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2">Collegamenti condivisi</h3>
                  <p className="text-[13px] text-[#46474a] break-all">Cliente: {createdPractice.clientId}</p>
                  <p className="text-[13px] text-[#46474a] break-all">Immobile: {createdPractice.propertyId}</p>
                </div>
                <div className="border-2 border-[#a14009] bg-[#ffdbcd]/20 p-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-1">Prossimo passo</h3>
                  <p className="text-[14px]">Apri la pratica e completa l’incarico usando i dati già collegati.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button data-testid="back-to-practices" onClick={returnToPractices} className="border border-[#1a1c1a] py-3 text-[12px] uppercase font-bold tracking-widest">Torna alle pratiche</button>
                <button data-testid="open-created-practice" onClick={() => openPracticeDetail(createdPractice.id)} className="bg-[#1a1c1a] text-white py-3 text-[12px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">Apri pratica <span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
