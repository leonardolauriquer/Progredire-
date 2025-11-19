import { Controller, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any, @Query() filters: DashboardFiltersDto) {
    if (!user.companyId) {
      throw new ForbiddenException('Acesso negado: usuário deve pertencer a uma empresa');
    }
    return this.analyticsService.getDashboardData(user.companyId, filters as Record<string, string>);
  }
}
