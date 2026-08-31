'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Tooltip } from '@/components/common/Tooltip';
import { ContextualHelp } from '@/components/common/ContextualHelp';
import { HELP_CONCEPTS } from '@/lib/helpContent';

export const OpportunitaListView: React.FC = () => {
  const {
    opportunities,
    getClientById,
    getPropertyById,
    openOpportunityDetail,
    seedNewOpportunity,
    isHintDismissed,
    dismissHint,
    contextualHelpPreference,
    isHelpModeActive,
  } = useApp();

  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const showFirstUseHint =
    !isHintDismissed('hint_first_use_opportunita') && contextualHelpPreference !== 'reduced';

  const filtered = opportunities.filter((opp) => {
    if (filterPriority === 'ALL') return true;
    return opp.priority === filterPriority;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12">
      {/* First-Use Guidance Banner */}
      {showFirstUseHint && (
        <div className="mb-8 p-5 bg-[#faf9f6] border-2 border-[#1a1c1a] shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#a14009] text-white flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                ?
              </span>
              <div>
                <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#1a1c1a]">
                  Che cosa trovi in Opportunità?
                </h2>
                <p className="text-[13px] text-[#46474a] mt-1 leading-relaxed max-w-3xl">
                  Qui trovi i proprietari ancora prima che diventino una pratica. Puoi qualificare la motivazione, verificare i documenti dichiarati e preparare la proposta di mandato.
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissHint('hint_first_use_opportunita')}
              className="px-4 py-1.5 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#c7c6ca] gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
            ACQUISIZIONE IMMOBILIARE
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a]">
              Opportunità Mandato Ready
            </h1>
            <ContextualHelp conceptId="opportunita" alwaysVisible={isHelpModeActive} />
          </div>
          <p className="text-[14px] text-[#46474a] mt-1">
            Trattative con venditori qualificati pronte per conversione in pratiche operative.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={seedNewOpportunity}
            className="bg-[#1a1c1a] text-white px-5 py-2.5 text-[12px] uppercase tracking-widest font-semibold hover:bg-[#333533] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nuova Trattativa
          </button>
        </div>
      </div>

      {/* Priority Filters Bar */}
      <div className="flex items-center gap-2 mb-8 border-b border-[#c7c6ca] pb-3 text-[12px] font-semibold uppercase tracking-wider">
        <span className="text-[#76777b] mr-2">Filtra per priorità:</span>
        {['ALL', 'HOT', 'WARM', 'COLD'].map((p) => {
          const conceptKey = p === 'ALL' ? undefined : p.toLowerCase();
          const help = conceptKey ? HELP_CONCEPTS[conceptKey] : undefined;

          const buttonEl = (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                filterPriority === p
                  ? 'bg-[#1a1c1a] text-white'
                  : 'text-[#76777b] hover:bg-[#e3e2e0] hover:text-[#1a1c1a]'
              }`}
            >
              {p === 'ALL' ? 'Tutte' : p}
            </button>
          );

          if (help) {
            return (
              <Tooltip key={p} content={help.tooltip}>
                {buttonEl}
              </Tooltip>
            );
          }
          return buttonEl;
        })}
      </div>

      {/* List / Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((opp) => {
          const client = getClientById(opp.clientId);
          const property = getPropertyById(opp.propertyId);
          const isHot = opp.priority === 'HOT';
          const isConverted = opp.status === 'converted';
          const priorityHelp = HELP_CONCEPTS[opp.priority.toLowerCase()];

          return (
            <div
              key={opp.id}
              onClick={() => openOpportunityDetail(opp.id)}
              className={`p-6 bg-[#faf9f6] border transition-all cursor-pointer hover:border-[#1a1c1a] relative ${
                isHot ? 'border-[#a14009] bg-[#faf9f6]' : 'border-[#c7c6ca]'
              } ${isConverted ? 'opacity-70 bg-[#f4f3f1]' : ''}`}
            >
              {isHot && !isConverted && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#a14009]"></div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Tooltip content={priorityHelp?.tooltip || ''}>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 font-bold uppercase tracking-wider border cursor-help ${
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

                    {isHelpModeActive && (
                      <ContextualHelp conceptId={opp.priority.toLowerCase()} size="sm" />
                    )}

                    {isConverted && (
                      <span className="text-[11px] px-2 py-0.5 bg-[#e3e2e0] text-[#1a1c1a] font-bold uppercase tracking-wider">
                        Convertita in Pratica
                      </span>
                    )}

                    <span className="text-[12px] font-mono text-[#76777b]">
                      Timeframe: <strong className="text-[#1a1c1a]">{opp.sellingTimeframe}</strong>
                    </span>
                  </div>

                  <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a]">
                    {client?.firstName} {client?.lastName}{' '}
                    <span className="text-[#76777b] font-sans font-normal text-[16px]">
                      · {property?.address} ({property?.municipality})
                    </span>
                  </h3>

                  <p className="text-[14px] text-[#46474a] line-clamp-1 italic">
                    &ldquo;{opp.briefing}&rdquo;
                  </p>
                </div>

                {/* Center Metrics */}
                <div className="flex items-center gap-8 border-y lg:border-y-0 lg:border-x border-[#c7c6ca] py-3 lg:py-0 lg:px-8">
                  <div>
                    <div className="flex items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b]">
                        Intento
                      </span>
                      <ContextualHelp conceptId="intento" alwaysVisible={isHelpModeActive} size="sm" />
                    </div>
                    <span className="text-[14px] font-bold text-[#1a1c1a]">
                      {opp.sellerIntent}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b]">
                        Preparazione
                      </span>
                      <ContextualHelp conceptId="preparazione" alwaysVisible={isHelpModeActive} size="sm" />
                    </div>
                    <span className="text-[14px] font-mono font-bold text-[#1a1c1a]">
                      {opp.readiness}/100
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#76777b]">
                        Documenti
                      </span>
                      <ContextualHelp conceptId="documenti" alwaysVisible={isHelpModeActive} size="sm" />
                    </div>
                    <span className="text-[13px] text-[#46474a]">
                      {opp.declaredDocuments.filter((d) => d.declaredPresent).length}/
                      {opp.declaredDocuments.length}
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-3">
                  <Tooltip content={HELP_CONCEPTS.converti_pratica.tooltip}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openOpportunityDetail(opp.id);
                      }}
                      className="w-full lg:w-auto px-6 py-2.5 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isConverted ? 'Vedi Dettaglio' : 'Converti in Pratica'}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
