import { FlowStatus } from '../../../flow/domain/enums/flow-status.enum';
import { RiskLevel } from '../../../flow/domain/enums/risk-level.enum';
import { GovernanceRule } from '../entities/governance-rule.entity';
import { RuleOperatorStrategyFactory } from './rule-operator.strategy';

export interface FlowEvaluationContext {
  platformId: string;
  departmentId: string;
  metadata?: Record<string, any>;
}

export interface PolicyEvaluationResult {
  matchedRules: {
    ruleId: string;
    ruleName: string;
    resultingStatus: FlowStatus;
    resultingRiskLevel: RiskLevel;
    reason: string;
  }[];
  finalStatus: FlowStatus;
  finalRiskLevel: RiskLevel;
  reasons: string[];
  isViolated: boolean;
}

const STATUS_SEVERITY: Record<FlowStatus, number> = {
  [FlowStatus.BLOCKED]: 4,
  [FlowStatus.RISKY]: 3,
  [FlowStatus.UNDER_REVIEW]: 2,
  [FlowStatus.APPROVED]: 1,
  [FlowStatus.PENDING]: 0,
};

const RISK_SEVERITY: Record<RiskLevel, number> = {
  [RiskLevel.CRITICAL]: 4,
  [RiskLevel.HIGH]: 3,
  [RiskLevel.MEDIUM]: 2,
  [RiskLevel.LOW]: 1,
};

export class PolicyEngineDomainService {
  /**
   * Evalúa un contexto de flujo contra un conjunto de reglas activas
   * aplicando el patrón Specification y Chain of Responsibility.
   */
  public evaluate(context: FlowEvaluationContext, rules: GovernanceRule[]): PolicyEvaluationResult {
    const activeRules = rules
      .filter((r) => r.getIsActive())
      .sort((a, b) => a.getPriority() - b.getPriority());

    const matchedRules: PolicyEvaluationResult['matchedRules'] = [];
    const reasons: string[] = [];

    for (const rule of activeRules) {
      const actualValue = this.extractFieldValue(context, rule.getTargetField());
      const strategy = RuleOperatorStrategyFactory.getStrategy(rule.getOperator());

      if (strategy.matches(actualValue, rule.getExpectedValue())) {
        const reason = `Violación de política '${rule.getName()}': ${rule.getDescription()}`;
        matchedRules.push({
          ruleId: rule.getId(),
          ruleName: rule.getName(),
          resultingStatus: rule.getResultingStatus(),
          resultingRiskLevel: rule.getResultingRiskLevel(),
          reason,
        });
        reasons.push(reason);

        // Si la regla impone un bloqueo definitivo (BLOCKED), se detiene la cadena inmediatamente
        if (rule.getResultingStatus() === FlowStatus.BLOCKED) {
          break;
        }
      }
    }

    if (matchedRules.length === 0) {
      return {
        matchedRules: [],
        finalStatus: FlowStatus.PENDING,
        finalRiskLevel: RiskLevel.LOW,
        reasons: [],
        isViolated: false,
      };
    }

    // Determina el estado y riesgo más restrictivo entre las reglas que hicieron match
    let finalStatus = FlowStatus.PENDING;
    let maxStatusSeverity = -1;

    let finalRiskLevel = RiskLevel.LOW;
    let maxRiskSeverity = -1;

    for (const match of matchedRules) {
      const statusSeverity = STATUS_SEVERITY[match.resultingStatus] ?? 0;
      if (statusSeverity > maxStatusSeverity) {
        maxStatusSeverity = statusSeverity;
        finalStatus = match.resultingStatus;
      }

      const riskSeverity = RISK_SEVERITY[match.resultingRiskLevel] ?? 0;
      if (riskSeverity > maxRiskSeverity) {
        maxRiskSeverity = riskSeverity;
        finalRiskLevel = match.resultingRiskLevel;
      }
    }

    return {
      matchedRules,
      finalStatus,
      finalRiskLevel,
      reasons,
      isViolated: true,
    };
  }

  private extractFieldValue(context: FlowEvaluationContext, targetField: string): any {
    const field = targetField.trim().toLowerCase();

    if (field === 'platformid' || field === 'platform_id' || field === 'platform') {
      return context.platformId;
    }

    if (field === 'departmentid' || field === 'department_id' || field === 'department') {
      return context.departmentId;
    }

    if (field === 'metadata' || field === 'payload') {
      return context.metadata || {};
    }

    if (field.startsWith('metadata.')) {
      const subKey = targetField.substring('metadata.'.length);
      return context.metadata ? context.metadata[subKey] : undefined;
    }

    // Intenta buscar la clave directa en metadata
    if (context.metadata && context.metadata[targetField] !== undefined) {
      return context.metadata[targetField];
    }

    return undefined;
  }
}

