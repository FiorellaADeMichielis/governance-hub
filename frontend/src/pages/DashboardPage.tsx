import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { FlowTable, type Flow } from '../components/FlowTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Sidebar, type NavSection } from '../components/layouts/Sidebar';
import { MetricsCards } from '../components/layouts/MetricsCards';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { type UserSession } from '../types/auth.types';
import { GovernancePage } from './GovernancePage';
import { IntegrationsView } from '../components/integrations/IntegrationsView';
import { AuditLogsView } from '../components/audit/AuditLogsView';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../i18n/useTranslation';

interface DashboardPageProps {
  user: UserSession;
  onLogout: () => void;
}

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const { isDark, toggleTheme } = useTheme();
  const { t, tDepartment } = useTranslation();
  const isAdmin = user.role === 'ADMIN';
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalConfig, setModalConfig] = useState<{ 
    isOpen: boolean; 
    flowId: string; 
    action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW' | null; 
    platformId: string; 
  }>({ isOpen: false, flowId: '', action: null, platformId: '' });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<{
    total: number;
    blocked: number;
    risky: number;
    approved: number;
    pending: number;
    byPlatform: Record<string, { total: number; blocked: number }>;
  }>({
    total: 0,
    blocked: 0,
    risky: 0,
    approved: 0,
    pending: 0,
    byPlatform: {},
  });

  useEffect(() => {
    if (!isAdmin && currentSection !== 'dashboard' && currentSection !== 'integrations') {
      setCurrentSection('dashboard');
    }
  }, [isAdmin, currentSection]);

  const handleNavigate = (section: NavSection) => {
    if (!isAdmin && section !== 'dashboard' && section !== 'integrations') return;
    setCurrentSection(section);
  };

  const totalFlows = stats.total > 0 ? stats.total : flows.length;
  const blockedFlows = stats.total > 0 ? stats.blocked : flows.filter(f => f.status === 'BLOCKED').length;
  const riskyFlows = stats.total > 0 ? stats.risky : flows.filter(f => f.status === 'RISKY' || f.status === 'UNDER_REVIEW').length;
  const approvedFlows = stats.total > 0 ? stats.approved : flows.filter(f => f.status === 'APPROVED').length;
  const pendingFlows = stats.total > 0 ? stats.pending : flows.filter(f => f.status === 'PENDING').length;

  useEffect(() => {
    const socket = io('http://localhost:3000'); 

    socket.on('flow_updated', () => {
      setRefreshTrigger(prev => prev + 1); 
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const limit = currentSection === 'audit-logs' ? '100' : '10';
      const query = new URLSearchParams({ page: page.toString(), limit });
      if (statusFilter && currentSection === 'dashboard') query.append('status', statusFilter);

      try {
        const response = await fetch(`http://localhost:3000/flows?${query.toString()}`, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        if (response.ok) {
          const json = await response.json();
          setFlows(json.data);
          setTotalPages(json.meta.lastPage);
          if (json.meta.stats) {
            setStats(json.meta.stats);
          }
        } else if (response.status === 401) {
          onLogout();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlows();
  }, [page, statusFilter, onLogout, refreshTrigger, currentSection]);

  const handleReviewRequest = (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW') => {
    if (user.role !== 'ADMIN') {
      alert(t('dashboard.restrictedActionNotice'));
      return;
    }

    if (action === 'APPROVE') {
      executeAction(id, action, '');
    } else {
      const flow = flows.find(f => f.id === id);
      if (flow) setModalConfig({ isOpen: true, flowId: id, action, platformId: flow.platformId });
    }
  };

  const executeAction = async (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW', reason: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/flows/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action, reason }),
      });
      if (response.ok) {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'BLOCK' ? 'BLOCKED' : 'UNDER_REVIEW';
        setFlows(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorData = await response.json();
        alert(`Operación rechazada: ${errorData.message}`);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout 
      sidebar={
        <Sidebar 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          onLogout={onLogout} 
          user={user} 
          currentSection={currentSection}
          onNavigate={handleNavigate}
        />
      }
    >
      {isAdmin && currentSection === 'governance' && (
        <GovernancePage user={user} />
      )}

      {currentSection === 'integrations' && (
        <IntegrationsView flows={flows} stats={stats} user={user} />
      )}

      {isAdmin && currentSection === 'audit-logs' && (
        <AuditLogsView flows={flows} isLoading={loading} />
      )}

      {currentSection === 'dashboard' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">{t('dashboard.overviewTitle')}</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {t('dashboard.overviewSubtitle')}
              </p>
            </div>

            {/* Badge indicador de sesión activa */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs select-none">
              <span className="text-stone-500 dark:text-stone-400">{t('dashboard.activeRole')}</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] select-none whitespace-nowrap ${
                user.role === 'ADMIN'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
              }`}>
                {user.role} ({tDepartment(user.department)})
              </span>
            </div>
          </div>
          
          <MetricsCards 
            total={totalFlows} 
            risky={riskyFlows} 
            blocked={blockedFlows}
            approved={approvedFlows}
            pending={pendingFlows}
            onSelectFilter={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
          />

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">{t('dashboard.activityTitle')}</h3>
            <select 
              className="pl-4 pr-10 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-50 text-sm rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.allStatuses')}</option>
              <option value="PENDING" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.pending')}</option>
              <option value="UNDER_REVIEW" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.underReview')}</option>
              <option value="APPROVED" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.approved')}</option>
              <option value="BLOCKED" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.blocked')}</option>
            </select>
          </div>
          
          <FlowTable 
            flows={flows} 
            isLoading={loading} 
            onReviewAction={handleReviewRequest} 
            currentPage={page}
            totalPages={totalPages}
            onNextPage={() => setPage(prev => Math.min(prev + 1, totalPages))}
            onPrevPage={() => setPage(prev => Math.max(prev - 1, 1))}
            userRole={user.role}
          />

          <ConfirmationModal
            isOpen={modalConfig.isOpen}
            onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            onConfirm={(reason) => executeAction(modalConfig.flowId, modalConfig.action!, reason)}
            title={modalConfig.action === 'BLOCK' ? t('dashboard.modalBlockTitle') : t('dashboard.modalReviewTitle')}
            description={modalConfig.action === 'BLOCK' 
              ? t('dashboard.modalBlockDesc', { platform: modalConfig.platformId.toUpperCase() }) 
              : t('dashboard.modalReviewDesc', { platform: modalConfig.platformId.toUpperCase() })}
            expectedText={`${modalConfig.platformId}-${t('dashboard.confirmKeyword')}`}
            actionType={modalConfig.action === 'BLOCK' ? 'danger' : 'warning'}
          />
        </>
      )}
    </DashboardLayout>
  );
};