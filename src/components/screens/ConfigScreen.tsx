import { useState } from 'react';
import { Category } from '../../types';
import { CategoryTile } from '../CategoryTile';
import { LanguagePicker } from '../config/LanguagePicker';
import { CategoryEditor } from '../config/CategoryEditor';
import { EntryEditor } from '../config/EntryEditor';
import { IconPicker } from '../config/IconPicker';
import { ResetButton } from '../config/ResetButton';
import { useTranslation } from '../../hooks/useTranslation';
import { useOverrides } from '../../hooks/useOverrides';

type ConfigView =
  | { mode: 'main' }
  | { mode: 'category'; category: Category }
  | { mode: 'entry'; category: Category; entryId: string; text: string; icon: string }
  | { mode: 'icon'; category: Category; entryId: string; text: string; icon: string };

interface ConfigScreenProps {
  categories: Category[];
  onCategoryEdit: (category: Category) => void;
}

export function ConfigScreen({ categories }: ConfigScreenProps) {
  const { t, tEn } = useTranslation();
  const [view, setView] = useState<ConfigView>({ mode: 'main' });

  const activeCategoryId = view.mode !== 'main' ? view.category.id : '';
  const { setOverride, resetCategory } = useOverrides(activeCategoryId);

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
    </div>
  );
}
