import { Controller, Post, Body } from '@nestjs/common';
import { RegisterFlowUseCase } from '../application/use-cases/register-flow.use-case';
import { RegisterFlowDto } from './dtos/register-flow.dto';

@Controller('flows')
export class FlowsController {
  constructor(private readonly registerFlowUseCase: RegisterFlowUseCase) {}

  @Post()
  async registerFlow(@Body() dto: RegisterFlowDto) {
    const flow = await this.registerFlowUseCase.execute(dto);
    
    // Convertimos la entidad pura a un formato JSON amigable para la respuesta
    return {
      id: flow.getId(),
      status: flow.getStatus(),
      riskLevel: flow.getRiskLevel(),
      message: 'Flow registered successfully',
    };
  }
}