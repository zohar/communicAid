import { Category } from '../../types';
import { CategoryTile } from '../CategoryTile';
import { useTranslation } from '../../hooks/useTranslation';

interface HomeScreenProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

export function HomeScreen({ categories, onCategorySelect }: HomeScreenProps) {
  const { t, tEn } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryTile
          key={category.id}
          name={t(category.id)}
          subtitle={tEn(category.id)}
          icon={category.icon}
          onClick={() => onCategorySelect(category)}
        />
      ))}
    </div>
  );
}
