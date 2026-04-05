// src/app/(dashboardRoute)/owner/layout.tsx

import { ownerRoutes } from "@/constants/ownerRoutes";
import OwnerSidebar from "./_components/OwnerSidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <OwnerSidebar routes={ownerRoutes} />
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}