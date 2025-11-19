import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post('submit')
  submit(@Body() submitSurveyDto: SubmitSurveyDto, @CurrentUser() user: any) {
    return this.surveysService.submit(user.sub || user.id, user.companyId, submitSurveyDto);
  }

  @Get('history')
  getHistory(@CurrentUser() user: any) {
    return this.surveysService.getCollaboratorHistory(user.sub);
  }
}
