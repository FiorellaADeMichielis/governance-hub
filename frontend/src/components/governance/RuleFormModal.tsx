import { useState } from 'react';
import type { CreateGovernanceRulePayload, RuleOperator } from '../../types/governance.types';
import { IconClose } from '../common/Icons';

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGovernanceRulePayload) => Promise<void>;
  isLoading: boolean;
}

export const RuleFormModal = ({ isOpen, onClose, onSubmit, isLoading }: RuleFormModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetField, setTargetField] = useState('metadata');
  const [operator, setOperator] = useState<RuleOperator>('CONTAINS');
  const [expectedValue, setExpectedValue] = useState('');
  const [resultingStatus, setResultingStatus] = useState<'PENDING' | 'APPROVED' | 'BLOCKED' | 'RISKY' | 'UNDER_REVIEW'>('RISKY');
  const [resultingRiskLevel, setResultingRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [priority, setPriority] = useState(10);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !expectedValue.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setError('');
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        targetField: targetField.trim(),
        operator,
        expectedValue: expectedValue.trim(),
        resultingStatus,
        resultingRiskLevel,
        priority: Number(priority),
      });
      // Reset form
      setName('');
      setDescription('');
      setExpectedValue('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la regla');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Cabecera */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
              Crear Política de Gobernanza
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Define una regla que evaluará automáticamente los webhooks encolados
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-xs rounded-r-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nombre de la Regla *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Bloqueo de Tarjetas de Crédito"
              required
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Descripción / Justificación de Seguridad *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué riesgo mitiga esta regla..."
              rows={2}
              required
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          {/* Condición: Campo objetivo y Operador */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Campo a Evaluar *
              </label>
              <select
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="metadata">metadata (Payload completo)</option>
                <option value="departmentId">departmentId (Departamento)</option>
                <option value="platformId">platformId (Plataforma LCNC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Operador Lógico *
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as RuleOperator)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="CONTAINS">CONTAINS (Contiene palabras)</option>
                <option value="EQUALS">EQUALS (Igual a)</option>
                <option value="NOT_EQUALS">NOT_EQUALS (Diferente de)</option>
                <option value="IN_LIST">IN_LIST (En lista separada por comas)</option>
                <option value="REGEX">REGEX (Expresión Regular)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Valor Esperado / Términos de Coincidencia *
            </label>
            <input
              type="text"
              value={expectedValue}
              onChange={(e) => setExpectedValue(e.target.value)}
              placeholder="ej. password, token, api_key (separados por coma)"
              required
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs"
            />
          </div>

          {/* Estado resultante, Nivel de riesgo y Prioridad */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Estado si coincide
              </label>
              <select
                value={resultingStatus}
                onChange={(e) => setResultingStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="RISKY">RISKY (Riesgoso)</option>
                <option value="BLOCKED">BLOCKED (Bloquear)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (Revisar)</option>
                <option value="APPROVED">APPROVED (Aprobar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nivel de Riesgo
              </label>
              <select
                value={resultingRiskLevel}
                onChange={(e) => setResultingRiskLevel(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Prioridad (1-99)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Crear Regla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

