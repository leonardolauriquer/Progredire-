
import React, { useState } from 'react';
import { UserIcon, BuildingOfficeIcon } from '../components/icons';
import { UserRole } from '../App';

const allCompaniesList = ['InovaCorp', 'NexusTech', 'AuraDigital', 'Vértice'];

interface StaffImpersonationViewProps {
    onImpersonate: (role: UserRole) => void;
}

export const StaffImpersonationView: React.FC<StaffImpersonationViewProps> = ({ onImpersonate }) => {
    const [impersonateCompany, setImpersonateCompany] = useState('InovaCorp');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Acesso Delegado</h1>
                <p className="text-slate-600 mt-1">Simule a visualização da plataforma como um usuário de cliente.</p>
            </div>
             <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                 <h2 className="text-xl font-semibold text-[--color-card-foreground] mb-4">Acesso Delegado (Simulação)</h2>
                <div className="space-y-4 max-w-md">
                    <p className="text-sm text-[--color-card-muted-foreground]">Selecione um perfil para visualizar a plataforma como se fosse aquele tipo de usuário. Isso é útil para testar a experiência do cliente ou fornecer suporte.</p>
                    <div>
                        <label htmlFor="impersonate-company" className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                        <select id="impersonate-company" value={impersonateCompany} onChange={e => setImpersonateCompany(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                            {allCompaniesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button onClick={() => onImpersonate('company')} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-blue-700">
                            <BuildingOfficeIcon className="w-5 h-5" />
                            Acessar como Empresa
                        </button>
                         <button onClick={() => onImpersonate('collaborator')} className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-slate-700">
                            <UserIcon className="w-5 h-5" />
                            Acessar como Colaborador
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
