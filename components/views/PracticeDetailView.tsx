'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DocumentUploadModal } from '../common/DocumentUploadModal';
import { AddNoteModal } from '../common/AddNoteModal';
import { Tooltip } from '@/components/common/Tooltip';
import { ContextualHelp } from '@/components/common/ContextualHelp';
import { HELP_CONCEPTS } from '@/lib/helpContent';

export const PracticeDetailView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getClientById,
    getPropertyById,
    getDocumentsByPracticeId,
    practiceActiveSubTab,
    setPracticeActiveSubTab,
    focusedPracticeSection,
    setActiveTab,
    closePracticeDetail,
    updateAmlWorkflow,
    updatePractice,
    uploadOrMarkDocument,
    getMandateByPracticeId,
    getSigningProcessByPracticeId,
    getAmlDossierByPracticeId,
    isHintDismissed,
    dismissHint,
    interactiveDemoStage,
    setInteractiveDemoStage,
    isHelpModeActive,
    contextualHelpPreference,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || 'prat-1') || getPracticeById('prat-1');

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocTargetId, setUploadDocTargetId] = useState<string | null>(null);
  const [uploadDocTargetLabel, setUploadDocTargetLabel] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Accordion open states
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    cliente: false,
    immobile: false,
    documenti: true,
    incarico: false,
    aml: false,
  });

  const activeExpandedSections = focusedPracticeSection
    ? { ...expandedSections, [focusedPracticeSection]: true }
    : expandedSections;

  useEffect(() => {
    if (focusedPracticeSection) {
      // Scroll to section smoothly
      const el = document.getElementById(`section-${focusedPracticeSection}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [focusedPracticeSection]);

  if (!practice) {
    return (
      <div className="p-8 text-center">
        <p>Pratica non trovata.</p>
        <button onClick={closePracticeDetail} className="mt-4 underline">
          Torna alle pratiche
        </button>
      </div>
    );
  }

  const client = getClientById(practice.clientId);
  const property = getPropertyById(practice.propertyId);
  const docs = getDocumentsByPracticeId(practice.id);

  const completedDocsCount = docs.filter((d) => d.status === 'Disponibile').length;
  const missingDocs = docs.filter((d) => d.status === 'Da recuperare' || d.status === 'In attesa');

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !activeExpandedSections[sectionKey] }));
  };

  const handleOpenUploadForDoc = (docId: string, label: string) => {
    setUploadDocTargetId(docId);
    setUploadDocTargetLabel(label);
    setIsUploadModalOpen(true);
  };

  const handleNextActionClick = () => {
    if (practice.nextAction.targetSection === 'documenti') {
      const targetDoc = docs.find((d) => d.id === practice.nextAction.documentIdToUpload) || docs.find((d) => d.status === 'Da recuperare');
      if (targetDoc) {
        handleOpenUploadForDoc(targetDoc.id, targetDoc.label);
      } else {
        setUploadDocTargetId(null);
        setUploadDocTargetLabel(null);
        setIsUploadModalOpen(true);
      }
    } else if (practice.nextAction.targetSection === 'incarico') {
      toggleSection('incarico');
    } else if (practice.nextAction.targetSection === 'aml') {
      toggleSection('aml');
    } else {
      toggleSection('documenti');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans pb-24 md:pb-12">
      {/* Top App Bar matching Stitch Image 7 with Liquid Glass refinement */}
      <header className="sticky top-0 z-30 bg-[#faf9f6]/85 backdrop-blur-md border-b border-[#c7c6ca]/80 px-6 md:px-12 py-4 md:py-6 flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-200">
        <div>
          <button
            id="btn-back-to-pratiche"
            onClick={closePracticeDetail}
            className="flex items-center gap-2 text-[#76777b] hover:text-[#1a1c1a] text-[11px] uppercase tracking-widest font-semibold mb-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Torna alle Pratiche
          </button>

          <h1 className="text-[24px] md:text-[32px] font-serif-display font-bold text-[#1a1c1a] leading-tight">
            {client?.firstName} {client?.lastName}{' '}
            <span className="text-[#c7c6ca] font-normal mx-1">|</span>{' '}
            <span className="font-normal text-[20px] md:text-[28px] text-[#46474a]">
              {property?.address} · {property?.municipality}
            </span>{' '}
            <span className="text-[#c7c6ca] font-normal mx-1">|</span>{' '}
            <span className="text-[18px] md:text-[22px] font-normal text-[#76777b]">
              {practice.practiceType}
            </span>
          </h1>

          <div className="flex items-center gap-4 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#efeeeb] text-[#1a1c1a] border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a14009]"></span> {practice.status}
            </span>
            <span className="text-[#76777b] text-[13px] font-mono font-medium">{practice.code}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPracticeActiveSubTab(practiceActiveSubTab === 'documenti' ? 'dettagli' : 'documenti');
            }}
            className="px-4 py-2 bg-[#faf9f6] text-[#1a1c1a] border border-[#c7c6ca] hover:bg-[#e3e2e0] transition-colors text-[11px] uppercase font-bold tracking-wider cursor-pointer"
          >
            {practiceActiveSubTab === 'documenti' ? 'Vista Standard' : 'Workspace Documenti'}
          </button>
          <button
            id="btn-continua-pratica"
            onClick={handleNextActionClick}
            className="px-6 py-2 bg-[#a14009] text-white hover:bg-[#7d2d00] transition-colors text-[11px] uppercase font-bold tracking-widest flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <span>Continua pratica</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-6 md:px-12 py-8 md:py-12 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Priority Bento & Workflow */}
        <div className="lg:col-span-8 space-y-10">
          {/* Interactive Demo Banner (Step 2 of Demo) */}
          {interactiveDemoStage === 'practice_prossimo_passo' && (
            <aside aria-label="Guida Fascicolo" className="p-6 bg-[#ffffff] border-2 border-[#1a1c1a] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 shrink-0 bg-[#a14009] text-white flex items-center justify-center font-bold text-[14px]">
                  2/2
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-[#a14009]">
                      Orientamento Operativo Guidato
                    </span>
                    <span className="px-2 py-0.5 bg-[#efeeeb] text-[#1a1c1a] text-[10px] font-mono uppercase font-semibold">
                      2. Fascicolo Pratica & Prossimo Passo
                    </span>
                  </div>
                  <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a] mt-1">
                    Cliente, immobile e documenti rimangono sempre insieme.
                  </h2>
                  <p className="text-[14px] text-[#46474a] mt-0.5 leading-relaxed">
                    Guarda la scheda <strong>&ldquo;Prossimo passo&rdquo;</strong> qui sotto: Mandato Ready calcola continuamente cosa serve per portare la compravendita al rogito.
                  </p>
                </div>
              </div>

              <button
                id="btn-demo-complete-tour"
                onClick={() => setInteractiveDemoStage(null)}
                className="px-6 py-3 bg-[#a14009] text-white hover:bg-[#7d2d00] text-[12px] uppercase font-bold tracking-widest shrink-0 cursor-pointer transition-all shadow-sm active:scale-95"
              >
                Concludi tour
              </button>
            </aside>
          )}

          {/* First-Use Sequential Micro Guidance */}
          {!interactiveDemoStage &&
            contextualHelpPreference !== 'reduced' &&
            !isHintDismissed('hint_practice_step_1_prossimo_passo') && (
              <div className="p-5 bg-[#faf9f6] border-2 border-[#1a1c1a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#a14009] text-white flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1a1c1a] uppercase tracking-wide mb-0.5">
                      Prossimo Passo
                    </h3>
                    <p className="text-[13px] text-[#46474a] leading-relaxed">
                      Qui trovi sempre l&apos;azione più importante da fare dopo.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => dismissHint('hint_practice_step_1_prossimo_passo')}
                  className="px-4 py-2 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] font-bold uppercase tracking-wider shrink-0 cursor-pointer self-start sm:self-center transition-colors"
                >
                  Ho capito
                </button>
              </div>
            )}

          {!interactiveDemoStage &&
            contextualHelpPreference !== 'reduced' &&
            isHintDismissed('hint_practice_step_1_prossimo_passo') &&
            !isHintDismissed('hint_practice_step_2_cosa_manca') && (
              <div className="p-5 bg-[#faf9f6] border-2 border-[#1a1c1a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#a14009] text-white flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1a1c1a] uppercase tracking-wide mb-0.5">
                      Cosa Manca
                    </h3>
                    <p className="text-[13px] text-[#46474a] leading-relaxed">
                      Qui vedi subito ciò che manca alla pratica.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => dismissHint('hint_practice_step_2_cosa_manca')}
                  className="px-4 py-2 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] font-bold uppercase tracking-wider shrink-0 cursor-pointer self-start sm:self-center transition-colors"
                >
                  Ho capito
                </button>
              </div>
            )}

          {/* Priority Actions / Bento Grid */}
          <section>
            <h2 className="text-[11px] font-bold text-[#76777b] mb-4 uppercase tracking-widest border-b border-[#c7c6ca] pb-2">
              Azioni Prioritarie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prossimo passo (Dominant) */}
              <div
                className={`border-2 p-6 md:p-8 flex flex-col justify-between transition-all ${
                  interactiveDemoStage === 'practice_prossimo_passo' ||
                  (!interactiveDemoStage &&
                    contextualHelpPreference !== 'reduced' &&
                    !isHintDismissed('hint_practice_step_1_prossimo_passo'))
                    ? 'border-[#a14009] bg-[#ffffff] shadow-md ring-2 ring-[#a14009]/50'
                    : 'border-[#1a1c1a] bg-[#faf9f6] shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 text-[#1a1c1a]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#a14009] text-[20px]">
                        arrow_forward_ios
                      </span>
                      <Tooltip content={HELP_CONCEPTS.prossimo_passo.tooltip}>
                        <h3 className="text-[18px] font-serif-display font-bold text-[#1a1c1a] cursor-help">
                          Prossimo passo
                        </h3>
                      </Tooltip>
                      <ContextualHelp conceptId="prossimo_passo" alwaysVisible={isHelpModeActive} />
                    </div>
                    {interactiveDemoStage === 'practice_prossimo_passo' && (
                      <span className="px-2 py-0.5 bg-[#fd844c]/20 text-[#6a2500] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#fd844c]/40">
                        Azione Calcolata
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] text-[#1a1c1a] mb-6 leading-relaxed">
                    {practice.nextAction.description}
                  </p>
                </div>

                <button
                  id="btn-prossimo-passo"
                  onClick={handleNextActionClick}
                  className="w-full py-3 bg-[#1a1c1a] text-white hover:bg-[#333533] transition-colors text-[12px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {practice.nextAction.ctaText}
                </button>
              </div>

              {/* Cosa manca */}
              <div
                className={`border p-6 md:p-8 flex flex-col justify-between transition-all ${
                  !interactiveDemoStage &&
                  contextualHelpPreference !== 'reduced' &&
                  isHintDismissed('hint_practice_step_1_prossimo_passo') &&
                  !isHintDismissed('hint_practice_step_2_cosa_manca')
                    ? 'border-[#a14009] bg-[#ffffff] shadow-md ring-2 ring-[#a14009]/50'
                    : 'border-[#c7c6ca] bg-[#efeeeb]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 text-[#1a1c1a]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#76777b] text-[20px]">
                        list_alt
                      </span>
                      <Tooltip content={HELP_CONCEPTS.cosa_manca.tooltip}>
                        <h3 className="text-[18px] font-serif-display font-bold text-[#1a1c1a] cursor-help">
                          Cosa manca
                        </h3>
                      </Tooltip>
                      <ContextualHelp conceptId="cosa_manca" alwaysVisible={isHelpModeActive} />
                    </div>
                  </div>

                  {missingDocs.length === 0 && practice.amlStatus === 'completato' ? (
                    <p className="text-[14px] text-[#46474a] italic">
                      Nessun elemento mancante. Il fascicolo è pronto per il rogito.
                    </p>
                  ) : (
                    <ul className="space-y-3.5 mb-6">
                      {missingDocs.slice(0, 3).map((d) => (
                        <li key={d.id} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#a14009] text-[18px] mt-0.5">
                            description
                          </span>
                          <div>
                            <p className="text-[14px] font-medium text-[#1a1c1a]">{d.label}</p>
                            <p className="text-[11px] text-[#76777b]">
                              {d.subtitle || 'Obbligatorio per incarico'}
                            </p>
                          </div>
                        </li>
                      ))}
                      {!practice.amlWorkflow.titolareEffettivoVerificato && (
                        <li className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#76777b] text-[18px] mt-0.5">
                            shield_person
                          </span>
                          <div>
                            <p className="text-[14px] font-medium text-[#1a1c1a]">Titolare effettivo AML</p>
                            <p className="text-[11px] text-[#76777b]">Dati incompleti venditore</p>
                          </div>
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <button
                  onClick={() => toggleSection('documenti')}
                  className="w-full py-3 border border-[#c7c6ca] bg-[#faf9f6] text-[#1a1c1a] hover:bg-[#e3e2e0] transition-colors text-[12px] uppercase font-bold tracking-wider cursor-pointer"
                >
                  Risolvi Ora
                </button>
              </div>
            </div>
          </section>

          {/* Visual Workflow Tracker matching Stitch */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-[#c7c6ca] pb-2">
              <h2 className="text-[11px] font-bold text-[#76777b] uppercase tracking-widest">
                Stato Avanzamento
              </h2>
              <ContextualHelp conceptId="completezza_pratica" alwaysVisible={isHelpModeActive} size="sm" />
            </div>

            <div className="relative flex justify-between items-center px-4 py-8 border border-[#c7c6ca] bg-[#faf9f6] overflow-x-auto">
              <div className="absolute top-1/2 left-8 right-8 h-px bg-[#c7c6ca] -translate-y-1/2"></div>

              {/* Cliente */}
              <div
                onClick={() => toggleSection('cliente')}
                className="relative z-10 flex flex-col items-center gap-2 min-w-[72px] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a1c1a] text-white flex items-center justify-center border-2 border-[#faf9f6]">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <span className="text-[11px] font-bold uppercase text-[#1a1c1a] tracking-wider text-center">
                  Cliente
                </span>
              </div>

              {/* Immobile */}
              <div
                onClick={() => toggleSection('immobile')}
                className="relative z-10 flex flex-col items-center gap-2 min-w-[72px] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a1c1a] text-white flex items-center justify-center border-2 border-[#faf9f6]">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <span className="text-[11px] font-bold uppercase text-[#1a1c1a] tracking-wider text-center">
                  Immobile
                </span>
              </div>

              {/* Incarico */}
              <div
                onClick={() => toggleSection('incarico')}
                className="relative z-10 flex flex-col items-center gap-2 min-w-[72px] cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#faf9f6] ${
                    practice.mandateStatus === 'firmato'
                      ? 'bg-[#1a1c1a] text-white'
                      : 'bg-[#ffdbcd] text-[#6a2500] border-[#a14009]'
                  }`}
                >
                  {practice.mandateStatus === 'firmato' ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    <span className="text-[11px] font-bold font-mono">!</span>
                  )}
                </div>
                <span className="text-[11px] font-bold uppercase text-[#1a1c1a] tracking-wider text-center">
                  Incarico
                </span>
              </div>

              {/* Documenti */}
              <div
                onClick={() => toggleSection('documenti')}
                className="relative z-10 flex flex-col items-center gap-2 min-w-[72px] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#ffdbcd] border border-[#a14009] text-[#6a2500] flex items-center justify-center">
                  <span className="text-[11px] font-mono font-bold">
                    {completedDocsCount}/{docs.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase text-[#a14009] tracking-wider text-center">
                  Documenti
                </span>
              </div>

              {/* AML */}
              <div
                onClick={() => toggleSection('aml')}
                className="relative z-10 flex flex-col items-center gap-2 min-w-[72px] cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full border border-[#c7c6ca] flex items-center justify-center ${
                    practice.amlStatus === 'completato'
                      ? 'bg-[#1a1c1a] text-white'
                      : 'bg-[#efeeeb] text-[#76777b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {practice.amlStatus === 'completato' ? 'check' : 'hourglass_empty'}
                  </span>
                </div>
                <span className="text-[11px] uppercase text-[#76777b] tracking-wider text-center">
                  AML
                </span>
              </div>

              {/* Proposte */}
              <div className="relative z-10 flex flex-col items-center gap-2 min-w-[72px] opacity-60 select-none">
                <div className="w-8 h-8 rounded-full bg-[#efeeeb] border border-[#c7c6ca] text-[#76777b] flex items-center justify-center">
                  <span className="text-[12px] font-mono">-</span>
                </div>
                <span className="text-[11px] uppercase text-[#76777b] tracking-wider text-center">
                  Proposte
                </span>
              </div>

              {/* Conclusione */}
              <div className="relative z-10 flex flex-col items-center gap-2 min-w-[72px] opacity-60 select-none">
                <div className="w-8 h-8 rounded-full bg-[#efeeeb] border border-[#c7c6ca] text-[#76777b] flex items-center justify-center">
                  <span className="text-[12px] font-mono">-</span>
                </div>
                <span className="text-[11px] uppercase text-[#76777b] tracking-wider text-center">
                  Conclusione
                </span>
              </div>
            </div>
          </section>

          {/* Expandable Operational Sections */}
          <section className="space-y-4">
            <h2 className="text-[11px] font-bold text-[#76777b] mb-4 uppercase tracking-widest border-b border-[#c7c6ca] pb-2">
              Dettagli Operativi
            </h2>

            {/* Accordion: Cliente */}
            <div id="section-cliente" className="border border-[#c7c6ca] bg-[#faf9f6]">
              <button
                onClick={() => toggleSection('cliente')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f4f3f1] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#76777b]">person</span>
                  <span className="text-[16px] font-bold font-serif-display text-[#1a1c1a]">Cliente</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 border border-[#c7c6ca] bg-[#efeeeb] text-[10px] font-bold uppercase text-[#1a1c1a]">
                    Completo
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[#76777b] transition-transform ${
                    activeExpandedSections.cliente ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {activeExpandedSections.cliente && (
                <div className="border-t border-[#c7c6ca] p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Nome Completo
                    </span>
                    <p className="font-semibold text-[#1a1c1a]">
                      {client?.firstName} {client?.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Ruolo
                    </span>
                    <p className="font-medium text-[#1a1c1a]">Proprietario / Venditore</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Codice Fiscale
                    </span>
                    <p className="font-mono text-[#1a1c1a]">{client?.fiscalCode || 'RSSMRA80A01H501U'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Contatti
                    </span>
                    <p className="font-mono text-[#1a1c1a]">
                      {client?.phone}
                      <br />
                      {client?.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Immobile */}
            <div id="section-immobile" className="border border-[#c7c6ca] bg-[#faf9f6]">
              <button
                onClick={() => toggleSection('immobile')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f4f3f1] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#76777b]">home</span>
                  <span className="text-[16px] font-bold font-serif-display text-[#1a1c1a]">Immobile</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 border border-[#c7c6ca] bg-[#efeeeb] text-[10px] font-bold uppercase text-[#1a1c1a]">
                    Completo
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[#76777b] transition-transform ${
                    activeExpandedSections.immobile ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {activeExpandedSections.immobile && (
                <div className="border-t border-[#c7c6ca] p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Indirizzo & Comune
                    </span>
                    <p className="font-medium text-[#1a1c1a]">
                      {property?.address}, {property?.municipality} ({property?.province})
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Tipologia & Superficie
                    </span>
                    <p className="font-medium text-[#1a1c1a]">
                      {property?.type} · ~{property?.approximateSurface} m² ({property?.rooms} locali, {property?.bathrooms} bagni)
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Classe Energetica
                    </span>
                    <p className="font-bold text-[#a14009]">Classe {property?.energyClass || 'C'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">
                      Note Tecniche
                    </span>
                    <p className="text-[13px] text-[#46474a]">{property?.notes || 'Nessuna difformità segnalata.'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Documenti (Detailed Table) */}
            <div id="section-documenti" className="border border-[#c7c6ca] bg-[#faf9f6]">
              <button
                onClick={() => toggleSection('documenti')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f4f3f1] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#76777b]">folder_open</span>
                  <span className="text-[16px] font-bold font-serif-display text-[#1a1c1a]">Documenti</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 border border-[#a14009] bg-[#ffdbcd] text-[10px] font-bold uppercase text-[#6a2500]">
                    {completedDocsCount}/{docs.length} Caricati
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[#76777b] transition-transform ${
                    activeExpandedSections.documenti ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {activeExpandedSections.documenti && (
                <div className="border-t border-[#c7c6ca] overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#efeeeb] border-b border-[#c7c6ca]">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#76777b]">
                          Tipo Documento
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#76777b]">
                          Stato
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#76777b] text-right">
                          Azione
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c7c6ca]">
                      {docs.map((doc) => {
                        const isAvailable = doc.status === 'Disponibile';
                        return (
                          <tr
                            key={doc.id}
                            className={`hover:bg-[#f4f3f1] transition-colors ${
                              !isAvailable ? 'bg-[#ffdbcd]/10' : ''
                            }`}
                          >
                            <td className="px-6 py-3.5 text-[14px] font-medium text-[#1a1c1a]">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`material-symbols-outlined text-[18px] ${
                                    isAvailable ? 'text-[#1a1c1a]' : 'text-[#a14009]'
                                  }`}
                                >
                                  {isAvailable ? 'description' : 'error'}
                                </span>
                                <div>
                                  <span className={isAvailable ? 'text-[#1a1c1a]' : 'text-[#a14009] font-bold'}>
                                    {doc.label}
                                  </span>
                                  <span className="text-[11px] text-[#76777b] block">{doc.subtitle}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <Tooltip
                                content={
                                  isAvailable
                                    ? HELP_CONCEPTS.disponibile.tooltip
                                    : HELP_CONCEPTS.da_recuperare.tooltip
                                }
                              >
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 border cursor-help ${
                                    isAvailable
                                      ? 'bg-[#efeeeb] text-[#1a1c1a] border-[#c7c6ca]'
                                      : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                                  }`}
                                >
                                  {isAvailable && (
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                  )}
                                  {doc.status}
                                </span>
                              </Tooltip>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              {isAvailable ? (
                                <button
                                  onClick={() => handleOpenUploadForDoc(doc.id, doc.label)}
                                  className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] cursor-pointer"
                                >
                                  Vedi / Sostituisci
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenUploadForDoc(doc.id, doc.label)}
                                  className="text-[11px] font-bold uppercase tracking-wider text-[#a14009] underline underline-offset-2 hover:text-[#7d2d00] cursor-pointer"
                                >
                                  Carica
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="p-4 bg-[#faf9f6] border-t border-[#c7c6ca] flex justify-between items-center">
                    <span className="text-[12px] text-[#76777b]">
                      Tutti i documenti caricati vengono sincronizzati nel fascicolo.
                    </span>
                    <button
                      onClick={() => {
                        setUploadDocTargetId(null);
                        setUploadDocTargetLabel(null);
                        setIsUploadModalOpen(true);
                      }}
                      className="text-[11px] uppercase font-bold tracking-wider text-[#1a1c1a] hover:text-[#a14009] flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Aggiungi Altro Documento
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Incarico */}
            <div id="section-incarico" className="border border-[#c7c6ca] bg-[#faf9f6]">
              <button
                onClick={() => toggleSection('incarico')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f4f3f1] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#76777b]">contract</span>
                  <span className="text-[16px] font-bold font-serif-display text-[#1a1c1a]">Incarico di Mediazione</span>
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase ${
                      practice.mandateStatus === 'firmato'
                        ? 'border-[#c7c6ca] bg-[#efeeeb] text-[#1a1c1a]'
                        : practice.mandateStatus === 'da_firmare' 
                        ? 'border-[#1a1c1a] bg-[#1a1c1a] text-white'
                        : practice.mandateStatus === 'in_scadenza'
                        ? 'border-[#a14009] bg-[#ffdbcd] text-[#6a2500]'
                        : 'border-[#a14009] bg-[#ffdbcd] text-[#6a2500]'
                    }`}
                  >
                    {practice.mandateStatus === 'da_preparare' ? 'Da compilare' : 
                     practice.mandateStatus === 'da_firmare' ? 'Firme in corso' : 
                     practice.mandateStatus === 'firmato' ? 'Firmato' : 
                     practice.mandateStatus === 'in_scadenza' ? 'In scadenza' : 'In corso'}
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[#76777b] transition-transform ${
                    activeExpandedSections.incarico ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {activeExpandedSections.incarico && (() => {
                const mandate = getMandateByPracticeId(practice.id);
                const mandateState = mandate?.status || 'Da compilare';
                const signingProcess = getSigningProcessByPracticeId(practice.id);
                const signingState = signingProcess?.status;

                let btnLabel = 'Compila incarico';
                if (mandateState === 'Bozza' || mandateState === 'Da controllare') btnLabel = 'Continua incarico';
                else if (mandateState === 'Pronto per la firma') btnLabel = 'Prepara firma';
                else if (signingState) btnLabel = 'Apri processo firma';

                return (
                  <div className="border-t border-[#c7c6ca] p-6 text-[14px]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="max-w-xl">
                        <div className="text-[13px] font-bold uppercase tracking-widest text-[#1a1c1a] mb-2">
                          {mandateState === 'Da compilare' ? 'Inizia Incarico' : 
                           mandateState === 'Pronto per la firma' ? 'Documento Pronto' : 
                           signingState === 'In corso' ? 'Firme in Attesa' : 'Stato Incarico'}
                        </div>
                        <p className="text-[14px] text-[#46474a] leading-relaxed mb-4">
                          {mandateState === 'Da compilare' && 'Cliente e immobile sono già disponibili. Completa solo le informazioni mancanti.'}
                          {mandateState === 'Bozza' && 'Hai salvato una bozza dell\'incarico. Riprendi da dove avevi lasciato.'}
                          {mandateState === 'Da controllare' && 'Verifica i dati inseriti e procedi con la preparazione del documento.'}
                          {mandateState === 'Pronto per la firma' && 'Il documento è completo e pronto per essere inviato in firma digitale ai soggetti coinvolti.'}
                          {signingState && (
                            <>
                              Firma in corso: <strong>{signingProcess.signatories.filter(s => s.status === 'Firmato').length} di {signingProcess.signatories.length} firmatari</strong>
                              <br/>
                              {signingProcess.signatories.map(s => (
                                <span key={s.id} className="block mt-1">
                                  {s.status === 'Firmato' ? '✓' : '○'} {s.name} — {s.status}
                                </span>
                              ))}
                            </>
                          )}
                          {mandateState === 'Firmato' && practice.mandateStatus !== 'in_scadenza' && 'L\'incarico è stato firmato correttamente da tutte le parti.'}
                          {practice.mandateStatus === 'in_scadenza' && 'L\'incarico è in scadenza. Procedi con il rinnovo.'}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-3 w-full md:w-auto">
                        {mandateState !== 'Firmato' && (
                          <button
                            onClick={() => {
                              if (mandateState === 'Pronto per la firma' || signingState) {
                                setActiveTab('firma_process');
                              } else {
                                setActiveTab('incarico_wizard');
                              }
                            }}
                            className="w-full md:w-auto px-6 py-3 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] cursor-pointer"
                          >
                            {btnLabel}
                          </button>
                        )}
                        {mandateState === 'Firmato' && practice.mandateStatus !== 'in_scadenza' && (
                          <div className="flex items-center gap-2 text-[#1b5e20] bg-[#e8f5e9] px-4 py-2 border border-[#a5d6a7]">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            <span className="text-[12px] font-bold uppercase">Incarico Completato</span>
                          </div>
                        )}
                        {practice.mandateStatus === 'in_scadenza' && (
                          <button
                            onClick={() => setActiveTab('incarico_wizard')}
                            className="w-full md:w-auto px-6 py-3 bg-[#a14009] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#7d2d00] cursor-pointer"
                          >
                            Rinnova Incarico
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Accordion: Antiriciclaggio (AML) */}
            <div id="section-aml" className="border border-[#c7c6ca] bg-[#faf9f6]">
              <button
                onClick={() => toggleSection('aml')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f4f3f1] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#76777b]">verified_user</span>
                  <span className="text-[16px] font-bold font-serif-display text-[#1a1c1a]">
                    Antiriciclaggio (AML)
                  </span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 border border-[#c7c6ca] bg-[#efeeeb] text-[10px] font-bold uppercase text-[#1a1c1a]">
                    {practice.amlStatus === 'completato' ? 'Completo' : 'In corso'}
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[#76777b] transition-transform ${
                    activeExpandedSections.aml ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {activeExpandedSections.aml && (() => {
                const dossier = getAmlDossierByPracticeId(practice.id);
                const amlState = dossier?.status || 'Da iniziare';
                const completedSections = dossier ? Object.values(dossier.sections).filter(Boolean).length : 0;
                
                return (
                  <div className="border-t border-[#c7c6ca] p-6 text-[14px]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="max-w-xl">
                        <div className="text-[13px] font-bold uppercase tracking-widest text-[#1a1c1a] mb-2">
                          Fascicolo AML
                        </div>
                        <p className="text-[14px] text-[#46474a] leading-relaxed mb-4">
                          {amlState === 'Da iniziare' && 'Crea e organizza il fascicolo per l\'adeguata verifica. Le informazioni di cliente e immobile verranno recuperate automaticamente.'}
                          {amlState === 'In corso' && `Fascicolo in corso. Hai completato ${completedSections} di 6 sezioni necessarie.`}
                          {amlState === 'Completato operativamente' && 'Fascicolo compilato e valutazione del rischio registrata.'}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-3 w-full md:w-auto">
                        <button
                          onClick={() => setActiveTab('aml_wizard')}
                          className="w-full md:w-auto px-6 py-3 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] cursor-pointer"
                        >
                          {amlState === 'Da iniziare' ? 'Inizia Fascicolo' : 'Continua Fascicolo'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        </div>

        {/* Right Column: Context & Metadata */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Informazioni Pratica */}
          <div className="border border-[#c7c6ca] bg-[#faf9f6] p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] mb-4 border-b border-[#c7c6ca] pb-2">
              Informazioni Pratica
            </h3>

            <dl className="space-y-4 text-[14px]">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] mb-0.5">
                  Data Apertura
                </dt>
                <dd className="font-mono font-medium text-[#1a1c1a]">{practice.openedDate}</dd>
              </div>

              <div className="pt-3 border-t border-[#c7c6ca]">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] mb-1">
                  Agente Assegnato
                </dt>
                <dd className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1a1c1a] text-white border border-[#1a1c1a] flex items-center justify-center font-bold text-[11px]">
                    {practice.assignedAgent.initials}
                  </div>
                  <span className="font-semibold text-[#1a1c1a]">{practice.assignedAgent.name}</span>
                </dd>
              </div>

              <div className="pt-3 border-t border-[#c7c6ca]">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] mb-0.5">
                  Valore Stimato
                </dt>
                <dd className="text-[22px] font-serif-display font-bold text-[#1a1c1a]">
                  € {practice.estimatedValue.toLocaleString('it-IT')}
                </dd>
              </div>
            </dl>
          </div>

          {/* Note Recenti */}
          <div className="border border-[#c7c6ca] bg-[#efeeeb] p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] mb-4 border-b border-[#c7c6ca] pb-2">
              Note Recenti
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {practice.notes.length === 0 ? (
                <p className="text-[13px] text-[#76777b]">Nessuna nota registrata.</p>
              ) : (
                practice.notes.map((note) => (
                  <div key={note.id} className="text-[13px] border-b border-[#c7c6ca]/60 pb-3 last:border-0 last:pb-0">
                    <p className="text-[10px] font-mono text-[#76777b] mb-0.5">
                      {note.date}, {note.time} · {note.author}
                    </p>
                    <p className="text-[#1a1c1a] leading-relaxed">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="mt-4 text-[11px] uppercase font-bold tracking-wider text-[#1a1c1a] hover:text-[#a14009] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Aggiungi Nota
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Fixed Contact Bar (Stitch Image 5) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#c7c6ca] p-3 z-40 flex md:hidden gap-3 shadow-lg">
        <a
          href={`tel:${client?.phone || ''}`}
          className="flex-1 bg-[#1a1c1a] text-white py-3 font-bold text-[11px] uppercase tracking-widest flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">call</span> CHIAMA
        </a>
        <a
          href={`mailto:${client?.email || ''}`}
          className="flex-1 border border-[#1a1c1a] text-[#1a1c1a] py-3 font-bold text-[11px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-[#f4f3f1]"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span> MESSAGGIO
        </a>
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        practiceId={practice.id}
        targetDocId={uploadDocTargetId}
        targetDocLabel={uploadDocTargetLabel}
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadDocTargetId(null);
          setUploadDocTargetLabel(null);
        }}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        practiceId={practice.id}
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
      />
    </div>
  );
};
