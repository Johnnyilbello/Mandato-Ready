'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ContextualHelp } from '@/components/common/ContextualHelp';
import { deriveNextAction } from '@/lib/nextAction';
import { uiPreferenceStorage } from '@/lib/storage';
import type { DashboardWidgetConfig, DashboardWidgetId } from '@/lib/types';

const DASHBOARD_PREF_KEY = 'dashboard_widgets_v1';

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'da_fare_oggi', title: 'Da fare oggi', description: 'Le prossime azioni delle pratiche attive', enabled: true, isCore: true },
  { id: 'appuntamenti', title: 'Appuntamenti di oggi', description: 'Gli appuntamenti operativi della giornata', enabled: true, isCore: true },
  { id: 'in_attesa', title: 'In attesa', description: 'Elementi in attesa di risposta o completamento', enabled: false },
  { id: 'scadenze_imminenti', title: 'Scadenze imminenti', description: 'Scadenze di oggi e della settimana', enabled: false },
  { id: 'documenti_mancanti', title: 'Documenti mancanti', description: 'Pratiche con documenti obbligatori da recuperare', enabled: false },
  { id: 'opportunita_prioritarie', title: 'Opportunità prioritarie', description: 'Venditori HOT/WARM ancora da convertire', enabled: false },
  { id: 'pratiche_recenti', title: 'Pratiche recenti', description: 'Ultimi fascicoli aperti', enabled: false },
];

const normalizeWidgets = (widgets: DashboardWidgetConfig[]): DashboardWidgetConfig[] => {
  const byId = new Map(widgets.map((widget) => [widget.id, widget]));
  const merged = DEFAULT_WIDGETS.map((definition) => ({ ...definition, ...(byId.get(definition.id) || {}) }));
  const coreIds: DashboardWidgetId[] = ['da_fare_oggi', 'appuntamenti'];
  return merged.map((widget) => (coreIds.includes(widget.id) ? { ...widget, enabled: true, isCore: true } : widget));
};

export const OggiView: React.FC = () => {
  const {
    practices,
    documents,
    appointments,
    waitingItems,
    deadlines,
    opportunities,
    getClientById,
    getPropertyById,
    getDocumentsByPracticeId,
    getMandateByPracticeId,
    getSigningProcessByPracticeId,
    getAmlDossierByPracticeId,
    openPracticeDetail,
    openOpportunityDetail,
    agencyProfile,
    isHelpModeActive,
  } = useApp();

  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() =>
    normalizeWidgets(uiPreferenceStorage.read(DASHBOARD_PREF_KEY, DEFAULT_WIDGETS))
  );
  const [isCustomizing, setIsCustomizing] = useState(false);

  const practiceActions = useMemo(
    () =>
      practices
        .filter((practice) => practice.status !== 'Completato')
        .map((practice) => {
          const nextAction = deriveNextAction({
            practice,
            client: getClientById(practice.clientId),
            property: getPropertyById(practice.propertyId),
            documents: getDocumentsByPracticeId(practice.id),
            mandate: getMandateByPracticeId(practice.id),
            signingProcess: getSigningProcessByPracticeId(practice.id),
            amlDossier: getAmlDossierByPracticeId(practice.id),
            amlEnabled: agencyProfile.workPreferences.enableAmlModule,
          });
          return { practice, nextAction };
        })
        .filter(({ nextAction }) => nextAction.urgency !== 'none')
        .sort((a, b) => (a.nextAction.urgency === 'high' && b.nextAction.urgency !== 'high' ? -1 : b.nextAction.urgency === 'high' && a.nextAction.urgency !== 'high' ? 1 : 0)),
    [
      agencyProfile.workPreferences.enableAmlModule,
      getAmlDossierByPracticeId,
      getClientById,
      getDocumentsByPracticeId,
      getMandateByPracticeId,
      getPropertyById,
      getSigningProcessByPracticeId,
      practices,
    ]
  );

  const saveWidgets = (next: DashboardWidgetConfig[]) => {
    const normalized = normalizeWidgets(next);
    setWidgets(normalized);
    uiPreferenceStorage.write(DASHBOARD_PREF_KEY, normalized);
  };

  const toggleWidget = (id: DashboardWidgetId) => {
    saveWidgets(widgets.map((widget) => widget.id === id && !widget.isCore ? { ...widget, enabled: !widget.enabled } : widget));
  };

  const moveWidget = (id: DashboardWidgetId, direction: -1 | 1) => {
    const index = widgets.findIndex((widget) => widget.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= widgets.length) return;
    const next = [...widgets];
    [next[index], next[target]] = [next[target], next[index]];
    saveWidgets(next);
  };

  const resetRecommended = () => saveWidgets(DEFAULT_WIDGETS);

  const activeWidgets = widgets.filter((widget) => widget.enabled);

  const WidgetShell: React.FC<{ title: string; children: React.ReactNode; secondary?: boolean }> = ({ title, children, secondary }) => (
    <section className={`${secondary ? 'border border-[#c7c6ca] bg-white' : 'border border-[#c7c6ca] bg-[#faf9f6]'} p-5 sm:p-6 min-w-0`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#c7c6ca]">
        <h2 className="text-[18px] sm:text-[20px] font-serif-display font-bold text-[#1a1c1a]">{title}</h2>
      </div>
      {children}
    </section>
  );

  const renderWidget = (id: DashboardWidgetId) => {
    if (id === 'da_fare_oggi') {
      return (
        <WidgetShell title="Da fare oggi">
          <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-[#76777b]">
            Prossime azioni derivate dalle pratiche
            <ContextualHelp conceptId="prossimo_passo" alwaysVisible={isHelpModeActive} />
          </div>
          {practiceActions.length === 0 ? (
            <div className="p-5 border border-dashed border-[#c7c6ca] bg-white text-[13px] text-[#76777b]">Nessuna azione urgente. Le pratiche sono allineate.</div>
          ) : (
            <div className="space-y-3">
              {practiceActions.slice(0, 8).map(({ practice, nextAction }) => {
                const client = getClientById(practice.clientId);
                const property = getPropertyById(practice.propertyId);
                const clientName = client?.companyName || `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Cliente';
                return (
                  <button key={practice.id} onClick={() => openPracticeDetail(practice.id, nextAction.targetSection)} className="w-full p-4 border border-[#c7c6ca] bg-white hover:border-[#1a1c1a] transition-colors text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2 mb-1"><span className={`w-2 h-2 rounded-full ${nextAction.urgency === 'high' ? 'bg-[#a14009]' : 'bg-[#76777b]'}`} /><span className="text-[13px] font-bold text-[#1a1c1a]">{nextAction.title}</span></span>
                      <span className="text-[12px] text-[#76777b] block break-words">{clientName} · {property?.address || property?.municipality || 'Immobile'} · {practice.code}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a14009] shrink-0">Apri pratica →</span>
                  </button>
                );
              })}
            </div>
          )}
        </WidgetShell>
      );
    }

    if (id === 'appuntamenti') {
      return (
        <WidgetShell title="Appuntamenti di oggi" secondary>
          {appointments.length === 0 ? <p className="text-[13px] text-[#76777b]">Nessun appuntamento registrato per oggi.</p> : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <button key={appointment.id} onClick={() => appointment.practiceId && openPracticeDetail(appointment.practiceId)} disabled={!appointment.practiceId} className="w-full p-3 border border-[#c7c6ca] bg-[#faf9f6] text-left disabled:cursor-default min-w-0">
                  <div className="flex items-start gap-3"><span className="font-mono text-[12px] font-bold text-[#a14009] shrink-0">{appointment.time}</span><span className="min-w-0"><span className="font-bold text-[13px] block break-words">{appointment.title}</span><span className="text-[11px] text-[#76777b] block break-words">{appointment.clientName} · {appointment.propertyAddress} · {appointment.municipality}</span></span></div>
                </button>
              ))}
            </div>
          )}
        </WidgetShell>
      );
    }

    if (id === 'in_attesa') {
      return <WidgetShell title="In attesa" secondary>{waitingItems.length ? <div className="space-y-2">{waitingItems.map((item) => <button key={item.id} onClick={() => item.practiceId && openPracticeDetail(item.practiceId)} disabled={!item.practiceId} className="w-full text-left p-3 border border-[#c7c6ca] text-[12px] disabled:cursor-default"><strong className="block">{item.title}</strong><span className="text-[#76777b]">{item.codeOrLocation}</span></button>)}</div> : <p className="text-[13px] text-[#76777b]">Nessun elemento in attesa.</p>}</WidgetShell>;
    }

    if (id === 'scadenze_imminenti') {
      const upcoming = deadlines.filter((deadline) => !deadline.completed && ['oggi', 'questa_settimana', 'in_ritardo'].includes(deadline.group));
      return <WidgetShell title="Scadenze imminenti" secondary>{upcoming.length ? <div className="space-y-2">{upcoming.slice(0, 6).map((deadline) => <button key={deadline.id} onClick={() => openPracticeDetail(deadline.practiceId)} className="w-full text-left p-3 border border-[#c7c6ca] text-[12px]"><strong className="block break-words">{deadline.title}</strong><span className="text-[#76777b]">{deadline.dueDate}</span></button>)}</div> : <p className="text-[13px] text-[#76777b]">Nessuna scadenza imminente.</p>}</WidgetShell>;
    }

    if (id === 'documenti_mancanti') {
      const missingByPractice = practices.map((practice) => ({ practice, count: documents.filter((document) => document.practiceId === practice.id && document.isMissingRequired && document.status !== 'Disponibile' && document.status !== 'Firmato').length })).filter((item) => item.count > 0);
      return <WidgetShell title="Documenti mancanti" secondary>{missingByPractice.length ? <div className="space-y-2">{missingByPractice.slice(0, 6).map(({ practice, count }) => <button key={practice.id} onClick={() => openPracticeDetail(practice.id, 'documenti', 'documenti')} className="w-full text-left p-3 border border-[#c7c6ca] text-[12px] flex items-center justify-between gap-3"><span className="font-bold">{practice.code}</span><span className="text-[#a14009] font-bold">{count} da recuperare</span></button>)}</div> : <p className="text-[13px] text-[#76777b]">Nessun documento obbligatorio mancante.</p>}</WidgetShell>;
    }

    if (id === 'opportunita_prioritarie') {
      const priority = opportunities.filter((opportunity) => opportunity.status === 'active' && (opportunity.priority === 'HOT' || opportunity.priority === 'WARM'));
      return <WidgetShell title="Opportunità prioritarie" secondary>{priority.length ? <div className="space-y-2">{priority.slice(0, 6).map((opportunity) => <button key={opportunity.id} onClick={() => openOpportunityDetail(opportunity.id)} className="w-full text-left p-3 border border-[#c7c6ca] text-[12px] flex items-center justify-between gap-3"><span><strong className="block">{getClientById(opportunity.clientId)?.companyName || `${getClientById(opportunity.clientId)?.firstName || ''} ${getClientById(opportunity.clientId)?.lastName || ''}`}</strong><span className="text-[#76777b]">Readiness {opportunity.readiness}/100</span></span><span className="font-bold text-[#a14009]">{opportunity.priority}</span></button>)}</div> : <p className="text-[13px] text-[#76777b]">Nessuna opportunità prioritaria.</p>}</WidgetShell>;
    }

    return <WidgetShell title="Pratiche recenti" secondary><div className="space-y-2">{practices.slice(0, 5).map((practice) => <button key={practice.id} onClick={() => openPracticeDetail(practice.id)} className="w-full text-left p-3 border border-[#c7c6ca] text-[12px]"><strong>{practice.code}</strong><span className="text-[#76777b] ml-2">{practice.practiceType} · {practice.status}</span></button>)}</div></WidgetShell>;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 font-sans pb-24 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#c7c6ca]">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">IL TUO LAVORO ADESSO</div>
          <h1 className="text-[34px] md:text-[42px] font-serif-display font-bold text-[#1a1c1a]">Oggi</h1>
          <p className="text-[14px] text-[#46474a] mt-1">Solo ciò che richiede attenzione, con il prossimo passo coerente con ogni pratica.</p>
        </div>
        <button onClick={() => setIsCustomizing((value) => !value)} className="px-4 py-2.5 border border-[#1a1c1a] text-[11px] uppercase font-bold tracking-wider hover:bg-[#1a1c1a] hover:text-white">Personalizza dashboard</button>
      </div>

      {isCustomizing && (
        <section className="mb-8 border border-[#1a1c1a] bg-[#faf9f6] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#c7c6ca]"><div><h2 className="text-[18px] font-serif-display font-bold">Personalizza dashboard</h2><p className="text-[12px] text-[#76777b]">I due widget principali restano sempre attivi. Gli altri sono facoltativi.</p></div><button onClick={resetRecommended} className="text-[10px] uppercase font-bold text-[#a14009] underline">Ripristina configurazione consigliata</button></div>
          <div className="space-y-2">
            {widgets.map((widget, index) => (
              <div key={widget.id} className="p-3 bg-white border border-[#c7c6ca] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div><strong className="text-[13px]">{widget.title}</strong><p className="text-[11px] text-[#76777b]">{widget.description}</p></div>
                <div className="flex items-center gap-2 shrink-0"><button type="button" onClick={() => moveWidget(widget.id, -1)} disabled={index === 0} className="w-8 h-8 border border-[#c7c6ca] disabled:opacity-30" aria-label={`Sposta ${widget.title} su`}>↑</button><button type="button" onClick={() => moveWidget(widget.id, 1)} disabled={index === widgets.length - 1} className="w-8 h-8 border border-[#c7c6ca] disabled:opacity-30" aria-label={`Sposta ${widget.title} giù`}>↓</button><button type="button" disabled={widget.isCore} onClick={() => toggleWidget(widget.id)} className={`min-w-20 px-3 py-2 border text-[10px] uppercase font-bold ${widget.enabled ? 'bg-[#1a1c1a] text-white border-[#1a1c1a]' : 'bg-white text-[#76777b] border-[#c7c6ca]'} disabled:opacity-70 disabled:cursor-not-allowed`}>{widget.isCore ? 'Sempre' : widget.enabled ? 'Visibile' : 'Nascosto'}</button></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {activeWidgets.map((widget, index) => <div key={widget.id} className={index < 2 ? '' : 'xl:col-span-1'}>{renderWidget(widget.id)}</div>)}
      </div>
    </div>
  );
};
