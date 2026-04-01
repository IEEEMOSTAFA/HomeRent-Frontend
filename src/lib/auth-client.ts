
// Tested file:::


import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  fetchOptions: {
    credentials: "include",
  },
});

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
};