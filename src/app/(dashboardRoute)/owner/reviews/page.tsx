"use client";
// src/app/(dashboardRoute)/owner/reviews/page.tsx
// API: GET /reviews?ownerId=me | PATCH /api/owner/reviews/:id/flag

import { Star, Flag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllOwnerReviews, useFlagReview } from "@/hooks/owner/useOwnerApi";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={
            s <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-muted fill-muted"
          }
        />
      ))}
    </div>
  );
}

export default function OwnerReviewsPage() {
  const { data, isLoading } = useAllOwnerReviews();
  const { mutate: flagReview, isPending: flagging } = useFlagReview();

  const reviews = data?.data ?? [];

  function handleFlag(id: string) {
    flagReview(id, {
      onSuccess: () => toast.success("Review flagged for admin"),
      onError: () => toast.error("Failed to flag review"),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data?.meta?.total ?? 0} reviews across your properties
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-24">
          <Star size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No reviews yet</p>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card
              key={r.id}
              className={`shadow-none ${r.isFlagged ? "border-amber-200 bg-amber-50/50" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">

                  {/* Left: avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold flex-shrink-0">
                      {r.user.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.user.name}</p>
                      <p className="text-xs text-muted-foreground">{r.property.title}</p>
                    </div>
                  </div>

                  {/* Right: stars + flag */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StarRating rating={r.rating} />
                    {r.isFlagged ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">
                        Flagged
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFlag(r.id)}
                        disabled={flagging}
                        className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Flag size={12} /> Flag
                      </Button>
                    )}
                  </div>
                </div>

                {r.comment && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{r.comment}</p>
                )}

                <p className="text-xs text-muted-foreground/60 mt-3">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}