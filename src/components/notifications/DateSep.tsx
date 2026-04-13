export function DateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}