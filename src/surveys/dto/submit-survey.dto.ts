import { IsObject, IsString } from 'class-validator';

export class SubmitSurveyDto {
  @IsObject()
  answers: Record<string, string>;

  @IsObject()
  segmentation: Record<string, string>;

  @IsString()
  campaignId: string;
}
