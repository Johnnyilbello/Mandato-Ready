'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Practice } from '@/lib/types';
import { PropertyTypeSelector } from '@/components/common/PropertyTypeSelector';

export const NuovaPraticaWizard: React.FC = () => {
  const {
    opportunities,
    clients,
    properties,
    wizardPreset,
    setActiveTab,
    createPracticeFromWizard,
    convertOpportunityToPractice,
    addNewClient,
    addNewProperty,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(() => (wizardPreset?.mode ? 2 : 1));
  const [selectedOrigin, setSelectedOrigin] = useState<'opportunity' | 'existing_client' | 'new_client'>(
    () => wizardPreset?.mode || 'opportunity'
  );

  // Step 2 & 3 state
  const [selectedOppId, setSelectedOppId] = useState<string>(() =>
    wizardPreset?.mode === 'opportunity' && wizardPreset.sourceId ? wizardPreset.sourceId : ''
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(() =>
    wizardPreset?.mode === 'existing_client' && wizardPreset.sourceId ? wizardPreset.sourceId : ''
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // New Client & Property form
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropMunicipality, setNewPropMunicipality] = useState('Terrasini');
  const [newPropType, setNewPropType] = useState<string>('Appartamento');
  const [newPropSurface, setNewPropSurface] = useState<number>(100);
  const [newPropPrice, setNewPropPrice] = useState<number>(250000);

  // Step 3 Practice Details
  const [practiceType, setPracticeType] = useState<Practice['practiceType']>('Compravendita');
  const [availableDocs, setAvailableDocs] = useState<string[]>(['Carta identità', 'Planimetria']);

  // Completion state
  const [createdPracticeId, setCreatedPracticeId] = useState<string | null>(null);

  // Handle document toggle
  const toggleDoc = (docLabel: string) => {
    setAvailableDocs((prev) =>
      prev.includes(docLabel) ? prev.filter((d) => d !== docLabel) : [...prev, docLabel]
    );
  };

  // Complete Creation
  const handleFinalize = () => {
    if (selectedOrigin === 'opportunity' && selectedOppId) {
      const practiceId = convertOpportunityToPractice(selectedOppId);
      setCreatedPracticeId(practiceId);
      setCurrentStep(4);
      return;
    }

    let finalClientId = selectedClientId;
    let finalPropertyId = selectedPropertyId;

    if (selectedOrigin === 'new_client') {
      const createdClient = addNewClient({
        firstName: newClientFirstName || 'Cliente',
        lastName: newClientLastName || 'Nuovo',
        phone: newClientPhone || '+39 333 0000000',
        email: newClientEmail || 'cliente@email.it',
        type: 'seller',
        city: newPropMunicipality,
        address: newPropAddress,
      });
      finalClientId = createdClient.id;

      const createdProp = addNewProperty({
        address: newPropAddress || 'Via Roma 1',
        municipality: newPropMunicipality,
        province: 'PA',
        type: newPropType,
        approximateSurface: Number(newPropSurface) || 100,
        estimatedValue: Number(newPropPrice) || 250000,
        owners: [finalClientId],
      });
      finalPropertyId = createdProp.id;
    } else if (selectedOrigin === 'existing_client') {
      if (!finalPropertyId) {
        const clientProps = properties.filter((p) => p.owners.includes(finalClientId));
        if (clientProps.length > 0) {
          finalPropertyId = clientProps[0].id;
        } else {
          const createdProp = addNewProperty({
            address: 'Via Principale 1',
            municipality: 'Terrasini',
            province: 'PA',
            type: 'Appartamento',
            approximateSurface: 100,
            owners: [finalClientId],
          });
          finalPropertyId = createdProp.id;
        }
      }
    }

    const practiceId = createPracticeFromWizard({
      clientId: finalClientId,
      propertyId: finalPropertyId,
      practiceType,
      availableDocLabels: availableDocs,
    });

    setCreatedPracticeId(practiceId);
    setCurrentStep(4);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] flex flex-col font-sans">
      {/* Transactional Header matching Stitch Image 1 */}
      <header className="flex justify-between items-center py-5 px-6 md:px-16 border-b border-[#c7c6ca] bg-[#faf9f6] sticky top-0 z-30">
        <button
          onClick={() => {
            if (currentStep > 1 && currentStep < 4) setCurrentStep((prev) => (prev - 1) as any);
            else setActiveTab('pratiche');
          }}
          className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#1a1c1a] hover:text-[#a14009] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Indietro
        </button>

        <h1 className="text-[16px] font-bold tracking-widest uppercase text-[#1a1c1a] font-serif-display">
          NUOVA PRATICA
        </h1>

        <button
          onClick={() => setActiveTab('pratiche')}
          className="text-[12px] font-bold uppercase tracking-widest text-[#76777b] hover:text-[#ba1a1a] transition-colors cursor-pointer"
        >
          Annulla
        </button>
      </header>

      {/* Main Guided Canvas */}
      <main className="flex-1 flex flex-col items-center py-10 md:py-16 px-6 md:px-12 max-w-4xl mx-auto w-full">
        {/* Step Indicator (Architectural style) */}
        <div className="flex items-center justify-center gap-4 mb-12 select-none w-full max-w-md">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 flex items-center justify-center text-[12px] font-bold ${
                currentStep >= 1 ? 'bg-[#1a1c1a] text-white' : 'border border-[#c7c6ca] text-[#76777b]'
              }`}
            >
              1
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1c1a]">Origine</span>
          </div>

          <div className="w-12 h-px bg-[#c7c6ca] mb-4"></div>

          <div className={`flex flex-col items-center gap-1.5 ${currentStep < 2 ? 'opacity-40' : ''}`}>
            <div
              className={`w-7 h-7 flex items-center justify-center text-[12px] font-bold ${
                currentStep >= 2 ? 'bg-[#1a1c1a] text-white' : 'border border-[#c7c6ca] text-[#76777b]'
              }`}
            >
              2
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1c1a]">Soggetti</span>
          </div>

          <div className="w-12 h-px bg-[#c7c6ca] mb-4"></div>

          <div className={`flex flex-col items-center gap-1.5 ${currentStep < 3 ? 'opacity-40' : ''}`}>
            <div
              className={`w-7 h-7 flex items-center justify-center text-[12px] font-bold ${
                currentStep >= 3 ? 'bg-[#1a1c1a] text-white' : 'border border-[#c7c6ca] text-[#76777b]'
              }`}
            >
              3
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1c1a]">Dettagli</span>
          </div>
        </div>

        {/* STEP 1: ORIGINE */}
        {currentStep === 1 && (
          <div className="w-full max-w-2xl animate-in fade-in">
            <h2 className="text-[28px] md:text-[34px] font-serif-display font-bold text-center text-[#1a1c1a] mb-8">
              Da dove vuoi iniziare?
            </h2>

            <div className="flex flex-col gap-4">
              {/* Option 1 */}
              <button
                onClick={() => {
                  setSelectedOrigin('opportunity');
                  setCurrentStep(2);
                }}
                className="w-full flex items-center justify-between p-6 border border-[#c7c6ca] bg-[#faf9f6] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] transition-all text-left group cursor-pointer"
              >
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 flex shrink-0 items-center justify-center border border-[#c7c6ca] bg-[#f4f3f1] group-hover:bg-[#1a1c1a] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">analytics</span>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[#1a1c1a] font-serif-display">
                      Da un&apos;opportunità Mandato Ready
                    </h3>
                    <p className="text-[14px] text-[#46474a] mt-1">
                      Recupera i dati da una trattativa già avviata nel sistema.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#76777b] group-hover:text-[#1a1c1a] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </button>

              {/* Option 2 */}
              <button
                onClick={() => {
                  setSelectedOrigin('existing_client');
                  setCurrentStep(2);
                }}
                className="w-full flex items-center justify-between p-6 border border-[#c7c6ca] bg-[#faf9f6] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] transition-all text-left group cursor-pointer"
              >
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 flex shrink-0 items-center justify-center border border-[#c7c6ca] bg-[#f4f3f1] group-hover:bg-[#1a1c1a] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">groups</span>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[#1a1c1a] font-serif-display">
                      Da un cliente esistente
                    </h3>
                    <p className="text-[14px] text-[#46474a] mt-1">
                      Seleziona un cliente già censito per una nuova operazione.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#76777b] group-hover:text-[#1a1c1a] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </button>

              {/* Option 3 */}
              <button
                onClick={() => {
                  setSelectedOrigin('new_client');
                  setCurrentStep(2);
                }}
                className="w-full flex items-center justify-between p-6 border border-[#c7c6ca] bg-[#faf9f6] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] transition-all text-left group cursor-pointer"
              >
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 flex shrink-0 items-center justify-center border border-[#c7c6ca] bg-[#f4f3f1] group-hover:bg-[#1a1c1a] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">person_add</span>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[#1a1c1a] font-serif-display">
                      Da un nuovo cliente
                    </h3>
                    <p className="text-[14px] text-[#46474a] mt-1">
                      Inserisci i dati per un cliente mai censito prima d&apos;ora.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#76777b] group-hover:text-[#1a1c1a] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SOGGETTI */}
        {currentStep === 2 && (
          <div className="w-full max-w-2xl animate-in fade-in space-y-6">
            <h2 className="text-[28px] font-serif-display font-bold text-center text-[#1a1c1a]">
              {selectedOrigin === 'opportunity'
                ? 'Seleziona l\'opportunità di provenienza'
                : selectedOrigin === 'existing_client'
                ? 'Seleziona cliente e immobile'
                : 'Inserisci i dati essenziali'}
            </h2>

            {/* If Origin: Opportunity */}
            {selectedOrigin === 'opportunity' && (
              <div className="space-y-3">
                {opportunities.map((opp) => {
                  const cl = clients.find((c) => c.id === opp.clientId);
                  const pr = properties.find((p) => p.id === opp.propertyId);
                  const isSelected = selectedOppId === opp.id;

                  return (
                    <div
                      key={opp.id}
                      onClick={() => setSelectedOppId(opp.id)}
                      className={`p-5 border transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? 'border-2 border-[#1a1c1a] bg-[#ffdbcd]/30'
                          : 'border-[#c7c6ca] bg-[#faf9f6] hover:bg-[#f4f3f1]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#efeeeb] px-2 py-0.5 border border-[#c7c6ca]">
                            {opp.priority}
                          </span>
                          <span className="text-[12px] font-mono text-[#76777b]">
                            Readiness: {opp.readiness}/100
                          </span>
                        </div>
                        <h4 className="text-[16px] font-bold text-[#1a1c1a]">
                          {cl?.firstName} {cl?.lastName}
                        </h4>
                        <p className="text-[13px] text-[#46474a]">
                          {pr?.address} · {pr?.municipality} ({pr?.type})
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#1a1c1a] bg-[#1a1c1a]' : 'border-[#c7c6ca]'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* If Origin: Existing Client */}
            {selectedOrigin === 'existing_client' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] block mb-2">
                    Cliente Registrato
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      const cp = properties.find((p) => p.owners.includes(e.target.value));
                      if (cp) setSelectedPropertyId(cp.id);
                    }}
                    className="w-full p-3 border border-[#c7c6ca] bg-white text-[#1a1c1a] text-[14px]"
                  >
                    <option value="">-- Seleziona un cliente --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.city || 'Sicilia'}) - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClientId && (
                  <div>
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] block mb-2">
                      Immobile Associato
                    </label>
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full p-3 border border-[#c7c6ca] bg-white text-[#1a1c1a] text-[14px]"
                    >
                      <option value="">-- Seleziona immobile --</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.address}, {p.municipality} ({p.type} ~{p.approximateSurface}m²)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* If Origin: New Client */}
            {selectedOrigin === 'new_client' && (
              <div className="space-y-4 bg-[#f4f3f1] p-6 border border-[#c7c6ca]">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#1a1c1a] border-b border-[#c7c6ca] pb-2">
                  Dati Proprietario
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Nome</label>
                    <input
                      type="text"
                      placeholder="es. Mario"
                      value={newClientFirstName}
                      onChange={(e) => setNewClientFirstName(e.target.value)}
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Cognome</label>
                    <input
                      type="text"
                      placeholder="es. Draghi"
                      value={newClientLastName}
                      onChange={(e) => setNewClientLastName(e.target.value)}
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Telefono</label>
                    <input
                      type="text"
                      placeholder="+39 340 ..."
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="cliente@email.it"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[14px]"
                    />
                  </div>
                </div>

                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#1a1c1a] border-b border-[#c7c6ca] pb-2 pt-4">
                  Dati Immobile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Indirizzo</label>
                    <input
                      type="text"
                      placeholder="es. Via Roma 15"
                      value={newPropAddress}
                      onChange={(e) => setNewPropAddress(e.target.value)}
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Comune</label>
                    <select
                      value={newPropMunicipality}
                      onChange={(e) => setNewPropMunicipality(e.target.value)}
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[14px]"
                    >
                      <option value="Terrasini">Terrasini</option>
                      <option value="Cinisi">Cinisi</option>
                      <option value="Palermo">Palermo</option>
                      <option value="Monreale">Monreale</option>
                    </select>
                  </div>
                  <div className="z-20 relative">
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Tipologia</label>
                    <PropertyTypeSelector value={newPropType} onChange={setNewPropType} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#76777b] block mb-1">Superficie (m²)</label>
                    <input
                      type="number"
                      value={newPropSurface}
                      onChange={(e) => setNewPropSurface(Number(e.target.value))}
                      className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[14px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Forward Action */}
            <div className="flex justify-between pt-6 border-t border-[#c7c6ca]">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2.5 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] cursor-pointer"
              >
                Indietro
              </button>
              <button
                onClick={() => {
                  if (selectedOrigin === 'opportunity' && !selectedOppId) {
                    if (opportunities.length > 0) setSelectedOppId(opportunities[0].id);
                  }
                  setCurrentStep(3);
                }}
                className="px-8 py-2.5 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] cursor-pointer"
              >
                Avanti: Dettagli
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DETTAGLI & DOCUMENTI DISPONIBILI */}
        {currentStep === 3 && (
          <div className="w-full max-w-2xl animate-in fade-in space-y-6">
            <h2 className="text-[28px] font-serif-display font-bold text-center text-[#1a1c1a]">
              Configura Fascicolo Operativo
            </h2>

            <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 space-y-6">
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] block mb-2">
                  Tipo di Pratica
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Compravendita', 'Locazione', 'Valutazione e Incarico'] as Practice['practiceType'][]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPracticeType(t)}
                      className={`p-3 border text-[13px] font-bold uppercase tracking-wider text-center cursor-pointer transition-colors ${
                        practiceType === t
                          ? 'border-[#a14009] bg-[#ffdbcd] text-[#6a2500]'
                          : 'border-[#c7c6ca] bg-white text-[#1a1c1a] hover:bg-[#f4f3f1]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] block mb-2">
                  Documenti attualmente disponibili (spunta quelli già in possesso)
                </label>
                <div className="space-y-2.5">
                  {[
                    'Carta identità',
                    'Codice Fiscale',
                    'Atto di provenienza',
                    'Planimetria catastale',
                    'APE (Attestato Prestazione Energetica)',
                    'Visura ipotecaria',
                  ].map((docLabel) => {
                    const isChecked = availableDocs.includes(docLabel);
                    return (
                      <div
                        key={docLabel}
                        onClick={() => toggleDoc(docLabel)}
                        className="flex items-center gap-3 p-3 border border-[#c7c6ca] bg-white hover:bg-[#f4f3f1] cursor-pointer transition-colors"
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isChecked ? 'text-[#a14009]' : 'text-[#76777b]'
                          }`}
                        >
                          {isChecked ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span className="text-[14px] text-[#1a1c1a]">{docLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-[#c7c6ca]">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] cursor-pointer"
              >
                Indietro
              </button>
              <button
                onClick={handleFinalize}
                className="px-8 py-3 bg-[#a14009] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#7d2d00] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Genera e inizializza pratica</span>
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY - PRATICA PRONTA PER INIZIARE */}
        {currentStep === 4 && (
          <div className="w-full max-w-2xl animate-in fade-in space-y-6">
            <div className="bg-[#faf9f6] border-2 border-[#1a1c1a] p-8">
              <div className="text-center mb-8 pb-6 border-b border-[#c7c6ca]">
                <div className="w-12 h-12 bg-[#1a1c1a] text-white flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[28px]">task_alt</span>
                </div>
                <h2 className="text-[28px] font-serif-display font-bold text-[#1a1c1a]">
                  Pratica pronta per iniziare
                </h2>
                <p className="text-[14px] text-[#46474a] mt-1">
                  Fascicolo operativo inizializzato con successo. Tutti i dati sono stati allineati.
                </p>
              </div>

              {/* Sections: Hai già, Manca, Prossimo passo */}
              <div className="space-y-6 mb-8">
                {/* Hai già */}
                <div className="border border-[#c7c6ca] bg-[#f4f3f1] p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1a1c1a] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#a14009]">check_circle</span>
                    Hai già
                  </h4>
                  <ul className="text-[13px] text-[#46474a] space-y-1 pl-6 list-disc">
                    <li>Anagrafica venditore e contatti allineati</li>
                    <li>Scheda tecnica immobile e stima indicativa</li>
                    <li>Documenti anagrafici e preliminari registrati</li>
                  </ul>
                </div>

                {/* Manca */}
                <div className="border border-[#c7c6ca] bg-[#faf9f6] p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#76777b]">pending</span>
                    Manca
                  </h4>
                  <ul className="text-[13px] text-[#76777b] space-y-1 pl-6 list-disc">
                    <li>Firma del mandato di vendita in esclusiva</li>
                    <li>Completamento verifica antiriciclaggio (AML)</li>
                  </ul>
                </div>

                {/* Prossimo passo */}
                <div className="border-2 border-[#a14009] bg-[#ffdbcd]/20 p-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Prossimo passo
                  </h4>
                  <p className="text-[14px] font-medium text-[#1a1c1a]">
                    Apri il fascicolo per verificare la documentazione e avviare la procedura di firma dell&apos;incarico.
                  </p>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => {
                  setActiveTab('pratiche');
                }}
                className="w-full bg-[#1a1c1a] text-white py-4 text-[13px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Apri pratica</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
