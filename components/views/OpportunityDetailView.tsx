'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ConvertPracticeModal } from './ConvertPracticeModal';
import { Tooltip } from '@/components/common/Tooltip';
import { ContextualHelp } from '@/components/common/ContextualHelp';
import { HELP_CONCEPTS } from '@/lib/helpContent';

export const OpportunityDetailView: React.FC = () => {
  const {
    selectedOpportunityId,
    getOpportunityById,
    getClientById,
    getPropertyById,
    setActiveTab,
    closeOpportunityDetail,
    isHintDismissed,
    dismissHint,
    isHelpModeActive,
  } = useApp();

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const opp = getOpportunityById(selectedOpportunityId || 'opp-1') || getOpportunityById('opp-1');

  if (!opp) {
    return (
      <div className="p-8 text-center">
        <p>Opportunità non trovata.</p>
        <button onClick={closeOpportunityDetail} className="mt-4 underline">
          Torna alle opportunità
        </button>
      </div>
    );
  }

  const client = getClientById(opp.clientId);
  const property = getPropertyById(opp.propertyId);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-[#c7c6ca] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-2">
            <button
              id="btn-back-to-opportunita"
              onClick={closeOpportunityDetail}
              className="hover:text-[#1a1c1a] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Opportunità
            </button>
            <span>›</span>
            <span className="text-[#1a1c1a]">Dettaglio</span>
          </div>

          <h1 className="text-[28px] md:text-[38px] font-serif-display font-bold text-[#1a1c1a] leading-tight">
            {client?.firstName} {client?.lastName}{' '}
            <span className="text-[#c7c6ca] font-normal mx-2">|</span>{' '}
            <span className="font-normal text-[24px] md:text-[32px] text-[#46474a]">
              {property?.municipality} · {property?.type} · ~{property?.approximateSurface} m²
            </span>
          </h1>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#76777b]">
            Azione Consigliata
          </span>
          <span className="text-[13px] font-semibold text-[#1a1c1a] bg-[#efeeeb] px-3.5 py-1 border border-[#c7c6ca]">
            {opp.recommendedAction}
          </span>
        </div>
      </div>

      {/* Opportunity Contextual Guidance */}
      {!isHintDismissed('opportunity_detail_guidance') && (
        <div className="mb-8 p-5 bg-[#ffffff] border-2 border-[#1a1c1a] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px] text-[#a14009] shrink-0 mt-0.5">
              psychology
            </span>
            <div>
              <h3 className="text-[14px] font-bold text-[#1a1c1a] uppercase tracking-wide mb-1">
                Dall&apos;Incontro all&apos;Incarico
              </h3>
              <p className="text-[13px] text-[#46474a] leading-relaxed">
                Utilizza il <strong>Briefing Strategico</strong> per preparare l&apos;incontro con il proprietario. Quando l&apos;incarico &egrave; concordato, clicca su <strong>&ldquo;Crea Fascicolo Pratica&rdquo;</strong> per trasferire automaticamente tutti i dati e i documenti dichiarati.
              </p>
            </div>
          </div>

          <button
            onClick={() => dismissHint('opportunity_detail_guidance')}
            className="px-4 py-2 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] font-bold uppercase tracking-wider shrink-0 cursor-pointer self-start sm:self-center transition-colors"
          >
            Ho capito
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="flex flex-wrap items-center gap-8 mb-10 text-mono border-b border-[#c7c6ca] pb-6">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#76777b] mb-1">
              STATO LEAD
            </span>
            <ContextualHelp conceptId="intento" alwaysVisible={isHelpModeActive} size="sm" />
          </div>
          <Tooltip content={HELP_CONCEPTS.intento.tooltip}>
            <span className="text-[20px] font-bold text-[#1a1c1a] flex items-center gap-2 cursor-help">
              <span className="w-2.5 h-2.5 bg-[#a14009] inline-block"></span>
              Intento {opp.sellerIntent}
            </span>
          </Tooltip>
        </div>

        <div className="hidden sm:block w-px h-10 bg-[#c7c6ca]"></div>

        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#76777b] mb-1">
              INDICE PREPARAZIONE
            </span>
            <ContextualHelp conceptId="preparazione" alwaysVisible={isHelpModeActive} size="sm" />
          </div>
          <Tooltip content={HELP_CONCEPTS.preparazione.tooltip}>
            <span className="text-[20px] font-bold text-[#1a1c1a] font-mono cursor-help">
              {opp.readiness}/100
            </span>
          </Tooltip>
        </div>

        <div className="hidden sm:block w-px h-10 bg-[#c7c6ca]"></div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#76777b] mb-1">
            TEMPISTICHE VENDITA
          </span>
          <span className="text-[16px] font-medium text-[#1a1c1a]">{opp.sellingTimeframe}</span>
        </div>

        <div className="hidden sm:block w-px h-10 bg-[#c7c6ca]"></div>

        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#76777b] mb-1">
              PRIORITÀ COMMERCIALE
            </span>
            <ContextualHelp conceptId={opp.priority.toLowerCase()} alwaysVisible={isHelpModeActive} size="sm" />
          </div>
          <Tooltip content={HELP_CONCEPTS[opp.priority.toLowerCase()]?.tooltip || ''}>
            <span
              className={`text-[12px] px-2 py-0.5 font-bold uppercase tracking-wider border cursor-help ${
                opp.priority === 'HOT'
                  ? 'bg-[#ffdbcd] text-[#6a2500] border-[#a14009]'
                  : opp.priority === 'WARM'
                  ? 'bg-[#efeeeb] text-[#1a1c1a] border-[#76777b]'
                  : 'bg-[#f4f3f1] text-[#76777b] border-[#c7c6ca]'
              }`}
            >
              {opp.priority}
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Conversion Banner Section */}
      <div className="bg-[#faf9f6] border border-[#c7c6ca] p-6 md:p-8 mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#1a1c1a] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">transform</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-serif-display font-bold text-[#1a1c1a]">
              Converti in pratica
            </h2>
            <ContextualHelp conceptId="converti_pratica" alwaysVisible={isHelpModeActive} />
          </div>
        </div>

        <p className="text-[15px] text-[#46474a] mb-6 max-w-3xl leading-relaxed">
          Risparmia tempo importando automaticamente i dati raccolti. Procedendo con la conversione,
          non dovrai reinserire le informazioni: creeremo istantaneamente un nuovo fascicolo pratica
          pre-compilato con i seguenti dati verificati.
        </p>

        {/* Sync Pills */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {[
            'Proprietario e Recapiti',
            'Dettagli Immobile',
            'Informazioni Dichiarate',
            'Preparazione Documentale',
            'Note e Briefing Appuntamento',
          ].map((tag, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6a2500] bg-[#ffdbcd] px-3 py-1.5 border border-[#a14009]"
            >
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>{tag}</span>
            </div>
          ))}
        </div>

        {/* Bento Grid: Imported Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#c7c6ca] border border-[#c7c6ca] mb-8">
          {/* Seller Info */}
          <div className="bg-[#faf9f6] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-[#c7c6ca] pb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a1c1a]">
                Seller Info
              </h3>
              <span className="material-symbols-outlined text-[#76777b] text-[18px]">person</span>
            </div>
            <div className="space-y-3 text-[14px]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#76777b] block mb-0.5">
                  Nome
                </span>
                <span className="text-[#1a1c1a] font-medium">
                  {client?.firstName} {client?.lastName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#76777b] block mb-0.5">
                  Contatto
                </span>
                <span className="text-[#1a1c1a] font-mono text-[13px] block">
                  {client?.phone}
                  <br />
                  {client?.email}
                </span>
              </div>
              {client?.fiscalCode && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#76777b] block mb-0.5">
                    Codice Fiscale
                  </span>
                  <span className="text-[#1a1c1a] font-mono text-[13px]">{client.fiscalCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-[#faf9f6] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-[#c7c6ca] pb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a1c1a]">
                Property Info
              </h3>
              <span className="material-symbols-outlined text-[#76777b] text-[18px]">home</span>
            </div>
            <div className="space-y-3 text-[14px]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#76777b] block mb-0.5">
                  Ubicazione
                </span>
                <span className="text-[#1a1c1a]">
                  {property?.municipality} ({property?.province}), {property?.address}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#76777b] block mb-0.5">
                    Tipologia
                  </span>
                  <span className="text-[#1a1c1a] font-medium">{property?.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#76777b] block mb-0.5">
                    Superficie
                  </span>
                  <span className="text-[#1a1c1a] font-mono">~{property?.approximateSurface} m²</span>
                </div>
              </div>
              {property?.estimatedValue && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#76777b] block mb-0.5">
                    Valore Stimato Indicativo
                  </span>
                  <span className="text-[#1a1c1a] font-mono font-bold text-[16px]">
                    € {property.estimatedValue.toLocaleString('it-IT')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Declared Documents */}
          <div className="bg-[#faf9f6] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-[#c7c6ca] pb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a1c1a]">
                Declared Documents
              </h3>
              <span className="material-symbols-outlined text-[#76777b] text-[18px]">description</span>
            </div>
            <ul className="space-y-2.5 text-[13px]">
              {opp.declaredDocuments.map((doc) => (
                <li key={doc.id} className="flex items-start gap-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] mt-0.5 ${
                      doc.declaredPresent ? 'text-[#a14009]' : 'text-[#76777b]'
                    }`}
                  >
                    {doc.declaredPresent ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span className={doc.declaredPresent ? 'text-[#1a1c1a] font-medium' : 'text-[#76777b]'}>
                    {doc.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Appointment Briefing */}
          <div className="bg-[#faf9f6] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-[#c7c6ca] pb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a1c1a]">
                Appointment Briefing
              </h3>
              <span className="material-symbols-outlined text-[#76777b] text-[18px]">event_note</span>
            </div>
            <div className="text-[13px] text-[#46474a] leading-relaxed bg-[#f4f3f1] p-4 border border-[#c7c6ca] italic">
              &ldquo;{opp.briefing}&rdquo;
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1a1c1a]">
          <span className="text-[13px] text-[#76777b] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#a14009]">info</span>
            Nessun dato andrà perso durante il trasferimento.
          </span>

          <button
            id="btn-converti-in-pratica"
            onClick={() => setIsConvertModalOpen(true)}
            className="w-full sm:w-auto bg-[#a14009] hover:bg-[#7d2d00] text-white px-8 py-4 text-[12px] uppercase font-bold tracking-widest flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <span>Conferma e importa dati nella pratica</span>
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </button>
        </div>
      </div>

      {/* Module: Preparazione Appuntamento */}
      {opp.preparationAdvice && (
        <section className="border border-[#c7c6ca] bg-[#faf9f6] p-6 md:p-8">
          <div className="border-b border-[#c7c6ca] pb-3 mb-6">
            <h2 className="text-[20px] font-serif-display font-bold text-[#1a1c1a]">
              Preparazione appuntamento
            </h2>
            <p className="text-[13px] text-[#76777b]">
              Guida operativa deterministica per condurre l&apos;incontro di acquisizione.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">
                  Sintesi
                </h3>
                <p className="text-[14px] text-[#1a1c1a] bg-[#efeeeb] p-4 border border-[#c7c6ca]">
                  {opp.preparationAdvice.sintesi}
                </p>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">
                  Da approfondire
                </h3>
                <ul className="space-y-2">
                  {opp.preparationAdvice.daApprofondire.map((item, idx) => (
                    <li key={idx} className="text-[13px] text-[#46474a] flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#76777b] mt-0.5">
                        arrow_right
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">
                  Domande consigliate
                </h3>
                <ul className="space-y-2">
                  {opp.preparationAdvice.domandeConsigliate.map((item, idx) => (
                    <li key={idx} className="text-[13px] text-[#1a1c1a] flex items-start gap-2 bg-[#f4f3f1] p-2.5 border border-[#c7c6ca]">
                      <span className="material-symbols-outlined text-[16px] text-[#a14009] mt-0.5">
                        help_outline
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#a14009] mb-2">
                  Prossima azione raccomandata
                </h3>
                <p className="text-[14px] text-[#1a1c1a] font-medium border-l-2 border-[#1a1c1a] pl-3">
                  {opp.preparationAdvice.prossimaAzione}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Confirmation Modal */}
      <ConvertPracticeModal
        opportunity={opp}
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
      />
    </div>
  );
};
