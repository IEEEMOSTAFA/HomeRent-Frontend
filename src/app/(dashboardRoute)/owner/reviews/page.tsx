"use client";
// ✅ FILE PATH: src/app/(dashboardRoute)/owner/reviews/page.tsx
// API: GET /owner/reviews | PATCH /api/owner/reviews/:id/flag

import { Star, Flag, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button }          from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge }           from "@/components/ui/badge";
import { Skeleton }        from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAllOwnerReviews, useFlagReview } from "@/hooks/owner/useOwnerApi";

// ── Star Rating ────────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20 fill-muted-foreground/10"}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{rating}/5</span>
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────────
function ReviewSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="shadow-none border border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-full mt-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OwnerReviewsPage() {
  const { data, isLoading, isError, refetch } = useAllOwnerReviews();

  // ✅ FIX: mutationFn চায় { id, isFlagged } — তাই object pass করতে হবে
  const { mutate: flagReview, isPending: flagging } = useFlagReview();

  const reviews = data?.data ?? [];
  const total   = data?.meta?.total ?? reviews.length;

  function handleFlag(id: string, currentFlagged: boolean) {
    // ✅ BUG FIX: আগে flagReview(id, {...}) ছিল — এটা ভুল
    // mutationFn এর signature: ({ id, isFlagged }) তাই object দিতে হবে
    flagReview(
      { id, isFlagged: !currentFlagged },
      {
        onSuccess: () =>
          toast.success(currentFlagged ? "Flag removed" : "Review flagged for admin"),
        onError: () =>
          toast.error("Failed to update flag"),
      }
    );
  }

  return (
    // ✅ bg-background = website এর নিজের background color
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? "Loading reviews…"
              : `${total} review${total === 1 ? "" : "s"} across your properties`}
          </p>
        </div>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {isLoading && <ReviewSkeleton />}

        {/* ── Error ────────────────────────────────────────────────── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-destructive text-sm font-medium">
              ❌ Reviews load করতে সমস্যা হয়েছে।
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────── */}
        {!isLoading && !isError && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No reviews yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Tenants যখন তোমার property তে থাকবে এবং review দেবে, সেগুলো এখানে দেখাবে।
            </p>
          </div>
        )}

        {/* ── Reviews List ──────────────────────────────────────────── */}
        {!isLoading && !isError && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card
                key={r.id}
                className={`shadow-none transition-colors border ${
                  r.isFlagged
                    ? "border-amber-200 bg-amber-50/40 dark:bg-amber-950/10"
                    : "border-border/60 bg-card"
                }`}
              >
                <CardContent className="p-5 space-y-3">

                  {/* ── Top row: avatar + name + property + stars + flag ── */}
                  <div className="flex items-start justify-between gap-3">

                    {/* Left: user info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={r.user?.image ?? undefined} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">
                          {r.user?.name?.[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {r.user?.name ?? "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          🏠 {r.property?.title ?? "Property"}
                        </p>
                      </div>
                    </div>

                    {/* Right: stars + flag */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StarRating rating={r.rating} />

                      {r.isFlagged ? (
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-amber-600 border-amber-300 bg-amber-50 text-[10px] h-6"
                          >
                            Flagged
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFlag(r.id, r.isFlagged)}
                            disabled={flagging}
                            className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-2"
                          >
                            Unflag
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFlag(r.id, r.isFlagged)}
                          disabled={flagging}
                          className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 px-2"
                        >
                          <Flag size={11} /> Flag
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* ── Review comment ── */}
                  {r.comment ? (
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-emerald-200 pl-3">
                      {r.comment}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 italic">
                      No written comment
                    </p>
                  )}

                  {/* ── Date ── */}
                  <p className="text-xs text-muted-foreground/50">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}