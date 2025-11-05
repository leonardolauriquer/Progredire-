
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownTrayIcon, ClipboardDocumentCheckIcon } from './icons';

// --- Types ---
type ActionStatus = 'A Fazer' | 'Em Andamento' | 'Concluído';

interface TrackedAction {
  id: number;
  actionTitle: string;
  responsible: string;
  planFactor: string;
  status: ActionStatus;
}

const initialActions: TrackedAction[] = [
    { id: 1, actionTitle: "Revisar distribuição de tarefas da equipe de Engenharia", responsible: "Ana Silva (Líder Eng.)", planFactor: "Carga de Trabalho", status: "Em Andamento" },
    { id: 2, actionTitle: "Implementar política de 'dia sem reuniões internas'", responsible: "Carlos Souza (Gerente)", planFactor: "Carga de Trabalho", status: "A Fazer" },
    { id: 3, actionTitle: "Criar programa de reconhecimento de performance trimestral", responsible: "Beatriz Lima (RH)", planFactor: "Reconhecimento e Recompensas", status: "Concluído" },
    { id: 4, actionTitle: "Agendar happy hours mensais para integração", responsible: "Equipe de Gestores", planFactor: "Relacionamentos e Suporte Social", status: "A Fazer" },
    { id: 5, actionTitle: "Mapear e documentar responsabilidades do time de Marketing", responsible: "João Pereira (Líder Mkt)", planFactor: "Clareza de Papéis", status: "Em Andamento" },
    { id: 6, actionTitle: "Conduzir pesquisa de pulso sobre Liderança", responsible: "Beatriz Lima (RH)", planFactor: "Liderança e Comunicação", status: "Concluído" },
];

const LOCAL_STORAGE_KEY = 'progredire-tracked-actions';

// --- Helper Functions ---
const exportToExcel = (htmlContent: string, filename: string) => {
    const template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                <x:Name>Acoes</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
            <style>
                table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
                td, th { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
            </style>
        </head>
        <body>${htmlContent}</body>
        </html>`;
    const blob = new Blob([`\uFEFF${template}`], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Main Component ---
export const PlanoAcaoHistoryView: React.FC = () => {
    const [actions, setActions] = useState<TrackedAction[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('Todos');
    const [responsibleFilter, setResponsibleFilter] = useState<string>('Todos');

    useEffect(() => {
        try {
            const storedActions = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedActions) {
                setActions(JSON.parse(storedActions));
            } else {
                setActions(initialActions);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialActions));
            }
        } catch (error) {
            console.error("Failed to load actions from localStorage", error);
            setActions(initialActions);
        }
    }, []);

    const responsibleOptions = useMemo(() => {
        const uniqueResponsibles = [...new Set(actions.map(a => a.responsible))];
        return ['Todos', ...uniqueResponsibles];
    }, [actions]);

    const filteredActions = useMemo(() => {
        return actions.filter(action => {
            const statusMatch = statusFilter === 'Todos' || action.status === statusFilter;
            const responsibleMatch = responsibleFilter === 'Todos' || action.responsible === responsibleFilter;
            return statusMatch && responsibleMatch;
        });
    }, [actions, statusFilter, responsibleFilter]);

    const handleStatusChange = (id: number, newStatus: ActionStatus) => {
        const updatedActions = actions.map(action => 
            action.id === id ? { ...action, status: newStatus } : action
        );
        setActions(updatedActions);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedActions));
    };

    const handleExport = () => {
        let table = `<table><thead><tr><th>Ação</th><th>Responsável</th><th>Fator de Risco</th><th>Status</th></tr></thead><tbody>`;
        filteredActions.forEach(action => {
            table += `<tr><td>${action.actionTitle}</td><td>${action.responsible}</td><td>${action.planFactor}</td><td>${action.status}</td></tr>`;
        });
        table += `</tbody></table>`;
        exportToExcel(table, 'Acompanhamento_de_Acoes');
    };

    const getStatusColor = (status: ActionStatus) => {
        switch (status) {
            case 'A Fazer': return 'bg-slate-200 text-slate-800';
            case 'Em Andamento': return 'bg-blue-100 text-blue-800';
            case 'Concluído': return 'bg-green-100 text-green-800';
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Acompanhamento de Ações</h1>
                <p className="text-slate-600 mt-1 max-w-3xl">
                    Centralize e gerencie todas as ações em andamento na organização.
                </p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200">
                {/* Filters and Export */}
                <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Status</label>
                            <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                <option>Todos</option>
                                <option>A Fazer</option>
                                <option>Em Andamento</option>
                                <option>Concluído</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="responsible-filter" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Responsável</label>
                            <select id="responsible-filter" value={responsibleFilter} onChange={e => setResponsibleFilter(e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                {responsibleOptions.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                     <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Exportar (XLS)
                    </button>
                </div>
                
                {/* Actions Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ação</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsável</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fator de Risco</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredActions.length > 0 ? filteredActions.map(action => (
                                <tr key={action.id}>
                                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-slate-900">{action.actionTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{action.responsible}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{action.planFactor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select 
                                            value={action.status}
                                            onChange={(e) => handleStatusChange(action.id, e.target.value as ActionStatus)}
                                            className={`p-1.5 rounded-md text-xs font-medium border-transparent focus:ring-2 focus:ring-blue-500 ${getStatusColor(action.status)}`}
                                        >
                                            <option>A Fazer</option>
                                            <option>Em Andamento</option>
                                            <option>Concluído</option>
                                        </select>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-500">
                                        <ClipboardDocumentCheckIcon className="w-10 h-10 mx-auto text-slate-300 mb-2"/>
                                        Nenhuma ação encontrada com os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};