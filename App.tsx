
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

export type ActiveView = 'home' | 'dashboard' | 'corporate_survey' | 'history' | 'plano_acao' | 'settings' | 'faq';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('home');

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomeView setActiveView={setActiveView} />;
      case 'dashboard':
        return <DashboardView />;
      case 'corporate_survey':
        return <CorporateSurveyView />;
      case 'faq':
        return <FaqView />;
      case 'history':
        return <EvolutionView />;
      case 'plano_acao':
        return <PlanoAcaoView />;
      case 'settings':
        return (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
            <p className="text-slate-500 mt-2">Esta funcionalidade estará disponível em breve.</p>
          </div>
        );
      default:
        return <HomeView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
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