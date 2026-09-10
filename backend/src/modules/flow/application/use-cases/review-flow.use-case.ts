import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { FLOW_REPOSITORY } from '../../domain/repositories/flow.repository.interface';
import type { IFlowRepository } from '../../domain/repositories/flow.repository.interface';
import { ReviewFlowDto } from '../../presentation/dtos/review-flow.dto';

@Injectable()
export class ReviewFlowUseCase {
  constructor(
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
  ) {}

  async execute(id: string, dto: ReviewFlowDto) {
    const flow = await this.flowRepository.findById(id);
    if (!flow) {
      throw new NotFoundException(`Flow with ID ${id} not found`);
    }
    try {
      if (dto.action === 'APPROVE') {
        flow.approveFlow();
      } else if (dto.action === 'BLOCK') {
        flow.blockFlow(dto.reason || 'Blocked by admin');
      } else if (dto.action === 'MARK_REVIEW') {
        flow.markForReview(dto.reason || 'Sent to manual review');
      }
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    return await this.flowRepository.save(flow);
  }
}