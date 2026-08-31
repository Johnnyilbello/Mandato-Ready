import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Mandate } from '@/lib/types';

export const IncaricoWizardView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getClientById,
    getPropertyById,
    getMandateByPracticeId,
    updateMandate,
    updatePractice,
    setActiveTab,
    addPracticeNote,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || '');
  const mandate = getMandateByPracticeId(practice?.id || '');
  const property = getPropertyById(practice?.propertyId);
  
  // Clients (owners)
  const initialClientIds = practice?.clientId ? [practice.clientId] : [];
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Form State
  const [clientIds, setClientIds] = useState<string[]>(mandate?.clientIds || initialClientIds);
  const [propertyId] = useState<string>(mandate?.propertyId || practice?.propertyId || '');
  
  const [mandateType, setMandateType] = useState(mandate?.mandateType || 'Vendita');
  const [exclusivity, setExclusivity] = useState(mandate?.exclusivity || 'In esclusiva');
  
  const today = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setMonth(defaultEnd.getMonth() + 6);
  const sixMonths = defaultEnd.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(mandate?.startDate || today);
  const [endDate, setEndDate] = useState(mandate?.endDate || sixMonths);
  
  const [askingPrice, setAskingPrice] = useState(mandate?.askingPrice || property?.estimatedValue || 0);
  const [commissionType, setCommissionType] = useState(mandate?.commissionType || 'percentuale');
  const [commissionValue, setCommissionValue] = useState(mandate?.commissionValue || '3');
  const [notes, setNotes] = useState(mandate?.notes || '');
  
  if (!practice) {
    return <div className="p-12 text-center text-[#76777b]">Pratica non trovata.</div>;
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    else setActiveTab('pratiche');
  };

  const handleSaveDraft = () => {
    updateMandate({
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
      status: 'Bozza'
    });
    updatePractice(practice.id, { mandateStatus: 'da_preparare' });
    addPracticeNote(practice.id, 'Incarico salvato come bozza');
    setActiveTab('pratiche');
  };

  const handleGenerate = () => {
    updateMandate({
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
      status: 'Pronto per la firma',
      signatories: clientIds.map(id => {
        const c = getClientById(id);
        return {
          id: c?.id || '',
          name: `${c?.firstName} ${c?.lastName}`,
          role: 'Proprietario',
          email: c?.email || '',
          phone: c?.phone || '',
          status: 'Da invitare'
        };
      })
    });
    updatePractice(practice.id, { 
      mandateStatus: 'da_firmare',
      nextAction: {
        title: 'Incarico pronto',
        description: 'La bozza dell\'incarico è stata generata. Invia il documento per la firma ai soggetti.',
        ctaText: 'Prepara Firma',
        targetSection: 'incarico',
      }
    });
    addPracticeNote(practice.id, 'Incarico compilato e generato');
    setActiveTab('pratiche');
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 font-sans pb-24">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Indietro
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((step) => (
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
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Chi conferisce l&apos;incarico?</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Conferma o aggiungi i proprietari e i referenti per l&apos;incarico.</p>
          
          <div className="space-y-4">
            {clientIds.map(id => {
              const c = getClientById(id);
              return (
                <div key={id} className="p-4 border border-[#c7c6ca] bg-[#faf9f6] flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-bold text-[#1a1c1a]">{c?.firstName} {c?.lastName}</div>
                    <div className="text-[12px] text-[#76777b]">{c?.email} · {c?.phone}</div>
                  </div>
                  <span className="px-2 py-1 bg-[#efeeeb] text-[10px] font-bold uppercase tracking-wider text-[#1a1c1a] border border-[#c7c6ca]">
                    Proprietario
                  </span>
                </div>
              )
            })}
            
            <button className="w-full p-4 border border-dashed border-[#c7c6ca] text-[#76777b] hover:text-[#1a1c1a] hover:border-[#1a1c1a] transition-colors text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Aggiungi soggetto
            </button>
          </div>
          
          <div className="mt-12 flex items-center justify-end">
            <button
              onClick={handleNext}
              className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors"
            >
              Continua
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Confermiamo l&apos;immobile</h1>
          <p className="text-[14px] text-[#76777b] mb-8">L&apos;immobile associato alla pratica è precompilato.</p>
          
          <div className="p-6 border border-[#c7c6ca] bg-[#faf9f6]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Tipologia</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.type}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Comune</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.municipality} ({property?.province})</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Indirizzo</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.address}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b] block mb-1">Superficie</span>
                <p className="font-semibold text-[#1a1c1a]">{property?.approximateSurface} m²</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-between">
            <button onClick={handleSaveDraft} className="text-[12px] font-bold text-[#76777b] hover:text-[#1a1c1a] underline">Salva bozza</button>
            <button
              onClick={handleNext}
              className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors"
            >
              Continua
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Definiamo l&apos;incarico</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Inserisci le condizioni dell&apos;accordo.</p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Tipo di incarico</label>
                <select value={mandateType} onChange={e => setMandateType(e.target.value)} className="w-full p-3 border border-[#c7c6ca] bg-white">
                  <option>Vendita</option>
                  <option>Locazione</option>
                  <option>Altro</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Esclusiva</label>
                <select value={exclusivity} onChange={e => setExclusivity(e.target.value)} className="w-full p-3 border border-[#c7c6ca] bg-white">
                  <option>In esclusiva</option>
                  <option>Non in esclusiva</option>
                  <option>Da definire</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#c7c6ca] pt-6">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Data Inizio</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 border border-[#c7c6ca] bg-white" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Data Scadenza</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 border border-[#c7c6ca] bg-white" />
              </div>
            </div>

            <div className="border-t border-[#c7c6ca] pt-6">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Prezzo Richiesto dal Proprietario (€)</label>
              <input type="number" value={askingPrice} onChange={e => setAskingPrice(Number(e.target.value))} className="w-full p-3 border border-[#c7c6ca] bg-white text-[16px] font-mono" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#c7c6ca] pt-6">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Tipo Provvigione</label>
                <select value={commissionType} onChange={e => setCommissionType(e.target.value)} className="w-full p-3 border border-[#c7c6ca] bg-white">
                  <option value="percentuale">Percentuale (%)</option>
                  <option value="fisso">Importo Fisso (€)</option>
                  <option value="da_definire">Da definire</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Valore</label>
                <input type="text" value={commissionValue} onChange={e => setCommissionValue(e.target.value)} className="w-full p-3 border border-[#c7c6ca] bg-white font-mono" />
              </div>
            </div>
            
            <div className="border-t border-[#c7c6ca] pt-6">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1a1c1a] mb-2">Note / Condizioni aggiuntive (Opzionale)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-3 border border-[#c7c6ca] bg-white" />
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-between">
            <button onClick={handleSaveDraft} className="text-[12px] font-bold text-[#76777b] hover:text-[#1a1c1a] underline">Salva bozza</button>
            <button
              onClick={handleNext}
              className="bg-[#1a1c1a] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors"
            >
              Continua
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[32px] font-serif-display font-bold text-[#1a1c1a] mb-2">Controlla prima di procedere</h1>
          <p className="text-[14px] text-[#76777b] mb-8">Verifica i dati inseriti. Verrà generata una bozza del documento.</p>
          
          <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 space-y-6">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] border-b border-[#c7c6ca] pb-2 mb-3">Parti</h3>
              {clientIds.map(id => {
                const c = getClientById(id);
                return <div key={id} className="text-[14px] font-semibold text-[#1a1c1a]">{c?.firstName} {c?.lastName}</div>;
              })}
            </div>
            
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] border-b border-[#c7c6ca] pb-2 mb-3">Immobile</h3>
              <div className="text-[14px] text-[#1a1c1a]">{property?.address}, {property?.municipality} ({property?.type})</div>
            </div>
            
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] border-b border-[#c7c6ca] pb-2 mb-3">Condizioni</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div><span className="text-[#76777b]">Incarico:</span> <span className="font-semibold text-[#1a1c1a]">{mandateType}</span></div>
                <div><span className="text-[#76777b]">Esclusiva:</span> <span className="font-semibold text-[#1a1c1a]">{exclusivity}</span></div>
                <div><span className="text-[#76777b]">Dal:</span> <span className="font-mono text-[#1a1c1a]">{startDate}</span></div>
                <div><span className="text-[#76777b]">Al:</span> <span className="font-mono text-[#1a1c1a]">{endDate}</span></div>
                <div><span className="text-[#76777b]">Prezzo:</span> <span className="font-mono text-[#1a1c1a]">€ {askingPrice.toLocaleString('it-IT')}</span></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] border-b border-[#c7c6ca] pb-2 mb-3">Provvigione</h3>
              <div className="text-[14px] font-mono text-[#1a1c1a]">{commissionValue} {commissionType === 'percentuale' ? '%' : '€'}</div>
            </div>
            
            {notes && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#76777b] border-b border-[#c7c6ca] pb-2 mb-3">Note</h3>
                <div className="text-[14px] text-[#1a1c1a]">{notes}</div>
              </div>
            )}
          </div>
          
          <div className="mt-12 flex items-center justify-between">
            <button onClick={() => setCurrentStep(3)} className="text-[12px] font-bold text-[#76777b] hover:text-[#1a1c1a] underline">Torna a modificare</button>
            <button
              onClick={handleGenerate}
              className="bg-[#a14009] text-white px-8 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#7d2d00] transition-colors"
            >
              Genera bozza
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
