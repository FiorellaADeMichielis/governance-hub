import { describe, it, expect, beforeEach } from '@jest/globals';
import { PolicyEngineDomainService } from './policy-engine.domain-service';
import { GovernanceRule } from '../entities/governance-rule.entity';
import { RuleOperator } from '../enums/rule-operator.enum';
import { FlowStatus } from '../../../flow/domain/enums/flow-status.enum';
import { RiskLevel } from '../../../flow/domain/enums/risk-level.enum';

describe('PolicyEngineDomainService (Rules Engine Specification)', () => {
  let engine: PolicyEngineDomainService;

  beforeEach(() => {
    engine = new PolicyEngineDomainService();
  });

  it('debe devolver PENDING y LOW si no hay violaciones', () => {
    const rules: GovernanceRule[] = [
      new GovernanceRule(
        '1',
        'Filtro Finanzas',
        'desc',
        'departmentId',
        RuleOperator.EQUALS,
        'finanzas',
        FlowStatus.UNDER_REVIEW,
        RiskLevel.MEDIUM,
      ),
    ];

    const result = engine.evaluate(
      {
        platformId: 'zapier',
        departmentId: 'marketing',
        metadata: {},
      },
      rules,
    );

    expect(result.isViolated).toBe(false);
    expect(result.finalStatus).toBe(FlowStatus.PENDING);
    expect(result.finalRiskLevel).toBe(RiskLevel.LOW);
    expect(result.matchedRules).toHaveLength(0);
  });

  it('debe detectar fuga de credenciales en metadata con operador CONTAINS', () => {
    const rules: GovernanceRule[] = [
      new GovernanceRule(
        '1',
        'Anti-Exfiltración',
        'Credenciales en payload',
        'metadata',
        RuleOperator.CONTAINS,
        'password, token, secret',
        FlowStatus.RISKY,
        RiskLevel.HIGH,
        true,
        1,
      ),
    ];

    const result = engine.evaluate(
      {
        platformId: 'zapier',
        departmentId: 'marketing',
        metadata: { client: 'Acme', api_token: 'xyz-secret-123' },
      },
      rules,
    );

    expect(result.isViolated).toBe(true);
    expect(result.finalStatus).toBe(FlowStatus.RISKY);
    expect(result.finalRiskLevel).toBe(RiskLevel.HIGH);
    expect(result.matchedRules).toHaveLength(1);
    expect(result.matchedRules[0].ruleName).toBe('Anti-Exfiltración');
  });

  it('debe aplicar la severidad más alta (BLOCKED > RISKY) según Chain of Responsibility', () => {
    const rules: GovernanceRule[] = [
      new GovernanceRule(
        '1',
        'Alerta de Departamento',
        'Revisión preventiva',
        'departmentId',
        RuleOperator.EQUALS,
        'marketing',
        FlowStatus.UNDER_REVIEW,
        RiskLevel.MEDIUM,
        true,
        1,
      ),
      new GovernanceRule(
        '2',
        'Bloqueo Plataforma Desconocida',
        'Herramienta prohibida',
        'platformId',
        RuleOperator.IN_LIST,
        'malicious_app, unknown_bot',
        FlowStatus.BLOCKED,
        RiskLevel.CRITICAL,
        true,
        2,
      ),
    ];

    const result = engine.evaluate(
      {
        platformId: 'malicious_app',
        departmentId: 'marketing',
        metadata: {},
      },
      rules,
    );

    expect(result.isViolated).toBe(true);
    expect(result.finalStatus).toBe(FlowStatus.BLOCKED);
    expect(result.finalRiskLevel).toBe(RiskLevel.CRITICAL);
  });

  it('debe ignorar reglas que tengan isActive = false', () => {
    const rules: GovernanceRule[] = [
      new GovernanceRule(
        '1',
        'Regla Inactiva',
        'desc',
        'departmentId',
        RuleOperator.EQUALS,
        'marketing',
        FlowStatus.BLOCKED,
        RiskLevel.CRITICAL,
        false, // Inactiva
      ),
    ];

    const result = engine.evaluate(
      {
        platformId: 'zapier',
        departmentId: 'marketing',
        metadata: {},
      },
      rules,
    );

    expect(result.isViolated).toBe(false);
    expect(result.finalStatus).toBe(FlowStatus.PENDING);
  });
});

