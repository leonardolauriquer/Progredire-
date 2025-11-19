import { IsOptional, IsString } from 'class-validator';

export class DashboardFiltersDto {
  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  nivelCargo?: string;

  @IsOptional()
  @IsString()
  area?: string;
}
