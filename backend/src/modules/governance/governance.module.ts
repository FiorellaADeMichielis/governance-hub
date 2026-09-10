import { Module, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { GovernanceRuleOrmEntity } from './infrastructure/persistence/orm-entities/governance-rule.orm-entity';
import { GovernanceRuleRepository } from './infrastructure/persistence/governance-rule.repository';
import { GOVERNANCE_RULE_REPOSITORY } from './domain/repositories/governance-rule.repository.interface';
import type { IGovernanceRuleRepository } from './domain/repositories/governance-rule.repository.interface';
import { GovernanceRule } from './domain/entities/governance-rule.entity';
import { RuleOperator } from './domain/enums/rule-operator.enum';
import { FlowStatus } from '../flow/domain/enums/flow-status.enum';
import { RiskLevel } from '../flow/domain/enums/risk-level.enum';
import { GetGovernanceRulesUseCase } from './application/use-cases/get-governance-rules.use-case';
import { CreateGovernanceRuleUseCase } from './application/use-cases/create-governance-rule.use-case';
import { ToggleRuleStatusUseCase } from './application/use-cases/toggle-rule-status.use-case';
import { DeleteGovernanceRuleUseCase } from './application/use-cases/delete-governance-rule.use-case';
import { SimulateGovernanceEvaluationUseCase } from './application/use-cases/simulate-governance-evaluation.use-case';
import { EvaluateFlowGovernanceUseCase } from './application/use-cases/evaluate-flow-governance.use-case';
import { GovernanceController } from './presentation/governance.controller';
import { AuthModule } from '../auth/auth.module';
import { FlowsModule } from '../flow/flows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GovernanceRuleOrmEntity]),
    AuthModule,
    FlowsModule,
  ],
  controllers: [GovernanceController],
  providers: [
    {
      provide: GOVERNANCE_RULE_REPOSITORY,
      useClass: GovernanceRuleRepository,
    },
    GetGovernanceRulesUseCase,
    CreateGovernanceRuleUseCase,
    ToggleRuleStatusUseCase,
    DeleteGovernanceRuleUseCase,
    SimulateGovernanceEvaluationUseCase,
    EvaluateFlowGovernanceUseCase,
  ],
  exports: [GOVERNANCE_RULE_REPOSITORY, EvaluateFlowGovernanceUseCase],
})
export class GovernanceModule implements OnModuleInit {
  private readonly logger = new Logger(GovernanceModule.name);

  constructor(
    @Inject(GOVERNANCE_RULE_REPOSITORY)
    private readonly ruleRepository: IGovernanceRuleRepository,
  ) {}

  async onModuleInit() {
    await this.seedInitialRules();
  }

  private async seedInitialRules() {
    const count = await this.ruleRepository.count();
    if (count === 0) {
      this.logger.log('Sembrando reglas de gobernanza por defecto en PostgreSQL...');

      const initialRules: GovernanceRule[] = [
        new GovernanceRule(
          uuidv4(),
          'Detección de Credenciales en Payloads',
          'Detecta e intercepta automatizaciones que transmiten contraseñas, API keys, tokens o secretos en sus datos.',
          'metadata',
          RuleOperator.CONTAINS,
          'password, token, secret, apikey, bearer, private_key',
          FlowStatus.RISKY,
          RiskLevel.HIGH,
          true,
          1,
        ),
        new GovernanceRule(
          uuidv4(),
          'Aislamiento Preventivo de Finanzas',
          'Cualquier integración generada desde el departamento de Finanzas debe someterse a revisión de seguridad.',
          'departmentId',
          RuleOperator.EQUALS,
          'finanzas',
          FlowStatus.UNDER_REVIEW,
          RiskLevel.MEDIUM,
          true,
          2,
        ),
        new GovernanceRule(
          uuidv4(),
          'Bloqueo de Plataformas No Homologadas',
          'Bloqueo perimetral automático de plataformas no autorizadas o scripts no identificados por TI.',
          'platformId',
          RuleOperator.IN_LIST,
          'unknown_tool, suspicious_bot, blacklisted_app, unverified_webhook',
          FlowStatus.BLOCKED,
          RiskLevel.CRITICAL,
          true,
          3,
        ),
      ];

      for (const rule of initialRules) {
        await this.ruleRepository.save(rule);
      }

      this.logger.log(`✅ ${initialRules.length} reglas de gobernanza sembradas exitosamente.`);
    }
  }
}
