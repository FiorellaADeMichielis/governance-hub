import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { RegisterFlowUseCase } from '../application/use-cases/register-flow.use-case';
import { ReviewFlowUseCase } from '../application/use-cases/review-flow.use-case';
import { RegisterFlowDto } from './dtos/register-flow.dto';
import { ReviewFlowDto } from './dtos/review-flow.dto';
import { GetFlowsUseCase } from '../application/use-cases/get-flows.use-case';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Flows')
@Controller('flows')
export class FlowsController {
  constructor(
    private readonly registerFlowUseCase: RegisterFlowUseCase,
    private readonly reviewFlowUseCase: ReviewFlowUseCase,
    private readonly getFlowsUseCase: GetFlowsUseCase,
  ) {}
  @Get()
  async getAllFlows() {
    const flows = await this.getFlowsUseCase.execute();
    
    // Mapea las entidades puras a objetos planos para la respuesta JSON
    return flows.map(flow => ({
      id: flow.getId(),
      platformId: (flow as any).platformId, // Acceso rápido para lectura
      departmentId: (flow as any).departmentId,
      status: flow.getStatus(),
      riskLevel: flow.getRiskLevel(),
      createdAt: (flow as any).createdAt,
    }));
  }
  @Post()
  async registerFlow(@Body() dto: RegisterFlowDto) {
    const flow = await this.registerFlowUseCase.execute(dto);
    return {
      id: flow.getId(),
      status: flow.getStatus(),
      riskLevel: flow.getRiskLevel(),
      message: 'Flow registered successfully',
    };
  }
  @Patch(':id/review')
  async reviewFlow(
    @Param('id') id: string,
    @Body() dto: ReviewFlowDto,
  ) {
    const flow = await this.reviewFlowUseCase.execute(id, dto);
    return {
      id: flow.getId(),
      status: flow.getStatus(),
      message: `Flow has been ${dto.action.toLowerCase()}d`,
    };
  }
}