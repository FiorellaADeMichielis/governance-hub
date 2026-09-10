import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  expectedText: string;
  actionType: 'danger' | 'warning';
}

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, description, expectedText, actionType }: ConfirmationModalProps) => {
  const { t } = useTranslation();
  const [confirmationInput, setConfirmationInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setReasonInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatch = confirmationInput === expectedText;
  const isDanger = actionType === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 dark:bg-neutral-950/80 backdrop-blur-xs transition-colors">
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 dark:border-stone-700 transition-colors">
        
        <div className={`p-4 border-b ${isDanger ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20'}`}>
          <h2 className={`text-lg font-bold ${isDanger ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
            {title}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-600 dark:text-stone-400">{description}</p>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              {t('dashboard.modalReasonLabel')}
            </label>
            <textarea
              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-50 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none placeholder-stone-400 dark:placeholder-stone-500 transition-colors"
              rows={2}
              placeholder={t('dashboard.modalReasonPlaceholder')}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
            />
          </div>

          <div className="bg-stone-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors">
            <label className="block text-sm text-stone-700 dark:text-stone-300 mb-2">
              {t('dashboard.modalConfirmType', { text: expectedText }).split(expectedText).map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <strong className="font-semibold text-stone-900 dark:text-stone-50">{expectedText}</strong>
                  )}
                </span>
              ))}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-50 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-colors"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-stone-50 dark:bg-neutral-900 border-t border-stone-200 dark:border-stone-700 flex justify-end gap-3 transition-colors">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            disabled={!isMatch}
            onClick={() => onConfirm(reasonInput)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs
              ${isDanger ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'}
            `}
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};