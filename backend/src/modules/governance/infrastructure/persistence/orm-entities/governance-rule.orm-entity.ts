import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RuleOperator } from '../../../domain/enums/rule-operator.enum';
import { FlowStatus } from '../../../../flow/domain/enums/flow-status.enum';
import { RiskLevel } from '../../../../flow/domain/enums/risk-level.enum';

@Entity('governance_rules')
export class GovernanceRuleOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'target_field', type: 'varchar' })
  targetField!: string;

  @Column({
    type: 'enum',
    enum: RuleOperator,
    default: RuleOperator.CONTAINS,
  })
  operator!: RuleOperator;

  @Column({ name: 'expected_value', type: 'text' })
  expectedValue!: string;

  @Column({
    name: 'resulting_status',
    type: 'enum',
    enum: FlowStatus,
    default: FlowStatus.RISKY,
  })
  resultingStatus!: FlowStatus;

  @Column({
    name: 'resulting_risk_level',
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.HIGH,
  })
  resultingRiskLevel!: RiskLevel;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'integer', default: 10 })
  priority!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
