import { useState, useEffect, useCallback } from 'react';
import type { GovernanceRule, CreateGovernanceRulePayload } from '../types/governance.types';
import type { UserSession } from '../types/auth.types';
import { GovernanceService } from '../services/governance.service';
import { RuleCard } from '../components/governance/RuleCard';
import { RuleFormModal } from '../components/governance/RuleFormModal';
import { RuleSimulatorModal } from '../components/governance/RuleSimulatorModal';
import { IconPlay, IconPlus, IconInfo } from '../components/common/Icons';

interface GovernancePageProps {
  user: UserSession;
}

export const GovernancePage = ({ user }: GovernancePageProps) => {
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const isAdmin = user.role === 'ADMIN';

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await GovernanceService.getRules();
      setRules(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las reglas de gobernanza');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleToggle = async (id: string) => {
    if (!isAdmin) {
      alert('Operación restringida: Solo el personal de TI / Seguridad puede modificar reglas.');
      return;
    }

    try {
      setTogglingId(id);
      const res = await GovernanceService.toggleRule(id);
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: res.isActive } : r)),
      );
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado de la regla');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert('Operación restringida: Solo el personal de TI / Seguridad puede eliminar reglas.');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta política?');
    if (!confirmDelete) return;

    try {
      await GovernanceService.deleteRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la regla');
    }
  };

  const handleCreate = async (payload: CreateGovernanceRulePayload) => {
    try {
      setIsSubmitting(true);
      await GovernanceService.createRule(payload);
      await fetchRules();
      setIsCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Métricas calculadas
  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.isActive).length;
  const criticalRules = rules.filter((r) => r.resultingRiskLevel === 'CRITICAL' || r.resultingStatus === 'BLOCKED').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Políticas de Gobernanza
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Motor de reglas activas para clasificación y mitigación automática del Shadow IT
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Botón Playground / Simulador */}
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <IconPlay className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Probar en Playground</span>
          </button>

          {/* Botón Nueva Regla (Solo Admin) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-orange-600/20"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Nueva Política</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner informativo si es usuario regular */}
      {!isAdmin && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs rounded-xl flex items-center gap-2">
          <IconInfo className="w-4 h-4 shrink-0" />
          <span>
            Modo consulta: Tu cuenta posee permisos de auditoría de solo lectura. Solo el personal de TI / Seguridad puede crear, editar o pausar políticas.
          </span>
        </div>
      )}

      {/* Tarjetas de Métricas de Gobernanza */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Total de Políticas</div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-50 mt-1">{totalRules}</div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Configuradas en PostgreSQL</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Políticas Activas</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeRules}</div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Evaluadas por RabbitMQ en vivo</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Políticas Críticas / Bloqueo</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalRules}</div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Prevención de fuga de datos</div>
        </div>
      </div>

      {/* Lista de Reglas */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-xs rounded-r-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500 dark:text-stone-400">
          Cargando políticas de gobernanza...
        </div>
      ) : rules.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No hay políticas configuradas
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Crea una nueva política para comenzar a evaluar los flujos entrantes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggle}
              onDelete={handleDelete}
              isToggling={togglingId === rule.id}
            />
          ))}
        </div>
      )}

      {/* Modal Crear Regla */}
      <RuleFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />

      {/* Modal Simulador / Playground */}
      <RuleSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
};

