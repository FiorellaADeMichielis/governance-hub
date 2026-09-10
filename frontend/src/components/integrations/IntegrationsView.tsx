import { useState } from 'react';
import { 
  IconZap, 
  IconIntegrations, 
  IconGovernance, 
  IconDashboard, 
  IconCheck, 
  IconCopy 
} from '../common/Icons';

interface IntegrationConnector {
  id: string;
  name: string;
  icon: (className?: string) => React.ReactNode;
  status: 'active' | 'warning' | 'pending';
  category: 'iPaaS' | 'Self-Hosted' | 'Enterprise RPA';
  eventsProcessed: number;
  avgLatency: string;
  authMethod: string;
  description: string;
}

export const IntegrationsView = () => {
  const [copied, setCopied] = useState(false);

  const connectors: IntegrationConnector[] = [
    {
      id: 'zapier',
      name: 'Zapier',
      icon: (cls) => <IconZap className={cls || 'w-5 h-5 text-orange-600 dark:text-orange-400'} />,
      status: 'active',
      category: 'iPaaS',
      eventsProcessed: 1420,
      avgLatency: '18ms',
      authMethod: 'Webhook Shared Secret (HMAC)',
      description: 'Captura disparadores (Triggers) y acciones de salida como Webhooks, Gmail, Slack y Google Sheets.',
    },
    {
      id: 'make',
      name: 'Make (Integromat)',
      icon: (cls) => <IconIntegrations className={cls || 'w-5 h-5 text-purple-600 dark:text-purple-400'} />,
      status: 'active',
      category: 'iPaaS',
      eventsProcessed: 980,
      avgLatency: '22ms',
      authMethod: 'Custom Header HMAC-SHA256',
      description: 'Monitorea escenarios con enrutadores de datos sensibles, Airtable, CRM y transferencias de archivos.',
    },
    {
      id: 'n8n',
      name: 'n8n',
      icon: (cls) => <IconGovernance className={cls || 'w-5 h-5 text-amber-600 dark:text-amber-400'} />,
      status: 'active',
      category: 'Self-Hosted',
      eventsProcessed: 650,
      avgLatency: '14ms',
      authMethod: 'Bearer Token + IP Whitelist',
      description: 'Intercepta workflows automáticos internos, nodos comunitarios y consultas a bases de datos SQL.',
    },
    {
      id: 'power-automate',
      name: 'Power Automate',
      icon: (cls) => <IconDashboard className={cls || 'w-5 h-5 text-blue-600 dark:text-blue-400'} />,
      status: 'active',
      category: 'Enterprise RPA',
      eventsProcessed: 410,
      avgLatency: '28ms',
      authMethod: 'Azure AD OAuth 2.0',
      description: 'Auditoría de flujos corporativos en la nube y conectores para SharePoint, Dataverse y MS Teams.',
    },
  ];

  const samplePayload = `curl -X POST http://localhost:3000/flows/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "platformId": "zapier",
    "departmentId": "finanzas",
    "nodes": ["webhook_trigger", "format_currency", "stripe_charge"],
    "configuration": {
      "secretKey": "sk_live_992182019",
      "targetUrl": "https://api.stripe.com/v1/charges"
    }
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(samplePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Conectores e Integraciones LCNC
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Plataformas conectadas que transmiten flujos y eventos al motor de auditoría asíncrono
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>4 Conectores en Línea</span>
        </div>
      </div>

      {/* Grid de Conectores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm transition-all hover:border-orange-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-100 dark:bg-stone-900 rounded-xl text-stone-700 dark:text-stone-300">
                  {c.icon('w-5 h-5')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-50">{c.name}</h3>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">{c.category}</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Activo
              </span>
            </div>

            <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
              {c.description}
            </p>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700/60 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-stone-50 dark:bg-stone-900/50 p-2 rounded-lg">
                <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Eventos</div>
                <div className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{c.eventsProcessed}</div>
              </div>
              <div className="bg-stone-50 dark:bg-stone-900/50 p-2 rounded-lg">
                <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Latencia</div>
                <div className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{c.avgLatency}</div>
              </div>
              <div className="bg-stone-50 dark:bg-stone-900/50 p-2 rounded-lg">
                <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Seguridad</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 text-[11px]">HMAC / SHA</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Specification & cURL tester */}
      <div className="p-5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <IconZap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                Protocolo de Ingesta Asíncrona de Webhooks
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Cualquier plataforma o script puede enviar automatizaciones para auditoría. El servidor responde inmediatamente (<span className="text-orange-600 dark:text-orange-400 font-mono font-bold">HTTP 202 Accepted</span>) y evalúa mediante RabbitMQ.
            </p>
          </div>

          <button
            type="button"
            onClick={copyToClipboard}
            className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <IconCopy className="w-3.5 h-3.5" />
                <span>Copiar cURL</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-3.5 bg-stone-900 text-stone-200 text-xs font-mono rounded-lg overflow-x-auto border border-stone-800 leading-relaxed">
          {samplePayload}
        </pre>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>SLA &lt; 100ms sin bloqueo</span>
          </div>
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Cola de mensajes RabbitMQ persistente</span>
          </div>
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Transmisión WebSocket en tiempo real</span>
          </div>
        </div>
      </div>
    </div>
  );
};

