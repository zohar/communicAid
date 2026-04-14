import { useState } from 'react';
import { Delete, RotateCcw, X } from 'lucide-react';
import type { Language } from '../../types';
import { alphabets, alphabetGridColumns } from '../../data/alphabets';
import { languageConfigs } from '../../data/translations';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../hooks/useTranslation';

interface KeyboardScreenProps {
  onClose: () => void;
}

const MAX_LENGTH = 200;

export default function KeyboardScreen({ onClose }: KeyboardScreenProps) {
  const { language: appLanguage } = useLanguage();
  const { t } = useTranslation();

  const [message, setMessage] = useState<string>('');
  const [keyboardLanguage, setKeyboardLanguage] =
    useState<Language>(appLanguage);
  const [, setTakeoverOpen] = useState<boolean>(false);

  // keyboardLanguage and setTakeoverOpen are populated in WP04 (switcher,
  // Show takeover). Referencing them here keeps the noUnusedLocals linter
  // quiet without adding dead state later.
  void setKeyboardLanguage;

  const dir = languageConfigs[keyboardLanguage].dir;
  const letters = alphabets[keyboardLanguage];
  const columns = alphabetGridColumns[keyboardLanguage];

  const appendChar = (char: string) => {
    setMessage((prev) => (prev.length >= MAX_LENGTH ? prev : prev + char));
  };

  const handleBackspace = () => {
    setMessage((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setMessage('');
    setTakeoverOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('keyboard')}
      className="fixed inset-0 z-50 bg-slate-200 flex flex-col p-6 gap-4"
      dir={dir}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-3xl font-bold text-slate-800">{t('keyboard')}</h2>
        <button
          type="button"
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl p-4 min-w-[70px] min-h-[70px] flex items-center justify-center shadow-md transition-colors"
          aria-label={t('close')}
        >
          <X size={32} />
        </button>
      </div>

      <div
        data-testid="keyboard-message"
        aria-live="polite"
        aria-atomic="true"
        className="bg-white border-4 border-slate-400 rounded-2xl p-6 min-h-[6rem] text-5xl font-bold break-words text-slate-800"
        dir={dir}
        lang={keyboardLanguage}
      >
        {message || '\u00A0'}
      </div>

      <div
        className="grid gap-3 flex-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        dir={dir}
      >
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => appendChar(letter)}
            className="bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md text-5xl font-bold text-slate-800 min-w-[64px] min-h-[64px] flex items-center justify-center transition-colors"
            lang={keyboardLanguage}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-stretch" dir={dir}>
        <button
          type="button"
          onClick={() => appendChar(' ')}
          className="flex-1 bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md text-3xl font-bold text-slate-800 min-h-[80px] flex items-center justify-center transition-colors"
        >
          {t('space')}
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md text-slate-800 min-w-[120px] min-h-[80px] flex items-center justify-center transition-colors"
          aria-label={t('backspace')}
        >
          <Delete size={40} />
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-white hover:bg-slate-100 active:bg-slate-200 border-4 border-slate-400 rounded-2xl shadow-md text-slate-800 min-w-[120px] min-h-[80px] flex items-center justify-center transition-colors"
          aria-label={t('clear')}
        >
          <RotateCcw size={40} />
        </button>
      </div>
    </div>
  );
}
