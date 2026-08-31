import type { Client, DocumentItem, Practice, Property } from './types';

export interface PracticeCreationBundleInput {
  client: Client;
  property: Property;
  practiceType: Practice['practiceType'];
  checklistLabels: string[];
  availableDocLabels?: string[];
  assignedAgent: Practice['assignedAgent'];
  sequence: number;
  year: number;
  createId: (prefix: string) => string;
  sourceOpportunityId?: string;
  noteAuthor: string;
  noteText?: string;
  timelineOriginTitle?: string;
}

export interface PracticeCreationBundle {
  practice: Practice;
  documents: DocumentItem[];
}

export const inferDocumentCategory = (label: string): DocumentItem['category'] => {
  if (/identit|fiscale|cliente/i.test(label)) return 'cliente';
  if (/incarico|mandato/i.test(label)) return 'incarico';
  if (/antiricic|adeguata verifica/i.test(label)) return 'antiriciclaggio';
  return 'immobile';
};

export const isDocumentReady = (status: DocumentItem['status']): boolean =>
  status === 'Disponibile' || status === 'Firmato';

const labelMatches = (configuredLabel: string, declaredLabel: string) => {
  const configured = configuredLabel.trim().toLowerCase();
  const declared = declaredLabel.trim().toLowerCase();
  return configured.includes(declared) || declared.includes(configured);
};

export const createChecklistDocuments = (input: {
  practiceId: string;
  checklistLabels: string[];
  availableDocLabels?: string[];
  createId: (prefix: string) => string;
}): DocumentItem[] => {
  const availableDocLabels = input.availableDocLabels || [];
  return input.checklistLabels.map((label) => {
    const available = availableDocLabels.some((candidate) => labelMatches(label, candidate));
    return {
      id: input.createId('doc'),
      practiceId: input.practiceId,
      category: inferDocumentCategory(label),
      label,
      subtitle: 'Checklist configurata dall’agenzia',
      status: available ? 'Disponibile' : 'Da recuperare',
      isMissingRequired: !available,
    };
  });
};

export const createPracticeBundle = (input: PracticeCreationBundleInput): PracticeCreationBundle => {
  if (!input.client.id) throw new Error('Practice creation requires a shared Client entity.');
  if (!input.property.id) throw new Error('Practice creation requires a shared Property entity.');
  if (!input.practiceType) throw new Error('Practice creation requires a practice type.');

  const practiceId = input.createId('prat');
  const documents = createChecklistDocuments({
    practiceId,
    checklistLabels: input.checklistLabels,
    availableDocLabels: input.availableDocLabels,
    createId: input.createId,
  });
  const allRequiredDocumentsReady = documents.every((document) => !document.isMissingRequired);

  const practice: Practice = {
    id: practiceId,
    code: `PRT-${input.year}-${String(input.sequence).padStart(4, '0')}`,
    clientId: input.client.id,
    propertyId: input.property.id,
    sourceOpportunityId: input.sourceOpportunityId,
    practiceType: input.practiceType,
    status: 'In corso',
    mandateStatus: 'da_preparare',
    amlStatus: 'non_avviato',
    documentStatus: allRequiredDocumentsReady ? 'pronto' : 'in_corso',
    proposalStatus: 'nessuna',
    openedDate: 'Oggi',
    assignedAgent: input.assignedAgent,
    estimatedValue: 0,
    nextAction: {
      title: 'Compila incarico',
      description: 'Cliente e immobile condivisi sono collegati alla pratica.',
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
        id: input.createId('note'),
        date: 'Oggi',
        time: 'Adesso',
        author: input.noteAuthor,
        text: input.noteText || 'Nuova pratica creata da procedura guidata.',
      },
    ],
    timeline: [
      {
        id: input.createId('timeline'),
        date: 'Oggi',
        title: input.timelineOriginTitle || 'Fascicolo aperto',
        completed: true,
        current: true,
      },
      {
        id: input.createId('timeline'),
        date: 'In corso',
        title: 'Preparazione incarico',
        completed: false,
      },
    ],
  };

  return { practice, documents };
};

export const applyDocumentStatusToPractice = (input: {
  practice: Practice;
  documents: DocumentItem[];
  documentId: string;
  status: DocumentItem['status'];
}): { practice: Practice; documents: DocumentItem[] } => {
  const documents = input.documents.map((document) =>
    document.id === input.documentId
      ? {
          ...document,
          status: input.status,
          isMissingRequired: !isDocumentReady(input.status),
        }
      : document
  );
  const practiceDocuments = documents.filter((document) => document.practiceId === input.practice.id);
  const missingRequired = practiceDocuments.some(
    (document) => document.isMissingRequired && !isDocumentReady(document.status)
  );

  return {
    documents,
    practice: {
      ...input.practice,
      documentStatus: missingRequired ? 'in_corso' : 'pronto',
    },
  };
};
