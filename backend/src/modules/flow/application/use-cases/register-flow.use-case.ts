import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { type IFlowRepository, FLOW_REPOSITORY } from '../../domain/repositories/flow.repository.interface';
import { RegisteredFlow } from '../../domain/entities/registered-flow.entity';
import { RegisterFlowDto } from '../../presentation/dtos/register-flow.dto';

@Injectable()
export class RegisterFlowUseCase {
  constructor(
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
  ) {}

  async execute(dto: RegisterFlowDto): Promise<RegisteredFlow> {
    // 1. Crear la entidad de Dominio Pura (Generamos un UUID aquí)
    const newFlow = new RegisteredFlow(
      uuidv4(),
      dto.platformId,
      dto.departmentId,
      undefined, // status por defecto
      undefined, // riskLevel por defecto
      dto.metadata || {},
    );

    // 2. Persistir utilizando el puerto (la interfaz)
    const savedFlow = await this.flowRepository.save(newFlow);

    // 3. Retornar el resultado
    return savedFlow;
  }
}