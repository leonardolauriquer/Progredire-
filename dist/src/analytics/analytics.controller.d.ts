import { AnalyticsService } from './analytics.service';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(user: any, filters: DashboardFiltersDto): Promise<{
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
        maturityLevel: import("./analytics.service").MaturityLevel;
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
