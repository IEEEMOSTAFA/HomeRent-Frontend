





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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/:path*",
    "/owner/:path*",
    "/admin/:path*",
    "/booking/:path*",
  ],
};