import { useEffect, useRef, useState } from 'react';
import { Delete, Eye, Globe, RotateCcw, X } from 'lucide-react';
import type { Language } from '../../types';
import { alphabets, alphabetGridColumns } from '../../data/alphabets';
import {
  languageConfigs,
  supportedLanguages,
} from '../../data/translations';
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
  const [takeoverOpen, setTakeoverOpen] = useState<boolean>(false);
  const [switcherOpen, setSwitcherOpen] = useState<boolean>(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Move focus into the overlay when the component first mounts so keyboard
  // users and assistive tech start inside the dialog. Natural unmount by the
  // parent (conditional render) clears all local state, satisfying FR-013.
  useEffect(() => {
    overlayRef.current?.focus();
  }, []);

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

  const handleShow = () => {
    if (message.length === 0) return;
    // Defer opening the takeover by one animation frame so the same
    // touch/click that invoked Show cannot also dismiss the takeover that
    // appears under the user's finger.
    requestAnimationFrame(() => setTakeoverOpen(true));
  };

  const handleTakeoverDismiss = () => {
    setTakeoverOpen(false);
  };

  const handleSelectLanguage = (lang: Language) => {
    setKeyboardLanguage(lang);
    setSwitcherOpen(false);
  };

  const showDisabled = message.length === 0;
  const switcherAvailable = supportedLanguages.length > 1;

  return (
    <>
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('keyboard')}
        className="fixed inset-0 z-50 bg-slate-200 flex flex-col p-6 gap-4"
        dir={dir}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-3" dir={dir}>
          <h2 className="text-3xl font-bold text-slate-800">{t('keyboard')}</h2>

          <div className="flex items-center gap-3">
            {switcherAvailable && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSwitcherOpen((v) => !v)}
                  className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl px-5 py-4 min-h-[70px] flex items-center gap-2 shadow-md text-2xl font-bold transition-colors"
                  aria-label={t('switchLanguage')}
                  aria-haspopup="listbox"
                  aria-expanded={switcherOpen}
                >
                  <Globe size={28} />
                  <span>{languageConfigs[keyboardLanguage].name}</span>
                </button>

                {switcherOpen && (
                  <ul
                    role="listbox"
                    aria-label={t('switchLanguage')}
                    className="absolute top-full end-0 mt-2 bg-white border-4 border-slate-400 rounded-2xl shadow-xl z-[55] min-w-[220px] overflow-hidden"
                  >
                    {supportedLanguages.map((lang) => {
                      const isCurrent = lang === keyboardLanguage;
                      return (
                        <li key={lang}>
                          <button
                            type="button"
                            onClick={() => handleSelectLanguage(lang)}
                            className={`w-full text-start px-5 py-4 text-2xl font-bold min-h-[70px] text-slate-800 transition-colors ${
                              isCurrent
                                ? 'bg-slate-200'
                                : 'bg-white hover:bg-slate-100 active:bg-slate-200'
                            }`}
                            role="option"
                            aria-selected={isCurrent}
                            lang={lang}
                          >
                            {languageConfigs[lang].name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl p-4 min-w-[70px] min-h-[70px] flex items-center justify-center shadow-md transition-colors"
              aria-label={t('close')}
            >
              <X size={32} />
            </button>
          </div>
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
          <button
            type="button"
            onClick={handleShow}
            disabled={showDisabled}
            aria-disabled={showDisabled}
            className="bg-green-600 hover:bg-green-500 active:bg-green-700 border-4 border-green-800 text-white rounded-2xl shadow-md text-3xl font-bold min-w-[180px] min-h-[80px] flex items-center justify-center gap-3 transition-colors disabled:bg-slate-400 disabled:border-slate-500 disabled:text-slate-100 disabled:cursor-not-allowed"
            aria-label={t('show')}
          >
            <Eye size={36} />
            <span>{t('show')}</span>
          </button>
        </div>
      </div>

      {takeoverOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('show')}
          className="fixed inset-0 z-[60] bg-white flex items-center justify-center p-8 cursor-pointer"
          onClick={handleTakeoverDismiss}
        >
          <p
            className="font-bold text-center break-words text-slate-900 select-none"
            style={{
              fontSize: 'clamp(4rem, 12vw, 16rem)',
              lineHeight: 1.1,
            }}
            dir={dir}
            lang={keyboardLanguage}
          >
            {message}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTakeoverDismiss();
            }}
            className="fixed top-6 end-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl p-4 min-w-[70px] min-h-[70px] flex items-center justify-center shadow-lg transition-colors"
            aria-label={t('close')}
          >
            <X size={32} />
          </button>
        </div>
      )}
    </>
  );
}
