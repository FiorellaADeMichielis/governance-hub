import { RegisteredFlow } from './registered-flow.entity';
import { FlowStatus } from '../enums/flow-status.enum';
import { RiskLevel } from '../enums/risk-level.enum';
import { describe, it, expect } from '@jest/globals';

describe('RegisteredFlow Entity', () => {
  
  // Test 1: Comprobar que se crea correctamente
  it('deberia crear una entidad con estado PENDING por defecto', () => {
    // 1. Arrange (Preparar)
    const id = '123e4567-e89b-12d3-a456-426614174000';
    
    // 2. Act (Actuar)
    const flow = new RegisteredFlow(id, 'zapier', 'marketing', undefined, undefined, {});

    // 3. Assert (Comprobar)
    expect(flow.getId()).toBe(id);
    expect(flow.getStatus()).toBe(FlowStatus.PENDING);
    expect(flow.getRiskLevel()).toBe(RiskLevel.LOW);
  });

  // Test 2: Comprobar una transición de estado válida
  it('deberia permitir aprobar un flujo que esta pendiente', () => {
    // 1. Arrange
    const flow = new RegisteredFlow('123', 'slack', 'it', FlowStatus.PENDING, RiskLevel.LOW, {});
    
    // 2. Act
    flow.approveFlow();

    // 3. Assert
    expect(flow.getStatus()).toBe(FlowStatus.APPROVED);
  });

  // Test 3: Comprobar REGLA DE NEGOCIO estricta 
  it('deberia lanzar un error al intentar bloquear un flujo que ya esta aprobado', () => {
    // 1. Arrange (flujo ya aprobado)
    const flow = new RegisteredFlow('123', 'trello', 'sales', FlowStatus.APPROVED, RiskLevel.LOW, {});

    // 2 & 3. Act & Assert (Espera que la función lance un error)
    expect(() => {
      flow.blockFlow('Violación de seguridad');
    }).toThrow('Cannot block an already approved flow without prior review.'); 
  });
  // Test 4: Comprobar el flujo de auditoría
  it('deberia permitir poner en revision un flujo aprobado y luego bloquearlo', () => {
    // 1. Arrange: Flujo aprobado
    const flow = new RegisteredFlow('123', 'dropbox', 'it', FlowStatus.APPROVED, RiskLevel.LOW, {});
    // 2. Act: Lo pone en revisión
    flow.markForReview('Sospecha de fuga de datos');
    // 3. Assert 1: Verifica el cambio de estado
    expect(flow.getStatus()).toBe(FlowStatus.UNDER_REVIEW);
    // 4. Act: Intenta bloquearlo
    flow.blockFlow('Fuga de datos confirmada');
    // 5. Assert 2: Verifica que se pudo bloquear exitosamente
    expect(flow.getStatus()).toBe(FlowStatus.BLOCKED);
  });
});