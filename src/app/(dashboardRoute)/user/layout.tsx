// src/app/(dashboardRoute)/user/layout.tsx

// import { userRoutes } from "@/constants/userRoutes";
import UserSidebar from "@/components/user/Usersidebar";
import { userRoutes } from "@/routes/userRoutes";
// import UserSidebar from "./_components/UserSidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <UserSidebar routes={userRoutes} />
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}