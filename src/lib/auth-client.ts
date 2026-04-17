// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// ✅ Backend Express server URL (port 5000) — NOT the Next.js frontend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const authClient = createAuthClient({
  baseURL: BACKEND_URL, // ✅ KEY FIX: points to Express backend, not Next.js

  fetchOptions: {
    credentials: "include",
  },

  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: true,
        },
      },
    }),
  ],
});

// Optional: Export improved User type
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "USER" | "OWNER" | "ADMIN";
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
};




















