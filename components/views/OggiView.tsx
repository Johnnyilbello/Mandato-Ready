'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ContextualHelp } from '@/components/common/ContextualHelp';
import { DashboardWidgetConfig, DashboardWidgetId } from '@/lib/types';

const STORAGE_KEY = 'mandato_ready_dashboard_widgets_v1';

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'da_fare_oggi',
    title: 'Da fare oggi',
    description: 'Attività e azioni urgenti in scadenza oggi',
    enabled: true,
    isCore: true,
  },
  {
    id: 'appuntamenti',
    title: 'Appuntamenti di oggi',
    description: 'Visite e incontri programmati per oggi',
    enabled: true,
    isCore: true,
  },
  {
    id: 'in_attesa',
    title: 'In attesa',
    description: 'Firme digitali, visure e integrazioni in corso',
    enabled: false,
  },
  {
    id: 'scadenze_imminenti',
    title: 'Scadenze imminenti',
    description: 'Prossime scadenze legali, contrattuali e scadenziario',
    enabled: false,
  },
  {
    id: 'documenti_mancanti',
    title: 'Documenti mancanti',
    description: 'Conformità e atti ancora da verificare o recuperare',
    enabled: false,
  },
  {
    id: 'opportunita_prioritarie',
    title: 'Opportunità prioritarie',
    description: 'Contatti e incarichi ad alto potenziale di conversione',
    enabled: false,
  },
  {
    id: 'pratiche_recenti',
    title: 'Pratiche recenti',
    description: 'Ultimi fascicoli operativi aperti o modificati',
    enabled: false,
  },
];

export const OggiView: React.FC = () => {
  const {
    tasks,
    appointments,
    waitingItems,
    openPracticeDetail,
    openOpportunityDetail,
    openNewPracticeWizard,
    completeTask,
    agencyProfile,
    isHintDismissed,
    dismissHint,
    practices,
    documents,
    deadlines,
    opportunities,
    setActiveTab,
    interactiveDemoStage,
    setInteractiveDemoStage,
    isHelpModeActive,
    clients,
    properties,
  } = useApp();

  // Dashboard Preferences State (lazy init from localStorage)
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_WIDGETS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DashboardWidgetConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return DEFAULT_WIDGETS.map((defItem) => {
            const found = parsed.find((p) => p.id === defItem.id);
            return found ? { ...defItem, ...found } : defItem;
          });
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_WIDGETS;
  });
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [draftWidgets, setDraftWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_WIDGETS);

  const saveWidgets = (newWidgets: DashboardWidgetConfig[]) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    } catch {
      // ignore storage error
    }
  };

  const openCustomizeModal = () => {
    setDraftWidgets([...widgets]);
    setIsCustomizeOpen(true);
  };

  const handleToggleDraftWidget = (id: DashboardWidgetId) => {
    setDraftWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleMoveDraftWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draftWidgets.length) return;
    const updated = [...draftWidgets];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setDraftWidgets(updated);
  };

  const handleResetToRecommended = () => {
    setDraftWidgets(DEFAULT_WIDGETS);
  };

  const handleSaveCustomization = () => {
    saveWidgets(draftWidgets);
    setIsCustomizeOpen(false);
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  const handleTaskAction = (task: (typeof tasks)[0]) => {
    if (interactiveDemoStage === 'oggi_task') {
      setInteractiveDemoStage('practice_prossimo_passo');
    }
    if (task.practiceId) {
      openPracticeDetail(
        task.practiceId,
        task.targetSection,
        task.targetSection === 'documenti' ? 'documenti' : 'dettagli'
      );
    }
  };

  const agentFirstName = agencyProfile.agentName ? agencyProfile.agentName.split(' ')[0] : 'Anna';

  // Checklist calculations
  const isProfileDone = Boolean(agencyProfile.agencyName && agencyProfile.agentName);
  const isPracticeDone = practices.length > 0;
  const isDocDone = documents.some((d) => d.status === 'Disponibile');
  const isDeadlineDone = deadlines.some((d) => d.completed) || tasks.some((t) => t.status === 'completed');

  const completedChecklistCount = [isProfileDone, isPracticeDone, isDocDone, isDeadlineDone].filter(Boolean).length;
  const isChecklistFullyComplete = completedChecklistCount === 4;
  const isChecklistDismissed = isHintDismissed('oggi_checklist');
  const showSetupChecklist = !isChecklistDismissed && !isChecklistFullyComplete && !interactiveDemoStage;

  // Widget helper getters
  const isWidgetEnabled = (id: DashboardWidgetId) => widgets.find((w) => w.id === id)?.enabled ?? false;

  // Renderers for individual widgets
  const renderDaFareOggiWidget = () => (
    <section key="da_fare_oggi" className="bg-[#faf9f6] border border-[#c7c6ca] p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-[24px] md:text-[28px] font-serif-display font-bold text-[#1a1c1a]">
            Da fare oggi
          </h2>
          <ContextualHelp conceptId="da_fare_oggi" alwaysVisible={isHelpModeActive} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#46474a] bg-[#e3e2e0] px-3 py-1 border border-[#c7c6ca]">
          {pendingTasks.length} ATTIVITÀ
        </span>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="py-12 text-center text-[#76777b]">
          <span className="material-symbols-outlined text-[36px] mb-2 text-[#a14009]">
            check_circle
          </span>
          <p className="text-[16px] font-medium text-[#1a1c1a]">Tutte le attività di oggi sono completate.</p>
          <p className="text-[13px] mt-1 text-[#76777b]">Ottimo lavoro! Controlla i fascicoli in corso o le prossime scadenze.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#c7c6ca]">
          {pendingTasks.map((task, index) => {
            const isHigh = task.priority === 'high';
            const isDemoHighlighted = interactiveDemoStage === 'oggi_task' && index === 0;

            return (
              <li
                key={task.id}
                className={`group py-6 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all -mx-6 md:-mx-8 px-6 md:px-8 ${
                  isDemoHighlighted
                    ? 'bg-[#ffffff] border-2 border-[#1a1c1a] shadow-md my-2 rounded-none ring-2 ring-[#a14009]'
                    : 'hover:bg-[#f4f3f1]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <span
                      className={`material-symbols-outlined ${
                        isHigh ? 'text-[#a14009]' : 'text-[#76777b]'
                      }`}
                    >
                      {task.actionType === 'COMPLETA' ? 'edit_document' : task.actionType === 'CARICA' ? 'upload_file' : 'policy'}
                    </span>
                  </div>
                  <div>
                    {isDemoHighlighted && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fd844c]/20 text-[#6a2500] text-[10px] font-mono uppercase font-bold tracking-wider mb-1.5 border border-[#fd844c]/40">
                        <span>👉 Attività Dimostrativa Suggerita</span>
                      </div>
                    )}
                    <div className="text-[16px] font-semibold text-[#1a1c1a] mb-1">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[12px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                          isHigh ? 'text-[#a14009]' : 'text-[#76777b]'
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            isHigh ? 'bg-[#a14009]' : 'bg-[#76777b]'
                          }`}
                        ></span>
                        {task.subtitle || 'Azione richiesta'}
                      </span>
                      {task.time && (
                        <span className="text-[12px] font-mono text-[#76777b]">
                          · {task.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleTaskAction(task)}
                    className={`px-6 py-2.5 text-[12px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                      isDemoHighlighted
                        ? 'bg-[#a14009] text-white hover:bg-[#7d2d00] shadow-md animate-pulse'
                        : isHigh
                        ? 'bg-[#1a1c1a] text-white hover:bg-[#333533]'
                        : 'border border-[#1a1c1a] text-[#1a1c1a] hover:bg-[#1a1c1a] hover:text-white'
                    }`}
                  >
                    {task.actionType}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(task.id);
                      if (interactiveDemoStage === 'oggi_task') {
                        setInteractiveDemoStage('practice_prossimo_passo');
                        if (task.practiceId) openPracticeDetail(task.practiceId);
                      }
                    }}
                    title="Segna come completato"
                    className="p-2 text-[#76777b] hover:text-[#1a1c1a] hover:bg-[#e3e2e0] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  const renderAppuntamentiWidget = () => (
    <section key="appuntamenti" className="bg-[#faf9f6] border border-[#c7c6ca] p-6 shadow-sm">
      <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a] border-b border-[#c7c6ca] pb-3 mb-4 flex items-center justify-between">
        <span>Appuntamenti</span>
        <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#76777b]">OGGI</span>
      </h3>

      {appointments.length === 0 ? (
        <p className="text-[13px] text-[#76777b]">Nessun appuntamento programmato per oggi.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              onClick={() => {
                if (app.practiceId) openPracticeDetail(app.practiceId);
                else if (app.clientId) openOpportunityDetail('opp-1');
              }}
              className="flex gap-4 items-start py-2 border-b border-[#efeeeb] last:border-0 hover:bg-[#f4f3f1] -mx-2 px-2 transition-colors cursor-pointer"
            >
              <div className="text-[13px] font-mono font-semibold text-[#a14009] min-w-[50px] pt-0.5">
                {app.time}
              </div>
              <div className="border-l-2 border-[#1a1c1a] pl-3 flex-1">
                <div className="text-[14px] font-semibold text-[#1a1c1a]">
                  {app.title}
                </div>
                <div className="text-[12px] text-[#76777b] mt-0.5">
                  {app.clientName} · {app.propertyAddress} ({app.municipality})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const renderInAttesaWidget = () => (
    <section key="in_attesa" className="bg-[#faf9f6] border border-[#c7c6ca] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
        <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#76777b] text-[20px]">hourglass_empty</span>
          <span>In attesa</span>
        </h3>
        <ContextualHelp conceptId="in_attesa" alwaysVisible={isHelpModeActive} size="sm" />
      </div>

      <ul className="flex flex-col gap-4">
        {waitingItems.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              if (item.practiceId) openPracticeDetail(item.practiceId);
            }}
            className="flex items-start gap-3 hover:bg-[#f4f3f1] -mx-2 p-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#76777b] text-[18px] mt-0.5">
              more_horiz
            </span>
            <div>
              <div className="text-[14px] font-medium text-[#1a1c1a] leading-snug">
                {item.title}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#76777b]">
                {item.codeOrLocation}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );

  const renderScadenzeImminentiWidget = () => {
    const upcomingDeadlines = deadlines.filter((d) => !d.completed);
    return (
      <section key="scadenze_imminenti" className="bg-[#faf9f6] border border-[#c7c6ca] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
          <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a14009] text-[20px]">event_busy</span>
            <span>Scadenze imminenti</span>
          </h3>
          <button
            onClick={() => setActiveTab('scadenze')}
            className="text-[11px] font-bold uppercase text-[#a14009] hover:underline cursor-pointer"
          >
            Vedi tutte →
          </button>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <p className="text-[13px] text-[#76777b]">Nessuna scadenza imminente nei prossimi giorni.</p>
        ) : (
          <ul className="space-y-3">
            {upcomingDeadlines.slice(0, 4).map((d) => (
              <li
                key={d.id}
                onClick={() => openPracticeDetail(d.practiceId)}
                className="flex items-center justify-between p-2.5 bg-white border border-[#c7c6ca]/60 hover:border-[#1a1c1a] cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#1a1c1a]">{d.title}</div>
                  <div className="text-[11px] font-mono text-[#76777b]">Pratica: {d.practiceId}</div>
                </div>
                <span className="px-2 py-0.5 bg-[#ffdbcd] text-[#6a2500] font-mono text-[11px] font-bold">
                  {d.dueDate}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  };

  const renderDocumentiMancantiWidget = () => {
    const missingDocs = documents.filter((d) => d.status === 'Da recuperare' || d.isMissingRequired);
    return (
      <section key="documenti_mancanti" className="bg-[#faf9f6] border border-[#c7c6ca] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
          <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a14009] text-[20px]">folder_off</span>
            <span>Documenti mancanti</span>
          </h3>
          <button
            onClick={() => setActiveTab('documenti')}
            className="text-[11px] font-bold uppercase text-[#a14009] hover:underline cursor-pointer"
          >
            Verifica conformità →
          </button>
        </div>

        {missingDocs.length === 0 ? (
          <p className="text-[13px] text-[#76777b]">Tutti i documenti obbligatori sono stati verificati.</p>
        ) : (
          <ul className="space-y-2.5">
            {missingDocs.slice(0, 4).map((d) => (
              <li
                key={d.id}
                onClick={() => openPracticeDetail(d.practiceId, 'documenti')}
                className="p-2.5 bg-white border border-[#c7c6ca]/60 hover:border-[#1a1c1a] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#1a1c1a]">{d.label}</div>
                  <div className="text-[11px] text-[#76777b]">{d.subtitle}</div>
                </div>
                <span className="text-[11px] uppercase font-bold text-[#a14009]">Da caricare</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  };

  const renderOpportunitaPrioritarieWidget = () => {
    const hotOpp = opportunities.filter((o) => o.priority === 'HOT' || o.sellerIntent === 'Alto');
    return (
      <section key="opportunita_prioritarie" className="bg-[#faf9f6] border border-[#c7c6ca] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
          <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a14009] text-[20px]">stars</span>
            <span>Opportunità prioritarie</span>
          </h3>
          <button
            onClick={() => setActiveTab('opportunita')}
            className="text-[11px] font-bold uppercase text-[#a14009] hover:underline cursor-pointer"
          >
            Vedi tutte →
          </button>
        </div>

        {hotOpp.length === 0 ? (
          <p className="text-[13px] text-[#76777b]">Nessuna opportunità ad alta priorità in attesa.</p>
        ) : (
          <ul className="space-y-3">
            {hotOpp.slice(0, 3).map((opp) => {
              const client = clients.find((c) => c.id === opp.clientId);
              const prop = properties.find((p) => p.id === opp.propertyId);
              const clientName = client ? (client.entityType === 'azienda' ? client.companyName : `${client.firstName} ${client.lastName}`) : 'Cliente';

              return (
                <li
                  key={opp.id}
                  onClick={() => openOpportunityDetail(opp.id)}
                  className="p-3 bg-white border border-[#c7c6ca]/60 hover:border-[#1a1c1a] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#1a1c1a]">{clientName}</span>
                    <span className="px-2 py-0.5 bg-[#1a1c1a] text-white text-[10px] uppercase font-mono font-bold">
                      HOT · Readiness {opp.readiness}%
                    </span>
                  </div>
                  <p className="text-[12px] text-[#76777b]">{prop?.address || 'Immobile da definire'}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  };

  const renderPraticheRecentiWidget = () => (
    <section key="pratiche_recenti" className="bg-[#faf9f6] border border-[#c7c6ca] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
        <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1a1c1a] text-[20px]">folder_open</span>
          <span>Pratiche recenti</span>
        </h3>
        <button
          onClick={() => setActiveTab('pratiche')}
          className="text-[11px] font-bold uppercase text-[#a14009] hover:underline cursor-pointer"
        >
          Tutte le pratiche →
        </button>
      </div>

      {practices.length === 0 ? (
        <p className="text-[13px] text-[#76777b]">Nessuna pratica registrata.</p>
      ) : (
        <ul className="space-y-3">
          {practices.slice(0, 3).map((p) => (
            <li
              key={p.id}
              onClick={() => openPracticeDetail(p.id)}
              className="p-3 bg-white border border-[#c7c6ca]/60 hover:border-[#1a1c1a] cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-[13px] font-mono font-bold text-[#1a1c1a]">{p.code}</div>
                <div className="text-[12px] text-[#76777b]">{p.practiceType}</div>
              </div>
              <span className="text-[11px] font-bold uppercase text-[#a14009]">{p.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12">
      {/* Interactive Demo Banner */}
      {interactiveDemoStage === 'oggi_task' && (
        <aside aria-label="Guida Dimostrativa" className="mb-8 p-6 bg-[#ffffff] border-2 border-[#1a1c1a] shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 shrink-0 bg-[#a14009] text-white flex items-center justify-center font-bold text-[14px]">
                1/2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-[#a14009]">
                    Orientamento Operativo Guidato
                  </span>
                  <span className="px-2 py-0.5 bg-[#efeeeb] text-[#1a1c1a] text-[10px] font-mono uppercase font-semibold">
                    1. Schermata &ldquo;Oggi&rdquo;
                  </span>
                </div>
                <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a] mt-1">
                  Quando entri in Mandato Ready, parti sempre da qui.
                </h2>
                <p className="text-[14px] text-[#46474a] mt-0.5 leading-relaxed">
                  Qui trovi solo le scadenze e le attività urgenti. Clicca su <strong>&ldquo;Completa&rdquo;</strong> per la pratica di Mario Rossi evidenziata sotto.
                </p>
              </div>
            </div>

            <button
              onClick={() => setInteractiveDemoStage(null)}
              className="px-4 py-2 border border-[#c7c6ca] bg-[#faf9f6] hover:bg-[#e3e2e0] text-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer self-start md:self-center shrink-0"
            >
              Termina tour
            </button>
          </div>
        </aside>
      )}

      {/* Header Greeting & Customization Trigger */}
      <header className="mb-8 pb-6 border-b border-[#c7c6ca] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] md:text-[48px] font-serif-display font-bold text-[#1a1c1a] tracking-tight mb-2">
            Buongiorno, {agentFirstName}
          </h1>
          <p className="text-[18px] text-[#46474a] font-normal">
            Ecco cosa richiede la tua attenzione oggi per {agencyProfile.agencyName || 'la tua agenzia'}.
          </p>
        </div>

        {/* Customize Dashboard Button (Requirement #2) */}
        <button
          onClick={openCustomizeModal}
          className="px-4 py-2.5 border border-[#1a1c1a] bg-white hover:bg-[#1a1c1a] text-[#1a1c1a] hover:text-white text-[11px] uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto shadow-sm active:scale-95"
          title="Personalizza quali widget visualizzare in questa dashboard"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Personalizza dashboard</span>
        </button>
      </header>

      {/* Setup Checklist (Post-Onboarding) */}
      {showSetupChecklist && (
        <section className="mb-8 p-6 bg-[#ffffff] border-2 border-[#1a1c1a] animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#c7c6ca]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a14009]" />
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#a14009]">
                  GUIDA INTRODUTTIVA OPERATIVA
                </span>
              </div>
              <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a] mt-0.5">
                Primi passi con Mandato Ready
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[12px] font-mono font-semibold text-[#76777b]">
                {completedChecklistCount} di 4 completati
              </span>
              <button
                onClick={() => dismissHint('oggi_checklist')}
                className="text-[11px] uppercase tracking-wider font-semibold text-[#76777b] hover:text-[#1a1c1a] hover:underline cursor-pointer"
                title="Nascondi questa guida"
              >
                Nascondi
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#efeeeb] h-1.5 mt-3 mb-5">
            <div
              className="bg-[#a14009] h-1.5 transition-all duration-300"
              style={{ width: `${(completedChecklistCount / 4) * 100}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-[#faf9f6] border border-[#c7c6ca] flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#a14009] mt-0.5">
                check_circle
              </span>
              <div>
                <span className="text-[13px] font-semibold text-[#1a1c1a] block">
                  Profilo configurato
                </span>
                <span className="text-[11px] text-[#76777b]">
                  {agencyProfile.agencyName}
                </span>
              </div>
            </div>

            <div
              onClick={() => {
                if (practices.length > 0) openPracticeDetail(practices[0].id);
                else openNewPracticeWizard();
              }}
              className={`p-3 border flex items-start gap-3 cursor-pointer transition-colors ${
                isPracticeDone
                  ? 'bg-[#faf9f6] border-[#c7c6ca]'
                  : 'bg-[#ffffff] border-[#1a1c1a] hover:bg-[#f4f3f1]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] mt-0.5 ${
                  isPracticeDone ? 'text-[#a14009]' : 'text-[#76777b]'
                }`}
              >
                {isPracticeDone ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div>
                <span className="text-[13px] font-semibold text-[#1a1c1a] block">
                  Prima pratica
                </span>
                <span className="text-[11px] text-[#76777b]">
                  {isPracticeDone ? `${practices.length} registrata` : 'Crea subito →'}
                </span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('documenti')}
              className={`p-3 border flex items-start gap-3 cursor-pointer transition-colors ${
                isDocDone
                  ? 'bg-[#faf9f6] border-[#c7c6ca]'
                  : 'bg-[#ffffff] border-[#1a1c1a] hover:bg-[#f4f3f1]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] mt-0.5 ${
                  isDocDone ? 'text-[#a14009]' : 'text-[#76777b]'
                }`}
              >
                {isDocDone ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div>
                <span className="text-[13px] font-semibold text-[#1a1c1a] block">
                  Verifica documenti
                </span>
                <span className="text-[11px] text-[#76777b]">
                  {isDocDone ? 'Atti caricati' : 'Apri conformità →'}
                </span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('scadenze')}
              className={`p-3 border flex items-start gap-3 cursor-pointer transition-colors ${
                isDeadlineDone
                  ? 'bg-[#faf9f6] border-[#c7c6ca]'
                  : 'bg-[#ffffff] border-[#1a1c1a] hover:bg-[#f4f3f1]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] mt-0.5 ${
                  isDeadlineDone ? 'text-[#a14009]' : 'text-[#76777b]'
                }`}
              >
                {isDeadlineDone ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div>
                <span className="text-[13px] font-semibold text-[#1a1c1a] block">
                  Scadenze e scadenziario
                </span>
                <span className="text-[11px] text-[#76777b]">
                  {isDeadlineDone ? 'Attività completata' : 'Vedi calendario →'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Grid Layout based on Enabled Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          {isWidgetEnabled('da_fare_oggi') && renderDaFareOggiWidget()}
          {isWidgetEnabled('scadenze_imminenti') && renderScadenzeImminentiWidget()}
          {isWidgetEnabled('opportunita_prioritarie') && renderOpportunitaPrioritarieWidget()}
          {isWidgetEnabled('pratiche_recenti') && renderPraticheRecentiWidget()}
        </div>

        {/* Secondary Column (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {isWidgetEnabled('appuntamenti') && renderAppuntamentiWidget()}
          {isWidgetEnabled('in_attesa') && renderInAttesaWidget()}
          {isWidgetEnabled('documenti_mancanti') && renderDocumentiMancantiWidget()}
        </div>
      </div>

      {/* CUSTOMIZE DASHBOARD MODAL (Requirement #2) */}
      {isCustomizeOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsCustomizeOpen(false)}
        >
          <div
            className="bg-[#faf9f6] border-2 border-[#1a1c1a] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCustomizeOpen(false)}
              className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#c7c6ca]">
              <span className="material-symbols-outlined text-[#a14009] text-[24px]">tune</span>
              <h3 className="text-[22px] font-serif-display font-bold text-[#1a1c1a]">
                Personalizza Dashboard Oggi
              </h3>
            </div>

            <p className="text-[13px] text-[#46474a] mb-6 leading-relaxed">
              Attiva o disattiva i widget che desideri vedere. La configurazione consigliata (predefinita) include solo le attivit&agrave; essenziali e gli appuntamenti.
            </p>

            <div className="space-y-3 mb-6 max-h-[380px] overflow-y-auto pr-1">
              {draftWidgets.map((w, index) => (
                <div
                  key={w.id}
                  className={`p-3 border flex items-center justify-between gap-3 transition-colors ${
                    w.enabled ? 'bg-white border-[#1a1c1a]' : 'bg-[#efeeeb] border-[#c7c6ca] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveDraftWidget(index, 'up')}
                        className="p-0.5 text-[#76777b] hover:text-[#1a1c1a] disabled:opacity-30 cursor-pointer"
                        title="Sposta su"
                      >
                        <span className="material-symbols-outlined text-[16px]">expand_less</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === draftWidgets.length - 1}
                        onClick={() => handleMoveDraftWidget(index, 'down')}
                        className="p-0.5 text-[#76777b] hover:text-[#1a1c1a] disabled:opacity-30 cursor-pointer"
                        title="Sposta giù"
                      >
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#1a1c1a]">{w.title}</span>
                        {w.isCore && (
                          <span className="px-1.5 py-0.5 bg-[#e3e2e0] text-[#1a1c1a] text-[9px] font-mono uppercase font-semibold">
                            Consigliato
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#76777b] truncate">{w.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={w.enabled}
                      onChange={() => handleToggleDraftWidget(w.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#c7c6ca] peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a14009]" />
                  </label>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#c7c6ca]">
              <button
                type="button"
                onClick={handleResetToRecommended}
                className="text-[11px] font-bold uppercase tracking-wider text-[#a14009] hover:underline cursor-pointer self-start sm:self-auto"
              >
                Ripristina configurazione consigliata
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-4 py-2 border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomization}
                  className="px-5 py-2 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-widest hover:bg-[#333533] cursor-pointer shadow-sm"
                >
                  Salva e applica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
