'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Mandate } from '@/lib/types';

type WizardStep = 1 | 2 | 3 | 4;

export const IncaricoWizardView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getClientById,
    getPropertyById,
    getMandateByPracticeId,
    updateMandate,
    updatePractice,
    openNewClientModal,
    setActiveTab,
    addPracticeNote,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || '');
  const mandate = getMandateByPracticeId(practice?.id || '');
  const property = getPropertyById(practice?.propertyId);

  const initialClientIds = practice?.clientId ? [practice.clientId] : [];
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [clientIds, setClientIds] = useState<string[]>(mandate?.clientIds.length ? mandate.clientIds : initialClientIds);
  const propertyId = mandate?.propertyId || practice?.propertyId || '';
  const [mandateType, setMandateType] = useState(mandate?.mandateType || 'Vendita');
  const [exclusivity, setExclusivity] = useState(mandate?.exclusivity || 'In esclusiva');

  const today = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setMonth(defaultEnd.getMonth() + 6);
  const sixMonths = defaultEnd.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(mandate?.startDate || today);
  const [endDate, setEndDate] = useState(mandate?.endDate || sixMonths);
  const [askingPrice, setAskingPrice] = useState<number>(mandate?.askingPrice || property?.askingPrice || 0);
  const [commissionType, setCommissionType] = useState(mandate?.commissionType || 'percentuale');
  const [commissionValue, setCommissionValue] = useState(mandate?.commissionValue || '3');
  const [notes, setNotes] = useState(mandate?.notes || '');
  const [customClauses, setCustomClauses] = useState(mandate?.customClauses || '');
  const [reviewGenerated, setReviewGenerated] = useState(mandate?.status === 'Da controllare');

  if (!practice) {
    return <div className="p-12 text-center text-[#76777b]">Pratica non trovata.</div>;
  }

  const nextStep = () => {
    setCurrentStep((previous) => (previous < 4 ? ((previous + 1) as WizardStep) : previous));
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((previous) => ((previous - 1) as WizardStep));
    } else {
      setActiveTab('pratiche');
    }
  };

  const mandatePayload = (): Partial<Mandate> & { practiceId: string } => ({
    practiceId: practice.id,
    clientIds,
    propertyId,
    mandateType,
    exclusivity,
    startDate,
    endDate,
    askingPrice,
    commissionType,
    commissionValue,
    notes,
    customClauses,
  });

  const handleSaveDraft = () => {
    updateMandate({ ...mandatePayload(), status: 'Bozza' });
    updatePractice(practice.id, { mandateStatus: 'da_preparare' });
    addPracticeNote(practice.id, 'Incarico salvato come bozza.');
    setActiveTab('pratiche');
  };

  const buildSignatories = (): Mandate['signatories'] =>
    clientIds.map((clientId) => {
      const client = getClientById(clientId);
      const displayName = client?.entityType === 'azienda'
        ? client.companyName || `${client.firstName} ${client.lastName}`
        : `${client?.firstName || ''} ${client?.lastName || ''}`.trim();
      return {
        id: clientId,
        name: displayName || 'Firmatario',
        role: 'Proprietario',
        email: client?.email || '',
        phone: client?.phone || '',
        status: 'Da invitare' as const,
      };
    });

  const handleGenerateReview = () => {
    updateMandate({
      ...mandatePayload(),
      status: 'Da controllare',
      signatories: buildSignatories(),
    });
    updatePractice(practice.id, { mandateStatus: 'da_preparare' });
    addPracticeNote(practice.id, 'Bozza incarico generata e pronta per il controllo operatore.');
    setReviewGenerated(true);
  };

  const handleApproveForSigning = () => {
    updateMandate({
      ...mandatePayload(),
      status: 'Pronto per la firma',
      signatories: buildSignatories(),
    });
    updatePractice(practice.id, { mandateStatus: 'da_firmare' });
    addPracticeNote(practice.id, 'Bozza incarico controllata e preparata per la firma simulata.');
    setActiveTab('firma_process');
  };

  const addSignatory = () => {
    openNewClientModal({}, (client) => {
      setClientIds((previous) => (previous.includes(client.id) ? previous : [...previous, client.id]));
    });
  };

  const canProceed = clientIds.length > 0 && Boolean(propertyId);

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans pb-24 overflow-x-hidden">
      <div className="mb-8 flex items-center justify-between gap-3">
        <button
          onClick={previousStep}
          className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Indietro
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b]">Template demo · non validato legalmente</span>
      </div>

      <div className="flex items-center gap-2 mb-8" aria-label={`Passaggio ${currentStep} di 4`}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 ${step <= currentStep ? 'bg-[#1a1c1a]' : 'bg-[#e6e5e8]'}`}
          />
        ))}
      </div>

      {currentStep === 1 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Chi conferisce l&apos;incarico?</h1>
          <p className="text-[14px] text-[#76777b] mb-8">I dati già presenti in anagrafica vengono riutilizzati. Non devi reinserirli.</p>

          <div className="space-y-4">
            {clientIds.map((clientId) => {
              const client = getClientById(clientId);
              return (
                <div key={clientId} className="p-4 border border-[#c7c6ca] bg-[#faf9f6] flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#1a1c1a] truncate">
                      {client?.entityType === 'azienda' ? client.companyName : `${client?.firstName || ''} ${client?.lastName || ''}`}
                    </div>
                    <div className="text-[12px] text-[#76777b] break-all">{client?.email || 'Email da completare'} · {client?.phone || 'Telefono da completare'}</div>
                  </div>
                  {clientIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setClientIds((previous) => previous.filter((id) => id !== clientId))}
                      className="text-[10px] uppercase font-bold text-[#76777b] hover:text-[#a14009] shrink-0"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={addSignatory}
              className="w-full p-4 border border-dashed border-[#c7c6ca] text-[#76777b] hover:text-[#1a1c1a] hover:border-[#1a1c1a] transition-colors text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Aggiungi soggetto
            </button>
          </div>

          <div className="mt-12 flex items-center justify-end">
            <button
              onClick={nextStep}
              disabled={clientIds.length === 0}
              className="bg-[#1a1c1a] disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors"
            >
              Continua
            </button>
          </div>
        </section>
      )}

      {currentStep === 2 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Confermiamo l&apos;immobile</h1>
          <p className="text-[14px] text-[#76777b] mb-8">La scheda associata alla pratica è precompilata e rimane un&apos;entità condivisa.</p>

          <div className="p-5 sm:p-6 border border-[#c7c6ca] bg-[#faf9f6]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Tipologia</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.type || 'Da completare'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Comune</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.municipality || 'Da completare'} {property?.province ? `(${property.province})` : ''}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Indirizzo</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.address || 'Indirizzo da definire'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Superficie indicativa dichiarata</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.approximateSurface ? `~${property.approximateSurface} m²` : 'Non indicata'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Prezzo richiesto</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.askingPrice ? `€ ${property.askingPrice.toLocaleString('it-IT')}` : 'Non indicato'}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
            <button onClick={handleSaveDraft} className="text-[12px] font-bold text-[#76777b] hover:text-[#1a1c1a] underline self-start">Salva bozza</button>
            <button
              onClick={nextStep}
              disabled={!canProceed}
              className="bg-[#1a1c1a] disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors"
            >
              Continua
            </button>
          </div>
        </section>
      )}

      {currentStep === 3 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Definiamo l&apos;incarico</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Inserisci le condizioni concordate. Il prezzo è quello richiesto dal proprietario, non una valutazione Mandato Ready.</p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
                Tipo di incarico
                <select value={mandateType} onChange={(event) => setMandateType(event.target.value)} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal normal-case tracking-normal">
                  <option>Vendita</option>
                  <option>Locazione</option>
                  <option>Altro</option>
                </select>
              </label>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
                Esclusiva
                <select value={exclusivity} onChange={(event) => setExclusivity(event.target.value)} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal normal-case tracking-normal">
                  <option>In esclusiva</option>
                  <option>Non in esclusiva</option>
                  <option>Da definire</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#c7c6ca] pt-6">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
                Data inizio
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal" />
              </label>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
                Data scadenza
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal" />
              </label>
            </div>

            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] border-t border-[#c7c6ca] pt-6">
              Prezzo richiesto dal proprietario (€)
              <input type="number" min="0" value={askingPrice || ''} onChange={(event) => setAskingPrice(Number(event.target.value) || 0)} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white text-[16px] font-mono font-normal" placeholder="Opzionale" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#c7c6ca] pt-6">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
                Tipo provvigione
                <select value={commissionType} onChange={(event) => setCommissionType(event.target.value)} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal normal-case tracking-normal">
                  <option value="percentuale">Percentuale (%)</option>
                  <option value="fisso">Importo fisso (€)</option>
                  <option value="da_definire">Da definire</option>
                </select>
              </label>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
                Valore provvigione
                <input type="text" value={commissionValue} onChange={(event) => setCommissionValue(event.target.value)} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-mono font-normal" />
              </label>
            </div>

            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] border-t border-[#c7c6ca] pt-6">
              Note / condizioni aggiuntive
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal normal-case tracking-normal" />
            </label>

            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
              Clausole personalizzate demo
              <textarea value={customClauses} onChange={(event) => setCustomClauses(event.target.value)} rows={3} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal normal-case tracking-normal" placeholder="Facoltativo. Nessun testo viene considerato validato legalmente da Mandato Ready." />
            </label>
          </div>

          <div className="mt-12 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
            <button onClick={handleSaveDraft} className="text-[12px] font-bold text-[#76777b] hover:text-[#1a1c1a] underline self-start">Salva bozza</button>
            <button onClick={nextStep} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors">Continua</button>
          </div>
        </section>
      )}

      {currentStep === 4 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Controlla prima di procedere</h1>
          <p className="text-[14px] text-[#76777b] mb-8">La bozza usa i dati condivisi di cliente e immobile. Verifica condizioni e firmatari prima della firma simulata.</p>

          <div className="border border-[#c7c6ca] bg-[#faf9f6] p-5 sm:p-6 space-y-5 text-[13px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><span className="block text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Incarico</span><strong>{mandateType} · {exclusivity}</strong></div>
              <div><span className="block text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Durata</span><strong>{startDate} → {endDate}</strong></div>
              <div><span className="block text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Prezzo richiesto</span><strong>{askingPrice ? `€ ${askingPrice.toLocaleString('it-IT')}` : 'Non indicato'}</strong></div>
              <div><span className="block text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Provvigione</span><strong>{commissionValue || 'Da definire'} {commissionType === 'percentuale' ? '%' : commissionType === 'fisso' ? '€' : ''}</strong></div>
            </div>
            <div className="pt-4 border-t border-[#c7c6ca]">
              <span className="block text-[10px] uppercase tracking-widest font-bold text-[#76777b] mb-2">Firmatari</span>
              <ul className="space-y-1">
                {buildSignatories().map((signatory) => <li key={signatory.id}>• {signatory.name} — {signatory.role}</li>)}
              </ul>
            </div>
            {(notes || customClauses) && (
              <div className="pt-4 border-t border-[#c7c6ca] text-[#46474a] whitespace-pre-wrap break-words">
                {notes && <p><strong>Note:</strong> {notes}</p>}
                {customClauses && <p className="mt-2"><strong>Clausole demo:</strong> {customClauses}</p>}
              </div>
            )}
          </div>

          {reviewGenerated && (
            <div className="mt-5 p-4 border border-[#a14009] bg-[#fff8f4] text-[13px] text-[#5f321d]">
              Bozza registrata come <strong>Da controllare</strong>. Se i dati sono corretti, approvala per passare alla configurazione della firma simulata.
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button onClick={() => setCurrentStep(3)} className="px-5 py-3 border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider hover:bg-[#efeeeb]">Modifica condizioni</button>
            {!reviewGenerated ? (
              <button onClick={handleGenerateReview} className="px-8 py-3 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533]">Genera bozza</button>
            ) : (
              <button onClick={handleApproveForSigning} className="px-8 py-3 bg-[#a14009] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#7d2d00] flex items-center justify-center gap-2">
                Approva e prepara firma
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
