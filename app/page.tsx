'use client';

import React, { useSyncExternalStore } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { SideNav } from '@/components/layout/SideNav';
import { MobileNav } from '@/components/layout/MobileNav';
import { DemoToolsModal } from '@/components/layout/DemoToolsModal';
import { OggiView } from '@/components/views/OggiView';
import { OpportunitaListView } from '@/components/views/OpportunitaListView';
import { OpportunityDetailView } from '@/components/views/OpportunityDetailView';
import { PraticheListView } from '@/components/views/PraticheListView';
import { PracticeDetailView } from '@/components/views/PracticeDetailView';
import { NuovaPraticaWizard } from '@/components/views/NuovaPraticaWizard';
import { IncaricoWizardView } from '@/components/views/IncaricoWizardView';
import { AmlWizardView } from '@/components/views/AmlWizardView';
import { SigningProcessView } from '@/components/views/SigningProcessView';
import { DocumentWorkspaceView } from '@/components/views/DocumentWorkspaceView';
import { ScadenzeView } from '@/components/views/ScadenzeView';
import { ClientiImmobiliView } from '@/components/views/ClientiImmobiliView';
import { ValutazioniView } from '@/components/views/ValutazioniView';
import { ImpostazioniView } from '@/components/views/ImpostazioniView';

import { QuickAddModal } from '@/components/modals/QuickAddModal';
import { NewClientModal } from '@/components/modals/NewClientModal';
import { NewPropertyModal } from '@/components/modals/NewPropertyModal';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

const emptySubscribe = () => () => {};

function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const WorkspaceContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedOpportunityId,
    selectedPracticeId,
    onboardingCompleted,
    openQuickAdd,
  } = useApp();

  // If first run / onboarding not completed
  if (!onboardingCompleted) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <OnboardingWizard />
        <DemoToolsModal />
      </div>
    );
  }

  // If in transactional full-screen wizard
  if (['nuova_pratica', 'incarico_wizard', 'aml_wizard', 'firma_process'].includes(activeTab)) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        {activeTab === 'nuova_pratica' && <NuovaPraticaWizard />}
        {activeTab === 'incarico_wizard' && <IncaricoWizardView />}
        {activeTab === 'aml_wizard' && <AmlWizardView />}
        {activeTab === 'firma_process' && <SigningProcessView />}
        <DemoToolsModal />
        <NewClientModal />
        <NewPropertyModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] flex flex-col md:flex-row antialiased selection:bg-[#ffdbcd] selection:text-[#6a2500]">
      {/* Desktop Architectural Side Navigation */}
      <SideNav />

      {/* Main Operational Canvas */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 pb-20 md:pb-8">
        {/* Mobile Header with Liquid Glass Material */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-[#c7c6ca]/80 bg-[#faf9f6]/85 backdrop-blur-md sticky top-0 z-20 transition-all duration-200">
          <div
            onClick={() => setActiveTab('oggi')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-5 h-5 bg-[#a14009] flex items-center justify-center text-white text-[10px] font-mono font-bold">
              M
            </div>
            <span className="font-serif-display font-bold text-[16px] text-[#1a1c1a] tracking-tight">
              MANDATO READY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openQuickAdd}
              className="px-3.5 py-1.5 bg-[#1a1c1a] text-white text-[11px] uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+ Nuovo</span>
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <main className="flex-1">
          {activeTab === 'oggi' && <OggiView />}
          {activeTab === 'opportunita' &&
            (selectedOpportunityId ? <OpportunityDetailView /> : <OpportunitaListView />)}
          {activeTab === 'pratiche' &&
            (selectedPracticeId ? <PracticeDetailView /> : <PraticheListView />)}
          {activeTab === 'documenti' && <DocumentWorkspaceView />}
          {activeTab === 'scadenze' && <ScadenzeView />}
          {activeTab === 'clienti' && <ClientiImmobiliView initialTab="clienti" />}
          {activeTab === 'immobili' && <ClientiImmobiliView initialTab="immobili" />}
          {activeTab === 'valutazioni' && <ValutazioniView />}
          {activeTab === 'impostazioni' && <ImpostazioniView />}
          {activeTab === 'archivio' && <PraticheListView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Creation Modals */}
      <QuickAddModal />
      <NewClientModal />
      <NewPropertyModal />

      {/* Demo State Control Modal */}
      <DemoToolsModal />
    </div>
  );
};

export default function Page() {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return <div className="min-h-screen bg-[#faf9f6]" />;
  }

  return (
    <AppProvider>
      <WorkspaceContent />
    </AppProvider>
  );
}

