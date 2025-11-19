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
exports.SurveysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SurveysService = class SurveysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submit(userId, companyId, submitSurveyDto) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: submitSurveyDto.campaignId },
        });
        if (!campaign) {
            throw new common_1.ForbiddenException('Campanha não encontrada');
        }
        if (campaign.companyId !== companyId) {
            throw new common_1.ForbiddenException('Acesso negado a esta campanha');
        }
        return this.prisma.surveyResponse.create({
            data: {
                answers: submitSurveyDto.answers,
                segmentation: submitSurveyDto.segmentation,
                userId,
                companyId,
                campaignId: submitSurveyDto.campaignId,
            },
        });
    }
    async getCollaboratorHistory(userId) {
        return this.prisma.surveyResponse.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                campaign: {
                    select: {
                        name: true,
                        startDate: true,
                    },
                },
            },
        });
    }
};
exports.SurveysService = SurveysService;
exports.SurveysService = SurveysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SurveysService);
//# sourceMappingURL=surveys.service.js.map