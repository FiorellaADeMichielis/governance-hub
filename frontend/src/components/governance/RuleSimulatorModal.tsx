import { useState } from 'react';
import type { SimulationResponse, SimulationPayload } from '../../types/governance.types';
import { GovernanceService } from '../../services/governance.service';
import { 
  IconZap, 
  IconClose, 
  IconPlay, 
  IconCheck, 
  IconWarning, 
  IconInfo, 
  IconBlocks 
} from '../common/Icons';

interface RuleSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS: { 
  label: string; 
  badgeType: 'warning' | 'info' | 'danger' | 'success'; 
  payload: SimulationPayload 
}[] = [
  {
    label: 'Zapier con Token Expuesto',
    badgeType: 'warning',
    payload: {
      platformId: 'zapier',
      departmentId: 'marketing',
      metadata: { action: 'sync_lead', api_token: 'secret_bearer_key_998877' },
    },
  },
  {
    label: 'Make con Flujo de Finanzas',
    badgeType: 'info',
    payload: {
      platformId: 'make',
      departmentId: 'finanzas',
      metadata: { invoiceId: 'INV-2026-90', amount: 15400 },
    },
  },
  {
    label: 'Plataforma No Homologada',
    badgeType: 'danger',
    payload: {
      platformId: 'unknown_tool',
      departmentId: 'operaciones',
      metadata: { payload: 'unauthorized_script' },
    },
  },
  {
    label: 'Flujo Seguro de Marketing',
    badgeType: 'success',
    payload: {
      platformId: 'zapier',
      departmentId: 'marketing',
      metadata: { campaignName: 'Summer Promo 2026' },
    },
  },
];

export const RuleSimulatorModal = ({ isOpen, onClose }: RuleSimulatorModalProps) => {
  const [platformId, setPlatformId] = useState('zapier');
  const [departmentId, setDepartmentId] = useState('marketing');
  const [metadataJson, setMetadataJson] = useState('{\n  "action": "sync_lead",\n  "api_token": "secret_bearer_key_998877"\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulationResult, setSimulationResult] = useState<SimulationResponse['result'] | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setPlatformId(preset.payload.platformId);
    setDepartmentId(preset.payload.departmentId);
    setMetadataJson(JSON.stringify(preset.payload.metadata || {}, null, 2));
    setSimulationResult(null);
    setError('');
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let parsedMetadata = {};
    try {
      parsedMetadata = JSON.parse(metadataJson);
    } catch {
      setError('El JSON de metadata no es válido.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await GovernanceService.simulate({
        platformId: platformId.trim(),
        departmentId: departmentId.trim(),
        metadata: parsedMetadata,
      });
      setSimulationResult(response.result);
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar la simulación');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BLOCKED':
        return 'bg-red-500 text-white';
      case 'RISKY':
        return 'bg-orange-500 text-white';
      case 'UNDER_REVIEW':
        return 'bg-amber-500 text-stone-950 font-bold';
      default:
        return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg border border-orange-500/20">
              <IconZap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                Playground de Simulación de Políticas
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Evalúa una carga útil (payload) contra las reglas de gobernanza en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Presets rápidos */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
              Casos de prueba preconfigurados
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-2 text-xs font-medium text-left rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors truncate flex items-center gap-2"
                >
                  {preset.badgeType === 'warning' && <IconWarning className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  {preset.badgeType === 'info' && <IconInfo className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  {preset.badgeType === 'danger' && <IconBlocks className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                  {preset.badgeType === 'success' && <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  <span className="truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSimulate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Plataforma LCNC
                </label>
                <input
                  type="text"
                  value={platformId}
                  onChange={(e) => setPlatformId(e.target.value)}
                  placeholder="zapier, make, n8n..."
                  required
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  placeholder="marketing, finanzas, legal..."
                  required
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Metadata / Payload JSON
              </label>
              <textarea
                value={metadataJson}
                onChange={(e) => setMetadataJson(e.target.value)}
                rows={5}
                required
                className="w-full p-3 text-xs bg-stone-950 text-stone-100 font-mono rounded-lg border border-stone-800 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-xs rounded-r-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Evaluando reglas...</span>
              ) : (
                <>
                  <IconPlay className="w-3.5 h-3.5" />
                  <span>Simular Evaluación del Motor</span>
                </>
              )}
            </button>
          </form>

          {/* Resultado de la simulación */}
          {simulationResult && (
            <div className="mt-4 p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Resultado de la Evaluación (Policy Engine)
              </h4>

              <div className="flex items-center gap-3 mb-4">
                <div className="text-xs text-stone-600 dark:text-stone-400">Estado final:</div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${getStatusColor(simulationResult.finalStatus)}`}>
                  {simulationResult.finalStatus}
                </span>

                <div className="text-xs text-stone-600 dark:text-stone-400 ml-2">Nivel de Riesgo:</div>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                  {simulationResult.finalRiskLevel}
                </span>
              </div>

              {simulationResult.matchedRules.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Reglas que coincidieron ({simulationResult.matchedRules.length}):
                  </p>
                  {simulationResult.matchedRules.map((match, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-stone-100 mb-1">
                        <span>{match.ruleName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getStatusColor(match.resultingStatus)}`}>
                          {match.resultingStatus}
                        </span>
                      </div>
                      <p className="text-stone-500 dark:text-stone-400 text-[11px]">
                        {match.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-xs rounded-lg flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>El payload cumple con todas las políticas activas de la organización.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

