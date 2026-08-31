'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { HELP_CONCEPTS, HELP_CATEGORIES, searchHelpConcepts, HelpConcept } from '@/lib/helpContent';

export const HelpPanel: React.FC = () => {
  const {
    isHelpPanelOpen,
    setIsHelpPanelOpen,
    isHelpModeActive,
    setIsHelpModeActive,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<HelpConcept | null>(null);

  const filteredConcepts = useMemo(() => {
    return searchHelpConcepts(searchQuery);
  }, [searchQuery]);

  if (!isHelpPanelOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-panel-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsHelpPanelOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#faf9f6]/95 backdrop-blur-xl border-l-2 border-[#1a1c1a] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-[#1a1c1a]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#c7c6ca] bg-[#f4f3f1]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-[#1a1c1a] text-white flex items-center justify-center font-bold text-[12px]">
                ?
              </span>
              <h2 id="help-panel-title" className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">
                Guida & Concetti
              </h2>
            </div>
            <button
              onClick={() => setIsHelpPanelOpen(false)}
              aria-label="Chiudi guida"
              className="p-1 text-[#76777b] hover:text-[#1a1c1a] hover:bg-[#e3e2e0] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <p className="text-[13px] text-[#46474a] leading-relaxed mb-4">
            Spiegazioni rapide dei termini e del funzionamento operativo di Mandato Ready.
          </p>

          {/* Help Mode Toggle */}
          <div className="p-3 bg-[#ffffff] border border-[#c7c6ca] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a1c1a] block">
                Modalità Aiuto a Schermo
              </span>
              <span className="text-[12px] text-[#76777b]">
                {isHelpModeActive
                  ? 'Attiva: vedi i punti interrogativi nelle schermate'
                  : 'Mostra i "?" accanto a tutti i termini chiave'}
              </span>
            </div>
            <button
              type="button"
              id="btn-toggle-help-mode"
              onClick={() => {
                setIsHelpModeActive(!isHelpModeActive);
              }}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                isHelpModeActive
                  ? 'bg-[#a14009] text-white hover:bg-[#7d2d00]'
                  : 'bg-[#1a1c1a] text-white hover:bg-[#333533]'
              }`}
            >
              {isHelpModeActive ? 'Disattiva' : 'Attiva'}
            </button>
          </div>

          {/* Search Input */}
          <div className="mt-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#76777b]">
              search
            </span>
            <input
              type="text"
              id="input-help-search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedConcept(null);
              }}
              placeholder="Cosa vuoi capire? (es. HOT, prossimo passo...)"
              className="w-full bg-[#ffffff] border border-[#c7c6ca] focus:border-[#1a1c1a] pl-9 pr-8 py-2 text-[13px] text-[#1a1c1a] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#76777b] hover:text-[#1a1c1a]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Detail View of Selected Concept */}
          {selectedConcept ? (
            <div className="p-5 bg-[#ffffff] border-2 border-[#1a1c1a] shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#c7c6ca]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#a14009] text-white flex items-center justify-center font-bold text-[11px]">
                    ?
                  </span>
                  <h3 className="text-[16px] font-bold text-[#1a1c1a]">
                    {selectedConcept.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedConcept(null)}
                  className="text-[11px] uppercase font-bold text-[#76777b] hover:text-[#1a1c1a] underline cursor-pointer"
                >
                  Indietro
                </button>
              </div>

              <div className="p-3 bg-[#f4f3f1] border-l-3 border-[#a14009] mb-3 text-[13px] font-medium text-[#1a1c1a]">
                {selectedConcept.tooltip}
              </div>

              <p className="text-[13px] text-[#46474a] leading-relaxed mb-4">
                {selectedConcept.description}
              </p>

              <button
                onClick={() => setSelectedConcept(null)}
                className="w-full py-2 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-wider hover:bg-[#333533] transition-colors"
              >
                Torna all&apos;elenco argomenti
              </button>
            </div>
          ) : (
            <>
              {searchQuery ? (
                /* Search Results */
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#76777b]">
                    Risultati ({filteredConcepts.length})
                  </div>
                  {filteredConcepts.length === 0 ? (
                    <div className="p-4 bg-[#ffffff] border border-[#c7c6ca] text-center text-[#76777b] text-[13px]">
                      Nessun concetto trovato per &ldquo;{searchQuery}&rdquo;. Prova con termini come <em>HOT</em>, <em>documenti</em>, <em>pratica</em>, <em>rogito</em>.
                    </div>
                  ) : (
                    filteredConcepts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedConcept(c)}
                        className="w-full p-3.5 bg-[#ffffff] border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-[#1a1c1a] group-hover:text-[#a14009]">
                            {c.title}
                          </span>
                          <span className="material-symbols-outlined text-[16px] text-[#76777b]">
                            chevron_right
                          </span>
                        </div>
                        <p className="text-[12px] text-[#46474a] mt-1 line-clamp-2">
                          {c.tooltip}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                /* Categorized Default List */
                HELP_CATEGORIES.map((cat) => {
                  const catConcepts = Object.values(HELP_CONCEPTS).filter(
                    (c) => c.category === cat.id
                  );
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-[#c7c6ca]">
                        <span className="material-symbols-outlined text-[16px] text-[#a14009]">
                          {cat.icon}
                        </span>
                        <h3 className="text-[12px] font-mono uppercase font-bold tracking-widest text-[#1a1c1a]">
                          {cat.label}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {catConcepts.map((c) => (
                          <button
                            key={c.id}
                            id={`help-concept-item-${c.id}`}
                            onClick={() => setSelectedConcept(c)}
                            className="w-full p-3 bg-[#ffffff] border border-[#c7c6ca] hover:border-[#1a1c1a] hover:bg-[#f4f3f1] text-left transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-[13px] font-bold text-[#1a1c1a] group-hover:text-[#a14009]">
                                {c.title}
                              </div>
                              <div className="text-[12px] text-[#76777b] truncate mt-0.5">
                                {c.tooltip}
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-[#76777b] shrink-0">
                              chevron_right
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Support Placeholder Section */}
              <div className="pt-4 border-t border-[#c7c6ca]">
                <div className="p-4 bg-[#efeeeb] border border-[#c7c6ca] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#76777b]">
                      contact_support
                    </span>
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1a1c1a]">
                      Serve una mano con lo studio?
                    </h4>
                  </div>
                  <p className="text-[12px] text-[#46474a] leading-relaxed">
                    Per chiarimenti sui requisiti documentali, configurazione dei fascicoli o procedure di conformità, contatta il supporto operativo agenzia.
                  </p>
                  <a
                    href="mailto:supporto@mandatoready.it"
                    className="inline-flex items-center gap-1 text-[11px] uppercase font-bold tracking-wider text-[#a14009] hover:underline"
                  >
                    <span>supporto@mandatoready.it</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
