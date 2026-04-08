import { Pencil } from 'lucide-react';
import { Category } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useOverrides } from '../../hooks/useOverrides';
import { useLanguage } from '../../hooks/useLanguage';

interface CategoryEditorProps {
  category: Category;
  onEditEntry: (entryId: string, currentText: string, currentIcon: string) => void;
}

export function CategoryEditor({ category, onEditEntry }: CategoryEditorProps) {
  const { t } = useTranslation();
  const { overrides } = useOverrides(category.id);
  const { language } = useLanguage();

  function hasOverride(entryId: string): boolean {
    return !!overrides[`${entryId}:${language}`];
  }

  function renderEntryRow(entryId: string, icon: string) {
    const text = t(entryId);
    const edited = hasOverride(entryId);
    return (
      <div key={entryId} className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-slate-200 min-h-[70px]">
        <span className="text-3xl">{icon}</span>
        <span className="text-xl font-semibold flex-1">{text}</span>
        {edited && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            {t('edit')}
          </span>
        )}
        <button
          onClick={() => onEditEntry(entryId, text, icon)}
          className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 p-3 rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center transition-all"
        >
          <Pencil size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {category.phrases && category.phrases.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-600 mb-2">{t('common-phrases')}</h3>
          <div className="space-y-2">
            {category.phrases.map((phrase) => renderEntryRow(phrase.id, phrase.icon))}
          </div>
        </div>
      )}

      {category.subcategories && category.subcategories.length > 0 && (
        <div className="space-y-4">
          {category.subcategories.map((sub) => (
            <div key={sub.id}>
              <h3 className="text-xl font-bold text-slate-600 mb-2">{t(sub.id)}</h3>
              <div className="space-y-2">
                {sub.items?.map((item) => renderEntryRow(item.id, item.icon))}
              </div>
            </div>
          ))}
        </div>
      )}

      {category.items && category.items.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-600 mb-2">{t('choose')}</h3>
          <div className="space-y-2">
            {category.items.map((item) => renderEntryRow(item.id, item.icon))}
          </div>
        </div>
      )}
    </div>
  );
}
