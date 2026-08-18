import { IsEnum, IsString, IsOptional, ValidateIf } from 'class-validator';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  BLOCK = 'BLOCK',
}

export class ReviewFlowDto {
  @IsEnum(ReviewAction)
  action!: ReviewAction;
  @ValidateIf((o) => o.action === ReviewAction.BLOCK)
  @IsString()
  @IsOptional()
  reason?: string;
}