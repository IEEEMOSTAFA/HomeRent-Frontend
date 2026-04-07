// src/app/(dashboardRoute)/admin/layout.tsx

import AdminSidebar from "@/components/Admin/AdminSidebar";
import { adminRoutes } from "@/routes/adminRoutes";

// import { adminRoutes } from "@/constants/adminRoutes";
// import AdminSidebar from "./_components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar routes={adminRoutes} />
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}