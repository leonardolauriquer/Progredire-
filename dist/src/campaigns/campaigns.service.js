"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let CampaignsService = class CampaignsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId) {
        return this.prisma.campaign.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, companyId) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                surveyResponses: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!campaign) {
            throw new common_1.NotFoundException('Campanha não encontrada');
        }
        if (campaign.companyId !== companyId) {
            throw new common_1.ForbiddenException('Acesso negado a esta campanha');
        }
        return campaign;
    }
    async create(companyId, createCampaignDto) {
        return this.prisma.campaign.create({
            data: {
                name: createCampaignDto.name,
                description: createCampaignDto.description || '',
                targetAudience: createCampaignDto.targetAudience || 'Toda a empresa',
                startDate: createCampaignDto.startDate ? new Date(createCampaignDto.startDate) : new Date(),
                endDate: createCampaignDto.endDate ? new Date(createCampaignDto.endDate) : new Date(),
                emailMessage: createCampaignDto.emailMessage || '',
                filters: createCampaignDto.filters || {},
                status: 'Pendente',
                adherence: 0,
                companyId,
            },
        });
    }
    async approve(id, companyId) {
        const campaign = await this.findOne(id, companyId);
        const status = new Date(campaign.startDate) > new Date() ? 'Agendada' : 'Em Andamento';
        return this.prisma.campaign.update({
            where: { id },
            data: { status },
        });
    }
    async remove(id, companyId) {
        await this.findOne(id, companyId);
        return this.prisma.campaign.delete({
            where: { id },
        });
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map