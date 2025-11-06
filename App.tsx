

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CompanyHomeView } from './components/HomeView';
import { CorporateSurveyView } from './components/CorporateSurveyView';
import { DashboardView } from './components/DashboardView';
import { FaqView } from './components/FaqView';
import { BottomNavbar } from './components/BottomNavbar';
import { EvolutionView } from './components/EvolutionView';
import { PlanoAcaoView } from './components/PlanoAcaoView';
import { SettingsView } from './components/SettingsView';
import { AnalysisView } from './components/AnalysisView';
import { PlanoAcaoHistoryView } from './components/PlanoAcaoHistoryView';
import { CampaignView } from './components/CampaignView';
import { SupportTeamView } from './components/SupportTeamView';
import { LoginView } from './components/LoginView';
import { CollaboratorHomeView } from './components/CollaboratorHomeView';
import { AuthData, authService } from './services/authService';

export type ActiveView = 'home' | 'personal_reflection' | 'dashboard' | 'corporate_survey' | 'history' | 'plano_acao' | 'settings' | 'faq' | 'action_tracking' | 'campaigns' | 'support_team';
export type UserRole = 'company' | 'collaborator';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthData | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dashboardFilters, setDashboardFilters] = useState<Record<string, string> | undefined>(undefined);

  useEffect(() => {
    const checkAuth = () => {
      const authData = authService.getAuth();
      if (authData) {
        setUser(authData);
      }
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (authData: AuthData) => {
    setUser(authData);
    setActiveView('home'); // Reset to home on login
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleNavigateToDashboard = (filters?: Record<string, string>) => {
    setDashboardFilters(filters);
    setActiveView('dashboard');
  };

  const renderContent = () => {
    if (!user) return null;
    switch (activeView) {
      case 'home':
        if (user.role === 'collaborator') {
          return <CollaboratorHomeView setActiveView={setActiveView} />;
        }
        return <CompanyHomeView setActiveView={setActiveView} onNavigateToDashboard={handleNavigateToDashboard} />;
      case 'personal_reflection':
        return <AnalysisView />;
      case 'dashboard':
        return <DashboardView key={JSON.stringify(dashboardFilters)} initialFilters={dashboardFilters} />;
      case 'corporate_survey':
        return <CorporateSurveyView />;
      case 'faq':
        return <FaqView userRole={user.role} />;
      case 'history':
        return <EvolutionView />;
      case 'plano_acao':
        return <PlanoAcaoView setActiveView={setActiveView} />;
      case 'action_tracking':
        return <PlanoAcaoHistoryView />;
      case 'campaigns':
        return <CampaignView setActiveView={setActiveView} navigateToDashboard={handleNavigateToDashboard} />;
      case 'settings':
        return <SettingsView />;
      case 'support_team':
        return <SupportTeamView />;
      default:
        if (user.role === 'collaborator') {
          return <CollaboratorHomeView setActiveView={setActiveView} />;
        }
        return <CompanyHomeView setActiveView={setActiveView} onNavigateToDashboard={handleNavigateToDashboard} />;
    }
  };
  
  if (isAuthLoading) {
    // You can replace this with a proper loading spinner component
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground]">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onNavigateToDashboard={handleNavigateToDashboard}
        userRole={user.role}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <div className={`${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'} transition-all duration-300 flex flex-col min-h-screen pb-20 md:pb-0`}>
        <Header />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>
      <BottomNavbar
        activeView={activeView}
        setActiveView={setActiveView}
        onNavigateToDashboard={handleNavigateToDashboard}
        userRole={user.role}
      />
    </div>
  );
};

export default App;
