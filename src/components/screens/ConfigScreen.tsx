import { Category } from '../../types';
import { CategoryTile } from '../CategoryTile';
import { LanguagePicker } from '../config/LanguagePicker';
import { useTranslation } from '../../hooks/useTranslation';

interface ConfigScreenProps {
  categories: Category[];
  onCategoryEdit: (category: Category) => void;
}

export function ConfigScreen({ categories, onCategoryEdit }: ConfigScreenProps) {
  const { t, tEn } = useTranslation();

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
              onClick={() => onCategoryEdit(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
