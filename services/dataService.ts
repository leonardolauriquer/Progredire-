
import { authService } from './authService';
import { mockResponses, mockFilters, dimensions } from '../components/dashboardMockData';

// --- Types ---
export type RiskFactor = { id: string; name: string; score: number };
type ResponseDistribution = { name: string; value: number; color: string; }[];
type MaturityLevel = {
    level: string;
    name: string;
    description: string;
};
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
};


// --- Calculation Logic (Moved from DashboardView) ---
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

const calculateDashboardData = (filters: Record<string, string>): DashboardData => {
    const filteredResponses = mockResponses.filter(r => 
        Object.entries(filters).every(([key, value]) => !value || r.segmentation[key] === value)
    );
    
    const companyData = calculateDataForResponses(mockResponses);
    const { riskFactors, distributions, workLifeBalanceScore } = calculateDataForResponses(filteredResponses);
    
    if (filteredResponses.length === 0) {
        return {
            geralScore: 0, irpGlobal: 0, riskClassification: { text: 'N/A', color: 'bg-slate-500' },
            participationRate: 0, topRisks: [], topProtections: [], maturityLevel: { level: 'N/A', name: 'Dados Insuficientes', description: '' },
            riskFactors: [], companyAverageFactors: companyData.riskFactors, distributions: {},
            sectorRiskDistribution: {high: 0, moderate: 0, low: 0}, climateTrend: {labels: [], data: []},
            leadershipScore: 0, safetyScore: 0, workLifeBalanceScore: 0,
            estimatedSavings: 'R$0', roiScenarios: [], leadersInDevelopment: 0,
            absenteeismRate: 0, presenteeismRate: 0,
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

    const sectors = mockFilters.find(f => f.id === 'setor')?.options || [];
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
