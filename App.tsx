

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CompanyHomeView } from './components/HomeView';
import { CorporateSurveyView } from './components/CorporateSurveyView';
import { DashboardView } from './components/DashboardView';
import { FaqView } from './components/FaqView';
import { CompanyEvolutionView } from './components/CompanyEvolutionView';
import { PlanoAcaoView } from './components/PlanoAcaoView';
import { SettingsView } from './components/SettingsView';
import { AnalysisView } from './components/AnalysisView';
import { PlanoAcaoHistoryView } from './components/PlanoAcaoHistoryView';
import { CampaignView } from './components/CampaignView';
import { SupportTeamView } from './components/SupportTeamView';
import { LoginView } from './components/LoginView';
import { CollaboratorHomeView } from './components/CollaboratorHomeView';
import { AuthData, authService } from './services/authService';
import { CollaboratorEvolutionView } from './components/CollaboratorEvolutionView';
import { InitiativesView } from './components/InitiativesView';
import { AssistantView } from './components/AssistantView';
import { Notification, generateAndFetchNotifications, markAllAsRead } from './services/notificationService';
import { JournalView } from './components/JournalView';
import { DocumentationView } from './components/DocumentationView';
import { ImpersonationBanner } from './components/ImpersonationBanner';

import { StaffDashboardView } from './components/StaffDashboardView';
import { StaffCampaignApprovalView } from './components/StaffCampaignApprovalView';
import { StaffDocumentManagementView } from './components/StaffDocumentManagementView';
import { StaffUserManagementView } from './components/StaffUserManagementView';
import { StaffImpersonationView } from './components/StaffImpersonationView';
import { StaffDataImportView } from './components/StaffDataImportView';


export type ActiveView = 
  'home' | 'personal_reflection' | 'dashboard' | 'corporate_survey' | 'history' | 
  'plano_acao' | 'settings' | 'faq' | 'action_tracking' | 'campaigns' | 'support_team' | 
  'initiatives' | 'assistant' | 'journal' | 'documentation' |
  'staff_campaign_approval' | 'staff_document_management' | 'staff_user_management' | 'staff_impersonation' | 'staff_data_import';

export type UserRole = 'company' | 'collaborator' | 'staff';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthData | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [impersonationOrigin, setImpersonationOrigin] = useState<AuthData | null>(null);
  
  // State for contextual navigation
  const [dashboardFilters, setDashboardFilters] = useState<Record<string, string> | undefined>(undefined);
  const [actionPlanContext, setActionPlanContext] = useState<{ filters: Record<string, string>; factorId: string } | null>(null);


  useEffect(() => {
    const checkAuth = () => {
      const authData = authService.getAuth();
      const originData = authService.getImpersonationOrigin();
      
      setImpersonationOrigin(originData);

      if (authData) {
        setUser(authData);
        if (authData.role === 'staff') {
            setActiveView('home'); // Default to dashboard for staff
        }
        // Generate notifications only for authenticated company users
        if (authData.role === 'company') {
            const fetchedNotifications = generateAndFetchNotifications();
            setNotifications(fetchedNotifications);
        }
      }
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (authData: AuthData) => {
    setUser(authData);
    setImpersonationOrigin(null); // Clear impersonation on normal login
    if (authData.role === 'staff') {
        setActiveView('home');
    } else {
        setActiveView('home'); // Reset to home on login for other roles
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setImpersonationOrigin(null);
  };
  
  const handleImpersonateLogin = async (role: UserRole) => {
    const newAuthData = await authService.impersonateLogin(role);
    setImpersonationOrigin(user);
    setUser(newAuthData);
    setActiveView('home');
  };
  
  const handleStopImpersonation = async () => {
    const originalAuthData = await authService.stopImpersonation();
    setImpersonationOrigin(null);
    setUser(originalAuthData);
    setActiveView('staff_impersonation');
  };

  const handleDirectNavigation = (view: ActiveView) => {
    // Clear all contexts for a clean navigation
    setDashboardFilters(undefined);
    setActionPlanContext(null);
    setActiveView(view);
  };

  const handleNavigateToDashboard = (filters?: Record<string, string>) => {
    setDashboardFilters(filters);
    setActionPlanContext(null); // Clear other context
    setActiveView('dashboard');
  };
  
  const handleNavigateToActionPlan = (context: { filters: Record<string, string>; factorId: string }) => {
    setActionPlanContext(context);
    setDashboardFilters(undefined); // Clear other context
    setActiveView('plano_acao');
  };

  const handleMarkNotificationsAsRead = () => {
    const updatedNotifications = markAllAsRead();
    setNotifications(updatedNotifications);
  };

  const handleNotificationClick = (link?: { view: ActiveView; context?: any }) => {
    if (!link) return;
    
    if (link.view === 'dashboard' && link.context) {
        handleNavigateToDashboard(link.context);
    } else if (link.view === 'plano_acao' && link.context) {
        handleNavigateToActionPlan(link.context);
    } else {
        handleDirectNavigation(link.view);
    }
  };


  const renderContent = () => {
    if (!user) return null;
    switch (activeView) {
      case 'home':
        if (user.role === 'collaborator') return <CollaboratorHomeView setActiveView={handleDirectNavigation} />;
        if (user.role === 'company') return <CompanyHomeView setActiveView={handleDirectNavigation} onNavigateToDashboard={handleNavigateToDashboard} />;
        if (user.role === 'staff') return <StaffDashboardView setActiveView={handleDirectNavigation} />;
        return null;
      // Staff Views
      case 'staff_campaign_approval':
        return user.role === 'staff' ? <StaffCampaignApprovalView /> : null;
      case 'staff_document_management':
        return user.role === 'staff' ? <StaffDocumentManagementView /> : null;
      case 'staff_user_management':
        return user.role === 'staff' ? <StaffUserManagementView /> : null;
      case 'staff_impersonation':
        return user.role === 'staff' ? <StaffImpersonationView onImpersonate={handleImpersonateLogin} /> : null;
      case 'staff_data_import':
        return user.role === 'staff' ? <StaffDataImportView /> : null;
      // Company & Collaborator Views
      case 'personal_reflection':
        return <AnalysisView />;
      case 'dashboard':
        return <DashboardView key={JSON.stringify(dashboardFilters)} initialFilters={dashboardFilters} onNavigateToActionPlan={handleNavigateToActionPlan} />;
      case 'corporate_survey':
        return <CorporateSurveyView setActiveView={handleDirectNavigation} />;
      case 'faq':
        return <FaqView userRole={user.role} />;
      case 'history':
        if (user.role === 'collaborator') {
            return <CollaboratorEvolutionView setActiveView={handleDirectNavigation} />;
        }
        return <CompanyEvolutionView />;
      case 'plano_acao':
        return <PlanoAcaoView setActiveView={handleDirectNavigation} initialContext={actionPlanContext} />;
      case 'action_tracking':
        return <PlanoAcaoHistoryView />;
      case 'campaigns':
        return <CampaignView setActiveView={handleDirectNavigation} navigateToDashboard={handleNavigateToDashboard} />;
      case 'settings':
        return <SettingsView />;
      case 'support_team':
        return <SupportTeamView />;
      case 'initiatives':
        return <InitiativesView />;
      case 'assistant':
        return <AssistantView />;
      case 'journal':
        return <JournalView />;
      case 'documentation':
        return <DocumentationView />;
      default:
        if (user.role === 'collaborator') return <CollaboratorHomeView setActiveView={handleDirectNavigation} />;
        if (user.role === 'company') return <CompanyHomeView setActiveView={handleDirectNavigation} onNavigateToDashboard={handleNavigateToDashboard} />;
        if (user.role === 'staff') return <StaffDashboardView setActiveView={handleDirectNavigation} />;
        return null;
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
      {impersonationOrigin && (
        <ImpersonationBanner 
            impersonatedRole={user.role}
            onStopImpersonation={handleStopImpersonation}
        />
      )}
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => {
            handleDirectNavigation(view);
            setIsMobileSidebarOpen(false);
        }}
        onNavigateToDashboard={(filters) => {
            handleNavigateToDashboard(filters);
            setIsMobileSidebarOpen(false);
        }}
        userRole={user.role}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className={`${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'} ${impersonationOrigin ? 'pt-12' : ''} transition-all duration-300 flex flex-col min-h-screen`}>
        <Header 
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
            notifications={notifications}
            onMarkAllRead={handleMarkNotificationsAsRead}
            onNotificationClick={handleNotificationClick}
            userRole={user.role}
        />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;