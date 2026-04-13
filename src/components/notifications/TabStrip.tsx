import { cn } from "@/lib/utils";
import type { FilterTab } from "./types";
import { TAB_LABELS } from "./config";

const ALL_TABS: FilterTab[] = ["all", "booking_update", "payment", "review", "system"];

interface Props {
  active: FilterTab;
  onChange: (t: FilterTab) => void;
  counts: Record<FilterTab, number>;
}

export function TabStrip({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit max-w-full overflow-x-auto scrollbar-none">
      {ALL_TABS.filter((t) => t === "all" || counts[t] > 0).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "relative px-3 h-7 text-[12px] rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150 font-medium",
            active === t
              ? "bg-background text-foreground shadow-sm border border-border/40"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          {TAB_LABELS[t]}
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] rounded-full tabular-nums",
              active === t
                ? "bg-muted text-muted-foreground"
                : "bg-muted/60 text-muted-foreground/70"
            )}
          >
            {counts[t]}
          </span>
        </button>
      ))}
    </div>
  );
}