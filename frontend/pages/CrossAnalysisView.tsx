
import React, { useState, useEffect } from 'react';
import { getDashboardData, CrossAnalysisData } from '../services/dataService';
import { QuestionMarkCircleIcon, ChevronDownIcon } from '../components/icons';
import { LineChart, BubbleScatterChart, PotentialAnalysisChart, HeatmapChart, ActionsImpactChart } from '../components/Charts';

// --- Helper Components ---
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative inline-flex align-middle">
        <QuestionMarkCircleIcon className="w-4 h-4 text-blue-600 cursor-help" />
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 text-white text-sm rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-left font-normal normal-case tracking-normal">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
        </div>
    </div>
);

const AnalysisSection: React.FC<{title: string; tooltip: string; children: React.ReactNode}> = ({ title, tooltip, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col">
            <button
                className="w-full flex justify-between items-center p-4 flex-shrink-0"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    <InfoTooltip text={tooltip} />
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out flex-grow ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="min-h-0 overflow-hidden transition-opacity duration-300 ease-in-out" style={{ opacity: isOpen ? 1 : 0 }}>
                    <div className="p-4 border-t border-slate-200 h-full flex flex-col">{children}</div>
                </div>
            </div>
        </div>
    );
};


export const CrossAnalysisView: React.FC = () => {
    const [data, setData] = useState<CrossAnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getDashboardData({});
                setData(result.crossAnalysis);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao buscar dados.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500">Carregando análises cruzadas...</p>
            </div>
        );
    }

    if (error) {
        return (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md" role="alert">
                <p className="font-bold text-lg">Falha ao carregar as análises</p>
                <p className="mt-2">{error}</p>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center text-slate-500 py-20">Nenhum dado encontrado para as análises.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Análise Cruzada de Dados</h1>
                <p className="text-slate-600 mt-1 max-w-3xl">
                    Cruze informações de saúde mental, produtividade e negócio para obter insights estratégicos.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AnalysisSection title="IRP (Índice de Risco Psicossocial) vs. IPE (Índice de Presenteísmo Emocional)" tooltip="Mostra a correlação entre a saúde psicossocial (IRP, de 1 a 5) e a perda de produtividade (presenteísmo, %). Bolhas maiores representam setores com mais colaboradores.">
                    <BubbleScatterChart data={data.irpVsPresenteeism} xAxisLabel="IRP Global (1-5, maior é melhor)" yAxisLabel="Presenteísmo Estimado (%)" />
                </AnalysisSection>

                <AnalysisSection title="IRP (Índice de Risco Psicossocial) vs. Turnover" tooltip="Compara a tendência do IRP Global com a taxa de turnover trimestral, ajudando a identificar como o clima impacta a retenção.">
                    <LineChart chartData={data.irpVsTurnover} yAxisLabels={[0, 5, 10, 15, 20]} />
                </AnalysisSection>
            </div>
            
            <AnalysisSection title="Diagnóstico por Dimensão e Área" tooltip="Mapa de calor que cruza as dimensões de risco psicossocial com as áreas da empresa. Cores mais quentes (vermelho/laranja) indicam pontos críticos (nota de 1 a 5).">
                <HeatmapChart data={data.dimensionVsAreaHeatmap} />
            </AnalysisSection>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <AnalysisSection title="ROI do IPE (Índice de Presenteísmo Emocional)" tooltip="Estima o custo anual do presenteísmo e o potencial de economia (ROI) ao implementar ações que melhorem a saúde mental e reduzam a perda de produtividade.">
                    <PotentialAnalysisChart data={data.presenteeismVsRoi} />
                </AnalysisSection>
                
                <AnalysisSection title="Impacto das Ações vs. IRP (Índice de Risco Psicossocial)" tooltip="Visualiza a eficácia das intervenções. A altura da barra mostra a melhoria no IRP (Impacto). A cor da barra indica o progresso do plano de ação.">
                    <ActionsImpactChart data={data.actionsVsImpact} yAxisLabel="Melhora no IRP (Pontos)" />
                </AnalysisSection>
            </div>

            <AnalysisSection title="Evolução do IRP Global (Índice de Risco Psicossocial)" tooltip="Monitora a tendência trimestral ou mensal do Índice de Risco Psicossocial (IRP) geral da empresa.">
                <LineChart chartData={{ labels: data.irpEvolution.labels, datasets: [{ label: 'IRP Global', data: data.irpEvolution.data, color: '#3b82f6' }] }} yMin={0} yMax={100} yAxisLabels={[0, 25, 50, 75, 100]} />
            </AnalysisSection>

        </div>
    );
};
