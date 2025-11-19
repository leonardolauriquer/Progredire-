import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.campaign.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
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
      throw new NotFoundException('Campanha não encontrada');
    }

    if (campaign.companyId !== companyId) {
      throw new ForbiddenException('Acesso negado a esta campanha');
    }

    return campaign;
  }

  async create(companyId: string, createCampaignDto: CreateCampaignDto) {
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

  async approve(id: string, companyId: string) {
    const campaign = await this.findOne(id, companyId);

    const status = new Date(campaign.startDate) > new Date() ? 'Agendada' : 'Em Andamento';

    return this.prisma.campaign.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.campaign.delete({
      where: { id },
    });
  }
}
