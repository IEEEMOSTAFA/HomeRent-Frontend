// Tested file:
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  
  const session = allCookies.find(
    (c) => c.name.includes("better-auth") || c.name.includes("session")
  );

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Decode session to extract user role
  const userRole = decodeSession(session.value)?.role;

  // Role-based access control
  const url = req.nextUrl.pathname;
  if (url.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (url.startsWith("/owner") && userRole !== "OWNER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (url.startsWith("/user") && userRole !== "USER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

function decodeSession(sessionValue: string) {
  try {
    return JSON.parse(atob(sessionValue.split(".")[1])); // Decode JWT payload
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/user/:path*",
    "/owner/:path*",
    "/admin/:path*",
    "/booking/:path*",
  ],
};