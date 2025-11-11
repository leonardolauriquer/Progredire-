import React, { useState, useEffect, useMemo } from 'react';
import { ArchiveBoxIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from './icons';

// --- Types ---
type ActionStatus = 'A Fazer' | 'Em Andamento' | 'Concluído';
type ActionItem = {
    id: number;
    title: string;
    description: string;
    responsible?: string;
    dueDate?: string;
};

interface ArchivedPlan {
  id: number;
  date: string;
  factor: string;
  segment: string;
  progress: number;
  plan: any; // Simplified for this view
  statuses: Record<number, ActionStatus>;
  actions: ActionItem[];
}

const LOCAL_STORAGE_KEY = 'progredire-action-plan-history';

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
                h3 { font-size: 1.1rem; font-weight: bold; }
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

const KPICard: React.FC<{ title: string; value: string | number; description?: string; colorClass?: string }> = ({ title, value, description, colorClass = "text-slate-800" }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
);


// --- Main Component ---
export const PlanoAcaoHistoryView: React.FC = () => {
    const [archivedPlans, setArchivedPlans] = useState<ArchivedPlan[]>([]);
    const [filterStatus, setFilterStatus] = useState<ActionStatus | 'Todos'>('Todos');
    const [filterResponsible, setFilterResponsible] = useState<string>('Todos');

    useEffect(() => {
        try {
            const storedPlans = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedPlans) {
                const parsedPlans: ArchivedPlan[] = JSON.parse(storedPlans);
                parsedPlans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setArchivedPlans(parsedPlans);
            }
        } catch (error) {
            console.error("Failed to load archived plans from localStorage", error);
        }
    }, []);

    const allActionsWithContext = useMemo(() => {
        return archivedPlans.flatMap(plan => 
            plan.actions.map(action => ({
                ...action,
                planId: plan.id,
                planFactor: plan.factor,
                planSegment: plan.segment,
                status: plan.statuses[action.id] || 'A Fazer'
            }))
        );
    }, [archivedPlans]);

    const responsibleList = useMemo(() => {
        const names = new Set(allActionsWithContext.map(a => a.responsible).filter(Boolean));
        return ['Todos', ...Array.from(names)] as string[];
    }, [allActionsWithContext]);

    const filteredActions = useMemo(() => {
        return allActionsWithContext.filter(action => {
            const statusMatch = filterStatus === 'Todos' || action.status === filterStatus;
            const responsibleMatch = filterResponsible === 'Todos' || action.responsible === filterResponsible;
            return statusMatch && responsibleMatch;
        });
    }, [allActionsWithContext, filterStatus, filterResponsible]);

    const kpiData = useMemo(() => {
        const total = allActionsWithContext.length;
        if (total === 0) return { total: 0, completed: 0, overdue: 0, progress: 0 };
        
        const completed = allActionsWithContext.filter(a => a.status === 'Concluído').length;
        const overdue = allActionsWithContext.filter(a => {
            const today = new Date();
            today.setHours(0,0,0,0);
            return a.dueDate && new Date(a.dueDate) < today && a.status !== 'Concluído';
        }).length;

        return {
            total,
            completed,
            overdue,
            progress: (completed / total) * 100
        };
    }, [allActionsWithContext]);

     const handleStatusUpdate = (planId: number, actionId: number, newStatus: ActionStatus) => {
        // Optimistic UI update
        const updatedPlans = archivedPlans.map(plan => {
            if (plan.id === planId) {
                const newStatuses = { ...plan.statuses, [actionId]: newStatus };
                const totalActions = plan.actions.length;
                const completedActions = Object.values(newStatuses).filter(s => s === 'Concluído').length;
                const newProgress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
                return { ...plan, statuses: newStatuses, progress: newProgress };
            }
            return plan;
        });
        setArchivedPlans(updatedPlans);

        // Persist to localStorage
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlans));
        } catch (error) {
            console.error("Failed to update localStorage", error);
            // Optionally revert UI change here
        }
    };
    
    const handleExportXls = () => {
        if (filteredActions.length === 0) {
            alert("Nenhuma ação para exportar com os filtros atuais.");
            return;
        }

        const headers = ['Ação', 'Plano de Ação (Fator)', 'Público-Alvo', 'Responsável', 'Prazo', 'Status'];
        
        let html = '<h1>Relatório de Acompanhamento de Ações</h1>';

        const activeFilters: Record<string, string> = {};
        if (filterStatus !== 'Todos') activeFilters['Status'] = filterStatus;
        if (filterResponsible !== 'Todos') activeFilters['Responsável'] = filterResponsible;

        if (Object.keys(activeFilters).length > 0) {
            html += '<h3>Filtros Aplicados</h3><table><tbody>';
            for (const key in activeFilters) {
                html += `<tr><td><strong>${key}</strong></td><td>${activeFilters[key]}</td></tr>`;
            }
            html += '</tbody></table>';
        }

        html += '<table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';

        filteredActions.forEach(action => {
            html += '<tr>';
            html += `<td>${action.title}</td>`;
            html += `<td>${action.planFactor}</td>`;
            html += `<td>${action.planSegment}</td>`;
            html += `<td>${action.responsible || 'N/D'}</td>`;
            html += `<td>${action.dueDate ? new Date(action.dueDate).toLocaleDateString('pt-BR') : 'N/D'}</td>`;
            html += `<td>${action.status}</td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';

        exportToExcel(html, 'acompanhamento_de_acoes_progredire');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Acompanhamento de Ações</h1>
                    <p className="text-slate-600 mt-1 max-w-3xl">
                        Monitore o progresso de todas as ações de melhoria em um único lugar.
                    </p>
                </div>
                 <button
                    onClick={handleExportXls}
                    className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Exportar (XLS)
                </button>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total de Ações" value={kpiData.total} />
                <KPICard title="% Concluídas" value={`${kpiData.progress.toFixed(0)}%`} description={`${kpiData.completed} de ${kpiData.total} ações`} />
                <KPICard title="Ações Atrasadas" value={kpiData.overdue} colorClass={kpiData.overdue > 0 ? 'text-red-500' : 'text-slate-800'} />
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium">Progresso Geral</p>
                    <div className="w-full bg-slate-200 rounded-full h-4 mt-2">
                        <div className="bg-green-500 h-4 rounded-full" style={{width: `${kpiData.progress}%`}}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {/* Filter by Status */}
                    <div>
                        <label htmlFor="filter-status" className="text-sm font-medium text-slate-700 mr-2">Status:</label>
                        <select
                            id="filter-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Todos">Todos</option>
                            <option value="A Fazer">A Fazer</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Concluído">Concluído</option>
                        </select>
                    </div>
                    {/* Filter by Responsible */}
                     <div>
                        <label htmlFor="filter-responsible" className="text-sm font-medium text-slate-700 mr-2">Responsável:</label>
                        <select
                            id="filter-responsible"
                            value={filterResponsible}
                            onChange={(e) => setFilterResponsible(e.target.value)}
                            className="p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                             {responsibleList.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {filteredActions.length > 0 ? filteredActions.map(action => {
                        const isOverdue = action.dueDate && new Date(action.dueDate) < new Date() && action.status !== 'Concluído';
                        return (
                            <div key={action.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800">{action.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Do plano: <span className="font-medium">{action.planFactor}</span> | Público: {action.planSegment}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 w-full sm:w-auto">
                                        <select
                                            value={action.status}
                                            onChange={(e) => handleStatusUpdate(action.planId, action.id, e.target.value as ActionStatus)}
                                            className={`w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 ${
                                                action.status === 'Concluído' ? 'bg-green-100 border-green-200 text-green-800' :
                                                action.status === 'Em Andamento' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' :
                                                'bg-slate-100 border-slate-200 text-slate-800'
                                            }`}
                                        >
                                            <option value="A Fazer">A Fazer</option>
                                            <option value="Em Andamento">Em Andamento</option>
                                            <option value="Concluído">Concluído</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-wrap text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200 gap-x-4 gap-y-1">
                                    <p><strong>Responsável:</strong> {action.responsible || 'N/D'}</p>
                                    <div className="flex items-center">
                                        <strong>Prazo:</strong>
                                        <span className={`ml-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                                            {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'N/D'}
                                        </span>
                                        {/* FIX: Wrap ExclamationTriangleIcon in a span to apply the 'title' attribute, resolving a TypeScript error where 'title' was passed as an invalid prop to the SVG component. This provides a tooltip for overdue actions. */}
                                        {isOverdue && <span title="Ação Atrasada"><ExclamationTriangleIcon className="w-4 h-4 ml-1 text-red-500"/></span>}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                         <div className="text-center py-10 text-slate-500">
                            <p>Nenhuma ação encontrada para os filtros selecionados.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {archivedPlans.length === 0 && (
                 <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow border border-slate-200">
                    <ArchiveBoxIcon className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
                    <p className="font-semibold">Nenhum plano de ação foi arquivado ainda.</p>
                    <p className="text-sm">Vá para a tela "Plano de Ação" para criar e arquivar um.</p>
                </div>
            )}
        </div>
    );
};