import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { AmlDossier, Client, Mandate, Practice, Property, Signatory } from '../lib/types';
import { findClientDuplicate } from '../lib/clientDuplicates';
import { createPracticeBundle, applyDocumentStatusToPractice } from '../lib/practiceCreation';
import { deriveNextAction } from '../lib/nextAction';
import { MockSignatureProvider } from '../lib/signatureProvider';
import {
  RECOMMENDED_DASHBOARD_WIDGETS,
  moveDashboardWidget,
  normalizeDashboardWidgets,
  resetDashboardWidgets,
  toggleDashboardWidget,
} from '../lib/dashboardPreferences';

const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'cli-test',
  firstName: 'Giulia',
  lastName: 'Verdi',
  phone: '+39 333 111 2233',
  email: 'giulia@example.test',
  type: 'seller',
  createdAt: 'Oggi',
  ...overrides,
});

const makeProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'prop-test',
  address: '',
  municipality: 'Terrasini',
  province: 'PA',
  type: 'Appartamento',
  owners: ['cli-test'],
  ...overrides,
});

const makePractice = (overrides: Partial<Practice> = {}): Practice => ({
  id: 'prat-test',
  code: 'PRT-2026-0001',
  clientId: 'cli-test',
  propertyId: 'prop-test',
  practiceType: 'Compravendita',
  status: 'In corso',
  mandateStatus: 'firmato',
  amlStatus: 'completato',
  documentStatus: 'pronto',
  proposalStatus: 'nessuna',
  openedDate: 'Oggi',
  assignedAgent: { name: 'Anna Ferrari', initials: 'AF' },
  estimatedValue: 0,
  nextAction: {
    title: 'Compatibilità',
    description: 'Il runtime usa deriveNextAction.',
    ctaText: 'Apri',
  },
  amlWorkflow: {
    clienteIdentificato: true,
    informazioniRaccolte: true,
    titolareEffettivoVerificato: true,
    fascicoloCompleto: true,
  },
  notes: [],
  timeline: [],
  ...overrides,
});

const signedMandate = (overrides: Partial<Mandate> = {}): Mandate => ({
  id: 'mand-test',
  practiceId: 'prat-test',
  clientIds: ['cli-test'],
  propertyId: 'prop-test',
  mandateType: 'Vendita',
  exclusivity: 'In esclusiva',
  startDate: '2026-08-31',
  endDate: '2027-02-28',
  askingPrice: 250000,
  commissionType: 'percentuale',
  commissionValue: '3',
  notes: '',
  customClauses: '',
  status: 'Firmato',
  templateId: 'tpl-demo',
  createdAt: '2026-08-31T10:00:00.000Z',
  updatedAt: '2026-08-31T10:00:00.000Z',
  signatories: [],
  ...overrides,
});

const completeAml = (overrides: Partial<AmlDossier> = {}): AmlDossier => ({
  id: 'aml-test',
  practiceId: 'prat-test',
  status: 'Completato operativamente',
  sections: {
    soggetti: true,
    identificazione: true,
    relazioni: true,
    operazione: true,
    origineFondi: true,
    valutazione: true,
  },
  riskAssessment: {
    level: 'Medio',
    notes: 'Valutazione inserita dall’operatore.',
    date: '2026-08-31',
    operatorName: 'Anna Ferrari',
  },
  ...overrides,
});

const makeSignatories = (): Signatory[] => [
  { id: 'sig-1', name: 'Giulia Verdi', role: 'Proprietario', email: 'giulia@example.test', phone: '+393331112233', status: 'Da invitare' },
  { id: 'sig-2', name: 'Marco Verdi', role: 'Comproprietario', email: 'marco@example.test', phone: '+393331112244', status: 'Da invitare' },
];

test('Client duplicate detection is non-destructive and detects shared identifiers', () => {
  const existing = makeClient({ fiscalCode: 'VRDGLI90A01G273X' });
  const phoneMatch = findClientDuplicate([existing], {
    phone: '333-111-2233',
    email: 'other@example.test',
  });
  assert.equal(phoneMatch?.client.id, existing.id);
  assert.equal(phoneMatch?.reason, 'telefono');

  const emailMatch = findClientDuplicate([existing], {
    phone: '+39 333 000 0000',
    email: 'GIULIA@EXAMPLE.TEST',
  });
  assert.equal(emailMatch?.reason, 'email');

  const excluded = findClientDuplicate([existing], existing, existing.id);
  assert.equal(excluded, null);
});

test('same-cycle Client + Property creates one Practice with the exact shared references', () => {
  const client = makeClient({ id: 'cli-new-cycle' });
  const property = makeProperty({ id: 'prop-new-cycle', owners: [client.id], address: '' });
  let counter = 0;
  const bundle = createPracticeBundle({
    client,
    property,
    practiceType: 'Compravendita',
    checklistLabels: ['Planimetria catastale conforme'],
    availableDocLabels: [],
    assignedAgent: { name: 'Anna Ferrari', initials: 'AF' },
    sequence: 7,
    year: 2026,
    createId: (prefix) => `${prefix}-${++counter}`,
    noteAuthor: 'Anna Ferrari',
  });

  assert.equal(bundle.practice.clientId, client.id);
  assert.equal(bundle.practice.propertyId, property.id);
  assert.equal(property.address, '');
  assert.equal(property.askingPrice, undefined);
  assert.equal(property.estimatedValue, undefined);
  assert.equal(bundle.documents.length, 1);
});

test('Practice creation returns the newly generated Practice ID rather than selected UI state', () => {
  const client = makeClient();
  const property = makeProperty();
  const ids = ['prat-returned', 'note-returned', 'timeline-returned', 'timeline-next'];
  const bundle = createPracticeBundle({
    client,
    property,
    practiceType: 'Compravendita',
    checklistLabels: [],
    assignedAgent: { name: 'Anna Ferrari', initials: 'AF' },
    sequence: 1,
    year: 2026,
    createId: () => ids.shift() || 'unexpected',
    noteAuthor: 'Anna Ferrari',
  });
  assert.equal(bundle.practice.id, 'prat-returned');
  assert.equal(bundle.practice.code, 'PRT-2026-0001');
});

test('Next Action prioritizes incomplete shared Client data', () => {
  const action = deriveNextAction({
    practice: makePractice(),
    client: makeClient({ phone: '' }),
    property: makeProperty(),
    documents: [],
    mandate: signedMandate(),
    amlDossier: completeAml(),
  });
  assert.equal(action.title, 'Completa dati cliente');
  assert.equal(action.targetSection, 'cliente');
});

test('Document availability propagates to missing state and deterministic Next Action', () => {
  const practice = makePractice({ documentStatus: 'in_corso' });
  const client = makeClient();
  const property = makeProperty();
  const missingDocument = {
    id: 'doc-plan',
    practiceId: practice.id,
    category: 'immobile' as const,
    label: 'Planimetria catastale conforme',
    subtitle: 'Checklist',
    status: 'Da recuperare' as const,
    isMissingRequired: true,
  };

  const before = deriveNextAction({
    practice,
    client,
    property,
    documents: [missingDocument],
    mandate: signedMandate(),
    amlEnabled: false,
  });
  assert.match(before.title, /^Recupera /);

  const propagated = applyDocumentStatusToPractice({
    practice,
    documents: [missingDocument],
    documentId: missingDocument.id,
    status: 'Disponibile',
  });
  assert.equal(propagated.practice.documentStatus, 'pronto');
  assert.equal(propagated.documents[0].isMissingRequired, false);

  const after = deriveNextAction({
    practice: propagated.practice,
    client,
    property,
    documents: propagated.documents,
    mandate: signedMandate(),
    amlEnabled: false,
  });
  assert.equal(after.title, 'Nessuna azione urgente');
});

test('AML remains an operator-completed workflow and drives Next Action until completed', () => {
  const practice = makePractice({ amlStatus: 'in_corso' });
  const partialAml = completeAml({
    status: 'In corso',
    sections: {
      soggetti: true,
      identificazione: true,
      relazioni: true,
      operazione: true,
      origineFondi: false,
      valutazione: false,
    },
    riskAssessment: {
      level: 'Medio',
      notes: 'Valutazione inserita dall’operatore.',
      date: '2026-08-31',
      operatorName: 'Anna Ferrari',
    },
  });
  const action = deriveNextAction({
    practice,
    client: makeClient(),
    property: makeProperty(),
    documents: [],
    mandate: signedMandate(),
    amlDossier: partialAml,
    amlEnabled: true,
  });
  assert.equal(action.title, 'Continua antiriciclaggio');
  assert.equal(partialAml.riskAssessment.operatorName, 'Anna Ferrari');
  assert.match(partialAml.riskAssessment.notes, /operatore/);
});

test('sequential mock signing rejects Signer 2 before Signer 1', () => {
  const provider = new MockSignatureProvider();
  const prepared = provider.prepare({
    id: 'sign-seq',
    documentId: 'doc-incarico',
    practiceId: 'prat-test',
    mode: 'Sequenziale',
    signatories: makeSignatories(),
  });
  const sent = provider.send(prepared);
  const attemptedSecond = provider.completeSignature(sent, 'sig-2');
  assert.equal(attemptedSecond.signatories[0].status, 'In attesa di firma');
  assert.equal(attemptedSecond.signatories[1].status, 'Inviato');
  assert.equal(attemptedSecond.status, 'In corso');
});

test('sequential mock signing unlocks next signer and completes in order', () => {
  const provider = new MockSignatureProvider();
  const sent = provider.send(provider.prepare({
    id: 'sign-seq',
    documentId: 'doc-incarico',
    practiceId: 'prat-test',
    mode: 'Sequenziale',
    signatories: makeSignatories(),
  }));
  const firstSigned = provider.completeSignature(sent, 'sig-1');
  assert.equal(firstSigned.signatories[0].status, 'Firmato');
  assert.equal(firstSigned.signatories[1].status, 'In attesa di firma');
  const completed = provider.completeSignature(firstSigned, 'sig-2');
  assert.equal(completed.status, 'Completato');
  assert.ok(completed.signatories.every((signatory) => signatory.status === 'Firmato'));
});

test('simultaneous mock signing allows independent signer order', () => {
  const provider = new MockSignatureProvider();
  const sent = provider.send(provider.prepare({
    id: 'sign-sim',
    documentId: 'doc-incarico',
    practiceId: 'prat-test',
    mode: 'Contemporanea',
    signatories: makeSignatories(),
  }));
  assert.ok(sent.signatories.every((signatory) => signatory.status === 'In attesa di firma'));
  const secondFirst = provider.completeSignature(sent, 'sig-2');
  assert.equal(secondFirst.signatories[1].status, 'Firmato');
  assert.equal(secondFirst.signatories[0].status, 'In attesa di firma');
});

test('dashboard preferences preserve core widgets, visibility, ordering and reset', () => {
  const initial = normalizeDashboardWidgets(RECOMMENDED_DASHBOARD_WIDGETS);
  const toggled = toggleDashboardWidget(initial, 'documenti_mancanti');
  assert.equal(toggled.find((widget) => widget.id === 'documenti_mancanti')?.enabled, true);
  assert.equal(toggled.find((widget) => widget.id === 'da_fare_oggi')?.enabled, true);

  const moved = moveDashboardWidget(toggled, 'documenti_mancanti', -1);
  const movedIndex = moved.findIndex((widget) => widget.id === 'documenti_mancanti');
  assert.equal(movedIndex, toggled.findIndex((widget) => widget.id === 'documenti_mancanti') - 1);

  const persistedRoundTrip = normalizeDashboardWidgets(JSON.parse(JSON.stringify(moved)));
  assert.deepEqual(persistedRoundTrip.map((widget) => widget.id), moved.map((widget) => widget.id));

  const reset = resetDashboardWidgets();
  assert.deepEqual(reset.map((widget) => widget.id), RECOMMENDED_DASHBOARD_WIDGETS.map((widget) => widget.id));
  assert.equal(reset.find((widget) => widget.id === 'documenti_mancanti')?.enabled, false);
});

test('production Nuova Pratica source contains no known fabricated workflow fallbacks or hidden service navigation', () => {
  const wizard = readFileSync('components/views/NuovaPraticaWizard.tsx', 'utf8');
  const context = readFileSync('context/AppContext.tsx', 'utf8');
  const archive = readFileSync('components/views/ClientiImmobiliView.tsx', 'utf8');

  for (const forbidden of [
    '+39 333 0000000',
    'cliente@email.it',
    "'Cliente'",
    "'Nuovo'",
    'Via Roma 1',
    'Via Principale 1',
    'stima indicativa',
  ]) {
    assert.equal(wizard.includes(forbidden), false, `forbidden wizard fallback found: ${forbidden}`);
  }
  assert.equal(wizard.includes('newPropPrice'), false);
  assert.equal(wizard.includes('estimatedValue'), false);
  assert.equal(archive.includes('p.estimatedValue'), false);
  assert.equal(archive.includes('property.estimatedValue'), false);

  const standardCreation = context.slice(
    context.indexOf('const createPracticeFromWizard'),
    context.indexOf('const addPracticeNote')
  );
  assert.equal(standardCreation.includes('openPracticeDetail'), false);

  const opportunityCreation = context.slice(
    context.indexOf('const convertOpportunityToPractice'),
    context.indexOf('const createPracticeFromWizard')
  );
  assert.equal(opportunityCreation.includes('openPracticeDetail'), false);
});
