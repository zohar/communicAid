import { Home, ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onHome: () => void;
  onSettings: () => void;
}

export function Header({ title, onBack, onHome, onSettings }: HeaderProps) {
  const { isRTL } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="bg-slate-800 text-white p-4 shadow-lg border-b-4 border-slate-700">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 p-4 rounded-xl flex items-center justify-center transition-all shadow-md min-w-[70px] min-h-[70px]"
            >
              <BackIcon size={32} />
            </button>
          )}
          <button
            onClick={onHome}
            className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 p-4 rounded-xl flex items-center justify-center transition-all shadow-md min-w-[70px] min-h-[70px]"
          >
            <Home size={32} />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center flex-1">{title}</h1>

        <div className="flex items-center gap-3">
          <div className="text-end min-w-[180px]">
            <div className="text-3xl font-bold">{formatTime(currentTime)}</div>
            <div className="text-lg text-slate-300">{formatDate(currentTime)}</div>
          </div>
          <button
            onClick={onSettings}
            className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 p-4 rounded-xl flex items-center justify-center transition-all shadow-md min-w-[70px] min-h-[70px]"
          >
            <Settings size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
