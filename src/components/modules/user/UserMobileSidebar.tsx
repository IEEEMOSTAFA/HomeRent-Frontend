"use client";
// src/components/user/UserMobileSidebar.tsx

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserSidebar } from "./UserSidebar";

interface UserMobileSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export function UserMobileSidebar({ user }: UserMobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <UserSidebar user={user} />
      </SheetContent>
    </Sheet>
  );
}