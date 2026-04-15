"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(
  () => import("@/components/user/DashboardContent"),
  { ssr: false }
);

export default function UserDashboardPage() {
  return <DashboardContent />;
}