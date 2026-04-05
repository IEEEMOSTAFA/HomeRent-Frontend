"use client";
// src/app/(dashboardRoute)/user/notifications/page.tsx
// API: GET /api/notifications | PATCH /api/notifications/:id/read | PATCH mark-all-read

import Link from "next/link";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Button }            from "@/components/ui/button";
import { Badge }             from "@/components/ui/badge";
import { Card }              from "@/components/ui/card";
import { Skeleton }          from "@/components/ui/skeleton";
import { cn }                from "@/lib/utils";
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/user/useUserApi";

const TYPE_STYLES: Record<string, { dot: string; bg: string }> = {
  booking_update: { dot: "bg-blue-500",    bg: "bg-blue-50/60"    },
  payment:        { dot: "bg-emerald-500", bg: "bg-emerald-50/60" },
  review:         { dot: "bg-amber-500",   bg: "bg-amber-50/60"   },
  system:         { dot: "bg-gray-400",    bg: "bg-gray-50/60"    },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useMyNotifications();
  const { mutate: markRead,    isPending: marking     } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: markingAll  } = useMarkAllNotificationsRead();

  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  function handleMarkAll() {
    markAllRead(undefined, {
      onSuccess: () => toast.success("All marked as read"),
      onError:   () => toast.error("Failed"),
    });
  }

  function handleMarkOne(id: string) {
    markRead(id, {
      onError: () => toast.error("Failed to mark as read"),
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread > 0 && (
            <Badge className="bg-blue-600 hover:bg-blue-600">{unread} new</Badge>
          )}
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="gap-1.5 text-xs"
          >
            <CheckCheck size={13} /> Mark all read
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BellOff size={40} className="text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm">No notifications yet</p>
        </div>
      )}

      {/* List */}
      {!isLoading && notifications && notifications.length > 0 && (
        <Card className="shadow-none divide-y overflow-hidden">
          {notifications.map((n) => {
            const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.system;

            const content = (
              <div
                className={cn(
                  "flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors group",
                  !n.isRead && style.bg
                )}
                onClick={() => !n.isRead && handleMarkOne(n.id)}
              >
                {/* Dot */}
                <div className="mt-1.5 flex-shrink-0">
                  <span className={cn(
                    "block w-2 h-2 rounded-full",
                    !n.isRead ? style.dot : "bg-transparent border border-muted-foreground/20"
                  )} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm leading-snug",
                    !n.isRead ? "font-semibold" : "font-medium text-muted-foreground"
                  )}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                </div>

                {/* Time */}
                <p className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            );

            return (
              <div key={n.id} className="cursor-pointer">
                {n.actionUrl
                  ? <Link href={n.actionUrl}>{content}</Link>
                  : content}
              </div>
            );
          })}
        </Card>
      )}

    </div>
  );
}