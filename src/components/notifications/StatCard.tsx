import { cn } from "@/lib/utils";
import { AnimNum } from "./AnimNum";

interface Props {
  label: string;
  value: number;
  color: string;
}

export function StatCard({ label, value, color }: Props) {
  return (
    <div className="flex-1 rounded-xl border border-border/60 bg-card px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className={cn("text-xl font-semibold tabular-nums", color)}>
        <AnimNum value={value} />
      </p>
    </div>
  );
}