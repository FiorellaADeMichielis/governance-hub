export type RuleOperator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'IN_LIST' | 'REGEX';

export interface GovernanceRule {
  id: string;
  name: string;
  description: string;
  targetField: string;
  operator: RuleOperator;
  expectedValue: string;
  resultingStatus: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'RISKY' | 'UNDER_REVIEW';
  resultingRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGovernanceRulePayload {
  name: string;
  description: string;
  targetField: string;
  operator: RuleOperator;
  expectedValue: string;
  resultingStatus: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'RISKY' | 'UNDER_REVIEW';
  resultingRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority?: number;
}

export interface SimulationPayload {
  platformId: string;
  departmentId: string;
  metadata?: Record<string, any>;
}

export interface MatchedRuleResult {
  ruleId: string;
  ruleName: string;
  resultingStatus: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'RISKY' | 'UNDER_REVIEW';
  resultingRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
}

export interface SimulationResponse {
  context: SimulationPayload;
  result: {
    matchedRules: MatchedRuleResult[];
    finalStatus: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'RISKY' | 'UNDER_REVIEW';
    finalRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reasons: string[];
    isViolated: boolean;
  };
}

