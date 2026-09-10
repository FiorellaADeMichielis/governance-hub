import { GovernanceRule } from '../entities/governance-rule.entity';

export const GOVERNANCE_RULE_REPOSITORY = 'GOVERNANCE_RULE_REPOSITORY';

export interface IGovernanceRuleRepository {
  save(rule: GovernanceRule): Promise<GovernanceRule>;
  findById(id: string): Promise<GovernanceRule | null>;
  findAll(): Promise<GovernanceRule[]>;
  findActiveSorted(): Promise<GovernanceRule[]>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

