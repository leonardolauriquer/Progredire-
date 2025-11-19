import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(user: any): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    create(createCampaignDto: CreateCampaignDto, user: any): Promise<{
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
    approve(id: string, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
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
