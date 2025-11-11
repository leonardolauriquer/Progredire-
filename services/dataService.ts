import { authService } from './authService';
// FIX: Import 'initialCampaigns' from the centralized mock data file.
import { mockResponses, mockFilters, dimensions, Campaign, CampaignStatus, initialCampaigns } from '../components/dashboardMockData';

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
    companyId: number;
    companyName: string;
    role: 'Admin' | 'RH' | 'Leader';
    status: 'Ativo' | 'Inativo';
}


// --- Constants ---
const COLLABORATOR_EVOLUTION_KEY = 'progredire-collaborator-evolution';
const PUBLISHED_INITIATIVES_KEY = 'progredire-published-initiatives';
const ACTION_PLAN_HISTORY_KEY = 'progredire-action-plan-history';
const CAMPAIGNS_KEY = 'progredire-campaigns';
const COMPANIES_KEY = 'progredire-companies';
const EMPLOYEES_KEY = 'progredire-employees';
const BRANCHES_KEY = 'progredire-branches';
const COMPANY_USERS_KEY = 'progredire-company-users';


// --- Calculation Logic & Mock Data ---
const likertOptions = ['Discordo totalmente', 'Discordo parcialmente', 'Neutro / Indiferente', 'Concordo parcialmente', 'Concordo totalmente'];
const likertToScore: Record<string, number> = {
  [likertOptions[0]]: 1, [likertOptions[1]]: 2, [likertOptions[2]]: 3, [likertOptions[3]]: 4, [likertOptions[4]]: 5,
};
const allDimensionIds = Object.keys(dimensions);
const TOTAL_EMPLOYEES = 80; // Mock total for participation rate


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

const calculateClimateTrend = (): {labels: string[], data: number[]} => {
    const monthlyData: Record<string, { totalScore: number; count: number }> = {};
    mockResponses.forEach(res => {
        const date = new Date(res.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) monthlyData[monthKey] = { totalScore: 0, count: 0 };
        
        let totalResponseScore = 0, totalQuestionCount = 0;
        Object.values(dimensions).flatMap(d => d.questions).forEach(qId => {
            const answer = res.answers[qId];
            if (answer) {
                totalResponseScore += likertToScore[answer] || 0;
                totalQuestionCount++;
            }
        });
        if (totalQuestionCount > 0) {
            monthlyData[monthKey].totalScore += totalResponseScore / totalQuestionCount;
            monthlyData[monthKey].count++;
        }
    });
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(key => `${key.split('-')[1]}/${key.split('-')[0].slice(2)}`);
    const data = sortedMonths.map(key => {
        const avgScore = monthlyData[key].totalScore / monthlyData[key].count;
        return Math.round((avgScore - 1) / 4 * 100);
    });
    return { labels, data };
};

const generateLeaveEvents = (): { type: string; date: string }[] => {
    const types = [
        'Transtorno Misto Ansioso e Depressivo',
        'Burnout',
        'Ansiedade Generalizada',
        'Depressão',
        'Transtorno do Pânico',
    ];
    const events: { type: string; date: string }[] = [];
    const totalEvents = 25;
    const now = new Date();

    for (let i = 0; i < totalEvents; i++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomDaysAgo = Math.floor(Math.random() * 365);
        const eventDate = new Date();
        eventDate.setDate(now.getDate() - randomDaysAgo);
        
        events.push({
            type: randomType,
            date: eventDate.toISOString(),
        });
    }
    return events;
};


const calculateDashboardData = (filters: Record<string, string>): DashboardData => {
    const filteredResponses = mockResponses.filter(r => 
        Object.entries(filters).every(([key, value]) => !value || r.segmentation[key as keyof typeof r.segmentation] === value)
    );
    
    const companyData = calculateDataForResponses(mockResponses);
    const { riskFactors, distributions, workLifeBalanceScore } = calculateDataForResponses(filteredResponses);
    
    // START: CROSS-ANALYSIS DATA CALCULATION
    const sectors = mockFilters.find(f => f.id === 'setor')?.options || [];
    const irpVsPresenteeism = sectors.map(sector => {
        const sectorResponses = mockResponses.filter(r => r.segmentation.setor === sector);
        const { riskFactors: sectorRiskFactors } = calculateDataForResponses(sectorResponses);
        const geralScore = Math.round(sectorRiskFactors.reduce((acc, curr) => acc + curr.score, 0) / (sectorRiskFactors.length || 1));
        const irp = (geralScore / 100) * 4 + 1;
        const presenteeism = Math.max(0, 30 - 5.5 * (irp - 1) + (Math.random() - 0.5) * 5);
        return { x: irp, y: presenteeism, z: sectorResponses.length, label: sector };
    });

    const irpVsTurnover = (() => {
        const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        const irpData = [3.2, 3.5, 3.4, 3.8];
        const turnoverData = irpData.map(irp => Math.max(0, 15 - 3 * irp + (Math.random() - 0.5) * 2));
        return {
            labels,
            datasets: [
                { label: 'IRP Global (1-5)', data: irpData, color: '#3b82f6' },
                { label: 'Turnover (%)', data: turnoverData, color: '#ef4444' }
            ]
        };
    })();

    const presenteeismVsRoi = ((): PotentialAnalysisData => {
        const avgPresenteeism = irpVsPresenteeism.reduce((acc, curr) => acc + curr.y, 0) / (irpVsPresenteeism.length || 1);
        const cost = (avgPresenteeism / 100) * TOTAL_EMPLOYEES * 60000;
        return {
            totalCost: cost,
            scenarios: [
                { label: 'Economia com redução de 10%', value: cost * 0.1 },
                { label: 'Economia com redução de 25%', value: cost * 0.25 }
            ]
        };
    })();

    const dimensionVsAreaHeatmap = (() => {
        const xLabels = allDimensionIds.map(id => dimensions[id].name);
        const yLabels = sectors;
        const data = yLabels.map(sector => {
            const sectorResponses = mockResponses.filter(r => r.segmentation.setor === sector);
            return allDimensionIds.map(dimId => {
                const { riskFactors: factorData } = calculateDataForResponses(sectorResponses);
                const factor = factorData.find(f => f.id === dimId);
                const score = factor ? factor.score : 0;
                return (score / 100) * 4 + 1;
            });
        });
        return { yLabels, xLabels, data };
    })();
    
    const actionsVsImpact = (() => {
        try {
            const stored = localStorage.getItem(ACTION_PLAN_HISTORY_KEY);
            const plans: any[] = stored ? JSON.parse(stored) : [];
            if (plans && plans.length > 0) {
                return plans.map((plan: any) => ({
                    x: 5 + Math.random() * 15, // Mocked improvement for demo
                    y: plan.actions.length,
                    z: plan.progress,
                    label: plan.factor,
                }));
            }
            // If no archived plans, provide mock data to ensure the chart is not blank
            return [
                { x: 8.5, y: 3, z: 100, label: 'Carga Trab.' },
                { x: 12.1, y: 5, z: 75, label: 'Liderança' },
                { x: 5.7, y: 4, z: 50, label: 'Reconhecimento' },
            ];
        } catch { 
            // Fallback in case of parsing error
            return [
                { x: 8.5, y: 3, z: 100, label: 'Carga Trab.' },
                { x: 12.1, y: 5, z: 75, label: 'Liderança' },
                { x: 5.7, y: 4, z: 50, label: 'Reconhecimento' },
            ];
        }
    })();

    const crossAnalysis: CrossAnalysisData = {
        irpVsPresenteeism,
        irpVsTurnover,
        presenteeismVsRoi,
        dimensionVsAreaHeatmap,
        actionsVsImpact,
        irpEvolution: calculateClimateTrend(),
    };
    // END: CROSS-ANALYSIS DATA CALCULATION

    if (filteredResponses.length === 0) {
        return {
            geralScore: 0, irpGlobal: 0, riskClassification: { text: 'N/A', color: 'bg-slate-500' },
            participationRate: 0, topRisks: [], topProtections: [], maturityLevel: { level: 'N/A', name: 'Dados Insuficientes', description: '' },
            riskFactors: [], companyAverageFactors: companyData.riskFactors, distributions: {},
            sectorRiskDistribution: {high: 0, moderate: 0, low: 0}, climateTrend: {labels: [], data: []},
            leadershipScore: 0, safetyScore: 0, workLifeBalanceScore: 0,
            estimatedSavings: 'R$0', roiScenarios: [], leadersInDevelopment: 0,
            absenteeismRate: 0, presenteeismRate: 0,
            inssLeaveTrend: {labels: [], data: []},
            leaveEvents: [],
            crossAnalysis: crossAnalysis, // Still return cross analysis even if filters are empty
        };
    }

    const geralScore = Math.round(riskFactors.reduce((acc, curr) => acc + curr.score, 0) / riskFactors.length);
    const irpGlobal = (geralScore / 100) * 4 + 1;
    const riskClassification = irpGlobal >= 3.5 ? { text: 'Baixo / Saudável', color: 'bg-green-500' }
                           : irpGlobal >= 2.5 ? { text: 'Risco Moderado', color: 'bg-yellow-500' }
                           : { text: 'Risco Alto', color: 'bg-red-500' };

    const absenteeismRate = 10 - 2 * (irpGlobal - 1);
    const presenteeismRate = 30 - 5.5 * (irpGlobal - 1);

    const sortedRisks = [...riskFactors].sort((a, b) => a.score - b.score);
    const topRisks = sortedRisks.slice(0, 3);
    const topProtections = sortedRisks.slice(-3).reverse();
    
    let highCount = 0, moderateCount = 0, lowCount = 0;
    sectors.forEach(sector => {
        const sectorResponses = mockResponses.filter(r => r.segmentation.setor === sector);
        if (sectorResponses.length > 0) {
            const { riskFactors: sectorFactors } = calculateDataForResponses(sectorResponses);
            const sectorScore = sectorFactors.reduce((acc, f) => acc + f.score, 0) / sectorFactors.length;
            const sectorIRP = (sectorScore / 100) * 4 + 1;
            if (sectorIRP < 2.5) highCount++;
            else if (sectorIRP < 3.5) moderateCount++;
            else lowCount++;
        }
    });
    const totalSectors = sectors.length || 1;
    const sectorRiskDistribution = {
        high: (highCount / totalSectors) * 100,
        moderate: (moderateCount / totalSectors) * 100,
        low: (lowCount / totalSectors) * 100,
    };
    
    const inssLeaveTrend = {
        labels: ['Jan/24', 'Fev/24', 'Mar/24', 'Abr/24', 'Mai/24', 'Jun/24'],
        data: [12, 11, 9, 8, 6, 5]
    };
    

    return { 
        geralScore, irpGlobal, riskClassification,
        participationRate: (filteredResponses.length / TOTAL_EMPLOYEES) * 100,
        topRisks, topProtections,
        maturityLevel: getMaturityLevel(riskFactors),
        riskFactors, companyAverageFactors: companyData.riskFactors, distributions,
        sectorRiskDistribution,
        climateTrend: calculateClimateTrend(),
        leadershipScore: ((riskFactors.find(f => f.id === 'd7_lideranca')?.score ?? 0) / 100 * 4 + 1),
        safetyScore: ((riskFactors.find(f => f.id === 'd9_seguranca')?.score ?? 0) / 100 * 4 + 1),
        workLifeBalanceScore,
        estimatedSavings: 'R$120.000',
        roiScenarios: [
            { scenario: '15%', value: 150000 }, { scenario: '25%', value: 250000 },
            { scenario: '30%', value: 300000 }, { scenario: '40%', value: 400000 },
        ],
        leadersInDevelopment: 68,
        absenteeismRate,
        presenteeismRate,
        inssLeaveTrend,
        leaveEvents: generateLeaveEvents(),
        crossAnalysis,
    };
};


// --- API Service Function ---
export const getDashboardData = (filters: Record<string, string>): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    // 1. Check for authentication
    const authData = authService.getAuth();
    if (!authData || authData.role !== 'company') {
      // Simulate a delay even for auth errors to prevent timing attacks
      setTimeout(() => {
        reject(new Error('Acesso não autorizado. Apenas usuários do tipo "Empresa" podem ver o dashboard.'));
      }, 500);
      return;
    }

    // 2. Simulate network delay
    setTimeout(() => {
      try {
        // 3. Perform data calculation (simulating backend processing)
        const data = calculateDashboardData(filters);
        resolve(data);
      } catch (e) {
        reject(new Error('Erro ao processar os dados do dashboard.'));
      }
    }, 1500); // 1.5 second delay
  });
};


// --- Collaborator Data Service Functions ---

export const saveCollaboratorSurvey = async (answers: Record<string, string>): Promise<void> => {
    return new Promise((resolve) => {
        const newEntry: CollaboratorEvolutionEntry = {
            timestamp: Date.now(),
            scores: {},
            generalScore: 0,
        };

        let totalScoreSum = 0;
        let totalDimensionCount = 0;

        allDimensionIds.forEach(dimId => {
            const dimQuestions = dimensions[dimId].questions;
            let totalScoreForDim = 0;
            let questionCountForDim = 0;
            dimQuestions.forEach(qId => {
                const answer = answers[qId];
                if (answer) {
                    totalScoreForDim += likertToScore[answer] || 0;
                    questionCountForDim++;
                }
            });
            if (questionCountForDim > 0) {
                const averageScore = totalScoreForDim / questionCountForDim;
                const normalizedScore = Math.round(((averageScore - 1) / 4) * 100);
                newEntry.scores[dimId] = normalizedScore;
                totalScoreSum += normalizedScore;
                totalDimensionCount++;
            }
        });
        
        if (totalDimensionCount > 0) {
            newEntry.generalScore = Math.round(totalScoreSum / totalDimensionCount);
        }

        try {
            const existingDataString = localStorage.getItem(COLLABORATOR_EVOLUTION_KEY);
            const existingData: CollaboratorEvolutionEntry[] = existingDataString ? JSON.parse(existingDataString) : [];
            existingData.push(newEntry);
            localStorage.setItem(COLLABORATOR_EVOLUTION_KEY, JSON.stringify(existingData));
        } catch (e) {
            console.error("Failed to save collaborator evolution data", e);
        }
        resolve();
    });
};

export const getCollaboratorEvolutionData = async (): Promise<CollaboratorEvolutionEntry[]> => {
    return new Promise((resolve) => {
        try {
            const dataString = localStorage.getItem(COLLABORATOR_EVOLUTION_KEY);
            const data: CollaboratorEvolutionEntry[] = dataString ? JSON.parse(dataString) : [];
            data.sort((a, b) => a.timestamp - b.timestamp); // Ensure it's sorted by date
            resolve(data);
        } catch (e) {
            console.error("Failed to get collaborator evolution data", e);
            resolve([]);
        }
    });
};

// --- Initiatives Service Functions ---

export const publishInitiative = async (archivedPlan: any, announcement: string): Promise<void> => {
    return new Promise((resolve) => {
        const newInitiative: PublishedInitiative = {
            id: archivedPlan.id,
            publishedDate: new Date().toISOString(),
            factor: archivedPlan.factor,
            segment: archivedPlan.segment,
            objective: archivedPlan.plan.strategicObjective.content,
            announcement,
            actions: archivedPlan.actions.map((a: any) => ({ title: a.title, description: a.description })),
            status: archivedPlan.progress < 100 ? 'Em Andamento' : 'Concluído',
            supportCount: 0,
        };

        try {
            const existingDataString = localStorage.getItem(PUBLISHED_INITIATIVES_KEY);
            const existingData: PublishedInitiative[] = existingDataString ? JSON.parse(existingDataString) : [];
            existingData.unshift(newInitiative); // Add to the top
            localStorage.setItem(PUBLISHED_INITIATIVES_KEY, JSON.stringify(existingData));
        } catch (e) {
            console.error("Failed to publish initiative", e);
        }
        resolve();
    });
};

export const getPublishedInitiatives = async (): Promise<PublishedInitiative[]> => {
     return new Promise((resolve) => {
        try {
            const dataString = localStorage.getItem(PUBLISHED_INITIATIVES_KEY);
            const data: PublishedInitiative[] = dataString ? JSON.parse(dataString) : [];
            resolve(data);
        } catch (e) {
            console.error("Failed to get published initiatives", e);
            resolve([]);
        }
    });
};

export const recordInitiativeSupport = async (initiativeId: number): Promise<PublishedInitiative[]> => {
    return new Promise((resolve) => {
        try {
            const dataString = localStorage.getItem(PUBLISHED_INITIATIVES_KEY);
            let initiatives: PublishedInitiative[] = dataString ? JSON.parse(dataString) : [];
            initiatives = initiatives.map(init => {
                if (init.id === initiativeId) {
                    return { ...init, supportCount: init.supportCount + 1 };
                }
                return init;
            });
            localStorage.setItem(PUBLISHED_INITIATIVES_KEY, JSON.stringify(initiatives));
            resolve(initiatives);
        } catch (e) {
            console.error("Failed to record support", e);
            resolve([]);
        }
    });
};


// --- AI Assistant Tool Functions ---

export const queryRiskFactors = async (filters: Record<string, string>): Promise<{ factor: string; score: number }[]> => {
    console.log("DataService: Querying risk factors with filters:", filters);
    const filteredResponses = mockResponses.filter(r => 
        Object.entries(filters).every(([key, value]) => !value || r.segmentation[key as keyof typeof r.segmentation] === value)
    );
    
    // If filter results in no data, use all data as a fallback.
    const dataToProcess = filteredResponses.length > 0 ? filteredResponses : mockResponses;
    
    const { riskFactors } = calculateDataForResponses(dataToProcess);
    
    return riskFactors.map(rf => ({ factor: rf.name, score: rf.score }));
};

// --- Campaign Service Functions ---

const initializeCampaigns = () => {
    try {
        const stored = localStorage.getItem(CAMPAIGNS_KEY);
        if (!stored) {
            localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(initialCampaigns));
        }
    } catch (e) { console.error(e); }
};
initializeCampaigns();

export const getCampaigns = async (): Promise<Campaign[]> => {
    return new Promise(resolve => {
        try {
            const stored = localStorage.getItem(CAMPAIGNS_KEY);
            const campaigns = stored ? JSON.parse(stored) : [];
            campaigns.sort((a: Campaign, b: Campaign) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            resolve(campaigns);
        } catch (e) {
            console.error('Failed to get campaigns', e);
            resolve([]);
        }
    });
};

export const addCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign[]> => {
    const campaigns = await getCampaigns();
    const newCampaign: Campaign = {
        id: Date.now(),
        name: campaignData.name || 'Nova Campanha',
        description: campaignData.description || '',
        status: 'Pendente', // Always starts as pending
        targetAudience: campaignData.targetAudience || 'Toda a empresa',
        adherence: 0,
        startDate: campaignData.startDate || new Date().toISOString().split('T')[0],
        endDate: campaignData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emailMessage: campaignData.emailMessage || '',
        filters: campaignData.filters || {},
    };
    const updatedCampaigns = [newCampaign, ...campaigns];
    try {
        localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
    } catch (e) { console.error(e); }
    return updatedCampaigns;
};

export const approveCampaign = async (campaignId: number): Promise<Campaign[]> => {
    let campaigns = await getCampaigns();
    const campaignToUpdate = campaigns.find(c => c.id === campaignId);
    if (!campaignToUpdate) return campaigns;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(campaignToUpdate.startDate);
    startDate.setHours(0,0,0,0);
    
    const newStatus: CampaignStatus = startDate <= today ? 'Em Andamento' : 'Agendada';
    
    const updatedCampaigns = campaigns.map(c => 
        c.id === campaignId 
            ? { ...c, status: newStatus } 
            : c
    );
    try {
        localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
    } catch(e) { console.error(e); }

    return updatedCampaigns;
};

// --- User Management Mock Data and Initializer ---
const initialMockCompanies: Company[] = [
    { id: 1, name: 'InovaCorp', razaoSocial: 'InovaCorp Soluções S.A.', cnpj: '12.345.678/0001-99', setor: 'Tecnologia', numColaboradores: 150, contatoPrincipal: { nome: 'Ana Costa', email: 'ana.costa@inovacorp.com' }, address: { logradouro: 'Rua das Inovações', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01000-000' } },
    { id: 2, name: 'NexusTech', razaoSocial: 'Nexus Tecnologia Ltda.', cnpj: '98.765.432/0001-11', setor: 'Software', numColaboradores: 85, contatoPrincipal: { nome: 'Bruno Lima', email: 'bruno.lima@nexustech.com' }, address: { logradouro: 'Avenida Principal', numero: '456', bairro: 'Jardins', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '22000-000' } },
    { id: 3, name: 'AuraDigital', razaoSocial: 'Aura Digital e Marketing', cnpj: '45.678.912/0001-33', setor: 'Marketing', numColaboradores: 45, contatoPrincipal: { nome: 'Carla Dias', email: 'carla.dias@auradigital.com' }, address: { logradouro: 'Praça da Liberdade', numero: '789', bairro: 'Savassi', cidade: 'Belo Horizonte', estado: 'MG', cep: '30140-010' } },
    { id: 4, name: 'Vértice', razaoSocial: 'Vértice Consultoria Empresarial', cnpj: '33.222.111/0001-55', setor: 'Consultoria', numColaboradores: 120, contatoPrincipal: { nome: 'Daniel Souza', email: 'daniel.souza@vertice.com' }, address: { logradouro: 'Setor Comercial Sul', numero: '101', bairro: 'Asa Sul', cidade: 'Brasília', estado: 'DF', cep: '70300-000' } },
];

const generateMockEmployees = (): Employee[] => {
    const firstNames = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Elisa', 'Fernando', 'Gabriela', 'Henrique', 'Isabela', 'João'];
    const lastNames = ['Silva', 'Costa', 'Dias', 'Fogaça', 'Martins', 'Pereira', 'Alves', 'Ribeiro', 'Gomes', 'Santos'];
    const companies = initialMockCompanies.map(c => c.name);
    const generos: Employee['genero'][] = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];
    const niveis: Employee['nivelCargo'][] = ['Estagiário', 'Júnior', 'Pleno', 'Sênior', 'Especialista', 'Líder/Coordenador', 'Gerente', 'Diretor'];
    const statuses: Employee['status'][] = ['Ativo', 'Ativo', 'Ativo', 'Ativo', 'Inativo', 'Férias', 'Licença'];
    const employees: Employee[] = [];

    const randomDate = (start: Date, end: Date) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
    };

    for (let i = 1; i <= 20000; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        employees.push({
            id: i,
            name: `${firstName} ${lastName} ${i}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${company.toLowerCase().replace(' ', '')}.com`,
            company: company,
            cpf: `${Math.floor(Math.random()*1000).toString().padStart(3,'0')}.${Math.floor(Math.random()*1000).toString().padStart(3,'0')}.${Math.floor(Math.random()*1000).toString().padStart(3,'0')}-${Math.floor(Math.random()*100).toString().padStart(2,'0')}`,
            dataNascimento: randomDate(new Date(1970, 0, 1), new Date(2004, 0, 1)),
            genero: generos[Math.floor(Math.random() * generos.length)],
            dataAdmissao: randomDate(new Date(2015, 0, 1), new Date()),
            nivelCargo: niveis[Math.floor(Math.random() * niveis.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            unidade: 'Matriz',
            liderDireto: 'Fulano de Tal'
        });
    }
    return employees;
};

const initialMockBranches: Branch[] = [
    { id: 1, name: 'Matriz InovaCorp', companyId: 1, address: { logradouro: 'Rua das Inovações', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01000-000' } },
    { id: 2, name: 'InovaCorp Paulista', companyId: 1, address: { logradouro: 'Avenida Paulista', numero: '1500', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-200' } },
    { id: 3, name: 'NexusTech Rio', companyId: 2, address: { logradouro: 'Avenida Rio Branco', numero: '1', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '20090-003' } },
    { id: 4, name: 'AuraDigital BH', companyId: 3, address: { logradouro: 'Avenida Afonso Pena', numero: '4000', bairro: 'Cruzeiro', cidade: 'Belo Horizonte', estado: 'MG', cep: '30130-009' } }
];

const initialMockCompanyUsers: CompanyUser[] = [
    { id: 1, name: 'Ana Costa', email: 'ana.costa@inovacorp.com', companyId: 1, companyName: 'InovaCorp', role: 'Admin', status: 'Ativo' },
    { id: 2, name: 'Bruno Lima', email: 'bruno.lima@nexustech.com', companyId: 2, companyName: 'NexusTech', role: 'RH', status: 'Ativo' },
    { id: 3, name: 'Carla Dias', email: 'carla.dias@auradigital.com', companyId: 3, companyName: 'AuraDigital', role: 'Leader', status: 'Inativo' },
];


const initializeUserData = () => {
    try {
        if (!localStorage.getItem(COMPANIES_KEY)) {
            localStorage.setItem(COMPANIES_KEY, JSON.stringify(initialMockCompanies));
        }
        if (!localStorage.getItem(EMPLOYEES_KEY)) {
            // In a real backend, this would be a database query. For the prototype,
            // we generate a smaller set to avoid blocking the main thread, 
            // but the pagination logic will work regardless of the total size.
            const employees = generateMockEmployees().slice(0, 500); // Generate 500 for demo
            localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
        }
        if (!localStorage.getItem(BRANCHES_KEY)) {
            localStorage.setItem(BRANCHES_KEY, JSON.stringify(initialMockBranches));
        }
        if (!localStorage.getItem(COMPANY_USERS_KEY)) {
            localStorage.setItem(COMPANY_USERS_KEY, JSON.stringify(initialMockCompanyUsers));
        }
    } catch (e) { console.error("Error initializing user data:", e); }
};
initializeUserData();

// --- User Management Service Functions ---

export const getCompanies = async (): Promise<Company[]> => {
    return new Promise(resolve => {
        const data = localStorage.getItem(COMPANIES_KEY);
        resolve(data ? JSON.parse(data) : []);
    });
};

export const addCompany = async (companyData: Omit<Company, 'id'>): Promise<Company[]> => {
    const companies = await getCompanies();
    const newCompany: Company = { id: Date.now(), ...companyData };
    const updated = [...companies, newCompany];
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(updated));
    return updated;
};

export const addCompanies = async (companyNames: string[]): Promise<Company[]> => {
    const companies = await getCompanies();
    const existingNames = new Set(companies.map(c => c.name.toLowerCase()));
    
    const newCompanies: Omit<Company, 'id'>[] = companyNames
        .filter(name => name.trim() && !existingNames.has(name.trim().toLowerCase()))
        .map(name => ({ 
            name: name.trim(),
            razaoSocial: `${name.trim()} LTDA`,
            cnpj: '00.000.000/0000-00',
            setor: 'Não especificado',
            numColaboradores: 0,
            contatoPrincipal: { nome: 'A definir', email: 'a@definir.com' },
            address: { logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' }
        }));
    
    const updated = [...companies, ...newCompanies.map(c => ({...c, id: Date.now() + Math.random()}))];
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(updated));
    return updated;
};

export const deleteCompany = async (id: number): Promise<Company[]> => {
    const companies = await getCompanies();
    const updated = companies.filter(c => c.id !== id);
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(updated));
    return updated;
};

// This function simulates a paginated and searchable backend endpoint.
export const getEmployees = async (
    { page = 1, limit = 10, searchTerm = '' }: { page: number; limit: number; searchTerm: string }
): Promise<{ employees: Employee[]; total: number; pages: number }> => {
    return new Promise(resolve => {
        const data = localStorage.getItem(EMPLOYEES_KEY);
        // Use a smaller slice for performance in the browser simulation
        const allEmployees: Employee[] = data ? JSON.parse(data) : [];

        const filtered = searchTerm
            ? allEmployees.filter(e =>
                e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : allEmployees;
        
        const total = filtered.length;
        const pages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const end = start + limit;
        const employees = filtered.slice(start, end);

        // Simulate network delay
        setTimeout(() => {
            resolve({ employees, total, pages });
        }, 300);
    });
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<void> => {
     const data = localStorage.getItem(EMPLOYEES_KEY);
     const allEmployees: Employee[] = data ? JSON.parse(data) : [];
     const newEmployee: Employee = { id: Date.now(), ...employeeData };
     allEmployees.unshift(newEmployee);
     localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(allEmployees));
};

export const addEmployees = async (employeesData: Omit<Employee, 'id'>[]): Promise<void> => {
     const data = localStorage.getItem(EMPLOYEES_KEY);
     const allEmployees: Employee[] = data ? JSON.parse(data) : [];
     const newEmployees: Employee[] = employeesData.map(e => ({ ...e, id: Date.now() + Math.random() }));
     const updated = [...newEmployees, ...allEmployees];
     localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
};

export const deleteEmployee = async (id: number): Promise<void> => {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    const allEmployees: Employee[] = data ? JSON.parse(data) : [];
    const updated = allEmployees.filter(e => e.id !== id);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
};

// --- Branch Management Service Functions ---

export const getBranches = async (companyId?: number): Promise<Branch[]> => {
    return new Promise(resolve => {
        const data = localStorage.getItem(BRANCHES_KEY);
        const allBranches: Branch[] = data ? JSON.parse(data) : [];
        if (companyId) {
            resolve(allBranches.filter(b => b.companyId === companyId));
        } else {
            resolve(allBranches);
        }
    });
};

export const addBranch = async (branchData: Omit<Branch, 'id'>): Promise<void> => {
    const data = localStorage.getItem(BRANCHES_KEY);
    const allBranches: Branch[] = data ? JSON.parse(data) : [];
    const newBranch: Branch = { id: Date.now(), ...branchData };
    allBranches.push(newBranch);
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(allBranches));
};

export const deleteBranch = async (id: number): Promise<void> => {
    const data = localStorage.getItem(BRANCHES_KEY);
    const allBranches: Branch[] = data ? JSON.parse(data) : [];
    const updated = allBranches.filter(b => b.id !== id);
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(updated));
};

export const addBranches = async (companyId: number, branchesData: Omit<Branch, 'id' | 'companyId'>[]): Promise<void> => {
    const data = localStorage.getItem(BRANCHES_KEY);
    const allBranches: Branch[] = data ? JSON.parse(data) : [];
    const newBranches: Branch[] = branchesData.map(b => ({ ...b, id: Date.now() + Math.random(), companyId }));
    const updated = [...allBranches, ...newBranches];
    localStorage.setItem(BRANCHES_KEY, JSON.stringify(updated));
};

// --- Company User Management Service Functions ---
export const getCompanyUsers = async (
    { page = 1, limit = 10, searchTerm = '' }: { page: number; limit: number; searchTerm: string }
): Promise<{ users: CompanyUser[]; total: number; pages: number }> => {
    return new Promise(resolve => {
        const data = localStorage.getItem(COMPANY_USERS_KEY);
        const allUsers: CompanyUser[] = data ? JSON.parse(data) : [];

        const filtered = searchTerm
            ? allUsers.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : allUsers;
        
        const total = filtered.length;
        const pages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const end = start + limit;
        const users = filtered.slice(start, end);

        setTimeout(() => {
            resolve({ users, total, pages });
        }, 300);
    });
};

export const addCompanyUser = async (userData: Omit<CompanyUser, 'id'>): Promise<void> => {
     const data = localStorage.getItem(COMPANY_USERS_KEY);
     const allUsers: CompanyUser[] = data ? JSON.parse(data) : [];
     const newUser: CompanyUser = { id: Date.now(), ...userData };
     allUsers.unshift(newUser);
     localStorage.setItem(COMPANY_USERS_KEY, JSON.stringify(allUsers));
};

export const addCompanyUsers = async (usersData: Omit<CompanyUser, 'id'>[]): Promise<void> => {
     const data = localStorage.getItem(COMPANY_USERS_KEY);
     const allUsers: CompanyUser[] = data ? JSON.parse(data) : [];
     const newUsers: CompanyUser[] = usersData.map(u => ({ ...u, id: Date.now() + Math.random() }));
     const updated = [...newUsers, ...allUsers];
     localStorage.setItem(COMPANY_USERS_KEY, JSON.stringify(updated));
};

export const deleteCompanyUser = async (id: number): Promise<void> => {
    const data = localStorage.getItem(COMPANY_USERS_KEY);
    const allUsers: CompanyUser[] = data ? JSON.parse(data) : [];
    const updated = allUsers.filter(u => u.id !== id);
    localStorage.setItem(COMPANY_USERS_KEY, JSON.stringify(updated));
};