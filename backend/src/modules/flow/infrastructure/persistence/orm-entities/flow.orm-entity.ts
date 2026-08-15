import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FlowStatus } from '../../../domain/enums/flow-status.enum';
import { RiskLevel } from '../../../domain/enums/risk-level.enum';

@Entity('registered_flows')
export class FlowOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'platform_id', type: 'varchar' })
  platformId!: string;

  @Column({ name: 'department_id', type: 'varchar' })
  departmentId!: string;

  @Column({ type: 'enum', enum: FlowStatus, default: FlowStatus.PENDING })
  status!: FlowStatus;

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.LOW, name: 'risk_level' })
  riskLevel!: RiskLevel;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}