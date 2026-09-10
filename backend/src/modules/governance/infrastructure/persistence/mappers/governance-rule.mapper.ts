import { GovernanceRule } from '../../../domain/entities/governance-rule.entity';
import { GovernanceRuleOrmEntity } from '../orm-entities/governance-rule.orm-entity';

export class GovernanceRuleMapper {
  public static toDomain(ormEntity: GovernanceRuleOrmEntity): GovernanceRule {
    return new GovernanceRule(
      ormEntity.id,
      ormEntity.name,
      ormEntity.description,
      ormEntity.targetField,
      ormEntity.operator,
      ormEntity.expectedValue,
      ormEntity.resultingStatus,
      ormEntity.resultingRiskLevel,
      ormEntity.isActive,
      ormEntity.priority,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  public static toPersistence(domainEntity: GovernanceRule): GovernanceRuleOrmEntity {
    const ormEntity = new GovernanceRuleOrmEntity();
    ormEntity.id = domainEntity.getId();
    ormEntity.name = domainEntity.getName();
    ormEntity.description = domainEntity.getDescription();
    ormEntity.targetField = domainEntity.getTargetField();
    ormEntity.operator = domainEntity.getOperator();
    ormEntity.expectedValue = domainEntity.getExpectedValue();
    ormEntity.resultingStatus = domainEntity.getResultingStatus();
    ormEntity.resultingRiskLevel = domainEntity.getResultingRiskLevel();
    ormEntity.isActive = domainEntity.getIsActive();
    ormEntity.priority = domainEntity.getPriority();
    ormEntity.createdAt = domainEntity.getCreatedAt();
    ormEntity.updatedAt = domainEntity.getUpdatedAt();

    return ormEntity;
  }
}

