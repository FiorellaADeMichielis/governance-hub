import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFlowRepository } from '../../domain/repositories/flow.repository.interface';
import { RegisteredFlow } from '../../domain/entities/registered-flow.entity';
import { FlowOrmEntity } from './orm-entities/flow.orm-entity';
import { FlowMapper } from './mappers/flow.mapper';

@Injectable()
export class FlowRepository implements IFlowRepository {
  constructor(
    @InjectRepository(FlowOrmEntity)
    private readonly ormRepository: Repository<FlowOrmEntity>,
  ) {}

  async save(flow: RegisteredFlow): Promise<RegisteredFlow> {
    // 1. Dominio -> TypeORM
    const ormEntity = FlowMapper.toPersistence(flow);
    // 2. Guardar en base de datos
    const savedEntity = await this.ormRepository.save(ormEntity);
    // 3. TypeORM -> Dominio
    return FlowMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<RegisteredFlow | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return FlowMapper.toDomain(ormEntity);
  }

  async findAll(): Promise<RegisteredFlow[]> {
    const ormEntities = await this.ormRepository.find();
    return ormEntities.map((entity) => FlowMapper.toDomain(entity));
  }
}