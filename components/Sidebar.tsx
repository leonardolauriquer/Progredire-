
import React from 'react';
import { LogoIcon, PencilSquareIcon, CogIcon, ChartBarIcon, HomeIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon, BrainIcon } from './icons';
// FIX: Import ActiveView from App to ensure type consistency across components.
import { ActiveView } from '../App';

// FIX: Removed local ActiveView type definition which was inconsistent with the main app type.
// type ActiveView = 'home' | 'dashboard' | 'analysis' | 'corporate_survey' | 'history' | 'settings' | 'faq';

interface SidebarProps {
  activeView: ActiveView;
  // FIX: Updated prop type to match React.Dispatch<React.SetStateAction<...>> for compatibility with useState setter.
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
}

const navigation = [
  { name: 'Início', view: 'home', icon: HomeIcon },
  { name: 'Reflexão Pessoal', view: 'personal_reflection', icon: BrainIcon },
  { name: 'Dashboard', view: 'dashboard', icon: ChartBarIcon },
  { name: 'Diagnóstico Corp.', view: 'corporate_survey', icon: PencilSquareIcon },
  { name: 'Evolução', view: 'history', icon: ArrowTrendingUpIcon },
  { name: 'Plano de Ação', view: 'plano_acao', icon: ClipboardDocumentListIcon },
  { name: 'FAQ', view: 'faq', icon: QuestionMarkCircleIcon },
  { name: 'Configurações', view: 'settings', icon: CogIcon },
];

const NavItem: React.FC<{
  item: typeof navigation[0];
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

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
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
        <nav className="flex-1 px-4 py-4">
            <ul className="space-y-1">
                {navigation.map((item) => (
                <NavItem
                    key={item.name}
                    item={item as any}
                    isActive={activeView === item.view}
                    onClick={() => handleNavClick(item.view as ActiveView)}
                />
                ))}
            </ul>
        </nav>
    </aside>
  );
};