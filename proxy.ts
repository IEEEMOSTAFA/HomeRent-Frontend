import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const url = req.nextUrl.pathname;

  try {
    const rawCookieHeader = req.headers.get("cookie") || "";

    if (!rawCookieHeader) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const hasValidCookie =
      rawCookieHeader.includes("__Secure-better-auth.session_token=") ||
      (rawCookieHeader.includes("better-auth.session_token=") &&
        !rawCookieHeader.includes("better-auth.session_token=;"));

    if (!hasValidCookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    let cookieToSend = rawCookieHeader;
    try {
      cookieToSend = decodeURIComponent(rawCookieHeader);
    } catch {
      cookieToSend = rawCookieHeader;
    }

    const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie: cookieToSend,
        "Content-Type": "application/json",
        origin: process.env.NEXT_PUBLIC_APP_URL || "",
      },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const data = await sessionRes.json();

    if (!data?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole: string = data.user.role;

    if (url.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (url.startsWith("/owner") && userRole !== "OWNER" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (url.startsWith("/user") && userRole !== "USER" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", data.user.id);
    requestHeaders.set("x-user-role", data.user.role);
    requestHeaders.set("x-user-email", data.user.email);
    requestHeaders.set("x-user-name", data.user.name || "");

    return NextResponse.next({
      request: { headers: requestHeaders },
    });

  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
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











// // testing file :
// // middleware.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(req: NextRequest) {
//   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
//   const url = req.nextUrl.pathname;

//   try {
//     const rawCookieHeader = req.headers.get("cookie") || "";

//     if (!rawCookieHeader) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     const hasValidCookie =
//       rawCookieHeader.includes("__Secure-better-auth.session_token=") ||
//       (rawCookieHeader.includes("better-auth.session_token=") &&
//         !rawCookieHeader.includes("better-auth.session_token=;"));

//     if (!hasValidCookie) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     let cookieToSend = rawCookieHeader;
//     try {
//       cookieToSend = decodeURIComponent(rawCookieHeader);
//     } catch {
//       cookieToSend = rawCookieHeader;
//     }

//     const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
//       method: "GET",
//       headers: {
//         cookie: cookieToSend,
//         "Content-Type": "application/json",
//         origin: process.env.NEXT_PUBLIC_APP_URL || "",
//       },
//       cache: "no-store",
//     });

//     if (!sessionRes.ok) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     const data = await sessionRes.json();

//     if (!data?.user) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     const userRole: string = data.user.role;

//     if (url.startsWith("/admin") && userRole !== "ADMIN") {
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     }
//     if (url.startsWith("/owner") && userRole !== "OWNER" && userRole !== "ADMIN") {
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     }
//     if (url.startsWith("/user") && userRole !== "USER" && userRole !== "ADMIN") {
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     }

//     const requestHeaders = new Headers(req.headers);
//     requestHeaders.set("x-user-id", data.user.id);
//     requestHeaders.set("x-user-role", data.user.role);
//     requestHeaders.set("x-user-email", data.user.email);
//     requestHeaders.set("x-user-name", data.user.name || "");

//     return NextResponse.next({
//       request: { headers: requestHeaders },
//     });

//   } catch (error) {
//     console.error("[Middleware] Error:", error);
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
// }

// export const config = {
//   matcher: [
//     "/user/:path*",
//     "/owner/:path*",
//     "/admin/:path*",
//     "/booking/:path*",
//   ],
// };


// // import { NextRequest, NextResponse } from "next/server";

// // export async function middleware(req: NextRequest) {
// //   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
// //   const url = req.nextUrl.pathname;

// //   try {
// //     // BetterAuth-এর নিজের endpoint দিয়ে session যাচাই করুন
// //     const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
// //       headers: {
// //         cookie: req.headers.get("cookie") || "",
// //       },
// //       cache: "no-store",
// //     });

// //     if (!sessionRes.ok) {
// //       return NextResponse.redirect(new URL("/login", req.url));
// //     }

// //     const data = await sessionRes.json();

// //     if (!data?.user) {
// //       return NextResponse.redirect(new URL("/login", req.url));
// //     }

// //     const userRole: string = data.user.role;

// //     // Role-based access control
// //     if (url.startsWith("/admin") && userRole !== "ADMIN") {
// //       return NextResponse.redirect(new URL("/unauthorized", req.url));
// //     }
// //     if (url.startsWith("/owner") && userRole !== "OWNER") {
// //       return NextResponse.redirect(new URL("/unauthorized", req.url));
// //     }
// //     if (url.startsWith("/user") && userRole !== "USER") {
// //       return NextResponse.redirect(new URL("/unauthorized", req.url));
// //     }

// //     return NextResponse.next();

// //   } catch (error) {
// //     console.error("Middleware error:", error);
// //     return NextResponse.redirect(new URL("/login", req.url));
// //   }
// // }

// // export const config = {
// //   matcher: [
// //     "/user/:path*",
// //     "/owner/:path*",
// //     "/admin/:path*",
// //     "/booking/:path*",
// //   ],
// // };