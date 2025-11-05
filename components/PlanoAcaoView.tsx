import React, { useState, useMemo, useCallback } from 'react';
import { mockResponses, dimensions, mockFilters } from './dashboardMockData';
import { runActionPlanGeneration } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowDownTrayIcon, BrainIcon, MagnifyingGlassIcon, FlagIcon, LightBulbIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon, PlusCircleIcon, PencilIcon, TrashIcon } from './icons';
import { ActiveView } from '../App';

// --- Types & Data ---

type RiskFactor = { id: string; name: string; score: number };
type ActionStatus = 'A Fazer' | 'Em Andamento' | 'Concluído';
type ActionItem = { id: number; title: string; description: string };
interface GeneratedPlan {
    diagnosis: { title: string; content: string };
    strategicObjective: { title: string; content: string };
    suggestedActions: { title: string; actions: { actionTitle: string; actionDescription: string }[] };
    kpis: { title: string; indicators: string[] };
}
interface PlanoAcaoViewProps {
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
}

const likertToScore: Record<string, string> = {
  'Discordo totalmente': '1', 'Discordo parcialmente': '2', 'Neutro / Indiferente': '3', 'Concordo parcialmente': '4', 'Concordo totalmente': '5',
};
const allDimensionIds = Object.keys(dimensions);

// --- Helper Functions ---

const calculateDataForResponses = (responses: typeof mockResponses) => {
    if (responses.length === 0) {
        return { riskFactors: allDimensionIds.map(id => ({ id, name: dimensions[id].name, score: 0 })) };
    }
    const totalDimensionScores: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};
    responses.forEach(r => {
        allDimensionIds.forEach(dimId => {
            const dimQuestions = dimensions[dimId].questions;
            let totalScoreForDim = 0; let questionCountForDim = 0;
            dimQuestions.forEach(qId => {
                const answer = r.answers[qId];
                if (answer) {
                    totalScoreForDim += parseInt(likertToScore[answer]) || 0;
                    questionCountForDim++;
                }
            });
            if (questionCountForDim > 0) {
                totalDimensionScores[dimId] = (totalDimensionScores[dimId] || 0) + (totalScoreForDim / questionCountForDim);
                dimensionCounts[dimId] = (dimensionCounts[dimId] || 0) + 1;
            }
        });
    });
    const riskFactors: RiskFactor[] = allDimensionIds.map(id => {
        const averageScore = (totalDimensionScores[id] || 0) / (dimensionCounts[id] || 1);
        return { id, name: dimensions[id].name, score: Math.round((averageScore - 1) / 4 * 100) };
    });
    return { riskFactors };
};

const exportToExcel = (htmlContent: string, filename: string) => {
    const template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                <x:Name>Plano</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
            <style>
                table { border-collapse: collapse; margin-bottom: 20px; width: 100%; }
                td, th { border: 1px solid #dee2e6; padding: 8px; text-align: left; vertical-align: top; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h2 { font-size: 1.2rem; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
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
export const PlanoAcaoView: React.FC<PlanoAcaoViewProps> = ({ setActiveView }) => {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedFactorId, setSelectedFactorId] = useState<string>('');
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
    const [currentActions, setCurrentActions] = useState<ActionItem[]>([]);
    const [actionStatuses, setActionStatuses] = useState<Record<number, ActionStatus>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingAction, setEditingAction] = useState<ActionItem | null>(null);

    const criticalFactors = useMemo(() => {
        const filteredResponses = mockResponses.filter(r => 
            Object.entries(filters).every(([key, value]) => !value || r.segmentation[key] === value)
        );
        if (filteredResponses.length === 0) return [];
        const { riskFactors } = calculateDataForResponses(filteredResponses);
        return [...riskFactors].sort((a, b) => a.score - b.score).slice(0, 5);
    }, [filters]);

    const progress = useMemo(() => {
        const totalActions = currentActions.length;
        if (totalActions === 0) return 0;
        const completedActions = Object.values(actionStatuses).filter(s => s === 'Concluído').length;
        return (completedActions / totalActions) * 100;
    }, [actionStatuses, currentActions]);

    const handleFilterChange = (id: string, value: string) => {
        setFilters(prev => ({ ...prev, [id]: value }));
        setSelectedFactorId('');
        setGeneratedPlan(null);
        setCurrentActions([]);
        setActionStatuses({});
        setError(null);
    };

    const handleFactorSelect = (factorId: string) => {
        setSelectedFactorId(factorId);
        setGeneratedPlan(null);
        setCurrentActions([]);
        setActionStatuses({});
        setError(null);
    };

    const handleGenerateSuggestions = useCallback(async () => {
        if (!selectedFactorId) return;
        setIsLoading(true);
        setError(null);
        
        const factorName = dimensions[selectedFactorId]?.name || 'Fator Desconhecido';
        const segmentDescription = Object.entries(filters)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') || 'Toda a empresa';

        try {
            const resultString = await runActionPlanGeneration(factorName, segmentDescription);
            const plan: GeneratedPlan = JSON.parse(resultString);
            setGeneratedPlan(plan);
            const newActions: ActionItem[] = plan.suggestedActions.actions.map((a, i) => ({
                id: Date.now() + i,
                title: a.actionTitle,
                description: a.actionDescription,
            }));
            setCurrentActions(prev => [...prev, ...newActions]);
            const newStatuses: Record<number, ActionStatus> = {};
            newActions.forEach(action => {
                newStatuses[action.id] = 'A Fazer';
            });
            setActionStatuses(prev => ({...prev, ...newStatuses}));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFactorId, filters]);
    
    const handleAddOrUpdateAction = (action: {title: string, description: string}) => {
        if (editingAction && 'id' in editingAction && editingAction.id) { // Update
            setCurrentActions(prev => prev.map(a => a.id === editingAction.id ? {...a, ...action} : a));
        } else { // Add
            const newAction: ActionItem = { id: Date.now(), ...action };
            setCurrentActions(prev => [...prev, newAction]);
            setActionStatuses(prev => ({...prev, [newAction.id]: 'A Fazer'}));
        }
        setEditingAction(null);
    };

    const handleDeleteAction = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta ação?')) {
            setCurrentActions(prev => prev.filter(a => a.id !== id));
            setActionStatuses(prev => {
                const newStatuses = {...prev};
                delete newStatuses[id];
                return newStatuses;
            });
        }
    };
    
    const handleStatusChange = (id: number, status: ActionStatus) => {
        setActionStatuses(prev => ({ ...prev, [id]: status }));
    };

    const handleArchivePlan = () => {
        if (currentActions.length === 0 || !window.confirm('Deseja finalizar e arquivar este plano? Você não poderá mais editá-lo.')) return;
        
        const planToArchive = generatedPlan || {
            diagnosis: { title: 'Diagnóstico da Situação', content: 'Este é um plano de ação criado manualmente, focado nas ações definidas abaixo.' },
            strategicObjective: { title: 'Objetivo Estratégico', content: `Melhorar o fator de risco "${dimensions[selectedFactorId]?.name}" para o público-alvo selecionado.` },
            suggestedActions: { title: 'Ações Sugeridas', actions: [] },
            kpis: { title: 'Indicadores de Sucesso (KPIs)', indicators: ['Execução e conclusão das ações propostas.'] },
        };

        const history = JSON.parse(localStorage.getItem('progredire-action-plan-history') || '[]');
        const archivedPlan = {
            id: Date.now(),
            date: new Date().toISOString(),
            factor: dimensions[selectedFactorId]?.name,
            segment: Object.values(filters).filter(Boolean).join(', ') || 'Toda a empresa',
            progress: progress,
            plan: {
                ...planToArchive,
                suggestedActions: {
                    ...planToArchive.suggestedActions,
                    actions: currentActions.map(a => ({ actionTitle: a.title, actionDescription: a.description }))
                }
            },
            statuses: actionStatuses,
        };
        history.push(archivedPlan);
        localStorage.setItem('progredire-action-plan-history', JSON.stringify(history));

        handleFactorSelect('');
        alert('Plano arquivado com sucesso!');
        setActiveView('action_tracking');
    };
    
    const handleExportXls = () => {
        if (currentActions.length === 0) return;

        const planData = generatedPlan || {
            diagnosis: { title: 'Diagnóstico da Situação', content: 'Plano de ação criado manualmente.' },
            strategicObjective: { title: 'Objetivo Estratégico', content: `Melhorar o fator de risco "${dimensions[selectedFactorId]?.name}".` },
            suggestedActions: { title: 'Ações Propostas', actions: [] },
            kpis: { title: 'Indicadores de Sucesso (KPIs)', indicators: ['Acompanhamento do status das ações.'] },
        };

        let html = `<h1>Plano de Ação - ${dimensions[selectedFactorId]?.name}</h1>`;
        
        html += `<h2>${planData.diagnosis.title}</h2><p>${planData.diagnosis.content}</p>`;
        html += `<h2>${planData.strategicObjective.title}</h2><p>${planData.strategicObjective.content}</p>`;

        let actionsTable = `<h2>${planData.suggestedActions.title}</h2><table><thead><tr><th>Ação</th><th>Descrição</th><th>Status</th></tr></thead><tbody>`;
        currentActions.forEach(action => {
            actionsTable += `<tr><td>${action.title}</td><td>${action.description}</td><td>${actionStatuses[action.id] || 'A Fazer'}</td></tr>`;
        });
        actionsTable += '</tbody></table>';
        html += actionsTable;

        html += `<h2>${planData.kpis.title}</h2><ul>${planData.kpis.indicators.map(i => `<li>${i}</li>`).join('')}</ul>`;
        
        exportToExcel(html, `Plano_de_Acao_${dimensions[selectedFactorId]?.name.replace(' ', '_')}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Plano de Ação com IA</h1>
                    <p className="text-slate-600 mt-1 max-w-3xl">
                        Filtre o público, selecione um fator de risco e construa um plano de ação para impulsionar a melhoria.
                    </p>
                </div>
                 <button onClick={() => setActiveView('action_tracking')} className="text-sm font-medium text-blue-600 hover:underline">Acompanhar Ações</button>
            </div>


            {/* Step 1: Filters */}
            <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                <h2 className="font-semibold text-slate-800 mb-3">Passo 1: Selecione o público-alvo</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {mockFilters.map(f => (
                        <div key={f.id}>
                            <label htmlFor={`pa-${f.id}`} className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                            <select id={`pa-${f.id}`} value={filters[f.id] || ''} onChange={e => handleFilterChange(f.id, e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos</option>
                                {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 2: Select Critical Factor */}
            {criticalFactors.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                    <h2 className="font-semibold text-slate-800 mb-3">Passo 2: Escolha o Fator Crítico para focar</h2>
                    <div className="flex flex-wrap gap-2">
                        {criticalFactors.map(factor => (
                            <button
                                key={factor.id}
                                onClick={() => handleFactorSelect(factor.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${selectedFactorId === factor.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                            >
                                {factor.name} <span className="ml-2 text-xs opacity-70">({factor.score}/100)</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Ocorreu um erro</p><p>{error}</p></div>}
            
            {/* Display Plan */}
            {selectedFactorId && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 space-y-8">
                     <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Plano para: {dimensions[selectedFactorId]?.name}</h2>
                            <p className="text-slate-500">Adicione ações manualmente ou use a IA para obter sugestões.</p>
                        </div>
                         {currentActions.length > 0 && (
                            <button onClick={handleExportXls} className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50"><ArrowDownTrayIcon className="w-5 h-5" /> Exportar XLS</button>
                         )}
                    </div>

                    {/* Progress */}
                    {currentActions.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Progresso do Plano</h3>
                            <div className="w-full bg-slate-200 rounded-full h-4">
                                <div className="bg-green-500 h-4 rounded-full text-center text-white text-xs font-bold" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}>
                                    {progress > 10 ? `${progress.toFixed(0)}%` : ''}
                                </div>
                            </div>
                        </div>
                    )}

                    {generatedPlan && (
                        <div className="space-y-6">
                            <PlanSection icon={<MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />} title={generatedPlan.diagnosis.title}><p>{generatedPlan.diagnosis.content}</p></PlanSection>
                            <PlanSection icon={<FlagIcon className="w-6 h-6 text-green-600" />} title={generatedPlan.strategicObjective.title}><p>{generatedPlan.strategicObjective.content}</p></PlanSection>
                        </div>
                    )}
                    
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                           <LightBulbIcon className="w-6 h-6 text-yellow-500 mr-3" />
                            Ações Propostas
                        </h3>
                        <div className="pl-9 space-y-4">
                            {currentActions.length > 0 ? currentActions.map(action => (
                                <div key={action.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-700">{action.title}</p>
                                            <p className="text-sm text-slate-600 mt-1 mb-3">{action.description}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 ml-2">
                                            <button onClick={() => setEditingAction(action)} className="text-slate-400 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteAction(action.id)} className="text-slate-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="font-medium text-slate-500">Status:</span>
                                        {(['A Fazer', 'Em Andamento', 'Concluído'] as ActionStatus[]).map(status => (
                                            <label key={status} className="flex items-center gap-1 cursor-pointer">
                                                <input type="radio" name={`status-${action.id}`} value={status} checked={actionStatuses[action.id] === status} onChange={() => handleStatusChange(action.id, status)} className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"/>
                                                {status}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500">Nenhuma ação adicionada ainda.</p>
                            )}

                            {editingAction && (
                                <ActionForm action={editingAction} onSave={handleAddOrUpdateAction} onCancel={() => setEditingAction(null)} />
                            )}

                             <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 mt-4">
                                <button onClick={() => setEditingAction({id: 0, title: '', description: ''})} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <PlusCircleIcon className="w-5 h-5"/> Adicionar Ação Manualmente
                                </button>
                                 <button
                                    onClick={handleGenerateSuggestions}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <><LoadingSpinner /> Gerando...</> : <><BrainIcon className="w-5 h-5" /> Gerar Sugestões com IA</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {generatedPlan && (
                        <PlanSection icon={<ClipboardDocumentCheckIcon className="w-6 h-6 text-indigo-500" />} title={generatedPlan.kpis.title}>
                            <ul className="list-disc list-inside space-y-1">
                                {generatedPlan.kpis.indicators.map((kpi, index) => <li key={index}>{kpi}</li>)}
                            </ul>
                        </PlanSection>
                    )}

                    {currentActions.length > 0 && (
                        <div className="pt-6 border-t border-slate-200 flex justify-end">
                            <button onClick={handleArchivePlan} className="flex items-center gap-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-800">
                                <ArchiveBoxIcon className="w-5 h-5" />
                                Finalizar e Arquivar Plano
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PlanSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <span className="mr-3 flex-shrink-0">{icon}</span>
            {title}
        </h3>
        <div className="pl-9 text-slate-600 text-sm space-y-2">
            {children}
        </div>
    </div>
);

const ActionForm: React.FC<{
    action: ActionItem | {title: string, description: string};
    onSave: (action: {title: string, description: string}) => void;
    onCancel: () => void;
}> = ({ action, onSave, onCancel }) => {
    const [title, setTitle] = useState(action.title);
    const [description, setDescription] = useState(action.description);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave({ title, description });
            setTitle('');
            setDescription('');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="bg-slate-100 p-4 rounded-lg border border-slate-300 space-y-3">
            <h4 className="font-semibold text-slate-700">{'id' in action && action.id ? 'Editar Ação' : 'Adicionar Nova Ação'}</h4>
            <div>
                <label htmlFor="action-title" className="sr-only">Título</label>
                <input
                    id="action-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Título da ação"
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                />
            </div>
            <div>
                <label htmlFor="action-desc" className="sr-only">Descrição</label>
                <textarea
                    id="action-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descrição da ação"
                    className="w-full p-2 border border-slate-300 rounded-md h-20 resize-none"
                />
            </div>
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar Ação</button>
            </div>
        </form>
    );
};