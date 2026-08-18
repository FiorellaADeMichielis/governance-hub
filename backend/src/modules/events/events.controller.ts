import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  //le dice a NestJS a qué evento debe reaccionar
  @EventPattern('flow.registered')
  handleFlowRegistered(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`⚡ Evento recibido desde RabbitMQ: 'flow.registered'`);
    this.logger.log(`Datos del flujo: ${JSON.stringify(data)}`);
    
    // lógica asíncrona, como:
    // - Enviar un email de alerta a Ciberseguridad.
    // - Evaluar con IA si 'platformId' es una app de alto riesgo.
    // - Notificar por Slack.
    
    // RabbitMQ requiere confirmar que procesamos el mensaje
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}