import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { RuleOperator } from '../../domain/enums/rule-operator.enum';
import { FlowStatus } from '../../../flow/domain/enums/flow-status.enum';
import { RiskLevel } from '../../../flow/domain/enums/risk-level.enum';

export class CreateGovernanceRuleDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  targetField!: string;

  @IsNotEmpty()
  @IsEnum(RuleOperator)
  operator!: RuleOperator;

  @IsNotEmpty()
  @IsString()
  expectedValue!: string;

  @IsNotEmpty()
  @IsEnum(FlowStatus)
  resultingStatus!: FlowStatus;

  @IsNotEmpty()
  @IsEnum(RiskLevel)
  resultingRiskLevel!: RiskLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}
