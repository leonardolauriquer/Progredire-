
import React from 'react';
import { UserRole } from '../App';
import { ArrowLeftOnRectangleIcon } from './icons';

interface ImpersonationBannerProps {
    impersonatedRole: UserRole;
    onStopImpersonation: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ impersonatedRole, onStopImpersonation }) => {
    const roleText = impersonatedRole === 'company' ? 'Empresa' : 'Colaborador';

    return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-2 h-12 flex items-center justify-center z-50 shadow-lg">
            <div className="flex items-center gap-4 text-sm font-semibold">
                <span>
                    Você está visualizando como um(a) <strong>{roleText}</strong>.
                </span>
                <button
                    onClick={onStopImpersonation}
                    className="flex items-center gap-1.5 px-3 py-1 bg-yellow-800 text-white rounded-md hover:bg-yellow-900 transition-colors text-xs"
                >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                    Voltar ao Painel de Staff
                </button>
            </div>
        </div>
    );
};
