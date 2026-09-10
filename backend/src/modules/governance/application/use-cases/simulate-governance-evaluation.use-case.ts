import { Injectable, Inject } from '@nestjs/common';
import { GOVERNANCE_RULE_REPOSITORY } from '../../domain/repositories/governance-rule.repository.interface';
import type { IGovernanceRuleRepository } from '../../domain/repositories/governance-rule.repository.interface';
import { PolicyEngineDomainService, PolicyEvaluationResult } from '../../domain/services/policy-engine.domain-service';
import { SimulateEvaluationDto } from '../../presentation/dtos/simulate-evaluation.dto';

@Injectable()
export class SimulateGovernanceEvaluationUseCase {
  private readonly policyEngine = new PolicyEngineDomainService();

  constructor(
    @Inject(GOVERNANCE_RULE_REPOSITORY)
    private readonly ruleRepository: IGovernanceRuleRepository,
  ) {}

  async execute(dto: SimulateEvaluationDto): Promise<PolicyEvaluationResult> {
    const activeRules = await this.ruleRepository.findActiveSorted();
    return this.policyEngine.evaluate(
      {
        platformId: dto.platformId,
        departmentId: dto.departmentId,
        metadata: dto.metadata || {},
      },
      activeRules,
    );
  }
}

