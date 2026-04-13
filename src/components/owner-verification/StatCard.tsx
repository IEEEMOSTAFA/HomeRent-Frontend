import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animate } from "animejs";
import { Card, CardContent } from "@/components/ui/card";

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  icon, label, value, color, delay,
}: {
  icon: React.ReactNode; label: string; value: number; color: string; delay: number;
}) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!countRef.current) return;
    const proxy = { val: 0 };
    animate(proxy, {
      val: value,
      duration: 1200,
      delay,
      ease: "outExpo",
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(proxy.val));
        }
      },
    });
  }, [value, delay]);

  const bgMap: Record<string, string> = {
    "bg-violet-500": "bg-violet-100 text-violet-600",
    "bg-emerald-500": "bg-emerald-100 text-emerald-600",
    "bg-amber-500": "bg-amber-100 text-amber-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      <Card className="shadow-none border border-border/50 overflow-hidden relative">
        <div className={`absolute inset-x-0 top-0 h-0.5 ${color}`} />
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${bgMap[color] ?? "bg-muted text-muted-foreground"}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold tracking-tight">
              <span ref={countRef}>0</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}