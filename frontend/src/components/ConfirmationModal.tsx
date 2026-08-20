import { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  expectedText: string;
  actionType: 'danger' | 'warning';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  expectedText,
  actionType
}: ConfirmationModalProps) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  // Limpiar los inputs cuando se abre/cierra el modal
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`p-4 border-b ${isDanger ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
          <h2 className={`text-lg font-bold ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">{description}</p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Motivo de la acción (Opcional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={2}
              placeholder="Ej: Expone datos sensibles..."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="block text-sm text-slate-700 mb-2">
              Para confirmar, escribe <strong>{expectedText}</strong> a continuación:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            disabled={!isMatch}
            onClick={() => onConfirm(reasonInput)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}
            `}
          >
            Confirmar Acción
          </button>
        </div>
      </div>
    </div>
  );
};