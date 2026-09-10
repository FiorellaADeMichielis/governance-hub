import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GOVERNANCE_RULE_REPOSITORY } from '../../domain/repositories/governance-rule.repository.interface';
import type { IGovernanceRuleRepository } from '../../domain/repositories/governance-rule.repository.interface';
import { GovernanceRule } from '../../domain/entities/governance-rule.entity';
import { CreateGovernanceRuleDto } from '../../presentation/dtos/create-governance-rule.dto';

@Injectable()
export class CreateGovernanceRuleUseCase {
  constructor(
    @Inject(GOVERNANCE_RULE_REPOSITORY)
    private readonly ruleRepository: IGovernanceRuleRepository,
  ) {}

  async execute(dto: CreateGovernanceRuleDto): Promise<GovernanceRule> {
    const newRule = new GovernanceRule(
      uuidv4(),
      dto.name,
      dto.description,
      dto.targetField,
      dto.operator,
      dto.expectedValue,
      dto.resultingStatus,
      dto.resultingRiskLevel,
      true, // isActive por defecto
      dto.priority || 10,
    );

    return this.ruleRepository.save(newRule);
  }
}

