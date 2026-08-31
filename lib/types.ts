export type ClientType = 'seller' | 'buyer' | 'both';
export type EntityType = 'persona' | 'azienda';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  type: ClientType;
  fiscalCode?: string;
  city?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  entityType?: EntityType;
  companyName?: string;
  contactPerson?: string;
  vatNumber?: string;
}

export interface Property {
  id: string;
  address: string;
  civicNumber?: string;
  municipality: string;
  province: string;
  area?: string;
  type: string;
  approximateSurface: number; // in m²
  rooms?: number;
  bathrooms?: number;
  floor?: string;
  askingPrice?: number; // Prezzo richiesto dal proprietario (opzionale)
  estimatedValue?: number; // Kept for backwards compatibility
  owners: string[]; // Client IDs
  notes?: string;
  energyClass?: string;
  statusState?: string;
}

export type DashboardWidgetId =
  | 'da_fare_oggi'
  | 'appuntamenti'
  | 'in_attesa'
  | 'scadenze_imminenti'
  | 'documenti_mancanti'
  | 'opportunita_prioritarie'
  | 'pratiche_recenti';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  title: string;
  description: string;
  enabled: boolean;
  isCore?: boolean;
}

export type SellerIntent = 'Alto' | 'Medio' | 'Basso';
export type OpportunityPriority = 'HOT' | 'WARM' | 'COLD';
export type OpportunityStatus = 'active' | 'converted' | 'archived';

export interface DeclaredDoc {
  id: string;
  label: string;
  category: 'immobile' | 'cliente' | 'incarico' | 'antiriciclaggio';
  declaredPresent: boolean;
  notes?: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  propertyId: string;
  sellerIntent: SellerIntent;
  readiness: number; // 0 - 100
  priority: OpportunityPriority;
  sellingTimeframe: string;
  motivation: string;
  briefing: string;
  appointmentDate?: string;
  declaredDocuments: DeclaredDoc[];
  recommendedAction: string;
  nextAction: string;
  status: OpportunityStatus;
  estimatedPrice?: number;
  preparationAdvice?: {
    sintesi: string;
    daApprofondire: string[];
    domandeConsigliate: string[];
    prossimaAzione: string;
  };
}

export type PracticeStatus = 'In corso' | 'Pronto' | 'Da verificare' | 'In attesa' | 'Completato';
export type MandateStatus = 'da_preparare' | 'da_firmare' | 'firmato' | 'in_scadenza' | 'completato';
export type AmlStatus = 'non_avviato' | 'in_corso' | 'da_verificare' | 'completato';
export type ProposalStatus = 'nessuna' | 'ricevuta' | 'in_valutazione' | 'accettata';

export type DocumentCategory = 'immobile' | 'cliente' | 'incarico' | 'antiriciclaggio';
export type DocumentStatus = 'Disponibile' | 'Da recuperare' | 'In attesa' | 'Da verificare';

export interface DocumentItem {
  id: string;
  practiceId: string;
  category: DocumentCategory;
  label: string;
  subtitle: string;
  status: DocumentStatus;
  mockFileName?: string;
  updatedAt?: string;
  expiryDate?: string;
  isMissingRequired?: boolean;
}

export interface Mandate {
  id: string;
  practiceId: string;
  clientIds: string[];
  propertyId: string;
  mandateType: string;
  exclusivity: string;
  startDate: string;
  endDate: string;
  askingPrice: number;
  commissionType: string;
  commissionValue: string;
  notes: string;
  customClauses: string;
  status: 'Da compilare' | 'Bozza' | 'Da controllare' | 'Pronto per la firma' | 'Inviato' | 'Parzialmente firmato' | 'Firmato' | 'Annullato';
  templateId: string;
  createdAt: string;
  updatedAt: string;
  signatories: Signatory[];
  signingProcessId?: string;
}

export interface Signatory {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'Da invitare' | 'Inviato' | 'Visualizzato' | 'In attesa di firma' | 'Firmato' | 'Errore';
}

export interface SigningProcess {
  id: string;
  documentId: string; // Could be a mandate ID, or other document ID
  practiceId: string;
  mode: 'Sequenziale' | 'Contemporanea';
  status: 'Da inviare' | 'In corso' | 'Completato' | 'Annullato' | 'Errore';
  signatories: Signatory[];
  createdAt: string;
  sentAt?: string;
  completedAt?: string;
}

export interface AmlDossier {
  id: string;
  practiceId: string;
  status: 'Da iniziare' | 'In corso' | 'Da completare' | 'Da rivedere' | 'Completato operativamente';
  sections: {
    soggetti: boolean;
    identificazione: boolean;
    relazioni: boolean;
    operazione: boolean;
    origineFondi: boolean;
    valutazione: boolean;
  };
  riskAssessment: {
    level: string;
    notes: string;
    date: string;
  };
}

export interface PracticeNote {
  id: string;
  date: string;
  time: string;
  author: string;
  text: string;
}

export interface PracticeTimelineItem {
  id: string;
  date: string;
  title: string;
  completed: boolean;
  current?: boolean;
}

export interface Practice {
  id: string;
  code: string;
  clientId: string;
  propertyId: string;
  sourceOpportunityId?: string;
  practiceType: 'Compravendita' | 'Locazione' | 'Valutazione e Incarico';
  status: PracticeStatus;
  mandateStatus: MandateStatus;
  amlStatus: AmlStatus;
  documentStatus: 'incompleto' | 'in_corso' | 'pronto';
  proposalStatus: ProposalStatus;
  openedDate: string;
  assignedAgent: {
    name: string;
    initials: string;
  };
  estimatedValue: number;
  nextAction: {
    title: string;
    description: string;
    ctaText: string;
    targetSection?: 'documenti' | 'incarico' | 'aml' | 'cliente' | 'immobile' | 'firma';
    documentIdToUpload?: string;
  };
  amlWorkflow: {
    clienteIdentificato: boolean;
    informazioniRaccolte: boolean;
    titolareEffettivoVerificato: boolean;
    fascicoloCompleto: boolean;
    notes?: string;
  };
  notes: PracticeNote[];
  timeline: PracticeTimelineItem[];
}

export interface Task {
  id: string;
  practiceId?: string;
  clientId?: string;
  propertyId?: string;
  title: string;
  subtitle?: string;
  time?: string;
  urgency?: string;
  priority: 'high' | 'medium' | 'normal';
  status: 'pending' | 'completed';
  actionType: 'COMPLETA' | 'CONTINUA' | 'DETTAGLI' | 'VERIFICA' | 'CARICA' | 'FIRMA';
  targetSection?: 'incarico' | 'aml' | 'documenti' | 'dettagli' | 'firma';
  dueDate?: string;
}

export interface Deadline {
  id: string;
  practiceId: string;
  title: string;
  dueDate: string;
  group: 'oggi' | 'questa_settimana' | 'in_ritardo' | 'piu_avanti';
  completed: boolean;
  priority?: 'high' | 'normal';
}

export interface Appointment {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  type: 'Sopralluogo' | 'Visita Immobile' | 'Incontro Incarico' | 'Rogito Notarile';
  propertyAddress: string;
  municipality: string;
  clientName: string;
  clientId?: string;
  practiceId?: string;
  mapImagePlaceholder?: string;
}

export interface WaitingItem {
  id: string;
  title: string;
  codeOrLocation: string;
  practiceId?: string;
  type: 'firma_digitale' | 'visura' | 'integrazione_documenti';
}

export type StartChoice = 'new_practice' | 'opportunity' | 'explore_demo';
export type InteractiveDemoStage = 'oggi_task' | 'practice_next_action' | 'practice_prossimo_passo' | 'practice_missing_docs' | null;

export interface TaxonomyConfig {
  disabledCategories: string[];
  preferredCategories: string[];
  customCategories: string[];
}

export interface WorkPreferences {
  enableAmlModule: boolean;
  practiceTypes: string[];
  defaultDocs: string[];
  contextualHelpPreference?: 'all' | 'reduced';
  taxonomyConfig?: TaxonomyConfig;
}

export interface AgencyProfile {
  agencyName: string;
  agentName: string;
  phone?: string;
  email?: string;
  city?: string;
  logoInitials?: string;
  workPreferences: WorkPreferences;
}

export interface OnboardingDraft {
  step: 0 | 1 | 2 | 3 | 4;
  agencyName: string;
  agentName: string;
  phone: string;
  email: string;
  city: string;
  startChoice: StartChoice | null;
  enableAmlModule: boolean;
  practiceTypes: string[];
  defaultDocs: string[];
}
