// ─── Filter Pill ──────────────────────────────────────────────────────────────
export function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150 ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
      }`}
    >
      {label}
    </button>
  );
}