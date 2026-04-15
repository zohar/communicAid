import { RecentItem } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface RecentItemsProps {
  items: RecentItem[];
  onItemTap: (text: string, icon: string) => void;
}

export function RecentItems({ items, onItemTap }: RecentItemsProps) {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <div className="bg-slate-100 border-t-4 border-slate-300 px-3 py-2">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide shrink-0">
          {t('recent')}
        </h2>
        <div className="grid grid-cols-6 gap-2 flex-1">
          {items.slice(0, 6).map((item, index) => {
            const displayText = item.entryId ? t(item.entryId) : item.text;
            return (
              <button
                key={index}
                onClick={() => onItemTap(displayText, item.icon)}
                className="bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-300 rounded-lg px-2 py-1 flex items-center justify-center gap-2 transition-all shadow-sm min-h-[48px]"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-semibold leading-tight text-slate-800 truncate">
                  {displayText}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
