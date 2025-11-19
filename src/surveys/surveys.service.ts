import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  async submit(userId: string, companyId: string, submitSurveyDto: SubmitSurveyDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: submitSurveyDto.campaignId },
    });

    if (!campaign) {
      throw new ForbiddenException('Campanha não encontrada');
    }

    if (campaign.companyId !== companyId) {
      throw new ForbiddenException('Acesso negado a esta campanha');
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

  async getCollaboratorHistory(userId: string) {
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
}
