import { Injectable, Inject } from '@nestjs/common';
import { GOVERNANCE_RULE_REPOSITORY } from '../../domain/repositories/governance-rule.repository.interface';
import type { IGovernanceRuleRepository } from '../../domain/repositories/governance-rule.repository.interface';
import { GovernanceRule } from '../../domain/entities/governance-rule.entity';

@Injectable()
export class GetGovernanceRulesUseCase {
  constructor(
    @Inject(GOVERNANCE_RULE_REPOSITORY)
    private readonly ruleRepository: IGovernanceRuleRepository,
  ) {}

  async execute(): Promise<GovernanceRule[]> {
    return this.ruleRepository.findAll();
  }
}

