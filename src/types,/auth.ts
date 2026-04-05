// ============================================================
// types/auth.ts
// BetterAuth + RentHome — Authentication & Session Types
// Backend: better-auth + schema.prisma User model
// ============================================================

// ─── ENUMS ────────────────────────────────────────────────────────────────────

/**
 * UserRole — schema.prisma থেকে exact match
 * Registration-এ set হয়, শুধু Admin change করতে পারে
 */
export type UserRole = "ADMIN" | "OWNER" | "USER";

// ─── CORE USER ────────────────────────────────────────────────────────────────

/**
 * AuthUser — BetterAuth session.user থেকে আসে
 * backend: auth.ts → verifyAuth middleware-এ req.user হিসেবে attach হয়
 * frontend: useSession() hook বা /api/auth/get-session থেকে পাবে
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;         // Cloudinary URL অথবা null
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;            // ISO date string
  updatedAt: string;
}

/**
 * Session — BetterAuth session object
 * GET /api/auth/get-session থেকে পাওয়া response
 */
export interface AuthSession {
  user: AuthUser;
  session: {
    id: string;
    token: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ─── AUTH FORMS ───────────────────────────────────────────────────────────────

/**
 * RegisterInput — POST /api/auth/sign-up/email
 * Frontend registration form-এ এই data পাঠাতে হবে
 * Note: role হবে "USER" অথবা "OWNER" (ADMIN দেওয়া যাবে না)
 */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "USER" | "OWNER";       // Frontend-এ শুধু এই দুটো option
}

/**
 * LoginInput — POST /api/auth/sign-in/email
 */
export interface LoginInput {
  email: string;
  password: string;
}

// ─── AUTH API RESPONSES ───────────────────────────────────────────────────────

/**
 * AuthResponse — BetterAuth sign-in / sign-up এর response
 */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/**
 * Standard API error response shape
 * backend সব error এই format-এ পাঠায়
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
}

/**
 * Standard API success response (generic wrapper)
 * T = actual data type
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── PROFILE UPDATE ───────────────────────────────────────────────────────────

/**
 * UpdateProfileInput — PATCH /api/users/me
 * User নিজের profile update করতে পারবে
 */
export interface UpdateProfileInput {
  name?: string;
  image?: string;               // Cloudinary URL (আগে upload করতে হবে)
}

/**
 * ChangeRoleInput — PATCH /api/users/me/role
 * User নিজে role change করতে পারে (USER → OWNER)
 */
export interface ChangeRoleInput {
  role: "USER" | "OWNER";
}

// ─── NEXT.JS MIDDLEWARE ───────────────────────────────────────────────────────

/**
 * DecodedToken — frontend middleware.ts-এ JWT payload decode করলে এই shape পাবে
 * middleware.ts এ decodeSession() function এটা return করে
 */
export interface DecodedToken {
  sub: string;                  // user.id
  role: UserRole;
  email?: string;
  iat?: number;
  exp?: number;
}

// ─── PROTECTED ROUTE HELPERS ──────────────────────────────────────────────────

/**
 * Route guard কোন role কোন path access করতে পারবে
 * middleware.ts config-এর সাথে match করা
 */
export const ROLE_ROUTES: Record<UserRole, string> = {
  ADMIN: "/admin",
  OWNER: "/owner",
  USER:  "/user",
} as const;

/**
 * Helper — user কি ADMIN?
 */
export const isAdmin = (user: AuthUser | null | undefined): boolean =>
  user?.role === "ADMIN";

/**
 * Helper — user কি OWNER?
 */
export const isOwner = (user: AuthUser | null | undefined): boolean =>
  user?.role === "OWNER";

/**
 * Helper — user কি regular USER?
 */
export const isUser = (user: AuthUser | null | undefined): boolean =>
  user?.role === "USER";

/**
 * Helper — user active আছে এবং banned না?
 */
export const isActiveUser = (user: AuthUser | null | undefined): boolean =>
  !!user && user.isActive && !user.isBanned && user.emailVerified;