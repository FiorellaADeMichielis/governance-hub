import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowOrmEntity } from './infrastructure/persistence/orm-entities/flow.orm-entity';
import { FlowRepository } from './infrastructure/persistence/flow.repository';
import { FLOW_REPOSITORY } from './domain/repositories/flow.repository.interface';
import { RegisterFlowUseCase } from './application/use-cases/register-flow.use-case';
import { FlowsController } from './presentation/flows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlowOrmEntity])],
  controllers: [FlowsController], // <-- Controlador registrado
  providers: [
    {
      provide: FLOW_REPOSITORY,
      useClass: FlowRepository,
    },
    RegisterFlowUseCase, // <-- Caso de uso registrado
  ],
  exports: [FLOW_REPOSITORY],
})
export class FlowsModule {}