
import React, { useMemo } from 'react';
import { LogoIcon, PencilSquareIcon, CogIcon, ChartBarIcon, HomeIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon, BrainIcon, ClipboardDocumentCheckIcon, PaperAirplaneIcon, UserGroupIcon, ArrowLeftOnRectangleIcon } from './icons';
import { ActiveView, UserRole } from '../App';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  onNavigateToDashboard: (filters?: Record<string, string>) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const allNavigation = [
  { name: 'Início', view: 'home', icon: HomeIcon },
  { name: 'Reflexão Pessoal', view: 'personal_reflection', icon: BrainIcon },
  { name: 'Dashboard', view: 'dashboard', icon: ChartBarIcon },
  { name: 'Questionário Psicossocial', view: 'corporate_survey', icon: PencilSquareIcon },
  { name: 'Campanhas', view: 'campaigns', icon: PaperAirplaneIcon },
  { name: 'Evolução', view: 'history', icon: ArrowTrendingUpIcon },
  { name: 'Plano de Ação', view: 'plano_acao', icon: ClipboardDocumentListIcon },
  { name: 'Acompanhamento', view: 'action_tracking', icon: ClipboardDocumentCheckIcon },
  { name: 'Equipe de Apoio', view: 'support_team', icon: UserGroupIcon },
  { name: 'FAQ', view: 'faq', icon: QuestionMarkCircleIcon },
  { name: 'Configurações', view: 'settings', icon: CogIcon },
];

const companyViews: ActiveView[] = ['home', 'dashboard', 'campaigns', 'history', 'plano_acao', 'action_tracking', 'support_team', 'faq', 'settings'];
const collaboratorViews: ActiveView[] = ['home', 'personal_reflection', 'corporate_survey', 'support_team', 'faq', 'settings'];

const NavItem: React.FC<{
  item: typeof allNavigation[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <item.icon className="h-5 w-5 mr-3" />
      <span>{item.name}</span>
    </button>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onNavigateToDashboard, userRole, onLogout }) => {
  
  const navigation = useMemo(() => {
    const allowedViews = userRole === 'company' ? companyViews : collaboratorViews;
    return allNavigation.filter(item => allowedViews.includes(item.view as ActiveView));
  }, [userRole]);
  
  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
  };

  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30 hidden md:flex flex-col"
    >
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
              <LogoIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800 tracking-tight">
                Progredire<span className="text-blue-600">+</span>
              </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
                {navigation.map((item) => (
                <NavItem
                    key={item.name}
                    item={item as any}
                    isActive={activeView === item.view}
                    onClick={() => {
                        if (item.view === 'dashboard') {
                            onNavigateToDashboard();
                        } else {
                            handleNavClick(item.view as ActiveView)
                        }
                    }}
                />
                ))}
            </ul>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-200 flex-shrink-0">
            <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
            >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
            <span>Sair</span>
            </button>
        </div>
    </aside>
  );
};