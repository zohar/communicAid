import { Category } from '../../types';
import { ItemButton } from '../ItemButton';
import { CategoryTile } from '../CategoryTile';

interface CategoryScreenProps {
  category: Category;
  onItemTap: (text: string, icon: string) => void;
  onSubcategorySelect: (subcategory: Category) => void;
}

export function CategoryScreen({ category, onItemTap, onSubcategorySelect }: CategoryScreenProps) {
  return (
    <div className="space-y-6">
      {category.phrases && category.phrases.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">Common Phrases</h2>
          <div className="grid grid-cols-2 gap-4">
            {category.phrases.map((phrase) => (
              <ItemButton
                key={phrase.id}
                text={phrase.text}
                icon={phrase.icon}
                onClick={() => onItemTap(phrase.text, phrase.icon)}
                variant="phrase"
              />
            ))}
          </div>
        </div>
      )}

      {category.subcategories && category.subcategories.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">Subcategories</h2>
          <div className="grid grid-cols-3 gap-4">
            {category.subcategories.map((subcategory) => (
              <CategoryTile
                key={subcategory.id}
                name={subcategory.name}
                icon={subcategory.icon}
                onClick={() => onSubcategorySelect(subcategory)}
              />
            ))}
          </div>
        </div>
      )}

      {category.special === 'pain-scale' && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">Pain Level (1-10)</h2>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const painFaces = ['😊', '🙂', '😐', '😟', '😣', '😖', '😫', '😩', '😭', '😱'];
              return (
                <ItemButton
                  key={level}
                  text={`Level ${level}`}
                  icon={painFaces[level - 1]}
                  onClick={() => onItemTap(`Pain Level ${level}`, painFaces[level - 1])}
                />
              );
            })}
          </div>
        </div>
      )}

      {category.special === 'time' && (
        <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mb-4">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Current Time</h2>
          <p className="text-4xl font-bold text-blue-800">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xl text-blue-700 mt-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}

      {category.special === 'body-parts' && (
        <div className="bg-rose-100 border-4 border-rose-300 rounded-2xl p-6 mb-4 text-center">
          <h2 className="text-2xl font-bold text-rose-900 mb-3">Point to where it hurts</h2>
          <div className="text-8xl">🧍</div>
          <p className="text-lg text-rose-700 mt-2">Or select from buttons below</p>
        </div>
      )}

      {category.items && category.items.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">
            {category.subcategories ? 'Or Choose' : 'Choose'}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {category.items.map((item) => (
              <ItemButton
                key={item.id}
                text={item.text}
                icon={item.icon}
                onClick={() => onItemTap(item.text, item.icon)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
