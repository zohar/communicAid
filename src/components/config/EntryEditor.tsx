import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface EntryEditorProps {
  entryId: string;
  currentText: string;
  currentIcon: string;
  onSave: (text: string, icon: string) => void;
  onCancel: () => void;
}

export function EntryEditor({ entryId, currentText, currentIcon, onSave, onCancel }: EntryEditorProps) {
  const [text, setText] = useState(currentText);
  const [icon] = useState(currentIcon);
  const { t, tEn } = useTranslation();

  const subtitle = tEn(entryId);
  const isValid = text.trim().length > 0 && text.length <= 100;

  return (
    <div className="bg-white border-4 border-slate-300 rounded-2xl p-6 space-y-6">
      <div className="bg-slate-100 rounded-xl p-6 flex flex-col items-center gap-3">
        <span className="text-6xl">{icon}</span>
        <span className="text-2xl font-bold text-slate-800">{text || currentText}</span>
        {subtitle && (
          <span className="text-sm text-slate-500">{subtitle}</span>
        )}
      </div>

      <div>
        <label className="text-lg font-semibold text-slate-700 block mb-2">
          {t('display-text')}
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={100}
          className="w-full text-xl p-4 border-2 border-slate-300 rounded-xl min-h-[60px] focus:border-blue-500 focus:outline-none"
          dir="auto"
        />
        <div className="text-sm text-slate-400 mt-1 text-end">{text.length}/100</div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 rounded-xl p-4 text-xl font-bold min-h-[70px] transition-all"
        >
          {t('cancel')}
        </button>
        <button
          onClick={() => isValid && onSave(text.trim(), icon)}
          disabled={!isValid}
          className={`flex-1 rounded-xl p-4 text-xl font-bold min-h-[70px] transition-all ${
            isValid
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
}
