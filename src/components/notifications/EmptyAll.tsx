import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false, loading: () => <div className="w-[120px] h-[120px]" /> }
);

export function EmptyAll() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="flex flex-col items-center py-20 text-center"
    >
      <LottiePlayer
        autoplay
        loop
        src="https://assets3.lottiefiles.com/packages/lf20_rqcjxmys.json"
        style={{ width: 120, height: 120 }}
      />
      <p className="text-sm font-semibold mt-2 text-foreground/80">All caught up</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        No notifications right now. We will let you know when something needs your attention.
      </p>
    </motion.div>
  );
}