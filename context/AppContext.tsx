'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  AgencyProfile,
  AmlDossier,
  Appointment,
  Client,
  Deadline,
  DocumentItem,
  DocumentStatus,
  InteractiveDemoStage,
  Mandate,
  OnboardingDraft,
  Opportunity,
  Practice,
  PracticeNote,
  Property,
  SigningProcess,
  StartChoice,
  Task,
  WaitingItem,
} from '@/lib/types';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_CLIENTS,
  INITIAL_DEADLINES,
  INITIAL_DOCUMENTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_PRACTICES,
  INITIAL_PROPERTIES,
  INITIAL_TASKS,
  INITIAL_WAITING_ITEMS,
} from '@/lib/sampleData';
import { prototypeStorage } from '@/lib/storage';

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

type PracticeSubTab = 'dettagli' | 'documenti' | 'appuntamenti' | 'note' | 'aml';
type WizardPreset = { mode?: 'opportunity' | 'existing_client' | 'new_client'; sourceId?: string } | null;
type ClientModalState = {
  prefill?: Partial<Client>;
  editClientId?: string;
  onSaveCallback?: (client: Client) => void;
} | null;
type PropertyModalState = {
  prefill?: Partial<Property>;
  editPropertyId?: string;
  onSaveCallback?: (property: Property) => void;
} | null;

interface AppContextType {
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
  practiceActiveSubTab: PracticeSubTab;
  setPracticeActiveSubTab: (tab: PracticeSubTab) => void;
  focusedPracticeSection: string | null;
  setFocusedPracticeSection: (section: string | null) => void;

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

  getClientById: (id?: string) => Client | undefined;
  getPropertyById: (id?: string) => Property | undefined;
  getPracticeById: (id?: string) => Practice | undefined;
  getOpportunityById: (id?: string) => Opportunity | undefined;
  getDocumentsByPracticeId: (practiceId: string) => DocumentItem[];
  getTasksByPracticeId: (practiceId: string) => Task[];
  getMandateByPracticeId: (practiceId: string) => Mandate | undefined;
  getSigningProcessByPracticeId: (practiceId: string) => SigningProcess | undefined;
  getAmlDossierByPracticeId: (practiceId: string) => AmlDossier | undefined;

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
  updateClient: (clientId: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => Client | undefined;
  addNewProperty: (propertyData: Omit<Property, 'id'>) => Property;
  updateProperty: (propertyId: string, updates: Partial<Omit<Property, 'id'>>) => Property | undefined;

  openPracticeDetail: (practiceId: string, focusSection?: string, subTab?: PracticeSubTab) => void;
  closePracticeDetail: () => void;
  openOpportunityDetail: (opportunityId: string) => void;
  closeOpportunityDetail: () => void;
  openNewPracticeWizard: (presetMode?: 'opportunity' | 'existing_client' | 'new_client', sourceId?: string) => void;

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

  wizardPreset: WizardPreset;
  setWizardPreset: (preset: WizardPreset) => void;
  resetDemoData: () => void;
  seedNewOpportunity: () => void;

  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;

  isNewClientModalOpen: boolean;
  newClientModalState: ClientModalState;
  openNewClientModal: (prefill?: Partial<Client>, callback?: (client: Client) => void) => void;
  openEditClientModal: (clientId: string) => void;
  closeNewClientModal: () => void;

  isNewPropertyModalOpen: boolean;
  newPropertyModalState: PropertyModalState;
  openNewPropertyModal: (prefill?: Partial<Property>, callback?: (property: Property) => void) => void;
  openEditPropertyModal: (propertyId: string) => void;
  closeNewPropertyModal: () => void;

  isHelpModeActive: boolean;
  setIsHelpModeActive: (value: boolean) => void;
  toggleHelpMode: () => void;
  isHelpPanelOpen: boolean;
  setIsHelpPanelOpen: (value: boolean) => void;
  toggleHelpPanel: () => void;
  contextualHelpPreference: 'all' | 'reduced';
  setContextualHelpPreference: (value: 'all' | 'reduced') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
      "Documento d'identità e Codice Fiscale",
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
  defaultDocs: [...DEFAULT_AGENCY_PROFILE.workPreferences.defaultDocs],
};

let idCounter = 1000;
const generateUniqueId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
};

const getInitialState = <T,>(key: string, fallback: T): T => prototypeStorage.read(key, fallback);
const isDocumentReady = (status: DocumentStatus) => status === 'Disponibile' || status === 'Firmato';
const getAgentInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'MR';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('oggi');
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>('prat-1');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>('opp-1');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [practiceActiveSubTab, setPracticeActiveSubTab] = useState<PracticeSubTab>('dettagli');
  const [focusedPracticeSection, setFocusedPracticeSection] = useState<string | null>(null);
  const [wizardPreset, setWizardPreset] = useState<WizardPreset>(null);

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() =>
    getInitialState('onboarding_completed', true)
  );
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile>(() =>
    getInitialState('agency_profile', DEFAULT_AGENCY_PROFILE)
  );
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>(() =>
    getInitialState('onboarding_draft', DEFAULT_ONBOARDING_DRAFT)
  );
  const [dismissedHints, setDismissedHints] = useState<string[]>(() => getInitialState('dismissed_hints', []));
  const [interactiveDemoStage, setInteractiveDemoStage] = useState<InteractiveDemoStage>(null);
  const [isHelpModeActive, setIsHelpModeActive] = useState<boolean>(() => getInitialState('help_mode_active', false));
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientModalState, setNewClientModalState] = useState<ClientModalState>(null);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [newPropertyModalState, setNewPropertyModalState] = useState<PropertyModalState>(null);

  const [clients, setClients] = useState<Client[]>(() => getInitialState('clients', INITIAL_CLIENTS));
  const [properties, setProperties] = useState<Property[]>(() => getInitialState('properties', INITIAL_PROPERTIES));
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() =>
    getInitialState('opportunities', INITIAL_OPPORTUNITIES)
  );
  const [practices, setPractices] = useState<Practice[]>(() => getInitialState('practices', INITIAL_PRACTICES));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => getInitialState('documents', INITIAL_DOCUMENTS));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('tasks', INITIAL_TASKS));
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => getInitialState('deadlines', INITIAL_DEADLINES));
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    getInitialState('appointments', INITIAL_APPOINTMENTS)
  );
  const [waitingItems, setWaitingItems] = useState<WaitingItem[]>(() =>
    getInitialState('waiting_items', INITIAL_WAITING_ITEMS)
  );
  const [mandates, setMandates] = useState<Mandate[]>(() => getInitialState('mandates', []));
  const [signingProcesses, setSigningProcesses] = useState<SigningProcess[]>(() =>
    getInitialState('signing_processes', [])
  );
  const [amlDossiers, setAmlDossiers] = useState<AmlDossier[]>(() => getInitialState('aml_dossiers', []));

  useEffect(() => {
    prototypeStorage.write('clients', clients);
    prototypeStorage.write('properties', properties);
    prototypeStorage.write('opportunities', opportunities);
    prototypeStorage.write('practices', practices);
    prototypeStorage.write('documents', documents);
    prototypeStorage.write('tasks', tasks);
    prototypeStorage.write('deadlines', deadlines);
    prototypeStorage.write('appointments', appointments);
    prototypeStorage.write('waiting_items', waitingItems);
    prototypeStorage.write('mandates', mandates);
    prototypeStorage.write('signing_processes', signingProcesses);
    prototypeStorage.write('aml_dossiers', amlDossiers);
    prototypeStorage.write('agency_profile', agencyProfile);
    prototypeStorage.write('onboarding_completed', onboardingCompleted);
    prototypeStorage.write('onboarding_draft', onboardingDraft);
    prototypeStorage.write('dismissed_hints', dismissedHints);
    prototypeStorage.write('help_mode_active', isHelpModeActive);
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
    mandates,
    signingProcesses,
    amlDossiers,
    agencyProfile,
    onboardingCompleted,
    onboardingDraft,
    dismissedHints,
    isHelpModeActive,
  ]);

  const openQuickAdd = useCallback(() => setIsQuickAddOpen(true), []);
  const closeQuickAdd = useCallback(() => setIsQuickAddOpen(false), []);

  const openNewClientModal = useCallback((prefill?: Partial<Client>, callback?: (client: Client) => void) => {
    setNewClientModalState({ prefill, onSaveCallback: callback });
    setIsNewClientModalOpen(true);
  }, []);

  const openEditClientModal = useCallback(
    (clientId: string) => {
      const client = clients.find((item) => item.id === clientId);
      if (!client) return;
      setNewClientModalState({ prefill: client, editClientId: client.id });
      setIsNewClientModalOpen(true);
    },
    [clients]
  );

  const closeNewClientModal = useCallback(() => {
    setIsNewClientModalOpen(false);
    setNewClientModalState(null);
  }, []);

  const openNewPropertyModal = useCallback((prefill?: Partial<Property>, callback?: (property: Property) => void) => {
    setNewPropertyModalState({ prefill, onSaveCallback: callback });
    setIsNewPropertyModalOpen(true);
  }, []);

  const openEditPropertyModal = useCallback(
    (propertyId: string) => {
      const property = properties.find((item) => item.id === propertyId);
      if (!property) return;
      setNewPropertyModalState({ prefill: property, editPropertyId: property.id });
      setIsNewPropertyModalOpen(true);
    },
    [properties]
  );

  const closeNewPropertyModal = useCallback(() => {
    setIsNewPropertyModalOpen(false);
    setNewPropertyModalState(null);
  }, []);

  const updateAgencyProfile = useCallback((updates: Partial<AgencyProfile>) => {
    setAgencyProfile((previous) => ({ ...previous, ...updates }));
  }, []);

  const updateOnboardingDraft = useCallback((updates: Partial<OnboardingDraft>) => {
    setOnboardingDraft((previous) => ({ ...previous, ...updates }));
  }, []);

  const completeOnboarding = useCallback(
    (finalChoice?: StartChoice) => {
      const choice = finalChoice || onboardingDraft.startChoice || 'explore_demo';

      if (onboardingDraft.agencyName || onboardingDraft.agentName) {
        const agencyName = onboardingDraft.agencyName || DEFAULT_AGENCY_PROFILE.agencyName;
        const agentName = onboardingDraft.agentName || DEFAULT_AGENCY_PROFILE.agentName;
        setAgencyProfile({
          agencyName,
          agentName,
          phone: onboardingDraft.phone || DEFAULT_AGENCY_PROFILE.phone,
          email: onboardingDraft.email || DEFAULT_AGENCY_PROFILE.email,
          city: onboardingDraft.city || DEFAULT_AGENCY_PROFILE.city,
          logoInitials: getAgentInitials(agencyName),
          workPreferences: {
            enableAmlModule: onboardingDraft.enableAmlModule,
            practiceTypes:
              onboardingDraft.practiceTypes.length > 0
                ? onboardingDraft.practiceTypes
                : DEFAULT_AGENCY_PROFILE.workPreferences.practiceTypes,
            defaultDocs:
              onboardingDraft.defaultDocs.length > 0
                ? onboardingDraft.defaultDocs
                : DEFAULT_AGENCY_PROFILE.workPreferences.defaultDocs,
          },
        });
      }

      setOnboardingCompleted(true);

      if (choice === 'new_practice') {
        setWizardPreset(null);
        setActiveTab('nuova_pratica');
      } else if (choice === 'opportunity') {
        setSelectedOpportunityId('opp-1');
        setActiveTab('opportunita');
      } else {
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
    },
    [onboardingDraft, practices.length]
  );

  const resetOnboarding = useCallback(() => {
    setOnboardingCompleted(false);
    setOnboardingDraft(DEFAULT_ONBOARDING_DRAFT);
    setActiveTab('oggi');
  }, []);

  const dismissHint = useCallback((hintId: string) => {
    setDismissedHints((previous) => (previous.includes(hintId) ? previous : [...previous, hintId]));
  }, []);

  const resetHints = useCallback(() => setDismissedHints([]), []);
  const isHintDismissed = useCallback((hintId: string) => dismissedHints.includes(hintId), [dismissedHints]);
  const toggleHelpMode = useCallback(() => setIsHelpModeActive((previous) => !previous), []);
  const toggleHelpPanel = useCallback(() => setIsHelpPanelOpen((previous) => !previous), []);
  const contextualHelpPreference = agencyProfile.workPreferences?.contextualHelpPreference || 'all';
  const setContextualHelpPreference = useCallback(
    (preference: 'all' | 'reduced') => {
      updateAgencyProfile({
        workPreferences: { ...agencyProfile.workPreferences, contextualHelpPreference: preference },
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

  const getClientById = useCallback((id?: string) => clients.find((client) => client.id === id), [clients]);
  const getPropertyById = useCallback(
    (id?: string) => properties.find((property) => property.id === id),
    [properties]
  );
  const getPracticeById = useCallback(
    (id?: string) => practices.find((practice) => practice.id === id),
    [practices]
  );
  const getOpportunityById = useCallback(
    (id?: string) => opportunities.find((opportunity) => opportunity.id === id),
    [opportunities]
  );
  const getDocumentsByPracticeId = useCallback(
    (practiceId: string) => documents.filter((document) => document.practiceId === practiceId),
    [documents]
  );
  const getTasksByPracticeId = useCallback(
    (practiceId: string) => tasks.filter((task) => task.practiceId === practiceId && task.status === 'pending'),
    [tasks]
  );
  const getMandateByPracticeId = useCallback(
    (practiceId: string) => mandates.find((mandate) => mandate.practiceId === practiceId),
    [mandates]
  );
  const getSigningProcessByPracticeId = useCallback(
    (practiceId: string) => signingProcesses.find((process) => process.practiceId === practiceId),
    [signingProcesses]
  );
  const getAmlDossierByPracticeId = useCallback(
    (practiceId: string) => amlDossiers.find((dossier) => dossier.practiceId === practiceId),
    [amlDossiers]
  );

  const updateMandate = useCallback((mandate: Partial<Mandate> & { practiceId: string }) => {
    setMandates((previous) => {
      const existing = previous.find((item) => item.practiceId === mandate.practiceId);
      if (existing) {
        return previous.map((item) =>
          item.practiceId === mandate.practiceId
            ? { ...item, ...mandate, updatedAt: new Date().toISOString() }
            : item
        );
      }

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
        id: generateUniqueId('mand'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        practiceId: mandate.practiceId,
      } as Mandate;
      return [...previous, newMandate];
    });
  }, []);

  const updateSigningProcess = useCallback((process: Partial<SigningProcess> & { practiceId: string }) => {
    setSigningProcesses((previous) => {
      const existing = previous.find(
        (item) => item.practiceId === process.practiceId && (item.documentId === process.documentId || !process.documentId)
      );
      if (existing) {
        return previous.map((item) => (item.id === existing.id ? { ...item, ...process } : item));
      }
      const newProcess: SigningProcess = {
        documentId: '',
        mode: 'Contemporanea',
        status: 'Da inviare',
        signatories: [],
        provider: 'mock',
        ...process,
        id: generateUniqueId('sign'),
        createdAt: new Date().toISOString(),
        practiceId: process.practiceId,
      } as SigningProcess;
      return [...previous, newProcess];
    });
  }, []);

  const updateAmlDossier = useCallback((dossier: Partial<AmlDossier> & { practiceId: string }) => {
    setAmlDossiers((previous) => {
      const existing = previous.find((item) => item.practiceId === dossier.practiceId);
      if (existing) {
        return previous.map((item) =>
          item.practiceId === dossier.practiceId
            ? {
                ...item,
                ...dossier,
                sections: { ...item.sections, ...(dossier.sections || {}) },
                riskAssessment: { ...item.riskAssessment, ...(dossier.riskAssessment || {}) },
              }
            : item
        );
      }
      const newDossier: AmlDossier = {
        status: 'Da iniziare',
        sections: {
          soggetti: false,
          identificazione: false,
          relazioni: false,
          operazione: false,
          origineFondi: false,
          valutazione: false,
          ...(dossier.sections || {}),
        },
        riskAssessment: {
          level: '',
          notes: '',
          date: '',
          ...(dossier.riskAssessment || {}),
        },
        ...dossier,
        id: generateUniqueId('aml'),
        practiceId: dossier.practiceId,
      } as AmlDossier;
      return [...previous, newDossier];
    });
  }, []);

  const openPracticeDetail = (practiceId: string, focusSection?: string, subTab?: PracticeSubTab) => {
    setSelectedPracticeId(practiceId);
    setPracticeActiveSubTab(subTab || 'dettagli');
    setFocusedPracticeSection(focusSection || null);
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
  const openNewPracticeWizard = (
    presetMode?: 'opportunity' | 'existing_client' | 'new_client',
    sourceId?: string
  ) => {
    setWizardPreset(presetMode ? { mode: presetMode, sourceId } : null);
    setActiveTab('nuova_pratica');
  };

  const inferDocumentCategory = (label: string): DocumentItem['category'] => {
    if (/identit|fiscale|cliente/i.test(label)) return 'cliente';
    if (/incarico|mandato/i.test(label)) return 'incarico';
    if (/antiricic|adeguata verifica/i.test(label)) return 'antiriciclaggio';
    return 'immobile';
  };

  const configuredChecklistDocuments = (practiceId: string, availableDocLabels: string[] = []): DocumentItem[] => {
    const labels = agencyProfile.workPreferences.defaultDocs.length
      ? agencyProfile.workPreferences.defaultDocs
      : DEFAULT_AGENCY_PROFILE.workPreferences.defaultDocs;
    return labels.map((label) => {
      const available = availableDocLabels.some(
        (candidate) => label.toLowerCase().includes(candidate.toLowerCase()) || candidate.toLowerCase().includes(label.toLowerCase())
      );
      return {
        id: generateUniqueId('doc'),
        practiceId,
        category: inferDocumentCategory(label),
        label,
        subtitle: 'Checklist configurata dall’agenzia',
        status: available ? 'Disponibile' : 'Da recuperare',
        isMissingRequired: !available,
      };
    });
  };

  const convertOpportunityToPractice = (opportunityId: string): string => {
    const opportunity = opportunities.find((item) => item.id === opportunityId);
    if (!opportunity) return '';

    const alreadyConverted = practices.find((practice) => practice.sourceOpportunityId === opportunity.id);
    if (alreadyConverted) {
      openPracticeDetail(alreadyConverted.id);
      return alreadyConverted.id;
    }

    const newPracticeId = generateUniqueId('prat');
    const year = new Date().getFullYear();
    const practiceCode = `PRT-${year}-${String(practices.length + 1).padStart(4, '0')}`;
    const availableLabels = opportunity.declaredDocuments
      .filter((document) => document.declaredPresent)
      .map((document) => document.label);
    const createdDocs = configuredChecklistDocuments(newPracticeId, availableLabels);

    const newPractice: Practice = {
      id: newPracticeId,
      code: practiceCode,
      clientId: opportunity.clientId,
      propertyId: opportunity.propertyId,
      sourceOpportunityId: opportunity.id,
      practiceType: 'Compravendita',
      status: 'In corso',
      mandateStatus: 'da_preparare',
      amlStatus: 'non_avviato',
      documentStatus: createdDocs.every((document) => !document.isMissingRequired) ? 'pronto' : 'in_corso',
      proposalStatus: 'nessuna',
      openedDate: 'Oggi',
      assignedAgent: {
        name: agencyProfile.agentName,
        initials: getAgentInitials(agencyProfile.agentName),
      },
      estimatedValue: 0,
      nextAction: {
        title: 'Compila incarico',
        description: 'Cliente e immobile sono stati trasferiti senza duplicazioni.',
        ctaText: 'Compila incarico',
        targetSection: 'incarico',
      },
      amlWorkflow: {
        clienteIdentificato: false,
        informazioniRaccolte: false,
        titolareEffettivoVerificato: false,
        fascicoloCompleto: false,
        notes: `Importato da Opportunità ${opportunity.id}. Briefing: ${opportunity.briefing}`,
      },
      notes: [
        {
          id: generateUniqueId('note'),
          date: 'Oggi',
          time: 'Adesso',
          author: 'Sistema Mandato Ready',
          text: `Pratica convertita dall'opportunità. Briefing importato: “${opportunity.briefing}”`,
        },
      ],
      timeline: [
        { id: generateUniqueId('timeline'), date: 'Oggi', title: 'Acquisizione da Opportunità', completed: true },
        { id: generateUniqueId('timeline'), date: 'Oggi', title: 'Preparazione incarico', completed: false, current: true },
      ],
    };

    setOpportunities((previous) =>
      previous.map((item) => (item.id === opportunity.id ? { ...item, status: 'converted' } : item))
    );
    setPractices((previous) => [newPractice, ...previous]);
    setDocuments((previous) => [...createdDocs, ...previous]);
    setDeadlines((previous) => [
      {
        id: generateUniqueId('deadline'),
        practiceId: newPracticeId,
        title: 'Preparare incarico di mediazione',
        dueDate: 'Entro domani, ore 18:00',
        group: 'oggi',
        completed: false,
        priority: 'high',
      },
      ...previous,
    ]);
    openPracticeDetail(newPracticeId);
    return newPracticeId;
  };

  const createPracticeFromWizard = (data: {
    clientId: string;
    propertyId: string;
    practiceType: Practice['practiceType'];
    availableDocLabels?: string[];
  }): string => {
    const newPracticeId = generateUniqueId('prat');
    const year = new Date().getFullYear();
    const practiceCode = `PRT-${year}-${String(practices.length + 1).padStart(4, '0')}`;
    const createdDocs = configuredChecklistDocuments(newPracticeId, data.availableDocLabels || []);

    const newPractice: Practice = {
      id: newPracticeId,
      code: practiceCode,
      clientId: data.clientId,
      propertyId: data.propertyId,
      practiceType: data.practiceType,
      status: 'In corso',
      mandateStatus: 'da_preparare',
      amlStatus: 'non_avviato',
      documentStatus: createdDocs.every((document) => !document.isMissingRequired) ? 'pronto' : 'in_corso',
      proposalStatus: 'nessuna',
      openedDate: 'Oggi',
      assignedAgent: {
        name: agencyProfile.agentName,
        initials: getAgentInitials(agencyProfile.agentName),
      },
      estimatedValue: 0,
      nextAction: {
        title: 'Compila incarico',
        description: 'Cliente e immobile sono collegati. Completa ora l’incarico.',
        ctaText: 'Compila incarico',
        targetSection: 'incarico',
      },
      amlWorkflow: {
        clienteIdentificato: false,
        informazioniRaccolte: false,
        titolareEffettivoVerificato: false,
        fascicoloCompleto: false,
      },
      notes: [
        {
          id: generateUniqueId('note'),
          date: 'Oggi',
          time: 'Adesso',
          author: agencyProfile.agentName,
          text: 'Nuova pratica creata da procedura guidata.',
        },
      ],
      timeline: [
        { id: generateUniqueId('timeline'), date: 'Oggi', title: 'Fascicolo aperto', completed: true, current: true },
        { id: generateUniqueId('timeline'), date: 'In corso', title: 'Preparazione incarico', completed: false },
      ],
    };

    setPractices((previous) => [newPractice, ...previous]);
    setDocuments((previous) => [...createdDocs, ...previous]);
    openPracticeDetail(newPracticeId);
    return newPracticeId;
  };

  const uploadOrMarkDocument = (
    documentId: string,
    status: DocumentStatus = 'Disponibile',
    fileName?: string
  ) => {
    const existingDocument = documents.find((document) => document.id === documentId);
    if (!existingDocument) return;
    const affectedPracticeId = existingDocument.practiceId;
    const ready = isDocumentReady(status);

    setDocuments((previous) =>
      previous.map((document) =>
        document.id === documentId
          ? {
              ...document,
              status,
              mockFileName:
                fileName || document.mockFileName || `${document.label.replace(/\s+/g, '_')}_Caricato.pdf`,
              updatedAt: 'Oggi',
              isMissingRequired: !ready,
            }
          : document
      )
    );

    const currentPracticeDocs = documents
      .map((document) =>
        document.id === documentId ? { ...document, status, isMissingRequired: !ready } : document
      )
      .filter((document) => document.practiceId === affectedPracticeId);
    const missingRequired = currentPracticeDocs.some(
      (document) => document.isMissingRequired && !isDocumentReady(document.status)
    );
    setPractices((previous) =>
      previous.map((practice) =>
        practice.id === affectedPracticeId
          ? { ...practice, documentStatus: missingRequired ? 'in_corso' : 'pronto' }
          : practice
      )
    );
    addPracticeNote(affectedPracticeId, `Documento aggiornato: “${existingDocument.label}” → ${status}.`);
  };

  const addDocumentToPractice = (
    practiceId: string,
    category: DocumentItem['category'],
    label: string,
    subtitle: string,
    status: DocumentStatus
  ) => {
    const ready = isDocumentReady(status);
    const newDocument: DocumentItem = {
      id: generateUniqueId('doc'),
      practiceId,
      category,
      label,
      subtitle,
      status,
      mockFileName: ready ? `${label.replace(/\s+/g, '_')}.pdf` : undefined,
      updatedAt: ready ? 'Oggi' : undefined,
      isMissingRequired: !ready,
    };
    setDocuments((previous) => [...previous, newDocument]);
    addPracticeNote(practiceId, `Aggiunto nuovo documento al fascicolo: “${label}”.`);
  };

  const updatePractice = (practiceId: string, updates: Partial<Practice>) => {
    setPractices((previous) =>
      previous.map((practice) => (practice.id === practiceId ? { ...practice, ...updates } : practice))
    );
  };

  const addPracticeNote = (practiceId: string, text: string) => {
    const newNote: PracticeNote = {
      id: generateUniqueId('note'),
      date: 'Oggi',
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      author: agencyProfile.agentName,
      text,
    };
    setPractices((previous) =>
      previous.map((practice) =>
        practice.id === practiceId ? { ...practice, notes: [newNote, ...practice.notes] } : practice
      )
    );
  };

  const updateAmlWorkflow = (practiceId: string, updates: Partial<Practice['amlWorkflow']>) => {
    setPractices((previous) =>
      previous.map((practice) => {
        if (practice.id !== practiceId) return practice;
        const amlWorkflow = { ...practice.amlWorkflow, ...updates };
        const allDone =
          amlWorkflow.clienteIdentificato &&
          amlWorkflow.informazioniRaccolte &&
          amlWorkflow.titolareEffettivoVerificato &&
          amlWorkflow.fascicoloCompleto;
        return { ...practice, amlWorkflow, amlStatus: allDone ? 'completato' : 'in_corso' };
      })
    );
  };

  const completeTask = (taskId: string) => {
    setTasks((previous) =>
      previous.map((task) => (task.id === taskId ? { ...task, status: 'completed' } : task))
    );
  };

  const addDeadline = (
    practiceId: string,
    title: string,
    dueDate: string,
    group: Deadline['group'],
    priority: 'high' | 'normal' = 'normal'
  ) => {
    setDeadlines((previous) => [
      {
        id: generateUniqueId('deadline'),
        practiceId,
        title,
        dueDate,
        group,
        completed: false,
        priority,
      },
      ...previous,
    ]);
  };

  const toggleDeadline = (deadlineId: string) => {
    setDeadlines((previous) =>
      previous.map((deadline) =>
        deadline.id === deadlineId ? { ...deadline, completed: !deadline.completed } : deadline
      )
    );
  };

  const addNewClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = { ...clientData, id: generateUniqueId('cli'), createdAt: 'Oggi' };
    setClients((previous) => [newClient, ...previous]);
    return newClient;
  };

  const updateClient = (
    clientId: string,
    updates: Partial<Omit<Client, 'id' | 'createdAt'>>
  ): Client | undefined => {
    const existing = clients.find((client) => client.id === clientId);
    if (!existing) return undefined;
    const updated: Client = { ...existing, ...updates };
    setClients((previous) => previous.map((client) => (client.id === clientId ? updated : client)));
    return updated;
  };

  const addNewProperty = (propertyData: Omit<Property, 'id'>): Property => {
    const newProperty: Property = { ...propertyData, id: generateUniqueId('prop') };
    setProperties((previous) => [newProperty, ...previous]);
    return newProperty;
  };

  const updateProperty = (
    propertyId: string,
    updates: Partial<Omit<Property, 'id'>>
  ): Property | undefined => {
    const existing = properties.find((property) => property.id === propertyId);
    if (!existing) return undefined;
    const updated: Property = { ...existing, ...updates };
    setProperties((previous) => previous.map((property) => (property.id === propertyId ? updated : property)));
    return updated;
  };

  const resetDemoData = () => {
    prototypeStorage.clearNamespace();
    setClients(INITIAL_CLIENTS);
    setProperties(INITIAL_PROPERTIES);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setPractices(INITIAL_PRACTICES);
    setDocuments(INITIAL_DOCUMENTS);
    setTasks(INITIAL_TASKS);
    setDeadlines(INITIAL_DEADLINES);
    setAppointments(INITIAL_APPOINTMENTS);
    setWaitingItems(INITIAL_WAITING_ITEMS);
    setMandates([]);
    setSigningProcesses([]);
    setAmlDossiers([]);
    setSelectedPracticeId('prat-1');
    setSelectedOpportunityId('opp-1');
    setActiveTab('oggi');
  };

  const seedNewOpportunity = () => {
    const newClientId = generateUniqueId('cli');
    const newPropertyId = generateUniqueId('prop');
    const newOpportunityId = generateUniqueId('opp');
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
    const newProperty: Property = {
      id: newPropertyId,
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
      askingPrice: 240000,
      owners: [newClientId],
      energyClass: 'B',
      notes: 'Terrazzo panoramico a livello di 40 m².',
    };
    const newOpportunity: Opportunity = {
      id: newOpportunityId,
      clientId: newClientId,
      propertyId: newPropertyId,
      sellerIntent: 'Alto',
      readiness: 78,
      priority: 'HOT',
      sellingTimeframe: 'Entro 2 mesi',
      motivation: 'Acquisto nuova prima casa a Palermo',
      briefing:
        'Proprietario qualificato. Ha già titoli edilizi e certificazioni impianti dichiarati disponibili.',
      appointmentDate: 'Oggi, ore 18:30',
      declaredDocuments: [
        { id: generateUniqueId('declared'), label: 'Atto di provenienza', category: 'immobile', declaredPresent: true },
        { id: generateUniqueId('declared'), label: 'Planimetria Catastale', category: 'immobile', declaredPresent: true },
        { id: generateUniqueId('declared'), label: 'APE Classe B', category: 'immobile', declaredPresent: true },
      ],
      recommendedAction: 'Contattare oggi per conferma appuntamento',
      nextAction: 'Preparare proposta di mandato in esclusiva',
      status: 'active',
      estimatedPrice: 240000,
      preparationAdvice: {
        sintesi: 'Opportunità ad alto potenziale di conversione.',
        daApprofondire: ['Eventuale prelazione o servitù di passaggio su terrazzo'],
        domandeConsigliate: ['Ha già concordato la caparra per il nuovo acquisto a Palermo?'],
        prossimaAzione: 'Presentare piano di marketing e valorizzazione fotografica.',
      },
    };
    setClients((previous) => [newClient, ...previous]);
    setProperties((previous) => [newProperty, ...previous]);
    setOpportunities((previous) => [newOpportunity, ...previous]);
    setSelectedOpportunityId(newOpportunityId);
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
        updateClient,
        addNewProperty,
        updateProperty,
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
        openEditClientModal,
        closeNewClientModal,
        isNewPropertyModalOpen,
        newPropertyModalState,
        openNewPropertyModal,
        openEditPropertyModal,
        closeNewPropertyModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
