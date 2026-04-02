import { RecentItem } from '../types';

interface RecentItemsProps {
  items: RecentItem[];
  onItemTap: (text: string, icon: string) => void;
}

export function RecentItems({ items, onItemTap }: RecentItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-slate-100 border-4 border-slate-300 rounded-2xl p-4 mb-4">
      <h2 className="text-2xl font-bold text-slate-700 mb-3">Recent</h2>
      <div className="grid grid-cols-6 gap-2">
        {items.slice(0, 6).map((item, index) => (
          <button
            key={index}
            onClick={() => onItemTap(item.text, item.icon)}
            className="bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all shadow-md min-h-[90px]"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-sm font-semibold text-center leading-tight text-slate-800">
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
