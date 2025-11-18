import React from 'react';
import { ActiveView } from '../App';
import { Notification } from '../services/notificationService';

const timeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} anos atrás`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} meses atrás`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} dias atrás`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} horas atrás`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutos atrás`;
    return `${Math.floor(seconds)} segundos atrás`;
};

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (link?: { view: ActiveView; context?: any }) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications, onNotificationClick, onMarkAllRead, onClose }) => {
    
    const handleItemClick = (notification: Notification) => {
        onNotificationClick(notification.link);
        onClose();
    };

    return (
        <div className="absolute top-14 right-0 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
            <div className="flex justify-between items-center p-3 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Notificações</h3>
                <button
                    onClick={onMarkAllRead}
                    className="text-xs font-medium text-blue-600 hover:underline"
                >
                    Marcar todas como lidas
                </button>
            </div>
            <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <li key={notification.id}>
                            <button
                                onClick={() => handleItemClick(notification)}
                                className="w-full text-left p-3 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    {!notification.read && (
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                    )}
                                    <div className={notification.read ? 'pl-5' : ''}>
                                        <p className="text-sm text-slate-700">{notification.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">{timeSince(notification.timestamp)}</p>
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-sm text-slate-500">
                        Nenhuma notificação nova.
                    </li>
                )}
            </ul>
        </div>
    );
};
