import { RegisteredFlow } from './registered-flow.entity';
import { FlowStatus } from '../enums/flow-status.enum';
import { RiskLevel } from '../enums/risk-level.enum';
import { describe, it, expect } from '@jest/globals';

describe('RegisteredFlow Entity', () => {
  it('deberia crear una entidad con estado PENDING por defecto', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const flow = new RegisteredFlow(id, 'zapier', 'marketing', undefined, undefined, {});

    expect(flow.getId()).toBe(id);
    expect(flow.getStatus()).toBe(FlowStatus.PENDING);
    expect(flow.getRiskLevel()).toBe(RiskLevel.LOW);
  });

  it('deberia permitir aprobar un flujo que esta pendiente', () => {
    const flow = new RegisteredFlow('123', 'slack', 'it', FlowStatus.PENDING, RiskLevel.LOW, {});
    flow.approveFlow();

    expect(flow.getStatus()).toBe(FlowStatus.APPROVED);
  });

  it('deberia lanzar un error al intentar bloquear un flujo que ya esta aprobado', () => {
    const flow = new RegisteredFlow('123', 'trello', 'sales', FlowStatus.APPROVED, RiskLevel.LOW, {});

    expect(() => {
      flow.blockFlow('Violación de seguridad');
    }).toThrow('Cannot block an already approved flow without prior review.'); 
  });

  it('deberia permitir poner en revision un flujo aprobado y luego bloquearlo', () => {
    const flow = new RegisteredFlow('123', 'dropbox', 'it', FlowStatus.APPROVED, RiskLevel.LOW, {});
    flow.markForReview('Sospecha de fuga de datos');
    expect(flow.getStatus()).toBe(FlowStatus.UNDER_REVIEW);

    flow.blockFlow('Fuga de datos confirmada');
    expect(flow.getStatus()).toBe(FlowStatus.BLOCKED);
  });
});