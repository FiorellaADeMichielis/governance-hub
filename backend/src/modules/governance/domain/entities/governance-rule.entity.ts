import { FlowStatus } from '../../../flow/domain/enums/flow-status.enum';
import { RiskLevel } from '../../../flow/domain/enums/risk-level.enum';
import { RuleOperator } from '../enums/rule-operator.enum';

export class GovernanceRule {
  private readonly id: string;
  private name: string;
  private description: string;
  private targetField: string;
  private operator: RuleOperator;
  private expectedValue: string;
  private resultingStatus: FlowStatus;
  private resultingRiskLevel: RiskLevel;
  private isActive: boolean;
  private priority: number;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    targetField: string,
    operator: RuleOperator,
    expectedValue: string,
    resultingStatus: FlowStatus = FlowStatus.RISKY,
    resultingRiskLevel: RiskLevel = RiskLevel.HIGH,
    isActive: boolean = true,
    priority: number = 10,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.targetField = targetField;
    this.operator = operator;
    this.expectedValue = expectedValue;
    this.resultingStatus = resultingStatus;
    this.resultingRiskLevel = resultingRiskLevel;
    this.isActive = isActive;
    this.priority = priority;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getDescription(): string { return this.description; }
  getTargetField(): string { return this.targetField; }
  getOperator(): RuleOperator { return this.operator; }
  getExpectedValue(): string { return this.expectedValue; }
  getResultingStatus(): FlowStatus { return this.resultingStatus; }
  getResultingRiskLevel(): RiskLevel { return this.resultingRiskLevel; }
  getIsActive(): boolean { return this.isActive; }
  getPriority(): number { return this.priority; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  public activate(): void {
    this.isActive = true;
    this.markAsUpdated();
  }

  public deactivate(): void {
    this.isActive = false;
    this.markAsUpdated();
  }

  public toggle(): boolean {
    this.isActive = !this.isActive;
    this.markAsUpdated();
    return this.isActive;
  }

  public updateCriteria(
    name: string,
    description: string,
    targetField: string,
    operator: RuleOperator,
    expectedValue: string,
    resultingStatus: FlowStatus,
    resultingRiskLevel: RiskLevel,
    priority: number,
  ): void {
    this.name = name;
    this.description = description;
    this.targetField = targetField;
    this.operator = operator;
    this.expectedValue = expectedValue;
    this.resultingStatus = resultingStatus;
    this.resultingRiskLevel = resultingRiskLevel;
    this.priority = priority;
    this.markAsUpdated();
  }

  private markAsUpdated(): void {
    this.updatedAt = new Date();
  }
}

