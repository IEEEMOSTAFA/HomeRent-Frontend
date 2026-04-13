import { motion } from "framer-motion";
import { UserCheck, CheckCircle2 } from "lucide-react";

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center">
          <UserCheck size={36} className="text-emerald-500" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <CheckCircle2 size={14} className="text-white" />
        </motion.div>
      </div>
      <h3 className="font-semibold text-base mb-1">All caught up!</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        No pending owner verifications at the moment.
      </p>
    </motion.div>
  );
}