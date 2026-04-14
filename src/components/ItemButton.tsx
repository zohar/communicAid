interface ItemButtonProps {
  text: string;
  subtitle?: string | null;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'phrase';
}

export function ItemButton({ text, subtitle, icon, onClick, variant = 'default' }: ItemButtonProps) {
  const baseClasses = "rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all shadow-lg min-h-[140px] font-bold border-4 text-slate-800";

  const isPhrase = variant === 'phrase';
  const variantClasses = isPhrase
    ? "hover:brightness-95 active:brightness-90"
    : "bg-white hover:bg-slate-50 active:bg-slate-100 border-slate-300";

  const phraseStyle = isPhrase
    ? { backgroundColor: '#dbeafe', borderColor: '#93c5fd' }
    : undefined;

  return (
    <button
      onClick={onClick}
      style={phraseStyle}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span className="text-5xl">{icon}</span>
      <span className="text-xl text-center leading-tight">{text}</span>
      {subtitle && (
        <span className="text-xs text-center leading-tight text-slate-500">
          {subtitle}
        </span>
      )}
    </button>
  );
}
