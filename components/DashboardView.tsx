import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getDashboardData, DashboardData, RiskFactor } from '../services/dataService';
import { runDashboardAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon, ShieldCheckIcon, ExclamationTriangleIcon, ChevronDownIcon, ArrowDownTrayIcon, PrinterIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon } from './icons';
import { mockFilters } from './dashboardMockData';
import { GaugeChart, RadarChart, DistributionChart, LineChart, MaturityProgressBar, StackedBarChart, ThermometerChart, DonutChart, HeatmapChart, HorizontalBarChartWithColorScale, PotentialAnalysisChart, ActionsImpactChart, SimpleHorizontalBarChart } from './Charts';

// --- Types ---
interface AiInsightData {
    summary: { title: string; content: string };
    strengths: { title: string; points: { factor: string; description: string }[] };
    attentionPoints: { title: string; points: { factor: string; description: string }[] };
    recommendations: { title: string; points: { forFactor: string; actions: string[] }[] };
    nextSteps: { title: string; content: string };
}

interface DashboardViewProps {
  initialFilters?: Record<string, string>;
  onNavigateToActionPlan: (context: { filters: Record<string, string>, factorId: string }) => void;
}

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
                p, li { font-size: 0.9rem; }
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

const getIRPColor = (irp: number) => {
    if (irp >= 3.5) return '#22c55e'; // green-500
    if (irp >= 2.5) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
};


// --- Sub-components ---
const KpiCard: React.FC<{ title: string; children: React.ReactNode; className?: string, tooltip?: string }> = ({ title, children, className, tooltip }) => (
  <div className={`bg-white p-4 rounded-lg shadow border border-slate-200 flex flex-col ${className}`}>
    <div className="flex justify-between items-start gap-2">
      <div className="flex-grow min-w-0">
        <h3 className="text-sm font-medium text-slate-500 truncate">{title}</h3>
      </div>
      {tooltip && (
        <div className="flex-shrink-0">
          <InfoTooltip text={tooltip} />
        </div>
      )}
    </div>
    <div className="mt-1 text-2xl font-semibold text-slate-900 flex-grow">{children}</div>
  </div>
);

const RankingCard: React.FC<{
    title: string, 
    items: RiskFactor[], 
    icon: React.ElementType, 
    iconClass: string,
    onActionClick?: (factorId: string) => void,
    tooltip?: string
}> = ({title, items, icon: Icon, iconClass, onActionClick, tooltip}) => (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-slate-800 truncate pr-2">{title}</h3>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <ul className="space-y-2">
            {items.map(item => (
                <li key={item.id} className="flex items-center text-sm">
                    <Icon className={`w-5 h-5 mr-2 flex-shrink-0 ${iconClass}`} />
                    <span className="text-slate-700 flex-grow">{item.name}</span>
                    <span className="font-bold text-slate-800">{item.score}<span className="font-normal text-slate-500">/100</span></span>
                     {onActionClick && (
                        <button 
                            onClick={() => onActionClick(item.id)} 
                            title="Criar Plano de Ação"
                            className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <ClipboardDocumentListIcon className="w-5 h-5"/>
                        </button>
                    )}
                </li>
            ))}
        </ul>
    </div>
);

const DashboardSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl">
            <button
                className="w-full flex justify-between items-center p-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                <ChevronDownIcon className={`w-6 h-6 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-slate-200">{children}</div>
                </div>
            </div>
        </div>
    );
};

const AnalysisCard: React.FC<{title: string; tooltip: string; children: React.ReactNode; className?: string}> = ({ title, tooltip, children, className = '' }) => (
    <div className={`bg-white p-4 rounded-lg shadow border border-slate-200 flex flex-col ${className}`}>
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h3 className="text-md font-semibold text-slate-800">{title}</h3>
            <InfoTooltip text={tooltip} />
        </div>
        <div className="flex-grow flex flex-col">{children}</div>
    </div>
);


// --- Main Component ---
export const DashboardView: React.FC<DashboardViewProps> = ({ initialFilters, onNavigateToActionPlan }) => {
    const [filters, setFilters] = useState<Record<string, string>>(initialFilters || {});
    const [aiInsight, setAiInsight] = useState<AiInsightData | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [insightError, setInsightError] = useState<string | null>(null);

    // New state for data fetching
    const [data, setData] = useState<DashboardData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);
    const [leavePeriod, setLeavePeriod] = useState<string>('12');


    useEffect(() => {
        const fetchData = async () => {
            setIsDataLoading(true);
            setDataError(null);
            setData(null);
            setAiInsight(null);

            try {
                const result = await getDashboardData(filters);
                setData(result);
            } catch (err) {
                setDataError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, [filters]);


    const handleFilterChange = (id: string, value: string) => {
        setFilters(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerateInsight = useCallback(async () => {
        if (!data) return;

        setIsInsightLoading(true); setInsightError(null); setAiInsight(null);
        let promptData = `Dados do Dashboard para Análise:\n- Filtros Ativos: ${Object.values(filters).filter(Boolean).join(', ') || 'Nenhum'}\n- IRP Global: ${data.irpGlobal.toFixed(1)}/5.0\n- Nível de Risco: ${data.riskClassification.text}\n- Nível de Maturidade: ${data.maturityLevel.level} - ${data.maturityLevel.name}\n\nPontuações por Fator de Risco (de 0 a 100):\n`;
        data.riskFactors.forEach(rf => {
            promptData += `- ${rf.name}: ${rf.score}\n`;
        });
        try {
            const resultString = await runDashboardAnalysis(promptData);
            setAiInsight(JSON.parse(resultString));
        } catch (err) {
            setInsightError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsInsightLoading(false);
        }
    }, [data, filters]);

    const processedLeaveData = useMemo(() => {
        if (!data?.leaveEvents) return [];
    
        const periodInMonths = parseInt(leavePeriod, 10);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - periodInMonths);
    
        const filteredEvents = data.leaveEvents.filter(event => new Date(event.date) >= cutoffDate);
    
        const counts = filteredEvents.reduce<Record<string, number>>((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});
    
        return Object.entries(counts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

    }, [data?.leaveEvents, leavePeriod]);
    
    const handleExportXls = useCallback(() => {
        if (!data || !data.riskFactors || data.riskFactors.length === 0) return;

        const createKeyValueTable = (title: string, obj: Record<string, any>) => {
            let table = `<h2>${title}</h2><table><tbody>`;
            for (const key in obj) {
                table += `<tr><td><strong>${key}</strong></td><td>${obj[key]}</td></tr>`;
            }
            table += '</tbody></table>';
            return table;
        };
        
        const createArrayTable = (title: string, headers: string[], rows: (string|number)[][]) => {
            let table = `<h2>${title}</h2><table><thead><tr>`;
            headers.forEach(h => table += `<th>${h}</th>`);
            table += '</tr></thead><tbody>';
            rows.forEach(row => {
                table += '<tr>';
                row.forEach(cell => table += `<td>${cell}</td>`);
                table += '</tr>';
            });
            table += '</tbody></table>';
            return table;
        };
        
        const kpiData = {
            'IRP Global (1-5)': data.irpGlobal.toFixed(1),
            'Nível de Risco': data.riskClassification.text,
            '% Respostas': `${data.participationRate.toFixed(0)}%`,
            'Nível de Maturidade': `${data.maturityLevel.level} - ${data.maturityLevel.name}`,
            'Economia Anual Estimada': data.estimatedSavings,
            'Absenteísmo Estimado (%)': data.absenteeismRate.toFixed(1),
            'Presenteísmo Estimado (%)': data.presenteeismRate.toFixed(1),
        };
        let html = createKeyValueTable('Indicadores Chave de Performance (KPIs)', kpiData);

        const factorHeaders = ['Fator de Risco', 'Pontuação (Seleção)', 'Pontuação (Média Empresa)', 'Discordo Total. (%)', 'Discordo Parc. (%)', 'Neutro (%)', 'Concordo Parc. (%)', 'Concordo Total. (%)'];
        const factorRows = data.riskFactors.map(factor => {
            const companyFactor = data.companyAverageFactors.find(f => f.id === factor.id);
            const distribution = data.distributions[factor.id] || [];
            return [
                factor.name,
                factor.score,
                companyFactor ? companyFactor.score : 'N/A',
                distribution[0]?.value.toFixed(1) ?? 0,
                distribution[1]?.value.toFixed(1) ?? 0,
                distribution[2]?.value.toFixed(1) ?? 0,
                distribution[3]?.value.toFixed(1) ?? 0,
                distribution[4]?.value.toFixed(1) ?? 0,
            ];
        });
        html += createArrayTable('Análise Detalhada dos Fatores de Risco', factorHeaders, factorRows as (string|number)[][]);
        
        html += createArrayTable(
            'Top 3 Fatores Críticos de Risco', 
            ['Fator Crítico de Risco', 'Pontuação'], 
            data.topRisks.map(r => [r.name, r.score])
        );
        html += createArrayTable(
            'Top 3 Fatores de Proteção', 
            ['Fator de Proteção', 'Pontuação'], 
            data.topProtections.map(p => [p.name, p.score])
        );
        
        html += createArrayTable(
            'Tendência de Clima (Evolução IRP Global)', 
            ['Mês/Ano', 'Pontuação de Clima'],
            data.climateTrend.labels.map((label, i) => [label, data.climateTrend.data[i]])
        );
        
        if (aiInsight) {
            html += `<h2>Insights Estratégicos com IA</h2>`;
            html += `<div><h3>${aiInsight.summary?.title}</h3><p>${aiInsight.summary?.content}</p></div>`;
            html += `<div><h3>${aiInsight.strengths?.title}</h3><ul>${aiInsight.strengths?.points?.map(p => `<li><strong>${p.factor}:</strong> ${p.description}</li>`).join('')}</ul></div>`;
            html += `<div><h3>${aiInsight.attentionPoints?.title}</h3><ul>${aiInsight.attentionPoints?.points?.map(p => `<li><strong>${p.factor}:</strong> ${p.description}</li>`).join('')}</ul></div>`;
            html += `<div><h3>${aiInsight.recommendations?.title}</h3>${aiInsight.recommendations?.points?.map(p => `<h4>${p.forFactor}</h4><ul>${p.actions?.map(a => `<li>${a}</li>`).join('')}</ul>`).join('')}</div>`;
            html += `<div><h3>${aiInsight.nextSteps?.title}</h3><p>${aiInsight.nextSteps?.content}</p></div>`;
        }
        
        exportToExcel(html, 'Relatorio_Dashboard_Progredire');
    }, [data, aiInsight]);

    const handlePrintReport = () => {
        const reportContent = document.getElementById('ai-report-content')?.innerHTML;
        if (!reportContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, permita pop-ups para imprimir o relatório.');
            return;
        }
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Relatório Estratégico - Progredire+</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 2rem; }
                    </style>
                </head>
                <body>
                    <h1 class="text-2xl font-bold text-slate-800 mb-4">Relatório Estratégico</h1>
                    <div class="space-y-4">${reportContent}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500); // Wait for styles to load
    };

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500">Carregando dados do dashboard...</p>
            </div>
        );
    }

    if (dataError) {
        return (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md" role="alert">
                <p className="font-bold text-lg">Falha ao carregar o dashboard</p>
                <p className="mt-2">{dataError}</p>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center text-slate-500 py-20">Nenhum dado encontrado para os filtros selecionados.</div>;
    }

    return (
    <>
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Executivo</h1>
                <button
                    onClick={handleExportXls}
                    disabled={!data || data.riskFactors.length === 0}
                    className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Exportar XLS
                </button>
            </div>


            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mockFilters.map(f => (
                    <div key={f.id}>
                        <label htmlFor={f.id} className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                        <select id={f.id} value={filters[f.id] || ''} onChange={e => handleFilterChange(f.id, e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                            <option value="">Todos</option>
                            {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                ))}
            </div>
            
            <DashboardSection title="Visão Geral">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                    <KpiCard title="IRP (Índice de Risco Psicossocial) Global" tooltip="Índice de Risco Psicossocial: Nota de 1 a 5 que resume a saúde psicossocial geral. Valores mais altos são melhores."><span className="flex items-center">{data.irpGlobal.toFixed(1)} <span className={`ml-2 px-2 py-0.5 text-xs font-semibold text-white rounded-full ${data.riskClassification.color}`}>{data.riskClassification.text}</span></span></KpiCard>
                    <KpiCard title="% Respostas" tooltip="Percentual de colaboradores que responderam ao questionário. Uma alta adesão aumenta a precisão dos dados.">{data.participationRate.toFixed(0)}% <span className="text-base text-slate-500">de {80}</span></KpiCard>
                    <KpiCard title="ROI Estimado (25%)" tooltip="Retorno sobre o Investimento estimado ao reduzir os riscos psicossociais em 25%, com base na redução de custos com absenteísmo e presenteísmo.">{data.roiScenarios.find(s=>s.scenario === '25%')?.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'N/A'}</KpiCard>
                    <KpiCard title="Economia Estimada (Anual)" tooltip="Estimativa de economia anual ao mitigar os riscos identificados, impactando positivamente a produtividade e a retenção de talentos.">{data.estimatedSavings}</KpiCard>
                    <KpiCard title="Absenteísmo Estimado" tooltip="Percentual estimado de horas de trabalho perdidas devido a ausências não planejadas, influenciadas pelo clima organizacional.">{data.absenteeismRate.toFixed(1)}%</KpiCard>
                    <KpiCard title="IPE (Índice de Presenteísmo Emocional)" tooltip="Percentual estimado de perda de produtividade de colaboradores que estão no trabalho, mas não totalmente engajados devido a problemas psicossociais.">{data.presenteeismRate.toFixed(1)}%</KpiCard>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow border border-slate-200">
                        <div className="flex justify-between items-center">
                             <h3 className="text-md font-semibold text-slate-800">Nível de Maturidade</h3>
                             <InfoTooltip text="Classifica a capacidade da organização de gerenciar riscos psicossociais, variando de Reativa (M1) a Estratégica (M5)." />
                        </div>
                        <p className="text-xl font-bold text-slate-900 mt-1">{data.maturityLevel.level} - {data.maturityLevel.name}</p>
                        <MaturityProgressBar level={data.maturityLevel.level} />
                    </div>
                    <div className="lg:col-span-1">
                        <RankingCard 
                            title="Top 3 Fatores Críticos de Risco" 
                            tooltip="Os 3 fatores com as piores pontuações. Indicam as áreas que precisam de atenção prioritária."
                            items={data.topRisks} 
                            icon={ExclamationTriangleIcon} 
                            iconClass="text-red-500" 
                            onActionClick={(factorId) => onNavigateToActionPlan({ filters, factorId })}
                        />
                    </div>
                    <div className="lg:col-span-1">
                         <RankingCard title="Top 3 Fatores de Proteção" tooltip="Os 3 fatores com as melhores pontuações. Representam os pontos fortes da cultura organizacional." items={data.topProtections} icon={ShieldCheckIcon} iconClass="text-green-500" />
                    </div>
                </div>
            </DashboardSection>

            <DashboardSection title="Riscos e Clima Organizacional">
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-semibold text-slate-800">Distribuição de Riscos por Setor (%)</h3>
                                <InfoTooltip text="Mostra a proporção de setores classificados com risco psicossocial alto, moderado ou baixo." />
                            </div>
                             <StackedBarChart data={[{label: 'Setores', values: [
                                 { value: data.sectorRiskDistribution.high, color: '#ef4444', tooltip: `Risco Alto: ${data.sectorRiskDistribution.high.toFixed(1)}%` },
                                 { value: data.sectorRiskDistribution.moderate, color: '#f59e0b', tooltip: `Risco Moderado: ${data.sectorRiskDistribution.moderate.toFixed(1)}%` },
                                 { value: data.sectorRiskDistribution.low, color: '#22c55e', tooltip: `Risco Baixo: ${data.sectorRiskDistribution.low.toFixed(1)}%` },
                             ]}]} />
                        </div>
                         <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-semibold text-slate-800">Tendência de Clima (Evolução do IRP Global - Índice de Risco Psicossocial)</h3>
                                <InfoTooltip text="Gráfico que acompanha a evolução da pontuação geral (IRP Global) ao longo do tempo, mostrando a trajetória da saúde organizacional." />
                            </div>
                            <LineChart chartData={data.climateTrend} yMin={0} yMax={100} yAxisLabels={[0, 25, 50, 75, 100]} />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-semibold text-slate-800">Histórico de Afastamentos (INSS)</h3>
                                <InfoTooltip text="Acompanha o número de colaboradores afastados pelo INSS ao longo dos meses, um indicador chave do impacto do bem-estar na saúde ocupacional." />
                            </div>
                            <LineChart 
                                chartData={{
                                    labels: data.inssLeaveTrend.labels,
                                    datasets: [{
                                        label: 'Colaboradores Afastados',
                                        data: data.inssLeaveTrend.data,
                                        color: '#8b5cf6'
                                    }]
                                }} 
                                yMax={15}
                                yAxisLabels={[0, 5, 10, 15]}
                            />
                        </div>
                         <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                <div className="flex-grow">
                                    <h3 className="text-md font-semibold text-slate-800">Tipos de Afastamentos (Últimos {leavePeriod} meses)</h3>
                                </div>
                                <div className="flex-shrink-0">
                                    <select 
                                        value={leavePeriod} 
                                        onChange={(e) => setLeavePeriod(e.target.value)}
                                        className="text-sm p-1 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="3">Últimos 3 meses</option>
                                        <option value="6">Últimos 6 meses</option>
                                        <option value="12">Últimos 12 meses</option>
                                    </select>
                                </div>
                            </div>
                             <InfoTooltip text="Distribuição dos motivos de afastamentos relacionados à saúde mental, com base nos dados disponíveis." />
                            <SimpleHorizontalBarChart 
                                data={processedLeaveData}
                                color="#8b5cf6"
                            />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                         <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-semibold text-slate-800">Perfil de Risco Comparativo</h3>
                            <InfoTooltip text="Compara o perfil de risco do segmento selecionado com a média geral da empresa, destacando desvios e particularidades." />
                         </div>
                         <RadarChart data={{
                            labels: data.riskFactors.map(f => f.name.replace(' e ', '/').split(' ')[0]),
                            datasets: [
                                { label: 'Média Empresa', data: data.companyAverageFactors.map(f => f.score), borderColor: 'rgba(107, 114, 128, 0.4)', backgroundColor: 'rgba(107, 114, 128, 0.1)'},
                                { label: 'Seleção Atual', data: data.riskFactors.map(f => f.score), borderColor: 'rgba(59, 130, 246, 1)', backgroundColor: 'rgba(59, 130, 246, 0.2)'}
                            ]
                         }} />
                    </div>
                 </div>
            </DashboardSection>

            <DashboardSection title="Engajamento e Liderança">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title="Percepção da Liderança" tooltip="Nota de 1 a 5 que reflete a avaliação dos colaboradores sobre a eficácia da liderança e comunicação."><span className="text-slate-800">{data.leadershipScore.toFixed(1)}<span className="text-base text-slate-500"> / 5.0</span></span></KpiCard>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-slate-500 truncate pr-2">Segurança Psicológica</h3>
                            <InfoTooltip text="Mede a percepção de que é seguro expressar opiniões e errar sem medo de punição. Um pilar para a inovação." />
                        </div>
                         <ThermometerChart value={data.safetyScore} max={5.0} />
                    </div>
                    <KpiCard title="Equilíbrio Vida-Trabalho" tooltip="Avalia a percepção dos colaboradores sobre a capacidade de conciliar as demandas profissionais e pessoais."><span className="text-slate-800">{data.workLifeBalanceScore.toFixed(1)}<span className="text-base text-slate-500"> / 5.0</span></span></KpiCard>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-200 flex flex-col items-center justify-center">
                        <div className="flex justify-between items-center w-full mb-1">
                            <h3 className="text-sm font-medium text-slate-500">% Líderes em Desenvolvimento</h3>
                            <InfoTooltip text="Percentual de líderes participando ativamente de programas de desenvolvimento focados em competências de gestão de pessoas e bem-estar." />
                        </div>
                         <DonutChart value={data.leadersInDevelopment} color="#3b82f6" />
                    </div>
                </div>
            </DashboardSection>
            
            <DashboardSection title="Análise Cruzada Estratégica">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnalysisCard title="IRP (Índice de Risco Psicossocial) × IPE (Índice de Presenteísmo Emocional)" tooltip="Compara a saúde psicossocial (IRP) com a perda de produtividade (presenteísmo) em cada setor. A cor da barra indica o nível do IRP.">
                        <HorizontalBarChartWithColorScale 
                            data={data.crossAnalysis.irpVsPresenteeism.map(d => ({
                                label: d.label,
                                value: d.y, // presenteeism
                                colorValue: d.x, // IRP
                                sizeValue: d.z, // collaborators
                            }))}
                            valueLabel="Presenteísmo Estimado (%)"
                            colorValueLabel="IRP (1-5)"
                            colorScale={getIRPColor}
                        />
                    </AnalysisCard>

                    <AnalysisCard title="IRP (Índice de Risco Psicossocial) × Turnover" tooltip="Compara a tendência do IRP Global com a taxa de turnover trimestral, ajudando a identificar como o clima impacta a retenção.">
                        <LineChart chartData={data.crossAnalysis.irpVsTurnover} yAxisLabels={[0, 5, 10, 15, 20]} />
                    </AnalysisCard>

                    <AnalysisCard title="Diagnóstico por Dimensão e Área (Heatmap)" tooltip="Mapa de calor que cruza as dimensões de risco psicossocial com as áreas da empresa. Cores mais quentes (vermelho/laranja) indicam pontos críticos (nota de 1 a 5)." className="xl:col-span-2">
                        <HeatmapChart data={data.crossAnalysis.dimensionVsAreaHeatmap} />
                    </AnalysisCard>

                    <AnalysisCard title="IPE (Índice de Presenteísmo Emocional) × ROI" tooltip="Estima o custo anual do presenteísmo e o potencial de economia (ROI) ao implementar ações que melhorem a saúde mental e reduzam a perda de produtividade.">
                        <PotentialAnalysisChart data={data.crossAnalysis.presenteeismVsRoi} />
                    </AnalysisCard>
                    
                    <AnalysisCard title="Ações × Impacto (IRP - Índice de Risco Psicossocial)" tooltip="Visualiza a eficácia das intervenções. A altura da barra mostra a melhoria no IRP (Impacto). A cor da barra indica o progresso do plano de ação.">
                        <ActionsImpactChart data={data.crossAnalysis.actionsVsImpact} yAxisLabel="Melhora no IRP (Pontos)" />
                    </AnalysisCard>
                    
                    <AnalysisCard title="Evolução do IRP (Índice de Risco Psicossocial)" tooltip="Monitora a tendência trimestral ou mensal do Índice de Risco Psicossocial (IRP) geral da empresa." className="xl:col-span-2">
                        <LineChart chartData={{ labels: data.crossAnalysis.irpEvolution.labels, datasets: [{ label: 'IRP Global', data: data.crossAnalysis.irpEvolution.data, color: '#3b82f6' }] }} yMin={0} yMax={100} yAxisLabels={[0, 25, 50, 75, 100]} />
                    </AnalysisCard>
                </div>
            </DashboardSection>

            <DashboardSection title="Insights Estratégicos com IA">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                     <button onClick={handleGenerateInsight} disabled={isInsightLoading || data.participationRate === 0} className="flex-grow flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400">
                            {isInsightLoading ? <><LoadingSpinner /> Gerando Relatório...</> : <><SparklesIcon className="w-5 h-5" /> Gerar Relatório Estratégico</>}
                        </button>
                    {aiInsight && (
                        <button
                            onClick={handlePrintReport}
                            className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2.5 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            Imprimir Relatório
                        </button>
                    )}
                </div>
                {insightError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Ocorreu um erro</p><p>{insightError}</p></div>}
                {aiInsight ? (
                    <div id="ai-report-content" className="space-y-4 mt-4 max-h-[80vh] overflow-y-auto pr-2">
                       <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                            <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">📊</span>{aiInsight.summary?.title || 'Sumário Executivo'}</h3>
                            <p className="text-sm text-slate-600">{aiInsight.summary?.content}</p>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                            <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">✅</span>{aiInsight.strengths?.title || 'Principais Pontos Fortes'}</h3>
                            <ul className="space-y-2 text-sm">{aiInsight.strengths?.points?.map((p, i) => (<li key={i}><strong className="text-slate-700">{p.factor}:</strong><span className="text-slate-600 ml-1">{p.description}</span></li>))}</ul>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                            <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">⚠️</span>{aiInsight.attentionPoints?.title || 'Principais Pontos de Atenção'}</h3>
                            <ul className="space-y-2 text-sm">{aiInsight.attentionPoints?.points?.map((p, i) => (<li key={i}><strong className="text-slate-700">{p.factor}:</strong><span className="text-slate-600 ml-1">{p.description}</span></li>))}</ul>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                            <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">💡</span>{aiInsight.recommendations?.title || 'Recomendações Estratégicas'}</h3>
                            <div className="space-y-3 text-sm">{aiInsight.recommendations?.points?.map((p, i) => (<div key={i}><h4 className="font-semibold text-slate-700">{p.forFactor}</h4><ul className="list-disc list-inside space-y-1 text-slate-600 mt-1">{p.actions?.map((action, j) => <li key={j}>{action}</li>)}</ul></div>))}</div>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                            <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">🚀</span>{aiInsight.nextSteps?.title || 'Próximos Passos'}</h3>
                            <p className="text-sm text-slate-600">{aiInsight.nextSteps?.content}</p>
                        </div>
                    </div>
                ) : (data.participationRate > 0 && <p className="text-center text-sm text-slate-500">Clique no botão acima para gerar uma análise estratégica completa dos dados atuais.</p>)}
            </DashboardSection>

        </div>
        <footer className="text-center mt-8">
            <p className="text-sm text-slate-500">
                Progredire+ | Ferramenta de análise psicológica organizacional.
            </p>
        </footer>
    </>
    );
};