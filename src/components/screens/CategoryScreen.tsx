import { Category } from '../../types';
import { ItemButton } from '../ItemButton';
import { CategoryTile } from '../CategoryTile';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../hooks/useLanguage';

interface CategoryScreenProps {
  category: Category;
  onItemTap: (text: string, icon: string, entryId?: string) => void;
  onSubcategorySelect: (subcategory: Category) => void;
}

export function CategoryScreen({ category, onItemTap, onSubcategorySelect }: CategoryScreenProps) {
  const { t, tEn } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {category.phrases && category.phrases.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">{t('common-phrases')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {category.phrases.map((phrase) => (
              <ItemButton
                key={phrase.id}
                text={t(phrase.id)}
                subtitle={tEn(phrase.id)}
                icon={phrase.icon}
                onClick={() => onItemTap(t(phrase.id), phrase.icon, phrase.id)}
                variant="phrase"
              />
            ))}
          </div>
        </div>
      )}

      {category.subcategories && category.subcategories.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">{t('subcategories')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {category.subcategories.map((subcategory) => (
              <CategoryTile
                key={subcategory.id}
                name={t(subcategory.id)}
                subtitle={tEn(subcategory.id)}
                icon={subcategory.icon}
                onClick={() => onSubcategorySelect(subcategory)}
              />
            ))}
          </div>
        </div>
      )}

      {category.special === 'pain-scale' && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">{t('pain-level')}</h2>
          <div className="grid grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const painFaces = ['😊', '🙂', '😐', '😟', '😣', '😖', '😫', '😩', '😭', '😱'];
              const painColors = [
                '#bbf7d0', // 1 - green-200
                '#d9f99d', // 2 - lime-200
                '#ecfccb', // 3 - lime-100
                '#fef9c3', // 4 - yellow-100
                '#fef08a', // 5 - yellow-200
                '#fed7aa', // 6 - orange-200
                '#fdba74', // 7 - orange-300
                '#fca5a5', // 8 - red-300
                '#f87171', // 9 - red-400
                '#ef4444', // 10 - red-500
              ];
              const entryId = `pain-level-${level}`;
              const icon = painFaces[level - 1];
              return (
                <button
                  key={level}
                  onClick={() => onItemTap(t(entryId), icon, entryId)}
                  style={{ backgroundColor: painColors[level - 1] }}
                  className="hover:brightness-95 active:brightness-90 border-4 border-slate-300 text-slate-900 rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all shadow-lg min-h-[100px] font-bold"
                >
                  <span className="text-4xl">{icon}</span>
                  <span className="text-2xl">{level}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {category.special === 'time' && (
        <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mb-4">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">{t('current-time')}</h2>
          <p className="text-4xl font-bold text-blue-800">
            {new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xl text-blue-700 mt-2">
            {new Date().toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}

      {category.items && category.items.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">
            {category.subcategories ? t('or-choose') : t('choose')}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {category.items.map((item) => (
              <ItemButton
                key={item.id}
                text={t(item.id)}
                subtitle={tEn(item.id)}
                icon={item.icon}
                onClick={() => onItemTap(t(item.id), item.icon, item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
