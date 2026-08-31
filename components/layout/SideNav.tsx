'use client';

import React from 'react';
import { useApp, NavigationTab } from '@/context/AppContext';

export const SideNav: React.FC = () => {
  const { activeTab, setActiveTab, openQuickAdd, tasks, deadlines, agencyProfile } = useApp();

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;
  const pendingDeadlinesCount = deadlines.filter((d) => !d.completed && (d.group === 'oggi' || d.group === 'in_ritardo')).length;

  const navItems: { id: NavigationTab; label: string; icon: string; badge?: number }[] = [
    { id: 'oggi', label: 'Oggi', icon: 'calendar_today', badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'opportunita', label: 'Opportunità', icon: 'analytics' },
    { id: 'pratiche', label: 'Pratiche', icon: 'folder_open' },
    { id: 'clienti', label: 'Clienti', icon: 'groups' },
    { id: 'immobili', label: 'Immobili', icon: 'domain' },
    { id: 'scadenze', label: 'Scadenze', icon: 'timer', badge: pendingDeadlinesCount > 0 ? pendingDeadlinesCount : undefined },
    { id: 'valutazioni', label: 'Valutazioni', icon: 'calculate' },
    { id: 'archivio', label: 'Archivio', icon: 'archive' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 py-6 bg-[#f4f3f1] text-[#1a1c1a] w-64 border-r border-[#c7c6ca] z-40 select-none">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a1c1a] text-white flex items-center justify-center border border-[#1a1c1a] shrink-0 font-mono font-bold text-[13px]">
            {agencyProfile.logoInitials || 'MR'}
          </div>
          <div className="min-w-0">
            <h1 className="text-[16px] font-bold tracking-tight text-[#1a1c1a] uppercase leading-tight font-serif-display truncate">
              {agencyProfile.agencyName || 'MANDATO READY'}
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-[#76777b] font-medium truncate">
              {agencyProfile.city ? `${agencyProfile.city} Studio` : 'Workspace Studio'}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="px-6 mb-6">
        <button
          id="btn-sidebar-nuovo"
          onClick={openQuickAdd}
          className="w-full bg-[#1a1c1a] text-white py-3 px-4 flex items-center justify-center gap-2 hover:bg-[#333533] transition-all text-[12px] uppercase tracking-widest font-bold cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          + Nuovo
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                if (item.id === 'pratiche') {
                  setActiveTab('pratiche');
                } else if (item.id === 'opportunita') {
                  setActiveTab('opportunita');
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-[12px] font-semibold tracking-wider uppercase transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-[#fd844c]/20 text-[#6a2500] border-l-4 border-[#a14009] font-bold'
                  : 'text-[#46474a] hover:bg-[#e3e2e0] hover:text-[#1a1c1a] border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-1 text-[#a14009]' : 'text-[#76777b]'}`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 font-bold ${
                    isActive ? 'bg-[#a14009] text-white' : 'bg-[#e3e2e0] text-[#1a1c1a] border border-[#c7c6ca]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Bottom Links */}
      <div className="px-4 mt-auto pt-4 border-t border-[#c7c6ca] space-y-1">
        <button
          id="nav-item-impostazioni"
          onClick={() => setActiveTab('impostazioni')}
          className={`w-full flex items-center gap-3 px-4 py-2 text-[12px] uppercase tracking-wider font-semibold text-left transition-colors cursor-pointer ${
            activeTab === 'impostazioni'
              ? 'bg-[#fd844c]/20 text-[#6a2500] border-l-4 border-[#a14009] font-bold'
              : 'text-[#46474a] hover:bg-[#e3e2e0] hover:text-[#1a1c1a] border-l-4 border-transparent'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              activeTab === 'impostazioni' ? 'text-[#a14009]' : 'text-[#76777b]'
            }`}
          >
            settings
          </span>
          <span>Impostazioni</span>
        </button>
        <a
          href="mailto:supporto@mandatoready.it"
          className="w-full flex items-center gap-3 px-4 py-2 text-[#46474a] hover:bg-[#e3e2e0] hover:text-[#1a1c1a] text-[12px] uppercase tracking-wider font-semibold text-left transition-colors cursor-pointer border-l-4 border-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-[#76777b]">help</span>
          <span>Supporto</span>
        </a>
      </div>
    </nav>
  );
};
