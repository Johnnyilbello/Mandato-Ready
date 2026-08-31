'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Deadline } from '@/lib/types';

interface AddDeadlineModalProps {
  practiceId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({ practiceId, isOpen, onClose }) => {
  const { practices, addDeadline } = useApp();
  const [selectedPratId, setSelectedPratId] = useState(practiceId || practices[0]?.id || 'prat-1');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('Oggi, 18:00');
  const [group, setGroup] = useState<Deadline['group']>('oggi');
  const [priority, setPriority] = useState<'high' | 'normal'>('normal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addDeadline(selectedPratId, title.trim(), dueDate, group, priority);
    setTitle('');
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
          <span className="material-symbols-outlined text-[#a14009] text-[20px]">timer</span>
          <h3 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">Nuova Scadenza</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[14px]">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
              Pratica Associata
            </label>
            <select
              value={selectedPratId}
              onChange={(e) => setSelectedPratId(e.target.value)}
              className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a]"
            >
              {practices.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.practiceType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
              Descrizione Scadenza
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Firma incarico in agenzia"
              className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
                Data / Orario
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="es. Domani, 12:00"
                className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76777b] block mb-1">
                Raggruppamento
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as Deadline['group'])}
                className="w-full p-2.5 border border-[#c7c6ca] bg-white text-[#1a1c1a]"
              >
                <option value="oggi">Oggi</option>
                <option value="questa_settimana">Questa settimana</option>
                <option value="piu_avanti">Più avanti</option>
                <option value="in_ritardo">In ritardo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#c7c6ca]">
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
              Crea Scadenza
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
