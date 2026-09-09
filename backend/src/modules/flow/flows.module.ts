import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; 
import { FlowGateway } from './presentation/flow.gateway';
import { FlowOrmEntity } from './infrastructure/persistence/orm-entities/flow.orm-entity';
import { FlowRepository } from './infrastructure/persistence/flow.repository';
import { FLOW_REPOSITORY } from './domain/repositories/flow.repository.interface';
import { RegisterFlowUseCase } from './application/use-cases/register-flow.use-case';
import { FlowsController } from './presentation/flows.controller';
import { ReviewFlowUseCase } from './application/use-cases/review-flow.use-case';
import { GetFlowsUseCase } from './application/use-cases/get-flows.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlowOrmEntity]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'governance_flows_queue',
          queueOptions: {
            durable: true, 
          },
        },
      },
    ]),
  ],
  controllers: [FlowsController],
  providers: [
    {
      provide: FLOW_REPOSITORY,
      useClass: FlowRepository,
    },
    RegisterFlowUseCase,
    ReviewFlowUseCase,
    GetFlowsUseCase,
    FlowGateway,
  ],
  exports: [FLOW_REPOSITORY],
})
export class FlowsModule {}