interface ItemButtonProps {
  text: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'phrase';
}

export function ItemButton({ text, icon, onClick, variant = 'default' }: ItemButtonProps) {
  const baseClasses = "rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all shadow-lg min-h-[140px] font-bold border-4";

  const variantClasses = variant === 'phrase'
    ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 border-amber-600 text-white"
    : "bg-white hover:bg-slate-50 active:bg-slate-100 border-slate-300 text-slate-800";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span className="text-5xl">{icon}</span>
      <span className="text-xl text-center leading-tight">{text}</span>
    </button>
  );
}
