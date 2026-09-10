import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IGovernanceRuleRepository } from '../../domain/repositories/governance-rule.repository.interface';
import { GovernanceRule } from '../../domain/entities/governance-rule.entity';
import { GovernanceRuleOrmEntity } from './orm-entities/governance-rule.orm-entity';
import { GovernanceRuleMapper } from './mappers/governance-rule.mapper';

@Injectable()
export class GovernanceRuleRepository implements IGovernanceRuleRepository {
  constructor(
    @InjectRepository(GovernanceRuleOrmEntity)
    private readonly ormRepository: Repository<GovernanceRuleOrmEntity>,
  ) {}

  async save(rule: GovernanceRule): Promise<GovernanceRule> {
    const ormEntity = GovernanceRuleMapper.toPersistence(rule);
    const saved = await this.ormRepository.save(ormEntity);
    return GovernanceRuleMapper.toDomain(saved);
  }

  async findById(id: string): Promise<GovernanceRule | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return GovernanceRuleMapper.toDomain(ormEntity);
  }

  async findAll(): Promise<GovernanceRule[]> {
    const ormEntities = await this.ormRepository.find({
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
    return ormEntities.map(GovernanceRuleMapper.toDomain);
  }

  async findActiveSorted(): Promise<GovernanceRule[]> {
    const ormEntities = await this.ormRepository.find({
      where: { isActive: true },
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
    return ormEntities.map(GovernanceRuleMapper.toDomain);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.ormRepository.count();
  }
}

