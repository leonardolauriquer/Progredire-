import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BellIcon, MenuIcon, LogoIcon } from './icons';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Notification } from '../services/notificationService';
import { ActiveView, UserRole } from '../App';

interface HeaderProps {
    onToggleMobileSidebar: () => void;
    notifications: Notification[];
    onMarkAllRead: () => void;
    onNotificationClick: (link?: { view: ActiveView; context?: any }) => void;
    userRole: UserRole;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, notifications, onMarkAllRead, onNotificationClick, userRole }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-20 border-b border-slate-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Hamburger menu button - visible on mobile */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={onToggleMobileSidebar}
                            className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
                            aria-label="Abrir menu"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Spacer for desktop to push content to the right */}
                    <div className="hidden md:flex flex-1"></div>
                    
                    {/* Mobile Logo */}
                    <div className="md:hidden flex-shrink-0 flex items-center">
                        <LogoIcon className="h-8 w-8 text-blue-600" />
                         <span className="text-xl font-bold text-slate-800 ml-2">
                            Progredire<span className="text-blue-600">+</span>
                        </span>
                    </div>

                    {/* Right-aligned items */}
                    <div className="flex items-center justify-end flex-1 md:flex-none">
                        {userRole === 'company' && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                    className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    aria-label="Notificações"
                                >
                                    <BellIcon className="h-6 w-6" />
                                    {hasUnread && (
                                        <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                    )}
                                </button>
                                {isDropdownOpen && (
                                    <NotificationsDropdown 
                                        notifications={notifications}
                                        onMarkAllRead={onMarkAllRead}
                                        onNotificationClick={onNotificationClick}
                                        onClose={() => setIsDropdownOpen(false)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};