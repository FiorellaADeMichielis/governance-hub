import { useState } from 'react';
import type { CreateGovernanceRulePayload, RuleOperator } from '../../types/governance.types';
import { IconClose } from '../common/Icons';
import { useTranslation } from '../../i18n/useTranslation';

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGovernanceRulePayload) => Promise<void>;
  isLoading: boolean;
}

export const RuleFormModal = ({ isOpen, onClose, onSubmit, isLoading }: RuleFormModalProps) => {
  const { t } = useTranslation();
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
      setError(t('ruleForm.validationError'));
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
      setName('');
      setDescription('');
      setExpectedValue('');
      onClose();
    } catch (err: any) {
      setError(err.message || t('governance.toggleError'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-stone-800 w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
              {t('ruleForm.modalTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {t('ruleForm.modalSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-lg transition-colors"
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
              {t('ruleForm.nameLabel')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('ruleForm.namePlaceholder')}
              required
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t('ruleForm.descLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('ruleForm.descPlaceholder')}
              rows={2}
              required
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none transition-colors"
            />
          </div>

          {/* Condición: Campo objetivo y Operador */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('ruleForm.fieldLabel')}
              </label>
              <select
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              >
                <option value="metadata" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">metadata (Payload)</option>
                <option value="departmentId" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">departmentId</option>
                <option value="platformId" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">platformId</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('ruleForm.operatorLabel')}
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as RuleOperator)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              >
                <option value="CONTAINS" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">CONTAINS</option>
                <option value="EQUALS" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">EQUALS</option>
                <option value="NOT_EQUALS" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">NOT_EQUALS</option>
                <option value="IN_LIST" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">IN_LIST</option>
                <option value="REGEX" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">REGEX</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t('ruleForm.valueLabel')}
            </label>
            <input
              type="text"
              value={expectedValue}
              onChange={(e) => setExpectedValue(e.target.value)}
              placeholder={t('ruleForm.valuePlaceholder')}
              required
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono transition-colors"
            />
          </div>

          {/* Estado resultante, Nivel de riesgo y Prioridad */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('ruleForm.statusLabel')}
              </label>
              <select
                value={resultingStatus}
                onChange={(e) => setResultingStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              >
                <option value="RISKY" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.statusRisky')}</option>
                <option value="BLOCKED" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.statusBlocked')}</option>
                <option value="UNDER_REVIEW" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.statusUnderReview')}</option>
                <option value="APPROVED" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.statusApproved')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('ruleForm.riskLabel')}
              </label>
              <select
                value={resultingRiskLevel}
                onChange={(e) => setResultingRiskLevel(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              >
                <option value="CRITICAL" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">CRITICAL</option>
                <option value="HIGH" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">HIGH</option>
                <option value="MEDIUM" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">MEDIUM</option>
                <option value="LOW" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t('ruleForm.priorityLabel')}
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-xs"
            >
              {isLoading ? t('ruleForm.saving') : t('ruleForm.createRule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

