
import { Suspense } from "react";
import NewReviewForm from "./NewReviewForm";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
              <NewReviewForm></NewReviewForm>
    </Suspense>
  );
}