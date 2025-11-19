import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(user: any): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    create(createCampaignDto: CreateCampaignDto, user: any): Promise<{
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
    approve(id: string, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
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
