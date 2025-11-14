import React, { useState, useEffect } from 'react';
import { getStaffDashboardSummary } from '../services/dataService';
import { 
    BuildingOfficeIcon, 
    UserGroupIcon, 
    ClockIcon, 
    ExclamationTriangleIcon,
    ArchiveBoxIcon,
    UserIcon,
} from './icons';
import { ActiveView } from '../App';

interface StaffDashboardViewProps {
  setActiveView: (view: ActiveView) => void;
}

interface SummaryData {
    totalCompanies: number;
    totalEmployees: number;
    pendingCampaigns: number;
    docsNearExpiry: number;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-[--color-muted] p-4 rounded-lg border border-[--color-border] flex items-center gap-4">
        <div className="p-3 rounded-full bg-blue-100">
            <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
            <p className="text-sm text-[--color-card-muted-foreground] font-medium">{title}</p>
            <p className="text-2xl font-bold text-[--color-card-foreground]">{value}</p>
        </div>
    </div>
);

const ActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
    notificationCount?: number;
}> = ({ title, description, icon: Icon, onClick, notificationCount }) => (
    <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border] flex flex-col hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start">
            <Icon className="w-8 h-8 text-blue-600 mb-3" />
            {notificationCount !== undefined && notificationCount > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {notificationCount}
                </span>
            )}
        </div>
        <h3 className="text-xl font-bold text-[--color-card-foreground]">{title}</h3>
        <p className="text-[--color-card-muted-foreground] mt-2 flex-grow">{description}</p>
        <button onClick={onClick} className="mt-4 font-semibold text-blue-600 self-start">
            Acessar →
        </button>
    </div>
);


export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({ setActiveView }) => {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getStaffDashboardSummary();
            setSummary(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading || !summary) {
        return <div className="text-center p-8">Carregando painel de controle...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[--color-foreground]">Painel de Controle da Equipe Staff</h1>
                <p className="text-[--color-muted-foreground] mt-1">Visão geral e acesso rápido às ferramentas de gerenciamento.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Empresas Clientes" value={summary.totalCompanies} icon={BuildingOfficeIcon} />
                <KpiCard title="Colaboradores Totais" value={summary.totalEmployees.toLocaleString('pt-BR')} icon={UserGroupIcon} />
                <KpiCard title="Campanhas Pendentes" value={summary.pendingCampaigns} icon={ClockIcon} />
                <KpiCard title="Documentos em Alerta" value={summary.docsNearExpiry} icon={ExclamationTriangleIcon} />
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard 
                    title="Aprovação de Campanhas"
                    description="Analise e aprove novas campanhas de diagnóstico submetidas pelas empresas clientes."
                    icon={ClockIcon}
                    onClick={() => setActiveView('staff_campaign_approval')}
                    notificationCount={summary.pendingCampaigns}
                />
                <ActionCard 
                    title="Gestão de Documentos"
                    description="Monitore a validade de documentos de segurança e saúde de todas as empresas."
                    icon={ArchiveBoxIcon}
                    onClick={() => setActiveView('staff_document_management')}
                    notificationCount={summary.docsNearExpiry}
                />
                <ActionCard 
                    title="Gestão de Usuários"
                    description="Gerencie empresas, filiais e o acesso de colaboradores e usuários da empresa à plataforma."
                    icon={UserGroupIcon}
                    onClick={() => setActiveView('staff_user_management')}
                />
                <ActionCard 
                    title="Acesso Delegado"
                    description="Simule a visualização da plataforma como um usuário de cliente para testes ou suporte."
                    icon={UserIcon}
                    onClick={() => setActiveView('staff_impersonation')}
                />
            </div>
        </div>
    );
};