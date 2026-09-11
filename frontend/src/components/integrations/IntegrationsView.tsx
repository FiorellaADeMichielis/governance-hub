import { useState } from 'react';
import { 
  IconZap, 
  IconIntegrations, 
  IconGovernance, 
  IconDashboard, 
  IconCheck, 
  IconCopy,
  IconPlay,
} from '../common/Icons';
import { useTranslation } from '../../i18n/useTranslation';
import type { Flow } from '../FlowTable';
import type { UserSession } from '../../types/auth.types';
import { ConnectorTelemetryChart } from './ConnectorTelemetryChart';

interface IntegrationsViewProps {
  flows?: Flow[];
  stats?: {
    total: number;
    blocked: number;
    risky: number;
    approved: number;
    pending: number;
    byPlatform: Record<string, { total: number; blocked: number }>;
  };
  user?: UserSession | null;
}

interface ConnectorDefinition {
  id: string;
  name: string;
  icon: (className?: string) => React.ReactNode;
  category: 'iPaaS' | 'Self-Hosted' | 'Enterprise RPA';
  avgLatency: string;
  authMethod: string;
  descriptionKey: 'zapierDesc' | 'makeDesc' | 'n8nDesc' | 'powerAutomateDesc';
}

const CANONICAL_DEPARTMENTS = [
  'marketing',
  'finanzas',
  'it',
  'operaciones',
  'ventas',
  'legal',
  'rrhh',
];

export const IntegrationsView = ({ flows = [], stats, user }: IntegrationsViewProps) => {
  const { t, tDepartment } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';

  const defaultDept = user?.department 
    ? user.department.toLowerCase().replace(/[^a-z]/g, '')
    : 'marketing';
  const initialDept = CANONICAL_DEPARTMENTS.includes(defaultDept) ? defaultDept : 'marketing';

  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('zapier');
  const [copied, setCopied] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testNotice, setTestNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [simulatedFlowName, setSimulatedFlowName] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const connectors: ConnectorDefinition[] = [
    {
      id: 'zapier',
      name: 'Zapier',
      icon: (cls) => <IconZap className={cls || 'w-5 h-5 text-orange-600 dark:text-orange-400'} />,
      category: 'iPaaS',
      avgLatency: '18ms',
      authMethod: 'Webhook Shared Secret (HMAC)',
      descriptionKey: 'zapierDesc',
    },
    {
      id: 'make',
      name: 'Make (Integromat)',
      icon: (cls) => <IconIntegrations className={cls || 'w-5 h-5 text-purple-600 dark:text-purple-400'} />,
      category: 'iPaaS',
      avgLatency: '22ms',
      authMethod: 'Custom Header HMAC-SHA256',
      descriptionKey: 'makeDesc',
    },
    {
      id: 'n8n',
      name: 'n8n',
      icon: (cls) => <IconGovernance className={cls || 'w-5 h-5 text-amber-600 dark:text-amber-400'} />,
      category: 'Self-Hosted',
      avgLatency: '14ms',
      authMethod: 'Bearer Token + IP Whitelist',
      descriptionKey: 'n8nDesc',
    },
    {
      id: 'power-automate',
      name: 'Power Automate',
      icon: (cls) => <IconDashboard className={cls || 'w-5 h-5 text-blue-600 dark:text-blue-400'} />,
      category: 'Enterprise RPA',
      avgLatency: '28ms',
      authMethod: 'Azure AD OAuth 2.0',
      descriptionKey: 'powerAutomateDesc',
    },
  ];

  const getConnectorMetrics = (connectorId: string) => {
    const platformKey = connectorId === 'power-automate' ? 'power_automate' : connectorId.toLowerCase();
    if (stats?.byPlatform && stats.byPlatform[platformKey]) {
      return stats.byPlatform[platformKey];
    }

    const normalizedId = connectorId.toLowerCase();
    const matching = flows.filter((f) => {
      const flowPlatform = f.platformId.toLowerCase();
      if (normalizedId === 'power-automate') {
        return flowPlatform === 'power_automate' || flowPlatform === 'power-automate';
      }
      return flowPlatform === normalizedId;
    });

    const total = matching.length;
    const blocked = matching.filter((f) => f.status === 'BLOCKED').length;
    return { total, blocked };
  };

  const handleTestWebhook = async (connectorId: string) => {
    setTestingId(connectorId);
    setTestNotice(null);

    const platformPayloadId = connectorId === 'power-automate' ? 'power_automate' : connectorId;
    const startTime = performance.now();

    try {
      const response = await fetch('http://localhost:3000/flows/webhook/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformId: platformPayloadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const elapsed = Math.round(performance.now() - startTime);

      setTestNotice({
        type: 'success',
        message: `${t('integrations.testSuccess')} (${elapsed}ms)`,
      });
    } catch {
      setTestNotice({
        type: 'error',
        message: t('integrations.testError'),
      });
    } finally {
      setTestingId(null);
      setTimeout(() => {
        setTestNotice(null);
      }, 5000);
    }
  };

  const handleSimulateFlow = async () => {
    setTestingId('simulate');
    setTestNotice(null);

    const platformPayloadId = selectedPlatform === 'power-automate' ? 'power_automate' : selectedPlatform;
    const finalFlowName = simulatedFlowName.trim() || `Sincronización ${selectedPlatform.toUpperCase()} (${tDepartment(selectedDept)})`;

    try {
      const response = await fetch('http://localhost:3000/flows/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformId: platformPayloadId,
          departmentId: selectedDept,
          metadata: {
            flowName: finalFlowName,
            author: user?.email || 'user@governance.com',
            trigger: 'manual.simulation',
            action: 'governance.audit_check',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setTestNotice({
        type: 'success',
        message: t('integrations.userSimulateSuccess'),
      });
      setSimulatedFlowName('');
    } catch {
      setTestNotice({
        type: 'error',
        message: t('integrations.userSimulateError'),
      });
    } finally {
      setTestingId(null);
      setTimeout(() => {
        setTestNotice(null);
      }, 6000);
    }
  };

  const targetPlatformId = selectedPlatform === 'power-automate' ? 'power_automate' : selectedPlatform;
  const samplePayload = `curl -X POST http://localhost:3000/flows/webhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "platformId": "${targetPlatformId}",
    "departmentId": "${selectedDept}",
    "metadata": {
      "flowName": "Sync ${selectedDept.toUpperCase()} Automation",
      "author": "${user?.email || 'empleado@empresa.com'}",
      "trigger": "webhook_event"
    }
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(samplePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header con Rol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            {isAdmin ? t('integrations.title') : t('integrations.userCatalogTitle')}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {isAdmin ? t('integrations.subtitle') : t('integrations.userCatalogSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('integrations.connectorsOnline')}</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300">
            {isAdmin ? (
              <span className="text-orange-600 dark:text-orange-400">Admin Mode</span>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 capitalize">{tDepartment(selectedDept)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de feedback de Test Webhook */}
      {testNotice && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
          testNotice.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300'
        }`}>
          {testNotice.type === 'success' ? (
            <IconCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
          )}
          <span>{testNotice.message}</span>
        </div>
      )}

      {/* Guía visual y contexto para usuario no-admin */}
      {!isAdmin && (
        <div className="p-5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-blue-950 dark:text-blue-300 uppercase tracking-wider">
              {t('integrations.userOverviewTitle')}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize">
              {tDepartment(selectedDept)}
            </span>
          </div>
          <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
            {t('integrations.userOverviewDesc')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs text-blue-900/90 dark:text-blue-200/90">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
              <span>{t('integrations.userStep1')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
              <span>{t('integrations.userStep2')}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
              <span>{t('integrations.userStep3')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Telemetría y Análisis Interactivo de Conectores (Exclusivo Administrador) */}
      {isAdmin && (
        <ConnectorTelemetryChart
          flows={flows}
          stats={stats || { total: 0, blocked: 0, risky: 0, approved: 0, pending: 0, byPlatform: {} }}
          onFilterConnector={(platformId) => setSelectedPlatform(platformId)}
        />
      )}

      {/* Grid de Conectores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((c) => {
          const { total, blocked } = getConnectorMetrics(c.id);
          const hasIssues = blocked > 0;
          const isSelected = selectedPlatform === c.id;

          return (
            <div
              key={c.id}
              onClick={() => setSelectedPlatform(c.id)}
              className={`p-5 bg-white dark:bg-stone-800 rounded-xl border shadow-sm transition-all cursor-pointer select-none active:scale-[0.99] duration-150 ${
                isSelected 
                  ? 'border-orange-500 ring-2 ring-orange-500/20' 
                  : 'border-stone-200 dark:border-stone-700 hover:border-orange-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-stone-100 dark:bg-neutral-900 rounded-xl text-stone-700 dark:text-stone-300">
                    {c.icon('w-5 h-5')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-50">{c.name}</h3>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">{c.category}</span>
                  </div>
                </div>

                {isAdmin && hasIssues ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 rounded-full select-none whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {t('integrations.incidentsDetected', { count: blocked })}
                  </span>
                ) : !isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full select-none whitespace-nowrap">
                    <IconCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {t('integrations.userBadgeCertified')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full select-none whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {t('common.active')}
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                {t(`integrations.${c.descriptionKey}` as any)}
              </p>

              {/* Recomendación amigable para usuario no-admin */}
              {!isAdmin && (
                <div className="mt-3 p-2.5 rounded-lg bg-stone-50 dark:bg-neutral-900/60 border border-stone-100 dark:border-stone-700/60 text-xs">
                  <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                    {t('integrations.userRecommendedFor')}
                  </span>
                  <span className="text-stone-800 dark:text-stone-200 text-xs mt-0.5 block">
                    {c.id === 'zapier' && t('integrations.userZapierBestFor')}
                    {c.id === 'make' && t('integrations.userMakeBestFor')}
                    {c.id === 'n8n' && t('integrations.usern8nBestFor')}
                    {c.id === 'power-automate' && t('integrations.userPowerAutomateBestFor')}
                  </span>
                </div>
              )}

              {/* Pie de métricas: técnico para Admin, simplificado para Usuario */}
              {!isAdmin ? (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-xs select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-stone-600 dark:text-stone-400 font-medium">
                      {t('integrations.userActiveAutomations', { count: total })}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500">
                    {isSelected ? 'Conector Activo' : 'Seleccionar'}
                  </span>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700/60 grid grid-cols-3 gap-2 text-center text-xs select-none">
                  <div className="bg-stone-50 dark:bg-neutral-900/50 p-2 rounded-lg">
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{t('integrations.eventsProcessed')}</div>
                    <div className="font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">{total}</div>
                  </div>
                  <div className="bg-stone-50 dark:bg-neutral-900/50 p-2 rounded-lg">
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{t('integrations.avgLatency')}</div>
                    <div className="font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">{c.avgLatency}</div>
                  </div>
                  <div className="bg-stone-50 dark:bg-neutral-900/50 p-2 rounded-lg">
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{t('integrations.security')}</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 text-[11px]">HMAC / SHA</div>
                  </div>
                </div>
              )}

              {/* Herramienta de prueba exclusiva de Admin */}
              {isAdmin && (
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700/60 flex justify-end">
                  <button
                    type="button"
                    disabled={testingId === c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestWebhook(c.id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 dark:bg-neutral-900 border border-orange-200 dark:border-stone-700 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    {testingId === c.id ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t('integrations.testing')}</span>
                      </>
                    ) : (
                      <>
                        <IconPlay className="w-3.5 h-3.5" />
                        <span>{t('integrations.testConnection')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sección Inferior: Simulador Amigable para Usuario vs Generador cURL para Admin */}
      {!isAdmin ? (
        <div className="p-5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <IconZap className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                  {t('integrations.userSimulateTitle')}
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {t('integrations.userSimulateSubtitle')}
              </p>
            </div>
            <div className="px-2.5 py-1 bg-stone-100 dark:bg-stone-700 rounded-lg text-[11px] font-semibold text-stone-700 dark:text-stone-300 capitalize">
              {tDepartment(selectedDept)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
            <div className="flex-1 space-y-1">
              <label htmlFor="simulateFlowName" className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {t('integrations.userSimulateFlowName')}
              </label>
              <input
                id="simulateFlowName"
                type="text"
                value={simulatedFlowName}
                onChange={(e) => setSimulatedFlowName(e.target.value)}
                placeholder={t('integrations.userSimulatePlaceholder')}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              />
            </div>
            <button
              type="button"
              disabled={testingId === 'simulate'}
              onClick={handleSimulateFlow}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 whitespace-nowrap"
            >
              {testingId === 'simulate' ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('integrations.userSimulateSending')}</span>
                </>
              ) : (
                <>
                  <IconPlay className="w-3.5 h-3.5" />
                  <span>{t('integrations.userSimulateBtn')}</span>
                </>
              )}
            </button>
          </div>

          {/* Toggle de detalles técnicos para soporte o usuarios avanzados */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showTechnicalDetails ? t('integrations.userHideTechnicalDetails') : t('integrations.userShowTechnicalDetails')}</span>
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 space-y-3 animate-fadeIn">
                <pre className="p-3.5 bg-neutral-950 text-stone-200 text-xs font-mono rounded-lg overflow-x-auto border border-stone-800 leading-relaxed max-w-full">
                  {samplePayload}
                </pre>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer select-none active:scale-[0.98]"
                  >
                    {copied ? (
                      <>
                        <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t('integrations.copied')}</span>
                      </>
                    ) : (
                      <>
                        <IconCopy className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('integrations.copyCurl')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Especificación de Webhook y Generador cURL para Administradores */
        <div className="p-5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <IconZap className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                  {t('integrations.webhookTitle')}
                </h3>
              </div>
              <p 
                className="text-xs text-stone-500 dark:text-stone-400 mt-0.5" 
                dangerouslySetInnerHTML={{ __html: t('integrations.webhookSubtitle') }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Selector de Departamento */}
              <div className="flex items-center gap-2">
                <label htmlFor="deptSelect" className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
                  {t('integrations.departmentSelect')}
                </label>
                <select
                  id="deptSelect"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="pl-2.5 pr-8 py-1.5 bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors capitalize cursor-pointer"
                >
                  {CANONICAL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {tDepartment(dept)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{t('integrations.copied')}</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('integrations.copyCurl')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <pre className="p-3.5 bg-neutral-950 text-stone-200 text-xs font-mono rounded-lg overflow-x-auto border border-stone-800 leading-relaxed max-w-full">
            {samplePayload}
          </pre>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{t('integrations.bullet1')}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{t('integrations.bullet2')}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{t('integrations.bullet3')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
