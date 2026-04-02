import { QuickName } from '../types';

interface ActionBarProps {
  quickNames: QuickName[];
  onItemTap: (text: string, icon: string) => void;
}

export function ActionBar({ quickNames, onItemTap }: ActionBarProps) {
  const permanentActions = [
    { text: 'Yes', icon: '✅' },
    { text: 'No', icon: '❌' },
    { text: 'Help', icon: '🆘' },
    { text: 'I Want', icon: '👍' },
    { text: "I Don't Want", icon: '👎' },
    { text: 'Stop', icon: '🛑' },
    { text: 'More', icon: '➕' },
    { text: 'Less', icon: '➖' },
  ];

  return (
    <div className="bg-slate-800 border-t-4 border-slate-700 p-3 shadow-lg">
      <div className="grid grid-cols-4 gap-3 mb-3">
        {permanentActions.map((action) => (
          <button
            key={action.text}
            onClick={() => onItemTap(action.text, action.icon)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all shadow-md min-h-[90px] text-lg font-bold"
          >
            <span className="text-4xl">{action.icon}</span>
            <span className="text-sm leading-tight">{action.text}</span>
          </button>
        ))}
      </div>

      {quickNames.length > 0 && (
        <div className="grid grid-cols-6 gap-2">
          {quickNames.map((quick) => (
            <button
              key={quick.id}
              onClick={() => onItemTap(quick.name, quick.icon)}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition-all shadow-md min-h-[75px]"
            >
              <span className="text-3xl">{quick.icon}</span>
              <span className="text-xs font-semibold leading-tight">{quick.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
