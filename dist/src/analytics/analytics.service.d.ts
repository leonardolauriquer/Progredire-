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
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly dimensions;
    private readonly likertOptions;
    private readonly likertToScore;
    private readonly maturityLevels;
    private getMaturityLevel;
    private calculateDataForResponses;
    getDashboardData(companyId: string, filters: Record<string, string>): Promise<{
        geralScore: number;
        irpGlobal: number;
        riskClassification: {
            text: string;
            color: string;
        };
        participationRate: number;
        totalEmployees: number;
        topRisks: {
            id: string;
            name: any;
            score: number;
        }[];
        topProtections: {
            id: string;
            name: any;
            score: number;
        }[];
        maturityLevel: MaturityLevel;
        riskFactors: {
            id: string;
            name: any;
            score: number;
        }[];
        companyAverageFactors: {
            id: string;
            name: any;
            score: number;
        }[];
        distributions: {
            [k: string]: any[];
        };
        sectorRiskDistribution: {
            high: number;
            moderate: number;
            low: number;
        };
        climateTrend: {
            labels: string[];
            data: number[];
        };
        leadershipScore: number;
        safetyScore: number;
        workLifeBalanceScore: number;
        estimatedSavings: string;
        roiScenarios: {
            scenario: string;
            value: number;
        }[];
        leadersInDevelopment: number;
        absenteeismRate: number;
        presenteeismRate: number;
        inssLeaveTrend: {
            labels: string[];
            data: number[];
        };
        leaveEvents: {
            type: string;
            date: string;
        }[];
        crossAnalysis: {
            irpVsPresenteeism: {
                label: string;
                x: number;
                y: number;
                z: number;
            }[];
            irpVsTurnover: {
                labels: string[];
                datasets: {
                    label: string;
                    data: number[];
                    color: string;
                }[];
            };
            presenteeismVsRoi: {
                totalCost: number;
                scenarios: {
                    label: string;
                    value: number;
                }[];
            };
            dimensionVsAreaHeatmap: {
                yLabels: string[];
                xLabels: string[];
                data: number[][];
            };
            actionsVsImpact: any[];
            irpEvolution: {
                labels: string[];
                data: number[];
            };
        };
    }>;
}
