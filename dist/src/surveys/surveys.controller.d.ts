import { SurveysService } from './surveys.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
export declare class SurveysController {
    private readonly surveysService;
    constructor(surveysService: SurveysService);
    submit(submitSurveyDto: SubmitSurveyDto, user: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        answers: import("@prisma/client/runtime/library").JsonValue;
        segmentation: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
        campaignId: string;
    }>;
    getHistory(user: any): Promise<({
        campaign: {
            name: string;
            startDate: Date;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        answers: import("@prisma/client/runtime/library").JsonValue;
        segmentation: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
        campaignId: string;
    })[]>;
}
