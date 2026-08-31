'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Signatory } from '@/lib/types';
import { mockSignatureProvider } from '@/lib/signatureProvider';

export const SigningProcessView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getMandateByPracticeId,
    getSigningProcessByPracticeId,
    getDocumentsByPracticeId,
    updateSigningProcess,
    updateMandate,
    updatePractice,
    uploadOrMarkDocument,
    setActiveTab,
    addPracticeNote,
    agencyProfile,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || '');
  const mandate = getMandateByPracticeId(practice?.id || '');
  const existingProcess = getSigningProcessByPracticeId(practice?.id || '');
  const mandateDocument = practice
    ? getDocumentsByPracticeId(practice.id).find((document) => document.category === 'incarico')
    : undefined;

  const [mode, setMode] = useState<'Sequenziale' | 'Contemporanea'>(
    existingProcess?.mode || 'Contemporanea'
  );

  const initialSignatories = useMemo<Signatory[]>(() => {
    const base = (existingProcess?.signatories || mandate?.signatories || []).map((signatory) => ({
      ...signatory,
    }));

    if (!base.some((signatory) => signatory.role === 'Agenzia')) {
      base.push({
        id: 'agency-signatory',
        name: agencyProfile.agencyName || 'Agenzia',
        role: 'Agenzia',
        email: agencyProfile.email || '',
        phone: agencyProfile.phone || '',
        status: 'Da invitare',
      });
    }

    return base;
  }, [agencyProfile, existingProcess?.signatories, mandate?.signatories]);

  const [signatories, setSignatories] = useState<Signatory[]>(initialSignatories);

  if (!practice || !mandate) {
    return (
      <div className="p-12 text-center text-[#76777b]">
        <p>Prima completa e genera l&apos;incarico.</p>
        <button
          onClick={() => setActiveTab('pratiche')}
          className="mt-4 px-4 py-2 bg-[#1a1c1a] text-white text-[11px] font-bold uppercase tracking-wider"
        >
          Torna alla pratica
        </button>
      </div>
    );
  }

  const displayedSignatories = existingProcess?.signatories || signatories;
  const isConfigurable = !existingProcess || existingProcess.status === 'Da inviare';

  const handleSend = () => {
    const process = mockSignatureProvider.prepare({
      id: existingProcess?.id || `mock-sign-${Date.now()}`,
      documentId: mandate.id,
      practiceId: practice.id,
      mode,
      signatories,
    });
    const sent = mockSignatureProvider.send(process);

    updateSigningProcess(sent);
    updateMandate({ practiceId: practice.id, status: 'Inviato' });
    updatePractice(practice.id, { mandateStatus: 'da_firmare' });
    if (mandateDocument) uploadOrMarkDocument(mandateDocument.id, 'In attesa firma');
    addPracticeNote(practice.id, `Incarico inviato alla firma simulata (${mode}).`);
    setActiveTab('pratiche');
  };

  const handleSimulateSign = (signatoryId: string) => {
    if (!existingProcess) return;

    const nextProcess = mockSignatureProvider.completeSignature(existingProcess, signatoryId);
    if (nextProcess === existingProcess) return;

    updateSigningProcess(nextProcess);
    const signer = nextProcess.signatories.find((signatory) => signatory.id === signatoryId);
    if (signer) addPracticeNote(practice.id, `${signer.name} ha completato la firma simulata.`);

    if (nextProcess.status === 'Completato') {
      updateMandate({ practiceId: practice.id, status: 'Firmato' });
      updatePractice(practice.id, { mandateStatus: 'firmato' });
      if (mandateDocument) uploadOrMarkDocument(mandateDocument.id, 'Firmato');
      addPracticeNote(practice.id, 'Processo di firma simulata completato. Incarico marcato come Firmato.');
    } else {
      updateMandate({ practiceId: practice.id, status: 'Parzialmente firmato' });
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans pb-24 overflow-x-hidden">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => setActiveTab('pratiche')}
          className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] flex items-center gap-1 transition-colors self-start"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Torna alla Pratica
        </button>
        <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 bg-[#fff3e0] text-[#8a3b00] border border-[#d8a47f] self-start">
          Firma simulata · Phase 1
        </span>
      </div>

      <div className="mb-8 p-4 border border-[#d8a47f] bg-[#fffaf5] text-[12px] text-[#5f3a20] leading-relaxed">
        <strong>Nessuna validità legale:</strong> questo flusso usa MockSignatureProvider esclusivamente per testare stati,
        firmatari e UX. Un provider di firma elettronica reale verrà integrato in una fase successiva.
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-4 gap-4">
            <div>
              <h1 className="text-[24px] font-serif-display font-bold text-[#1a1c1a]">Bozza incarico</h1>
              <span className="inline-block mt-1 px-2 py-1 bg-[#efeeeb] text-[#1a1c1a] border border-[#c7c6ca] text-[10px] font-bold uppercase tracking-widest">
                {mandate.status}
              </span>
            </div>
            {isConfigurable && (
              <button
                onClick={() => setActiveTab('incarico_wizard')}
                className="text-[12px] font-bold uppercase text-[#76777b] hover:text-[#1a1c1a] underline shrink-0"
              >
                Modifica dati
              </button>
            )}
          </div>

          <div className="min-h-[520px] bg-[#faf9f6] border border-[#c7c6ca] p-5 sm:p-8 relative flex flex-col shadow-sm">
            <div className="text-center mb-8 border-b border-[#1a1c1a] pb-4">
              <h2 className="text-[18px] font-bold uppercase tracking-widest text-[#1a1c1a]">Incarico di Mediazione</h2>
              <p className="text-[12px] text-[#76777b]">Template demo Mandato Ready</p>
            </div>
            <div className="flex-1 space-y-4 text-[12px] text-[#1a1c1a] break-words">
              <p>Il/I sottoscritto/i:</p>
              <ul className="list-disc pl-4 font-semibold">
                {mandate.signatories
                  .filter((signatory) => signatory.role !== 'Agenzia')
                  .map((signatory) => <li key={signatory.id}>{signatory.name}</li>)}
              </ul>
              <p>
                conferisce/conferiscono incarico all&apos;agenzia per la {mandate.mandateType.toLowerCase()} dell&apos;immobile
                associato alla pratica.
              </p>
              <p>Prezzo richiesto dal proprietario: <strong>€ {mandate.askingPrice.toLocaleString('it-IT')}</strong></p>
              <p>Validità: dal <strong>{mandate.startDate}</strong> al <strong>{mandate.endDate}</strong>.</p>
              <p>
                Provvigione pattuita: <strong>{mandate.commissionValue} {mandate.commissionType === 'percentuale' ? '%' : '€'}</strong>
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#c7c6ca] grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedSignatories.map((signatory) => (
                <div
                  key={signatory.id}
                  className="border border-dashed border-[#a14009] bg-[#ffdbcd]/20 min-h-20 p-3 flex items-center justify-center relative"
                >
                  <span className="text-[9px] font-bold uppercase text-[#a14009] absolute top-1.5 left-2">{signatory.role}</span>
                  {signatory.status === 'Firmato' ? (
                    <span className="text-[15px] font-serif-display italic text-[#1a1c1a] text-center">{signatory.name}</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-[#76777b] mt-3">{signatory.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[380px] min-w-0 space-y-8">
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#1a1c1a] mb-4">Modalità di Firma</h3>
            {isConfigurable ? (
              <div className="space-y-3">
                {(['Sequenziale', 'Contemporanea'] as const).map((candidateMode) => (
                  <button
                    key={candidateMode}
                    type="button"
                    className={`w-full p-4 border text-left transition-colors ${
                      mode === candidateMode ? 'border-[#1a1c1a] bg-[#faf9f6]' : 'border-[#c7c6ca] bg-white hover:bg-[#faf9f6]'
                    }`}
                    onClick={() => setMode(candidateMode)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[18px]">
                        {mode === candidateMode ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <span className="font-bold text-[13px] text-[#1a1c1a]">{candidateMode}</span>
                    </div>
                    <p className="text-[12px] text-[#76777b] pl-6 leading-relaxed">
                      {candidateMode === 'Sequenziale'
                        ? 'Il firmatario successivo viene abilitato soltanto dopo la firma del precedente.'
                        : 'Tutti i firmatari vengono abilitati nello stesso momento.'}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-[#c7c6ca] bg-[#faf9f6]">
                <span className="font-bold text-[13px] text-[#1a1c1a]">{existingProcess?.mode}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#1a1c1a] mb-4">Firmatari</h3>
            <div className="space-y-3">
              {displayedSignatories.map((signatory, index) => {
                const canSign = existingProcess?.status === 'In corso' && signatory.status === 'In attesa di firma';
                return (
                  <div key={signatory.id} className="p-3 border border-[#c7c6ca] bg-white flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#efeeeb] text-[#76777b] flex items-center justify-center text-[10px] font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#1a1c1a] truncate">{signatory.name}</div>
                        <div className="text-[11px] text-[#76777b]">{signatory.role} · {signatory.status}</div>
                      </div>
                    </div>
                    {canSign && (
                      <button
                        onClick={() => handleSimulateSign(signatory.id)}
                        className="text-[10px] bg-[#a14009] text-white px-2.5 py-1.5 uppercase font-bold shrink-0"
                      >
                        Simula firma
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isConfigurable && (
            <div className="pt-6 border-t border-[#c7c6ca]">
              <button
                onClick={handleSend}
                disabled={signatories.length === 0}
                className="w-full bg-[#1a1c1a] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-4 text-[13px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Invia alla firma simulata
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
