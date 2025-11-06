
import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardData, DashboardData, RiskFactor } from '../services/dataService';
import { runDashboardAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon, ShieldCheckIcon, ExclamationTriangleIcon, ChevronDownIcon, ArrowDownTrayIcon, PrinterIcon } from './icons';
import { mockFilters } from './dashboardMockData';
import { GaugeChart, RadarChart, DistributionChart, LineChart, MaturityProgressBar, StackedBarChart, ThermometerChart, DonutChart } from './Charts';

// --- Types ---
interface AiInsightData {
    summary: { title: string; content: string };
    strengths: { title: string; points: { factor: string; description: string }[] };
    attentionPoints: { title: string; points: { factor: string; description: string }[] };
    recommendations: { title: string; points: { forFactor: string; actions: string[] }[] };
    nextSteps: { title: string; content: string };
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


// --- Sub-components ---
const KpiCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-4 rounded-lg shadow border border-slate-200 ${className}`}>
    <h3 className="text-sm font-medium text-slate-500 truncate">{title}</h3>
    <div className="mt-1 text-2xl font-semibold text-slate-900">{children}</div>
  </div>
);

const RankingCard: React.FC<{title: string, items: RiskFactor[], icon: React.ElementType, iconClass: string}> = ({title, items, icon: Icon, iconClass}) => (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <h3 className="text-md font-semibold text-slate-800 mb-3">{title}</h3>
        <ul className="space-y-2">
            {items.map(item => (
                <li key={item.id} className="flex items-center text-sm">
                    <Icon className={`w-5 h-5 mr-2 flex-shrink-0 ${iconClass}`} />
                    <span className="text-slate-700 flex-grow">{item.name}</span>
                    <span className="font-bold text-slate-800">{item.score}<span className="font-normal text-slate-500">/100</span></span>
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
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 border-t border-slate-200">{children}</div>
            </div>
        </div>
    );
};

// --- Main Component ---
export const DashboardView: React.FC<{ initialFilters?: Record<string, string> }> = ({ initialFilters }) => {
    const [filters, setFilters] = useState<Record<string, string>>(initialFilters || {});
    const [aiInsight, setAiInsight] = useState<AiInsightData | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [insightError, setInsightError] = useState<string | null>(null);

    // New state for data fetching
    const [data, setData] = useState<DashboardData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

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
                    <KpiCard title="IRP Global (1-5)"><span className="flex items-center">{data.irpGlobal.toFixed(1)} <span className={`ml-2 px-2 py-0.5 text-xs font-semibold text-white rounded-full ${data.riskClassification.color}`}>{data.riskClassification.text}</span></span></KpiCard>
                    <KpiCard title="% Respostas (Meta ≥80%)">{data.participationRate.toFixed(0)}% <span className="text-base text-slate-500">de {80}</span></KpiCard>
                    <KpiCard title="ROI Estimado (25%)">{data.roiScenarios.find(s=>s.scenario === '25%')?.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'N/A'}</KpiCard>
                    <KpiCard title="Economia Estimada (Anual)">{data.estimatedSavings}</KpiCard>
                    <KpiCard title="Absenteísmo Estimado">{data.absenteeismRate.toFixed(1)}%</KpiCard>
                    <KpiCard title="Presenteísmo Estimado">{data.presenteeismRate.toFixed(1)}%</KpiCard>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow border border-slate-200">
                        <h3 className="text-md font-semibold text-slate-800">Nível de Maturidade</h3>
                        <p className="text-xl font-bold text-slate-900 mt-1">{data.maturityLevel.level} - {data.maturityLevel.name}</p>
                        <MaturityProgressBar level={data.maturityLevel.level} />
                    </div>
                    <div className="lg:col-span-1">
                        <RankingCard title="Top 3 Fatores Críticos de Risco" items={data.topRisks} icon={ExclamationTriangleIcon} iconClass="text-red-500" />
                    </div>
                    <div className="lg:col-span-1">
                         <RankingCard title="Top 3 Fatores de Proteção" items={data.topProtections} icon={ShieldCheckIcon} iconClass="text-green-500" />
                    </div>
                </div>
            </DashboardSection>

            <DashboardSection title="Riscos e Clima Organizacional">
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                             <h3 className="text-md font-semibold text-slate-800 mb-2">Distribuição de Riscos por Setor (%)</h3>
                             <StackedBarChart data={[{label: 'Setores', values: [
                                 { value: data.sectorRiskDistribution.high, color: '#ef4444', tooltip: `Risco Alto: ${data.sectorRiskDistribution.high.toFixed(1)}%` },
                                 { value: data.sectorRiskDistribution.moderate, color: '#f59e0b', tooltip: `Risco Moderado: ${data.sectorRiskDistribution.moderate.toFixed(1)}%` },
                                 { value: data.sectorRiskDistribution.low, color: '#22c55e', tooltip: `Risco Baixo: ${data.sectorRiskDistribution.low.toFixed(1)}%` },
                             ]}]} />
                        </div>
                         <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                            <h3 className="text-md font-semibold text-slate-800 mb-2">Tendência de Clima (Evolução IRP Global)</h3>
                            <LineChart chartData={data.climateTrend} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                         <h3 className="text-md font-semibold text-slate-800 mb-2">Perfil de Risco Comparativo</h3>
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
                    <KpiCard title="Percepção da Liderança"><span className="text-slate-800">{data.leadershipScore.toFixed(1)}<span className="text-base text-slate-500"> / 5.0</span></span></KpiCard>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                         <h3 className="text-sm font-medium text-slate-500 truncate">Segurança Psicológica</h3>
                         <ThermometerChart value={data.safetyScore} max={5.0} />
                    </div>
                    <KpiCard title="Equilíbrio Vida-Trabalho"><span className="text-slate-800">{data.workLifeBalanceScore.toFixed(1)}<span className="text-base text-slate-500"> / 5.0</span></span></KpiCard>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-200 flex flex-col items-center justify-center">
                         <h3 className="text-sm font-medium text-slate-500">% Líderes em Desenvolvimento</h3>
                         <DonutChart value={data.leadersInDevelopment} color="#3b82f6" />
                    </div>
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
