import { Category } from '../../types';
import { CategoryTile } from '../CategoryTile';

interface HomeScreenProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

export function HomeScreen({ categories, onCategorySelect }: HomeScreenProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryTile
          key={category.id}
          name={category.name}
          icon={category.icon}
          onClick={() => onCategorySelect(category)}
        />
      ))}
    </div>
  );
}
