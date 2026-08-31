'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DocumentCategory, DocumentStatus } from '@/lib/types';

interface DocumentUploadModalProps {
  practiceId: string;
  targetDocId?: string | null;
  targetDocLabel?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  practiceId,
  targetDocId,
  targetDocLabel,
  isOpen,
  onClose,
}) => {
  const { uploadOrMarkDocument, addDocumentToPractice } = useApp();

  const [label, setLabel] = useState(targetDocLabel || 'Planimetria Catastale');
  const [category, setCategory] = useState<DocumentCategory>('immobile');
  const [subtitle, setSubtitle] = useState('File allegato');
  const [status, setStatus] = useState<DocumentStatus>('Disponibile');
  const [fileName, setFileName] = useState(
    targetDocLabel ? `${targetDocLabel.replace(/\s+/g, '_')}_Aggiornato.pdf` : 'Planimetria_ViaRoma18.pdf'
  );
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingUpload(true);

    setTimeout(() => {
      if (targetDocId) {
        uploadOrMarkDocument(targetDocId, status, fileName);
      } else {
        addDocumentToPractice(practiceId, category, label, subtitle, status);
      }
      setIsSimulatingUpload(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-[#faf9f6] border-2 border-[#1a1c1a] max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#c7c6ca]">
          <div className="w-8 h-8 bg-[#1a1c1a] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#a14009]">
              FASCICOLO DOCUMENTALE
            </span>
            <h3 className="text-[20px] font-serif-display font-bold text-[#1a1c1a]">
              {targetDocId ? `Carica ${targetDocLabel}` : 'Aggiungi documento'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[14px]">
          {!targetDocId && (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
                  Nome Documento
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="es. Atto di Provenienza"
                  className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a]"
                  >
                    <option value="immobile">Immobile</option>
                    <option value="cliente">Cliente</option>
                    <option value="incarico">Incarico</option>
                    <option value="antiriciclaggio">Antiriciclaggio</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
                    Dettaglio / Note
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="es. Copia conforme"
                    className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Upload Drop Zone Simulation */}
          <div className="border-2 border-dashed border-[#c7c6ca] p-6 text-center bg-[#f4f3f1] hover:border-[#1a1c1a] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[32px] text-[#76777b] mb-2">
              cloud_upload
            </span>
            <p className="text-[13px] font-medium text-[#1a1c1a]">
              Trascina il file PDF o clicca per selezionare
            </p>
            <p className="text-[11px] text-[#76777b] mt-1 font-mono">
              File selezionato: {fileName}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
              Stato del Documento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Disponibile', 'Da recuperare', 'In attesa', 'Da verificare'] as DocumentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`p-2 border text-[11px] font-bold uppercase tracking-wider text-center cursor-pointer transition-colors ${
                    status === st
                      ? 'border-[#a14009] bg-[#ffdbcd] text-[#6a2500]'
                      : 'border-[#c7c6ca] bg-white text-[#1a1c1a]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#c7c6ca] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSimulatingUpload}
              className="px-6 py-2.5 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSimulatingUpload ? (
                <span>Caricamento...</span>
              ) : (
                <>
                  <span>Salva Documento</span>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
