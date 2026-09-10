import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFlowRepository } from '../../domain/repositories/flow.repository.interface';
import { RegisteredFlow } from '../../domain/entities/registered-flow.entity';
import { FlowOrmEntity } from './orm-entities/flow.orm-entity';
import { FlowMapper } from './mappers/flow.mapper';
import { FlowStatus } from '../../domain/enums/flow-status.enum';

@Injectable()
export class FlowRepository implements IFlowRepository {
  constructor(
    @InjectRepository(FlowOrmEntity)
    private readonly ormRepository: Repository<FlowOrmEntity>,
  ) {}

  async save(flow: RegisteredFlow): Promise<RegisteredFlow> {
    const ormEntity = FlowMapper.toPersistence(flow);
    const savedEntity = await this.ormRepository.save(ormEntity);
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

  async findWithFilters(skip: number, take: number, status?: FlowStatus): Promise<{ flows: RegisteredFlow[]; total: number }> {
    const whereCondition = status ? { status } : {};

    const [ormEntities, total] = await this.ormRepository.findAndCount({
      where: whereCondition,
      skip: skip,
      take: take,
      order: { createdAt: 'DESC' }, 
    });

    const flows = ormEntities.map((entity) => FlowMapper.toDomain(entity));

    return { flows, total };
  }
}