import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFlowRepository, FlowStats } from '../../domain/repositories/flow.repository.interface';
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

  async count(): Promise<number> {
    return this.ormRepository.count();
  }

  async deleteAll(): Promise<void> {
    await this.ormRepository.clear();
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

  async getStats(): Promise<FlowStats> {
    const all = await this.ormRepository.find();
    const total = all.length;
    const blocked = all.filter((f) => f.status === FlowStatus.BLOCKED).length;
    const risky = all.filter((f) => f.status === FlowStatus.RISKY || f.status === FlowStatus.UNDER_REVIEW).length;
    const approved = all.filter((f) => f.status === FlowStatus.APPROVED).length;
    const pending = all.filter((f) => f.status === FlowStatus.PENDING).length;

    const byPlatform: Record<string, { total: number; blocked: number }> = {
      zapier: { total: 0, blocked: 0 },
      make: { total: 0, blocked: 0 },
      n8n: { total: 0, blocked: 0 },
      power_automate: { total: 0, blocked: 0 },
    };

    for (const entity of all) {
      const platformKey = entity.platformId.toLowerCase().replace(/-/g, '_');
      if (!byPlatform[platformKey]) {
        byPlatform[platformKey] = { total: 0, blocked: 0 };
      }
      byPlatform[platformKey].total += 1;
      if (entity.status === FlowStatus.BLOCKED) {
        byPlatform[platformKey].blocked += 1;
      }
    }

    return { total, blocked, risky, approved, pending, byPlatform };
  }
}