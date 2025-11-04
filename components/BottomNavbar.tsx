
import React from 'react';
import { HomeIcon, ChartBarIcon, PencilSquareIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon } from './icons';
import { ActiveView } from '../App';

interface BottomNavbarProps {
    activeView: ActiveView;
    // FIX: Updated prop type to match React.Dispatch<React.SetStateAction<...>> for compatibility with useState setter.
    setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
}

const navigation = [
    { name: 'Início', view: 'home', icon: HomeIcon },
    { name: 'Dashboard', view: 'dashboard', icon: ChartBarIcon },
    { name: 'Análise', view: 'corporate_survey', icon: PencilSquareIcon },
    { name: 'Evolução', view: 'history', icon: ArrowTrendingUpIcon },
    { name: 'FAQ', view: 'faq', icon: QuestionMarkCircleIcon },
];

const NavItem: React.FC<{
    item: typeof navigation[0];
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

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeView, setActiveView }) => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-t-lg z-30">
            <div className="flex justify-around">
                {navigation.map((item) => (
                    <NavItem 
                        key={item.view}
                        item={item as any}
                        isActive={activeView === item.view}
                        onClick={() => setActiveView(item.view as ActiveView)}
                    />
                ))}
            </div>
        </nav>
    );
};
