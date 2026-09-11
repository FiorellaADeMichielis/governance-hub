import { Module, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; 
import { FlowGateway } from './presentation/flow.gateway';
import { FlowOrmEntity } from './infrastructure/persistence/orm-entities/flow.orm-entity';
import { FlowRepository } from './infrastructure/persistence/flow.repository';
import { FLOW_REPOSITORY } from './domain/repositories/flow.repository.interface';
import type { IFlowRepository } from './domain/repositories/flow.repository.interface';
import { RegisterFlowUseCase } from './application/use-cases/register-flow.use-case';
import { FlowsController } from './presentation/flows.controller';
import { ReviewFlowUseCase } from './application/use-cases/review-flow.use-case';
import { GetFlowsUseCase } from './application/use-cases/get-flows.use-case';
import { getInitialSeedFlows } from './infrastructure/persistence/seeds/seed-flows.data';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
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
  exports: [FLOW_REPOSITORY, FlowGateway],
})
export class FlowsModule implements OnModuleInit {
  private readonly logger = new Logger(FlowsModule.name);

  constructor(
    @Inject(FLOW_REPOSITORY)
    private readonly flowRepository: IFlowRepository,
  ) {}

  async onModuleInit() {
    await this.seedInitialFlows();
  }

  private async seedInitialFlows() {
    const count = await this.flowRepository.count();
    if (count === 0) {
      this.logger.log('Sembrando flujos corporativos de prueba en PostgreSQL...');
      const initialFlows = getInitialSeedFlows();
      for (const flow of initialFlows) {
        await this.flowRepository.save(flow);
      }
      this.logger.log(`${initialFlows.length} flujos corporativos sembrados exitosamente.`);
    }
  }
}