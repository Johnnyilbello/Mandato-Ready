'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface AddNoteModalProps {
  practiceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ practiceId, isOpen, onClose }) => {
  const { addPracticeNote } = useApp();
  const [noteText, setNoteText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addPracticeNote(practiceId, noteText.trim());
    setNoteText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-[#faf9f6] border-2 border-[#1a1c1a] max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#76777b] hover:text-[#1a1c1a] p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#c7c6ca]">
          <span className="material-symbols-outlined text-[#a14009] text-[20px]">edit_note</span>
          <h3 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">Aggiungi Nota Operativa</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={4}
            required
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Scrivi qui gli aggiornamenti sul cliente, esito sopralluogo o richieste..."
            className="w-full p-3 border border-[#c7c6ca] bg-white text-[#1a1c1a] text-[14px]"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#c7c6ca]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c7c6ca] text-[12px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#1a1c1a] text-white text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] cursor-pointer"
            >
              Salva Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
