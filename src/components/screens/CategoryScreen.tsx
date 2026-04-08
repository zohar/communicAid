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
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const painFaces = ['😊', '🙂', '😐', '😟', '😣', '😖', '😫', '😩', '😭', '😱'];
              const entryId = `pain-level-${level}`;
              return (
                <ItemButton
                  key={level}
                  text={t(entryId)}
                  subtitle={tEn(entryId)}
                  icon={painFaces[level - 1]}
                  onClick={() => onItemTap(t(entryId), painFaces[level - 1], entryId)}
                />
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

      {category.special === 'body-parts' && (
        <div className="bg-rose-100 border-4 border-rose-300 rounded-2xl p-6 mb-4 text-center">
          <h2 className="text-2xl font-bold text-rose-900 mb-3">{t('point-where-hurts')}</h2>
          <div className="text-8xl">🧍</div>
          <p className="text-lg text-rose-700 mt-2">{t('select-below')}</p>
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
