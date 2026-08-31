'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, openNewPracticeWizard } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#faf9f6]/90 backdrop-blur-md border-t border-[#c7c6ca]/80 md:hidden z-50 px-2 py-1.5 flex justify-around items-center shadow-[0_-4px_20px_-10px_rgba(26,28,26,0.08)] transition-all duration-200">
      {/* Oggi */}
      <button
        id="mobile-nav-oggi"
        onClick={() => setActiveTab('oggi')}
        className={`flex flex-col items-center justify-center p-1.5 w-full cursor-pointer transition-colors ${
          activeTab === 'oggi' ? 'text-[#a14009]' : 'text-[#76777b] hover:text-[#1a1c1a]'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${activeTab === 'oggi' ? 'fill-1' : ''}`}>
          calendar_today
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">OGGI</span>
      </button>

      {/* Opportunità */}
      <button
        id="mobile-nav-opportunita"
        onClick={() => setActiveTab('opportunita')}
        className={`flex flex-col items-center justify-center p-1.5 w-full cursor-pointer transition-colors ${
          activeTab === 'opportunita' ? 'text-[#a14009]' : 'text-[#76777b] hover:text-[#1a1c1a]'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${activeTab === 'opportunita' ? 'fill-1' : ''}`}>
          analytics
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">OPPORTUNITÀ</span>
      </button>

      {/* Center Add Button */}
      <div className="w-full flex justify-center -mt-5">
        <button
          id="mobile-nav-add-practice"
          onClick={() => openNewPracticeWizard()}
          aria-label="Nuova Pratica"
          className="w-11 h-11 bg-[#1a1c1a] text-white rounded-none shadow-md flex items-center justify-center hover:bg-[#333533] active:scale-95 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </button>
      </div>

      {/* Pratiche */}
      <button
        id="mobile-nav-pratiche"
        onClick={() => setActiveTab('pratiche')}
        className={`flex flex-col items-center justify-center p-1.5 w-full cursor-pointer transition-colors ${
          activeTab === 'pratiche' ? 'text-[#a14009]' : 'text-[#76777b] hover:text-[#1a1c1a]'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${activeTab === 'pratiche' ? 'fill-1' : ''}`}>
          folder_open
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">PRATICHE</span>
      </button>

      {/* Clienti */}
      <button
        id="mobile-nav-clienti"
        onClick={() => setActiveTab('clienti')}
        className={`flex flex-col items-center justify-center p-1.5 w-full cursor-pointer transition-colors ${
          activeTab === 'clienti' ? 'text-[#a14009]' : 'text-[#76777b] hover:text-[#1a1c1a]'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${activeTab === 'clienti' ? 'fill-1' : ''}`}>
          groups
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">CLIENTI</span>
      </button>
    </nav>
  );
};
