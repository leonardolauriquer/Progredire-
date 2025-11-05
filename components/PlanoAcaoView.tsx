

import React, { useMemo } from 'react';
import { mockResponses, dimensions, mockFilters } from './dashboardMockData';
import { PrinterIcon } from './icons';

// --- Types & Data ---

type RiskFactor = { id: string; name: string; score: number };
type MaturityLevel = {
    level: string;
    name: string;
    description: string;
};

const likertToScore: Record<string, number> = {
  'Discordo totalmente': 1, 'Discordo parcialmente': 2, 'Neutro / Indiferente': 3, 'Concordo parcialmente': 4, 'Concordo totalmente': 5,
};
const allDimensionIds = Object.keys(dimensions);

const actionPlans: Record<string, {
    level: string;
    diagnosis: string;
    strategicObjective: string;
    focus: string;
    suggestedActions: string[];
    resultIndicators: string[];
}> = {
    'M1': {
        level: 'M1 - Reativa',
        diagnosis: 'Empresa que só reage após crises ou afastamentos. Cultura punitiva, liderança despreparada e ausência de políticas de apoio emocional.',
        strategicObjective: 'Reconhecer os riscos psicossociais e iniciar a conscientização sobre o tema.',
        focus: 'Sensibilização, diagnóstico e primeiros passos em segurança psicológica.',
        suggestedActions: [
            'Workshop de sensibilização sobre riscos psicossociais e NR-1.',
            'Criação de canal de escuta anônima.',
            'Implantação de política de prevenção ao assédio e violência psicológica.',
            'Reuniões de feedback básico para líderes.',
            'Avaliação inicial dos afastamentos e causas de adoecimento.'
        ],
        resultIndicators: [
            'Taxa de participação no diagnóstico.',
            'Redução de relatos de conflito.',
            'Primeiros registros de planos de ação setoriais.'
        ]
    },
    'M2': {
        level: 'M2 - Consciente',
        diagnosis: 'Empresa reconhece os problemas, mas ainda age de forma pontual. Liderança reage sem consistência. Falta sistematização.',
        strategicObjective: 'Estruturar práticas mínimas de cuidado e iniciar programas piloto de gestão emocional.',
        focus: 'Construir base organizacional para o gerenciamento dos riscos psicossociais.',
        suggestedActions: [
            'Capacitação inicial de líderes em comunicação empática e gestão emocional.',
            'Treinamentos sobre saúde mental e burnout para todos os colaboradores.',
            'Estruturação de um comitê de saúde emocional / ESG.',
            'Implantar indicadores básicos de clima e absenteísmo.',
            'Revisar jornadas e cargas de trabalho mais críticas.'
        ],
        resultIndicators: [
            'Redução do absenteísmo em até 10%.',
            '70% dos líderes treinados em gestão emocional.',
            'Canal de escuta ativo e divulgado.'
        ]
    },
    'M3': {
        level: 'M3 - Estruturada',
        diagnosis: 'Há políticas de cuidado e prevenção, mas ainda falta integração entre áreas e mensuração contínua. A cultura começa a mudar.',
        strategicObjective: 'Consolidar práticas e medir impactos sobre clima, produtividade e saúde emocional.',
        focus: 'Integração entre RH, liderança e segurança do trabalho.',
        suggestedActions: [
            'Implementar rotinas trimestrais de avaliação psicossocial.',
            'Inserir riscos psicossociais oficialmente no PGR.',
            'Criar plano de desenvolvimento de lideranças de médio prazo.',
            'Implantar programas de reconhecimento e feedback estruturado.',
            'Comunicar resultados e avanços ao time de forma transparente.'
        ],
        resultIndicators: [
            'IRP médio acima de 3,5.',
            'Redução de turnover em até 15%.',
            'Aumento da percepção de justiça e reconhecimento.'
        ]
    },
    'M4': {
        level: 'M4 - Preventiva',
        diagnosis: 'Empresa age de forma preventiva, com cultura de confiança e comunicação aberta. Ainda há espaço para integrar indicadores estratégicos e ROI.',
        strategicObjective: 'Sustentar a cultura de saúde emocional e criar sistemas de melhoria contínua.',
        focus: 'Desenvolvimento humano e integração com performance.',
        suggestedActions: [
            'Programas contínuos de liderança emocional e segurança psicológica.',
            'Medições semestrais com comparativos e dashboards.',
            'Criação de trilhas de desenvolvimento (soft skills e liderança compassiva).',
            'Políticas de flexibilidade e equilíbrio vida-trabalho.',
            'Envolvimento de diretoria nas pautas de clima e bem-estar.'
        ],
        resultIndicators: [
            'ROI positivo (> 15% de economia em custos com pessoas).',
            'Aumento da satisfação média dos colaboradores (ISG ≥ 4,0).',
            'Redução de presenteísmo acima de 20%.'
        ]
    },
    'M5': {
        level: 'M5 - Estratégica',
        diagnosis: 'Bem-estar emocional é valor institucional. O cuidado faz parte da cultura e é gerido como indicador de negócio.',
        strategicObjective: 'Tornar-se referência em cultura saudável e alto desempenho sustentável.',
        focus: 'Inovação, governança emocional e impacto social.',
        suggestedActions: [
            'Implantar programa anual “Empresa Emocionalmente Inteligente".',
            'Integrar saúde emocional aos relatórios ESG e metas estratégicas.',
            'Mentoria individual para diretores e líderes-chave.',
            'Monitoramento contínuo de riscos com dashboard inteligente.',
            'Certificação interna: “Ambiente Psicossocial Saudável – Método Natieli Griz®".'
        ],
        resultIndicators: [
            'Turnover < 5%.',
            'ISG ≥ 4,5.',
            'Empresa reconhecida publicamente (premiações, índices ESG).',
            'ROI acumulado > 30% em 12 meses.'
        ]
    }
};

const maturityLevels: Record<string, {name: string, description: string}> = {
    'M1': { name: 'Reativa', description: 'Atuação apenas após crises (>60% dos fatores em risco alto).' },
    'M2': { name: 'Consciente', description: 'Reconhece riscos, mas sem plano estruturado (40-60% em risco moderado/alto).' },
    'M3': { name: 'Estruturada', description: 'Políticas em implantação (30-40% em risco moderado).' },
    'M4': { name: 'Preventiva', description: 'Gestão ativa do clima (10-30% em risco moderado).' },
    'M5': { name: 'Estratégica', description: 'Cultura de bem-estar consolidada (>80% dos fatores em risco baixo).' },
};


// --- Helper Functions ---

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
    return { level: 'M4', ...maturityLevels['M4'] };
};

const calculateDataForResponses = (responses: typeof mockResponses) => {
    const totalDimensionScores: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};
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
    return { riskFactors };
};

const calculateCompanyData = () => {
    const { riskFactors } = calculateDataForResponses(mockResponses);
    const maturityLevel = getMaturityLevel(riskFactors);
    const topRisks = [...riskFactors].sort((a, b) => a.score - b.score).slice(0, 3);
    
    const sectors = mockFilters.find(f => f.id === 'setor')?.options || [];
    const sectorScores = sectors.map(sector => {
        const sectorResponses = mockResponses.filter(r => r.segmentation.setor === sector);
        if (sectorResponses.length < 5) return { sector, score: -1 }; // Ignore small groups
        const { riskFactors: sectorRiskFactors } = calculateDataForResponses(sectorResponses);
        const irpGlobal = (sectorRiskFactors.reduce((acc, curr) => acc + curr.score, 0) / sectorRiskFactors.length) / 100 * 4 + 1;
        return { sector, score: irpGlobal };
    }).filter(s => s.score !== -1);
    
    const mostAffectedSectors = sectorScores.sort((a, b) => a.score - b.score).slice(0, 3);

    return { maturityLevel, topRisks, mostAffectedSectors };
};

// --- Sub-components ---

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <h3 className="text-md font-semibold text-slate-600 mb-2">{title}</h3>
        {children}
    </div>
);

const PlanSection: React.FC<{ title: string; children: React.ReactNode; icon: string }> = ({ title, children, icon }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <span className="text-xl mr-3">{icon}</span>
            {title}
        </h3>
        <div className="pl-9 text-slate-600 text-sm space-y-2">
            {children}
        </div>
    </div>
);


export const PlanoAcaoView: React.FC = () => {
    const { maturityLevel, topRisks, mostAffectedSectors } = useMemo(() => calculateCompanyData(), []);
    const currentPlan = actionPlans[maturityLevel.level as keyof typeof actionPlans];

    const handlePrintPlan = () => {
        window.print();
    };

    if (!currentPlan) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-slate-800">Plano de Ação</h2>
                <p className="text-slate-500 mt-2">Não foi possível determinar um plano de ação. Verifique se há dados suficientes.</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media print {
                    body > #root > aside,
                    body > #root > .md\\:pl-64 > header,
                    body > #root > nav,
                    .no-print {
                        display: none !important;
                    }
                    body > #root > .md\\:pl-64 {
                        padding-left: 0 !important;
                    }
                    main {
                        padding: 1rem !important;
                    }
                    .printable-area {
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
            <div className="space-y-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Plano de Ação Direcionado (Etapa 6)</h1>
                        <p className="text-slate-600 mt-1 max-w-3xl">
                            Com base nos resultados do diagnóstico, este plano de ação é recomendado para guiar a evolução da maturidade psicossocial da empresa.
                        </p>
                    </div>
                    <button
                        onClick={handlePrintPlan}
                        className="no-print ml-4 flex-shrink-0 flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        Imprimir Plano
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                    <InfoCard title="Nível de Maturidade Geral">
                        <p className="text-xl font-bold text-blue-600">{currentPlan.level}</p>
                    </InfoCard>
                    <InfoCard title="Dimensões Mais Críticas">
                        <ul className="list-disc list-inside text-sm text-slate-700">
                            {topRisks.map(risk => <li key={risk.id}>{risk.name}</li>)}
                        </ul>
                    </InfoCard>
                    <InfoCard title="Setores Mais Afetados">
                        <ul className="list-disc list-inside text-sm text-slate-700">
                            {mostAffectedSectors.map(s => <li key={s.sector}>{s.sector} (IRP: {s.score.toFixed(1)})</li>)}
                        </ul>
                    </InfoCard>
                </div>
                
                {/* Action Plan Details */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6 printable-area">
                    <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Plano de Ação para Nível: {currentPlan.level}</h2>
                    
                    <PlanSection title="Diagnóstico" icon="🩺">
                        <p>{currentPlan.diagnosis}</p>
                    </PlanSection>

                    <PlanSection title="Objetivo Estratégico" icon="🎯">
                        <p>{currentPlan.strategicObjective}</p>
                    </PlanSection>

                    <PlanSection title="Foco de Atuação" icon="🔍">
                        <p>{currentPlan.focus}</p>
                    </PlanSection>

                    <PlanSection title="Ações Sugeridas" icon="💡">
                        <ul className="list-disc list-inside space-y-2">
                            {currentPlan.suggestedActions.map((action, index) => <li key={index}>{action}</li>)}
                        </ul>
                    </PlanSection>

                    <PlanSection title="Indicadores de Resultado" icon="📈">
                        <ul className="list-disc list-inside space-y-2">
                            {currentPlan.resultIndicators.map((indicator, index) => <li key={index}>{indicator}</li>)}
                        </ul>
                    </PlanSection>
                </div>

                <footer className="text-center mt-8 no-print">
                    <p className="text-sm text-slate-500">
                        Progredire+ | Ferramenta de análise psicológica organizacional.
                    </p>
                </footer>
            </div>
        </>
    );
};