import { Injectable, Inject } from '@nestjs/common';
import { FLOW_REPOSITORY } from '../../domain/repositories/flow.repository.interface';
import type { IFlowRepository } from '../../domain/repositories/flow.repository.interface';
import { RegisteredFlow } from '../../domain/entities/registered-flow.entity';
import { FlowStatus } from '../../domain/enums/flow-status.enum';

@Injectable()
export class GetFlowsUseCase {
  constructor(
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
  ) {}

  async execute(page: number = 1, limit: number = 10, status?: FlowStatus) {
    const skip = (page - 1) * limit;
    const { flows, total } = await this.flowRepository.findWithFilters(skip, limit, status);

    return {
      data: flows,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      }
    };
  }
}