import { useTranslation } from '../../hooks/useTranslation';

interface IconPickerProps {
  currentIcon: string;
  onSelect: (icon: string) => void;
  onCancel: () => void;
}

const emojiCategories = {
  faces: ['😊', '🙂', '😐', '😟', '😣', '😖', '😫', '😩', '😭', '😱', '😢', '😰', '😴', '🤔', '😶'],
  body: ['🧠', '🫁', '🫀', '💪', '🦵', '🗣️', '👀', '👂', '🦷', '👃', '🧍', '🤰', '🫃'],
  food: ['🍎', '🍌', '🍊', '🥕', '🥦', '🍲', '🍞', '🍚', '🍝', '🍗', '💧', '🧃', '🍵', '☕', '🥛', '🍽️', '🥤'],
  objects: ['📱', '👓', '📺', '🛏️', '🛌', '🧼', '🚽', '🚿', '📖', '🎵', '📞', '⏰', '⏳', '📅'],
  places: ['🏠', '🏥', '🛋️', '👨‍🍳', '🌳', '🌅', '☀️', '🌆', '🌙'],
  people: ['👨‍⚕️', '👩‍⚕️', '👨‍👩‍👧', '👫', '🚶', '👩', '👨', '👤', '👥'],
  symbols: ['✅', '❌', '🆘', '👍', '👎', '🛑', '➕', '➖', '❓', '📍', '💭', '👉', '☝️'],
  temperature: ['🥶', '🥵'],
};

const allEmojis = Object.values(emojiCategories).flat();

export function IconPicker({ currentIcon, onSelect, onCancel }: IconPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-4 border-slate-300 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{currentIcon}</span>
        <span className="text-lg font-semibold text-slate-600">→</span>
      </div>

      <div className="grid grid-cols-8 gap-2 max-h-[400px] overflow-y-auto">
        {allEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            onClick={() => onSelect(emoji)}
            className={`text-3xl p-3 rounded-xl min-w-[48px] min-h-[48px] flex items-center justify-center transition-all ${
              emoji === currentIcon
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'hover:bg-slate-100 active:bg-slate-200 border-2 border-transparent'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <button
        onClick={onCancel}
        className="w-full bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 rounded-xl p-4 text-lg font-bold min-h-[60px] transition-all"
      >
        {t('cancel')}
      </button>
    </div>
  );
}
