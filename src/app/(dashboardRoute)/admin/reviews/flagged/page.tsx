"use client";
// src/app/(dashboardRoute)/admin/reviews/flagged/page.tsx

import { Star, Eye, EyeOff, Flag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlaggedReviews, useReviewVisibility } from "@/hooks/admin/useAdminApi";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-muted fill-muted"}
        />
      ))}
    </div>
  );
}

export default function FlaggedReviewsPage() {
  const { data, isLoading } = useFlaggedReviews();
  const { mutate: setVisibility, isPending } = useReviewVisibility();

  const reviews = data?.data ?? [];

  // ✅ Fix: isVisible toggle সঠিকভাবে করা হচ্ছে
  function handleVisibility(id: string, currentIsVisible: boolean) {
    const newVisibility = !currentIsVisible;
    setVisibility(
      { id, isVisible: newVisibility },
      {
        onSuccess: () =>
          toast.success(newVisibility ? "Review is now visible" : "Review hidden successfully"),
        onError: () => toast.error("Action failed. Please try again."),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flagged Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data?.meta?.total ?? 0} reviews flagged by owners
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-20">
          <Flag size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No flagged reviews</p>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className={`shadow-none ${!r.isVisible ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Left — User info */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-sm font-bold flex-shrink-0">
                      {r.user.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.user.name}</p>
                      {/* ✅ city, area এখন backend থেকে আসবে */}
                      <p className="text-xs text-muted-foreground">
                        {r.property.title} — {r.property.area}, {r.property.city}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={r.rating} />
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                          <Flag size={9} className="mr-1" /> Flagged
                        </Badge>
                        {!r.isVisible && (
                          <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ Action Button — সঠিকভাবে toggle হচ্ছে */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVisibility(r.id, r.isVisible)}
                    disabled={isPending}
                    className={`gap-1.5 text-xs flex-shrink-0 ${
                      r.isVisible
                        ? "text-destructive border-destructive/30 hover:bg-destructive/5"
                        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    {r.isVisible
                      ? <><EyeOff size={12} /> Hide</>
                      : <><Eye size={12} /> Show</>}
                  </Button>
                </div>

                {r.comment && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-t border-border pt-3">
                    {r.comment}
                  </p>
                )}

                <p className="text-xs text-muted-foreground/60 mt-2">
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
  );
}


















// "use client";
// // src/app/(dashboardRoute)/admin/reviews/flagged/page.tsx
// // API: GET /api/admin/reviews/flagged | PATCH /api/admin/reviews/:id/visibility

// import { Star, Eye, EyeOff, Flag } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useFlaggedReviews, useReviewVisibility } from "@/hooks/admin/useAdminApi";

// function StarRating({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((s) => (
//         <Star key={s} size={12}
//           className={s <= rating ? "text-amber-400 fill-amber-400" : "text-muted fill-muted"}
//         />
//       ))}
//     </div>
//   );
// }

// export default function FlaggedReviewsPage() {
//   const { data, isLoading } = useFlaggedReviews();
//   const { mutate: setVisibility, isPending } = useReviewVisibility();

//   const reviews = data?.data ?? [];

//   function handleVisibility(id: string, isHidden: boolean) {
//     setVisibility(
//       { id, isHidden },
//       {
//         onSuccess: () => toast.success(isHidden ? "Review hidden" : "Review made visible"),
//         onError:   () => toast.error("Action failed"),
//       }
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Flagged Reviews</h1>
//         <p className="text-sm text-muted-foreground mt-1">
//           {data?.meta?.total ?? 0} reviews flagged by owners
//         </p>
//       </div>

//       {isLoading && (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
//         </div>
//       )}

//       {!isLoading && reviews.length === 0 && (
//         <div className="text-center py-20">
//           <Flag size={40} className="text-muted-foreground/20 mx-auto mb-3" />
//           <p className="text-muted-foreground text-sm">No flagged reviews</p>
//         </div>
//       )}

//       {!isLoading && reviews.length > 0 && (
//         <div className="space-y-3">
//           {reviews.map((r) => (
//             <Card key={r.id} className={`shadow-none ${!r.isVisible ? "opacity-60" : ""}`}>
//               <CardContent className="p-5">
//                 <div className="flex items-start justify-between gap-4">
//                   {/* Left */}
//                   <div className="flex items-start gap-3">
//                     <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-sm font-bold flex-shrink-0">
//                       {r.user.name[0]?.toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="text-sm font-semibold">{r.user.name}</p>
//                       <p className="text-xs text-muted-foreground">{r.property.title} — {r.property.area}, {r.property.city}</p>
//                       <div className="flex items-center gap-2 mt-1">
//                         <StarRating rating={r.rating} />
//                         <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
//                           <Flag size={9} className="mr-1" /> Flagged
//                         </Badge>
//                         {!r.isVisible && (
//                           <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
//                             Hidden
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Action */}
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleVisibility(r.id, r.isVisible)}
//                     disabled={isPending}
//                     className={`gap-1.5 text-xs flex-shrink-0 ${
//                       r.isVisible
//                         ? "text-destructive border-destructive/30 hover:bg-destructive/5"
//                         : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
//                     }`}
//                   >
//                     {r.isVisible
//                       ? <><EyeOff size={12} /> Hide</>
//                       : <><Eye size={12} /> Show</>}
//                   </Button>
//                 </div>

//                 {r.comment && (
//                   <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-t border-border pt-3">
//                     {r.comment}
//                   </p>
//                 )}

//                 <p className="text-xs text-muted-foreground/60 mt-2">
//                   {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }