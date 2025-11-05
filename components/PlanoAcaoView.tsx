
import React, { useState, useMemo, useCallback } from 'react';
import { mockResponses, dimensions, mockFilters } from './dashboardMockData';
import { runActionPlanGeneration } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowDownTrayIcon, BrainIcon, MagnifyingGlassIcon, FlagIcon, LightBulbIcon, ClipboardDocumentCheckIcon } from './icons';

// --- Types & Data ---

type RiskFactor = { id: string; name: string; score: number };
type ActionStatus = 'A Fazer' | 'Em Andamento' | 'Concluído';
interface GeneratedPlan {
    diagnosis: { title: string; content: string };
    strategicObjective: { title: string; content: string };
    suggestedActions: { title: string; actions: { actionTitle: string; actionDescription: string }[] };
    kpis: { title: string; indicators: string[] };
}

const likertToScore: Record<string, number> = {
  'Discordo totalmente': 1, 'Discordo parcialmente': 2, 'Neutro / Indiferente': 3, 'Concordo parcialmente': 4, 'Concordo totalmente': 5,
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
                    totalScoreForDim += likertToScore[answer] || 0;
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
export const PlanoAcaoView: React.FC = () => {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedFactorId, setSelectedFactorId] = useState<string>('');
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
    const [actionStatuses, setActionStatuses] = useState<Record<number, ActionStatus>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const criticalFactors = useMemo(() => {
        const filteredResponses = mockResponses.filter(r => 
            Object.entries(filters).every(([key, value]) => !value || r.segmentation[key] === value)
        );
        if (filteredResponses.length === 0) return [];
        const { riskFactors } = calculateDataForResponses(filteredResponses);
        return [...riskFactors].sort((a, b) => a.score - b.score).slice(0, 5);
    }, [filters]);

    const progress = useMemo(() => {
        if (!generatedPlan) return 0;
        const totalActions = generatedPlan.suggestedActions.actions.length;
        if (totalActions === 0) return 100;
        const completedActions = Object.values(actionStatuses).filter(s => s === 'Concluído').length;
        return (completedActions / totalActions) * 100;
    }, [actionStatuses, generatedPlan]);

    const handleFilterChange = (id: string, value: string) => {
        setFilters(prev => ({ ...prev, [id]: value }));
        setSelectedFactorId('');
        setGeneratedPlan(null);
    };

    const handleGeneratePlan = useCallback(async () => {
        if (!selectedFactorId) return;
        setIsLoading(true);
        setError(null);
        setGeneratedPlan(null);
        
        const factorName = dimensions[selectedFactorId]?.name || 'Fator Desconhecido';
        const segmentDescription = Object.entries(filters)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') || 'Toda a empresa';

        try {
            const resultString = await runActionPlanGeneration(factorName, segmentDescription);
            const plan: GeneratedPlan = JSON.parse(resultString);
            setGeneratedPlan(plan);
            const initialStatuses: Record<number, ActionStatus> = {};
            plan.suggestedActions.actions.forEach((_, index) => {
                initialStatuses[index] = 'A Fazer';
            });
            setActionStatuses(initialStatuses);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFactorId, filters]);

    const handleStatusChange = (index: number, status: ActionStatus) => {
        setActionStatuses(prev => ({ ...prev, [index]: status }));
    };

    const handleExportXls = () => {
        if (!generatedPlan) return;
        let html = `<h1>Plano de Ação - ${dimensions[selectedFactorId]?.name}</h1>`;
        
        html += `<h2>${generatedPlan.diagnosis.title}</h2><p>${generatedPlan.diagnosis.content}</p>`;
        html += `<h2>${generatedPlan.strategicObjective.title}</h2><p>${generatedPlan.strategicObjective.content}</p>`;

        let actionsTable = `<h2>${generatedPlan.suggestedActions.title}</h2><table><thead><tr><th>Ação</th><th>Descrição</th><th>Status</th></tr></thead><tbody>`;
        generatedPlan.suggestedActions.actions.forEach((action, index) => {
            actionsTable += `<tr><td>${action.actionTitle}</td><td>${action.actionDescription}</td><td>${actionStatuses[index] || 'A Fazer'}</td></tr>`;
        });
        actionsTable += '</tbody></table>';
        html += actionsTable;

        html += `<h2>${generatedPlan.kpis.title}</h2><ul>${generatedPlan.kpis.indicators.map(i => `<li>${i}</li>`).join('')}</ul>`;
        
        exportToExcel(html, `Plano_de_Acao_${dimensions[selectedFactorId]?.name.replace(' ', '_')}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Plano de Ação com IA</h1>
                <p className="text-slate-600 mt-1 max-w-3xl">
                    Filtre o público, selecione um fator de risco e gere um plano de ação customizado para impulsionar a melhoria.
                </p>
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
                                onClick={() => setSelectedFactorId(factor.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${selectedFactorId === factor.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                            >
                                {factor.name} <span className="ml-2 text-xs opacity-70">({factor.score}/100)</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Step 3: Generate Plan */}
            <div className="flex justify-center">
                <button
                    onClick={handleGeneratePlan}
                    disabled={!selectedFactorId || isLoading}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                    {isLoading ? <><LoadingSpinner /> Gerando Plano...</> : <><BrainIcon className="w-5 h-5" /> Gerar Plano de Ação com IA</>}
                </button>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Ocorreu um erro</p><p>{error}</p></div>}
            
            {/* Display Plan */}
            {generatedPlan && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Plano para: {dimensions[selectedFactorId]?.name}</h2>
                            <p className="text-slate-500">Acompanhe o progresso e exporte o relatório.</p>
                        </div>
                        <button onClick={handleExportXls} className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50"><ArrowDownTrayIcon className="w-5 h-5" /> Exportar XLS</button>
                    </div>

                    {/* Progress */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Progresso do Plano</h3>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full text-center text-white text-xs font-bold" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}>
                                {progress.toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <PlanSection icon={<MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />} title={generatedPlan.diagnosis.title}><p>{generatedPlan.diagnosis.content}</p></PlanSection>
                        <PlanSection icon={<FlagIcon className="w-6 h-6 text-green-600" />} title={generatedPlan.strategicObjective.title}><p>{generatedPlan.strategicObjective.content}</p></PlanSection>
                        <PlanSection icon={<LightBulbIcon className="w-6 h-6 text-yellow-500" />} title={generatedPlan.suggestedActions.title}>
                            <div className="space-y-4">
                                {generatedPlan.suggestedActions.actions.map((action, index) => (
                                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <p className="font-semibold text-slate-700">{action.actionTitle}</p>
                                        <p className="text-sm text-slate-600 mt-1 mb-3">{action.actionDescription}</p>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="font-medium text-slate-500">Status:</span>
                                            {(['A Fazer', 'Em Andamento', 'Concluído'] as ActionStatus[]).map(status => (
                                                <label key={status} className="flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name={`status-${index}`} value={status} checked={actionStatuses[index] === status} onChange={() => handleStatusChange(index, status)} className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"/>
                                                    {status}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PlanSection>
                        <PlanSection icon={<ClipboardDocumentCheckIcon className="w-6 h-6 text-red-500" />} title={generatedPlan.kpis.title}>
                            <ul className="list-disc list-inside space-y-1">
                                {generatedPlan.kpis.indicators.map((kpi, index) => <li key={index}>{kpi}</li>)}
                            </ul>
                        </PlanSection>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlanSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <span className="mr-3">{icon}</span>
            {title}
        </h3>
        <div className="pl-9 text-slate-600 text-sm space-y-2">
            {children}
        </div>
    </div>
);
