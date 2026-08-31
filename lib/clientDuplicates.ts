import type { Client } from './types';

export type ClientDuplicateReason = 'telefono' | 'email' | 'codice_fiscale' | 'partita_iva';

export interface ClientDuplicateMatch {
  client: Client;
  reason: ClientDuplicateReason;
}

const normalizePhone = (value?: string) => (value || '').replace(/\D/g, '');
const normalizeEmail = (value?: string) => (value || '').trim().toLowerCase();
const normalizeCode = (value?: string) => (value || '').trim().toUpperCase();

export const findClientDuplicate = (
  clients: Client[],
  candidate: Pick<Client, 'phone' | 'email'> & Partial<Pick<Client, 'fiscalCode' | 'vatNumber'>>,
  excludeClientId?: string
): ClientDuplicateMatch | null => {
  const phone = normalizePhone(candidate.phone);
  const email = normalizeEmail(candidate.email);
  const fiscalCode = normalizeCode(candidate.fiscalCode);
  const vatNumber = normalizeCode(candidate.vatNumber);

  for (const client of clients) {
    if (client.id === excludeClientId) continue;
    if (phone.length > 5 && normalizePhone(client.phone) === phone) return { client, reason: 'telefono' };
    if (email && normalizeEmail(client.email) === email) return { client, reason: 'email' };
    if (fiscalCode.length > 5 && normalizeCode(client.fiscalCode) === fiscalCode) return { client, reason: 'codice_fiscale' };
    if (vatNumber.length > 5 && normalizeCode(client.vatNumber) === vatNumber) return { client, reason: 'partita_iva' };
  }

  return null;
};

export const duplicateReasonLabel = (reason: ClientDuplicateReason): string => {
  switch (reason) {
    case 'telefono': return 'stesso numero di telefono';
    case 'email': return 'stessa email';
    case 'codice_fiscale': return 'stesso codice fiscale';
    case 'partita_iva': return 'stessa partita IVA';
  }
};
