'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { StartChoice } from '@/lib/types';

interface OnboardingWizardProps {
  onDismiss?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onDismiss }) => {
  const {
    onboardingDraft,
    updateOnboardingDraft,
    completeOnboarding,
    agencyProfile,
  } = useApp();

  const [step, setStep] = useState<0 | 1 | 2 | 3>(
    typeof onboardingDraft.step === 'number' ? (onboardingDraft.step as 0 | 1 | 2 | 3) : 0
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Draft local state synced with context
  const [agencyName, setAgencyName] = useState(onboardingDraft.agencyName || agencyProfile.agencyName || '');
  const [agentName, setAgentName] = useState(onboardingDraft.agentName || agencyProfile.agentName || '');
  const [phone, setPhone] = useState(onboardingDraft.phone || agencyProfile.phone || '');
  const [email, setEmail] = useState(onboardingDraft.email || agencyProfile.email || '');
  const [city, setCity] = useState(onboardingDraft.city || agencyProfile.city || 'Milano');
  const [startChoice, setStartChoice] = useState<StartChoice | null>(onboardingDraft.startChoice || 'explore_demo');

  // Sync draft on field updates
  const syncDraft = (newStep?: 0 | 1 | 2 | 3) => {
    updateOnboardingDraft({
      step: newStep !== undefined ? newStep : step,
      agencyName,
      agentName,
      phone,
      email,
      city,
      startChoice,
    });
  };

  // Step 2: Validate and continue to choice
  const handleAgencyNext = () => {
    if (!agencyName.trim()) {
      setFormError('Inserisci il nome della tua agenzia o studio per continuare.');
      return;
    }
    if (!agentName.trim()) {
      setFormError('Inserisci il nome del referente principale.');
      return;
    }
    setFormError(null);
    syncDraft(3);
    setStep(3);
  };

  const handleAgencySkip = () => {
    const fallbackAgency = agencyName.trim() || 'Studio Immobiliare Duomo';
    const fallbackAgent = agentName.trim() || 'Anna Ferrari';
    setAgencyName(fallbackAgency);
    setAgentName(fallbackAgent);
    updateOnboardingDraft({
      step: 3,
      agencyName: fallbackAgency,
      agentName: fallbackAgent,
      city: city || 'Milano',
    });
    setFormError(null);
    setStep(3);
  };

  // Finalize selected choice
  const handleFinalize = (choiceOverride?: StartChoice) => {
    const finalChoice = choiceOverride || startChoice || 'explore_demo';
    syncDraft(3);
    completeOnboarding(finalChoice);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] flex flex-col justify-between font-sans selection:bg-[#fd844c]/30">
      {/* Top Bar Header */}
      <header className="border-b border-[#c7c6ca]/80 bg-[#faf9f6]/95 backdrop-blur-sm sticky top-0 z-30 px-6 md:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a1c1a] text-white flex items-center justify-center text-[12px] font-mono font-bold">
            MR
          </div>
          <div>
            <span className="font-serif-display font-bold text-[16px] tracking-tight uppercase">
              MANDATO READY
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-[#76777b] ml-3 pl-3 border-l border-[#c7c6ca]">
              {step === 0 && 'Benvenuto'}
              {step === 1 && 'Come funziona'}
              {step === 2 && 'Configurazione Studio'}
              {step === 3 && 'Avvio'}
            </span>
          </div>
        </div>

        {/* Step Indicator & Skip */}
        <div className="flex items-center gap-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#76777b]">
            {step === 0 ? 'Orientamento' : `Passo ${step} di 3`}
          </div>
          <button
            onClick={() => handleFinalize('explore_demo')}
            className="text-[11px] font-semibold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] hover:underline cursor-pointer transition-colors"
          >
            Salta e inizia
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-[#e3e2e0] h-1">
        <div
          className="bg-[#a14009] h-1 transition-all duration-300 ease-out"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center max-w-[1020px] w-full mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* ================= STEP 0: WELCOME ================= */}
        {step === 0 && (
          <div className="max-w-[760px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
            <div className="border border-[#c7c6ca] bg-[#ffffff] p-8 md:p-12 shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#efeeeb] border border-[#c7c6ca] text-[11px] font-mono uppercase tracking-widest text-[#a14009] font-bold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a14009]"></span>
                Spazio di Lavoro per Agenti Immobiliari
              </div>

              <h1 className="text-[34px] md:text-[46px] font-serif-display font-bold text-[#1a1c1a] tracking-tight leading-[1.15] mb-5">
                Benvenuto in Mandato Ready
              </h1>

              <p className="text-[16px] md:text-[18px] text-[#46474a] leading-relaxed mb-8">
                Gestire una pratica non dovrebbe significare cercare continuamente tra menu, documenti e scadenze. Mandato Ready organizza il lavoro e ti mostra cosa fare dopo.
              </p>

              <div className="pt-6 border-t border-[#efeeeb] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  type="button"
                  id="btn-welcome-discover"
                  onClick={() => {
                    syncDraft(1);
                    setStep(1);
                  }}
                  className="px-8 py-4 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[13px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <span>Scopri come funziona</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>

                <button
                  type="button"
                  id="btn-welcome-skip"
                  onClick={() => handleFinalize('explore_demo')}
                  className="px-4 py-3 text-[#76777b] hover:text-[#1a1c1a] text-[12px] uppercase font-semibold tracking-wider transition-colors cursor-pointer text-center sm:text-left"
                >
                  Salta e inizia subito
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 1: ORIENTATION (HOW IT WORKS) ================= */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6 md:mb-8 text-center sm:text-left">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#a14009] font-bold">
                Orientamento · 20 Secondi
              </span>
              <h1 className="text-[28px] md:text-[36px] font-serif-display font-bold text-[#1a1c1a] tracking-tight mt-1 mb-2">
                Funziona sempre nello stesso modo
              </h1>
              <p className="text-[14px] md:text-[15px] text-[#46474a] leading-relaxed max-w-2xl">
                Tre semplici riferimenti per non perdere mai il filo durante la compravendita.
              </p>
            </div>

            {/* 3 Columns / Cards with Realistic Micro-previews */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* 1 — OGGI */}
              <div className="border-2 border-[#1a1c1a] bg-[#ffffff] p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#a14009]">
                      1 — Oggi
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#efeeeb] text-[#76777b] uppercase font-bold">
                      Punto di partenza
                    </span>
                  </div>

                  <h2 className="text-[17px] font-serif-display font-bold text-[#1a1c1a] leading-snug mb-4">
                    Vedi subito cosa richiede attenzione.
                  </h2>

                  {/* Realistic UI Mini Preview */}
                  <div className="bg-[#faf9f6] border border-[#c7c6ca] p-3.5 mb-4 select-none">
                    <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-[#efeeeb]">
                      <div>
                        <div className="text-[13px] font-bold text-[#1a1c1a]">Mario Rossi</div>
                        <div className="text-[11px] text-[#76777b]">Incarico da completare</div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#ffdad6] text-[#410002] font-bold">
                        Entro le 12
                      </span>
                    </div>
                    <div className="inline-flex items-center justify-center w-full py-1.5 bg-[#1a1c1a] text-white text-[11px] font-bold uppercase tracking-wider">
                      Completa
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-[#76777b] pt-3 border-t border-[#efeeeb] leading-relaxed">
                  Quando entri, parti sempre da qui.
                </p>
              </div>

              {/* 2 — PRATICA */}
              <div className="border border-[#c7c6ca] bg-[#ffffff] p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#a14009]">
                      2 — Pratica
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#efeeeb] text-[#76777b] uppercase font-bold">
                      Fascicolo unico
                    </span>
                  </div>

                  <h2 className="text-[17px] font-serif-display font-bold text-[#1a1c1a] leading-snug mb-4">
                    Cliente, immobile, documenti e attività restano insieme.
                  </h2>

                  {/* Realistic UI Mini Preview */}
                  <div className="bg-[#faf9f6] border border-[#c7c6ca] p-3.5 mb-4 select-none space-y-1.5">
                    <div className="text-[13px] font-bold text-[#1a1c1a] leading-tight">
                      Mario Rossi <span className="text-[#76777b] font-normal">· Terrasini</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#76777b] pb-2 border-b border-[#efeeeb]">
                      Via Roma 18
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                      <div className="text-[#1a1c1a] font-medium flex items-center gap-1">
                        <span className="text-[#1b6b36] font-bold">✓</span> Cliente
                      </div>
                      <div className="text-[#1a1c1a] font-medium flex items-center gap-1">
                        <span className="text-[#1b6b36] font-bold">✓</span> Immobile
                      </div>
                      <div className="text-[#1a1c1a] font-medium flex items-center gap-1">
                        <span className="text-[#a14009] font-bold">7/10</span> Documenti
                      </div>
                      <div className="text-[#76777b] font-medium truncate">
                        Antiriciclaggio da fare
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-[#76777b] pt-3 border-t border-[#efeeeb] leading-relaxed">
                  Non devi cercare le informazioni in sezioni diverse.
                </p>
              </div>

              {/* 3 — PROSSIMO PASSO */}
              <div className="border-2 border-[#1a1c1a] bg-[#faf9f6] p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#a14009]">
                      3 — Prossimo passo
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#fd844c]/20 text-[#6a2500] uppercase font-bold">
                      Azione Chiara
                    </span>
                  </div>

                  <h2 className="text-[17px] font-serif-display font-bold text-[#1a1c1a] leading-snug mb-4">
                    Mandato Ready ti indica cosa fare dopo.
                  </h2>

                  {/* Realistic UI Mini Preview */}
                  <div className="bg-[#ffffff] border-2 border-[#1a1c1a] p-3.5 mb-4 select-none">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#a14009] mb-1">
                      Prossimo passo
                    </div>
                    <div className="text-[12px] font-semibold text-[#1a1c1a] leading-snug mb-3">
                      Recupera la planimetria catastale
                    </div>
                    <div className="inline-flex items-center justify-center w-full py-1.5 bg-[#a14009] text-white text-[11px] font-bold uppercase tracking-wider">
                      Continua pratica
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-[#76777b] pt-3 border-t border-[#efeeeb] leading-relaxed">
                  Apri una pratica e guarda sempre prima questa indicazione.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  syncDraft(0);
                  setStep(0);
                }}
                className="w-full sm:w-auto px-6 py-3 border border-[#c7c6ca] bg-[#faf9f6] hover:bg-[#e3e2e0] text-[#1a1c1a] text-[12px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Indietro</span>
              </button>

              <button
                type="button"
                id="btn-orientation-got-it"
                onClick={() => {
                  syncDraft(2);
                  setStep(2);
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[12px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Ho capito, iniziamo</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: AGENCY SETUP ================= */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[780px] mx-auto">
            <div className="mb-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#a14009] font-bold">
                Passo 2 · Identità Operativa
              </span>
              <h1 className="text-[30px] md:text-[38px] font-serif-display font-bold text-[#1a1c1a] tracking-tight mt-1 mb-2">
                Configuriamo la tua agenzia
              </h1>
              <p className="text-[15px] text-[#46474a] leading-relaxed">
                Inserisci i dati principali per personalizzare fascicoli e documenti del tuo studio.
              </p>
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-[#ffdad6]/40 border-l-4 border-[#ba1a1a] text-[#410002] text-[13px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <div className="border border-[#c7c6ca] bg-[#ffffff] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] uppercase font-bold tracking-wider text-[#1a1c1a] mb-1.5">
                    Nome Agenzia / Studio *
                  </label>
                  <input
                    type="text"
                    id="input-agency-name"
                    value={agencyName}
                    onChange={(e) => {
                      setAgencyName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="es. Studio Immobiliare Duomo"
                    className="w-full bg-[#faf9f6] border border-[#c7c6ca] focus:border-[#1a1c1a] focus:bg-[#ffffff] p-3 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                  />
                  <span className="text-[11px] text-[#76777b] mt-1 block">
                    Verr&agrave; visualizzato nell&apos;intestazione dei fascicoli.
                  </span>
                </div>

                <div>
                  <label className="block text-[12px] uppercase font-bold tracking-wider text-[#1a1c1a] mb-1.5">
                    Nome e Cognome Referente *
                  </label>
                  <input
                    type="text"
                    id="input-agent-name"
                    value={agentName}
                    onChange={(e) => {
                      setAgentName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="es. Anna Ferrari"
                    className="w-full bg-[#faf9f6] border border-[#c7c6ca] focus:border-[#1a1c1a] focus:bg-[#ffffff] p-3 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                  />
                  <span className="text-[11px] text-[#76777b] mt-1 block">
                    Agente incaricato predefinito per le pratiche.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#efeeeb]">
                <div>
                  <label className="block text-[11px] uppercase font-semibold tracking-wider text-[#76777b] mb-1.5">
                    Comune Operativo
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="es. Milano"
                    className="w-full bg-[#faf9f6] border border-[#c7c6ca] focus:border-[#1a1c1a] focus:bg-[#ffffff] p-2.5 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold tracking-wider text-[#76777b] mb-1.5">
                    Telefono (opzionale)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="es. +39 02 8901234"
                    className="w-full bg-[#faf9f6] border border-[#c7c6ca] focus:border-[#1a1c1a] focus:bg-[#ffffff] p-2.5 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold tracking-wider text-[#76777b] mb-1.5">
                    Email (opzionale)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="es. info@immobiliare.it"
                    className="w-full bg-[#faf9f6] border border-[#c7c6ca] focus:border-[#1a1c1a] focus:bg-[#ffffff] p-2.5 text-[14px] text-[#1a1c1a] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    syncDraft(1);
                    setStep(1);
                  }}
                  className="px-6 py-3 border border-[#c7c6ca] bg-[#faf9f6] hover:bg-[#e3e2e0] text-[#1a1c1a] text-[12px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Indietro</span>
                </button>
                <button
                  type="button"
                  onClick={handleAgencySkip}
                  className="px-4 py-3 text-[#76777b] hover:text-[#1a1c1a] text-[12px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Salta per ora
                </button>
              </div>

              <button
                type="button"
                id="btn-onboarding-agency-next"
                onClick={handleAgencyNext}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[12px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continua</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: START CHOICE ================= */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[840px] mx-auto">
            <div className="mb-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#a14009] font-bold">
                Passo 3 · Avvio Operativo
              </span>
              <h1 className="text-[30px] md:text-[38px] font-serif-display font-bold text-[#1a1c1a] tracking-tight mt-1 mb-2">
                Da dove vuoi iniziare?
              </h1>
              <p className="text-[15px] text-[#46474a] leading-relaxed">
                Scegli come muovere i primi passi in Mandato Ready.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1 */}
              <div
                id="choice-new-practice"
                onClick={() => setStartChoice('new_practice')}
                className={`p-6 border-2 cursor-pointer transition-all ${
                  startChoice === 'new_practice'
                    ? 'border-[#1a1c1a] bg-[#ffffff] shadow-md'
                    : 'border-[#c7c6ca] bg-[#faf9f6] hover:border-[#1a1c1a] hover:bg-[#f4f3f1]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 shrink-0 flex items-center justify-center border ${
                      startChoice === 'new_practice'
                        ? 'bg-[#1a1c1a] text-white border-[#1a1c1a]'
                        : 'bg-[#efeeeb] text-[#1a1c1a] border-[#c7c6ca]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">add_home</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">
                        Ho già una pratica da inserire
                      </h2>
                    </div>
                    <p className="text-[14px] text-[#46474a] leading-relaxed">
                      Ti guidiamo passo dopo passo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2 */}
              <div
                id="choice-opportunity"
                onClick={() => setStartChoice('opportunity')}
                className={`p-6 border-2 cursor-pointer transition-all ${
                  startChoice === 'opportunity'
                    ? 'border-[#1a1c1a] bg-[#ffffff] shadow-md'
                    : 'border-[#c7c6ca] bg-[#faf9f6] hover:border-[#1a1c1a] hover:bg-[#f4f3f1]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 shrink-0 flex items-center justify-center border ${
                      startChoice === 'opportunity'
                        ? 'bg-[#1a1c1a] text-white border-[#1a1c1a]'
                        : 'bg-[#efeeeb] text-[#1a1c1a] border-[#c7c6ca]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">analytics</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">
                        Ho un proprietario da qualificare
                      </h2>
                    </div>
                    <p className="text-[14px] text-[#46474a] leading-relaxed">
                      Prepara il primo contatto con Mandato Ready.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Explore Demo */}
              <div
                id="choice-explore-demo"
                onClick={() => setStartChoice('explore_demo')}
                className={`p-6 border-2 cursor-pointer transition-all ${
                  startChoice === 'explore_demo'
                    ? 'border-[#1a1c1a] bg-[#ffffff] shadow-md ring-1 ring-[#1a1c1a]'
                    : 'border-[#c7c6ca] bg-[#faf9f6] hover:border-[#1a1c1a] hover:bg-[#f4f3f1]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 shrink-0 flex items-center justify-center border ${
                      startChoice === 'explore_demo'
                        ? 'bg-[#a14009] text-white border-[#a14009]'
                        : 'bg-[#efeeeb] text-[#1a1c1a] border-[#c7c6ca]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">visibility</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">
                        Voglio prima vedere come funziona
                      </h2>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 bg-[#fd844c]/20 text-[#6a2500] border border-[#fd844c]/40">
                        Consigliato
                      </span>
                    </div>
                    <p className="text-[14px] text-[#46474a] leading-relaxed">
                      Apri una pratica di esempio già compilata.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  syncDraft(2);
                  setStep(2);
                }}
                className="w-full sm:w-auto px-6 py-3 border border-[#c7c6ca] bg-[#faf9f6] hover:bg-[#e3e2e0] text-[#1a1c1a] text-[12px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Indietro</span>
              </button>

              <button
                type="button"
                id="btn-onboarding-finalize"
                onClick={() => handleFinalize()}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#a14009] text-white hover:bg-[#7d2d00] text-[12px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
              >
                <span>Inizia</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[#c7c6ca]/80 py-4 px-6 text-center text-[11px] font-mono text-[#76777b]">
        MANDATO READY · LA PIATTAFORMA TI GUIDA VERSO IL ROGITO
      </footer>
    </div>
  );
};
