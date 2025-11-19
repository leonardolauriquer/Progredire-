import { Module } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SurveysService, PrismaService],
  controllers: [SurveysController]
})
export class SurveysModule {}
