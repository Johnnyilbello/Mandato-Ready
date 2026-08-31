'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { WorkPreferences } from '@/lib/types';
import { DEFAULT_PROPERTY_TAXONOMY } from '@/lib/propertyTaxonomy';

export const ImpostazioniView: React.FC = () => {
  const {
    agencyProfile,
    updateAgencyProfile,
    resetOnboarding,
    resetHints,
  } = useApp();

  // Local Form State
  const [agencyName, setAgencyName] = useState(agencyProfile.agencyName || 'Mandato Ready');
  const [agentName, setAgentName] = useState(agencyProfile.agentName || 'Anna Morante');
  const [phone, setPhone] = useState(agencyProfile.phone || '+39 340 1234567');
  const [email, setEmail] = useState(agencyProfile.email || 'info@agenziamandatoready.it');
  const [city, setCity] = useState(agencyProfile.city || 'Terrasini');
  const [logoInitials, setLogoInitials] = useState(agencyProfile.logoInitials || 'MR');

  // Work Preferences State
  const [enableAmlModule, setEnableAmlModule] = useState(
    agencyProfile.workPreferences?.enableAmlModule ?? true
  );

  const [disabledCategories, setDisabledCategories] = useState<string[]>(
    agencyProfile.workPreferences?.taxonomyConfig?.disabledCategories || []
  );
  const [preferredCategories, setPreferredCategories] = useState<string[]>(
    agencyProfile.workPreferences?.taxonomyConfig?.preferredCategories || []
  );
  const [customCategories, setCustomCategories] = useState<string[]>(
    agencyProfile.workPreferences?.taxonomyConfig?.customCategories || []
  );
  const [newCustomCategory, setNewCustomCategory] = useState('');

  const ALL_PRACTICE_TYPES = [
    'Compravendita residenziale',
    'Locazione residenziale',
    'Immobile commerciale',
    'Nuova costruzione',
    'Valutazione e Incarico',
  ];

  const [selectedPracticeTypes, setSelectedPracticeTypes] = useState<string[]>(
    agencyProfile.workPreferences?.practiceTypes?.length
      ? agencyProfile.workPreferences.practiceTypes
      : ['Compravendita residenziale', 'Locazione residenziale', 'Valutazione e Incarico']
  );

  const ALL_DEFAULT_DOCS = [
    'Atto di Provenienza / Successione',
    'Visura Catastale Aggiornata',
    'Planimetria Catastale Conforme',
    'Attestato Prestazione Energetica (APE)',
    'Certificato di Agibilità / Abitabilità',
    'Conformità Urbanistica ed Edilizia',
    'Ispezione Ipotecaria Pregressa',
    'Regolamento di Condominio e Spese',
  ];

  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    agencyProfile.workPreferences?.defaultDocs?.length
      ? agencyProfile.workPreferences.defaultDocs
      : [
          'Atto di Provenienza / Successione',
          'Visura Catastale Aggiornata',
          'Planimetria Catastale Conforme',
          'Attestato Prestazione Energetica (APE)',
        ]
  );

  // Feedback banner state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [hintResetFeedback, setHintResetFeedback] = useState(false);

  const togglePracticeType = (type: string) => {
    setSelectedPracticeTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleDoc = (doc: string) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const addCustomCategory = () => {
    if (newCustomCategory.trim() && !customCategories.includes(newCustomCategory.trim())) {
      setCustomCategories([...customCategories, newCustomCategory.trim()]);
      setNewCustomCategory('');
    }
  };

  const toggleCategoryEnabled = (cat: string) => {
    setDisabledCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleCategoryPreferred = (cat: string) => {
    setPreferredCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPreferences: WorkPreferences = {
      enableAmlModule,
      practiceTypes: selectedPracticeTypes,
      defaultDocs: selectedDocs,
      taxonomyConfig: {
        disabledCategories,
        preferredCategories,
        customCategories,
      }
    };

    updateAgencyProfile({
      agencyName: agencyName.trim() || 'Mandato Ready',
      agentName: agentName.trim() || 'Referente',
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      logoInitials: logoInitials.trim() || 'MR',
      workPreferences: updatedPreferences,
    });

    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 4000);
  };

  const handleResetHints = () => {
    resetHints();
    setHintResetFeedback(true);
    setTimeout(() => {
      setHintResetFeedback(false);
    }, 3500);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#c7c6ca] gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
            CONFIGURAZIONE APPLICAZIONE
          </div>
          <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a]">
            Impostazioni
          </h1>
          <p className="text-[14px] text-[#46474a] mt-1">
            Gestisci l&apos;identità dell&apos;agenzia, i parametri operativi dei fascicoli e le preferenze d&apos;uso.
          </p>
        </div>

        {/* Primary Save Action */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7] text-[12px] font-semibold animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Modifiche salvate con successo
            </span>
          )}
          <button
            id="btn-save-settings-top"
            onClick={handleSave}
            className="bg-[#1a1c1a] text-white px-6 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Salva modifiche
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        {/* Section 1: Agenzia */}
        <section className="bg-[#faf9f6] border border-[#c7c6ca] p-6 md:p-8">
          <div className="border-b border-[#c7c6ca] pb-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#a14009]">
                SEZIONE 1
              </span>
              <h2 className="text-[20px] md:text-[24px] font-serif-display font-bold text-[#1a1c1a]">
                Agenzia
              </h2>
              <p className="text-[13px] text-[#46474a]">
                Identità dello studio immobiliare e recapiti professionali.
              </p>
            </div>
            {/* Logo Preview */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1a1c1a] text-white flex items-center justify-center font-mono font-bold text-[16px] border border-[#1a1c1a]">
                {logoInitials || 'MR'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[11px] text-[#76777b] uppercase block">Monogramma</span>
                <span className="text-[13px] font-semibold text-[#1a1c1a]">{agencyName}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-1.5">
                Nome Agenzia *
              </label>
              <input
                type="text"
                id="input-agency-name"
                value={agencyName}
                onChange={(e) => {
                  setAgencyName(e.target.value);
                  if (e.target.value.trim().length >= 2 && !logoInitials) {
                    setLogoInitials(e.target.value.substring(0, 2).toUpperCase());
                  }
                }}
                required
                className="w-full bg-[#ffffff] border border-[#c7c6ca] focus:border-[#1a1c1a] p-3 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                placeholder="Es. Studio Immobiliare Terrasini"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-1.5">
                Referente Principale *
              </label>
              <input
                type="text"
                id="input-agent-name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
                className="w-full bg-[#ffffff] border border-[#c7c6ca] focus:border-[#1a1c1a] p-3 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                placeholder="Es. Anna Morante"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-1.5">
                Sigla / Monogramma Logo
              </label>
              <input
                type="text"
                maxLength={3}
                id="input-logo-initials"
                value={logoInitials}
                onChange={(e) => setLogoInitials(e.target.value.toUpperCase())}
                className="w-full bg-[#ffffff] border border-[#c7c6ca] focus:border-[#1a1c1a] p-3 text-[14px] text-[#1a1c1a] outline-none uppercase font-mono transition-colors"
                placeholder="Es. MR"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-1.5">
                Telefono / WhatsApp
              </label>
              <input
                type="tel"
                id="input-agency-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#ffffff] border border-[#c7c6ca] focus:border-[#1a1c1a] p-3 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                placeholder="+39 340 1234567"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-1.5">
                Email Professionale
              </label>
              <input
                type="email"
                id="input-agency-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#ffffff] border border-[#c7c6ca] focus:border-[#1a1c1a] p-3 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                placeholder="info@agenziamandatoready.it"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-1.5">
                Sede / Comune Operativo
              </label>
              <input
                type="text"
                id="input-agency-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#ffffff] border border-[#c7c6ca] focus:border-[#1a1c1a] p-3 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                placeholder="Es. Terrasini (PA)"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Metodo di lavoro */}
        <section className="bg-[#faf9f6] border border-[#c7c6ca] p-6 md:p-8">
          <div className="border-b border-[#c7c6ca] pb-4 mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#a14009]">
              SEZIONE 2
            </span>
            <h2 className="text-[20px] md:text-[24px] font-serif-display font-bold text-[#1a1c1a]">
              Metodo di lavoro
            </h2>
            <p className="text-[13px] text-[#46474a]">
              Standard di fascicolo, tipologie trattate e conformità normativa.
            </p>
          </div>

          <div className="space-y-8">
            {/* AML Toggle */}
            <div className="bg-[#ffffff] border border-[#c7c6ca] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#1a1c1a]">
                    Modulo Antiriciclaggio AML (D.Lgs. 231/2007)
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                      enableAmlModule
                        ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
                        : 'bg-[#efeeeb] text-[#76777b] border-[#c7c6ca]'
                    }`}
                  >
                    {enableAmlModule ? 'Attivo' : 'Disattivato'}
                  </span>
                </div>
                <p className="text-[13px] text-[#46474a] leading-relaxed">
                  Include nei fascicoli la scheda di adeguata verifica, l&apos;identificazione del cliente e il tracciamento del titolare effettivo.
                </p>
              </div>

              <button
                type="button"
                id="btn-toggle-aml"
                onClick={() => setEnableAmlModule(!enableAmlModule)}
                className={`px-5 py-2.5 text-[12px] uppercase font-bold tracking-wider transition-colors cursor-pointer shrink-0 ${
                  enableAmlModule
                    ? 'bg-[#1a1c1a] text-white hover:bg-[#333533]'
                    : 'bg-[#efeeeb] text-[#1a1c1a] border border-[#c7c6ca] hover:bg-[#e3e2e0]'
                }`}
              >
                {enableAmlModule ? 'Disattiva Modulo' : 'Attiva Modulo'}
              </button>
            </div>

            {/* Practice Types */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">
                Tipi di Pratica Gestiti
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_PRACTICE_TYPES.map((type) => {
                  const isChecked = selectedPracticeTypes.includes(type);
                  return (
                    <div
                      key={type}
                      onClick={() => togglePracticeType(type)}
                      className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors select-none ${
                        isChecked
                          ? 'bg-[#ffffff] border-[#1a1c1a] text-[#1a1c1a]'
                          : 'bg-[#faf9f6] border-[#c7c6ca] text-[#76777b] hover:bg-[#f4f3f1]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isChecked ? 'text-[#a14009]' : 'text-[#76777b]'
                        }`}
                      >
                        {isChecked ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className="text-[13px] font-semibold">{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Property Taxonomy */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">
                Tipologie Immobili
              </label>
              <p className="text-[12px] text-[#76777b] mb-3">
                Configura le categorie immobiliari utilizzate dalla tua agenzia.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#ffffff] border border-[#c7c6ca] p-5">
                <div>
                  <h3 className="text-[13px] font-bold text-[#1a1c1a] mb-3">Residenziale</h3>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                    {DEFAULT_PROPERTY_TAXONOMY.residenziale.map(cat => (
                      <div key={cat} className="flex items-center justify-between text-[13px]">
                        <div 
                          className="flex items-center gap-2 cursor-pointer flex-1"
                          onClick={() => toggleCategoryEnabled(cat)}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${!disabledCategories.includes(cat) ? 'text-[#1a1c1a]' : 'text-[#c7c6ca]'}`}>
                            {!disabledCategories.includes(cat) ? 'toggle_on' : 'toggle_off'}
                          </span>
                          <span className={!disabledCategories.includes(cat) ? 'text-[#1a1c1a]' : 'text-[#76777b]'}>{cat}</span>
                        </div>
                        {!disabledCategories.includes(cat) && (
                          <div 
                            className="cursor-pointer px-2 py-1 bg-[#faf9f6] hover:bg-[#efeeeb] border border-[#e6e5e8] rounded text-[11px]"
                            onClick={() => toggleCategoryPreferred(cat)}
                            title="Aggiungi ai Preferiti"
                          >
                            {preferredCategories.includes(cat) ? '⭐ Preferito' : '☆'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#1a1c1a] mb-3">Commerciale & Altro</h3>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                      {[...DEFAULT_PROPERTY_TAXONOMY.commerciale, ...DEFAULT_PROPERTY_TAXONOMY.terreno_altro].map(cat => (
                        <div key={cat} className="flex items-center justify-between text-[13px]">
                          <div 
                            className="flex items-center gap-2 cursor-pointer flex-1"
                            onClick={() => toggleCategoryEnabled(cat)}
                          >
                            <span className={`material-symbols-outlined text-[16px] ${!disabledCategories.includes(cat) ? 'text-[#1a1c1a]' : 'text-[#c7c6ca]'}`}>
                              {!disabledCategories.includes(cat) ? 'toggle_on' : 'toggle_off'}
                            </span>
                            <span className={!disabledCategories.includes(cat) ? 'text-[#1a1c1a]' : 'text-[#76777b]'}>{cat}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-[#1a1c1a] mb-3">Categorie Personalizzate</h3>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={newCustomCategory}
                        onChange={e => setNewCustomCategory(e.target.value)}
                        placeholder="Es. Casa di corte"
                        className="flex-1 bg-[#ffffff] border border-[#c7c6ca] px-3 py-1 text-[13px] focus:border-[#1a1c1a] outline-none"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                      />
                      <button 
                        type="button"
                        onClick={addCustomCategory}
                        className="bg-[#1a1c1a] text-white px-3 py-1 text-[12px] uppercase font-bold"
                      >
                        Aggiungi
                      </button>
                    </div>
                    {customCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customCategories.map(cat => (
                          <div key={cat} className="flex items-center gap-1 bg-[#efeeeb] px-2 py-1 text-[12px] border border-[#e6e5e8]">
                            <span>{cat}</span>
                            <button 
                              type="button"
                              onClick={() => setCustomCategories(prev => prev.filter(c => c !== cat))}
                              className="text-[#76777b] hover:text-[#1a1c1a]"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Default Document Checklist */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">
                Checklist Documenti Predefinita per Nuovi Fascicoli
              </label>
              <p className="text-[12px] text-[#76777b] mb-3">
                I documenti selezionati verranno automaticamente generati come &ldquo;Da recuperare&rdquo; alla creazione di una nuova pratica.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALL_DEFAULT_DOCS.map((doc) => {
                  const isChecked = selectedDocs.includes(doc);
                  return (
                    <div
                      key={doc}
                      onClick={() => toggleDoc(doc)}
                      className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors select-none ${
                        isChecked
                          ? 'bg-[#ffffff] border-[#1a1c1a] text-[#1a1c1a]'
                          : 'bg-[#faf9f6] border-[#c7c6ca] text-[#76777b] hover:bg-[#f4f3f1]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isChecked ? 'text-[#a14009]' : 'text-[#76777b]'
                        }`}
                      >
                        {isChecked ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className="text-[13px] font-medium">{doc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Esperienza */}
        <section className="bg-[#faf9f6] border border-[#c7c6ca] p-6 md:p-8">
          <div className="border-b border-[#c7c6ca] pb-4 mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#a14009]">
              SEZIONE 3
            </span>
            <h2 className="text-[20px] md:text-[24px] font-serif-display font-bold text-[#1a1c1a]">
              Esperienza & Assistenza
            </h2>
            <p className="text-[13px] text-[#46474a]">
              Controlli per l&apos;onboarding guidato e ripristino dei suggerimenti contestuali.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ripeti Onboarding */}
            <div className="p-5 bg-[#ffffff] border border-[#c7c6ca] flex flex-col justify-between">
              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#1a1c1a] mb-1">
                  Ripeti Onboarding Iniziale
                </h3>
                <p className="text-[13px] text-[#46474a] leading-relaxed mb-4">
                  Riapre la procedura guidata in 4 passi per riconfigurare studio, flusso iniziale e modello di lavoro.
                </p>
              </div>
              <button
                type="button"
                id="btn-repeat-onboarding"
                onClick={() => resetOnboarding()}
                className="w-full py-2.5 px-4 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Riavvia Configurazione Onboarding
              </button>
            </div>

            {/* Reset Hints */}
            <div className="p-5 bg-[#ffffff] border border-[#c7c6ca] flex flex-col justify-between">
              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#1a1c1a] mb-1">
                  Ripristina Suggerimenti & Guida
                </h3>
                <p className="text-[13px] text-[#46474a] leading-relaxed mb-4">
                  Riattiva i box informativi contestuali nella vista Oggi, nel Fascicolo Pratica e nel Workspace Documenti.
                </p>
              </div>
              <div>
                {hintResetFeedback && (
                  <div className="mb-2 text-[12px] text-[#1b5e20] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Suggerimenti riattivati!
                  </div>
                )}
                <button
                  type="button"
                  id="btn-reset-hints"
                  onClick={handleResetHints}
                  className="w-full py-2.5 px-4 border border-[#1a1c1a] text-[#1a1c1a] hover:bg-[#1a1c1a] hover:text-white text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">help_outline</span>
                  Mostra Tutti i Suggerimenti
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-[#c7c6ca]">
          <div className="text-[12px] text-[#76777b]">
            Tutte le impostazioni vengono salvate localmente e applicate istantaneamente.
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === 'saved' && (
              <span className="text-[12px] text-[#1b5e20] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Salvate!
              </span>
            )}
            <button
              type="submit"
              id="btn-save-settings-bottom"
              className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salva modifiche
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
