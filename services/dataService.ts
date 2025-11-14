import { authService } from './authService';
import { mockResponses as initialMockResponses, mockFilters, dimensions, Campaign, CampaignStatus, initialCampaigns, Document, mockDocuments } from '../components/dashboardMockData';

// --- Types ---
export type RiskFactor = { id: string; name: string; score: number };
type ResponseDistribution = { name: string; value: number; color: string; }[];
type MaturityLevel = {
    level: string;
    name: string;
    description: string;
};
export interface PotentialAnalysisData {
    totalCost: number;
    scenarios: {
        label: string;
        value: number;
    }[];
}
export interface CrossAnalysisData {
    irpVsPresenteeism: { x: number; y: number; z: number; label: string; }[];
    irpVsTurnover: { labels: string[]; datasets: { label: string; data: (number | null)[]; color: string; }[] };
    presenteeismVsRoi: PotentialAnalysisData;
    dimensionVsAreaHeatmap: { yLabels: string[]; xLabels: string[]; data: number[][]; };
    actionsVsImpact: { x: number; y: number; z: number; label: string; }[];
    irpEvolution: { labels: string[]; data: number[]; };
}
export type DashboardData = {
  geralScore: number;
  irpGlobal: number;
  riskClassification: { text: string; color: string; };
  participationRate: number;
  totalEmployees: number; // Added for display
  topRisks: RiskFactor[];
  topProtections: RiskFactor[];
  maturityLevel: MaturityLevel;
  riskFactors: RiskFactor[];
  companyAverageFactors: RiskFactor[];
  distributions: Record<string, ResponseDistribution>;
  sectorRiskDistribution: {high: number, moderate: number, low: number};
  climateTrend: {labels: string[], data: number[]};
  leadershipScore: number;
  safetyScore: number;
  workLifeBalanceScore: number;
  estimatedSavings: string;
  roiScenarios: { scenario: string; value: number }[];
  leadersInDevelopment: number;
  absenteeismRate: number;
  presenteeismRate: number;
  inssLeaveTrend: {labels: string[], data: number[]};
  leaveEvents: { type: string; date: string }[];
  crossAnalysis: CrossAnalysisData;
};
export interface CollaboratorEvolutionEntry {
    timestamp: number;
    scores: Record<string, number>; // key is dimension id, value is score 0-100
    generalScore: number;
}
export interface PublishedInitiative {
    id: number;
    publishedDate: string;
    factor: string;
    segment: string;
    objective: string;
    announcement: string;
    actions: { title: string; description: string; }[];
    status: 'Em Andamento' | 'Concluído';
    supportCount: number;
}
export interface Company {
    id: number;
    name: string; // Nome Fantasia
    razaoSocial: string;
    cnpj: string;
    setor: string;
    numColaboradores: number;
    contatoPrincipal: {
        nome: string;
        email: string;
    };
    address: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
}
export interface Employee {
    id: number;
    name: string;
    email: string;
    company: string;
    cpf: string;
    password?: string;
    dataNascimento: string; // YYYY-MM-DD
    genero: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar';
    dataAdmissao: string; // YYYY-MM-DD
    nivelCargo: 'Estagiário' | 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista' | 'Líder/Coordenador' | 'Gerente' | 'Diretor';
    unidade?: string;
    liderDireto?: string;
    status: 'Ativo' | 'Inativo' | 'Férias' | 'Licença';
}
export interface Branch {
    id: number;
    name: string;
    companyId: number;
    address: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
}
export interface CompanyUser {
    id: number;
    name: string;
    email: string;
    password?: string;
    companyId: number;
    companyName: string;
    role: 'Admin' | 'RH' | 'Leader';
    status: 'Ativo' | 'Inativo';
}

interface ImportContext {
    companyId: string;
    branchId?: string;
}


// --- Constants ---
const MOCK_RESPONSES_KEY = 'progredire-mock-responses';
const HISTORICAL_INDICATORS_KEY = 'progredire-historical-indicators';
const LEAVE_EVENTS_KEY = 'progredire-leave-events';
const LEADERSHIP_DATA_KEY = 'progredire-leadership-data';
const FINANCIAL_DATA_KEY = 'progredire-financial-data';
const COLLABORATOR_EVOLUTION_KEY = 'progredire-collaborator-evolution';
const PUBLISHED_INITIATIVES_KEY = 'progredire-published-initiatives';
const ACTION_PLAN_HISTORY_KEY = 'progredire-action-plan-history';
const CAMPAIGNS_KEY = 'progredire-campaigns';
const COMPANIES_KEY = 'progredire-companies';
const EMPLOYEES_KEY = 'progredire-employees';
const BRANCHES_KEY = 'progredire-branches';
const COMPANY_USERS_KEY = 'progredire-company-users';
const SIMULATED_COMPANY_ID = 1; // Corresponds to InovaCorp

// --- Calculation Logic & Mock Data ---
const getMockResponses = (): typeof initialMockResponses => {
    try {
        const companyKey = `${MOCK_RESPONSES_KEY}-${SIMULATED_COMPANY_ID}`;
        const companyStored = localStorage.getItem(companyKey);
        if (companyStored) {
             const parsed = JSON.parse(companyStored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }

        const genericStored = localStorage.getItem(MOCK_RESPONSES_KEY);
        if (genericStored) return JSON.parse(genericStored);

        localStorage.setItem(MOCK_RESPONSES_KEY, JSON.stringify(initialMockResponses));
        return initialMockResponses;
    } catch {
        return initialMockResponses;
    }
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

const calculateDataForResponses = (responses: typeof initialMockResponses) => {
    if (responses.length === 0) {
        return {
            riskFactors: allDimensionIds.map(id => ({ id, name: dimensions[id].name, score: 0 })),
            distributions: Object.fromEntries(allDimensionIds.map(id => [id, []])),
            workLifeBalanceScore: 0,
        };
    }

    const totalDimensionScores: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};
    const distributions: Record<string, Record<string, number>> = {};
    const customMetricScores = { workLifeBalance: { total: 0, count: 0 } };

    allDimensionIds.forEach(id => {
        distributions[id] = Object.fromEntries(likertOptions.map(opt => [opt, 0]));
    });

    responses.forEach(r => {
        const wlbQuestions = ['q1', 'q5', 'q39'];
        let wlbScore = 0; let wlbCount = 0;
        wlbQuestions.forEach(qId => {
            const answer = r.answers[qId];
            if (answer && likertToScore[answer]) {
                wlbScore += likertToScore[answer];
                wlbCount++;
            }
        });
        if (wlbCount > 0) {
            customMetricScores.workLifeBalance.total += wlbScore / wlbCount;
            customMetricScores.workLifeBalance.count++;
        }

        allDimensionIds.forEach(dimId => {
            const dimQuestions = dimensions[dimId].questions;
            let totalScoreForDim = 0; let questionCountForDim = 0;
            dimQuestions.forEach(qId => {
                const answer = r.answers[qId];
                if (answer) {
                    totalScoreForDim += likertToScore[answer] || 0;
                    questionCountForDim++;
                    if (distributions[dimId] && answer in distributions[dimId]) distributions[dimId][answer]++;
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

    const workLifeBalanceScore = customMetricScores.workLifeBalance.count > 0 ? (customMetricScores.workLifeBalance.total / customMetricScores.workLifeBalance.count) : 0;

    const formattedDistributions = Object.fromEntries(
        Object.entries(distributions).map(([dimId, dist]) => {
            const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
            return [dimId, [
                { name: 'DT', value: (dist[likertOptions[0]] / total) * 100, color: '#ef4444' },
                { name: 'DP', value: (dist[likertOptions[1]] / total) * 100, color: '#f97316' },
                { name: 'N', value: (dist[likertOptions[2]] / total) * 100, color: '#eab308' },
                { name: 'CP', value: (dist[likertOptions[3]] / total) * 100, color: '#84cc16' },
                { name: 'CT', value: (dist[likertOptions[4]] / total) * 100, color: '#22c55e' },
            ]];
        })
    );
    return { riskFactors, distributions: formattedDistributions, workLifeBalanceScore };
};

const calculateDashboardData = (filters: Record<string, string>): DashboardData => {
    const mockResponses = getMockResponses();

    // --- Financial & Demographic Data ---
    let totalEmployees = 80;
    let avgAnnualCost = 60000;
    let estimatedSavings = 'R$120.000';

    const storedFinancial = localStorage.getItem(`${FINANCIAL_DATA_KEY}-${SIMULATED_COMPANY_ID}`) || localStorage.getItem(FINANCIAL_DATA_KEY);
    if (storedFinancial) {
        try {
            const financialData = JSON.parse(storedFinancial);
            if(financialData.totalEmployees) totalEmployees = financialData.totalEmployees;
            if(financialData.avgAnnualCost) avgAnnualCost = financialData.avgAnnualCost;
            if(financialData.estimatedSavings) estimatedSavings = financialData.estimatedSavings;
        } catch(e) { console.error("Failed to parse financial data", e); }
    }


    const filteredResponses = mockResponses.filter(r => 
        Object.entries(filters).every(([key, value]) => !value || r.segmentation[key as keyof typeof r.segmentation] === value)
    );
    
    const companyData = calculateDataForResponses(mockResponses);
    const { riskFactors, distributions, workLifeBalanceScore } = calculateDataForResponses(filteredResponses);
    
    // --- Historical Data ---
    let climateTrend: {labels: string[], data: number[]};
    let inssLeaveTrend: {labels: string[], data: number[]};
    let irpVsTurnover: { labels: string[]; datasets: { label: string; data: (number | null)[]; color: string; }[] };
    let leaveEvents: { type: string; date: string }[];

    const storedHistorical = localStorage.getItem(`${HISTORICAL_INDICATORS_KEY}-${SIMULATED_COMPANY_ID}`) || localStorage.getItem(HISTORICAL_INDICATORS_KEY);
    if (storedHistorical) {
        const historicalData: any[] = JSON.parse(storedHistorical);
        climateTrend = {
            labels: historicalData.map(d => d['Mês/Ano (ex: Jan/24)']),
            data: historicalData.map(d => d['IRP Global (0-100)'])
        };
        inssLeaveTrend = {
            labels: historicalData.map(d => d['Mês/Ano (ex: Jan/24)']),
            data: historicalData.map(d => d['Afastamentos INSS'])
        };
        irpVsTurnover = {
            labels: historicalData.map(d => d['Mês/Ano (ex: Jan/24)']),
            datasets: [
                { label: 'IRP Global (1-5)', data: historicalData.map(d => (d['IRP Global (0-100)'] / 100) * 4 + 1), color: '#3b82f6' },
                { label: 'Turnover (%)', data: historicalData.map(d => d['Turnover (%)']), color: '#ef4444' }
            ]
        };
    } else {
        // Fallback to mocks
        climateTrend = { labels: ['Jan/24', 'Fev/24', 'Mar/24', 'Abr/24', 'Mai/24', 'Jun/24'], data: [65, 68, 72, 70, 75, 78] };
        inssLeaveTrend = { labels: ['Jan/24', 'Fev/24', 'Mar/24', 'Abr/24', 'Mai/24', 'Jun/24'], data: [5, 4, 6, 5, 5, 3] };
        irpVsTurnover = {
            labels: ['Q1/23', 'Q2/23', 'Q3/23', 'Q4/23', 'Q1/24', 'Q2/24'],
            datasets: [
                { label: 'IRP Global (1-5)', data: [3.2, 3.4, 3.3, 3.6, 3.8, 4.1], color: '#3b82f6' },
                { label: 'Turnover (%)', data: [8.5, 7.2, 7.8, 6.1, 5.5, 4.2], color: '#ef4444' }
            ]
        };
    }

    const storedLeaveEvents = localStorage.getItem(`${LEAVE_EVENTS_KEY}-${SIMULATED_COMPANY_ID}`) || localStorage.getItem(LEAVE_EVENTS_KEY);
    if (storedLeaveEvents) {
        leaveEvents = JSON.parse(storedLeaveEvents);
    } else {
        leaveEvents = [
            { type: 'Burnout', date: '2024-05-10' }, { type: 'Ansiedade', date: '2024-04-22' },
            { type: 'Depressão', date: '2024-03-15' }, { type: 'Ansiedade', date: '2024-02-01' },
            { type: 'Estresse Agudo', date: '2023-12-20' }, { type: 'Burnout', date: '2023-11-05' },
        ];
    }
    
    // --- Leadership Data ---
    let leadershipScore = 4.2;
    let safetyScore = 3.8;
    let leadersInDevelopment = 75;

    const storedLeadership = localStorage.getItem(`${LEADERSHIP_DATA_KEY}-${SIMULATED_COMPANY_ID}`) || localStorage.getItem(LEADERSHIP_DATA_KEY);
    if (storedLeadership) {
        try {
            const leadershipData = JSON.parse(storedLeadership);
            if (leadershipData.leadershipScore) leadershipScore = leadershipData.leadershipScore;
            if (leadershipData.safetyScore) safetyScore = leadershipData.safetyScore;
            if (leadershipData.leadersInDevelopment) leadersInDevelopment = leadershipData.leadersInDevelopment;
        } catch(e) { console.error("Failed to parse leadership data", e); }
    }

    // --- Derived Calculations ---
    const geralScore = riskFactors.reduce((acc, curr) => acc + curr.score, 0) / riskFactors.length;
    const irpGlobal = (geralScore / 100) * 4 + 1;
    const riskClassification = irpGlobal >= 3.5 ? { text: 'Baixo', color: 'bg-green-500' } : irpGlobal >= 2.5 ? { text: 'Moderado', color: 'bg-yellow-500' } : { text: 'Alto', color: 'bg-red-500' };
    const participationRate = (filteredResponses.length / totalEmployees) * 100;
    const sortedFactors = [...riskFactors].sort((a, b) => a.score - b.score);
    const topRisks = sortedFactors.slice(0, 3);
    const topProtections = sortedFactors.slice(-3).reverse();
    const maturityLevel = getMaturityLevel(riskFactors);

    // --- Mock Sector Risk Distribution ---
    const sectorRiskDistribution = { high: 15, moderate: 45, low: 40 };

    // --- Cross Analysis Data Mocks ---
    const presenteeismRate = (5 - irpGlobal) * 5; // Simple mock formula
    const absenteeismRate = (5 - irpGlobal) * 1.5;
    const totalPresenteeismCost = totalEmployees * avgAnnualCost * (presenteeismRate / 100);

    const roiScenarios = [
        { scenario: '10%', value: totalPresenteeismCost * 0.10 },
        { scenario: '25%', value: totalPresenteeismCost * 0.25 },
        { scenario: '50%', value: totalPresenteeismCost * 0.50 },
    ];

    const archivedPlans = JSON.parse(localStorage.getItem(ACTION_PLAN_HISTORY_KEY) || '[]');
    const actionsVsImpact = archivedPlans.map((plan: any) => ({
        label: plan.factor,
        x: (Math.random() * 15) + 2, // Mock impact (IRP points improvement)
        y: plan.actions.length,
        z: plan.progress,
    })).slice(0, 5);


    const crossAnalysis: CrossAnalysisData = {
        irpVsPresenteeism: [
            { label: 'Engenharia', x: 3.2, y: 15, z: 20 },
            { label: 'Marketing', x: 2.5, y: 22, z: 15 },
            { label: 'RH', x: 4.5, y: 5, z: 8 },
            { label: 'Vendas', x: 2.8, y: 18, z: 12 },
        ],
        irpVsTurnover: irpVsTurnover,
        presenteeismVsRoi: {
            totalCost: totalPresenteeismCost,
            scenarios: [
                { label: 'Economia com redução de 10%', value: roiScenarios.find(s=>s.scenario==='10%')?.value || 0 },
                { label: 'Economia com redução de 25%', value: roiScenarios.find(s=>s.scenario==='25%')?.value || 0 },
                { label: 'Economia com redução de 50%', value: roiScenarios.find(s=>s.scenario==='50%')?.value || 0 },
            ]
        },
        dimensionVsAreaHeatmap: {
            yLabels: ['Engenharia', 'Marketing', 'RH', 'Vendas'],
            xLabels: ['Carga', 'Autonomia', 'Liderança', 'Suporte', 'Reconhecimento'],
            data: [
                [2.5, 4.1, 3.8, 4.2, 3.1], // Engenharia
                [3.8, 3.0, 2.9, 2.5, 2.2], // Marketing
                [4.5, 4.8, 4.6, 4.9, 4.4], // RH
                [2.9, 3.5, 3.1, 3.3, 2.8], // Vendas
            ]
        },
        actionsVsImpact: actionsVsImpact,
        irpEvolution: climateTrend
    };
    

    return { 
        geralScore, irpGlobal, riskClassification, participationRate, totalEmployees, topRisks, topProtections, maturityLevel, riskFactors, 
        companyAverageFactors: companyData.riskFactors, distributions, sectorRiskDistribution, climateTrend,
        leadershipScore, safetyScore, workLifeBalanceScore, estimatedSavings, roiScenarios,
        leadersInDevelopment, absenteeismRate, presenteeismRate, inssLeaveTrend, leaveEvents,
        crossAnalysis,
    };
};

// Main data getter function
export const getDashboardData = (filters: Record<string, string>): Promise<DashboardData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = calculateDashboardData(filters);
            resolve(data);
        }, 500); // Simulate network delay
    });
};

// --- Other Data Services ---

// Campaigns
export const getCampaigns = (): Promise<Campaign[]> => {
    return new Promise(resolve => {
        const stored = localStorage.getItem(CAMPAIGNS_KEY);
        const campaigns = stored ? JSON.parse(stored) : initialCampaigns;
        resolve(campaigns);
    });
}
export const addCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign[]> => {
    const campaigns = await getCampaigns();
    const newCampaign: Campaign = {
        id: Date.now(),
        name: campaignData.name || 'Nova Campanha',
        description: campaignData.description || '',
        status: 'Pendente',
        targetAudience: campaignData.targetAudience || 'Toda a empresa',
        adherence: 0,
        startDate: campaignData.startDate || new Date().toISOString(),
        endDate: campaignData.endDate || new Date().toISOString(),
        emailMessage: campaignData.emailMessage || '',
        filters: campaignData.filters || {},
    };
    const updatedCampaigns = [...campaigns, newCampaign];
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
    return updatedCampaigns;
}
export const approveCampaign = async (campaignId: number): Promise<Campaign[]> => {
    const campaigns = await getCampaigns();
    const updated = campaigns.map(c => {
        if (c.id === campaignId) {
            // If start date is in the future, it becomes 'Agendada', otherwise 'Em Andamento'
            const status: CampaignStatus = new Date(c.startDate) > new Date() ? 'Agendada' : 'Em Andamento';
            return { ...c, status };
        }
        return c;
    });
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
    return updated;
};

// Collaborator Survey & Evolution
export const saveCollaboratorSurvey = async (answers: Record<string, string>): Promise<void> => {
    const newEntry: CollaboratorEvolutionEntry = {
        timestamp: Date.now(),
        scores: {},
        generalScore: 0,
    };
    let totalScoreSum = 0;
    
    allDimensionIds.forEach(dimId => {
        const dimQuestions = dimensions[dimId].questions;
        let totalDimScore = 0; let questionCount = 0;
        dimQuestions.forEach(qId => {
            const answer = answers[qId];
            if (answer) {
                totalDimScore += likertToScore[answer] || 0;
                questionCount++;
            }
        });
        if (questionCount > 0) {
            const avgScore = (totalDimScore / questionCount - 1) / 4 * 100;
            newEntry.scores[dimId] = Math.round(avgScore);
            totalScoreSum += avgScore;
        }
    });
    
    newEntry.generalScore = Math.round(totalScoreSum / allDimensionIds.length);
    
    const evolutionData = await getCollaboratorEvolutionData();
    evolutionData.push(newEntry);
    localStorage.setItem(COLLABORATOR_EVOLUTION_KEY, JSON.stringify(evolutionData));
};

export const getCollaboratorEvolutionData = (): Promise<CollaboratorEvolutionEntry[]> => {
    return new Promise(resolve => {
        const stored = localStorage.getItem(COLLABORATOR_EVOLUTION_KEY);
        resolve(stored ? JSON.parse(stored) : []);
    });
};

// Initiatives
export const getPublishedInitiatives = (): Promise<PublishedInitiative[]> => {
    return new Promise(resolve => {
        const stored = localStorage.getItem(PUBLISHED_INITIATIVES_KEY);
        const initiatives: PublishedInitiative[] = stored ? JSON.parse(stored) : [];
        initiatives.sort((a,b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        resolve(initiatives);
    });
};
export const publishInitiative = async (archivedPlan: any, announcement: string): Promise<void> => {
    const initiatives = await getPublishedInitiatives();
    const newInitiative: PublishedInitiative = {
        id: archivedPlan.id,
        publishedDate: new Date().toISOString(),
        factor: archivedPlan.factor,
        segment: archivedPlan.segment,
        objective: archivedPlan.plan.strategicObjective.content,
        announcement: announcement,
        actions: archivedPlan.actions.map((a: any) => ({title: a.title, description: a.description})),
        status: 'Em Andamento',
        supportCount: 0,
    };
    initiatives.unshift(newInitiative);
    localStorage.setItem(PUBLISHED_INITIATIVES_KEY, JSON.stringify(initiatives));
};
export const recordInitiativeSupport = async (id: number): Promise<PublishedInitiative[]> => {
    const initiatives = await getPublishedInitiatives();
    const updated = initiatives.map(i => {
        if (i.id === id) {
            return { ...i, supportCount: i.supportCount + 1 };
        }
        return i;
    });
    localStorage.setItem(PUBLISHED_INITIATIVES_KEY, JSON.stringify(updated));
    return updated;
};

// Data Import Services for Staff
export const importSurveyResponses = (data: any[], context: ImportContext): Promise<void> => {
    return new Promise(resolve => {
        const responses = data.map((row, index) => {
            const answers: Record<string, string> = {};
            for (const key in row) {
                if (key.startsWith('q')) {
                    answers[key] = row[key];
                }
            }
            return {
                id: Date.now() + index,
                timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
                segmentation: {
                    companyId: context.companyId, // Link to company
                    empresa: row.empresa,
                    diretoria: row.diretoria,
                    setor: row.setor,
                    cargo: row.cargo
                },
                answers: answers
            }
        });
        localStorage.setItem(`${MOCK_RESPONSES_KEY}-${context.companyId}`, JSON.stringify(responses));
        resolve();
    });
};

export const importHistoricalIndicators = (data: any[], context: ImportContext): Promise<void> => {
    return new Promise(resolve => {
        localStorage.setItem(`${HISTORICAL_INDICATORS_KEY}-${context.companyId}`, JSON.stringify(data));
        resolve();
    });
};

export const importLeaveEvents = (data: any[], context: ImportContext): Promise<void> => {
     return new Promise(resolve => {
        const events = data.map(row => ({
            type: row['Tipo de Afastamento'],
            date: row['Data (AAAA-MM-DD)'],
            branchId: context.branchId, // Link to branch
        }));
        localStorage.setItem(`${LEAVE_EVENTS_KEY}-${context.companyId}`, JSON.stringify(events));
        resolve();
    });
};

export const importLeadershipData = (data: any[], context: ImportContext): Promise<void> => {
    return new Promise(resolve => {
        if (data.length > 0) {
            const firstRow = data[0];
            const leadershipData = {
                leadersInDevelopment: firstRow['% Líderes em Desenvolvimento (0-100)'],
                leadershipScore: firstRow['Percepção da Liderança (1-5)'],
                safetyScore: firstRow['Segurança Psicológica (1-5)']
            };
            localStorage.setItem(`${LEADERSHIP_DATA_KEY}-${context.companyId}`, JSON.stringify(leadershipData));
        }
        resolve();
    });
};

export const importFinancialData = (data: any[], context: ImportContext): Promise<void> => {
    return new Promise(resolve => {
        if (data.length > 0) {
            const firstRow = data[0];
            const financialData = {
                totalEmployees: firstRow['Total de Colaboradores (para cálculo de adesão)'],
                avgAnnualCost: firstRow['Custo Médio Anual por Colaborador (para ROI)'],
                estimatedSavings: firstRow['Economia Estimada Anual (valor manual)']
            };
            localStorage.setItem(`${FINANCIAL_DATA_KEY}-${context.companyId}`, JSON.stringify(financialData));
        }
        resolve();
    });
};


// Function for Assistant Tool
export const queryRiskFactors = async (filters: Record<string, string>): Promise<RiskFactor[]> => {
    const data = await getDashboardData(filters);
    return data.riskFactors;
};


// Staff Dashboard Services
// FIX: Define `getDocumentStatus` to resolve reference error in `getStaffDashboardSummary`.
type DocumentStatus = 'Em dia' | 'Próximo ao Vencimento' | 'Vencido';
const getDocumentStatus = (expiryDate: string): { status: DocumentStatus; days: number } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'Vencido', days: diffDays };
    if (diffDays <= 30) return { status: 'Próximo ao Vencimento', days: diffDays };
    return { status: 'Em dia', days: diffDays };
};

export const getStaffDashboardSummary = async (): Promise<{totalCompanies: number, totalEmployees: number, pendingCampaigns: number, docsNearExpiry: number}> => {
    // These would be real async calls to a backend
    const campaigns = await getCampaigns();
    
    const docsNearExpiry = mockDocuments.filter(doc => {
        const { status } = getDocumentStatus(doc.expiryDate);
        return status === 'Próximo ao Vencimento' || status === 'Vencido';
    }).length;

    return {
        totalCompanies: 4,
        totalEmployees: 55,
        pendingCampaigns: campaigns.filter(c => c.status === 'Pendente').length,
        docsNearExpiry,
    };
};

export const findEmployeeByCpf = (cpf: string): Promise<Employee | undefined> => {
    return new Promise(resolve => {
        // In a real app, this would query a database. Here we just mock a user.
        const mockEmployee: Employee = {
            id: 1,
            name: 'Colaborador Teste',
            email: 'colaborador@techcorp.com',
            company: 'TechCorp',
            cpf: '123.456.789-00',
            password: '900',
            dataNascimento: '1990-01-01',
            genero: 'Prefiro não informar',
            dataAdmissao: '2022-01-01',
            nivelCargo: 'Pleno',
            status: 'Ativo'
        };
        if (cpf === mockEmployee.cpf) {
            resolve(mockEmployee);
        } else {
            resolve(undefined);
        }
    });
};

export const findCompanyUserByEmail = (email: string): Promise<CompanyUser | undefined> => {
    return new Promise(resolve => {
        // Mock user for company login
        const mockUser: CompanyUser = {
            id: 101,
            name: 'Ana Costa',
            email: 'ana.costa@inovacorp.com',
            password: 'Mudar@123',
            companyId: 1,
            companyName: 'InovaCorp',
            role: 'Admin',
            status: 'Ativo'
        };
         if (email.toLowerCase() === mockUser.email) {
            resolve(mockUser);
        } else {
            resolve(undefined);
        }
    });
};

// --- Staff CRUD Services (all using localStorage for simulation) ---

const seedInitialCompanies = (): Company[] => {
    const initialCompanies: Company[] = [
        { id: 1, name: 'InovaCorp', razaoSocial: 'InovaCorp Soluções LTDA', cnpj: '11.222.333/0001-44', setor: 'Tecnologia', numColaboradores: 35, contatoPrincipal: { nome: 'Ana Costa', email: 'ana.costa@inovacorp.com' }, address: { logradouro: 'Rua das Inovações', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01000-000' } },
        { id: 2, name: 'NexusTech', razaoSocial: 'NexusTech SA', cnpj: '22.333.444/0001-55', setor: 'Tecnologia', numColaboradores: 10, contatoPrincipal: { nome: 'Carlos Souza', email: 'carlos@nexustech.com' }, address: { logradouro: 'Av. Principal', numero: '456', bairro: 'Boa Viagem', cidade: 'Recife', estado: 'PE', cep: '51020-000' } },
        { id: 3, name: 'AuraDigital', razaoSocial: 'Aura Marketing Digital', cnpj: '33.444.555/0001-66', setor: 'Marketing', numColaboradores: 5, contatoPrincipal: { nome: 'Beatriz Lima', email: 'bia@auradigital.com' }, address: { logradouro: 'Praça da Liberdade', numero: '789', bairro: 'Savassi', cidade: 'Belo Horizonte', estado: 'MG', cep: '30140-010' } },
        { id: 4, name: 'Vértice', razaoSocial: 'Vértice Consultoria', cnpj: '44.555.666/0001-77', setor: 'Consultoria', numColaboradores: 5, contatoPrincipal: { nome: 'Daniel Almeida', email: 'daniel@vertice.com' }, address: { logradouro: 'Rua da Consolação', numero: '1011', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', cep: '01301-000' } }
    ];
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(initialCompanies));
    return initialCompanies;
};


// Companies
export const getCompanies = (): Promise<Company[]> => new Promise(r => {
    const stored = localStorage.getItem(COMPANIES_KEY);
    if (stored && JSON.parse(stored).length > 0) {
        r(JSON.parse(stored));
    } else {
        r(seedInitialCompanies());
    }
});
export const addCompany = async (data: Omit<Company, 'id'>) => {
    const items = await getCompanies();
    const newItem = { ...data, id: Date.now() };
    localStorage.setItem(COMPANIES_KEY, JSON.stringify([...items, newItem]));
    return [...items, newItem];
};
export const deleteCompany = async (id: number) => {
    let items = await getCompanies();
    items = items.filter(i => i.id !== id);
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(items));
    return items;
};
export const addCompanies = async (names: string[]) => {
    const items = await getCompanies();
    const newItems = names.map((name, i) => ({ id: Date.now() + i, name, razaoSocial: '', cnpj: '', setor: '', numColaboradores: 0, contatoPrincipal: {nome: '', email: ''}, address: {logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: ''} }));
    localStorage.setItem(COMPANIES_KEY, JSON.stringify([...items, ...newItems]));
};

// Branches
export const getBranches = (companyId: number): Promise<Branch[]> => new Promise(r => r(JSON.parse(localStorage.getItem(BRANCHES_KEY) || '[]').filter((b: Branch) => b.companyId === companyId)));
export const addBranch = async (data: Omit<Branch, 'id'>) => {
    const items = JSON.parse(localStorage.getItem(BRANCHES_KEY) || '[]');
    const newItem = { ...data, id: Date.now() };
    localStorage.setItem(BRANCHES_KEY, JSON.stringify([...items, newItem]));
};
export const deleteBranch = async (id: number) => {
    let items = JSON.parse(localStorage.getItem(BRANCHES_KEY) || '[]');
    items = items.filter((i: Branch) => i.id !== id);
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(items));
};
export const addBranches = async (companyId: number, branches: Omit<Branch, 'id'|'companyId'>[]) => {
    const items = JSON.parse(localStorage.getItem(BRANCHES_KEY) || '[]');
    const newItems = branches.map((b,i) => ({ ...b, id: Date.now() + i, companyId }));
    localStorage.setItem(BRANCHES_KEY, JSON.stringify([...items, ...newItems]));
};

// Employees
export const getEmployees = (params: { page: number; limit: number; searchTerm: string }): Promise<{employees: Employee[], pages: number}> => {
    return new Promise(r => {
        let items: Employee[] = JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || '[]');
        if (params.searchTerm) {
            items = items.filter(e => e.name.toLowerCase().includes(params.searchTerm.toLowerCase()) || e.email.toLowerCase().includes(params.searchTerm.toLowerCase()));
        }
        const totalItems = items.length;
        const pages = Math.ceil(totalItems / params.limit);
        const paginated = items.slice((params.page - 1) * params.limit, params.page * params.limit);
        r({ employees: paginated, pages });
    });
};
export const addEmployee = async (data: Omit<Employee, 'id'|'password'>) => {
    const items = await getEmployees({page: 1, limit: 1000, searchTerm: ''}).then(res => res.employees);
    const password = data.cpf.slice(-3); // Last 3 digits of CPF as password
    const newItem = { ...data, id: Date.now(), password };
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify([...items, newItem]));
};
export const deleteEmployee = async (id: number) => {
    let items = await getEmployees({page: 1, limit: 1000, searchTerm: ''}).then(res => res.employees);
    items = items.filter(i => i.id !== id);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(items));
};
export const addEmployees = async (employees: Omit<Employee, 'id'|'password'>[]) => {
    const items = await getEmployees({page: 1, limit: 1000, searchTerm: ''}).then(res => res.employees);
    const newItems = employees.map((e, i) => ({ ...e, id: Date.now() + i, password: e.cpf.slice(-3) }));
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify([...items, ...newItems]));
};

// Company Users
export const getCompanyUsers = (params: { page: number; limit: number; searchTerm: string }): Promise<{users: CompanyUser[], pages: number}> => {
    return new Promise(r => {
        let items: CompanyUser[] = JSON.parse(localStorage.getItem(COMPANY_USERS_KEY) || '[]');
        if (params.searchTerm) {
            items = items.filter(u => u.name.toLowerCase().includes(params.searchTerm.toLowerCase()) || u.email.toLowerCase().includes(params.searchTerm.toLowerCase()));
        }
        const pages = Math.ceil(items.length / params.limit);
        const paginated = items.slice((params.page - 1) * params.limit, params.page * params.limit);
        r({ users: paginated, pages });
    });
};
export const addCompanyUser = async (data: Omit<CompanyUser, 'id'|'password'>) => {
    const items = await getCompanyUsers({page: 1, limit: 1000, searchTerm: ''}).then(res => res.users);
    const newItem = { ...data, id: Date.now(), password: 'Mudar@123' };
    localStorage.setItem(COMPANY_USERS_KEY, JSON.stringify([...items, newItem]));
};
export const deleteCompanyUser = async (id: number) => {
    let items = await getCompanyUsers({page: 1, limit: 1000, searchTerm: ''}).then(res => res.users);
    items = items.filter(i => i.id !== id);
    localStorage.setItem(COMPANY_USERS_KEY, JSON.stringify(items));
};
export const addCompanyUsers = async (users: Omit<CompanyUser, 'id'|'password'>[]) => {
    const items = await getCompanyUsers({page: 1, limit: 1000, searchTerm: ''}).then(res => res.users);
    const newItems = users.map((u, i) => ({ ...u, id: Date.now() + i, password: 'Mudar@123' }));
    localStorage.setItem(COMPANY_USERS_KEY, JSON.stringify([...items, ...newItems]));
};