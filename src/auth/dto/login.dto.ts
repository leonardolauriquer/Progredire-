import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  STAFF = 'STAFF',
  COMPANY = 'COMPANY',
  COLLABORATOR = 'COLLABORATOR',
}

export class LoginDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsEnum(UserRole)
  role: UserRole;
}
