import type {
  GovernanceRule,
  CreateGovernanceRulePayload,
  SimulationPayload,
  SimulationResponse,
} from '../types/governance.types';
import { AuthService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class GovernanceService {
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    };
  }

  static async getRules(): Promise<GovernanceRule[]> {
    const response = await fetch(`${API_BASE_URL}/governance/rules`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al obtener las reglas de gobernanza');
    }

    const json = await response.json();
    return json.data;
  }

  static async createRule(payload: CreateGovernanceRulePayload): Promise<{ id: string; name: string }> {
    const response = await fetch(`${API_BASE_URL}/governance/rules`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear la regla de gobernanza');
    }

    return response.json();
  }

  static async toggleRule(id: string): Promise<{ id: string; isActive: boolean }> {
    const response = await fetch(`${API_BASE_URL}/governance/rules/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cambiar estado de la regla');
    }

    return response.json();
  }

  static async deleteRule(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/governance/rules/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al eliminar la regla');
    }

    return response.json();
  }

  static async simulate(payload: SimulationPayload): Promise<SimulationResponse> {
    const response = await fetch(`${API_BASE_URL}/governance/simulate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al ejecutar simulación de gobernanza');
    }

    return response.json();
  }
}

