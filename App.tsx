
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { CorporateSurveyView } from './components/CorporateSurveyView';
import { DashboardView } from './components/DashboardView';
import { FaqView } from './components/FaqView';
import { BottomNavbar } from './components/BottomNavbar';
import { EvolutionView } from './components/EvolutionView';
import { PlanoAcaoView } from './components/PlanoAcaoView';
import { SettingsView } from './components/SettingsView';
import { AnalysisView } from './components/AnalysisView';
import { PlanoAcaoHistoryView } from './components/PlanoAcaoHistoryView';

export type ActiveView = 'home' | 'personal_reflection' | 'dashboard' | 'corporate_survey' | 'history' | 'plano_acao' | 'settings' | 'faq' | 'action_tracking';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('home');

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomeView setActiveView={setActiveView} />;
      case 'personal_reflection':
        return <AnalysisView />;
      case 'dashboard':
        return <DashboardView />;
      case 'corporate_survey':
        return <CorporateSurveyView />;
      case 'faq':
        return <FaqView />;
      case 'history':
        return <EvolutionView />;
      case 'plano_acao':
        return <PlanoAcaoView setActiveView={setActiveView} />;
      case 'action_tracking':
        return <PlanoAcaoHistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground]">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="md:pl-64 flex flex-col min-h-screen pb-20 md:pb-0">
        <Header />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>
      <BottomNavbar
        activeView={activeView}
        setActiveView={setActiveView}
      />
    </div>
  );
};

export default App;