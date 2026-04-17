// Test file: 

// src/lib/auth.ts
import { NextRequest, NextResponse } from "next/server";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "OWNER" | "ADMIN";
};

type Session = {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
  };
};

// BetterAuth এর API থেকে session পাওয়া
export async function getSession(req: NextRequest): Promise<Session | null> {
  try {
    // BetterAuth এর session endpoint এ কল
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    
    // Cookie গুলো forward করো
    const cookieHeader = req.headers.get("cookie") || "";
    
    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.session || !data.user) return null;
    
    return {
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as "USER" | "OWNER" | "ADMIN",
      },
      session: data.session,
    };
  } catch (error) {
    console.error("Session fetch error:", error);
    return null;
  }
}

// Middleware এর জন্য helper
export async function requireAuth(req: NextRequest, allowedRoles?: ("USER" | "OWNER" | "ADMIN")[]) {
  const session = await getSession(req);
  
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  
  return null;
}



