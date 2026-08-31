import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Signatory } from '@/lib/types';

export const SigningProcessView: React.FC = () => {
  const {
    selectedPracticeId,
    getPracticeById,
    getMandateByPracticeId,
    getSigningProcessByPracticeId,
    updateSigningProcess,
    updateMandate,
    updatePractice,
    setActiveTab,
    addPracticeNote,
  } = useApp();

  const practice = getPracticeById(selectedPracticeId || '');
  const mandate = getMandateByPracticeId(practice?.id || '');
  const existingProcess = getSigningProcessByPracticeId(practice?.id || '');

  const [mode, setMode] = useState<'Sequenziale' | 'Contemporanea'>(existingProcess?.mode || 'Contemporanea');
  
  // We initialize signatories from existingProcess or mandate
  const initialSignatories: Signatory[] = existingProcess?.signatories || mandate?.signatories || [];
  
  // Make sure we have an agency signatory placeholder
  if (!initialSignatories.find(s => s.role === 'Agenzia')) {
    initialSignatories.push({
      id: 'ag-1',
      name: 'Agenzia (Io)',
      role: 'Agenzia',
      email: '',
      phone: '',
      status: 'Da invitare'
    });
  }
  
  const [signatories, setSignatories] = useState<Signatory[]>(initialSignatories);

  if (!practice || !mandate) {
    return <div className="p-12 text-center text-[#76777b]">Documento non trovato.</div>;
  }

  const handleSend = () => {
    updateSigningProcess({
      practiceId: practice.id,
      documentId: mandate.id,
      mode,
      status: 'In corso',
      signatories: signatories.map(s => ({ ...s, status: 'In attesa di firma' })),
      sentAt: new Date().toISOString()
    });
    updateMandate({ practiceId: practice.id, status: 'Inviato' });
    addPracticeNote(practice.id, 'Incarico inviato alla firma (' + mode + ')');
    setActiveTab('pratiche');
  };

  // Prototype: auto sign
  const handleSimulateSign = (sigId: string) => {
    if (existingProcess) {
      const updatedSigs = existingProcess.signatories.map(s => s.id === sigId ? { ...s, status: 'Firmato' as const } : s);
      const allSigned = updatedSigs.every(s => s.status === 'Firmato');
      
      updateSigningProcess({
        practiceId: practice.id,
        signatories: updatedSigs,
        status: allSigned ? 'Completato' : 'In corso',
        completedAt: allSigned ? new Date().toISOString() : undefined
      });
      
      const signer = updatedSigs.find(s => s.id === sigId);
      addPracticeNote(practice.id, `${signer?.name} ha completato la firma`);

      if (allSigned) {
        updateMandate({ practiceId: practice.id, status: 'Firmato' });
        updatePractice(practice.id, { mandateStatus: 'firmato' });
        addPracticeNote(practice.id, 'Processo firma completato');
      } else {
        updateMandate({ practiceId: practice.id, status: 'Parzialmente firmato' });
      }
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 font-sans pb-24">
      <div className="mb-8">
        <button
          onClick={() => setActiveTab('pratiche')}
          className="text-[12px] font-bold uppercase tracking-wider text-[#76777b] hover:text-[#1a1c1a] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Torna alla Pratica
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left side: Document preview */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-4">
            <div>
              <h1 className="text-[24px] font-serif-display font-bold text-[#1a1c1a]">Bozza incarico</h1>
              <span className="inline-block mt-1 px-2 py-1 bg-[#efeeeb] text-[#1a1c1a] border border-[#c7c6ca] text-[10px] font-bold uppercase tracking-widest">
                Da controllare
              </span>
            </div>
            {(!existingProcess || existingProcess.status === 'Da inviare') && (
              <button onClick={() => setActiveTab('incarico_wizard')} className="text-[12px] font-bold uppercase text-[#76777b] hover:text-[#1a1c1a] underline">
                Modifica dati
              </button>
            )}
          </div>
          
          <div className="aspect-[1/1.4] bg-[#faf9f6] border border-[#c7c6ca] p-8 relative flex flex-col shadow-sm">
            <div className="text-center mb-8 border-b border-[#1a1c1a] pb-4">
              <h2 className="text-[18px] font-bold uppercase tracking-widest text-[#1a1c1a]">Incarico di Mediazione</h2>
              <p className="text-[12px] text-[#76777b]">Mandato Ready Prototype Preview</p>
            </div>
            <div className="flex-1 space-y-4 text-[12px] text-[#1a1c1a]">
              <p>Il/I sottoscritto/i,</p>
              <ul className="list-disc pl-4 font-semibold">
                {mandate.signatories.filter(s => s.role !== 'Agenzia').map(s => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
              <p>Conferisce incarico in esclusiva all&apos;Agenzia per la {mandate.mandateType.toLowerCase()} dell&apos;immobile situato in.</p>
              <p>Prezzo richiesto: <strong>€ {mandate.askingPrice.toLocaleString('it-IT')}</strong></p>
              <p>Validità: dal <strong>{mandate.startDate}</strong> al <strong>{mandate.endDate}</strong>.</p>
              <p>Provvigione pattuita: <strong>{mandate.commissionValue} {mandate.commissionType === 'percentuale' ? '%' : '€'}</strong></p>
            </div>
            
            {/* Signature placeholders mock */}
            <div className="mt-8 pt-8 border-t border-[#c7c6ca] flex justify-between gap-4">
              {signatories.map(s => (
                <div key={s.id} className="border border-dashed border-[#a14009] bg-[#ffdbcd]/30 h-16 flex-1 flex items-center justify-center relative">
                  <span className="text-[10px] font-bold uppercase text-[#a14009] absolute top-1 left-2">{s.role}</span>
                  {s.status === 'Firmato' && <span className="font-yesteryear text-[24px] text-[#1a1c1a] -rotate-6">{s.name}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right side: Process config */}
        <div className="w-full lg:w-[380px] space-y-8">
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#1a1c1a] mb-4">Modalità di Firma</h3>
            
            {(!existingProcess || existingProcess.status === 'Da inviare') ? (
              <div className="space-y-3">
                <div 
                  className={`p-4 border cursor-pointer transition-colors ${mode === 'Sequenziale' ? 'border-[#1a1c1a] bg-[#faf9f6]' : 'border-[#c7c6ca] hover:bg-[#faf9f6]'}`}
                  onClick={() => setMode('Sequenziale')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-[18px] ${mode === 'Sequenziale' ? 'text-[#1a1c1a]' : 'text-[#76777b]'}`}>
                      {mode === 'Sequenziale' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <span className="font-bold text-[13px] text-[#1a1c1a]">Sequenziale</span>
                  </div>
                  <p className="text-[12px] text-[#76777b] pl-6 leading-relaxed">
                    Ogni persona riceve il documento dopo la firma della persona precedente.
                  </p>
                </div>
                
                <div 
                  className={`p-4 border cursor-pointer transition-colors ${mode === 'Contemporanea' ? 'border-[#1a1c1a] bg-[#faf9f6]' : 'border-[#c7c6ca] hover:bg-[#faf9f6]'}`}
                  onClick={() => setMode('Contemporanea')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-[18px] ${mode === 'Contemporanea' ? 'text-[#1a1c1a]' : 'text-[#76777b]'}`}>
                      {mode === 'Contemporanea' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <span className="font-bold text-[13px] text-[#1a1c1a]">Contemporanea</span>
                  </div>
                  <p className="text-[12px] text-[#76777b] pl-6 leading-relaxed">
                    Tutti i firmatari possono ricevere la richiesta nello stesso momento.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-[#c7c6ca] bg-[#faf9f6]">
                <span className="font-bold text-[13px] text-[#1a1c1a]">{mode}</span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#1a1c1a] mb-4">Firmatari</h3>
            <div className="space-y-3">
              {(existingProcess ? existingProcess.signatories : signatories).map((s, idx) => (
                <div key={s.id} className="p-3 border border-[#c7c6ca] bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#efeeeb] text-[#76777b] flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#1a1c1a]">{s.name}</div>
                      <div className="text-[11px] text-[#76777b]">{s.role}</div>
                    </div>
                  </div>
                  {existingProcess && existingProcess.status === 'In corso' && s.status !== 'Firmato' ? (
                    <button onClick={() => handleSimulateSign(s.id)} className="text-[10px] bg-[#a14009] text-white px-2 py-1 uppercase font-bold">Sign</button>
                  ) : existingProcess ? (
                    <span className="text-[11px] font-bold text-[#1b5e20]">{s.status}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          
          {(!existingProcess || existingProcess.status === 'Da inviare') && (
            <div className="pt-6 border-t border-[#c7c6ca]">
              <button
                onClick={handleSend}
                className="w-full bg-[#1a1c1a] text-white px-6 py-4 text-[13px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Invia alla firma
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
