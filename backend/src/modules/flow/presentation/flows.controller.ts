import { Controller, Post, Body, Get, Patch, Param, UseGuards, Query, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy, Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'; 
import { RegisterFlowUseCase } from '../application/use-cases/register-flow.use-case';
import { ReviewFlowUseCase } from '../application/use-cases/review-flow.use-case';
import { GetFlowsUseCase } from '../application/use-cases/get-flows.use-case';
import { RegisterFlowDto } from './dtos/register-flow.dto';
import { ReviewFlowDto } from './dtos/review-flow.dto';
import { GetFlowsDto } from './dtos/get-flows.dto';
import { WebhookIngestionDto } from './dtos/webhook-ingestion.dto';
import { FlowGateway } from './flow.gateway';

@ApiTags('Flows')
@Controller('flows')
export class FlowsController {
  constructor(
    private readonly registerFlowUseCase: RegisterFlowUseCase,
    private readonly reviewFlowUseCase: ReviewFlowUseCase,
    private readonly getFlowsUseCase: GetFlowsUseCase,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly flowGateway: FlowGateway,
  ) {}

  @Get()
  async getAllFlows(@Query() query: GetFlowsDto) {
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

  @Post('webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestWebhook(@Body() payload: WebhookIngestionDto) {
    this.rabbitClient.emit('flow.webhook.received', payload).subscribe({
      error: (err) => console.error(' Error enviando a RabbitMQ:', err),
    });
    
    return { 
      status: 'success',
      message: 'Webhook received and queued for processing' 
    };
  }

  // CONSUMER
  // Este método es llamado internamente por RabbitMQ
  @EventPattern('flow.webhook.received') 
  async handleFlowWebhook(@Payload() payload: any) {
    console.log(`\n [RabbitMQ] ¡PROCESANDO WEBHOOK!`);
    
    try {
      await this.registerFlowUseCase.execute({
        platformId: payload.platformId,
        departmentId: payload.departmentId,
      });
      
      console.log(' [RabbitMQ] Flujo guardado exitosamente.');

      this.flowGateway.notifyFlowUpdate(); 
      console.log(' [WebSockets] Señal de actualización enviada al frontend.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(' [RabbitMQ] Error al procesar el webhook:', errorMessage);
    }
  }

  // Solo los usuarios con un JWT válido pueden ejecutar esta acción.
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