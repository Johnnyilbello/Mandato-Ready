export interface HelpConcept {
  id: string;
  title: string;
  tooltip: string; // approx 1 short sentence
  description: string;
  category: 'come_funziona' | 'concetti' | 'documenti';
  tags: string[];
}

export const HELP_CONCEPTS: Record<string, HelpConcept> = {
  oggi: {
    id: 'oggi',
    title: 'Oggi',
    tooltip: 'Qui trovi le attività che richiedono la tua attenzione adesso.',
    description: 'La schermata di partenza: mostra subito le scadenze urgenti e i promemoria del giorno per iniziare la giornata senza dispersioni.',
    category: 'come_funziona',
    tags: ['oggi', 'attivita', 'scadenze', 'partenza', 'dashboard', 'promemoria'],
  },
  opportunita: {
    id: 'opportunita',
    title: 'Opportunità',
    tooltip: 'Qui trovi i proprietari da qualificare prima che diventino una pratica.',
    description: 'Spazio dedicato ai venditori in fase di contatto preliminare, prima della firma del mandato formale di compravendita.',
    category: 'concetti',
    tags: ['opportunita', 'venditori', 'incarico', 'lead', 'qualifica', 'trattativa'],
  },
  pratiche: {
    id: 'pratiche',
    title: 'Pratiche',
    tooltip: 'Ogni pratica raccoglie cliente, immobile, documenti, attività e prossimi passi.',
    description: 'Il fascicolo completo e centralizzato: tutte le informazioni restano sempre collegate in un unico posto per tutta la durata dell\'operazione.',
    category: 'come_funziona',
    tags: ['pratiche', 'fascicolo', 'compravendita', 'immobile', 'cliente', 'atti'],
  },
  prossimo_passo: {
    id: 'prossimo_passo',
    title: 'Prossimo passo',
    tooltip: 'È l’azione che Mandato Ready ti consiglia di fare adesso su questa pratica.',
    description: 'Mandato Ready calcola continuamente l\'azione operativa più utile in base allo stato dei documenti per portare la vendita al rogito.',
    category: 'come_funziona',
    tags: ['prossimo passo', 'azione', 'consiglio', 'avanzamento', 'rogito', 'priorita'],
  },
  cosa_manca: {
    id: 'cosa_manca',
    title: 'Cosa manca',
    tooltip: 'Qui trovi subito ciò che deve ancora essere recuperato o completato.',
    description: 'Evidenzia in modo immediato i documenti mancanti e le verifiche ancora da eseguire per completare il fascicolo immobiliare.',
    category: 'come_funziona',
    tags: ['cosa manca', 'mancante', 'recupero', 'documenti', 'checklist', 'integrazione'],
  },
  hot: {
    id: 'hot',
    title: 'Priorità HOT',
    tooltip: 'Priorità commerciale alta: il proprietario sembra intenzionato a procedere a breve.',
    description: 'Indica un\'opportunità commerciale con forte intenzione di vendita a breve termine. Non rappresenta la qualità dell\'immobile né la sua conformità tecnica.',
    category: 'concetti',
    tags: ['hot', 'priorita', 'commerciale', 'vendita', 'urgente', 'decisione'],
  },
  warm: {
    id: 'warm',
    title: 'Priorità WARM',
    tooltip: 'Opportunità interessante, ma con una tempistica o intenzione meno immediata.',
    description: 'Proprietario qualificato con orizzonte di vendita medio (3-6 mesi) che richiede contatti cadenzati di consolidamento.',
    category: 'concetti',
    tags: ['warm', 'priorita', 'media', 'trattativa', 'orizzonte'],
  },
  cold: {
    id: 'cold',
    title: 'Priorità COLD',
    tooltip: 'Il proprietario è ancora in una fase iniziale o esplorativa.',
    description: 'Contatto esplorativo o con decisione differita, da monitorare periodicamente prima di una proposta di mandato.',
    category: 'concetti',
    tags: ['cold', 'esplorativo', 'iniziale', 'lead', 'futuro'],
  },
  intento: {
    id: 'intento',
    title: 'Intento del Venditore',
    tooltip: 'Indica quanto il proprietario sembra vicino alla decisione di vendere.',
    description: 'Stima il livello di determinazione del cliente a mettere sul mercato l\'immobile (Alto, Medio, Esplorativo).',
    category: 'concetti',
    tags: ['intento', 'motivazione', 'venditore', 'decisione', 'urgenza'],
  },
  preparazione: {
    id: 'preparazione',
    title: 'Indice di Preparazione',
    tooltip: 'Indica quante informazioni e documenti risultano già disponibili secondo quanto dichiarato. Non è una verifica di conformità.',
    description: 'Misura la disponibilità iniziale delle informazioni comunicate dal proprietario. Non costituisce né sostituisce una verifica di conformità edilizia, urbanistica o catastale.',
    category: 'concetti',
    tags: ['preparazione', 'readiness', 'documenti', 'dichiarato', 'conformita', 'indice'],
  },
  documenti: {
    id: 'documenti',
    title: 'Gestione Documenti',
    tooltip: 'I documenti vengono organizzati automaticamente per funzione, senza creare cartelle manualmente.',
    description: 'Tutti i file del fascicolo vengono catalogati per ambito funzionale (proprietà, conformità, impianti, parti) con evidenza del loro stato di reperimento.',
    category: 'documenti',
    tags: ['documenti', 'archivio', 'cartelle', 'fascicolo', 'atti', 'file'],
  },
  da_recuperare: {
    id: 'da_recuperare',
    title: 'Stato: Da recuperare',
    tooltip: 'Il documento non risulta ancora disponibile nella pratica.',
    description: 'Il documento è necessario per il fascicolo ma deve ancora essere richiesto al proprietario o reperito presso tecnici o pubblici registri.',
    category: 'documenti',
    tags: ['da recuperare', 'mancante', 'richiesta', 'documento', 'reperire'],
  },
  da_verificare: {
    id: 'da_verificare',
    title: 'Stato: Da verificare',
    tooltip: 'È presente un elemento che richiede un controllo o approfondimento.',
    description: 'Il documento è presente nel fascicolo ma richiede una verifica da parte dell\'agente, del tecnico o del notaio. Mandato Ready non effettua verifiche automatiche legali.',
    category: 'documenti',
    tags: ['da verificare', 'controllo', 'approfondimento', 'verifica', 'tecnico'],
  },
  disponibile: {
    id: 'disponibile',
    title: 'Stato: Disponibile',
    tooltip: 'Il documento è caricato e archiviato correttamente nel fascicolo.',
    description: 'Il file è presente, consultabile e pronto per la predisposizione della proposta e per l\'invio al notaio.',
    category: 'documenti',
    tags: ['disponibile', 'caricato', 'completo', 'presente'],
  },
  in_attesa: {
    id: 'in_attesa',
    title: 'Stato: In attesa',
    tooltip: 'Il documento è stato richiesto ed è in attesa di ricezione da terzi.',
    description: 'Richiesta inoltrata al cliente o al tecnico: in attesa della trasmissione della copia digitale.',
    category: 'documenti',
    tags: ['in attesa', 'inviato', 'richiesto', 'sollecito'],
  },
  antiriciclaggio: {
    id: 'antiriciclaggio',
    title: 'Modulo Antiriciclaggio (AML)',
    tooltip: 'Mandato Ready organizza i passaggi del processo, ma non sostituisce le verifiche professionali previste.',
    description: 'Struttura i passaggi di identificazione e adeguata verifica (D.Lgs. 231/2007) e mantiene ordinate le dichiarazioni del cliente nel fascicolo.',
    category: 'documenti',
    tags: ['antiriciclaggio', 'aml', 'adeguata verifica', 'normativa', '231', 'titolare effettivo'],
  },
  converti_pratica: {
    id: 'converti_pratica',
    title: 'Converti in Pratica',
    tooltip: 'Cliente, immobile e informazioni già raccolte vengono trasferiti senza doverli inserire di nuovo.',
    description: 'Trasforma la trattativa in un fascicolo operativo attivo, portando automaticamente anagrafica, dati immobile e documenti già indicati.',
    category: 'concetti',
    tags: ['converti', 'crea pratica', 'trasferimento', 'incarico', 'passaggio'],
  },
  completezza_pratica: {
    id: 'completezza_pratica',
    title: 'Completezza Pratica',
    tooltip: 'Mostra quanto del flusso operativo risulta completato, non la conformità dell’immobile.',
    description: 'Percentuale indicativa dell\'avanzamento delle attività operative previste. Non esprime alcun giudizio sulla conformità edilizia, urbanistica o legale dell\'immobile.',
    category: 'concetti',
    tags: ['completezza', 'percentuale', 'avanzamento', 'flusso', 'conformita', 'stato'],
  },
};

export const HELP_CATEGORIES = [
  { id: 'come_funziona', label: 'Come funziona', icon: 'auto_awesome' },
  { id: 'concetti', label: 'Concetti chiave', icon: 'psychology' },
  { id: 'documenti', label: 'Documenti & Conformità', icon: 'folder_open' },
] as const;

export function searchHelpConcepts(query: string): HelpConcept[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return Object.values(HELP_CONCEPTS);

  return Object.values(HELP_CONCEPTS).filter((concept) => {
    return (
      concept.title.toLowerCase().includes(clean) ||
      concept.tooltip.toLowerCase().includes(clean) ||
      concept.description.toLowerCase().includes(clean) ||
      concept.tags.some((t) => t.toLowerCase().includes(clean))
    );
  });
}
