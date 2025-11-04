

import React, { useState, useMemo, useCallback } from 'react';
import { runDashboardAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon } from './icons';
import { mockResponses, mockFilters, dimensions } from './dashboardMockData';
import { GaugeChart, RadarChart, DistributionChart } from './Charts';

// --- Helper Functions & Types ---
type RiskFactor = { id: string; name: string; score: number };
type ResponseDistribution = { name: string; value: number; color: string; }[];
type MaturityLevel = {
    level: string;
    name: string;
    description: string;
};
type DashboardData = {
  geralScore: number;
  irpGlobal: number;
  riskLevel: { text: string; color: string; };
  riskClassification: { text: string; color: string; };
  participation: number;
  topRisks: RiskFactor[];
  mostCriticalDimension?: RiskFactor;
  maturityLevel: MaturityLevel;
  riskFactors: RiskFactor[];
  companyAverageFactors: RiskFactor[];
  distributions: Record<string, ResponseDistribution>;
};
interface AiInsightData {
    summary: { title: string; content: string };
    strengths: { title: string; points: { factor: string; description: string }[] };
    attentionPoints: { title: string; points: { factor: string; description: string }[] };
    recommendations: { title: string; points: { forFactor: string; actions: string[] }[] };
    nextSteps: { title: string; content: string };
}

const likertOptions = ['Discordo totalmente', 'Discordo parcialmente', 'Neutro / Indiferente', 'Concordo parcialmente', 'Concordo totalmente'];
const likertToScore: Record<string, number> = {
  [likertOptions[0]]: 1, [likertOptions[1]]: 2, [likertOptions[2]]: 3, [likertOptions[3]]: 4, [likertOptions[4]]: 5,
};
const allDimensionIds = Object.keys(dimensions);

const maturityLevels: Record<string, {name: string, description: string}> = {
    'M1': { name: 'Reativa', description: 'Atuação apenas após crises (>60% dos fatores em risco alto).' },
    'M2': { name: 'Consciente', description: 'Reconhece riscos, mas sem plano estruturado (40-60% em risco moderado/alto).' },
    'M3': { name: 'Estruturada', description: 'Políticas em implantação (30-40% em risco moderado).' },
    'M4': { name: 'Preventiva', description: 'Gestão ativa do clima (10-30% em risco moderado).' },
    'M5': { name: 'Estratégica', description: 'Cultura de bem-estar consolidada (>80% dos fatores em risco baixo).' },
};

const getMaturityLevel = (riskFactors: RiskFactor[]): MaturityLevel => {
    if (riskFactors.length === 0) {
        return { level: 'N/A', name: 'Dados Insuficientes', description: 'Não há dados para calcular.' };
    }
    
    let highCount = 0, moderateCount = 0, lowCount = 0;

    riskFactors.forEach(factor => {
        const score_1_5 = (factor.score / 100) * 4 + 1;
        if (score_1_5 <= 2.4) highCount++;
        else if (score_1_5 <= 3.4) moderateCount++;
        else lowCount++;
    });

    const total = riskFactors.length;
    const highPercent = (highCount / total) * 100;
    const moderatePercent = (moderateCount / total) * 100;
    const lowPercent = (lowCount / total) * 100;

    if (highPercent > 60) return { level: 'M1', ...maturityLevels['M1'] };
    if (lowPercent > 80) return { level: 'M5', ...maturityLevels['M5'] };
    if ((highPercent + moderatePercent) >= 40 && (highPercent + moderatePercent) <= 60) return { level: 'M2', ...maturityLevels['M2'] };
    if (moderatePercent >= 30 && moderatePercent <= 40) return { level: 'M3', ...maturityLevels['M3'] };
    if (moderatePercent >= 10 && moderatePercent < 30) return { level: 'M4', ...maturityLevels['M4'] };
    
    if ((highPercent + moderatePercent) > 30) return { level: 'M2', ...maturityLevels['M2'] };
    return { level: 'M4', ...maturityLevels['M4'] }; // Fallback
};

const calculateDataForResponses = (responses: typeof mockResponses) => {
    if (responses.length === 0) {
        return {
            riskFactors: allDimensionIds.map(id => ({ id, name: dimensions[id].name, score: 0 })),
            distributions: Object.fromEntries(allDimensionIds.map(id => [id, []]))
        };
    }

    const totalDimensionScores: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};
    const distributions: Record<string, Record<string, number>> = {};

    allDimensionIds.forEach(id => {
        distributions[id] = { [likertOptions[0]]: 0, [likertOptions[1]]: 0, [likertOptions[2]]: 0, [likertOptions[3]]: 0, [likertOptions[4]]: 0 };
    });

    responses.forEach(r => {
        allDimensionIds.forEach(dimId => {
            const dimQuestions = dimensions[dimId].questions;
            let totalScoreForDim = 0;
            let questionCountForDim = 0;
            
            dimQuestions.forEach(qId => {
                const answer = r.answers[qId];
                if (answer) {
                    totalScoreForDim += likertToScore[answer] || 0;
                    questionCountForDim++;
                    if (distributions[dimId] && answer in distributions[dimId]) {
                        distributions[dimId][answer]++;
                    }
                }
            });

            if (questionCountForDim > 0) {
                const avgScoreForDim = totalScoreForDim / questionCountForDim;
                totalDimensionScores[dimId] = (totalDimensionScores[dimId] || 0) + avgScoreForDim;
                dimensionCounts[dimId] = (dimensionCounts[dimId] || 0) + 1;
            }
        });
    });

    const riskFactors: RiskFactor[] = allDimensionIds.map(id => {
        const averageScore = (totalDimensionScores[id] || 0) / (dimensionCounts[id] || 1);
        const normalizedScore = Math.round((averageScore - 1) / 4 * 100);
        return { id, name: dimensions[id].name, score: normalizedScore };
    });

    const formattedDistributions = Object.fromEntries(
        Object.entries(distributions).map(([dimId, dist]) => {
            const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
            const finalDist = [
                { name: 'DT', value: (dist[likertOptions[0]] / total) * 100, color: '#ef4444' }, // red-500
                { name: 'DP', value: (dist[likertOptions[1]] / total) * 100, color: '#f97316' },  // orange-500
                { name: 'N', value: (dist[likertOptions[2]] / total) * 100, color: '#eab308' },  // yellow-500
                { name: 'CP', value: (dist[likertOptions[3]] / total) * 100, color: '#84cc16' },  // lime-500
                { name: 'CT', value: (dist[likertOptions[4]] / total) * 100, color: '#22c55e' }, // green-500
            ];
            return [dimId, finalDist];
        })
    );

    return { riskFactors, distributions: formattedDistributions };
};

const calculateDashboardData = (filters: Record<string, string>): DashboardData => {
    const filteredResponses = mockResponses.filter(r => 
        Object.entries(filters).every(([key, value]) => !value || r.segmentation[key] === value)
    );
    
    const companyData = calculateDataForResponses(mockResponses);
    const filteredData = calculateDataForResponses(filteredResponses);
    
    const maturityLevel = getMaturityLevel(filteredData.riskFactors);

    const emptyState = {
        geralScore: 0,
        irpGlobal: 0,
        riskLevel: { text: 'N/A', color: 'bg-slate-500' },
        riskClassification: { text: 'N/A', color: 'bg-slate-500' },
        participation: 0,
        topRisks: [],
        maturityLevel: { level: 'N/A', name: 'Dados Insuficientes', description: '' },
        ...filteredData,
        companyAverageFactors: companyData.riskFactors
    };
    
    if (filteredResponses.length === 0) {
        return emptyState;
    }

    const geralScore = Math.round(filteredData.riskFactors.reduce((acc, curr) => acc + curr.score, 0) / filteredData.riskFactors.length);
    const irpGlobal = (geralScore / 100) * 4 + 1;
    
    const riskLevelFromScore100 = geralScore >= 75 ? { text: 'Saudável', color: 'bg-green-500' }
                    : geralScore >= 50 ? { text: 'Moderado', color: 'bg-yellow-500' }
                    : geralScore >= 25 ? { text: 'Atenção', color: 'bg-orange-500' }
                    : { text: 'Crítico', color: 'bg-red-500' };

    const riskClassificationFromScore5 = irpGlobal >= 3.5 ? { text: 'Baixo / Saudável', color: 'bg-green-500' }
                                        : irpGlobal >= 2.5 ? { text: 'Risco Moderado', color: 'bg-yellow-500' }
                                        : { text: 'Risco Alto', color: 'bg-red-500' };

    const sortedRisks = [...filteredData.riskFactors].sort((a, b) => a.score - b.score);
    const topRisks = sortedRisks.slice(0, 3);
    const mostCriticalDimension = sortedRisks[0];

    return { 
        geralScore, 
        irpGlobal,
        riskLevel: riskLevelFromScore100, 
        riskClassification: riskClassificationFromScore5,
        participation: filteredResponses.length, 
        topRisks, 
        mostCriticalDimension,
        maturityLevel,
        ...filteredData, 
        companyAverageFactors: companyData.riskFactors 
    };
};

// --- Sub-components ---
const KpiCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-4 rounded-lg shadow border border-slate-200 ${className}`}>
    <h3 className="text-sm font-medium text-slate-500 truncate">{title}</h3>
    <div className="mt-1 text-2xl font-semibold text-slate-900">{children}</div>
  </div>
);

const MaturityLevelCard: React.FC<{ maturity: MaturityLevel }> = ({ maturity }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <h3 className="text-sm font-medium text-slate-500 truncate">Nível de Maturidade (Etapa 5)</h3>
        <div className="mt-1">
            <p className="text-2xl font-semibold text-slate-900">{maturity.level} - {maturity.name}</p>
            <p className="text-xs text-slate-500 mt-1">{maturity.description}</p>
        </div>
    </div>
);

const RiskHeatmap: React.FC<{ data: Record<string, Record<string, number>> }> = ({ data }) => {
    const dimensionHeaders: Record<string, string> = {
        'd1_carga': 'Carga',
        'd3_autonomia': 'Autonomia',
        'd6_suporte': 'Suporte',
        'd5_reconhecimento': 'Reconhec.',
        'd8_justica': 'Justiça',
        'd7_lideranca': 'Liderança'
    };
    const dimensionIds = Object.keys(dimensionHeaders);
    const sectors = Object.keys(data);

    const getRiskDot = (score: number) => {
        let color = 'bg-slate-300';
        let title = 'Sem dados';
        if (score > 0) {
            if (score <= 2.4) { color = 'bg-red-500'; title = `Risco Alto (${score.toFixed(1)})`; }
            else if (score <= 3.4) { color = 'bg-yellow-400'; title = `Risco Moderado (${score.toFixed(1)})`; }
            else { color = 'bg-green-500'; title = `Risco Baixo (${score.toFixed(1)})`; }
        }
        return <span title={title} className={`inline-block h-5 w-5 rounded-full ${color}`}></span>;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Mapa de Risco Psicossocial (Etapa 4)</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-center">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Setor</th>
                            {dimensionIds.map(id => <th key={id} className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">{dimensionHeaders[id]}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sectors.map(sector => (
                            <tr key={sector}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-left font-medium text-slate-900">{sector}</td>
                                {dimensionIds.map(dimId => (
                                    <td key={dimId} className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                                        {getRiskDot(data[sector]?.[dimId] || 0)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Component ---
export const DashboardView: React.FC = () => {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [aiInsight, setAiInsight] = useState<AiInsightData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFactorForDistribution, setSelectedFactorForDistribution] = useState<string>('d1_carga');

    const data = useMemo(() => calculateDashboardData(filters), [filters]);

    const heatmapData = useMemo(() => {
        const sectors = mockFilters.find(f => f.id === 'setor')?.options || [];
        const dimensionIds = ['d1_carga', 'd3_autonomia', 'd6_suporte', 'd5_reconhecimento', 'd8_justica', 'd7_lideranca'];
        const heatmap: Record<string, Record<string, number>> = {};

        sectors.forEach(sector => {
            const sectorResponses = mockResponses.filter(r => r.segmentation.setor === sector);
            if (sectorResponses.length > 0) {
                heatmap[sector] = {};
                dimensionIds.forEach(dimId => {
                    let totalScore = 0; let responseCount = 0;
                    sectorResponses.forEach(res => {
                        const dimQuestions = dimensions[dimId].questions;
                        let totalDimScoreForResponse = 0; let questionCount = 0;
                        dimQuestions.forEach(qId => {
                            const answer = res.answers[qId];
                            if (answer) {
                                totalDimScoreForResponse += likertToScore[answer] || 0;
                                questionCount++;
                            }
                        });
                        if (questionCount > 0) {
                            totalScore += totalDimScoreForResponse / questionCount;
                            responseCount++;
                        }
                    });
                    heatmap[sector][dimId] = responseCount > 0 ? totalScore / responseCount : 0;
                });
            }
        });
        return heatmap;
    }, []);

    const handleFilterChange = (id: string, value: string) => {
        setFilters(prev => ({ ...prev, [id]: value }));
        setAiInsight(null); // Reset AI insight when filters change
    };
    
    const getFilterDisplayName = () => {
        const activeFilters = Object.values(filters).filter(Boolean);
        if (activeFilters.length === 0) {
            return "Geral (Toda a Empresa)";
        }
        return activeFilters.join(' / ');
    };

    const handleGenerateInsight = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAiInsight(null);
        
        let promptData = `Dados do Dashboard para Análise:\n`;
        promptData += `- Filtros Ativos: ${Object.values(filters).filter(Boolean).join(', ') || 'Nenhum'}\n`;
        promptData += `- Pontuação Geral de Saúde: ${data.geralScore}/100\n`;
        promptData += `- Nível de Risco: ${data.riskLevel.text}\n`;
        promptData += `\nPontuações por Fator de Risco (de 0 a 100):\n`;
        data.riskFactors.forEach(rf => {
            const avg = data.companyAverageFactors.find(avg_rf => avg_rf.id === rf.id)?.score || 0;
            promptData += `- ${rf.name}: ${rf.score} (Média da empresa: ${avg})\n`;
        });

        try {
            const resultString = await runDashboardAnalysis(promptData);
            const resultJson = JSON.parse(resultString) as AiInsightData;
            setAiInsight(resultJson);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [data, filters]);

    const radarChartData = {
        labels: data.riskFactors.map(f => f.name.replace(' e ', '/').split(' ')[0]), // Shorten labels
        datasets: [
            {
                label: 'Média da Empresa',
                data: data.companyAverageFactors.map(f => f.score),
                borderColor: 'rgba(107, 114, 128, 0.4)', // gray-500
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
            },
            {
                label: 'Seleção Atual',
                data: data.riskFactors.map(f => f.score),
                borderColor: 'rgba(59, 130, 246, 1)', // blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
            },
        ],
    };

    return (
    <>
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard de Saúde Organizacional</h1>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mockFilters.map(f => (
                    <div key={f.id}>
                        <label htmlFor={f.id} className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                        <select
                            id={f.id}
                            value={filters[f.id] || ''}
                            onChange={e => handleFilterChange(f.id, e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                            <option value="">Todos</option>
                            {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <KpiCard title="Participação">{data.participation} <span className="text-base text-slate-500">respondentes</span></KpiCard>
                 <KpiCard title="Saúde Geral">
                    <span className="flex items-center">{data.geralScore} <span className="text-base text-slate-500 ml-1">/ 100</span></span>
                </KpiCard>
                <MaturityLevelCard maturity={data.maturityLevel} />
                <KpiCard title="Nível de Risco">
                    <span className={`px-2 py-1 text-sm font-semibold text-white rounded-full ${data.riskLevel.color}`}>{data.riskLevel.text}</span>
                </KpiCard>
            </div>

            {/* Risk Summary Table (Etapa 2 & 3) */}
            <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Análise de Riscos por Grupo (Etapa 2 & 3)</h2>
                {data.participation > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Setor / Grupo Filtrado</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IRP Global (1-5)</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dimensão Mais Crítica</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Classificação de Risco</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                <tr>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{getFilterDisplayName()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-bold">{data.irpGlobal.toFixed(1)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{data.mostCriticalDimension?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${data.riskClassification.color}`}>
                                            {data.riskClassification.text}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-center text-slate-500 py-4">Selecione filtros para ver a análise de risco de um grupo específico.</p>
                )}
            </div>

            {/* Risk Heatmap (Etapa 4) */}
            <RiskHeatmap data={heatmapData} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Side: Main Charts */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                             <h2 className="text-lg font-semibold text-slate-800 mb-4">Medidor de Saúde Geral</h2>
                             <GaugeChart score={data.geralScore} />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Perfil de Risco Comparativo</h2>
                            <RadarChart data={radarChartData} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                         <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                            <h2 className="text-lg font-semibold text-slate-800">Mapa de Calor das Respostas</h2>
                            <select
                                value={selectedFactorForDistribution}
                                onChange={e => setSelectedFactorForDistribution(e.target.value)}
                                className="p-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                {data.riskFactors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                         </div>
                         <DistributionChart data={data.distributions[selectedFactorForDistribution]} />
                    </div>
                </div>

                {/* Right Side: AI Insights */}
                <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Insights Estratégicos com IA</h2>
                    <button
                        onClick={handleGenerateInsight}
                        disabled={isLoading || data.participation === 0}
                        className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? <><LoadingSpinner /> Gerando Relatório...</> : <><SparklesIcon className="w-5 h-5" /> Gerar Insights</>}
                    </button>
                    {data.participation === 0 && <p className="text-sm text-center text-slate-500">Sem dados para os filtros selecionados.</p>}
                     {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                            <p className="font-bold">Ocorreu um erro</p><p>{error}</p>
                        </div>
                    )}
                    {aiInsight && (
                        <div className="space-y-4 mt-4 max-h-[80vh] overflow-y-auto pr-2">
                            {/* Summary Card */}
                            <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                                <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center">
                                    <span className="mr-2 text-xl">📊</span>
                                    {aiInsight.summary.title}
                                </h3>
                                <p className="text-sm text-slate-600">{aiInsight.summary.content}</p>
                            </div>

                            <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                                <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center">
                                    <span className="mr-2 text-xl">✅</span>
                                    {aiInsight.strengths.title}
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    {aiInsight.strengths.points.map((p, i) => (
                                        <li key={i}>
                                            <strong className="text-slate-700">{p.factor}:</strong>
                                            <span className="text-slate-600 ml-1">{p.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                                <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center">
                                    <span className="mr-2 text-xl">⚠️</span>
                                    {aiInsight.attentionPoints.title}
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    {aiInsight.attentionPoints.points.map((p, i) => (
                                        <li key={i}>
                                            <strong className="text-slate-700">{p.factor}:</strong>
                                            <span className="text-slate-600 ml-1">{p.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommendations Card */}
                            <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                                <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center">
                                    <span className="mr-2 text-xl">💡</span>
                                    {aiInsight.recommendations.title}
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {aiInsight.recommendations.points.map((p, i) => (
                                        <div key={i}>
                                            <h4 className="font-semibold text-slate-700">{p.forFactor}</h4>
                                            <ul className="list-disc list-inside space-y-1 text-slate-600 mt-1">
                                                {p.actions.map((action, j) => <li key={j}>{action}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Next Steps Card */}
                            <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                                <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center">
                                    <span className="mr-2 text-xl">🚀</span>
                                    {aiInsight.nextSteps.title}
                                </h3>
                                <p className="text-sm text-slate-600">{aiInsight.nextSteps.content}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <footer className="text-center mt-8">
            <p className="text-sm text-slate-500">
                Progredire+ | Ferramenta de análise psicológica organizacional.
            </p>
        </footer>
    </>
    );
};