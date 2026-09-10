import { FlowStatus } from '../enums/flow-status.enum';
import { RiskLevel } from '../enums/risk-level.enum';

export class RegisteredFlow {
  private readonly id: string;
  private readonly platformId: string;
  private readonly departmentId: string;
  private status: FlowStatus;
  private riskLevel: RiskLevel;
  private metadata: Record<string, any>;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    platformId: string,
    departmentId: string,
    status: FlowStatus = FlowStatus.PENDING,
    riskLevel: RiskLevel = RiskLevel.LOW,
    metadata: Record<string, any> = {},
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this.id = id;
    this.platformId = platformId;
    this.departmentId = departmentId;
    this.status = status;
    this.riskLevel = riskLevel;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): string { return this.id; }
  getStatus(): FlowStatus { return this.status; }
  getRiskLevel(): RiskLevel { return this.riskLevel; }

  public markForReview(reason: string): void {
    if (this.status !== FlowStatus.APPROVED && this.status !== FlowStatus.BLOCKED) {
      throw new Error('Solo los flujos aprobados o bloqueados pueden ser puestos en revisión.');
    }
    this.status = FlowStatus.UNDER_REVIEW;
    this.metadata['reviewReason'] = reason;
    this.markAsUpdated();
  }

  public blockFlow(reason: string): void {
    if (this.status === FlowStatus.APPROVED) {
      throw new Error('Cannot block an already approved flow without prior review.');
    }
    this.status = FlowStatus.BLOCKED;
    this.metadata['blockReason'] = reason;
    this.markAsUpdated();
  }

  public approveFlow(): void {
    if (this.status === FlowStatus.BLOCKED) {
      throw new Error('Cannot approve a blocked flow directly. It must be reviewed first.');
    }
    this.status = FlowStatus.APPROVED;
    this.markAsUpdated();
  }

  public markAsRisky(level: RiskLevel): void {
    this.status = FlowStatus.RISKY;
    this.riskLevel = level;
    this.markAsUpdated();
  }

  private markAsUpdated(): void {
    this.updatedAt = new Date();
  }
}