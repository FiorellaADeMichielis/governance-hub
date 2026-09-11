import { RegisteredFlow } from '../entities/registered-flow.entity';
import { FlowStatus } from '../enums/flow-status.enum';

export const FLOW_REPOSITORY = Symbol('FLOW_REPOSITORY');

export interface IFlowRepository {
  save(flow: RegisteredFlow): Promise<RegisteredFlow>;
  findById(id: string): Promise<RegisteredFlow | null>;
  findAll(): Promise<RegisteredFlow[]>;
  count(): Promise<number>;
  deleteAll(): Promise<void>;
  findWithFilters(
    skip: number, 
    take: number, 
    status?: FlowStatus
  ): Promise<{ flows: RegisteredFlow[]; total: number }>;
}