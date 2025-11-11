import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PlusCircleIcon, XIcon, CalendarDaysIcon, EyeIcon, ArchiveBoxIcon, ShieldCheckIcon, ArrowDownTrayIcon } from './icons';
import { mockFilters, Campaign, CampaignStatus } from './dashboardMockData';
import { getCampaigns, addCampaign, approveCampaign } from '../services/dataService';
import { ActiveView } from '../App';

interface CampaignViewProps {
    setActiveView: (view: ActiveView) => void;
    navigateToDashboard: (filters: Record<string, string>) => void;
}

const defaultEmailMessage = `Olá, [Nome do Colaborador],

Sua perspectiva é muito importante para nós!

Estamos iniciando a campanha de diagnóstico '[Nome da Campanha]' e gostaríamos de convidá-lo(a) a participar. Suas respostas, que são totalmente confidenciais, nos ajudarão a entender melhor nosso ambiente de trabalho e a criar um lugar cada vez melhor para todos.

A pesquisa estará disponível de [Data de Início] a [Data de Fim].

Para participar, basta acessar o link: [Link da Pesquisa]

Agradecemos sua colaboração!

Atenciosamente,
Equipe Progredire+`;

// --- Helper Functions ---
const exportToExcel = (htmlContent: string, filename: string) => {
    const template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Relatorio</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
            <style>
                table { border-collapse: collapse; margin-bottom: 20px; }
                td, th { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h2 { font-size: 1.2rem; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>`;

    const blob = new Blob([`\uFEFF${template}`], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


// --- Components ---
const CampaignCard: React.FC<{
    campaign: Campaign;
    onViewReport: (filters: Record<string, string>) => void;
    onTakeSurvey: () => void;
}> = ({ campaign, onViewReport, onTakeSurvey }) => {
    const getStatusStyles = (status: CampaignStatus) => {
        switch (status) {
            case 'Em Andamento': return 'bg-blue-100 text-blue-800';
            case 'Concluída': return 'bg-green-100 text-green-800';
            case 'Agendada': return 'bg-yellow-100 text-yellow-800';
            case 'Pendente': return 'bg-orange-100 text-orange-800';
        }
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow border border-slate-200 flex flex-col">
            <div className="space-y-4 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800">{campaign.name}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyles(campaign.status)}`}>{campaign.status}</span>
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Público-Alvo</p>
                    <p className="text-sm text-slate-700">{campaign.targetAudience}</p>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-slate-500 font-medium">Adesão</p>
                        <p className="text-sm text-slate-700 font-bold">{campaign.adherence}%</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${campaign.adherence}%` }}></div>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Período</p>
                    <p className="text-sm text-slate-700">{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-200">
                {campaign.status === 'Pendente' && (
                    <div className="w-full text-center">
                         <p className="text-xs text-slate-500 mt-2">Aguardando aprovação da Staff para ser iniciada.</p>
                    </div>
                )}
                {campaign.status === 'Agendada' && (
                     <>
                        <button onClick={onTakeSurvey} className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300">Responder Pesquisa</button>
                        <button onClick={() => onViewReport(campaign.filters)} className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300">
                            <EyeIcon className="w-4 h-4"/> Ver Relatório
                        </button>
                    </>
                )}
                {campaign.status === 'Em Andamento' && (
                    <>
                        <button className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md">Enviar Lembrete</button>
                        <button onClick={onTakeSurvey} className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300">Responder Pesquisa</button>
                        <button onClick={() => onViewReport(campaign.filters)} className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300"><EyeIcon className="w-4 h-4"/> Ver Relatório</button>
                        <button className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-md">Encerrar Campanha</button>
                    </>
                )}
                {campaign.status === 'Concluída' && (
                     <button onClick={() => onViewReport(campaign.filters)} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300">
                        <EyeIcon className="w-4 h-4"/> Ver Relatório
                    </button>
                )}
            </div>
        </div>
    );
};

const CreateCampaignModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddCampaign: (campaign: Partial<Campaign>) => void;
}> = ({ isOpen, onClose, onAddCampaign }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
        name: '', description: '', filters: {}, startDate: '', endDate: '', emailMessage: defaultEmailMessage
    });

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    const handleInputChange = (field: keyof Campaign, value: any) => {
        setCampaignData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleFilterChange = (id: string, value: string) => {
        const newFilters = { ...campaignData.filters, [id]: value };
        if (!value) delete newFilters[id];
        
        const targetAudience = Object.entries(newFilters)
            .map(([, val]) => val)
            .filter(Boolean)
            .join(', ') || 'Toda a empresa';

        setCampaignData(prev => ({...prev, filters: newFilters, targetAudience }));
    };

    const handleCreate = () => {
        onAddCampaign(campaignData);
        onClose();
        setCurrentStep(1);
        setCampaignData({ name: '', description: '', filters: {}, startDate: '', endDate: '', emailMessage: defaultEmailMessage });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[--color-card] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-[--color-border]">
                    <h2 className="text-xl font-bold text-[--color-card-foreground]">Criar Nova Campanha</h2>
                    <button onClick={onClose} className="text-[--color-card-muted-foreground] hover:text-[--color-card-foreground]"><XIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-[--color-card-foreground]">Passo 1: Definição</h3>
                            <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-md border border-blue-200">
                                Nota: Esta campanha aplicará o 'Questionário Psicossocial' a todos os participantes selecionados.
                            </p>
                            <div>
                                <label htmlFor="c-name" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Nome da Campanha</label>
                                <input type="text" id="c-name" value={campaignData.name || ''} onChange={e => handleInputChange('name', e.target.value)} placeholder="Ex: Diagnóstico Anual de Clima" className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                            </div>
                            <div>
                                <label htmlFor="c-desc" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Descrição</label>
                                <textarea id="c-desc" value={campaignData.description || ''} onChange={e => handleInputChange('description', e.target.value)} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md h-24 focus:ring-2 focus:ring-[--color-ring]" placeholder="Um breve resumo sobre o objetivo desta campanha."></textarea>
                            </div>
                        </div>
                    )}
                     {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-[--color-card-foreground]">Passo 2: Público-Alvo</h3>
                            <p className="text-sm text-[--color-card-muted-foreground]">Selecione para quem o diagnóstico será aplicado. Deixe em branco para aplicar a todos.</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mockFilters.map(f => (
                                    <div key={f.id}>
                                        <label htmlFor={`cf-${f.id}`} className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">{f.label}</label>
                                        <select id={`cf-${f.id}`} value={campaignData.filters?.[f.id] || ''} onChange={e => handleFilterChange(f.id, e.target.value)} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md shadow-sm focus:ring-2 focus:ring-[--color-ring]">
                                            <option value="">Todos</option>
                                            {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-[--color-muted] rounded-md mt-4">
                                <p className="text-sm font-medium text-[--color-muted-foreground]">Resumo do público: <span className="font-bold text-[--color-foreground]">{campaignData.targetAudience}</span></p>
                            </div>
                        </div>
                    )}
                     {currentStep === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-[--color-card-foreground]">Passo 3: Agendamento</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="c-start" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Data de Início</label>
                                    <input type="date" id="c-start" value={campaignData.startDate || ''} onChange={e => handleInputChange('startDate', e.target.value)} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                                </div>
                                <div>
                                    <label htmlFor="c-end" className="block text-sm font-medium text-[--color-card-muted-foreground] mb-1">Data de Fim</label>
                                    <input type="date" id="c-end" value={campaignData.endDate || ''} onChange={e => handleInputChange('endDate', e.target.value)} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md focus:ring-2 focus:ring-[--color-ring]"/>
                                </div>
                             </div>
                        </div>
                    )}
                     {currentStep === 4 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-[--color-card-foreground]">Passo 4: Mensagem de Convite</h3>
                            <p className="text-sm text-[--color-card-muted-foreground]">Personalize a mensagem que será enviada aos colaboradores.</p>
                             <div>
                                <label htmlFor="c-msg" className="sr-only">Mensagem</label>
                                <textarea id="c-msg" value={campaignData.emailMessage || ''} onChange={e => handleInputChange('emailMessage', e.target.value)} className="w-full p-2 bg-[--color-input] border border-[--color-border] text-[--color-foreground] rounded-md h-48 font-mono text-xs focus:ring-2 focus:ring-[--color-ring]"></textarea>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-4 border-t border-[--color-border] bg-[--color-muted] rounded-b-2xl">
                    <button onClick={handleBack} disabled={currentStep === 1} className="px-4 py-2 text-sm font-semibold text-[--color-card-foreground] bg-[--color-card] border border-[--color-border] rounded-md disabled:opacity-50">Voltar</button>
                    {currentStep < 4 ? (
                        <button onClick={handleNext} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Próximo</button>
                    ) : (
                        <button onClick={handleCreate} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Lançar Campanha</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CampaignView: React.FC<CampaignViewProps> = ({ setActiveView, navigateToDashboard }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        getCampaigns().then(setCampaigns);
    }, []);

    const handleAddCampaign = useCallback((campaignData: Partial<Campaign>) => {
        addCampaign(campaignData).then(setCampaigns);
    }, []);

    const { activeCampaigns, completedCampaigns } = useMemo(() => {
        const active: Campaign[] = [];
        const completed: Campaign[] = [];
        campaigns.forEach(c => {
            if (c.status === 'Concluída') {
                completed.push(c);
            } else {
                active.push(c);
            }
        });
        return { activeCampaigns: active, completedCampaigns: completed };
    }, [campaigns]);
    
    const handleExportXls = useCallback(() => {
        if (campaigns.length === 0) {
            alert("Nenhuma campanha para exportar.");
            return;
        }

        const headers = ['Nome da Campanha', 'Status', 'Público-Alvo', 'Adesão (%)', 'Data de Início', 'Data de Fim'];
        
        const createTable = (title: string, data: Campaign[]) => {
            let table = `<h2>${title}</h2><table><thead><tr>`;
            headers.forEach(h => table += `<th>${h}</th>`);
            table += '</tr></thead><tbody>';

            data.forEach(c => {
                table += '<tr>';
                table += `<td>${c.name}</td>`;
                table += `<td>${c.status}</td>`;
                table += `<td>${c.targetAudience}</td>`;
                table += `<td>${c.adherence}</td>`;
                table += `<td>${new Date(c.startDate).toLocaleDateString('pt-BR')}</td>`;
                table += `<td>${new Date(c.endDate).toLocaleDateString('pt-BR')}</td>`;
                table += '</tr>';
            });

            table += '</tbody></table>';
            return table;
        };
        
        let html = '<h1>Relatório de Campanhas</h1>';
        html += createTable('Campanhas Ativas e Agendadas', activeCampaigns);
        html += createTable('Histórico de Campanhas', completedCampaigns);

        exportToExcel(html, 'relatorio_de_campanhas_progredire');

    }, [campaigns, activeCampaigns, completedCampaigns]);

    return (
        <div className="space-y-8">
             <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Campanhas de Diagnóstico</h1>
                    <p className="text-slate-600 mt-1 max-w-3xl">
                        Crie, gerencie e acompanhe o andamento das suas pesquisas de clima e saúde organizacional.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExportXls}
                        className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Exportar (XLS)
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                        <PlusCircleIcon className="w-5 h-5"/>
                        Criar Nova Campanha
                    </button>
                </div>
            </div>

            {/* Active and Scheduled Campaigns */}
            <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Campanhas Ativas e Agendadas</h2>
                {activeCampaigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCampaigns.map(campaign => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onViewReport={navigateToDashboard}
                                onTakeSurvey={() => setActiveView('corporate_survey')}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <p className="text-slate-500">Nenhuma campanha ativa no momento.</p>
                        <p className="text-sm text-slate-400 mt-1">Clique em "Criar Nova Campanha" para começar.</p>
                    </div>
                )}
            </section>
            
            {/* Completed Campaigns History */}
            <section>
                 <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                    <ArchiveBoxIcon className="w-7 h-7 text-slate-600" />
                    Histórico de Campanhas
                </h2>
                {completedCampaigns.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedCampaigns.map(campaign => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onViewReport={navigateToDashboard}
                                onTakeSurvey={() => setActiveView('corporate_survey')}
                            />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Nenhuma campanha foi concluída ainda.</p>
                    </div>
                )}
            </section>
            
            <CreateCampaignModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddCampaign={handleAddCampaign}
            />

        </div>
    );
};