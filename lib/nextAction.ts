import type {
  AmlDossier,
  Client,
  DocumentItem,
  Mandate,
  NextAction,
  Practice,
  Property,
  SigningProcess,
} from './types';

export interface PracticeStateSnapshot {
  practice: Practice;
  client?: Client;
  property?: Property;
  documents: DocumentItem[];
  mandate?: Mandate;
  signingProcess?: SigningProcess;
  amlDossier?: AmlDossier;
  amlEnabled?: boolean;
}

const availableDocumentStatuses = new Set<DocumentItem['status']>(['Disponibile', 'Firmato']);

export const isClientQuickProfileComplete = (client?: Client): boolean => {
  if (!client) return false;

  if (client.entityType === 'azienda') {
    return Boolean(client.companyName?.trim() && client.contactPerson?.trim() && client.phone.trim() && client.email.trim());
  }

  return Boolean(client.firstName.trim() && client.lastName.trim() && client.phone.trim() && client.email.trim());
};

export const isPropertyQuickProfileComplete = (property?: Property): boolean =>
  Boolean(property?.type?.trim() && property?.municipality?.trim());

export const getMissingRequiredDocuments = (documents: DocumentItem[]): DocumentItem[] =>
  documents.filter(
    (document) => document.isMissingRequired && !availableDocumentStatuses.has(document.status)
  );

export const deriveNextAction = ({
  practice,
  client,
  property,
  documents,
  mandate,
  signingProcess,
  amlDossier,
  amlEnabled = true,
}: PracticeStateSnapshot): NextAction => {
  if (!isClientQuickProfileComplete(client)) {
    return {
      title: 'Completa dati cliente',
      description: 'Mancano alcuni dati essenziali del cliente collegato alla pratica.',
      ctaText: 'Completa cliente',
      targetSection: 'cliente',
      urgency: 'high',
    };
  }

  if (!isPropertyQuickProfileComplete(property)) {
    return {
      title: 'Completa dati immobile',
      description: 'Completa almeno tipologia e comune dell’immobile prima di proseguire.',
      ctaText: 'Completa immobile',
      targetSection: 'immobile',
      urgency: 'high',
    };
  }

  if (!mandate || mandate.status === 'Da compilare' || mandate.status === 'Bozza') {
    return {
      title: 'Compila incarico',
      description: 'Cliente e immobile sono collegati. Completa le condizioni dell’incarico.',
      ctaText: 'Compila incarico',
      targetSection: 'incarico',
      urgency: 'high',
    };
  }

  if (mandate.status === 'Da controllare') {
    return {
      title: 'Controlla bozza incarico',
      description: 'La bozza è pronta per il controllo prima della preparazione alla firma.',
      ctaText: 'Controlla bozza',
      targetSection: 'incarico',
      urgency: 'high',
    };
  }

  if (mandate.status === 'Pronto per la firma' && !signingProcess) {
    return {
      title: 'Prepara firma',
      description: 'L’incarico è pronto. Configura firmatari e modalità di firma simulata.',
      ctaText: 'Prepara firma',
      targetSection: 'firma',
      urgency: 'high',
    };
  }

  if (
    mandate.status === 'Inviato' ||
    mandate.status === 'Parzialmente firmato' ||
    signingProcess?.status === 'In corso'
  ) {
    return {
      title: 'In attesa della firma',
      description: 'La richiesta di firma è stata inviata. Controlla lo stato dei firmatari.',
      ctaText: 'Controlla firme',
      targetSection: 'firma',
      urgency: 'normal',
    };
  }

  const missingDocuments = getMissingRequiredDocuments(documents);
  if (missingDocuments.length > 0) {
    const preferred =
      missingDocuments.find((document) => /planimetr/i.test(document.label)) || missingDocuments[0];

    return {
      title: `Recupera ${preferred.label}`,
      description: `Il fascicolo richiede ancora “${preferred.label}”. Aggiorna lo stato appena il documento è disponibile.`,
      ctaText: 'Apri documenti',
      targetSection: 'documenti',
      documentIdToUpload: preferred.id,
      urgency: 'high',
    };
  }

  if (amlEnabled && (practice.amlStatus !== 'completato' || amlDossier?.status !== 'Completato operativamente')) {
    return {
      title: 'Continua antiriciclaggio',
      description: 'Il fascicolo AML è ancora da completare o da confermare operativamente.',
      ctaText: 'Continua AML',
      targetSection: 'aml',
      urgency: 'normal',
    };
  }

  if (practice.proposalStatus === 'ricevuta' || practice.proposalStatus === 'in_valutazione') {
    return {
      title: 'Controlla proposta',
      description: 'È presente una proposta che richiede verifica o valutazione operativa.',
      ctaText: 'Apri proposta',
      targetSection: 'proposte',
      urgency: 'high',
    };
  }

  return {
    title: 'Nessuna azione urgente',
    description: 'La pratica non presenta attività prioritarie in questo momento.',
    ctaText: 'Vedi pratica',
    urgency: 'none',
  };
};

export const deriveMissingItems = ({
  client,
  property,
  documents,
  mandate,
  amlDossier,
  amlEnabled = true,
}: PracticeStateSnapshot): string[] => {
  const missing: string[] = [];

  if (!isClientQuickProfileComplete(client)) missing.push('Dati essenziali cliente');
  if (!isPropertyQuickProfileComplete(property)) missing.push('Dati essenziali immobile');
  if (!mandate || !['Firmato', 'Inviato', 'Parzialmente firmato', 'Pronto per la firma'].includes(mandate.status)) {
    missing.push('Incarico');
  }

  getMissingRequiredDocuments(documents).forEach((document) => missing.push(document.label));

  if (amlEnabled && amlDossier?.status !== 'Completato operativamente') {
    missing.push('Antiriciclaggio');
  }

  return Array.from(new Set(missing));
};
