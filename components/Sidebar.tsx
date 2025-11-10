
import React, { useMemo } from 'react';
import { LogoIcon, PencilSquareIcon, CogIcon, ChartBarIcon, HomeIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon, BrainIcon, ClipboardDocumentCheckIcon, PaperAirplaneIcon, UserGroupIcon, ArrowLeftOnRectangleIcon, ChevronDoubleLeftIcon, LightBulbIcon, ChatBubbleOvalLeftEllipsisIcon, BookOpenIcon, ShieldCheckIcon, ArchiveBoxIcon } from './icons';
import { ActiveView, UserRole } from '../App';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onNavigateToDashboard: (filters?: Record<string, string>) => void;
  userRole: UserRole;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const allNavigation = [
  { name: 'Início', view: 'home', icon: HomeIcon },
  { name: 'Painel Staff', view: 'staff_dashboard', icon: ShieldCheckIcon },
  { name: 'Assistente IA', view: 'assistant', icon: ChatBubbleOvalLeftEllipsisIcon },
  { name: 'Reflexão Pessoal', view: 'personal_reflection', icon: BrainIcon },
  { name: 'Diário de Emoções', view: 'journal', icon: BookOpenIcon },
  { name: 'Dashboard', view: 'dashboard', icon: ChartBarIcon },
  { name: 'Questionário Psicossocial', view: 'corporate_survey', icon: PencilSquareIcon },
  { name: 'Campanhas', view: 'campaigns', icon: PaperAirplaneIcon },
  { name: 'Evolução', view: 'history', icon: ArrowTrendingUpIcon },
  { name: 'Plano de Ação', view: 'plano_acao', icon: ClipboardDocumentListIcon },
  { name: 'Acompanhamento', view: 'action_tracking', icon: ClipboardDocumentCheckIcon },
  { name: 'Documentação', view: 'documentation', icon: ArchiveBoxIcon },
  { name: 'Iniciativas', view: 'initiatives', icon: LightBulbIcon },
  { name: 'Equipe de Apoio', view: 'support_team', icon: UserGroupIcon },
  { name: 'FAQ', view: 'faq', icon: QuestionMarkCircleIcon },
  { name: 'Configurações', view: 'settings', icon: CogIcon },
];

const companyViews: ActiveView[] = ['home', 'assistant', 'dashboard', 'campaigns', 'history', 'plano_acao', 'action_tracking', 'documentation', 'support_team', 'faq', 'settings'];
const collaboratorViews: ActiveView[] = ['home', 'personal_reflection', 'corporate_survey', 'history', 'journal', 'initiatives', 'support_team', 'faq', 'settings'];
const staffViews: ActiveView[] = ['staff_dashboard', 'settings', 'faq'];

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

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeView, 
    setActiveView, 
    onNavigateToDashboard, 
    userRole, 
    onLogout, 
    isCollapsed, 
    onToggleCollapse,
    isMobileOpen,
    onMobileClose
}) => {
  
  const navigation = useMemo(() => {
    const allowedViews = 
        userRole === 'company' ? companyViews : 
        userRole === 'collaborator' ? collaboratorViews : 
        staffViews;
    return allNavigation.filter(item => allowedViews.includes(item.view as ActiveView));
  }, [userRole]);
  
  const handleNavClick = (view: ActiveView) => {
    if (view === 'dashboard') {
        onNavigateToDashboard();
    } else {
        setActiveView(view);
    }
  };

  const SidebarContent: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
    const collapsed = !isMobile && isCollapsed;
    
    return (
        <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className={`flex items-center h-16 px-4 border-b border-slate-200 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
                <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
                    <LogoIcon className="h-8 w-8 text-blue-600" />
                    {!collapsed && (
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
                        isCollapsed={collapsed}
                        onClick={() => handleNavClick(item.view as ActiveView)}
                    />
                    ))}
                </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className="px-4 py-4 border-t border-slate-200 flex-shrink-0">
                <ul className="space-y-1">
                    {!isMobile && (
                        <li>
                            <button
                                onClick={onToggleCollapse}
                                title={collapsed ? "Expandir" : "Minimizar"}
                                className={`w-full flex items-center py-2.5 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 ${collapsed ? 'justify-center' : 'px-3'}`}
                            >
                                <ChevronDoubleLeftIcon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''} ${!collapsed ? 'mr-3' : ''}`} />
                                {!collapsed && <span>Minimizar</span>}
                            </button>
                        </li>
                    )}
                    <li>
                        <button
                            onClick={onLogout}
                            title="Sair"
                            className={`w-full flex items-center py-2.5 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 ${collapsed ? 'justify-center' : 'px-3'}`}
                        >
                            <ArrowLeftOnRectangleIcon className={`h-5 w-5 shrink-0 ${!collapsed ? 'mr-3' : ''}`} />
                            {!collapsed && <span>Sair</span>}
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
  };

  return (
    <>
        {/* Backdrop for mobile */}
        <div 
            className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onMobileClose}
            aria-hidden="true"
        />
        
        {/* Sidebar */}
        <aside
            className={`
                fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 flex flex-col 
                w-64 transition-transform duration-300 ease-in-out 
                md:w-auto md:transition-all md:duration-300 md:translate-x-0
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isCollapsed ? 'md:w-20' : 'md:w-64'}
            `}
        >
            <div className="md:hidden"><SidebarContent isMobile={true} /></div>
            <div className="hidden md:flex flex-col h-full"><SidebarContent /></div>
        </aside>
    </>
  );
};
