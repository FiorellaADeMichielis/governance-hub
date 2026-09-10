import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class SimulateEvaluationDto {
  @IsNotEmpty()
  @IsString()
  platformId!: string;

  @IsNotEmpty()
  @IsString()
  departmentId!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

