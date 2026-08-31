import type { Signatory, SigningProcess } from './types';

export interface SignatureProvider {
  prepare(input: {
    id: string;
    documentId: string;
    practiceId: string;
    mode: SigningProcess['mode'];
    signatories: Signatory[];
  }): SigningProcess;
  send(process: SigningProcess): SigningProcess;
  completeSignature(process: SigningProcess, signatoryId: string): SigningProcess;
}

const cloneSignatories = (signatories: Signatory[]): Signatory[] =>
  signatories.map((signatory) => ({ ...signatory }));

export class MockSignatureProvider implements SignatureProvider {
  prepare(input: {
    id: string;
    documentId: string;
    practiceId: string;
    mode: SigningProcess['mode'];
    signatories: Signatory[];
  }): SigningProcess {
    return {
      id: input.id,
      documentId: input.documentId,
      practiceId: input.practiceId,
      mode: input.mode,
      status: 'Da inviare',
      provider: 'mock',
      signatories: cloneSignatories(input.signatories).map((signatory) => ({
        ...signatory,
        status: 'Da invitare',
      })),
      createdAt: new Date().toISOString(),
    };
  }

  send(process: SigningProcess): SigningProcess {
    const signatories = cloneSignatories(process.signatories).map((signatory, index) => ({
      ...signatory,
      status:
        process.mode === 'Contemporanea' || index === 0
          ? ('In attesa di firma' as const)
          : ('Inviato' as const),
    }));

    return {
      ...process,
      provider: 'mock',
      status: 'In corso',
      signatories,
      sentAt: new Date().toISOString(),
    };
  }

  completeSignature(process: SigningProcess, signatoryId: string): SigningProcess {
    if (process.status !== 'In corso') return process;

    const targetIndex = process.signatories.findIndex((signatory) => signatory.id === signatoryId);
    if (targetIndex < 0) return process;

    const target = process.signatories[targetIndex];
    if (target.status !== 'In attesa di firma') return process;

    const signatories = cloneSignatories(process.signatories);
    signatories[targetIndex] = { ...target, status: 'Firmato' };

    if (process.mode === 'Sequenziale') {
      const nextIndex = signatories.findIndex(
        (signatory, index) => index > targetIndex && signatory.status !== 'Firmato'
      );
      if (nextIndex >= 0) {
        signatories[nextIndex] = { ...signatories[nextIndex], status: 'In attesa di firma' };
      }
    }

    const allSigned = signatories.every((signatory) => signatory.status === 'Firmato');

    return {
      ...process,
      signatories,
      status: allSigned ? 'Completato' : 'In corso',
      completedAt: allSigned ? new Date().toISOString() : undefined,
    };
  }
}

export const mockSignatureProvider = new MockSignatureProvider();
