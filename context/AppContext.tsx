'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Client,
  Property,
  Opportunity,
  Practice,
  DocumentItem,
  Task,
  Deadline,
  Appointment,
  WaitingItem,
  DocumentStatus,
  PracticeNote,
  AgencyProfile,
  OnboardingDraft,
  StartChoice,
  InteractiveDemoStage,
  Mandate,
  SigningProcess,
  AmlDossier,
} from '@/lib/types';
import {
  INITIAL_CLIENTS,
  INITIAL_PROPERTIES,
  INITIAL_OPPORTUNITIES,
  INITIAL_PRACTICES,
  INITIAL_DOCUMENTS,
  INITIAL_TASKS,
  INITIAL_DEADLINES,
  INITIAL_APPOINTMENTS,
  INITIAL_WAITING_ITEMS,
} from '@/lib/sampleData';

export type NavigationTab =
  | 'oggi'
  | 'opportunita'
  | 'pratiche'
  | 'documenti'
  | 'clienti'
  | 'immobili'
  | 'scadenze'
  | 'archivio'
  | 'valutazioni'
  | 'impostazioni'
  | 'nuova_pratica'
  | 'incarico_wizard'
  | 'aml_wizard'
  | 'firma_process';

interface AppContextType {
  // Navigation State
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedPracticeId: string | null;
  setSelectedPracticeId: (id: string | null) => void;
  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  practiceActiveSubTab: 'dettagli' | 'documenti' | 'appuntamenti' | 'note' | 'aml';
  setPracticeActiveSubTab: (tab: 'dettagli' | 'documenti' | 'appuntamenti' | 'note' | 'aml') => void;
  focusedPracticeSection: string | null;
  setFocusedPracticeSection: (section: string | null) => void;

  // Data Collections
  clients: Client[];
  properties: Property[];
  opportunities: Opportunity[];
  practices: Practice[];
  documents: DocumentItem[];
  tasks: Task[];
  deadlines: Deadline[];
  appointments: Appointment[];
  waitingItems: WaitingItem[];
  mandates: Mandate[];
  signingProcesses: SigningProcess[];
  amlDossiers: AmlDossier[];

  // Helper getters
  getClientById: (id?: string) => Client | undefined;
  getPropertyById: (id?: string) => Property | undefined;
  getPracticeById: (id?: string) => Practice | undefined;
  getOpportunityById: (id?: string) => Opportunity | undefined;
  getDocumentsByPracticeId: (practiceId: string) => DocumentItem[];
  getTasksByPracticeId: (practiceId: string) => Task[];
  getMandateByPracticeId: (practiceId: string) => Mandate | undefined;
  getSigningProcessByPracticeId: (practiceId: string) => SigningProcess | undefined;
  getAmlDossierByPracticeId: (practiceId: string) => AmlDossier | undefined;

  // Actions
  updateMandate: (mandate: Partial<Mandate> & { practiceId: string }) => void;
  updateSigningProcess: (process: Partial<SigningProcess> & { practiceId: string }) => void;
  updateAmlDossier: (dossier: Partial<AmlDossier> & { practiceId: string }) => void;
  convertOpportunityToPractice: (opportunityId: string) => string;
  createPracticeFromWizard: (data: {
    clientId: string;
    propertyId: string;
    practiceType: Practice['practiceType'];
    availableDocLabels?: string[];
  }) => string;
  uploadOrMarkDocument: (documentId: string, status?: DocumentStatus, fileName?: string) => void;
  addDocumentToPractice: (
    practiceId: string,
    category: DocumentItem['category'],
    label: string,
    subtitle: string,
    status: DocumentStatus
  ) => void;
  updatePractice: (practiceId: string, updates: Partial<Practice>) => void;
  addPracticeNote: (practiceId: string, text: string) => void;
  updateAmlWorkflow: (practiceId: string, updates: Partial<Practice['amlWorkflow']>) => void;
  completeTask: (taskId: string) => void;
  addDeadline: (
    practiceId: string,
    title: string,
    dueDate: string,
    group: Deadline['group'],
    priority?: 'high' | 'normal'
  ) => void;
  toggleDeadline: (deadlineId: string) => void;
  addNewClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Client;
  addNewProperty: (propertyData: Omit<Property, 'id'>) => Property;

  // Navigation shortcuts
  openPracticeDetail: (practiceId: string, focusSection?: string, subTab?: 'dettagli' | 'documenti' | 'appuntamenti' | 'note' | 'aml') => void;
  closePracticeDetail: () => void;
  openOpportunityDetail: (opportunityId: string) => void;
  closeOpportunityDetail: () => void;
  openNewPracticeWizard: (presetMode?: 'opportunity' | 'existing_client' | 'new_client', sourceId?: string) => void;

  // Agency Profile & Onboarding State
  agencyProfile: AgencyProfile;
  updateAgencyProfile: (updates: Partial<AgencyProfile>) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  onboardingDraft: OnboardingDraft;
  updateOnboardingDraft: (updates: Partial<OnboardingDraft>) => void;
  completeOnboarding: (finalChoice?: StartChoice) => void;
  resetOnboarding: () => void;
  interactiveDemoStage: InteractiveDemoStage;
  setInteractiveDemoStage: (stage: InteractiveDemoStage) => void;
  dismissedHints: string[];
  dismissHint: (hintId: string) => void;
  resetHints: () => void;
  isHintDismissed: (hintId: string) => boolean;
  seedCoherentDemoData: () => void;

  // Prototype / Demo utilities
  wizardPreset: { mode?: 'opportunity' | 'existing_client' | 'new_client'; sourceId?: string } | null;
  setWizardPreset: (preset: { mode?: 'opportunity' | 'existing_client' | 'new_client'; sourceId?: string } | null) => void;
  resetDemoData: () => void;
  seedNewOpportunity: () => void;

  // Global Creation Modals
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;

  isNewClientModalOpen: boolean;
  newClientModalState: { prefill?: Partial<Client>; onSaveCallback?: (c: Client) => void } | null;
  openNewClientModal: (prefill?: Partial<Client>, callback?: (c: Client) => void) => void;
  closeNewClientModal: () => void;

  isNewPropertyModalOpen: boolean;
  newPropertyModalState: { prefill?: Partial<Property>; onSaveCallback?: (p: Property) => void } | null;
  openNewPropertyModal: (prefill?: Partial<Property>, callback?: (p: Property) => void) => void;
  closeNewPropertyModal: () => void;

  // Help System & Help Mode
  isHelpModeActive: boolean;
  setIsHelpModeActive: (val: boolean) => void;
  toggleHelpMode: () => void;
  isHelpPanelOpen: boolean;
  setIsHelpPanelOpen: (val: boolean) => void;
  toggleHelpPanel: () => void;
  contextualHelpPreference: 'all' | 'reduced';
  setContextualHelpPreference: (val: 'all' | 'reduced') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'mandato_ready_v1_';

export const DEFAULT_AGENCY_PROFILE: AgencyProfile = {
  agencyName: 'Studio Immobiliare Duomo',
  agentName: 'Anna Ferrari',
  phone: '+39 02 8901234',
  email: 'anna.ferrari@studioimmobiliare.it',
  city: 'Milano',
  logoInitials: 'SI',
  workPreferences: {
    enableAmlModule: true,
    practiceTypes: ['Compravendita', 'Locazione', 'Valutazione e Incarico'],
    defaultDocs: [
      'Documento d\'identità e Codice Fiscale',
      'Visura catastale aggiornata',
      'Planimetria catastale conforme',
      'Atto di provenienza (rogito / successione)',
      'Attestato di Prestazione Energetica (APE)',
      'Conformità edilizia/urbanistica',
    ],
  },
};

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  step: 1,
  agencyName: '',
  agentName: '',
  phone: '',
  email: '',
  city: 'Milano',
  startChoice: null,
  enableAmlModule: true,
  practiceTypes: ['Compravendita', 'Locazione', 'Valutazione e Incarico'],
  defaultDocs: [
    'Documento d\'identità e Codice Fiscale',
    'Visura catastale aggiornata',
    'Planimetria catastale conforme',
    'Atto di provenienza (rogito / successione)',
    'Attestato di Prestazione Energetica (APE)',
    'Conformità edilizia/urbanistica',
  ],
};

let idCounter = 1000;
const generateUniqueId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

const getInitialState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('oggi');
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>('prat-1');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>('opp-1');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [practiceActiveSubTab, setPracticeActiveSubTab] = useState<
    'dettagli' | 'documenti' | 'appuntamenti' | 'note' | 'aml'
  >('dettagli');
  const [focusedPracticeSection, setFocusedPracticeSection] = useState<string | null>(null);
  const [wizardPreset, setWizardPreset] = useState<{
    mode?: 'opportunity' | 'existing_client' | 'new_client';
    sourceId?: string;
  } | null>(null);

  // Onboarding and Agency state with persistence
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() =>
    getInitialState('onboarding_completed', true)
  );
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile>(() =>
    getInitialState('agency_profile', DEFAULT_AGENCY_PROFILE)
  );
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>(() =>
    getInitialState('onboarding_draft', DEFAULT_ONBOARDING_DRAFT)
  );
  const [dismissedHints, setDismissedHints] = useState<string[]>(() =>
    getInitialState('dismissed_hints', [])
  );
  const [interactiveDemoStage, setInteractiveDemoStage] = useState<InteractiveDemoStage>(null);

  // Contextual Help and Help Mode state
  const [isHelpModeActive, setIsHelpModeActive] = useState<boolean>(() =>
    getInitialState('help_mode_active', false)
  );
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState<boolean>(false);

  // Global Creation Modals State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [newClientModalState, setNewClientModalState] = useState<{
    prefill?: Partial<Client>;
    onSaveCallback?: (c: Client) => void;
  } | null>(null);

  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState<boolean>(false);
  const [newPropertyModalState, setNewPropertyModalState] = useState<{
    prefill?: Partial<Property>;
    onSaveCallback?: (p: Property) => void;
  } | null>(null);

  const openQuickAdd = useCallback(() => setIsQuickAddOpen(true), []);
  const closeQuickAdd = useCallback(() => setIsQuickAddOpen(false), []);

  const openNewClientModal = useCallback((prefill?: Partial<Client>, callback?: (c: Client) => void) => {
    setNewClientModalState({ prefill, onSaveCallback: callback });
    setIsNewClientModalOpen(true);
  }, []);

  const closeNewClientModal = useCallback(() => {
    setIsNewClientModalOpen(false);
    setNewClientModalState(null);
  }, []);

  const openNewPropertyModal = useCallback((prefill?: Partial<Property>, callback?: (p: Property) => void) => {
    setNewPropertyModalState({ prefill, onSaveCallback: callback });
    setIsNewPropertyModalOpen(true);
  }, []);

  const closeNewPropertyModal = useCallback(() => {
    setIsNewPropertyModalOpen(false);
    setNewPropertyModalState(null);
  }, []);

  // Entities with local persistence
  const [clients, setClients] = useState<Client[]>(() => getInitialState('clients', INITIAL_CLIENTS));
  const [properties, setProperties] = useState<Property[]>(() => getInitialState('properties', INITIAL_PROPERTIES));
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => getInitialState('opportunities', INITIAL_OPPORTUNITIES));
  const [practices, setPractices] = useState<Practice[]>(() => getInitialState('practices', INITIAL_PRACTICES));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => getInitialState('documents', INITIAL_DOCUMENTS));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('tasks', INITIAL_TASKS));
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => getInitialState('deadlines', INITIAL_DEADLINES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getInitialState('appointments', INITIAL_APPOINTMENTS));
  const [waitingItems, setWaitingItems] = useState<WaitingItem[]>(() => getInitialState('waiting_items', INITIAL_WAITING_ITEMS));
  const [mandates, setMandates] = useState<Mandate[]>(() => getInitialState('mandates', []));
  const [signingProcesses, setSigningProcesses] = useState<SigningProcess[]>(() => getInitialState('signing_processes', []));
  const [amlDossiers, setAmlDossiers] = useState<AmlDossier[]>(() => getInitialState('aml_dossiers', []));

  // Save to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}clients`, JSON.stringify(clients));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}properties`, JSON.stringify(properties));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}opportunities`, JSON.stringify(opportunities));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}practices`, JSON.stringify(practices));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}documents`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}deadlines`, JSON.stringify(deadlines));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}appointments`, JSON.stringify(appointments));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}waiting_items`, JSON.stringify(waitingItems));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}mandates`, JSON.stringify(mandates));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}signing_processes`, JSON.stringify(signingProcesses));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}aml_dossiers`, JSON.stringify(amlDossiers));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}agency_profile`, JSON.stringify(agencyProfile));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarding_completed`, JSON.stringify(onboardingCompleted));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarding_draft`, JSON.stringify(onboardingDraft));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}dismissed_hints`, JSON.stringify(dismissedHints));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}help_mode_active`, JSON.stringify(isHelpModeActive));
    } catch {
      // fallback
    }
  }, [
    clients,
    properties,
    opportunities,
    practices,
    documents,
    tasks,
    deadlines,
    appointments,
    waitingItems,
    agencyProfile,
    onboardingCompleted,
    onboardingDraft,
    dismissedHints,
    isHelpModeActive,
    mandates,
    signingProcesses,
    amlDossiers
  ]);

  // Agency & Onboarding handlers
  const updateAgencyProfile = useCallback((updates: Partial<AgencyProfile>) => {
    setAgencyProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}agency_profile`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const updateOnboardingDraft = useCallback((updates: Partial<OnboardingDraft>) => {
    setOnboardingDraft((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarding_draft`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const completeOnboarding = useCallback((finalChoice?: StartChoice) => {
    const choice = finalChoice || onboardingDraft.startChoice || 'explore_demo';
    
    // Save agency profile from draft if filled
    if (onboardingDraft.agencyName || onboardingDraft.agentName) {
      const updatedProfile: AgencyProfile = {
        agencyName: onboardingDraft.agencyName || DEFAULT_AGENCY_PROFILE.agencyName,
        agentName: onboardingDraft.agentName || DEFAULT_AGENCY_PROFILE.agentName,
        phone: onboardingDraft.phone || DEFAULT_AGENCY_PROFILE.phone,
        email: onboardingDraft.email || DEFAULT_AGENCY_PROFILE.email,
        city: onboardingDraft.city || DEFAULT_AGENCY_PROFILE.city,
        logoInitials: (onboardingDraft.agencyName || 'MR')
          .split(' ')
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        workPreferences: {
          enableAmlModule: onboardingDraft.enableAmlModule,
          practiceTypes: onboardingDraft.practiceTypes.length > 0 ? onboardingDraft.practiceTypes : DEFAULT_AGENCY_PROFILE.workPreferences.practiceTypes,
          defaultDocs: onboardingDraft.defaultDocs.length > 0 ? onboardingDraft.defaultDocs : DEFAULT_AGENCY_PROFILE.workPreferences.defaultDocs,
        },
      };
      setAgencyProfile(updatedProfile);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}agency_profile`, JSON.stringify(updatedProfile));
      } catch {}
    }

    setOnboardingCompleted(true);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarding_completed`, JSON.stringify(true));
    } catch {}

    // Direct routing based on choice
    if (choice === 'new_practice') {
      setWizardPreset(null);
      setActiveTab('nuova_pratica');
    } else if (choice === 'opportunity') {
      setSelectedOpportunityId('opp-1');
      setActiveTab('opportunita');
    } else {
      // explore_demo: load coherent demo dataset if empty
      if (practices.length === 0) {
        setClients(INITIAL_CLIENTS);
        setProperties(INITIAL_PROPERTIES);
        setOpportunities(INITIAL_OPPORTUNITIES);
        setPractices(INITIAL_PRACTICES);
        setDocuments(INITIAL_DOCUMENTS);
        setTasks(INITIAL_TASKS);
        setDeadlines(INITIAL_DEADLINES);
        setAppointments(INITIAL_APPOINTMENTS);
        setWaitingItems(INITIAL_WAITING_ITEMS);
      }
      setSelectedPracticeId('prat-1');
      setInteractiveDemoStage('oggi_task');
      setActiveTab('oggi');
    }
  }, [onboardingDraft, practices.length]);

  const resetOnboarding = useCallback(() => {
    setOnboardingCompleted(false);
    setOnboardingDraft(DEFAULT_ONBOARDING_DRAFT);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarding_completed`, JSON.stringify(false));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarding_draft`, JSON.stringify(DEFAULT_ONBOARDING_DRAFT));
    } catch {}
    setActiveTab('oggi');
  }, []);

  const dismissHint = useCallback((hintId: string) => {
    setDismissedHints((prev) => {
      if (prev.includes(hintId)) return prev;
      const next = [...prev, hintId];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}dismissed_hints`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const resetHints = useCallback(() => {
    setDismissedHints([]);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}dismissed_hints`, JSON.stringify([]));
    } catch {}
  }, []);

  const isHintDismissed = useCallback(
    (hintId: string) => dismissedHints.includes(hintId),
    [dismissedHints]
  );

  const toggleHelpMode = useCallback(() => {
    setIsHelpModeActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}help_mode_active`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleHelpPanel = useCallback(() => {
    setIsHelpPanelOpen((prev) => !prev);
  }, []);

  const contextualHelpPreference = agencyProfile.workPreferences?.contextualHelpPreference || 'all';

  const setContextualHelpPreference = useCallback(
    (pref: 'all' | 'reduced') => {
      updateAgencyProfile({
        workPreferences: {
          ...agencyProfile.workPreferences,
          contextualHelpPreference: pref,
        },
      });
    },
    [agencyProfile.workPreferences, updateAgencyProfile]
  );

  const seedCoherentDemoData = useCallback(() => {
    setClients(INITIAL_CLIENTS);
    setProperties(INITIAL_PROPERTIES);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setPractices(INITIAL_PRACTICES);
    setDocuments(INITIAL_DOCUMENTS);
    setTasks(INITIAL_TASKS);
    setDeadlines(INITIAL_DEADLINES);
    setAppointments(INITIAL_APPOINTMENTS);
    setWaitingItems(INITIAL_WAITING_ITEMS);
    setSelectedPracticeId('prat-1');
    setSelectedOpportunityId('opp-1');
    setActiveTab('oggi');
  }, []);

  // Helpers
  const getClientById = useCallback(
    (id?: string) => clients.find((c) => c.id === id),
    [clients]
  );
  const getPropertyById = useCallback(
    (id?: string) => properties.find((p) => p.id === id),
    [properties]
  );
  const getPracticeById = useCallback(
    (id?: string) => practices.find((p) => p.id === id),
    [practices]
  );
  const getOpportunityById = useCallback(
    (id?: string) => opportunities.find((o) => o.id === id),
    [opportunities]
  );
  const getDocumentsByPracticeId = useCallback(
    (practiceId: string) => documents.filter((d) => d.practiceId === practiceId),
    [documents]
  );
  const getTasksByPracticeId = useCallback(
    (practiceId: string) => tasks.filter((t) => t.practiceId === practiceId && t.status === 'pending'),
    [tasks]
  );
  const getMandateByPracticeId = useCallback(
    (practiceId: string) => mandates.find((m) => m.practiceId === practiceId),
    [mandates]
  );
  const getSigningProcessByPracticeId = useCallback(
    (practiceId: string) => signingProcesses.find((s) => s.practiceId === practiceId),
    [signingProcesses]
  );
  const getAmlDossierByPracticeId = useCallback(
    (practiceId: string) => amlDossiers.find((a) => a.practiceId === practiceId),
    [amlDossiers]
  );

  const updateMandate = useCallback((mandate: Partial<Mandate> & { practiceId: string }) => {
    setMandates((prev) => {
      const existing = prev.find((m) => m.practiceId === mandate.practiceId);
      if (existing) {
        return prev.map((m) => (m.practiceId === mandate.practiceId ? { ...m, ...mandate, updatedAt: new Date().toISOString() } : m));
      } else {
        const newMandate: Mandate = {
          clientIds: [],
          propertyId: '',
          mandateType: 'Vendita',
          exclusivity: 'In esclusiva',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          askingPrice: 0,
          commissionType: 'percentuale',
          commissionValue: '3',
          notes: '',
          customClauses: '',
          status: 'Bozza',
          templateId: 'tpl-demo-incarico-vendita',
          signatories: [],
          ...mandate,
          id: generateUniqueId('mand-'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          practiceId: mandate.practiceId,
        } as Mandate;
        return [...prev, newMandate];
      }
    });
  }, []);

  const updateSigningProcess = useCallback((process: Partial<SigningProcess> & { practiceId: string }) => {
    setSigningProcesses((prev) => {
      const existing = prev.find((p) => p.practiceId === process.practiceId && (p.documentId === process.documentId || !process.documentId));
      if (existing) {
        return prev.map((p) => (p.id === existing.id ? { ...p, ...process } : p));
      } else {
        const newProcess: SigningProcess = {
          documentId: '',
          mode: 'Contemporanea',
          status: 'Da inviare',
          signatories: [],
          ...process,
          id: generateUniqueId('sign-'),
          createdAt: new Date().toISOString(),
          practiceId: process.practiceId,
        } as SigningProcess;
        return [...prev, newProcess];
      }
    });
  }, []);

  const updateAmlDossier = useCallback((dossier: Partial<AmlDossier> & { practiceId: string }) => {
    setAmlDossiers((prev) => {
      const existing = prev.find((a) => a.practiceId === dossier.practiceId);
      if (existing) {
        return prev.map((a) => (a.practiceId === dossier.practiceId ? {
          ...a,
          ...dossier,
          sections: { ...a.sections, ...(dossier.sections || {}) },
          riskAssessment: { ...a.riskAssessment, ...(dossier.riskAssessment || {}) },
        } : a));
      } else {
        const newDossier: AmlDossier = {
          status: 'Da iniziare',
          sections: {
            soggetti: false,
            identificazione: false,
            relazioni: false,
            operazione: false,
            origineFondi: false,
            valutazione: false,
            ...(dossier.sections || {})
          },
          riskAssessment: {
            level: '',
            notes: '',
            date: '',
            ...(dossier.riskAssessment || {})
          },
          ...dossier,
          id: generateUniqueId('aml-'),
          practiceId: dossier.practiceId,
        } as AmlDossier;
        return [...prev, newDossier];
      }
    });
  }, []);

  // Open Practice with direct focus
  const openPracticeDetail = (
    practiceId: string,
    focusSection?: string,
    subTab?: 'dettagli' | 'documenti' | 'appuntamenti' | 'note' | 'aml'
  ) => {
    setSelectedPracticeId(practiceId);
    if (subTab) {
      setPracticeActiveSubTab(subTab);
    } else {
      setPracticeActiveSubTab('dettagli');
    }
    if (focusSection) {
      setFocusedPracticeSection(focusSection);
    } else {
      setFocusedPracticeSection(null);
    }
    setActiveTab('pratiche');
  };

  const openOpportunityDetail = (opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setActiveTab('opportunita');
  };

  const closePracticeDetail = () => {
    setSelectedPracticeId(null);
    setFocusedPracticeSection(null);
    setActiveTab('pratiche');
  };

  const closeOpportunityDetail = () => {
    setSelectedOpportunityId(null);
    setActiveTab('opportunita');
  };

  const openNewPracticeWizard = (presetMode?: 'opportunity' | 'existing_client' | 'new_client', sourceId?: string) => {
    setWizardPreset(presetMode ? { mode: presetMode, sourceId } : null);
    setActiveTab('nuova_pratica');
  };

  // Convert Opportunity to Practice (The Core Interaction!)
  const convertOpportunityToPractice = (opportunityId: string): string => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp) return '';

    const newPracticeId = generateUniqueId('prat');
    const nextSeq = practices.length + 90;
    const practiceCode = `PRT-2023-0${nextSeq}`;

    // Create Initial Documents based on Opportunity declared documents
    const createdDocs: DocumentItem[] = [
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'immobile',
        label: 'APE',
        subtitle: 'Attestato Prestazione Energetica',
        status: opp.declaredDocuments.find((d) => d.label.includes('APE'))?.declaredPresent
          ? 'Disponibile'
          : 'Da recuperare',
        isMissingRequired: true,
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'immobile',
        label: 'Planimetria',
        subtitle: 'Catastale aggiornata',
        status: opp.declaredDocuments.find((d) => d.label.includes('Planimetria'))?.declaredPresent
          ? 'Disponibile'
          : 'Da recuperare',
        isMissingRequired: true,
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'immobile',
        label: 'Atto di Provenienza',
        subtitle: 'Rogito precedente',
        status: opp.declaredDocuments.find((d) => d.label.includes('Atto'))?.declaredPresent
          ? 'Disponibile'
          : 'Da recuperare',
        isMissingRequired: true,
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'cliente',
        label: 'Carta d identità',
        subtitle: 'Documento proprietario',
        status: 'Disponibile',
        mockFileName: 'Documento_Identita_Venditore.pdf',
        updatedAt: 'Oggi',
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'cliente',
        label: 'Codice Fiscale',
        subtitle: 'Tessera sanitaria',
        status: 'Disponibile',
        mockFileName: 'Codice_Fiscale.pdf',
        updatedAt: 'Oggi',
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'incarico',
        label: 'Mandato di Vendita',
        subtitle: 'Bozza Mandato Ready',
        status: 'Da verificare',
        isMissingRequired: true,
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'antiriciclaggio',
        label: 'Modulo Adeguata Verifica',
        subtitle: 'In attesa di firma',
        status: 'In attesa',
        isMissingRequired: false,
      },
    ];

    const newPractice: Practice = {
      id: newPracticeId,
      code: practiceCode,
      clientId: opp.clientId,
      propertyId: opp.propertyId,
      sourceOpportunityId: opp.id,
      practiceType: 'Compravendita',
      status: 'In corso',
      mandateStatus: 'da_firmare',
      amlStatus: 'in_corso',
      documentStatus: 'in_corso',
      proposalStatus: 'nessuna',
      openedDate: 'Oggi',
      assignedAgent: {
        name: 'Anna Morante',
        initials: 'AM',
      },
      estimatedValue: opp.estimatedPrice || 390000,
      nextAction: {
        title: 'Firma Incarico di Vendita',
        description: 'Bozza pronta. Raccogliere firma digitale o autografa del proprietario per avviare la promozione.',
        ctaText: 'Prepara per la Firma',
        targetSection: 'incarico',
      },
      amlWorkflow: {
        clienteIdentificato: true,
        informazioniRaccolte: true,
        titolareEffettivoVerificato: false,
        fascicoloCompleto: false,
        notes: `Importato da Opportunità ${opp.id}. Briefing: ${opp.briefing}`,
      },
      notes: [
        {
          id: generateUniqueId('note'),
          date: 'Oggi',
          time: 'Adesso',
          author: 'Sistema Mandato Ready',
          text: `Pratica convertita dall'opportunità. Briefing importato: "${opp.briefing}"`,
        },
      ],
      timeline: [
        { id: generateUniqueId('t'), date: 'Oggi', title: 'Acquisizione da Opportunità', completed: true },
        { id: generateUniqueId('t'), date: 'Oggi', title: 'Valutazione e Dati Importati', completed: true },
        { id: generateUniqueId('t'), date: 'Oggi', title: 'Firma Incarico', completed: false, current: true },
        { id: generateUniqueId('t'), date: 'In attesa', title: 'Pubblicazione annuncio', completed: false },
      ],
    };

    // Create Initial Task for Oggi
    const client = clients.find((c) => c.id === opp.clientId);
    const prop = properties.find((p) => p.id === opp.propertyId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Cliente';
    const propLocation = prop ? `${prop.address} · ${prop.municipality}` : 'Immobile';

    const newTask: Task = {
      id: generateUniqueId('task'),
      practiceId: newPracticeId,
      clientId: opp.clientId,
      propertyId: opp.propertyId,
      title: `${clientName} | ${propLocation}`,
      subtitle: 'Incarico da completare e firmare',
      time: 'Entro 24 ore',
      urgency: 'Nuova Acquisizione',
      priority: 'high',
      status: 'pending',
      actionType: 'COMPLETA',
      targetSection: 'incarico',
    };

    // Update Opportunity Status to converted
    setOpportunities((prev) =>
      prev.map((o) => (o.id === opp.id ? { ...o, status: 'converted' } : o))
    );

    // Save practice, documents, tasks
    setPractices((prev) => [newPractice, ...prev]);
    setDocuments((prev) => [...createdDocs, ...prev]);
    setTasks((prev) => [newTask, ...prev]);

    // Add initial deadline
    const newDeadline: Deadline = {
      id: generateUniqueId('dead'),
      practiceId: newPracticeId,
      title: 'Firma Incarico di Mediazione',
      dueDate: 'Entro domani, ore 18:00',
      group: 'oggi',
      completed: false,
      priority: 'high',
    };
    setDeadlines((prev) => [newDeadline, ...prev]);

    // Select and return
    setSelectedPracticeId(newPracticeId);
    setPracticeActiveSubTab('dettagli');
    setActiveTab('pratiche');
    return newPracticeId;
  };

  // Create Practice from Wizard (Manual Flow)
  const createPracticeFromWizard = (data: {
    clientId: string;
    propertyId: string;
    practiceType: Practice['practiceType'];
    availableDocLabels?: string[];
  }): string => {
    const newPracticeId = generateUniqueId('prat');
    const nextSeq = practices.length + 95;
    const practiceCode = `PRT-2023-0${nextSeq}`;

    const client = clients.find((c) => c.id === data.clientId);
    const prop = properties.find((p) => p.id === data.propertyId);

    const available = data.availableDocLabels || [];

    const createdDocs: DocumentItem[] = [
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'immobile',
        label: 'Planimetria',
        subtitle: 'Catastale aggiornata',
        status: available.includes('Planimetria') ? 'Disponibile' : 'Da recuperare',
        isMissingRequired: !available.includes('Planimetria'),
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'immobile',
        label: 'APE',
        subtitle: 'Attestato Prestazione Energetica',
        status: available.includes('APE') ? 'Disponibile' : 'Da recuperare',
        isMissingRequired: true,
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'immobile',
        label: 'Atto di Provenienza',
        subtitle: 'Rogito precedente',
        status: available.includes('Atto') ? 'Disponibile' : 'Da recuperare',
        isMissingRequired: true,
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'cliente',
        label: 'Carta d identità',
        subtitle: 'Documento d identità in corso di validità',
        status: available.includes('Carta identità') ? 'Disponibile' : 'Disponibile',
        mockFileName: 'CI_Cliente.pdf',
      },
      {
        id: generateUniqueId('doc'),
        practiceId: newPracticeId,
        category: 'incarico',
        label: 'Mandato di Mediazione',
        subtitle: 'Incarico in esclusiva',
        status: 'Da verificare',
        isMissingRequired: true,
      },
    ];

    const newPractice: Practice = {
      id: newPracticeId,
      code: practiceCode,
      clientId: data.clientId,
      propertyId: data.propertyId,
      practiceType: data.practiceType,
      status: 'In corso',
      mandateStatus: 'da_preparare',
      amlStatus: 'non_avviato',
      documentStatus: 'in_corso',
      proposalStatus: 'nessuna',
      openedDate: 'Oggi',
      assignedAgent: {
        name: 'Anna Morante',
        initials: 'AM',
      },
      estimatedValue: prop?.estimatedValue || 250000,
      nextAction: {
        title: 'Verifica documenti caricati',
        description: 'Completa la raccolta dei documenti mancanti per sbloccare la firma dell incarico.',
        ctaText: 'Apri Documenti',
        targetSection: 'documenti',
      },
      amlWorkflow: {
        clienteIdentificato: true,
        informazioniRaccolte: false,
        titolareEffettivoVerificato: false,
        fascicoloCompleto: false,
      },
      notes: [
        {
          id: generateUniqueId('note'),
          date: 'Oggi',
          time: 'Adesso',
          author: 'Anna Morante',
          text: 'Nuova pratica creata da procedura guidata.',
        },
      ],
      timeline: [
        { id: generateUniqueId('t'), date: 'Oggi', title: 'Fascicolo Aperto', completed: true, current: true },
        { id: generateUniqueId('t'), date: 'In corso', title: 'Raccolta Documentale', completed: false },
      ],
    };

    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Cliente';
    const propLocation = prop ? `${prop.address} · ${prop.municipality}` : 'Immobile';

    const newTask: Task = {
      id: generateUniqueId('task'),
      practiceId: newPracticeId,
      clientId: data.clientId,
      propertyId: data.propertyId,
      title: `${clientName} | ${propLocation}`,
      subtitle: 'Completare raccolta documenti',
      time: 'Entro 48 ore',
      priority: 'medium',
      status: 'pending',
      actionType: 'COMPLETA',
      targetSection: 'documenti',
    };

    setPractices((prev) => [newPractice, ...prev]);
    setDocuments((prev) => [...createdDocs, ...prev]);
    setTasks((prev) => [newTask, ...prev]);

    setSelectedPracticeId(newPracticeId);
    setPracticeActiveSubTab('dettagli');
    setActiveTab('pratiche');
    return newPracticeId;
  };

  // Upload or Change Status of a Document
  const uploadOrMarkDocument = (documentId: string, status: DocumentStatus = 'Disponibile', fileName?: string) => {
    let affectedPracticeId = '';

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          affectedPracticeId = doc.practiceId;
          return {
            ...doc,
            status,
            mockFileName: fileName || doc.mockFileName || `${doc.label.replace(/\s+/g, '_')}_Caricato.pdf`,
            updatedAt: 'Oggi',
            isMissingRequired: status !== 'Disponibile',
          };
        }
        return doc;
      })
    );

    if (affectedPracticeId) {
      // Check if this was the document requested by nextAction or task
      setPractices((prev) =>
        prev.map((p) => {
          if (p.id === affectedPracticeId) {
            // Check remaining missing docs
            const currentPracticeDocs = documents.map((d) =>
              d.id === documentId ? { ...d, status, isMissingRequired: status !== 'Disponibile' } : d
            ).filter((d) => d.practiceId === affectedPracticeId);

            const missingRequired = currentPracticeDocs.filter((d) => d.isMissingRequired && d.status !== 'Disponibile');

            let updatedNextAction = p.nextAction;
            if (missingRequired.length === 0) {
              updatedNextAction = {
                title: 'Tutti i documenti base pronti',
                description: 'La documentazione essenziale è completa. Puoi procedere alla firma digitale dell incarico.',
                ctaText: 'Firma Incarico',
                targetSection: 'incarico',
              };
            }

            return {
              ...p,
              documentStatus: missingRequired.length === 0 ? 'pronto' : 'in_corso',
              nextAction: updatedNextAction,
            };
          }
          return p;
        })
      );

      // Add a note
      const doc = documents.find((d) => d.id === documentId);
      if (doc) {
        addPracticeNote(affectedPracticeId, `Documento aggiornato: "${doc.label}" contrassegnato come ${status}.`);
      }
    }
  };

  const addDocumentToPractice = (
    practiceId: string,
    category: DocumentItem['category'],
    label: string,
    subtitle: string,
    status: DocumentStatus
  ) => {
    const newDoc: DocumentItem = {
      id: generateUniqueId('doc'),
      practiceId,
      category,
      label,
      subtitle,
      status,
      mockFileName: status === 'Disponibile' ? `${label.replace(/\s+/g, '_')}.pdf` : undefined,
      updatedAt: status === 'Disponibile' ? 'Oggi' : undefined,
      isMissingRequired: status !== 'Disponibile',
    };
    setDocuments((prev) => [...prev, newDoc]);
    addPracticeNote(practiceId, `Aggiunto nuovo documento a fascicolo: "${label}".`);
  };

  const updatePractice = (practiceId: string, updates: Partial<Practice>) => {
    setPractices((prev) =>
      prev.map((p) => (p.id === practiceId ? { ...p, ...updates } : p))
    );
  };

  const addPracticeNote = (practiceId: string, text: string) => {
    const newNote: PracticeNote = {
      id: generateUniqueId('note'),
      date: 'Oggi',
      time: '12:00',
      author: 'Anna Morante',
      text,
    };
    setPractices((prev) =>
      prev.map((p) => (p.id === practiceId ? { ...p, notes: [newNote, ...p.notes] } : p))
    );
  };

  const updateAmlWorkflow = (practiceId: string, updates: Partial<Practice['amlWorkflow']>) => {
    setPractices((prev) =>
      prev.map((p) => {
        if (p.id === practiceId) {
          const newAml = { ...p.amlWorkflow, ...updates };
          const allDone =
            newAml.clienteIdentificato &&
            newAml.informazioniRaccolte &&
            newAml.titolareEffettivoVerificato &&
            newAml.fascicoloCompleto;
          return {
            ...p,
            amlWorkflow: newAml,
            amlStatus: allDone ? 'completato' : 'in_corso',
          };
        }
        return p;
      })
    );
  };

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
    );
  };

  const addDeadline = (
    practiceId: string,
    title: string,
    dueDate: string,
    group: Deadline['group'],
    priority: 'high' | 'normal' = 'normal'
  ) => {
    const newDead: Deadline = {
      id: generateUniqueId('dead'),
      practiceId,
      title,
      dueDate,
      group,
      completed: false,
      priority,
    };
    setDeadlines((prev) => [newDead, ...prev]);
  };

  const toggleDeadline = (deadlineId: string) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === deadlineId ? { ...d, completed: !d.completed } : d))
    );
  };

  const addNewClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: generateUniqueId('cli'),
      createdAt: 'Oggi',
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const addNewProperty = (propertyData: Omit<Property, 'id'>): Property => {
    const newProp: Property = {
      ...propertyData,
      id: generateUniqueId('prop'),
    };
    setProperties((prev) => [newProp, ...prev]);
    return newProp;
  };

  // Reset to initial demo seed
  const resetDemoData = () => {
    try {
      localStorage.clear();
    } catch {
      // fallback
    }
    setClients(INITIAL_CLIENTS);
    setProperties(INITIAL_PROPERTIES);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setPractices(INITIAL_PRACTICES);
    setDocuments(INITIAL_DOCUMENTS);
    setTasks(INITIAL_TASKS);
    setDeadlines(INITIAL_DEADLINES);
    setAppointments(INITIAL_APPOINTMENTS);
    setWaitingItems(INITIAL_WAITING_ITEMS);
    setSelectedPracticeId('prat-1');
    setSelectedOpportunityId('opp-1');
    setActiveTab('oggi');
  };

  const seedNewOpportunity = () => {
    const newClientId = generateUniqueId('cli');
    const newPropId = generateUniqueId('prop');
    const newOppId = generateUniqueId('opp');

    const newClient: Client = {
      id: newClientId,
      firstName: 'Matteo',
      lastName: 'Valenti',
      phone: '+39 349 7788990',
      email: 'm.valenti@architetti.it',
      type: 'seller',
      fiscalCode: 'VLNMTT84L15G273P',
      city: 'Cinisi',
      address: 'Corso Umberto I, 55',
      notes: 'Architetto, vende appartamento ristrutturato di recente.',
      createdAt: 'Oggi',
    };

    const newProp: Property = {
      id: newPropId,
      address: 'Corso Umberto I 55',
      civicNumber: '55',
      municipality: 'Cinisi',
      province: 'PA',
      area: 'Centro Storico',
      type: 'Appartamento',
      approximateSurface: 130,
      rooms: 4,
      bathrooms: 2,
      floor: '2° piano',
      estimatedValue: 240000,
      owners: [newClientId],
      energyClass: 'B',
      notes: 'Terrazzo panoramico a livello di 40 m².',
    };

    const newOpp: Opportunity = {
      id: newOppId,
      clientId: newClientId,
      propertyId: newPropId,
      sellerIntent: 'Alto',
      readiness: 78,
      priority: 'HOT',
      sellingTimeframe: 'Entro 2 mesi',
      motivation: 'Acquisto nuova prima casa a Palermo',
      briefing:
        'Proprietario qualificato. Ha già tutti i titoli edilizi in regola e le certificazioni impianti. Cerca agenzia per vendita rapida con acquirenti referenziati.',
      appointmentDate: 'Oggi, ore 18:30',
      declaredDocuments: [
        { id: generateUniqueId('dd'), label: 'Atto di provenienza', category: 'immobile', declaredPresent: true },
        { id: generateUniqueId('dd'), label: 'Planimetria Catastale', category: 'immobile', declaredPresent: true },
        { id: generateUniqueId('dd'), label: 'APE Classe B', category: 'immobile', declaredPresent: true },
      ],
      recommendedAction: 'Contattare oggi per conferma appuntamento',
      nextAction: 'Preparare proposta di mandato in esclusiva',
      status: 'active',
      estimatedPrice: 240000,
      preparationAdvice: {
        sintesi: 'Opportunità ad alto potenziale di chiusura rapida.',
        daApprofondire: ['Eventuale prelazione o servitù di passaggio su terrazzo'],
        domandeConsigliate: ['Ha già concordato la caparra per il nuovo acquisto a Palermo?'],
        prossimaAzione: 'Presentare piano di marketing e valorizzazione fotografica.',
      },
    };

    setClients((prev) => [newClient, ...prev]);
    setProperties((prev) => [newProp, ...prev]);
    setOpportunities((prev) => [newOpp, ...prev]);
    setSelectedOpportunityId(newOppId);
    setActiveTab('opportunita');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedPracticeId,
        setSelectedPracticeId,
        selectedOpportunityId,
        setSelectedOpportunityId,
        selectedClientId,
        setSelectedClientId,
        selectedPropertyId,
        setSelectedPropertyId,
        practiceActiveSubTab,
        setPracticeActiveSubTab,
        focusedPracticeSection,
        setFocusedPracticeSection,
        clients,
        properties,
        opportunities,
        practices,
        documents,
        tasks,
        deadlines,
        appointments,
        waitingItems,
        mandates,
        signingProcesses,
        amlDossiers,
        getClientById,
        getPropertyById,
        getPracticeById,
        getOpportunityById,
        getDocumentsByPracticeId,
        getTasksByPracticeId,
        getMandateByPracticeId,
        getSigningProcessByPracticeId,
        getAmlDossierByPracticeId,
        updateMandate,
        updateSigningProcess,
        updateAmlDossier,
        convertOpportunityToPractice,
        createPracticeFromWizard,
        uploadOrMarkDocument,
        addDocumentToPractice,
        updatePractice,
        addPracticeNote,
        updateAmlWorkflow,
        completeTask,
        addDeadline,
        toggleDeadline,
        addNewClient,
        addNewProperty,
        openPracticeDetail,
        closePracticeDetail,
        openOpportunityDetail,
        closeOpportunityDetail,
        openNewPracticeWizard,
        wizardPreset,
        setWizardPreset,
        agencyProfile,
        updateAgencyProfile,
        onboardingCompleted,
        setOnboardingCompleted,
        onboardingDraft,
        updateOnboardingDraft,
        completeOnboarding,
        resetOnboarding,
        interactiveDemoStage,
        setInteractiveDemoStage,
        dismissedHints,
        dismissHint,
        resetHints,
        isHintDismissed,
        seedCoherentDemoData,
        resetDemoData,
        seedNewOpportunity,
        isHelpModeActive,
        setIsHelpModeActive,
        toggleHelpMode,
        isHelpPanelOpen,
        setIsHelpPanelOpen,
        toggleHelpPanel,
        contextualHelpPreference,
        setContextualHelpPreference,
        isQuickAddOpen,
        openQuickAdd,
        closeQuickAdd,
        isNewClientModalOpen,
        newClientModalState,
        openNewClientModal,
        closeNewClientModal,
        isNewPropertyModalOpen,
        newPropertyModalState,
        openNewPropertyModal,
        closeNewPropertyModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
