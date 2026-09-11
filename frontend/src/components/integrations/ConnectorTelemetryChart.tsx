import { useState, useMemo, useRef } from 'react';
import { type Flow } from '../FlowTable';
import { useTranslation } from '../../i18n/useTranslation';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { 
  IconChartBar, 
  IconActivity, 
  IconBlocks,
  IconClose 
} from '../common/Icons';

interface ConnectorTelemetryChartProps {
  flows: Flow[];
  stats: {
    total: number;
    blocked: number;
    risky: number;
    approved: number;
    pending: number;
    byPlatform: Record<string, { total: number; blocked: number }>;
  };
  onFilterConnector?: (platformId: string) => void;
}

interface PlatformMetric {
  id: string;
  key: string;
  name: string;
  category: string;
  total: number;
  blocked: number;
  safe: number;
  complianceRate: number;
  incidentRate: number;
  trafficShare: number;
  departments: Record<string, number>;
}

interface TooltipData {
  platform: PlatformMetric;
  hoveredSeries: 'traffic' | 'incident' | 'general';
  x: number;
  y: number;
}

export const ConnectorTelemetryChart = ({
  flows,
  stats,
  onFilterConnector,
}: ConnectorTelemetryChartProps) => {
  const { t, tDepartment } = useTranslation();
  const [viewMode, setViewMode] = useState<'dual' | 'traffic' | 'security'>('dual');
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Definición y agregación reactiva de conectores
  const platforms: PlatformMetric[] = useMemo(() => {
    const definitions = [
      { id: 'power-automate', key: 'power_automate', name: 'Power Automate', category: 'Enterprise RPA' },
      { id: 'make', key: 'make', name: 'Make', category: 'Complex Scenarios' },
      { id: 'zapier', key: 'zapier', name: 'Zapier', category: 'SaaS Connectors' },
      { id: 'n8n', key: 'n8n', name: 'n8n', category: 'Self-Hosted Workflow' },
    ];

    const rawList = definitions.map((def) => {
      let total = stats?.byPlatform?.[def.key]?.total ?? 0;
      let blocked = stats?.byPlatform?.[def.key]?.blocked ?? 0;

      const matchingFlows = flows.filter((f) => {
        const p = f.platformId.toLowerCase();
        if (def.id === 'power-automate') {
          return p === 'power_automate' || p === 'power-automate';
        }
        return p === def.id;
      });

      if (total === 0 && matchingFlows.length > 0) {
        total = matchingFlows.length;
        blocked = matchingFlows.filter((f) => f.status === 'BLOCKED').length;
      }

      const departments: Record<string, number> = {};
      for (const f of matchingFlows) {
        const d = f.departmentId || 'general';
        departments[d] = (departments[d] || 0) + 1;
      }

      const safe = Math.max(total - blocked, 0);
      const complianceRate = total > 0 ? Math.round((safe / total) * 1000) / 10 : 100;
      const incidentRate = total > 0 ? Math.round((blocked / total) * 1000) / 10 : 0;

      return {
        id: def.id,
        key: def.key,
        name: def.name,
        category: def.category,
        total,
        blocked,
        safe,
        complianceRate,
        incidentRate,
        trafficShare: 0,
        departments,
      };
    });

    const grandTotal = rawList.reduce((acc, p) => acc + p.total, 0);

    return rawList.map((p) => ({
      ...p,
      trafficShare: grandTotal > 0 ? Math.round((p.total / grandTotal) * 1000) / 10 : 0,
    }));
  }, [flows, stats]);

  // Totales globales agregados
  const aggregated = useMemo(() => {
    const total = platforms.reduce((acc, p) => acc + p.total, 0);
    const blocked = platforms.reduce((acc, p) => acc + p.blocked, 0);
    const safe = Math.max(total - blocked, 0);
    const score = total > 0 ? Math.round((safe / total) * 1000) / 10 : 100;
    return { total, blocked, safe, score };
  }, [platforms]);

  const activeInspect = useMemo(() => {
    if (!selectedConnectorId) return null;
    return platforms.find((p) => p.id === selectedConnectorId) || null;
  }, [selectedConnectorId, platforms]);

  // Contadores animados fluidos
  const animatedTotal = useAnimatedCounter(activeInspect ? activeInspect.total : aggregated.total);
  const animatedBlocked = useAnimatedCounter(activeInspect ? activeInspect.blocked : aggregated.blocked);
  const animatedSafe = useAnimatedCounter(activeInspect ? activeInspect.safe : aggregated.safe);

  // Dimensiones del canvas SVG
  const svgWidth = 560;
  const svgHeight = 220;
  const chartTop = 26;
  const chartBottom = 175;
  const availableHeight = chartBottom - chartTop;
  const chartLeft = 40;
  const chartRight = svgWidth - 20;

  // Escala máxima del eje Y
  const maxVolume = useMemo(() => {
    const highest = Math.max(...platforms.map((p) => Math.max(p.total, p.blocked)), 1);
    // Redondear hacia arriba para múltiplos limpios (ej: 4 -> 4, 7 -> 8)
    return Math.max(highest, 4);
  }, [platforms]);

  // Posicionamiento de columnas
  const groupWidth = (chartRight - chartLeft) / platforms.length;
  const dualBarWidth = 26;
  const dualBarGap = 8;
  const singleBarWidth = 44;

  const handleMouseMove = (
    e: React.MouseEvent,
    platform: PlatformMetric,
    hoveredSeries: 'traffic' | 'incident' | 'general'
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ platform, hoveredSeries, x, y });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden transition-all"
    >
      {/* Encabezado con alternador de modo dinámico */}
      <div className="p-5 border-b border-stone-200 dark:border-stone-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <IconChartBar className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
              {t('integrations.telemetryTitle')}
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {t('integrations.telemetrySubtitle')}
          </p>
        </div>

        {/* Pestañas de modo dinámico (Dual vs Tráfico vs Seguridad) */}
        <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-semibold self-start md:self-auto select-none">
          <button
            type="button"
            onClick={() => setViewMode('dual')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <span className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-xs bg-blue-500"></span>
              <span className="w-2 h-2 rounded-xs bg-red-500"></span>
            </span>
            <span>{t('integrations.viewDual')}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('traffic')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'traffic'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <IconActivity className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('integrations.viewTraffic')}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('security')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'security'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <IconBlocks className="w-3.5 h-3.5 text-red-500" />
            <span>{t('integrations.viewSecurity')}</span>
          </button>
        </div>
      </div>

      {/* Cuerpo: Gráfico SVG dinámico + Tarjeta de Inspección */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gráfico SVG de barras duales lado a lado */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full overflow-x-auto pb-1">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-[220px] select-none font-sans"
            >
              <defs>
                {/* Gradiente Tráfico: Azul institucional a azul noche */}
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>

                {/* Gradiente Incidentes: Rojo fuego de advertencia */}
                <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>

                {/* Patrón rayado de advertencia de seguridad para incidentes */}
                <pattern id="incidentStripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="2" />
                </pattern>
              </defs>

              {/* Eje Y y Líneas guía de fondo */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartBottom - ratio * availableHeight;
                const valueLabel = Math.round(ratio * maxVolume);
                return (
                  <g key={ratio}>
                    <line
                      x1={chartLeft}
                      y1={y}
                      x2={chartRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-stone-200 dark:text-stone-700/60"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={chartLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-stone-400 dark:fill-stone-500 tabular-nums"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Línea base del eje X */}
              <line
                x1={chartLeft}
                y1={chartBottom}
                x2={chartRight}
                y2={chartBottom}
                stroke="currentColor"
                className="text-stone-300 dark:text-stone-700"
                strokeWidth="1.5"
              />

              {/* Renderizado de columnas agrupadas por plataforma */}
              {platforms.map((platform, idx) => {
                const groupCenterX = chartLeft + idx * groupWidth + groupWidth / 2;
                const isSelected = selectedConnectorId === platform.id;

                // Cálculo de alturas
                const trafficRatio = platform.total / maxVolume;
                const trafficHeight = Math.max(trafficRatio * availableHeight, platform.total > 0 ? 12 : 4);
                const trafficY = chartBottom - trafficHeight;

                const incidentRatio = platform.blocked / maxVolume;
                const incidentHeight = Math.max(incidentRatio * availableHeight, platform.blocked > 0 ? 12 : 4);
                const incidentY = chartBottom - incidentHeight;

                // Coordenadas X según el modo de visualización
                let trafficX = groupCenterX - dualBarWidth - dualBarGap / 2;
                let incidentX = groupCenterX + dualBarGap / 2;
                let trafficW = dualBarWidth;
                let incidentW = dualBarWidth;

                if (viewMode === 'traffic') {
                  trafficX = groupCenterX - singleBarWidth / 2;
                  trafficW = singleBarWidth;
                } else if (viewMode === 'security') {
                  incidentX = groupCenterX - singleBarWidth / 2;
                  incidentW = singleBarWidth;
                }

                return (
                  <g
                    key={platform.id}
                    className="cursor-pointer transition-all duration-300"
                    opacity={selectedConnectorId && !isSelected ? 0.4 : 1}
                    onClick={() => setSelectedConnectorId(isSelected ? null : platform.id)}
                  >
                    {/* Resaltado del grupo al seleccionarlo */}
                    {isSelected && (
                      <rect
                        x={groupCenterX - groupWidth / 2 + 6}
                        y={chartTop - 12}
                        width={groupWidth - 12}
                        height={chartBottom - chartTop + 45}
                        rx="10"
                        className="fill-orange-500/5 stroke-orange-500/30"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* BARRA 1: VOLUMEN DE TRÁFICO (Visible en 'dual' y 'traffic') */}
                    {(viewMode === 'dual' || viewMode === 'traffic') && (
                      <g
                        onMouseMove={(e) => handleMouseMove(e, platform, 'traffic')}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* Sombra suave inferior */}
                        <rect
                          x={trafficX}
                          y={trafficY}
                          width={trafficW}
                          height={trafficHeight}
                          rx="5"
                          fill="url(#trafficGradient)"
                          className="transition-all duration-300 hover:brightness-110"
                        />
                        {/* Borde sutil superior de brillo */}
                        <line
                          x1={trafficX + 2}
                          y1={trafficY}
                          x2={trafficX + trafficW - 2}
                          y2={trafficY}
                          stroke="rgba(255, 255, 255, 0.4)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        {/* Valor numérico en la cima */}
                        <text
                          x={trafficX + trafficW / 2}
                          y={trafficY - 6}
                          textAnchor="middle"
                          className="text-[11px] font-bold fill-blue-700 dark:fill-blue-300 font-mono tabular-nums"
                        >
                          {platform.total}
                        </text>
                      </g>
                    )}

                    {/* BARRA 2: INCIDENTES DE SEGURIDAD (Visible en 'dual' y 'security') */}
                    {(viewMode === 'dual' || viewMode === 'security') && (
                      <g
                        onMouseMove={(e) => handleMouseMove(e, platform, 'incident')}
                        onMouseLeave={handleMouseLeave}
                      >
                        {platform.blocked > 0 ? (
                          <>
                            {/* Barra de incidente bloqueado con relleno rojo */}
                            <rect
                              x={incidentX}
                              y={incidentY}
                              width={incidentW}
                              height={incidentHeight}
                              rx="5"
                              fill="url(#incidentGradient)"
                              className="transition-all duration-300 hover:brightness-110"
                            />
                            {/* Capa de advertencia rayada */}
                            <rect
                              x={incidentX}
                              y={incidentY}
                              width={incidentW}
                              height={incidentHeight}
                              rx="5"
                              fill="url(#incidentStripes)"
                              className="pointer-events-none"
                            />
                            {/* Valor numérico en la cima */}
                            <text
                              x={incidentX + incidentW / 2}
                              y={incidentY - 6}
                              textAnchor="middle"
                              className="text-[11px] font-bold fill-red-600 dark:fill-red-400 font-mono tabular-nums"
                            >
                              {platform.blocked}
                            </text>
                          </>
                        ) : (
                          // Estado 0 Incidentes: Base plana verde esmeralda con indicador limpio
                          <>
                            <rect
                              x={incidentX}
                              y={chartBottom - 6}
                              width={incidentW}
                              height="6"
                              rx="2"
                              className="fill-emerald-500/30 stroke-emerald-500/50"
                              strokeWidth="1"
                            />
                            <text
                              x={incidentX + incidentW / 2}
                              y={chartBottom - 10}
                              textAnchor="middle"
                              className="text-[10px] font-bold fill-emerald-600 dark:fill-emerald-400 font-mono"
                            >
                              0
                            </text>
                          </>
                        )}
                      </g>
                    )}

                    {/* Etiqueta del Conector en el eje X */}
                    <text
                      x={groupCenterX}
                      y={chartBottom + 18}
                      textAnchor="middle"
                      className={`text-[11px] transition-colors cursor-pointer ${
                        isSelected
                          ? 'fill-orange-600 dark:fill-orange-400 font-bold'
                          : 'fill-stone-700 dark:fill-stone-300 font-semibold hover:fill-orange-500'
                      }`}
                    >
                      {platform.name.length > 10 ? platform.name.substring(0, 8) + '..' : platform.name}
                    </text>

                    {/* Subtítulo de Tasa de Conformidad */}
                    <text
                      x={groupCenterX}
                      y={chartBottom + 31}
                      textAnchor="middle"
                      className="text-[10px] fill-stone-400 dark:fill-stone-500 font-mono tabular-nums"
                    >
                      {platform.complianceRate}% conf.
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Leyenda visual interactiva y descriptiva */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-xs text-stone-600 dark:text-stone-400 select-none border-t border-stone-100 dark:border-stone-700/60 pt-3 w-full">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-gradient-to-b from-blue-500 to-indigo-600 shadow-2xs"></span>
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {t('integrations.trafficBarLabel')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-gradient-to-b from-red-500 to-red-700 border border-red-400/40 relative overflow-hidden flex items-center justify-center">
                <span className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:4px_4px]"></span>
              </span>
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {t('integrations.incidentBarLabel')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1.5 rounded-xs bg-emerald-500/40 border border-emerald-500"></span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                {t('integrations.zeroIncidents')}
              </span>
            </div>
            {selectedConnectorId && (
              <button
                type="button"
                onClick={() => setSelectedConnectorId(null)}
                className="text-orange-600 dark:text-orange-400 hover:underline font-semibold ml-2 flex items-center gap-1 cursor-pointer"
              >
                <IconClose className="w-3.5 h-3.5" />
                <span>{t('integrations.allConnectors')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Panel de Inspección Técnica Lateral */}
        <div className="lg:col-span-5 bg-stone-50 dark:bg-neutral-900 rounded-xl p-4 border border-stone-200 dark:border-stone-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {activeInspect ? t('integrations.inspectingConnector') : t('integrations.allConnectors')}
              </span>
              <h4 className="text-base font-bold text-stone-900 dark:text-stone-50">
                {activeInspect ? activeInspect.name : 'Telemetría Global'}
              </h4>
            </div>
            {activeInspect && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                {activeInspect.category}
              </span>
            )}
          </div>

          {/* Cifras de inspección con microindicadores diferenciados */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Volumen Tráfico */}
            <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-blue-200/60 dark:border-blue-500/20 shadow-2xs">
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 block">
                {t('integrations.trafficBarLabel')}
              </span>
              <span className="text-lg font-bold text-stone-900 dark:text-stone-50 tabular-nums font-mono">
                {animatedTotal}
              </span>
            </div>
            {/* Eventos Seguros */}
            <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xs">
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 block">
                {t('integrations.safeEventsMetric')}
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                {animatedSafe}
              </span>
            </div>
            {/* Incidentes Bloqueados */}
            <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-red-200/60 dark:border-red-500/20 shadow-2xs">
              <span className="text-[10px] font-medium text-red-600 dark:text-red-400 block">
                {t('integrations.incidentBarLabel')}
              </span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums font-mono">
                {animatedBlocked}
              </span>
            </div>
          </div>

          {/* Barra de Efectividad y Desglose Proporcional */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-stone-600 dark:text-stone-400 font-medium">
                {t('integrations.complianceScore')}
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums font-mono">
                {activeInspect ? `${activeInspect.complianceRate}%` : `${aggregated.score}%`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${activeInspect ? activeInspect.complianceRate : aggregated.score}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${100 - (activeInspect ? activeInspect.complianceRate : aggregated.score)}%` }}
              />
            </div>
          </div>

          {/* Distribución por Departamento */}
          <div className="space-y-2 pt-1 border-t border-stone-200/80 dark:border-stone-700/80">
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
              {t('integrations.topDepartments')}
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {activeInspect && Object.keys(activeInspect.departments).length > 0 ? (
                Object.entries(activeInspect.departments).map(([dept, count]) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300 capitalize"
                  >
                    <span>{tDepartment(dept)}</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400 font-mono text-[10px]">
                      {count}
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-400 italic">
                  {t('integrations.noEventsYet')}
                </span>
              )}
            </div>
          </div>

          {/* Botón de vinculación operativa directa */}
          {activeInspect && onFilterConnector && (
            <button
              type="button"
              onClick={() => onFilterConnector(activeInspect.id)}
              className="w-full mt-2 py-2 px-3 bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700/80 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 select-none active:scale-[0.98] cursor-pointer"
            >
              <span>Configurar Webhook de {activeInspect.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tooltip Dinámico Flotante con seguimiento del cursor */}
      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2.5 transition-all duration-75"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 border border-stone-700 shadow-xl backdrop-blur-md rounded-lg p-3 min-w-[190px] text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5">
              <span className="font-bold text-white text-[12px]">{tooltip.platform.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                {tooltip.platform.category}
              </span>
            </div>

            {tooltip.hoveredSeries === 'traffic' ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-blue-400 font-semibold">
                  <span>{t('integrations.trafficBarLabel')}:</span>
                  <span className="font-mono font-bold text-white">{tooltip.platform.total}</span>
                </div>
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>{t('integrations.trafficShare')}:</span>
                  <span className="font-mono">{tooltip.platform.trafficShare}%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-red-400 font-semibold">
                  <span>{t('integrations.incidentBarLabel')}:</span>
                  <span className="font-mono font-bold text-white">{tooltip.platform.blocked}</span>
                </div>
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>{t('integrations.incidentRate')}:</span>
                  <span className="font-mono">{tooltip.platform.incidentRate}%</span>
                </div>
                <div className="text-[10px] pt-0.5">
                  {tooltip.platform.blocked === 0 ? (
                    <span className="text-emerald-400 font-medium">Estado Seguro: Sin incidentes</span>
                  ) : (
                    <span className="text-amber-400 font-medium">Requiere atención de seguridad</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
