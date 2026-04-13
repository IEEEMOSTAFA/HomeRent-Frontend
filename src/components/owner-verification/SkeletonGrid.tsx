import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Skeleton Grid ────────────────────────────────────────────────────────────
export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
          <Card className="shadow-none border border-border/50">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-2.5 w-48 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-7 rounded-lg" />
                <Skeleton className="h-7 rounded-lg" />
              </div>
              <Skeleton className="h-9 rounded-lg" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}