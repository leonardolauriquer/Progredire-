import { PrismaService } from '../prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class CampaignsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<{
        id: string;
        name: string;
        description: string;
        status: string;
        targetAudience: string;
        adherence: number;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        companyId: string;
        createdAt: Date;
    }[]>;
    findOne(id: string, companyId: string): Promise<{
        surveyResponses: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        description: string;
        status: string;
        targetAudience: string;
        adherence: number;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        companyId: string;
        createdAt: Date;
    }>;
    create(companyId: string, createCampaignDto: CreateCampaignDto): Promise<{
        id: string;
        name: string;
        description: string;
        status: string;
        targetAudience: string;
        adherence: number;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        companyId: string;
        createdAt: Date;
    }>;
    approve(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        description: string;
        status: string;
        targetAudience: string;
        adherence: number;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        companyId: string;
        createdAt: Date;
    }>;
    remove(id: string, companyId: string): Promise<{
        id: string;
        name: string;
        description: string;
        status: string;
        targetAudience: string;
        adherence: number;
        startDate: Date;
        endDate: Date;
        emailMessage: string;
        filters: import("@prisma/client/runtime/library").JsonValue;
        companyId: string;
        createdAt: Date;
    }>;
}
