import { IsString, IsObject, IsNotEmpty } from 'class-validator';

export class WebhookIngestionDto {
  @IsString()
  @IsNotEmpty()
  platformId!: string; 

  @IsString()
  @IsNotEmpty()
  departmentId!: string;
  @IsObject()
  metadata!: Record<string, any>; 
}