import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { FLOW_REPOSITORY } from '../../domain/repositories/flow.repository.interface';
import type { IFlowRepository } from '../../domain/repositories/flow.repository.interface';
import { RegisteredFlow } from '../../domain/entities/registered-flow.entity';
import { RegisterFlowDto } from '../../presentation/dtos/register-flow.dto';

@Injectable()
export class RegisterFlowUseCase {
  constructor(
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
    @Inject('RABBITMQ_SERVICE') 
    private readonly messageBroker: ClientProxy,
  ) {}

  async execute(dto: RegisterFlowDto): Promise<RegisteredFlow> {
    const newFlow = new RegisteredFlow(
      uuidv4(),
      dto.platformId,
      dto.departmentId,
      undefined, 
      undefined, 
      dto.metadata || {},
    );

    const savedFlow = await this.flowRepository.save(newFlow);
    this.messageBroker.emit('flow.registered', {
      flowId: savedFlow.getId(),
      platformId: dto.platformId,
      departmentId: dto.departmentId,
      timestamp: new Date().toISOString(),
    });

    return savedFlow;
  }
}