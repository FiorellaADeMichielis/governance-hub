import { Injectable, Inject, Logger } from '@nestjs/common';
import { GOVERNANCE_RULE_REPOSITORY } from '../../domain/repositories/governance-rule.repository.interface';
import type { IGovernanceRuleRepository } from '../../domain/repositories/governance-rule.repository.interface';
import { FLOW_REPOSITORY } from '../../../flow/domain/repositories/flow.repository.interface';
import type { IFlowRepository } from '../../../flow/domain/repositories/flow.repository.interface';
import { FlowStatus } from '../../../flow/domain/enums/flow-status.enum';
import { PolicyEngineDomainService, PolicyEvaluationResult } from '../../domain/services/policy-engine.domain-service';
import { FlowGateway } from '../../../flow/presentation/flow.gateway';

@Injectable()
export class EvaluateFlowGovernanceUseCase {
  private readonly logger = new Logger(EvaluateFlowGovernanceUseCase.name);
  private readonly policyEngine = new PolicyEngineDomainService();

  constructor(
    @Inject(GOVERNANCE_RULE_REPOSITORY)
    private readonly ruleRepository: IGovernanceRuleRepository,
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
    private readonly flowGateway: FlowGateway,
  ) {}

  async execute(flowId: string): Promise<PolicyEvaluationResult | null> {
    const flow = await this.flowRepository.findById(flowId);
    if (!flow) {
      this.logger.warn(`Flujo con ID '${flowId}' no encontrado para evaluación de gobernanza.`);
      return null;
    }

    const flowProps = flow as any;
    const activeRules = await this.ruleRepository.findActiveSorted();

    const result = this.policyEngine.evaluate(
      {
        platformId: flowProps.platformId,
        departmentId: flowProps.departmentId,
        metadata: flowProps.metadata || {},
      },
      activeRules,
    );

    if (result.isViolated) {
      this.logger.log(`[Governance] Violación detectada en flujo ${flowId}. Estado resultante: ${result.finalStatus} (Riesgo: ${result.finalRiskLevel})`);

      const reasonText = result.reasons.join(' | ');

      try {
        if (result.finalStatus === FlowStatus.BLOCKED) {
          flow.blockFlow(reasonText);
        } else if (result.finalStatus === FlowStatus.RISKY) {
          flow.markAsRisky(result.finalRiskLevel);
        } else if (result.finalStatus === FlowStatus.UNDER_REVIEW) {
          flow.markForReview(reasonText);
        } else if (result.finalStatus === FlowStatus.APPROVED) {
          flow.approveFlow();
        }

        await this.flowRepository.save(flow);
        this.flowGateway.notifyFlowUpdate();
        this.logger.log(`[WebSockets] Dashboard notificado del nuevo estado del flujo ${flowId}`);
      } catch (err: any) {
        this.logger.error(`Error aplicando transición de estado en flujo ${flowId}: ${err.message}`);
      }
    } else {
      this.logger.log(`[Governance] Flujo ${flowId} evaluado: Cumple con todas las políticas activas.`);
    }

    return result;
  }
}

