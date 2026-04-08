interface CategoryTileProps {
  name: string;
  subtitle?: string | null;
  icon: string;
  onClick: () => void;
}

export function CategoryTile({ name, subtitle, icon, onClick }: CategoryTileProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white hover:bg-slate-50 active:bg-slate-100 border-4 border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-lg min-h-[160px] hover:shadow-xl hover:scale-105 active:scale-100"
    >
      <span className="text-6xl">{icon}</span>
      <span className="text-2xl font-bold text-slate-800 text-center leading-tight">
        {name}
      </span>
      {subtitle && (
        <span className="text-sm text-slate-500 text-center leading-tight">
          {subtitle}
        </span>
      )}
    </button>
  );
}
