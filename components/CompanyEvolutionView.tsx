import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { runEvolutionAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { BrainIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChevronDownIcon, ArrowDownTrayIcon, PrinterIcon } from './icons';
import { mockResponses, dimensions, mockFilters } from './dashboardMockData';
import { LineChart, Sparkline } from './Charts';

const factorIdToName: Record<string, string> = {
    'geral': 'Saúde Geral',
    ...Object.fromEntries(Object.entries(dimensions).map(([id, { name }]) => [id, name]))
};
const allFactorIds = Object.keys(factorIdToName);

const likertToScore: Record<string, number> = {
    'Discordo totalmente': 1, 'Discordo parcialmente': 2, 'Neutro / Indiferente': 3, 'Concordo parcialmente': 4, 'Concordo totalmente': 5,
};

type EvolutionData = {
    labels: string[];
    data: number[];
    startScore: number;
    endScore: number;
    change: number;
};

type MultiLineChartData = {
    labels: string[];
    datasets: {
        label: string;
        data: (number | null)[];
        color: string;
        startScore: number;
        endScore: number;
        change: number;
    }[];
};

type PeriodRange = 'bimonthly' | 'quarterly' | 'semesterly' | 'annually' | 'all';

interface EvolutionInsightData {
    generalAnalysis: { title: string; content: string };
    majorAdvances: { title: string; points: { factor: string; description: string }[] };
    attentionPoints: { title: string; points: { factor: string; description: string }[] };
    strategicRecommendation: { title: string; content: string };
}

const getPeriodKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${String(month).padStart(2, '0')}`;
};

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

const calculateMultiSectorEvolution = (
    periodRange: PeriodRange,
    selectedSectors: string[],
    factorId: string
): MultiLineChartData => {
    
    // 1. Determine date range
    const allTimestamps = mockResponses.map(r => r.timestamp);
    const latestDate = new Date(Math.max(...allTimestamps));
    let startDate = new Date(Math.min(...allTimestamps));

    const monthsToSubtract: Record<Exclude<PeriodRange, 'all'>, number> = {
        bimonthly: 2,
        quarterly: 3,
        semesterly: 6,
        annually: 12,
    };

    if (periodRange !== 'all') {
        startDate = new Date(latestDate);
        startDate.setMonth(startDate.getMonth() - monthsToSubtract[periodRange]);
    }
    
    // 2. Filter responses by date
    const filteredResponses = mockResponses.filter(r => {
        const resDate = new Date(r.timestamp);
        return resDate >= startDate && resDate <= latestDate;
    });

    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#eab308'];
    const sectorData: Record<string, Record<string, { totalScore: number; count: number }>> = {};
    const allPeriodKeys = new Set<string>();

    selectedSectors.forEach(sector => {
        sectorData[sector] = {};
        const responsesForSector = sector === 'Geral'
            ? filteredResponses
            : filteredResponses.filter(r => r.segmentation.setor === sector);

        responsesForSector.forEach(res => {
            const date = new Date(res.timestamp);
            const periodKey = getPeriodKey(date);
            allPeriodKeys.add(periodKey);

            if (!sectorData[sector][periodKey]) {
                sectorData[sector][periodKey] = { totalScore: 0, count: 0 };
            }

            let score = 0;
            let questionCount = 0;

            if (factorId === 'geral') {
                Object.values(dimensions).forEach(dim => {
                    dim.questions.forEach(qId => {
                        const answer = res.answers[qId];
                        if (answer) {
                            score += likertToScore[answer] || 0;
                            questionCount++;
                        }
                    });
                });
            } else {
                const dimQuestions = dimensions[factorId]?.questions;
                if (dimQuestions) {
                    dimQuestions.forEach(qId => {
                        const answer = res.answers[qId];
                        if (answer) {
                            score += likertToScore[answer] || 0;
                            questionCount++;
                        }
                    });
                }
            }

            if (questionCount > 0) {
                sectorData[sector][periodKey].totalScore += score / questionCount;
                sectorData[sector][periodKey].count++;
            }
        });
    });
    
    const sortedLabels = Array.from(allPeriodKeys).sort();
    
    const datasets = selectedSectors.map((sector, index) => {
        const data: (number | null)[] = sortedLabels.map(key => {
            const periodData = sectorData[sector][key];
            if (!periodData || periodData.count === 0) return null;
            const avgScore = periodData.totalScore / periodData.count;
            return Math.round(((avgScore - 1) / 4) * 100);
        });

        const validData = data.filter((d): d is number => d !== null);
        const startScore = validData.length > 0 ? validData[0] : 0;
        const endScore = validData.length > 0 ? validData[validData.length - 1] : 0;
        const change = startScore > 0 ? ((endScore - startScore) / startScore) * 100 : 0;
        
        return {
            label: sector,
            data,
            color: colors[index % colors.length],
            startScore,
            endScore,
            change,
        };
    });

    const formattedLabels = sortedLabels.map(key => {
        const [year, month] = key.split('-');
        return `${month}/${year.slice(2)}`;
    });

    return { labels: formattedLabels, datasets };
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
                 let totalResponseScore = 0;
                 let totalQuestionCount = 0;
                 Object.values(dimensions).forEach(dim => {
                    dim.questions.forEach(qId => {
                        const answer = res.answers[qId];
                        if (answer) {
                            totalResponseScore += likertToScore[answer] || 0;
                            totalQuestionCount++;
                        }
                    });
                 });
                if (totalQuestionCount > 0) {
                    const avgResponseScore = totalResponseScore / totalQuestionCount;
                    monthlyData[monthKey][factorId].totalScore += avgResponseScore;
                    monthlyData[monthKey][factorId].count++;
                }
            } else { // It's a dimension
                const dimQuestions = dimensions[factorId]?.questions;
                if(dimQuestions) {
                    let totalDimScore = 0;
                    let questionCount = 0;
                    dimQuestions.forEach(qId => {
                         const answer = res.answers[qId];
                         if (answer) {
                            totalDimScore += likertToScore[answer] || 0;
                            questionCount++;
                         }
                    });
                    if (questionCount > 0) {
                        const avgDimScore = totalDimScore / questionCount;
                        monthlyData[monthKey][factorId].totalScore += avgDimScore;
                        monthlyData[monthKey][factorId].count++;
                    }
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
            const monthFactorData = monthlyData[key]?.[factorId];
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


export const CompanyEvolutionView: React.FC = () => {
    const [selectedFactorId, setSelectedFactorId] = useState<string>('geral');
    const [periodRange, setPeriodRange] = useState<PeriodRange>('annually');
    const [selectedSectors, setSelectedSectors] = useState<string[]>(['Geral']);
    const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
    
    const [aiInsight, setAiInsight] = useState<EvolutionInsightData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const allFactorsEvolutionData = useMemo(() => calculateAllFactorsEvolution(), []);
    
    const chartEvolutionData = useMemo(() => {
        return calculateMultiSectorEvolution(periodRange, selectedSectors, selectedFactorId);
    }, [periodRange, selectedSectors, selectedFactorId]);
    
    const singleSectorDisplayData = useMemo(() => {
        if (chartEvolutionData.datasets.length === 1) {
            return chartEvolutionData.datasets[0];
        }
        return null;
    }, [chartEvolutionData]);
    
    const sectorOptions = useMemo(() => ['Geral', ...(mockFilters.find(f => f.id === 'setor')?.options || [])], []);
    
    const handleSectorToggle = (sector: string) => {
        setSelectedSectors(prev => {
            const isSelected = prev.includes(sector);
            if (sector === 'Geral') {
                return ['Geral'];
            }
            const withoutGeral = prev.filter(s => s !== 'Geral');
            
            if (isSelected) {
                const newSelection = withoutGeral.filter(s => s !== sector);
                return newSelection.length > 0 ? newSelection : ['Geral'];
            } else {
                return [...withoutGeral, sector];
            }
        });
    };

    const { topMovers, bottomMovers } = useMemo(() => {
        const factors = Object.entries(allFactorsEvolutionData)
            .filter(([id]) => id !== 'geral')
            // FIX: Explicitly cast `a` and `b` to `EvolutionData` to resolve TypeScript's type inference issue within the sort callback, which was causing the `.change` property access to fail.
            .sort(([, a], [, b]) => (b as EvolutionData).change - (a as EvolutionData).change);
        return {
            topMovers: factors.slice(0, 5),
            bottomMovers: factors.slice(-5).reverse(),
        };
    }, [allFactorsEvolutionData]);

    const handleGenerateInsight = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAiInsight(null);

        const generalData = allFactorsEvolutionData.geral;
        if (!generalData || generalData.labels.length === 0) {
            setError("Não há dados de evolução suficientes para gerar a análise.");
            setIsLoading(false);
            return;
        }

        let promptData = `Análise do período de ${generalData.labels[0]} a ${generalData.labels[generalData.labels.length - 1]}:\n\n`;
        
        Object.keys(allFactorsEvolutionData).forEach((factorId) => {
            const data = allFactorsEvolutionData[factorId];
            promptData += `- ${factorIdToName[factorId]}:\n  - Pontuação Inicial: ${data.startScore}\n  - Pontuação Final: ${data.endScore}\n\n`;
        });

        try {
            const resultString = await runEvolutionAnalysis(promptData);
            setAiInsight(JSON.parse(resultString));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [allFactorsEvolutionData]);
    
    const handleExportXls = useCallback(() => {
        if (!chartEvolutionData || chartEvolutionData.labels.length === 0) return;

        const createArrayTable = (title: string, headers: string[], rows: (string|number|null)[][]) => {
            let table = `<h2>${title}</h2><table><thead><tr>`;
            headers.forEach(h => table += `<th>${h}</th>`);
            table += '</tr></thead><tbody>';
            rows.forEach(row => {
                table += '<tr>';
                row.forEach(cell => table += `<td>${cell ?? ''}</td>`);
                table += '</tr>';
            });
            table += '</tbody></table>';
            return table;
        };

        let html = `<h1>Relatório de Evolução Organizacional</h1>`;

        const periodLabels: Record<PeriodRange, string> = {
            'bimonthly': 'Últimos 2 Meses',
            'quarterly': 'Últimos 3 Meses',
            'semesterly': 'Últimos 6 Meses',
            'annually': 'Último Ano',
            'all': 'Todo o período'
        };

        html += '<h2>Contexto da Análise</h2><table><tbody>';
        html += `<tr><td><strong>Fator Analisado</strong></td><td>${factorIdToName[selectedFactorId]}</td></tr>`;
        html += `<tr><td><strong>Período</strong></td><td>${periodLabels[periodRange]}</td></tr>`;
        html += `<tr><td><strong>Setores</strong></td><td>${selectedSectors.join(', ')}</td></tr>`;
        html += '</tbody></table>';
        
        const chartHeaders = ['Mês', ...chartEvolutionData.datasets.map(ds => ds.label)];
        const chartRows = chartEvolutionData.labels.map((label, index) => {
            return [label, ...chartEvolutionData.datasets.map(ds => ds.data[index] ?? null)];
        });
        html += createArrayTable(`Evolução - ${factorIdToName[selectedFactorId]}`, chartHeaders, chartRows);

        const moversHeaders = ['Fator de Risco', 'Pontuação Inicial', 'Pontuação Final', 'Variação (%)'];
        const topMoversRows = topMovers.map(([id, data]) => [
            factorIdToName[id], data.startScore, data.endScore, data.change.toFixed(1)
        ]);
        html += createArrayTable('Maiores Avanços (Período Completo)', moversHeaders, topMoversRows as (string|number)[][]);
        
        const bottomMoversRows = bottomMovers.map(([id, data]) => [
            factorIdToName[id], data.startScore, data.endScore, data.change.toFixed(1)
        ]);
        html += createArrayTable('Principais Pontos de Atenção (Período Completo)', moversHeaders, bottomMoversRows as (string|number)[][]);

        if (aiInsight) {
            html += `<h2>Análise da Evolução com IA</h2>`;
            html += `<div><h3>${aiInsight.generalAnalysis?.title}</h3><p>${aiInsight.generalAnalysis?.content}</p></div>`;
            html += `<div><h3>${aiInsight.majorAdvances?.title}</h3><ul>${aiInsight.majorAdvances?.points?.map(p => `<li><strong>${p.factor}:</strong> ${p.description}</li>`).join('')}</ul></div>`;
            html += `<div><h3>${aiInsight.attentionPoints?.title}</h3><ul>${aiInsight.attentionPoints?.points?.map(p => `<li><strong>${p.factor}:</strong> ${p.description}</li>`).join('')}</ul></div>`;
            html += `<div><h3>${aiInsight.strategicRecommendation?.title}</h3><p>${aiInsight.strategicRecommendation?.content}</p></div>`;
        }

        exportToExcel(html, 'Relatorio_Evolucao_Progredire');
    }, [chartEvolutionData, selectedFactorId, topMovers, bottomMovers, aiInsight, periodRange, selectedSectors]);

    const handlePrintAnalysis = () => {
        const analysisContent = document.getElementById('ai-evolution-analysis-content')?.innerHTML;
        if (!analysisContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, permita pop-ups para imprimir a análise.');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Análise da Evolução - Progredire+</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                     <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 2rem; }
                    </style>
                </head>
                <body>
                    <h1 class="text-2xl font-bold text-slate-800 mb-4">Análise da Evolução Organizacional</h1>
                    <div class="space-y-4">${analysisContent}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSectorDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Evolução Organizacional</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Gráfico de Evolução</h2>
                    <button
                        onClick={handleExportXls}
                        disabled={!chartEvolutionData || chartEvolutionData.labels.length === 0}
                        className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Exportar Dados (XLS)
                    </button>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Factor Filter */}
                    <div className="lg:col-span-1">
                        <label htmlFor="factor-select" className="block text-sm font-medium text-slate-700 mb-1">Analisar Fator</label>
                        <select 
                            id="factor-select"
                            value={selectedFactorId}
                            onChange={(e) => setSelectedFactorId(e.target.value)}
                            className="p-2 w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                            {allFactorIds.map(id => <option key={id} value={id}>{factorIdToName[id]}</option>)}
                        </select>
                    </div>
                    {/* Period Filter */}
                    <div className="lg:col-span-1">
                         <label htmlFor="period-select" className="block text-sm font-medium text-slate-700 mb-1">Período de Análise</label>
                        <select 
                            id="period-select"
                            value={periodRange}
                            onChange={(e) => setPeriodRange(e.target.value as any)}
                            className="p-2 w-full bg-white border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="bimonthly">Últimos 2 Meses</option>
                            <option value="quarterly">Últimos 3 Meses</option>
                            <option value="semesterly">Últimos 6 Meses</option>
                            <option value="annually">Último Ano</option>
                            <option value="all">Todo o período</option>
                        </select>
                    </div>
                     {/* Sector Filter */}
                    <div className="relative lg:col-span-2" ref={dropdownRef}>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Setores</label>
                        <button
                            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                            className="p-2 w-full bg-white border border-slate-300 rounded-md shadow-sm flex justify-between items-center text-left"
                        >
                            <span className="truncate pr-2">
                                {selectedSectors.length === 1 ? selectedSectors[0] : `${selectedSectors.length} setores selecionados`}
                            </span>
                            <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                        </button>
                        {isSectorDropdownOpen && (
                             <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-300 rounded-md shadow-lg">
                                {sectorOptions.map(sector => (
                                    <label key={sector} className="flex items-center space-x-2 p-2 hover:bg-slate-100 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedSectors.includes(sector)}
                                            onChange={() => handleSectorToggle(sector)}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">{sector}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {singleSectorDisplayData && (
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="bg-slate-50 p-2 rounded-md">
                            <div className="text-xs text-slate-500">Início</div>
                            <div className="font-bold text-slate-800 text-lg">{singleSectorDisplayData.startScore}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-md">
                            <div className="text-xs text-slate-500">Fim</div>
                            <div className="font-bold text-slate-800 text-lg">{singleSectorDisplayData.endScore}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-md">
                            <div className="text-xs text-slate-500">Variação</div>
                            <div className={`font-bold text-lg ${singleSectorDisplayData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {singleSectorDisplayData.change.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                )}
                
                <LineChart chartData={chartEvolutionData} yMin={0} yMax={100} yAxisLabels={[0, 25, 50, 75, 100]} />
            </div>

             <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Análise da Evolução com IA</h2>
                <p className="text-slate-500 mb-4 max-w-2xl">
                    Obtenha um relatório estratégico completo sobre a trajetória da sua organização, identificando os principais avanços, desafios e recomendações.
                </p>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <button
                        onClick={handleGenerateInsight}
                        disabled={isLoading}
                        className="flex-grow flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? <><LoadingSpinner /> Analisando...</> : <><BrainIcon className="w-5 h-5" /> Analisar Evolução Completa</>}
                    </button>
                    {aiInsight && (
                        <button
                            onClick={handlePrintAnalysis}
                            className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2.5 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            Imprimir Análise
                        </button>
                    )}
                </div>
                
                 {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <p className="font-bold">Ocorreu um erro</p><p>{error}</p>
                    </div>
                )}
                {aiInsight && (
                    <div id="ai-evolution-analysis-content" className="space-y-4 mt-4 max-h-[80vh] overflow-y-auto pr-2">
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                           <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">📈</span>{aiInsight.generalAnalysis?.title || 'Análise Geral da Trajetória'}</h3>
                           <p className="text-sm text-slate-600">{aiInsight.generalAnalysis?.content}</p>
                       </div>
                       <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                           <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">✅</span>{aiInsight.majorAdvances?.title || 'Maiores Avanços'}</h3>
                           <ul className="space-y-2 text-sm">{aiInsight.majorAdvances?.points?.map((p, i) => (<li key={i}><strong className="text-slate-700">{p.factor}:</strong><span className="text-slate-600 ml-1">{p.description}</span></li>))}</ul>
                       </div>
                       <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                           <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">⚠️</span>{aiInsight.attentionPoints?.title || 'Principais Pontos de Atenção'}</h3>
                           <ul className="space-y-2 text-sm">{aiInsight.attentionPoints?.points?.map((p, i) => (<li key={i}><strong className="text-slate-700">{p.factor}:</strong><span className="text-slate-600 ml-1">{p.description}</span></li>))}</ul>
                       </div>
                       <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                           <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center"><span className="mr-2 text-xl">🎯</span>{aiInsight.strategicRecommendation?.title || 'Recomendação Estratégica'}</h3>
                           <p className="text-sm text-slate-600">{aiInsight.strategicRecommendation?.content}</p>
                       </div>
                   </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">📈 Maiores Avanços</h2>
                    <div className="space-y-4">
                        {topMovers.map(([id, data]) => (
                            <FactorEvolutionCard key={id} factorName={factorIdToName[id]} data={data as EvolutionData} />
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">📉 Principais Pontos de Atenção</h2>
                    <div className="space-y-4">
                        {bottomMovers.map(([id, data]) => (
                            <FactorEvolutionCard key={id} factorName={factorIdToName[id]} data={data as EvolutionData} />
                        ))}
                    </div>
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