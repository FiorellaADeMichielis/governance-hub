import { RegisteredFlow } from '../../../domain/entities/registered-flow.entity';
import { FlowOrmEntity } from '../orm-entities/flow.orm-entity';

export class FlowMapper {
  public static toDomain(ormEntity: FlowOrmEntity): RegisteredFlow {
    return new RegisteredFlow(
      ormEntity.id,
      ormEntity.platformId,
      ormEntity.departmentId,
      ormEntity.status,
      ormEntity.riskLevel,
      ormEntity.metadata,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  public static toPersistence(domainEntity: RegisteredFlow): FlowOrmEntity {
    const ormEntity = new FlowOrmEntity();
    ormEntity.id = domainEntity.getId();
    const props = domainEntity as any;
    
    ormEntity.platformId = props.platformId;
    ormEntity.departmentId = props.departmentId;
    ormEntity.status = props.status;
    ormEntity.riskLevel = props.riskLevel;
    ormEntity.metadata = props.metadata;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;

    return ormEntity;
  }
}