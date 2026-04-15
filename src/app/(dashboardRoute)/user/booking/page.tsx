// // src/app/(dashboardRoute)/user/booking/page.tsx

// import { Suspense } from "react";
// import BookingPageClient from "./BookingPageClient";

// export default function BookingPage() {
//   return (
//     <Suspense fallback={<div className="min-h-screen bg-[#0a0f1e]" />}>
//       <BookingPageClient />
//     </Suspense>
//   );
// }





















// src/app/(dashboardRoute)/user/booking/page.tsx

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { Suspense } from "react";
import BookingPageClient from "./BookingPageClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f1e]" />}>
      <BookingPageClient />
    </Suspense>
  );
}