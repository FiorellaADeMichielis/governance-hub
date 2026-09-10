import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { EvaluateFlowGovernanceUseCase } from '../governance/application/use-cases/evaluate-flow-governance.use-case';

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    private readonly evaluateGovernanceUseCase: EvaluateFlowGovernanceUseCase,
  ) {}

  @EventPattern('flow.registered')
  async handleFlowRegistered(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`[RabbitMQ] Evento 'flow.registered' recibido para flujo: ${data.flowId}`);

    try {
      if (data.flowId) {
        await this.evaluateGovernanceUseCase.execute(data.flowId);
      }
    } catch (error: any) {
      this.logger.error(`Error procesando gobernanza para flujo ${data.flowId}: ${error.message}`);
    } finally {
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    }
  }
}