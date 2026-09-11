import { Injectable, Inject } from '@nestjs/common';
import { FLOW_REPOSITORY } from '../../domain/repositories/flow.repository.interface';
import type { IFlowRepository, FlowStats } from '../../domain/repositories/flow.repository.interface';
import { RegisteredFlow } from '../../domain/entities/registered-flow.entity';
import { FlowStatus } from '../../domain/enums/flow-status.enum';

@Injectable()
export class GetFlowsUseCase {
  constructor(
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
  ) {}

  async execute(
    page: number = 1, 
    limit: number = 10, 
    status?: FlowStatus,
    departmentId?: string
  ) {
    const skip = (page - 1) * limit;
    const { flows, total } = await this.flowRepository.findWithFilters(skip, limit, status, departmentId);
    const stats = await this.flowRepository.getStats(departmentId);

    return {
      data: flows,
      meta: {
        total,
        page,
        lastPage: Math.max(1, Math.ceil(total / limit)),
        stats,
      }
    };
  }

  async getStats(departmentId?: string): Promise<FlowStats> {
    return this.flowRepository.getStats(departmentId);
  }
}