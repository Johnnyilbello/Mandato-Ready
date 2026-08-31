'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { AmlDossier } from '@/lib/types';

type AmlStep = 1 | 2 | 3 | 4 | 5 | 6;
type SectionKey = keyof AmlDossier['sections'];

const SECTION_ORDER: SectionKey[] = [
  'soggetti',
  'identificazione',
  'relazioni',
  'operazione',
  'origineFondi',
  'valutazione',
];

const getResumeStep = (dossier?: AmlDossier): AmlStep => {
  if (!dossier) return 1;
  const firstIncompleteIndex = SECTION_ORDER.findIndex((section) => !dossier.sections[section]);
  if (firstIncompleteIndex === -1) return 6;
  return (firstIncompleteIndex + 1) as AmlStep;
};

export const AmlWizardView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getClientById,
    getPropertyById,
    getAmlDossierByPracticeId,
    updateAmlDossier,
    updatePractice,
    setActiveTab,
    addPracticeNote,
    agencyProfile,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || '');
  const dossier = getAmlDossierByPracticeId(practice?.id || '');
  const client = getClientById(practice?.clientId);
  const property = getPropertyById(practice?.propertyId);

  const initialSections = useMemo<AmlDossier['sections']>(
    () =>
      dossier?.sections || {
        soggetti: false,
        identificazione: false,
        relazioni: false,
        operazione: false,
        origineFondi: false,
        valutazione: false,
      },
    [dossier?.sections]
  );

  const [currentStep, setCurrentStep] = useState<AmlStep>(() => getResumeStep(dossier));
  const [sections, setSections] = useState<AmlDossier['sections']>(initialSections);
  const [riskLevel, setRiskLevel] = useState<AmlDossier['riskAssessment']['level']>(
    dossier?.riskAssessment?.level || ''
  );
  const [riskNotes, setRiskNotes] = useState(dossier?.riskAssessment?.notes || '');

  if (!practice) {
    return <div className="p-12 text-center text-[#76777b]">Pratica non trovata.</div>;
  }

  const nextStep = () =>
    setCurrentStep((previous) => (previous < 6 ? ((previous + 1) as AmlStep) : previous));

  const previousStep = () => {
    if (currentStep > 1) setCurrentStep((previous) => ((previous - 1) as AmlStep));
    else setActiveTab('pratiche');
  };

  const saveSectionAndContinue = (section: SectionKey) => {
    const updatedSections = { ...sections, [section]: true };
    setSections(updatedSections);
    updateAmlDossier({
      practiceId: practice.id,
      sections: updatedSections,
      status: 'In corso',
    });
    updatePractice(practice.id, { amlStatus: 'in_corso' });
    nextStep();
  };

  const handleComplete = () => {
    if (!riskLevel) return;
    const completedSections = { ...sections, valutazione: true };
    updateAmlDossier({
      practiceId: practice.id,
      sections: completedSections,
      riskAssessment: {
        level: riskLevel,
        notes: riskNotes.trim(),
        date: new Date().toISOString(),
        operatorName: agencyProfile.agentName,
      },
      status: 'Completato operativamente',
    });
    updatePractice(practice.id, {
      amlStatus: 'completato',
      amlWorkflow: {
        clienteIdentificato: true,
        informazioniRaccolte: true,
        titolareEffettivoVerificato: true,
        fascicoloCompleto: true,
      },
    });
    addPracticeNote(
      practice.id,
      `Fascicolo antiriciclaggio completato operativamente. Valutazione ${riskLevel} inserita dall’operatore ${agencyProfile.agentName}.`
    );
    setActiveTab('pratiche');
  };

  const clientName = client?.entityType === 'azienda'
    ? client.companyName || `${client.firstName} ${client.lastName}`
    : `${client?.firstName || ''} ${client?.lastName || ''}`.trim();

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans pb-24 overflow-x-hidden">
      <div className="mb-6 p-4 border border-[#d8a47f] bg-[#fffaf5] text-[12px] text-[#5f3a20] leading-relaxed">
        <strong>Supporto operativo, non certificazione:</strong> Mandato Ready organizza il fascicolo e conserva la valutazione
        scelta dall&apos;operatore. Non determina automaticamente il rischio AML e non certifica la conformità normativa.
      </div>

      <div className="mb-8 flex items-center justify-between gap-3">
        <button
          onClick={previousStep}
          className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Indietro
        </button>
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#76777b]">
          Fascicolo AML · {currentStep} di 6
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8" aria-label={`Passaggio AML ${currentStep} di 6`}>
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className={`h-1.5 flex-1 ${step <= currentStep ? 'bg-[#1a1c1a]' : 'bg-[#e6e5e8]'}`} />
        ))}
      </div>

      {currentStep === 1 && (
        <section>
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Soggetti coinvolti</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Il cliente viene riutilizzato dalla pratica, senza duplicare l&apos;anagrafica.</p>
          <div className="p-5 border border-[#c7c6ca] bg-[#faf9f6]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-[14px] font-bold text-[#1a1c1a]">{clientName || 'Cliente da completare'}</div>
                <div className="text-[12px] text-[#76777b] break-all">{client?.email || 'Email non presente'} · {client?.phone || 'Telefono non presente'}</div>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#a14009] px-2 py-1 bg-[#ffdbcd] border border-[#a14009] self-start sm:self-center">
                Anagrafica condivisa
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Cliente', 'Esecutore', 'Titolare effettivo'].map((role) => (
                <span key={role} className="text-[12px] border border-[#c7c6ca] px-3 py-1.5 bg-white">{role}</span>
              ))}
            </div>
          </div>
          <button
            type="button"
            disabled
            title="La gestione AML multi-soggetto strutturata è prevista in una fase successiva."
            className="mt-4 w-full p-4 border border-dashed border-[#c7c6ca] text-[#9a9a9a] bg-[#f7f6f4] text-[12px] font-bold uppercase tracking-wider cursor-not-allowed"
          >
            + Altro soggetto — non disponibile in Phase 1
          </button>
          <div className="mt-12 flex justify-end">
            <button onClick={() => saveSectionAndContinue('soggetti')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533]">Conferma e continua</button>
          </div>
        </section>
      )}

      {currentStep === 2 && (
        <section>
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Dati di identificazione</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Verifica i dati disponibili nella scheda cliente. I dati mancanti si completano nell&apos;anagrafica condivisa.</p>
          <div className="p-5 sm:p-6 border border-[#c7c6ca] bg-[#faf9f6] space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Codice fiscale</span>
              <p className="font-mono text-[13px] text-[#1a1c1a] break-all">{client?.fiscalCode || 'Non presente'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Residenza / sede</span>
              <p className="text-[13px] text-[#1a1c1a]">
                {client?.residence?.address || client?.address || 'Indirizzo non presente'}
                {(client?.residence?.municipality || client?.city) ? ` · ${client?.residence?.municipality || client?.city}` : ''}
              </p>
            </div>
            <div className="pt-4 border-t border-[#c7c6ca]">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Documento</span>
              <p className="text-[13px] text-[#1a1c1a]">
                {client?.identityDocument?.type || 'Tipo da completare'} · {client?.identityDocument?.number || 'numero da completare'}
              </p>
            </div>
          </div>
          <div className="mt-12 flex justify-end">
            <button onClick={() => saveSectionAndContinue('identificazione')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533]">Continua</button>
          </div>
        </section>
      )}

      {currentStep === 3 && (
        <section>
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Relazioni e rappresentanza</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Registra operativamente se il soggetto agisce per conto proprio o tramite rappresentanza.</p>
          <div className="p-5 sm:p-6 border border-[#c7c6ca] bg-[#faf9f6] space-y-4">
            <p className="text-[14px] text-[#1a1c1a]">Il cliente agisce per conto proprio?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 cursor-pointer border border-[#c7c6ca] bg-white px-4 py-3 text-[13px]"><input type="radio" name="representation" defaultChecked /> Sì</label>
              <label className="flex items-center gap-2 cursor-pointer border border-[#c7c6ca] bg-white px-4 py-3 text-[13px]"><input type="radio" name="representation" /> No, delega/procura</label>
            </div>
            <p className="text-[11px] text-[#76777b]">In Phase 1 questa scelta guida il fascicolo; la gestione documentale della procura rimane manuale.</p>
          </div>
          <div className="mt-12 flex justify-end">
            <button onClick={() => saveSectionAndContinue('relazioni')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533]">Continua</button>
          </div>
        </section>
      )}

      {currentStep === 4 && (
        <section>
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Contesto dell&apos;operazione</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Riepilogo operativo della pratica e dell&apos;immobile collegato.</p>
          <div className="p-5 sm:p-6 border border-[#c7c6ca] bg-[#faf9f6] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><span className="text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Tipo operazione</span><p className="font-medium text-[#1a1c1a]">{practice.practiceType}</p></div>
              <div><span className="text-[10px] uppercase tracking-widest font-bold text-[#76777b]">Immobile</span><p className="font-medium text-[#1a1c1a]">{property?.type || 'Da completare'} · {property?.municipality || 'Comune da completare'}</p></div>
            </div>
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] border-t border-[#c7c6ca] pt-5">
              Scopo dichiarato dell&apos;operazione
              <select className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal normal-case tracking-normal">
                <option>Da raccogliere / confermare</option>
                <option>Abitazione principale</option>
                <option>Investimento</option>
                <option>Seconda casa</option>
                <option>Attività commerciale</option>
              </select>
            </label>
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
              Fascia economica dichiarata dell&apos;operazione
              <select className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white font-normal normal-case tracking-normal">
                <option>Da raccogliere / confermare</option>
                <option>Fino a € 250.000</option>
                <option>€ 250.000 – € 500.000</option>
                <option>€ 500.000 – € 1.000.000</option>
                <option>Oltre € 1.000.000</option>
              </select>
            </label>
          </div>
          <div className="mt-12 flex justify-end">
            <button onClick={() => saveSectionAndContinue('operazione')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533]">Continua</button>
          </div>
        </section>
      )}

      {currentStep === 5 && (
        <section>
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Origine dei fondi / dichiarazioni</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Raccogli la dichiarazione dell&apos;interessato nel fascicolo operativo.</p>
          <div className="p-5 sm:p-6 border border-[#c7c6ca] bg-[#faf9f6]">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
              Dichiarazione raccolta
              <textarea rows={5} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white text-[13px] font-normal normal-case tracking-normal" placeholder="Annotazione operativa della dichiarazione raccolta..." />
            </label>
            <p className="text-[11px] text-[#76777b] mt-3">Il testo inserito qui è un supporto alla raccolta manuale e non viene verificato automaticamente.</p>
          </div>
          <div className="mt-12 flex justify-end">
            <button onClick={() => saveSectionAndContinue('origineFondi')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533]">Continua</button>
          </div>
        </section>
      )}

      {currentStep === 6 && (
        <section>
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#a14009]">Valutazione inserita dall&apos;operatore</span>
          <h1 className="text-[30px] sm:text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2 mt-1">Valutazione operativa del rischio</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Seleziona manualmente il livello. Mandato Ready non lo calcola e non propone una certificazione AML.</p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['Basso', 'Medio', 'Alto'] as const).map((level) => (
                <label
                  key={level}
                  className={`p-4 border cursor-pointer text-center transition-colors ${
                    riskLevel === level ? 'border-[#1a1c1a] bg-[#f4f3f1] text-[#1a1c1a]' : 'border-[#c7c6ca] text-[#76777b] bg-white hover:bg-[#faf9f6]'
                  }`}
                >
                  <input type="radio" name="risk" value={level} checked={riskLevel === level} className="sr-only" onChange={() => setRiskLevel(level)} />
                  <span className="font-bold text-[14px] uppercase tracking-widest">{level}</span>
                </label>
              ))}
            </div>

            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a]">
              Note dell&apos;operatore
              <textarea value={riskNotes} onChange={(event) => setRiskNotes(event.target.value)} rows={4} className="mt-2 w-full p-3 border border-[#c7c6ca] bg-white text-[13px] font-normal normal-case tracking-normal" placeholder="Motivazioni e annotazioni operative..." />
            </label>

            <div className="p-4 border border-[#c7c6ca] bg-[#faf9f6] text-[12px] text-[#46474a]">
              Operatore registrato: <strong>{agencyProfile.agentName}</strong>. La responsabilità della valutazione rimane dell&apos;operatore.
            </div>
          </div>

          <div className="mt-12 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <button onClick={() => setCurrentStep(5)} className="text-[12px] font-bold text-[#76777b] hover:text-[#1a1c1a] underline self-start">Torna indietro</button>
            <button
              onClick={handleComplete}
              disabled={!riskLevel}
              className="px-8 py-3 text-[12px] uppercase font-bold tracking-widest bg-[#1a1c1a] text-white hover:bg-[#333533] disabled:bg-[#e6e5e8] disabled:text-[#76777b] disabled:cursor-not-allowed"
            >
              Completa operativamente
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
