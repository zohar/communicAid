import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ResetButtonProps {
  onReset: () => void;
}

export function ResetButton({ onReset }: ResetButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useTranslation();

  if (showConfirm) {
    return (
      <div className="bg-red-50 border-4 border-red-300 rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-red-900">{t('reset-confirm-title')}</h3>
        <p className="text-lg text-red-700">{t('reset-confirm-message')}</p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 rounded-xl p-4 text-lg font-bold min-h-[70px] transition-all"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => {
              onReset();
              setShowConfirm(false);
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl p-4 text-lg font-bold min-h-[70px] transition-all"
          >
            {t('reset-button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl p-4 flex items-center justify-center gap-3 min-h-[60px] transition-all"
    >
      <RotateCcw size={24} />
      <span className="text-lg font-semibold">{t('reset-to-defaults')}</span>
    </button>
  );
}
