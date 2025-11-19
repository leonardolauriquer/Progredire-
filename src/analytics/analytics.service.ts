import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface RiskFactor {
  id: string;
  name: string;
  score: number;
}

export interface MaturityLevel {
  level: string;
  name: string;
  description: string;
}

export interface ResponseDistribution {
  name: string;
  value: number;
  color: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private readonly dimensions = {
    cargaTrabalho: { name: 'Carga de Trabalho', questions: ['q1', 'q2', 'q3'] },
    autonomia: { name: 'Autonomia', questions: ['q4', 'q5', 'q6'] },
    lideranca: { name: 'Liderança', questions: ['q7', 'q8', 'q9'] },
    suporte: { name: 'Suporte Social', questions: ['q10', 'q11', 'q12'] },
    reconhecimento: { name: 'Reconhecimento', questions: ['q13', 'q14', 'q15'] },
    segurancaPsicologica: { name: 'Segurança Psicológica', questions: ['q16', 'q17', 'q18'] },
    desenvolvimentoProfissional: { name: 'Desenvolvimento', questions: ['q19', 'q20', 'q21'] },
    equilibrioVidaPessoal: { name: 'Equilíbrio Vida-Trabalho', questions: ['q22', 'q23', 'q24'] },
    ambienteFisico: { name: 'Ambiente Físico', questions: ['q25', 'q26', 'q27'] },
    comunicacaoInterna: { name: 'Comunicação', questions: ['q28', 'q29', 'q30'] },
  };

  private readonly likertOptions = [
    'Discordo totalmente',
    'Discordo parcialmente',
    'Neutro / Indiferente',
    'Concordo parcialmente',
    'Concordo totalmente',
  ];

  private readonly likertToScore: Record<string, number> = {
    'Discordo totalmente': 1,
    'Discordo parcialmente': 2,
    'Neutro / Indiferente': 3,
    'Concordo parcialmente': 4,
    'Concordo totalmente': 5,
  };

  private readonly maturityLevels: Record<string, { name: string; description: string }> = {
    M1: { name: 'Reativa', description: 'Atuação apenas após crises (>60% dos fatores em risco alto).' },
    M2: { name: 'Consciente', description: 'Reconhece riscos, mas sem plano estruturado (40-60% em risco moderado/alto).' },
    M3: { name: 'Estruturada', description: 'Políticas em implantação (30-40% em risco moderado).' },
    M4: { name: 'Preventiva', description: 'Gestão ativa do clima (10-30% em risco moderado).' },
    M5: { name: 'Estratégica', description: 'Cultura de bem-estar consolidada (>80% dos fatores em risco baixo).' },
  };

  private getMaturityLevel(riskFactors: RiskFactor[]): MaturityLevel {
    if (riskFactors.length === 0) {
      return { level: 'N/A', name: 'Dados Insuficientes', description: 'Não há dados para calcular.' };
    }

    let highCount = 0,
      moderateCount = 0,
      lowCount = 0;

    riskFactors.forEach((factor) => {
      const score_1_5 = (factor.score / 100) * 4 + 1;
      if (score_1_5 <= 2.4) highCount++;
      else if (score_1_5 <= 3.4) moderateCount++;
      else lowCount++;
    });

    const total = riskFactors.length;
    const highPercent = (highCount / total) * 100;
    const moderatePercent = (moderateCount / total) * 100;
    const lowPercent = (lowCount / total) * 100;

    if (highPercent > 60) return { level: 'M1', ...this.maturityLevels['M1'] };
    if (lowPercent > 80) return { level: 'M5', ...this.maturityLevels['M5'] };
    if (highPercent + moderatePercent >= 40 && highPercent + moderatePercent <= 60) return { level: 'M2', ...this.maturityLevels['M2'] };
    if (moderatePercent >= 30 && moderatePercent <= 40) return { level: 'M3', ...this.maturityLevels['M3'] };
    if (moderatePercent >= 10 && moderatePercent < 30) return { level: 'M4', ...this.maturityLevels['M4'] };
    if (highPercent + moderatePercent > 30) return { level: 'M2', ...this.maturityLevels['M2'] };
    return { level: 'M4', ...this.maturityLevels['M4'] };
  }

  private calculateDataForResponses(responses: any[]) {
    const allDimensionIds = Object.keys(this.dimensions);

    if (responses.length === 0) {
      return {
        riskFactors: allDimensionIds.map((id) => ({ id, name: this.dimensions[id].name, score: 0 })),
        distributions: Object.fromEntries(allDimensionIds.map((id) => [id, []])),
        workLifeBalanceScore: 0,
      };
    }

    const totalDimensionScores: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};
    const distributions: Record<string, Record<string, number>> = {};
    const customMetricScores = { workLifeBalance: { total: 0, count: 0 } };

    allDimensionIds.forEach((id) => {
      distributions[id] = Object.fromEntries(this.likertOptions.map((opt) => [opt, 0]));
    });

    responses.forEach((r) => {
      const wlbQuestions = ['q1', 'q5', 'q39'];
      let wlbScore = 0;
      let wlbCount = 0;
      wlbQuestions.forEach((qId) => {
        const answer = r.answers?.[qId];
        if (answer && this.likertToScore[answer]) {
          wlbScore += this.likertToScore[answer];
          wlbCount++;
        }
      });
      if (wlbCount > 0) {
        customMetricScores.workLifeBalance.total += wlbScore / wlbCount;
        customMetricScores.workLifeBalance.count++;
      }

      allDimensionIds.forEach((dimId) => {
        const dimQuestions = this.dimensions[dimId].questions;
        let totalScoreForDim = 0;
        let questionCountForDim = 0;
        dimQuestions.forEach((qId) => {
          const answer = r.answers?.[qId];
          if (answer) {
            totalScoreForDim += this.likertToScore[answer] || 0;
            questionCountForDim++;
            if (distributions[dimId] && answer in distributions[dimId]) distributions[dimId][answer]++;
          }
        });
        if (questionCountForDim > 0) {
          totalDimensionScores[dimId] = (totalDimensionScores[dimId] || 0) + totalScoreForDim / questionCountForDim;
          dimensionCounts[dimId] = (dimensionCounts[dimId] || 0) + 1;
        }
      });
    });

    const riskFactors: RiskFactor[] = allDimensionIds.map((id) => {
      const averageScore = (totalDimensionScores[id] || 0) / (dimensionCounts[id] || 1);
      return { id, name: this.dimensions[id].name, score: Math.round(((averageScore - 1) / 4) * 100) };
    });

    const workLifeBalanceScore =
      customMetricScores.workLifeBalance.count > 0 ? customMetricScores.workLifeBalance.total / customMetricScores.workLifeBalance.count : 0;

    const formattedDistributions = Object.fromEntries(
      Object.entries(distributions).map(([dimId, dist]) => {
        const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
        return [
          dimId,
          [
            { name: 'DT', value: (dist[this.likertOptions[0]] / total) * 100, color: '#ef4444' },
            { name: 'DP', value: (dist[this.likertOptions[1]] / total) * 100, color: '#f97316' },
            { name: 'N', value: (dist[this.likertOptions[2]] / total) * 100, color: '#eab308' },
            { name: 'CP', value: (dist[this.likertOptions[3]] / total) * 100, color: '#84cc16' },
            { name: 'CT', value: (dist[this.likertOptions[4]] / total) * 100, color: '#22c55e' },
          ],
        ];
      }),
    );

    return { riskFactors, distributions: formattedDistributions, workLifeBalanceScore };
  }

  async getDashboardData(companyId: string, filters: Record<string, string>) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        branches: true,
        users: {
          where: { role: 'COLLABORATOR' },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const totalEmployees = company.numColaboradores || company.users.length;

    const userFilter: any = { role: 'COLLABORATOR' };
    
    if (filters.unidade) userFilter.branchId = filters.unidade;
    if (filters.genero) userFilter.genero = filters.genero;
    if (filters.nivelCargo) userFilter.nivelCargo = filters.nivelCargo;
    if (filters.area) userFilter.area = filters.area;

    const surveyResponses = await this.prisma.surveyResponse.findMany({
      where: {
        companyId,
        user: {
          is: userFilter,
        },
      },
      include: {
        user: true,
      },
    });

    const allCompanyResponses = await this.prisma.surveyResponse.findMany({
      where: {
        companyId,
        user: {
          is: { role: 'COLLABORATOR' },
        },
      },
    });

    const companyData = this.calculateDataForResponses(allCompanyResponses);
    const { riskFactors, distributions, workLifeBalanceScore } = this.calculateDataForResponses(surveyResponses);

    const geralScore = riskFactors.reduce((acc, curr) => acc + curr.score, 0) / (riskFactors.length || 1);
    const irpGlobal = (geralScore / 100) * 4 + 1;
    const riskClassification =
      irpGlobal >= 3.5 ? { text: 'Baixo', color: 'bg-green-500' } : irpGlobal >= 2.5 ? { text: 'Moderado', color: 'bg-yellow-500' } : { text: 'Alto', color: 'bg-red-500' };

    const participationRate = totalEmployees > 0 ? (surveyResponses.length / totalEmployees) * 100 : 0;

    const sortedFactors = [...riskFactors].sort((a, b) => a.score - b.score);
    const topRisks = sortedFactors.slice(0, 3);
    const topProtections = sortedFactors.slice(-3).reverse();
    const maturityLevel = this.getMaturityLevel(riskFactors);

    const sectorRiskDistribution = { high: 15, moderate: 45, low: 40 };

    const climateTrend = {
      labels: ['Jan/24', 'Fev/24', 'Mar/24', 'Abr/24', 'Mai/24', 'Jun/24'],
      data: [65, 68, 72, 70, 75, 78],
    };

    const leadershipScore = 4.2;
    const safetyScore = 3.8;
    const estimatedSavings = 'R$120.000';
    const roiScenarios = [
      { scenario: '10%', value: 48000 },
      { scenario: '25%', value: 120000 },
      { scenario: '50%', value: 240000 },
    ];
    const leadersInDevelopment = 75;

    const presenteeismRate = (5 - irpGlobal) * 5;
    const absenteeismRate = (5 - irpGlobal) * 1.5;

    const inssLeaveTrend = {
      labels: ['Jan/24', 'Fev/24', 'Mar/24', 'Abr/24', 'Mai/24', 'Jun/24'],
      data: [5, 4, 6, 5, 5, 3],
    };

    const leaveEvents = [
      { type: 'Burnout', date: '2024-05-10' },
      { type: 'Ansiedade', date: '2024-04-22' },
      { type: 'Depressão', date: '2024-03-15' },
    ];

    const crossAnalysis = {
      irpVsPresenteeism: [
        { label: 'Engenharia', x: 3.2, y: 15, z: 20 },
        { label: 'Marketing', x: 2.5, y: 22, z: 15 },
        { label: 'RH', x: 4.5, y: 5, z: 8 },
        { label: 'Vendas', x: 2.8, y: 18, z: 12 },
      ],
      irpVsTurnover: {
        labels: ['Q1/23', 'Q2/23', 'Q3/23', 'Q4/23', 'Q1/24', 'Q2/24'],
        datasets: [
          { label: 'IRP Global (1-5)', data: [3.2, 3.4, 3.3, 3.6, 3.8, 4.1], color: '#3b82f6' },
          { label: 'Turnover (%)', data: [8.5, 7.2, 7.8, 6.1, 5.5, 4.2], color: '#ef4444' },
        ],
      },
      presenteeismVsRoi: {
        totalCost: 480000,
        scenarios: [
          { label: 'Economia com redução de 10%', value: 48000 },
          { label: 'Economia com redução de 25%', value: 120000 },
          { label: 'Economia com redução de 50%', value: 240000 },
        ],
      },
      dimensionVsAreaHeatmap: {
        yLabels: ['Engenharia', 'Marketing', 'RH', 'Vendas'],
        xLabels: ['Carga', 'Autonomia', 'Liderança', 'Suporte', 'Reconhecimento'],
        data: [
          [2.5, 4.1, 3.8, 4.2, 3.1],
          [3.8, 3.0, 2.9, 2.5, 2.2],
          [4.5, 4.8, 4.6, 4.9, 4.4],
          [2.9, 3.5, 3.1, 3.3, 2.8],
        ],
      },
      actionsVsImpact: [],
      irpEvolution: climateTrend,
    };

    return {
      geralScore,
      irpGlobal,
      riskClassification,
      participationRate,
      totalEmployees,
      topRisks,
      topProtections,
      maturityLevel,
      riskFactors,
      companyAverageFactors: companyData.riskFactors,
      distributions,
      sectorRiskDistribution,
      climateTrend,
      leadershipScore,
      safetyScore,
      workLifeBalanceScore,
      estimatedSavings,
      roiScenarios,
      leadersInDevelopment,
      absenteeismRate,
      presenteeismRate,
      inssLeaveTrend,
      leaveEvents,
      crossAnalysis,
    };
  }
}
