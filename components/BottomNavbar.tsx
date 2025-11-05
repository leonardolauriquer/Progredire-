
import React, { useState, useMemo } from 'react';
import { 
    HomeIcon, 
    ChartBarIcon, 
    PencilSquareIcon, 
    BrainIcon, 
    MenuIcon,
    PaperAirplaneIcon,
    ArrowTrendingUpIcon,
    ClipboardDocumentListIcon,
    ClipboardDocumentCheckIcon,
    QuestionMarkCircleIcon,
    CogIcon,
    XIcon,
    UserGroupIcon
} from './icons';
import { ActiveView, UserRole } from '../App';

interface BottomNavbarProps {
    activeView: ActiveView;
    setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
    onNavigateToDashboard: (filters?: Record<string, string>) => void;
    userRole: UserRole;
}

const allNavItems = [
    { name: 'Início', view: 'home', icon: HomeIcon },
    { name: 'Reflexão', view: 'personal_reflection', icon: BrainIcon },
    { name: 'Dashboard', view: 'dashboard', icon: ChartBarIcon },
    { name: 'Questionário', view: 'corporate_survey', icon: PencilSquareIcon },
    { name: 'Campanhas', view: 'campaigns', icon: PaperAirplaneIcon },
    { name: 'Evolução', view: 'history', icon: ArrowTrendingUpIcon },
    { name: 'Plano Ação', view: 'plano_acao', icon: ClipboardDocumentListIcon },
    { name: 'Acompanhar', view: 'action_tracking', icon: ClipboardDocumentCheckIcon },
    { name: 'Equipe Apoio', view: 'support_team', icon: UserGroupIcon },
    { name: 'FAQ', view: 'faq', icon: QuestionMarkCircleIcon },
    { name: 'Ajustes', view: 'settings', icon: CogIcon },
];

const companyViews: ActiveView[] = ['home', 'personal_reflection', 'dashboard', 'corporate_survey', 'campaigns', 'history', 'plano_acao', 'action_tracking', 'support_team', 'faq', 'settings'];
const collaboratorViews: ActiveView[] = ['home', 'personal_reflection', 'corporate_survey', 'support_team', 'faq', 'settings'];

const companyPrimaryViews: ActiveView[] = ['home', 'dashboard', 'campaigns', 'plano_acao'];
const collaboratorPrimaryViews: ActiveView[] = ['home', 'personal_reflection', 'corporate_survey', 'support_team'];

const NavItem: React.FC<{
    item: typeof allNavItems[0];
    isActive: boolean;
    onClick: () => void;
}> = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
            isActive ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
        }`}
    >
        <item.icon className="h-6 w-6 mb-1" />
        <span className="text-xs font-medium">{item.name}</span>
    </button>
);

const MoreMenu: React.FC<{
    onClose: () => void;
    activeView: ActiveView;
    setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
    secondaryNavigation: typeof allNavItems;
}> = ({ onClose, activeView, setActiveView, secondaryNavigation }) => {
    
    const handleNavClick = (view: ActiveView) => {
        setActiveView(view);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose}>
            <div 
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Todos os Menus</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <ul className="space-y-2">
                    {secondaryNavigation.map(item => (
                        <li key={item.view}>
                            <button
                                onClick={() => handleNavClick(item.view as ActiveView)}
                                className={`w-full flex items-center p-3 text-md font-medium rounded-lg transition-colors duration-200 ${
                                    activeView === item.view
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <item.icon className="h-6 w-6 mr-4 text-slate-500" />
                                <span>{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeView, setActiveView, onNavigateToDashboard, userRole }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { primaryNavigation, secondaryNavigation } = useMemo(() => {
        const allowedViews = userRole === 'company' ? companyViews : collaboratorViews;
        const primaryViews = userRole === 'company' ? companyPrimaryViews : collaboratorPrimaryViews;

        const primaryNav = allNavItems.filter(item => primaryViews.includes(item.view as ActiveView));
        const secondaryNav = allNavItems.filter(item => allowedViews.includes(item.view as ActiveView) && !primaryViews.includes(item.view as ActiveView));

        return { primaryNavigation: primaryNav, secondaryNavigation: secondaryNav };
    }, [userRole]);

    const isMoreMenuActive = useMemo(() => 
        secondaryNavigation.some(item => item.view === activeView),
        [activeView, secondaryNavigation]
    );

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-t-lg z-30">
                <div className="flex justify-around">
                    {primaryNavigation.map((item) => (
                        <NavItem 
                            key={item.view}
                            item={item as any}
                            isActive={activeView === item.view}
                            onClick={() => {
                                if (item.view === 'dashboard') {
                                    onNavigateToDashboard();
                                } else {
                                    setActiveView(item.view as ActiveView)
                                }
                            }}
                        />
                    ))}
                    {/* More Button */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                            isMoreMenuActive ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                        }`}
                    >
                        <MenuIcon className="h-6 w-6 mb-1" />
                        <span className="text-xs font-medium">Mais</span>
                    </button>
                </div>
            </nav>
            {isMenuOpen && (
                <MoreMenu 
                    onClose={() => setIsMenuOpen(false)}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    secondaryNavigation={secondaryNavigation}
                />
            )}
        </>
    );
};
