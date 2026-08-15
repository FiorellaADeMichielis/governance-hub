import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class RegisterFlowDto {
  @IsString()
  @IsNotEmpty()
  platformId!: string;

  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}