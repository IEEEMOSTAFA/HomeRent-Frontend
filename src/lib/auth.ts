// src/lib/auth.ts
import { NextRequest } from "next/server";

type SessionUser = {
  id: string;
  role: "USER" | "OWNER" | "ADMIN";
};

type Session = {
  user: SessionUser;
};

export async function getSession(
  req: NextRequest
): Promise<Session | null> {
  const token = req.cookies.get("access_token")?.value;

  if (!token) return null;

  // 🔐 Normally here you verify JWT / call auth server
  // Example mock (replace later with real verify)
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    return {
      user: {
        id: payload.sub,
        role: payload.role,
      },
    };
  } catch {
    return null;
  }
}