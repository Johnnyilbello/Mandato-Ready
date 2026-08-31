'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DocumentUploadModal } from '../common/DocumentUploadModal';
import { AddNoteModal } from '../common/AddNoteModal';
import { ContextualHelp } from '@/components/common/ContextualHelp';
import { deriveMissingItems, deriveNextAction } from '@/lib/nextAction';
import type { DocumentCategory, DocumentItem, DocumentStatus } from '@/lib/types';

const DOCUMENT_GROUPS: Array<{ category: DocumentCategory; title: string }> = [
  { category: 'cliente', title: 'Cliente' },
  { category: 'immobile', title: 'Immobile' },
  { category: 'incarico', title: 'Incarico' },
  { category: 'antiriciclaggio', title: 'Antiriciclaggio' },
];

const statusClass = (status: DocumentStatus) => {
  if (status === 'Disponibile' || status === 'Firmato') return 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]';
  if (status === 'Da recuperare') return 'bg-[#fff3e0] text-[#8a3b00] border-[#d8a47f]';
  if (status === 'Da verificare' || status === 'Bozza') return 'bg-[#fff8e1] text-[#8a5600] border-[#ffe082]';
  return 'bg-[#efeeeb] text-[#5f6063] border-[#c7c6ca]';
};

export const PracticeDetailView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getClientById,
    getPropertyById,
    getDocumentsByPracticeId,
    getMandateByPracticeId,
    getSigningProcessByPracticeId,
    getAmlDossierByPracticeId,
    practiceActiveSubTab,
    setPracticeActiveSubTab,
    focusedPracticeSection,
    closePracticeDetail,
    setActiveTab,
    setSelectedClientId,
    setSelectedPropertyId,
    agencyProfile,
    isHelpModeActive,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || '');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ id?: string; label?: string }>({});
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const client = getClientById(practice?.clientId);
  const property = getPropertyById(practice?.propertyId);
  const documents = practice ? getDocumentsByPracticeId(practice.id) : [];
  const mandate = getMandateByPracticeId(practice?.id || '');
  const signingProcess = getSigningProcessByPracticeId(practice?.id || '');
  const amlDossier = getAmlDossierByPracticeId(practice?.id || '');

  const stateSnapshot = useMemo(
    () =>
      practice
        ? {
            practice,
            client,
            property,
            documents,
            mandate,
            signingProcess,
            amlDossier,
            amlEnabled: agencyProfile.workPreferences.enableAmlModule,
          }
        : null,
    [agencyProfile.workPreferences.enableAmlModule, amlDossier, client, documents, mandate, practice, property, signingProcess]
  );

  const nextAction = stateSnapshot ? deriveNextAction(stateSnapshot) : null;
  const missingItems = stateSnapshot ? deriveMissingItems(stateSnapshot) : [];

  useEffect(() => {
    if (!focusedPracticeSection) return;
    const element = document.getElementById(`section-${focusedPracticeSection}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusedPracticeSection]);

  if (!practice || !stateSnapshot || !nextAction) {
    return (
      <div className="p-8 text-center">
        <p>Pratica non trovata.</p>
        <button onClick={closePracticeDetail} className="mt-4 underline">Torna alle pratiche</button>
      </div>
    );
  }

  const openDocument = (document?: DocumentItem) => {
    setUploadTarget({ id: document?.id, label: document?.label });
    setIsUploadModalOpen(true);
  };

  const handleNextAction = () => {
    switch (nextAction.targetSection) {
      case 'cliente':
        setSelectedClientId(practice.clientId);
        setActiveTab('clienti');
        break;
      case 'immobile':
        setSelectedPropertyId(practice.propertyId);
        setActiveTab('immobili');
        break;
      case 'incarico':
        setActiveTab('incarico_wizard');
        break;
      case 'firma':
        setActiveTab('firma_process');
        break;
      case 'aml':
        setActiveTab('aml_wizard');
        break;
      case 'documenti': {
        setPracticeActiveSubTab('documenti');
        const target = documents.find((document) => document.id === nextAction.documentIdToUpload)
          || documents.find((document) => document.isMissingRequired && document.status !== 'Disponibile' && document.status !== 'Firmato');
        if (target) openDocument(target);
        break;
      }
      case 'proposte':
        document.getElementById('section-proposte')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      default:
        setPracticeActiveSubTab('dettagli');
    }
  };

  const displayClientName = client?.entityType === 'azienda'
    ? client.companyName || `${client.firstName} ${client.lastName}`
    : `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Cliente da completare';
  const displayAddress = property?.address?.trim() || 'Indirizzo da definire';

  const workflow = [
    { key: 'cliente', title: 'Cliente', state: client ? 'Collegato' : 'Da completare' },
    { key: 'immobile', title: 'Immobile', state: property ? 'Collegato' : 'Da completare' },
    { key: 'incarico', title: 'Incarico', state: mandate?.status || 'Da compilare' },
    { key: 'documenti', title: 'Documenti', state: practice.documentStatus === 'pronto' ? 'Pronti' : 'In corso' },
    { key: 'aml', title: 'Antiriciclaggio', state: agencyProfile.workPreferences.enableAmlModule ? (amlDossier?.status || 'Da iniziare') : 'Non previsto' },
    { key: 'proposte', title: 'Proposte', state: practice.proposalStatus === 'nessuna' ? 'Nessuna' : practice.proposalStatus },
    { key: 'conclusione', title: 'Conclusione', state: practice.status === 'Completato' ? 'Completata' : 'Più avanti' },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans pb-24 md:pb-12 overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-md border-b border-[#c7c6ca]/80 px-4 sm:px-6 md:px-12 py-4 md:py-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <button onClick={closePracticeDetail} className="flex items-center gap-2 text-[#76777b] hover:text-[#1a1c1a] text-[11px] uppercase tracking-widest font-semibold mb-2">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Torna alle pratiche
          </button>
          <h1 className="text-[24px] md:text-[32px] font-serif-display font-bold leading-tight break-words">
            {displayClientName}
            <span className="text-[#c7c6ca] font-normal mx-2">|</span>
            <span className="font-normal text-[19px] md:text-[27px] text-[#46474a]">{displayAddress} · {property?.municipality || 'Comune da completare'}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#efeeeb] border border-[#c7c6ca] text-[10px] uppercase font-bold tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-[#a14009]" />{practice.status}</span>
            <span className="text-[#76777b] text-[12px] font-mono">{practice.code}</span>
            <span className="text-[#76777b] text-[11px] uppercase tracking-wider">{practice.practiceType}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button onClick={() => setPracticeActiveSubTab(practiceActiveSubTab === 'documenti' ? 'dettagli' : 'documenti')} className="px-4 py-2.5 bg-[#faf9f6] border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0]">
            {practiceActiveSubTab === 'documenti' ? 'Vista pratica' : 'Workspace documenti'}
          </button>
          <button onClick={handleNextAction} className="px-5 py-2.5 bg-[#a14009] text-white hover:bg-[#7d2d00] text-[11px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
            Continua pratica <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-12 py-8 max-w-[1440px] mx-auto">
        {practiceActiveSubTab === 'documenti' ? (
          <section aria-labelledby="document-workspace-title">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-[#c7c6ca]">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#a14009]">FASCICOLO SEMANTICO</span>
                <h2 id="document-workspace-title" className="text-[28px] md:text-[34px] font-serif-display font-bold">Document Workspace</h2>
                <p className="text-[13px] text-[#76777b] mt-1">I documenti sono raggruppati per significato e aggiornano automaticamente “Cosa manca” e “Prossimo passo”.</p>
              </div>
              <button onClick={() => openDocument()} className="px-5 py-2.5 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest">+ Aggiungi documento</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {DOCUMENT_GROUPS.map((group) => {
                const groupDocuments = documents.filter((item) => item.category === group.category);
                return (
                  <div key={group.category} className="border border-[#c7c6ca] bg-[#faf9f6] p-5 sm:p-6 min-w-0">
                    <div className="flex items-center justify-between gap-3 border-b border-[#c7c6ca] pb-3 mb-4">
                      <h3 className="text-[18px] font-serif-display font-bold">{group.title}</h3>
                      <span className="text-[10px] font-mono text-[#76777b]">{groupDocuments.length} elementi</span>
                    </div>
                    {groupDocuments.length === 0 ? (
                      <p className="text-[12px] text-[#76777b] py-4">Nessun documento in questa sezione.</p>
                    ) : (
                      <div className="space-y-3">
                        {groupDocuments.map((item) => (
                          <div key={item.id} className="p-4 bg-white border border-[#c7c6ca] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                            <div className="min-w-0">
                              <div className="font-bold text-[13px] break-words">{item.label}</div>
                              <div className="text-[11px] text-[#76777b] break-words mt-0.5">{item.subtitle}</div>
                              {item.mockFileName && <div className="text-[10px] font-mono text-[#76777b] mt-1 break-all">{item.mockFileName}</div>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-1 border text-[9px] uppercase font-bold tracking-wider ${statusClass(item.status)}`}>{item.status}</span>
                              <button onClick={() => openDocument(item)} className="px-2.5 py-1.5 border border-[#1a1c1a] text-[9px] uppercase font-bold hover:bg-[#1a1c1a] hover:text-white">Aggiorna</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8 min-w-0">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b]">Priorità operativa</h2>
                  <ContextualHelp conceptId="prossimo_passo" alwaysVisible={isHelpModeActive} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-3 border-2 border-[#1a1c1a] bg-[#faf9f6] p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-3"><span className="material-symbols-outlined text-[#a14009]">arrow_forward</span><h3 className="text-[20px] font-serif-display font-bold">Prossimo passo</h3></div>
                    <h4 className="text-[17px] font-bold mb-2">{nextAction.title}</h4>
                    <p className="text-[14px] text-[#46474a] leading-relaxed mb-6">{nextAction.description}</p>
                    <button onClick={handleNextAction} className="w-full sm:w-auto px-6 py-3 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest hover:bg-[#333533]">{nextAction.ctaText}</button>
                  </div>
                  <div className="md:col-span-2 border border-[#c7c6ca] bg-white p-6 min-w-0">
                    <div className="flex items-center gap-2 mb-3"><h3 className="text-[18px] font-serif-display font-bold">Cosa manca</h3><ContextualHelp conceptId="cosa_manca" alwaysVisible={isHelpModeActive} /></div>
                    {missingItems.length === 0 ? <p className="text-[13px] text-[#1b5e20]">Nessun elemento essenziale mancante.</p> : <ul className="space-y-2">{missingItems.slice(0, 6).map((item) => <li key={item} className="flex gap-2 text-[13px] text-[#46474a]"><span className="text-[#a14009]">•</span><span className="break-words">{item}</span></li>)}</ul>}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] border-b border-[#c7c6ca] pb-2 mb-4">Workflow</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {workflow.map((stage, index) => (
                    <div id={`section-${stage.key}`} key={stage.key} className="p-4 border border-[#c7c6ca] bg-[#faf9f6] min-w-0 scroll-mt-28">
                      <div className="flex items-center gap-2"><span className="w-5 h-5 bg-[#efeeeb] flex items-center justify-center text-[9px] font-bold text-[#76777b] shrink-0">{index + 1}</span><h3 className="text-[13px] font-bold uppercase tracking-wider truncate">{stage.title}</h3></div>
                      <p className="text-[12px] text-[#76777b] mt-2 break-words">{stage.state}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="section-documenti" className="scroll-mt-28">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c7c6ca] pb-3 mb-4">
                  <div><h2 className="text-[20px] font-serif-display font-bold">Documenti</h2><p className="text-[12px] text-[#76777b]">{documents.filter((item) => item.status === 'Disponibile' || item.status === 'Firmato').length}/{documents.length} disponibili o firmati</p></div>
                  <button onClick={() => setPracticeActiveSubTab('documenti')} className="px-4 py-2 border border-[#1a1c1a] text-[10px] uppercase font-bold tracking-wider">Apri workspace</button>
                </div>
                <div className="space-y-2">
                  {documents.slice(0, 6).map((item) => (
                    <button key={item.id} onClick={() => openDocument(item)} className="w-full p-3 bg-white border border-[#c7c6ca] flex items-center justify-between gap-3 text-left min-w-0 hover:border-[#1a1c1a]">
                      <span className="min-w-0"><span className="text-[13px] font-bold block truncate">{item.label}</span><span className="text-[11px] text-[#76777b] truncate block">{item.subtitle}</span></span>
                      <span className={`px-2 py-1 border text-[9px] uppercase font-bold tracking-wider shrink-0 ${statusClass(item.status)}`}>{item.status}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <aside className="xl:col-span-4 space-y-6 min-w-0">
              <section className="border border-[#c7c6ca] bg-white p-5">
                <h2 className="text-[16px] font-serif-display font-bold border-b border-[#c7c6ca] pb-2 mb-4">Cliente & immobile</h2>
                <button onClick={() => { setSelectedClientId(practice.clientId); setActiveTab('clienti'); }} className="w-full text-left p-3 border border-[#c7c6ca] hover:border-[#1a1c1a] mb-3"><span className="text-[10px] uppercase tracking-widest font-bold text-[#76777b] block">Cliente</span><span className="text-[14px] font-bold break-words">{displayClientName}</span></button>
                <button onClick={() => { setSelectedPropertyId(practice.propertyId); setActiveTab('immobili'); }} className="w-full text-left p-3 border border-[#c7c6ca] hover:border-[#1a1c1a]"><span className="text-[10px] uppercase tracking-widest font-bold text-[#76777b] block">Immobile</span><span className="text-[14px] font-bold break-words">{property?.type || 'Da completare'} · {displayAddress}</span></button>
              </section>

              <section className="border border-[#c7c6ca] bg-white p-5">
                <div className="flex items-center justify-between gap-3 border-b border-[#c7c6ca] pb-2 mb-4"><h2 className="text-[16px] font-serif-display font-bold">Note & cronologia</h2><button onClick={() => setIsNoteModalOpen(true)} className="text-[10px] uppercase font-bold text-[#a14009]">+ Nota</button></div>
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {practice.notes.length === 0 ? <p className="text-[12px] text-[#76777b]">Nessuna nota.</p> : practice.notes.map((note) => (
                    <div key={note.id} className="border-l-2 border-[#c7c6ca] pl-3"><div className="text-[10px] font-mono text-[#76777b]">{note.date} · {note.time}</div><p className="text-[12px] text-[#46474a] mt-1 break-words">{note.text}</p><span className="text-[10px] text-[#76777b]">{note.author}</span></div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>

      <DocumentUploadModal practiceId={practice.id} targetDocId={uploadTarget.id} targetDocLabel={uploadTarget.label} isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <AddNoteModal practiceId={practice.id} isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} />
    </div>
  );
};
