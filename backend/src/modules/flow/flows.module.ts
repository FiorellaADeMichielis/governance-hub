import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowOrmEntity } from './infrastructure/persistence/orm-entities/flow.orm-entity';
import { FlowRepository } from './infrastructure/persistence/flow.repository';
import { FLOW_REPOSITORY } from './domain/repositories/flow.repository.interface';
import { RegisterFlowUseCase } from './application/use-cases/register-flow.use-case';
import { FlowsController } from './presentation/flows.controller';
import { ReviewFlowUseCase } from './application/use-cases/review-flow.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([FlowOrmEntity])],
  controllers: [FlowsController],
  providers: [
    {
      provide: FLOW_REPOSITORY,
      useClass: FlowRepository,
    },
    RegisterFlowUseCase,
    ReviewFlowUseCase, 
  ],
  exports: [FLOW_REPOSITORY],
})
export class FlowsModule {}