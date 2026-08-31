import type { DashboardWidgetConfig, DashboardWidgetId } from './types';

export const DASHBOARD_PREF_KEY = 'dashboard_widgets_v1';

export const RECOMMENDED_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'da_fare_oggi', title: 'Da fare oggi', description: 'Le prossime azioni delle pratiche attive', enabled: true, isCore: true },
  { id: 'appuntamenti', title: 'Appuntamenti di oggi', description: 'Gli appuntamenti operativi della giornata', enabled: true, isCore: true },
  { id: 'in_attesa', title: 'In attesa', description: 'Elementi in attesa di risposta o completamento', enabled: false },
  { id: 'scadenze_imminenti', title: 'Scadenze imminenti', description: 'Scadenze di oggi e della settimana', enabled: false },
  { id: 'documenti_mancanti', title: 'Documenti mancanti', description: 'Pratiche con documenti obbligatori da recuperare', enabled: false },
  { id: 'opportunita_prioritarie', title: 'Opportunità prioritarie', description: 'Venditori HOT/WARM ancora da convertire', enabled: false },
  { id: 'pratiche_recenti', title: 'Pratiche recenti', description: 'Ultimi fascicoli aperti', enabled: false },
];

const CORE_WIDGET_IDS = new Set<DashboardWidgetId>(['da_fare_oggi', 'appuntamenti']);

export const normalizeDashboardWidgets = (widgets: DashboardWidgetConfig[]): DashboardWidgetConfig[] => {
  const byId = new Map(widgets.map((widget) => [widget.id, widget]));
  return RECOMMENDED_DASHBOARD_WIDGETS.map((definition) => {
    const merged = { ...definition, ...(byId.get(definition.id) || {}) };
    return CORE_WIDGET_IDS.has(merged.id) ? { ...merged, enabled: true, isCore: true } : merged;
  });
};

export const toggleDashboardWidget = (
  widgets: DashboardWidgetConfig[],
  id: DashboardWidgetId
): DashboardWidgetConfig[] => normalizeDashboardWidgets(
  widgets.map((widget) => widget.id === id && !widget.isCore ? { ...widget, enabled: !widget.enabled } : widget)
);

export const moveDashboardWidget = (
  widgets: DashboardWidgetConfig[],
  id: DashboardWidgetId,
  direction: -1 | 1
): DashboardWidgetConfig[] => {
  const normalized = normalizeDashboardWidgets(widgets);
  const index = normalized.findIndex((widget) => widget.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= normalized.length) return normalized;
  const next = [...normalized];
  [next[index], next[target]] = [next[target], next[index]];
  return normalizeDashboardWidgets(next);
};

export const resetDashboardWidgets = (): DashboardWidgetConfig[] =>
  RECOMMENDED_DASHBOARD_WIDGETS.map((widget) => ({ ...widget }));
