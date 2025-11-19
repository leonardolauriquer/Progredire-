export declare class CreateCampaignDto {
    name: string;
    description?: string;
    targetAudience?: string;
    startDate?: string;
    endDate?: string;
    emailMessage?: string;
    filters?: Record<string, string>;
}
