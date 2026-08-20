import { Controller, Post, Body, Get, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { RegisterFlowUseCase } from '../application/use-cases/register-flow.use-case';
import { ReviewFlowUseCase } from '../application/use-cases/review-flow.use-case';
import { GetFlowsUseCase } from '../application/use-cases/get-flows.use-case';
import { RegisterFlowDto } from './dtos/register-flow.dto';
import { ReviewFlowDto } from './dtos/review-flow.dto';
import { GetFlowsDto } from './dtos/get-flows.dto';

@ApiTags('Flows')
@Controller('flows')
export class FlowsController {
  constructor(
    private readonly registerFlowUseCase: RegisterFlowUseCase,
    private readonly reviewFlowUseCase: ReviewFlowUseCase,
    private readonly getFlowsUseCase: GetFlowsUseCase,
  ) {}

  @Get()
  async getAllFlows(@Query() query: GetFlowsDto) {
    // 1. Guardamos el resultado completo en una variable "result"
    const result = await this.getFlowsUseCase.execute(
      query.page,
      query.limit,
      query.status
    );
    return {
      data: result.data.map(flow => ({
        id: flow.getId(),
        platformId: (flow as any).platformId, 
        departmentId: (flow as any).departmentId,
        status: flow.getStatus(),
        riskLevel: flow.getRiskLevel(),
        createdAt: (flow as any).createdAt,
      })),
      meta: result.meta 
    };
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

  //Solo los usuarios con un JWT válido pueden ejecutar esta acción.
  @UseGuards(AuthGuard('jwt')) 
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