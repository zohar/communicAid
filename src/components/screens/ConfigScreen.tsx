import { useRef, useState } from 'react';
import { Category } from '../../types';
import { CategoryTile } from '../CategoryTile';
import { LanguagePicker } from '../config/LanguagePicker';
import { CategoryEditor } from '../config/CategoryEditor';
import { EntryEditor } from '../config/EntryEditor';
import { IconPicker } from '../config/IconPicker';
import { ResetButton } from '../config/ResetButton';
import { useTranslation } from '../../hooks/useTranslation';
import { useOverrides } from '../../hooks/useOverrides';
import { useQuickNames } from '../../hooks/useQuickNames';
import { exportConfig, parseAndValidate, applyConfig } from '../../utils/configIO';

type ConfigView =
  | { mode: 'main' }
  | { mode: 'category'; category: Category }
  | { mode: 'entry'; category: Category; entryId: string; text: string; icon: string }
  | { mode: 'icon'; category: Category; entryId: string; text: string; icon: string }
  | { mode: 'quickname-icon'; quickNameId: string; currentIcon: string };

interface ConfigScreenProps {
  categories: Category[];
  onCategoryEdit: (category: Category) => void;
}

export function ConfigScreen({ categories }: ConfigScreenProps) {
  const { t, tEn } = useTranslation();
  const [view, setView] = useState<ConfigView>({ mode: 'main' });
  const { quickNames, update: updateQuickName, move: moveQuickName } = useQuickNames();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const text = exportConfig();
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'communicaid-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert(`${t('export-failed')}: ${(err as Error).message}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch (err) {
      window.alert(`${t('import-failed')}: ${(err as Error).message}`);
      return;
    }

    const result = parseAndValidate(text);
    if (!result.ok) {
      window.alert(`${t('import-failed')}: ${result.error.message}`);
      return;
    }

    const confirmed = window.confirm(t('import-confirm'));
    if (!confirmed) return;

    try {
      applyConfig(result.config);
    } catch (err) {
      window.alert(`${t('import-failed')}: ${(err as Error).message}`);
    }
  };

  const activeCategoryId =
    view.mode === 'category' || view.mode === 'entry' || view.mode === 'icon'
      ? view.category.id
      : '';
  const { setOverride, resetCategory } = useOverrides(activeCategoryId);

  if (view.mode === 'quickname-icon') {
    return (
      <IconPicker
        currentIcon={view.currentIcon}
        onSelect={(icon) => {
          updateQuickName(view.quickNameId, { icon });
          setView({ mode: 'main' });
        }}
        onCancel={() => setView({ mode: 'main' })}
      />
    );
  }

  if (view.mode === 'icon') {
    return (
      <IconPicker
        currentIcon={view.icon}
        onSelect={(icon) => {
          setView({ ...view, mode: 'entry', icon });
        }}
        onCancel={() => {
          setView({ ...view, mode: 'entry' });
        }}
      />
    );
  }

  if (view.mode === 'entry') {
    return (
      <EntryEditor
        entryId={view.entryId}
        currentText={view.text}
        currentIcon={view.icon}
        onSave={(text, icon) => {
          setOverride(view.entryId, { text, icon });
          setView({ mode: 'category', category: view.category });
        }}
        onCancel={() => {
          setView({ mode: 'category', category: view.category });
        }}
      />
    );
  }

  if (view.mode === 'category') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setView({ mode: 'main' })}
          className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded-xl px-6 py-3 text-lg font-semibold text-slate-700 transition-all"
        >
          ← {t('settings')}
        </button>
        <h2 className="text-2xl font-bold text-slate-700">{t(view.category.id)}</h2>
        <CategoryEditor
          category={view.category}
          onEditEntry={(entryId, text, icon) => {
            setView({ mode: 'entry', category: view.category, entryId, text, icon });
          }}
        />
        <ResetButton onReset={resetCategory} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-4 border-slate-300 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">
          {t('language')} / שפה / اللغة
        </h2>
        <LanguagePicker />
      </div>

      <div className="bg-white border-4 border-slate-300 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">{t('quick-names')}</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickNames.map((quick, index) => (
            <div
              key={quick.id}
              className="flex items-center gap-2 p-3 rounded-xl border-2 border-slate-200"
            >
              <button
                onClick={() =>
                  setView({
                    mode: 'quickname-icon',
                    quickNameId: quick.id,
                    currentIcon: quick.icon,
                  })
                }
                className="text-4xl p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all min-w-[60px] min-h-[60px] flex items-center justify-center"
                aria-label={t('change-icon')}
              >
                {quick.icon}
              </button>
              <input
                type="text"
                value={quick.name}
                onChange={(e) => updateQuickName(quick.id, { name: e.target.value })}
                className="flex-1 min-w-0 text-lg font-semibold text-slate-800 bg-slate-50 border-2 border-slate-300 rounded-lg px-3 py-2 min-h-[48px] focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveQuickName(quick.id, 'up')}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveQuickName(quick.id, 'down')}
                  disabled={index === quickNames.length - 1}
                  aria-label="Move down"
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-700 mb-3">{t('edit')}</h2>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryTile
              key={category.id}
              name={t(category.id)}
              subtitle={tEn(category.id)}
              icon={category.icon}
              onClick={() => setView({ mode: 'category', category })}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border-4 border-slate-300 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">{t('backup')}</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl px-6 py-4 text-lg font-semibold min-h-[56px] transition-all"
          >
            {t('export-config')}
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 rounded-xl px-6 py-4 text-lg font-semibold min-h-[56px] transition-all"
          >
            {t('import-config')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </div>
    </div>
  );
}
