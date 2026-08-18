import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { FLOW_REPOSITORY } from '../../domain/repositories/flow.repository.interface';
import type { IFlowRepository } from '../../domain/repositories/flow.repository.interface';
import { RegisteredFlow } from '../../domain/entities/registered-flow.entity';
import { ReviewFlowDto, ReviewAction } from '../../presentation/dtos/review-flow.dto';

@Injectable()
export class ReviewFlowUseCase {
  constructor(
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
  ) {}
  async execute(flowId: string, dto: ReviewFlowDto): Promise<RegisteredFlow> {
    // 1. Buscar entidad existente
    const flow = await this.flowRepository.findById(flowId);
    if (!flow) {
      throw new NotFoundException(`Flow with ID ${flowId} not found`);
    }
    // 2. Ejecutar lógica de dominio interceptando posibles errores de negocio
    try {
      if (dto.action === ReviewAction.APPROVE) {
        flow.approveFlow();
      } else if (dto.action === ReviewAction.BLOCK) {
        const reason = dto.reason || 'No reason provided';
        flow.blockFlow(reason);
      }
    } catch (error: any) {
      // Si el dominio rechaza el cambio
      throw new BadRequestException(error.message);
    }
    // 3. Guardar el estado mutado
    return await this.flowRepository.save(flow);
  }
}