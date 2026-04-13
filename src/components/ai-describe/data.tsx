// ─────────────────────────────────────────────────────────────────────────────
// Static Data — RentHome landing page
// ─────────────────────────────────────────────────────────────────────────────
import {
  Users,
  Home,
  ShieldCheck,
  Lock,
  CreditCard,
  ClipboardList,
  Bell,
  Star,
  BarChart3,
  Layers,
} from "lucide-react";
import type { StatItem, RoleCard, WorkflowStep, FeatureBlock } from "./types";

export const STATS: StatItem[] = [
  { value: 3,   suffix: " Roles",   label: "User Roles",        icon: <Users className="h-4 w-4" /> },
  { value: 5,   suffix: " Steps",   label: "Booking Lifecycle",  icon: <ClipboardList className="h-4 w-4" /> },
  { value: 18,  suffix: " APIs",    label: "Integration Points", icon: <Layers className="h-4 w-4" /> },
  { value: 100, suffix: "%",        label: "Role-Based Access",  icon: <Lock className="h-4 w-4" /> },
];

export const ROLES: RoleCard[] = [
  {
    icon: <Users className="h-6 w-6" />,
    role: "USER",
    tagline: "Tenant / Renter",
    color: "from-emerald-950/70 to-emerald-900/40",
    borderColor: "border-emerald-700/35",
    glowColor: "bg-emerald-500/8",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-600/30",
    capabilities: [
      "Browse and filter properties",
      "View property details",
      "Create booking requests",
      "Complete Stripe payments",
      "Submit reviews & ratings",
      "Receive real-time notifications",
    ],
    apis: [
      "GET /api/properties",
      "POST /api/bookings",
      "POST /api/payments/create-intent",
      "POST /api/reviews",
    ],
  },
  {
    icon: <Home className="h-6 w-6" />,
    role: "OWNER",
    tagline: "Property Landlord",
    color: "from-sky-950/70 to-sky-900/40",
    borderColor: "border-sky-700/35",
    glowColor: "bg-sky-500/8",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-600/30",
    capabilities: [
      "Create & manage property listings",
      "Upload property images",
      "Accept or decline bookings",
      "View performance statistics",
      "Manage owner profile",
    ],
    apis: [
      "POST /api/owner/properties",
      "GET /api/owner/bookings",
      "PATCH /api/owner/bookings/:id",
      "GET /api/owner/profile",
    ],
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    role: "ADMIN",
    tagline: "Platform Moderator",
    color: "from-violet-950/70 to-violet-900/40",
    borderColor: "border-violet-700/35",
    glowColor: "bg-violet-500/8",
    badgeColor: "bg-violet-500/15 text-violet-300 border-violet-600/30",
    capabilities: [
      "Approve or reject properties",
      "Ban or manage users",
      "Monitor all payments",
      "Manage reviews & content",
      "Access full analytics dashboard",
    ],
    apis: [
      "PATCH /api/admin/properties/:id/status",
      "PATCH /api/users/:id/ban",
      "GET /api/admin/payments",
      "GET /api/admin/analytics",
    ],
  },
];

export const WORKFLOW: WorkflowStep[] = [
  { actor: "OWNER",  action: "Create Property",    description: "Owner lists a new property with details, pricing, and photos." },
  { actor: "ADMIN",  action: "Approve Property",   description: "Admin reviews and approves the listing before it goes public." },
  { actor: "USER",   action: "Browse & Book",       description: "Tenant discovers the property and submits a booking request." },
  { actor: "OWNER",  action: "Accept Booking",      description: "Owner reviews the request and accepts the tenant." },
  { actor: "USER",   action: "Initiate Payment",    description: "Tenant creates a Stripe payment intent for the booking." },
  { actor: "USER",   action: "Confirm Payment",     description: "Stripe processes the payment; client confirms with backend." },
  { actor: "SYSTEM", action: "Booking Confirmed",   description: "System marks booking as CONFIRMED and triggers notifications." },
  { actor: "USER",   action: "Submit Review",       description: "After stay, tenant leaves a verified review on the property." },
];

export const FEATURES: FeatureBlock[] = [
  {
    icon: <Lock className="h-5 w-5 text-emerald-400" />,
    title: "Auth & Session",
    description: "BetterAuth handles sign-up, sign-in, and session cookies. Role is immutable post-registration.",
    tags: ["BetterAuth", "Session Cookies", "RBAC"],
    color: "border-emerald-700/30",
  },
  {
    icon: <CreditCard className="h-5 w-5 text-sky-400" />,
    title: "Stripe Payments",
    description: "Two-step payment flow: create intent → confirm. One payment per booking, enforced at API level.",
    tags: ["Stripe", "Payment Intent", "Webhook"],
    color: "border-sky-700/30",
  },
  {
    icon: <ClipboardList className="h-5 w-5 text-amber-400" />,
    title: "Booking Lifecycle",
    description: "Strict state machine: PENDING → ACCEPTED → PAYMENT_PENDING → CONFIRMED with cancellation support.",
    tags: ["State Machine", "Prisma", "Validation"],
    color: "border-amber-700/30",
  },
  {
    icon: <Bell className="h-5 w-5 text-violet-400" />,
    title: "Notifications",
    description: "Real-time notifications triggered on booking state changes, payment confirmation, and reviews.",
    tags: ["Real-time", "Mark Read", "Event-Driven"],
    color: "border-violet-700/30",
  },
  {
    icon: <Star className="h-5 w-5 text-rose-400" />,
    title: "Review System",
    description: "One verified review per booking. Reviews are tied to confirmed bookings only.",
    tags: ["One-per-booking", "Verified", "Ratings"],
    color: "border-rose-700/30",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-teal-400" />,
    title: "Admin Analytics",
    description: "Full platform dashboard: active listings, booking rates, payment volumes, user stats.",
    tags: ["Dashboard", "Admin Only", "Analytics"],
    color: "border-teal-700/30",
  },
];

export const BOOKING_STATUSES = [
  { label: "PENDING",         color: "bg-amber-500/20 text-amber-300 border-amber-600/30" },
  { label: "ACCEPTED",        color: "bg-sky-500/20 text-sky-300 border-sky-600/30" },
  { label: "PAYMENT_PENDING", color: "bg-violet-500/20 text-violet-300 border-violet-600/30" },
  { label: "CONFIRMED",       color: "bg-emerald-500/20 text-emerald-300 border-emerald-600/30" },
  { label: "DECLINED",        color: "bg-rose-500/20 text-rose-300 border-rose-600/30" },
  { label: "CANCELLED",       color: "bg-slate-500/20 text-slate-300 border-slate-600/30" },
];

export const TECH_STACK = [
  { label: "Next.js",      sub: "Frontend / App Router" },
  { label: "Express + TS", sub: "Backend API"           },
  { label: "PostgreSQL",   sub: "Database"              },
  { label: "Prisma",       sub: "ORM"                   },
  { label: "BetterAuth",   sub: "Authentication"        },
  { label: "Stripe",       sub: "Payments"              },
];

export const ACTOR_COLORS: Record<WorkflowStep["actor"], string> = {
  OWNER:  "bg-sky-500/20 text-sky-300 border-sky-600/30",
  ADMIN:  "bg-violet-500/20 text-violet-300 border-violet-600/30",
  USER:   "bg-emerald-500/20 text-emerald-300 border-emerald-600/30",
  SYSTEM: "bg-amber-500/20 text-amber-300 border-amber-600/30",
};