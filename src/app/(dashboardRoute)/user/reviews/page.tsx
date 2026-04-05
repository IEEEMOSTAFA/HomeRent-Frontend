"use client";
// src/app/(dashboardRoute)/user/reviews/page.tsx
// API: GET /api/reviews?userId=me

import Link from "next/link";
import { Star, Plus } from "lucide-react";

import { Button }             from "@/components/ui/button";
import { Card, CardContent }  from "@/components/ui/card";
import { Badge }              from "@/components/ui/badge";
import { Skeleton }           from "@/components/ui/skeleton";
import { useMyReviews }       from "@/hooks/user/useUserApi";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={13}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-muted fill-muted"}
        />
      ))}
    </div>
  );
}

export default function MyReviewsPage() {
  const { data, isLoading } = useMyReviews();
  const reviews = data?.data ?? [];

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">{data?.meta?.total ?? 0} reviews submitted</p>
        </div>
        <Link href="/user/reviews/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm">
            <Plus size={15} /> Write Review
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-20">
          <Star size={44} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No reviews yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            You can review a property after your booking is confirmed
          </p>
          <Link href="/user/reviews/new">
            <Button variant="link" className="text-blue-600 mt-2">Write your first review →</Button>
          </Link>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Property title */}
                    {r.property && (
                      <p className="font-semibold text-sm line-clamp-1">{r.property.title}</p>
                    )}

                    {/* Stars + date */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <StarRating rating={r.rating} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>

                    {/* Comment */}
                    {r.comment && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.comment}</p>
                    )}
                  </div>

                  {/* Flags */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {r.isFlagged && (
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                        Flagged
                      </Badge>
                    )}
                    {!r.isVisible && (
                      <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
                        Hidden
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}