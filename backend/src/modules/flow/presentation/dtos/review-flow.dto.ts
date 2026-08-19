import { IsEnum, IsString, IsOptional, ValidateIf } from 'class-validator';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  BLOCK = 'BLOCK',
  MARK_REVIEW = 'MARK_REVIEW',
}

export class ReviewFlowDto {
  @IsEnum(ReviewAction)
  action!: ReviewAction;
  @ValidateIf((o) => o.action === ReviewAction.BLOCK || o.action === ReviewAction.MARK_REVIEW)
  @IsString()
  @IsOptional()
  reason?: string;
}