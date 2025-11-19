import { PrismaService } from '../prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class CampaignsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<{
        id: string;
        name: string;
        companyId: string;
        createdAt: Date;
        description: string;
        targetAudience: string;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        adherence: number;
    }[]>;
    findOne(id: string, companyId: string): Promise<{
        surveyResponses: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            companyId: string;
            createdAt: Date;
            answers: import("@prisma/client/runtime/library").JsonValue;
            segmentation: import("@prisma/client/runtime/library").JsonValue;
            userId: string;
            campaignId: string;
        })[];
    } & {
        id: string;
        name: string;
        companyId: string;
        createdAt: Date;
        description: string;
        targetAudience: string;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        adherence: number;
    }>;
    create(companyId: string, createCampaignDto: CreateCampaignDto): Promise<{
        id: string;
        name: string;
        companyId: string;
        createdAt: Date;
        description: string;
        targetAudience: string;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        adherence: number;
    }>;
    approve(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        companyId: string;
        createdAt: Date;
        description: string;
        targetAudience: string;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        adherence: number;
    }>;
    remove(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        companyId: string;
        createdAt: Date;
        description: string;
        targetAudience: string;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        adherence: number;
    }>;
}
