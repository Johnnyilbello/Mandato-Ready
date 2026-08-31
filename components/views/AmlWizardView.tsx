import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export const AmlWizardView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getClientById,
    getAmlDossierByPracticeId,
    updateAmlDossier,
    updatePractice,
    setActiveTab,
    addPracticeNote,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || '');
  const dossier = getAmlDossierByPracticeId(practice?.id || '');

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  
  const initialSections = dossier?.sections || {
    soggetti: false,
    identificazione: false,
    relazioni: false,
    operazione: false,
    origineFondi: false,
    valutazione: false
  };

  const [sections, setSections] = useState(initialSections);
  const [riskLevel, setRiskLevel] = useState(dossier?.riskAssessment?.level || '');
  const [riskNotes, setRiskNotes] = useState(dossier?.riskAssessment?.notes || '');

  if (!practice) {
    return <div className="p-12 text-center text-[#76777b]">Pratica non trovata.</div>;
  }

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
    else setActiveTab('pratiche');
  };

  const handleSaveProgress = (completedSection: keyof typeof sections) => {
    const updatedSections = { ...sections, [completedSection]: true };
    setSections(updatedSections);
    
    updateAmlDossier({
      practiceId: practice.id,
      sections: updatedSections,
      status: 'In corso'
    });
    
    handleNext();
  };

  const handleComplete = () => {
    updateAmlDossier({
      practiceId: practice.id,
      sections: { ...sections, valutazione: true },
      riskAssessment: {
        level: riskLevel,
        notes: riskNotes,
        date: new Date().toISOString()
      },
      status: 'Completato operativamente'
    });
    updatePractice(practice.id, { 
      amlStatus: 'completato',
      amlWorkflow: {
        clienteIdentificato: true,
        informazioniRaccolte: true,
        titolareEffettivoVerificato: true,
        fascicoloCompleto: true
      }
    });
    addPracticeNote(practice.id, 'Fascicolo Antiriciclaggio completato e valutazione inserita');
    setActiveTab('pratiche');
  };

  const client = getClientById(practice.clientId);

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 font-sans pb-24">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Indietro
        </button>
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#76777b]">
          Fascicolo AML · {currentStep} di 6
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full ${
              step <= currentStep ? 'bg-[#1a1c1a]' : 'bg-[#e6e5e8]'
            }`}
          />
        ))}
      </div>

      {currentStep === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Soggetti coinvolti</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Definisci il ruolo di ogni soggetto nell&apos;operazione.</p>
          
          <div className="space-y-4">
            <div className="p-4 border border-[#c7c6ca] bg-[#faf9f6]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-bold text-[#1a1c1a]">{client?.firstName} {client?.lastName}</span>
                <span className="text-[10px] uppercase font-bold text-[#a14009] px-2 py-1 bg-[#ffdbcd] border border-[#a14009]">
                  Già in anagrafica
                </span>
              </div>
              <div className="text-[13px] text-[#76777b]">
                Seleziona i ruoli AML per questo soggetto:
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <label className="flex items-center gap-2 text-[13px] border border-[#c7c6ca] px-3 py-1 bg-white cursor-pointer hover:bg-[#f4f3f1]">
                  <input type="checkbox" defaultChecked /> Cliente
                </label>
                <label className="flex items-center gap-2 text-[13px] border border-[#c7c6ca] px-3 py-1 bg-white cursor-pointer hover:bg-[#f4f3f1]">
                  <input type="checkbox" defaultChecked /> Esecutore
                </label>
                <label className="flex items-center gap-2 text-[13px] border border-[#c7c6ca] px-3 py-1 bg-white cursor-pointer hover:bg-[#f4f3f1]">
                  <input type="checkbox" defaultChecked /> Titolare Effettivo
                </label>
              </div>
            </div>
            
            <button className="w-full p-4 border border-dashed border-[#c7c6ca] text-[#76777b] hover:text-[#1a1c1a] hover:border-[#1a1c1a] transition-colors text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Aggiungi Altro Soggetto
            </button>
          </div>
          
          <div className="mt-12 flex justify-end">
            <button onClick={() => handleSaveProgress('soggetti')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors">
              Conferma e Continua
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Dati di identificazione</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Completa i dati mancanti per l&apos;identificazione.</p>
          
          <div className="space-y-6">
            <div className="p-6 border border-[#c7c6ca] bg-[#faf9f6]">
              <h3 className="text-[14px] font-bold text-[#1a1c1a] mb-4 border-b border-[#c7c6ca] pb-2">{client?.firstName} {client?.lastName}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Codice Fiscale</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#1a1c1a]">{client?.fiscalCode || 'RSSMRA80A01H501U'}</span>
                    <span className="text-[10px] uppercase font-bold text-[#1b5e20] bg-[#e8f5e9] px-2 py-0.5 border border-[#a5d6a7]">Disponibile</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Residenza</span>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#1a1c1a]">{client?.city}</span>
                    <span className="text-[10px] uppercase font-bold text-[#1b5e20] bg-[#e8f5e9] px-2 py-0.5 border border-[#a5d6a7]">Disponibile</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#c7c6ca]">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Tipo Documento ID</label>
                  <select className="w-full p-2 border border-[#c7c6ca] bg-white">
                    <option>Carta di Identità</option>
                    <option>Passaporto</option>
                    <option>Patente di Guida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Numero Documento</label>
                  <input type="text" className="w-full p-2 border border-[#c7c6ca] bg-white" placeholder="Es. CA12345XX" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex justify-end">
            <button onClick={() => handleSaveProgress('identificazione')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors">
              Continua
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Relazioni e Rappresentanza</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Specifica eventuali deleghe, procure o legami societari.</p>
          
          <div className="p-6 border border-[#c7c6ca] bg-[#faf9f6] text-center space-y-4">
            <p className="text-[14px] text-[#1a1c1a]">Il cliente agisce per conto proprio?</p>
            <div className="flex items-center justify-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="rappr" defaultChecked /> Sì
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="rappr" /> No, agisce in virtù di delega/procura
              </label>
            </div>
          </div>
          
          <div className="mt-12 flex justify-end">
            <button onClick={() => handleSaveProgress('relazioni')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors">
              Continua
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Contesto dell&apos;Operazione</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Informazioni relative all&apos;affare.</p>
          
          <div className="p-6 border border-[#c7c6ca] bg-[#faf9f6] space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Tipo Operazione</span>
              <p className="font-medium text-[#1a1c1a]">{practice.practiceType}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Scopo dell&apos;operazione</label>
                <select className="w-full p-2 border border-[#c7c6ca] bg-white">
                  <option>Abitazione principale</option>
                  <option>Investimento</option>
                  <option>Seconda casa</option>
                  <option>Attività commerciale</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Valore stimato (Fascia)</label>
                <select className="w-full p-2 border border-[#c7c6ca] bg-white">
                  <option>Fino a € 250.000</option>
                  <option>€ 250.000 - € 500.000</option>
                  <option>€ 500.000 - € 1.000.000</option>
                  <option>Oltre € 1.000.000</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex justify-end">
            <button onClick={() => handleSaveProgress('operazione')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors">
              Continua
            </button>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Origine dei Fondi</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Dichiarazione sull&apos;origine dei mezzi patrimoniali.</p>
          
          <div className="p-6 border border-[#c7c6ca] bg-[#faf9f6]">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Dichiarazione raccolta</label>
            <textarea rows={4} className="w-full p-3 border border-[#c7c6ca] bg-white text-[13px]" placeholder="Es. I fondi impiegati nell&apos;operazione derivano da risparmi personali / mutuo bancario / vendita precedente immobile..."></textarea>
          </div>
          
          <div className="mt-12 flex justify-end">
            <button onClick={() => handleSaveProgress('origineFondi')} className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors">
              Vai al Riepilogo
            </button>
          </div>
        </div>
      )}

      {currentStep === 6 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Valutazione del Rischio</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Assegna un livello di rischio basato sulle informazioni raccolte.</p>
          
          <div className="bg-white border border-[#c7c6ca] p-6 space-y-6">
            <div>
              <span className="text-[12px] font-bold text-[#1a1c1a] uppercase tracking-widest border-b border-[#1a1c1a] pb-1">Valutazione inserita dall&apos;operatore</span>
              <p className="text-[12px] text-[#76777b] mt-2">La valutazione finale spetta al professionista incaricato.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <label className={`p-4 border cursor-pointer transition-colors text-center ${riskLevel === 'Basso' ? 'border-[#1b5e20] bg-[#e8f5e9] text-[#1b5e20]' : 'border-[#c7c6ca] text-[#76777b] hover:bg-[#faf9f6]'}`}>
                <input type="radio" name="risk" value="Basso" className="hidden" onChange={(e) => setRiskLevel(e.target.value)} />
                <span className="font-bold text-[14px] uppercase tracking-widest">Basso</span>
              </label>
              <label className={`p-4 border cursor-pointer transition-colors text-center ${riskLevel === 'Medio' ? 'border-[#a14009] bg-[#ffdbcd] text-[#a14009]' : 'border-[#c7c6ca] text-[#76777b] hover:bg-[#faf9f6]'}`}>
                <input type="radio" name="risk" value="Medio" className="hidden" onChange={(e) => setRiskLevel(e.target.value)} />
                <span className="font-bold text-[14px] uppercase tracking-widest">Medio</span>
              </label>
              <label className={`p-4 border cursor-pointer transition-colors text-center ${riskLevel === 'Alto' ? 'border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a]' : 'border-[#c7c6ca] text-[#76777b] hover:bg-[#faf9f6]'}`}>
                <input type="radio" name="risk" value="Alto" className="hidden" onChange={(e) => setRiskLevel(e.target.value)} />
                <span className="font-bold text-[14px] uppercase tracking-widest">Alto</span>
              </label>
            </div>
            
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Note a supporto della valutazione</label>
              <textarea value={riskNotes} onChange={e => setRiskNotes(e.target.value)} rows={3} className="w-full p-3 border border-[#c7c6ca] bg-white text-[13px]"></textarea>
            </div>
          </div>
          
          <div className="mt-12 flex justify-between">
            <button onClick={() => setCurrentStep(5)} className="text-[12px] font-bold text-[#76777b] hover:text-[#1a1c1a] underline">Torna indietro</button>
            <button
              onClick={handleComplete}
              disabled={!riskLevel}
              className={`px-8 py-3 text-[12px] uppercase font-bold tracking-widest transition-colors ${riskLevel ? 'bg-[#1a1c1a] text-white hover:bg-[#333533]' : 'bg-[#e6e5e8] text-[#76777b] cursor-not-allowed'}`}
            >
              Completato Operativamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
