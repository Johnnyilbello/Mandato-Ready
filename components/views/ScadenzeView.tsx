'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AddDeadlineModal } from '../common/AddDeadlineModal';

export const ScadenzeView: React.FC = () => {
  const { deadlines, toggleDeadline, openPracticeDetail, practices, getClientById, getPropertyById } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const overdue = deadlines.filter((d) => d.group === 'in_ritardo' && !d.completed);
  const today = deadlines.filter((d) => d.group === 'oggi' && !d.completed);
  const thisWeek = deadlines.filter((d) => d.group === 'questa_settimana' && !d.completed);
  const later = deadlines.filter((d) => d.group === 'piu_avanti' && !d.completed);
  const completed = deadlines.filter((d) => d.completed);

  const renderDeadlineList = (list: typeof deadlines, isUrgent = false) => {
    if (list.length === 0) {
      return <p className="text-[13px] text-[#76777b] py-2">Nessuna scadenza in questo gruppo.</p>;
    }

    return (
      <div className="divide-y divide-[#c7c6ca]">
        {list.map((item) => {
          const practice = practices.find((p) => p.id === item.practiceId);
          const client = practice ? getClientById(practice.clientId) : null;
          const property = practice ? getPropertyById(practice.propertyId) : null;

          return (
            <div
              key={item.id}
              className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isUrgent ? 'bg-[#ffdad6]/20 px-4 -mx-4' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleDeadline(item.id)}
                  title={item.completed ? 'Completata' : 'Segna completata'}
                  className="mt-0.5 p-1 text-[#76777b] hover:text-[#1a1c1a] cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      item.completed ? 'text-[#1a1c1a]' : isUrgent ? 'text-[#ba1a1a]' : 'text-[#76777b]'
                    }`}
                  >
                    {item.completed ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] font-mono font-bold ${
                        isUrgent ? 'text-[#ba1a1a]' : 'text-[#a14009]'
                      }`}
                    >
                      {item.dueDate}
                    </span>
                    {item.priority === 'high' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a]">
                        Urgente
                      </span>
                    )}
                  </div>
                  <p className={`text-[15px] font-semibold ${item.completed ? 'line-through text-[#76777b]' : 'text-[#1a1c1a]'}`}>
                    {item.title}
                  </p>
                  {practice && (
                    <button
                      onClick={() => openPracticeDetail(practice.id)}
                      className="text-[12px] text-[#76777b] hover:text-[#1a1c1a] hover:underline font-mono mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">folder</span>
                      {practice.code} · {client?.firstName} {client?.lastName} ({property?.municipality})
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {practice && (
                  <button
                    onClick={() => openPracticeDetail(practice.id)}
                    className="px-4 py-2 border border-[#c7c6ca] text-[11px] uppercase font-bold tracking-wider hover:bg-[#e3e2e0] text-[#1a1c1a] cursor-pointer"
                  >
                    Apri Pratica
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 md:py-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#c7c6ca] gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-semibold text-[#76777b] mb-1">
            CONTROLLO TEMPISTICA E ADEMPIMENTI
          </div>
          <h1 className="text-[32px] md:text-[40px] font-serif-display font-bold text-[#1a1c1a]">
            Scadenze
          </h1>
          <p className="text-[14px] text-[#46474a] mt-1">
            Monitora appuntamenti, firme incarico, verifiche catastali e rinnovi mandati.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1a1c1a] text-white px-6 py-3 text-[12px] uppercase font-bold tracking-widest hover:bg-[#333533] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuova Scadenza
        </button>
      </div>

      {/* Sections by urgency */}
      <div className="space-y-8">
        {/* In ritardo */}
        {overdue.length > 0 && (
          <section className="bg-[#faf9f6] border-2 border-[#ba1a1a] p-6">
            <div className="flex items-center gap-2 border-b border-[#ba1a1a]/30 pb-3 mb-4 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <h2 className="text-[18px] font-serif-display font-bold">In ritardo</h2>
            </div>
            {renderDeadlineList(overdue, true)}
          </section>
        )}

        {/* Oggi */}
        <section className="bg-[#faf9f6] border border-[#c7c6ca] p-6">
          <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
            <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#a14009] inline-block"></span>
              Oggi
            </h2>
            <span className="text-[11px] font-mono text-[#76777b] uppercase">{today.length} scadenze</span>
          </div>
          {renderDeadlineList(today)}
        </section>

        {/* Questa settimana */}
        <section className="bg-[#faf9f6] border border-[#c7c6ca] p-6">
          <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
            <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">Questa settimana</h2>
            <span className="text-[11px] font-mono text-[#76777b] uppercase">{thisWeek.length} scadenze</span>
          </div>
          {renderDeadlineList(thisWeek)}
        </section>

        {/* Più avanti */}
        <section className="bg-[#faf9f6] border border-[#c7c6ca] p-6">
          <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
            <h2 className="text-[18px] font-serif-display font-bold text-[#1a1c1a]">Più avanti</h2>
            <span className="text-[11px] font-mono text-[#76777b] uppercase">{later.length} scadenze</span>
          </div>
          {renderDeadlineList(later)}
        </section>

        {/* Completate */}
        {completed.length > 0 && (
          <section className="bg-[#f4f3f1] border border-[#c7c6ca] p-6 opacity-75">
            <div className="flex items-center justify-between border-b border-[#c7c6ca] pb-3 mb-4">
              <h2 className="text-[16px] font-serif-display font-bold text-[#76777b]">Completate di recente</h2>
              <span className="text-[11px] font-mono text-[#76777b] uppercase">{completed.length}</span>
            </div>
            {renderDeadlineList(completed)}
          </section>
        )}
      </div>

      <AddDeadlineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
