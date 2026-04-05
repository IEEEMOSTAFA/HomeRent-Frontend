// src/app/(dashboardRoute)/user/_components/StatCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple";
}

const COLOR: Record<string, string> = {
  blue:    "bg-blue-50   text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber:   "bg-amber-50  text-amber-600",
  rose:    "bg-rose-50   text-rose-600",
  purple:  "bg-purple-50 text-purple-600",
};

export default function StatCard({ label, value, icon, sub, color = "blue" }: StatCardProps) {
  return (
    <Card className="shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={cn("p-2.5 rounded-lg", COLOR[color])}>{icon}</div>
      </CardContent>
    </Card>
  );
}