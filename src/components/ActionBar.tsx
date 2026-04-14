import { QuickName } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ActionBarProps {
  quickNames: QuickName[];
  onItemTap: (text: string, icon: string) => void;
}

export function ActionBar({ quickNames, onItemTap }: ActionBarProps) {
  const { t, tEn } = useTranslation();

  const permanentActions = [
    { id: 'action-yes', icon: '✅', tone: 'positive' as const },
    { id: 'action-no', icon: '❌', tone: 'negative' as const },
    { id: 'action-i-want', icon: '👍', tone: 'positive' as const },
    { id: 'action-i-dont-want', icon: '👎', tone: 'negative' as const },
    { id: 'action-more', icon: '➕', tone: 'positive' as const },
    { id: 'action-less', icon: '➖', tone: 'negative' as const },
    { id: 'action-help', icon: '🆘', tone: 'positive' as const },
    { id: 'action-stop', icon: '🛑', tone: 'negative' as const },
  ];

  const toneStyles = {
    positive: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
    negative: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  };

  return (
    <div className="bg-slate-800 border-t-4 border-slate-700 p-3 shadow-lg">
      <div className="grid grid-cols-4 grid-rows-2 grid-flow-col gap-3 mb-3">
        {permanentActions.map((action) => {
          const text = t(action.id);
          const subtitle = tEn(action.id);
          return (
            <button
              key={action.id}
              onClick={() => onItemTap(text, action.icon)}
              style={toneStyles[action.tone]}
              className="text-black rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all shadow-md min-h-[90px] font-bold border-2"
            >
              <span className="text-4xl">{action.icon}</span>
              <span className="text-2xl leading-tight">{text}</span>
              {subtitle && (
                <span className="text-sm leading-tight opacity-70">{subtitle}</span>
              )}
            </button>
          );
        })}
      </div>

      {quickNames.length > 0 && (
        <div className="grid grid-cols-6 gap-2">
          {quickNames.map((quick) => (
            <button
              key={quick.id}
              onClick={() => onItemTap(quick.name, quick.icon)}
              style={{ backgroundColor: '#dbeafe', borderColor: '#93c5fd' }}
              className="text-black rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition-all shadow-md min-h-[75px] border-2"
            >
              <span className="text-3xl">{quick.icon}</span>
              <span className="text-xl font-bold leading-tight">{quick.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
