'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DocumentCategory, DocumentStatus } from '@/lib/types';
import { DocumentUploadModal } from '../common/DocumentUploadModal';
import { Tooltip } from '@/components/common/Tooltip';
import { ContextualHelp } from '@/components/common/ContextualHelp';
import { HELP_CONCEPTS } from '@/lib/helpContent';

export const DocumentWorkspaceView: React.FC = () => {
  const {
    documents,
    practices,
    getClientById,
    getPropertyById,
    openPracticeDetail,
    selectedPracticeId,
    setSelectedPracticeId,
    isHintDismissed,
    dismissHint,
    contextualHelpPreference,
    isHelpModeActive,
  } = useApp();

  const [filterPractice, setFilterPractice] = useState<string>(selectedPracticeId || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocTargetId, setUploadDocTargetId] = useState<string | null>(null);
  const [uploadDocTargetLabel, setUploadDocTargetLabel] = useState<string | null>(null);
  const [uploadDocPracticeId, setUploadDocPracticeId] = useState<string>('prat-1');

  const showFirstUseHint =
    !isHintDismissed('hint_first_use_documenti') && contextualHelpPreference !== 'reduced';

  const filteredDocs = documents.filter((doc) => {
    if (filterPractice !== 'ALL' && doc.practiceId !== filterPractice) return false;
    if (filterStatus !== 'ALL' && doc.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && doc.category !== filterCategory) return false;
    return true;
  });

  const handleOpenUpload = (docId: string, label: string, pId: string) => {
    setUploadDocTargetId(docId);
    setUploadDocTargetLabel(label);
    setUploadDocPracticeId(pId);
    setIsUploadModalOpen(true);
  };

  const getStatusHelp = (status: string) => {
    switch (status) {
      case 'Disponibile':
        return HELP_CONCEPTS.disponibile?.tooltip;
      case 'Da recuperare':
        return HELP_CONCEPTS.da_recuperare?.tooltip;
      case 'In attesa':
        return HELP_CONCEPTS.in_attesa?.tooltip;
      case 'Da verificare':
        return HELP_CONCEPTS.da_verificare?.tooltip;
      default:
        return undefined;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans">
      {/* First-Use Guidance Callout */}
      {showFirstUseHint && (
        <div className="mb-8 p-5 bg-[#faf9f6] border-2 border-[#1a1c1a] shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#a14009] text-white flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                ?
              </span>
              <div>
                <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#1a1c1a]">
                  Come funziona l’archivio documenti?
                </h2>
                <p className="text-[13px] text-[#46474a] mt-1 leading-relaxed max-w-3xl">
                  Tutti i documenti caricati nei singoli fascicoli sono indicizzati qui. Puoi filtrare per stato (<em>Mancante</em>, <em>Disponibile</em>, <em>Da verificare</em>) e caricare file direttamente via drag-and-drop.
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissHint('hint_first_use_documenti')}
              className="px-4 py-1.5 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#c7c6ca] gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
            ARCHIVIO DIGITALE FASCICOLI
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a]">
              Workspace Documenti
            </h1>
            <ContextualHelp conceptId="workspace_documenti" alwaysVisible={isHelpModeActive} />
          </div>
          <p className="text-[14px] text-[#46474a] mt-1">
            Controlla la conformità documentale, carica atti e monitora i documenti mancanti.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadDocTargetId(null);
            setUploadDocTargetLabel(null);
            setUploadDocPracticeId(practices[0]?.id || 'prat-1');
            setIsUploadModalOpen(true);
          }}
          className="bg-[#1a1c1a] text-white px-6 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Carica Documento
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#faf9f6] border border-[#c7c6ca] p-5 mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filter by Practice */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
              Pratica
            </label>
            <select
              value={filterPractice}
              onChange={(e) => setFilterPractice(e.target.value)}
              className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[13px] text-[#1a1c1a]"
            >
              <option value="ALL">Tutte le pratiche attive</option>
              {practices.map((p) => {
                const c = getClientById(p.clientId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.code} - {c ? `${c.firstName} ${c.lastName}` : 'Cliente'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
              Stato Documentale
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[13px] text-[#1a1c1a]"
            >
              <option value="ALL">Tutti gli stati</option>
              <option value="Disponibile">Disponibile (Caricato)</option>
              <option value="Da recuperare">Da recuperare (Mancante)</option>
              <option value="In attesa">In attesa di ricezione</option>
              <option value="Da verificare">Da verificare</option>
            </select>
          </div>

          {/* Filter by Category */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
              Categoria Documento
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[13px] text-[#1a1c1a]"
            >
              <option value="ALL">Tutte le categorie</option>
              <option value="immobile">Immobile (Catasto, APE, Atto)</option>
              <option value="cliente">Cliente (CF, Documenti identità)</option>
              <option value="incarico">Incarico (Mandato, Provvigioni)</option>
              <option value="antiriciclaggio">Antiriciclaggio (AML)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List Table */}
      <div className="border border-[#c7c6ca] bg-[#faf9f6] overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#efeeeb] border-b border-[#c7c6ca]">
            <tr>
              <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#76777b]">
                Documento
              </th>
              <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#76777b]">
                Pratica Associata
              </th>
              <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#76777b]">
                Categoria
              </th>
              <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#76777b]">
                <div className="flex items-center gap-1">
                  <span>Stato</span>
                  <ContextualHelp conceptId="stato_documento" alwaysVisible={isHelpModeActive} size="sm" />
                </div>
              </th>
              <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#76777b] text-right">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c7c6ca]">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#76777b]">
                  Nessun documento corrispondente ai filtri selezionati.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => {
                const practice = practices.find((p) => p.id === doc.practiceId);
                const client = practice ? getClientById(practice.clientId) : null;
                const property = practice ? getPropertyById(practice.propertyId) : null;
                const isAvailable = doc.status === 'Disponibile';
                const statusHelpTooltip = getStatusHelp(doc.status);

                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-[#f4f3f1] transition-colors ${
                      !isAvailable ? 'bg-[#ffdbcd]/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isAvailable ? 'text-[#1a1c1a]' : 'text-[#a14009]'
                          }`}
                        >
                          {isAvailable ? 'description' : 'warning'}
                        </span>
                        <div>
                          <p className={`text-[14px] ${isAvailable ? 'font-medium text-[#1a1c1a]' : 'font-bold text-[#a14009]'}`}>
                            {doc.label}
                          </p>
                          <p className="text-[11px] text-[#76777b]">{doc.subtitle || 'File fascicolo'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {practice && (
                        <div
                          onClick={() => openPracticeDetail(practice.id)}
                          className="cursor-pointer hover:underline"
                        >
                          <p className="text-[13px] font-medium text-[#1a1c1a]">
                            {client ? `${client.firstName} ${client.lastName}` : 'Cliente'}
                          </p>
                          <p className="text-[11px] font-mono text-[#76777b]">
                            {practice.code} · {property?.municipality}
                          </p>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#efeeeb] border border-[#c7c6ca] text-[#1a1c1a]">
                        {doc.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {statusHelpTooltip ? (
                        <Tooltip content={statusHelpTooltip}>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 border cursor-help ${
                              isAvailable
                                ? 'bg-[#efeeeb] text-[#1a1c1a] border-[#c7c6ca]'
                                : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                            }`}
                          >
                            {isAvailable && (
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            )}
                            {doc.status}
                          </span>
                        </Tooltip>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 border ${
                            isAvailable
                              ? 'bg-[#efeeeb] text-[#1a1c1a] border-[#c7c6ca]'
                              : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                          }`}
                        >
                          {isAvailable && (
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          )}
                          {doc.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenUpload(doc.id, doc.label, doc.practiceId)}
                        className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          isAvailable
                            ? 'border border-[#c7c6ca] text-[#1a1c1a] hover:bg-[#e3e2e0]'
                            : 'bg-[#a14009] text-white hover:bg-[#7d2d00]'
                        }`}
                      >
                        {isAvailable ? 'Sostituisci' : 'Carica'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        practiceId={uploadDocPracticeId}
        targetDocId={uploadDocTargetId}
        targetDocLabel={uploadDocTargetLabel}
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadDocTargetId(null);
          setUploadDocTargetLabel(null);
        }}
      />
    </div>
  );
};
