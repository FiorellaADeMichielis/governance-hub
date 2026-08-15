import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowOrmEntity } from './infrastructure/persistence/orm-entities/flow.orm-entity';
import { FlowRepository } from './infrastructure/persistence/flow.repository';
import { FLOW_REPOSITORY } from './domain/repositories/flow.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([FlowOrmEntity])],
  providers: [
    {
      provide: FLOW_REPOSITORY,
      useClass: FlowRepository,
    },
  ],
  exports: [FLOW_REPOSITORY], 
})
export class FlowsModule {}