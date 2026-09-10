import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GOVERNANCE_RULE_REPOSITORY } from '../../domain/repositories/governance-rule.repository.interface';
import type { IGovernanceRuleRepository } from '../../domain/repositories/governance-rule.repository.interface';

@Injectable()
export class DeleteGovernanceRuleUseCase {
  constructor(
    @Inject(GOVERNANCE_RULE_REPOSITORY)
    private readonly ruleRepository: IGovernanceRuleRepository,
  ) {}

  async execute(id: string): Promise<{ success: boolean; message: string }> {
    const rule = await this.ruleRepository.findById(id);
    if (!rule) {
      throw new NotFoundException(`Regla con ID '${id}' no encontrada`);
    }

    const deleted = await this.ruleRepository.delete(id);
    return {
      success: deleted,
      message: `Regla '${rule.getName()}' eliminada exitosamente`,
    };
  }
}

