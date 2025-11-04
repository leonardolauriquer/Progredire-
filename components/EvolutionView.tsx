
import React, { useState, useMemo, useCallback } from 'react';
import { runEvolutionAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { BrainIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from './icons';
import { mockResponses } from './dashboardMockData';
import { LineChart, Sparkline } from './Charts';

const factorIdToName: Record<string, string> = {
    'geral': 'Saúde Geral', 'q1': 'Carga de Trabalho', 'q2': 'Jornada e Ritmo', 'q3': 'Clareza do Papel', 'q4': 'Autonomia', 'q5': 'Suporte Social',
    'q6': 'Relações Interpessoais', 'q7': 'Reconhecimento', 'q8': 'Segurança', 'q9': 'Comunicação/Isolamento', 'q10': 'Organização/Processos',
};
const allFactorIds = Object.keys(factorIdToName);

const likertToScore: Record<string, number> = {
    'Discordo Totalmente': 1, 'Discordo': 2, 'Neutro': 3, 'Concordo': 4, 'Concordo Totalmente': 5,
};

type EvolutionData = {
    labels: string[];
    data: number[];
    startScore: number;
    endScore: number;
    change: number;
};

// Calculates evolution data for all factors
const calculateAllFactorsEvolution = (): Record<string, EvolutionData> => {
    const monthlyData: Record<string, Record<string, { totalScore: number; count: number }>> = {};

    mockResponses.forEach(res => {
        const date = new Date(res.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {};
        }

        allFactorIds.forEach(factorId => {
            if (!monthlyData[monthKey][factorId]) {
                 monthlyData[monthKey][factorId] = { totalScore: 0, count: 0 };
            }

            if (factorId === 'geral') {
                 let responseTotal = 0;
                 let responseCount = 0;
                 Object.entries(res.answers).forEach(([qId, answer]) => {
                    if (factorIdToName[qId]) {
                        responseTotal += likertToScore[answer] || 0;
                        responseCount++;
                    }
                });
                if (responseCount > 0) {
                    const avgResponseScore = responseTotal / responseCount;
                    monthlyData[monthKey][factorId].totalScore += avgResponseScore;
                    monthlyData[monthKey][factorId].count++;
                }
            } else {
                const answer = res.answers[factorId];
                if (answer) {
                    monthlyData[monthKey][factorId].totalScore += likertToScore[answer] || 0;
                    monthlyData[monthKey][factorId].count++;
                }
            }
        });
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const result: Record<string, EvolutionData> = {};

    allFactorIds.forEach(factorId => {
        const labels = sortedMonths.map(key => {
            const [year, month] = key.split('-');
            return `${month}/${year.slice(2)}`;
        });

        const data = sortedMonths.map(key => {
            const monthFactorData = monthlyData[key][factorId];
            if (!monthFactorData || monthFactorData.count === 0) return 0;
            const avgScore = monthFactorData.totalScore / monthFactorData.count;
            return Math.round((avgScore - 1) / 4 * 100); // Normalize to 0-100
        });

        const validData = data.filter(d => d > 0);
        const startScore = validData.length > 0 ? validData[0] : 0;
        const endScore = validData.length > 0 ? validData[validData.length - 1] : 0;
        const change = startScore > 0 ? ((endScore - startScore) / startScore) * 100 : 0;
        
        result[factorId] = { labels, data, startScore, endScore, change };
    });

    return result;
};

const FactorEvolutionCard: React.FC<{ factorName: string; data: EvolutionData }> = ({ factorName, data }) => {
    const changeColor = data.change >= 0 ? 'text-green-600' : 'text-red-600';
    const bgColor = data.change >= 0 ? 'bg-green-100' : 'bg-red-100';
    const TrendIcon = data.change >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

    return (
        <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-slate-800">{factorName}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-slate-900">{data.endScore}</span>
                    <div className={`flex items-center text-sm font-semibold ${changeColor} ${bgColor} px-2 py-0.5 rounded-full`}>
                        <TrendIcon className="w-4 h-4 mr-1" />
                        {data.change.toFixed(1)}%
                    </div>
                </div>
            </div>
            <Sparkline data={data.data} color={data.change >= 0 ? '#16a34a' : '#dc2626'} />
        </div>
    );
};


export const EvolutionView: React.FC = () => {
    const [aiInsight, setAiInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const evolutionData = useMemo(() => calculateAllFactorsEvolution(), []);

    const handleGenerateInsight = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAiInsight('');

        let promptData = `Análise do período de ${evolutionData.geral.labels[0]} a ${evolutionData.geral.labels[evolutionData.geral.labels.length - 1]}:\n\n`;
        
        Object.entries(evolutionData).forEach(([factorId, data]) => {
            promptData += `- ${factorIdToName[factorId]}:\n  - Pontuação Inicial: ${data.startScore}\n  - Pontuação Final: ${data.endScore}\n\n`;
        });

        try {
            const result = await runEvolutionAnalysis(promptData);
            setAiInsight(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [evolutionData]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Evolução Organizacional</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Tendência de Saúde Geral</h2>
                <LineChart chartData={evolutionData.geral} />
            </div>

             <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Análise da Evolução com IA</h2>
                <p className="text-slate-500 mb-4 max-w-2xl">
                    Obtenha um relatório estratégico completo sobre a trajetória da sua organização, identificando os principais avanços, desafios e recomendações.
                </p>
                <button
                    onClick={handleGenerateInsight}
                    disabled={isLoading}
                    className="w-full sm:w-auto mb-4 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? <><LoadingSpinner /> Analisando...</> : <><BrainIcon className="w-5 h-5" /> Analisar Evolução Completa</>}
                </button>
                
                 {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <p className="font-bold">Ocorreu um erro</p><p>{error}</p>
                    </div>
                )}
                {aiInsight && (
                     <div 
                        className="prose prose-slate max-w-none bg-slate-50/70 border border-slate-200 p-4 rounded-xl mt-4"
                        dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br />') }}
                     />
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Evolução por Fator de Risco</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(evolutionData).map(([factorId, data]) => {
                        if (factorId === 'geral') return null;
                        return <FactorEvolutionCard key={factorId} factorName={factorIdToName[factorId]} data={data} />;
                    })}
                </div>
            </div>

            <footer className="text-center mt-8">
                <p className="text-sm text-slate-500">
                    Progredire+ | Ferramenta de análise psicológica organizacional.
                </p>
            </footer>
        </div>
    );
};