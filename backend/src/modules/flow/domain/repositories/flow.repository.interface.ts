import { RegisteredFlow } from '../entities/registered-flow.entity';

export const FLOW_REPOSITORY = Symbol('FLOW_REPOSITORY');

export interface IFlowRepository {
  save(flow: RegisteredFlow): Promise<RegisteredFlow>;
  findById(id: string): Promise<RegisteredFlow | null>;
  findAll(): Promise<RegisteredFlow[]>;
}