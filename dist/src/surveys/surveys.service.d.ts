import { PrismaService } from '../prisma.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
export declare class SurveysService {
    private prisma;
    constructor(prisma: PrismaService);
    submit(userId: string, companyId: string, submitSurveyDto: SubmitSurveyDto): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        answers: import("@prisma/client/runtime/library").JsonValue;
        segmentation: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
        campaignId: string;
    }>;
    getCollaboratorHistory(userId: string): Promise<({
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
