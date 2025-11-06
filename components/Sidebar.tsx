

import React, { useMemo } from 'react';
import { LogoIcon, PencilSquareIcon, CogIcon, ChartBarIcon, HomeIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon, BrainIcon, ClipboardDocumentCheckIcon, PaperAirplaneIcon, UserGroupIcon, ArrowLeftOnRectangleIcon, ChevronDoubleLeftIcon } from './icons';
import { ActiveView, UserRole } from '../App';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  onNavigateToDashboard: (filters?: Record<string, string>) => void;
  userRole: UserRole;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
  isCollapsed: boolean;
}> = ({ item, isActive, onClick, isCollapsed }) => (
  <li>
    <button
      onClick={onClick}
      title={isCollapsed ? item.name : undefined}
      className={`w-full flex items-center py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } ${isCollapsed ? 'justify-center' : 'px-3'}`}
    >
      <item.icon className={`h-5 w-5 shrink-0 ${!isCollapsed && 'mr-3'}`} />
      {!isCollapsed && <span>{item.name}</span>}
    </button>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onNavigateToDashboard, userRole, onLogout, isCollapsed, onToggleCollapse }) => {
  
  const navigation = useMemo(() => {
    const allowedViews = userRole === 'company' ? companyViews : collaboratorViews;
    return allNavigation.filter(item => allowedViews.includes(item.view as ActiveView));
  }, [userRole]);
  
  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-30 hidden md:flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
        {/* Sidebar Header */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-200 flex-shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <LogoIcon className="h-8 w-8 text-blue-600" />
              {!isCollapsed && (
                <span className="text-2xl font-bold text-slate-800 tracking-tight whitespace-nowrap">
                  Progredire<span className="text-blue-600">+</span>
                </span>
              )}
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
                    isCollapsed={isCollapsed}
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

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-slate-200 flex-shrink-0">
            <ul className="space-y-1">
                <li>
                    <button
                        onClick={onToggleCollapse}
                        title={isCollapsed ? "Expandir" : "Minimizar"}
                        className={`w-full flex items-center py-2.5 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 ${isCollapsed ? 'justify-center' : 'px-3'}`}
                    >
                        <ChevronDoubleLeftIcon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''} ${!isCollapsed ? 'mr-3' : ''}`} />
                        {!isCollapsed && <span>Minimizar</span>}
                    </button>
                </li>
                <li>
                    <button
                        onClick={onLogout}
                        title="Sair"
                        className={`w-full flex items-center py-2.5 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 ${isCollapsed ? 'justify-center' : 'px-3'}`}
                    >
                        <ArrowLeftOnRectangleIcon className={`h-5 w-5 shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </li>
            </ul>
        </div>
    </aside>
  );
};