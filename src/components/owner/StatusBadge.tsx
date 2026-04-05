// src/app/(dashboardRoute)/owner/_components/StatusBadge.tsx

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING:         "bg-amber-50  text-amber-700  border-amber-200",
  APPROVED:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED:        "bg-red-50    text-red-700    border-red-200",
  ACCEPTED:        "bg-blue-50   text-blue-700   border-blue-200",
  CONFIRMED:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  DECLINED:        "bg-red-50    text-red-700    border-red-200",
  CANCELLED:       "bg-gray-100  text-gray-500   border-gray-200",
  PAYMENT_PENDING: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-semibold",
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500 border-gray-200"
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}