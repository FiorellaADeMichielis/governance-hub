import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GOVERNANCE_RULE_REPOSITORY } from '../../domain/repositories/governance-rule.repository.interface';
import type { IGovernanceRuleRepository } from '../../domain/repositories/governance-rule.repository.interface';
import { GovernanceRule } from '../../domain/entities/governance-rule.entity';

@Injectable()
export class ToggleRuleStatusUseCase {
  constructor(
    @Inject(GOVERNANCE_RULE_REPOSITORY)
    private readonly ruleRepository: IGovernanceRuleRepository,
  ) {}

  async execute(id: string): Promise<GovernanceRule> {
    const rule = await this.ruleRepository.findById(id);
    if (!rule) {
      throw new NotFoundException(`Regla con ID '${id}' no encontrada`);
    }

    rule.toggle();
    return this.ruleRepository.save(rule);
  }
}

