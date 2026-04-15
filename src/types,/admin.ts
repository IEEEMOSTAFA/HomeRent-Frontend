// ============================================================
// types/admin.ts
// RentHome — ADMIN Role (Platform Controller) Types
// ============================================================

import type { AuthUser } from "./auth";
import type {
  Property,
  // Booking,          // এখনো export নেই → আমরা local type define করব
  Payment,          // user.ts থেকে আছে
  Review,
} from "./user";
import type { OwnerProfile } from "./owner";
import { Booking } from "@/hooks/user/useUserApi";

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

export interface AdminUser extends AuthUser {
  ownerProfile: OwnerProfile | null;
  _count?: {
    bookings: number;
    properties: number;
    reviews: number;
    payments: number;
  };
}

export interface BanUserInput {
  isBanned: boolean;
  reason?: string;
}

export interface AdminUsersFilters {
  role?: "ADMIN" | "OWNER" | "USER";
  isBanned?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAdminUsers {
  data: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── PROPERTY MODERATION ──────────────────────────────────────────────────────

export interface PendingProperty extends Omit<Property, "owner"> {
  owner: Pick<AuthUser, "id" | "name" | "email" | "image"> & {
    ownerProfile: Pick<OwnerProfile, "verified" | "phone" | "nidNumber"> | null;
  };
}

export interface UpdatePropertyStatusInput {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

// ─── OWNER VERIFICATION ───────────────────────────────────────────────────────

export interface UnverifiedOwner {
  id: string;
  userId: string;
  phone: string | null;
  nidNumber: string | null;
  verified: boolean;
  createdAt: string;

  user: Pick<AuthUser, "id" | "name" | "email" | "image">;
}

export interface VerifyOwnerInput {
  verified: boolean;
}

// ─── REVIEW MANAGEMENT ────────────────────────────────────────────────────────

export interface FlaggedReview extends Omit<Review, "property"> {
  user: Pick<AuthUser, "id" | "name" | "image">;
  property: Pick<Property, "id" | "title" | "images" | "city" | "area">;
  booking: Pick<Booking, "id" | "status">;
}

export interface ReviewVisibilityInput {
  isHidden: boolean;
}

export interface AdminReviewFilters {
  isFlagged?: boolean;
  isVisible?: boolean;
  propertyId?: string;
  page?: number;
  limit?: number;
}

// ─── PAYMENT MANAGEMENT ───────────────────────────────────────────────────────

/** 
 * AdminPayment — আমরা UserPayment export না থাকায় নিজে define করছি 
 */
export interface AdminPayment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: Payment["status"];           // user.ts থেকে Payment এর status নিলাম
  stripePaymentIntentId: string | null;
  receiptUrl: string | null;
  refundAmount: number | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;

  user: Pick<AuthUser, "id" | "name" | "email">;

  booking: {
    id: string;
    status: string;
    moveInDate?: string;
    totalAmount: number;
    propertyId: string;
    property: Pick<Property, "id" | "title" | "city" | "area">;
  } | null;
}

export interface AdminPaymentsFilters {
  status?: Payment["status"];
  page?: number;
  limit?: number;
}

export interface RefundPaymentInput {
  reason: string;
}

// ─── BLOG MANAGEMENT ──────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: Pick<AuthUser, "id" | "name" | "image">;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  tags?: string[];
  isPublished?: boolean;
}

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

export interface PublishBlogPostInput {
  isPublished: boolean;
}

export type PublicBlogPost = Omit<BlogPost, "authorId"> & {
  author: Pick<AuthUser, "id" | "name" | "image">;
};

// ─── ANALYTICS DASHBOARD ──────────────────────────────────────────────────────

export interface AdminAnalytics {
  totalUsers: number;
  totalOwners: number;
  totalAdmins: number;
  bannedUsers: number;
  newUsersThisMonth: number;

  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;

  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;

  totalRevenue: number;
  revenueThisMonth: number;
  totalRefunds: number;

  totalReviews: number;
  flaggedReviews: number;
  hiddenReviews: number;

  verifiedOwners: number;
  unverifiedOwners: number;
}

// ─── NOTIFICATION MANAGEMENT ──────────────────────────────────────────────────

export interface SendNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: "booking_update" | "payment" | "review" | "system";
  actionUrl?: string;
}







// // ============================================================
// // types/admin.ts
// // RentHome — ADMIN Role (Platform Controller) Types
// // Routes: /api/admin/*, /api/users (admin), /api/reviews (admin)
// // ============================================================

// import type { AuthUser } from "./auth";
// import type {
//   Property,
//   PropertyStatus,
//   Booking,
//   UserPayment,
//   PaymentStatus,
//   Review,
//   NotificationType,
// } from "./user";
// import type { OwnerProfile } from "./owner";

// // ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

// /**
//  * AdminUser — Admin-এর users list-এ দেখা যাবে (full details)
//  * GET /api/users (Admin only)
//  */
// export interface AdminUser extends AuthUser {
//   ownerProfile: OwnerProfile | null; // OWNER হলে থাকবে, USER/ADMIN হলে null
//   _count?: {
//     bookings: number;
//     properties: number;
//     reviews: number;
//     payments: number;
//   };
// }

// /**
//  * BanUserInput — PATCH /api/users/:id/ban
//  * User ban অথবা unban করতে
//  */
// export interface BanUserInput {
//   isBanned: boolean;
//   reason?: string;              // Optional — কেন ban করা হচ্ছে
// }

// /**
//  * AdminUsersFilters — GET /api/users query params
//  */
// export interface AdminUsersFilters {
//   role?: "ADMIN" | "OWNER" | "USER";
//   isBanned?: boolean;
//   isActive?: boolean;
//   search?: string;              // name বা email দিয়ে search
//   page?: number;
//   pageSize?: number;
// }

// /**
//  * PaginatedAdminUsers — User list-এর paginated response
//  */
// export interface PaginatedAdminUsers {
//   data: AdminUser[];
//   total: number;
//   page: number;
//   pageSize: number;
//   totalPages: number;
// }

// // ─── PROPERTY MODERATION ──────────────────────────────────────────────────────

// /**
//  * PendingProperty — Admin-এর review queue-এ থাকা properties
//  * GET /api/admin/properties/pending
//  */
// export interface PendingProperty extends Property {
//   owner: Pick<AuthUser, "id" | "name" | "email" | "image"> & {
//     ownerProfile: Pick<OwnerProfile, "verified" | "phone" | "nidNumber"> | null;
//   };
// }

// /**
//  * UpdatePropertyStatusInput — PATCH /api/admin/properties/:id/status
//  * Admin property approve অথবা reject করবে
//  */
// export interface UpdatePropertyStatusInput {
//   status: "APPROVED" | "REJECTED";
//   rejectionReason?: string;     // REJECTED হলে required
// }

// // ─── OWNER VERIFICATION ───────────────────────────────────────────────────────

// /**
//  * UnverifiedOwner — Admin-এর verification queue
//  * GET /api/admin/owners/unverified
//  */
// export interface UnverifiedOwner {
//   id: string;                   // OwnerProfile id
//   userId: string;
//   phone: string | null;
//   nidNumber: string | null;
//   verified: boolean;
//   createdAt: string;

//   user: Pick<AuthUser, "id" | "name" | "email" | "image">;
// }

// /**
//  * VerifyOwnerInput — PATCH /api/admin/owners/:id/verify
//  * :id হলো OwnerProfile.id (User.id নয়)
//  */
// export interface VerifyOwnerInput {
//   verified: boolean;
// }

// // ─── REVIEW MANAGEMENT ────────────────────────────────────────────────────────

// /**
//  * FlaggedReview — Owner flag করা reviews-এর list
//  * GET /api/admin/reviews/flagged
//  */
// export interface FlaggedReview extends Review {
//   user: Pick<AuthUser, "id" | "name" | "image">;
//   property: Pick<Property, "id" | "title" | "city" | "area">;
//   booking: Pick<Booking, "id" | "status">;
// }

// /**
//  * ReviewVisibilityInput — PATCH /api/admin/reviews/:id/visibility
//  * PATCH /api/admin/reviews/:id/hide (same, alias)
//  */
// export interface ReviewVisibilityInput {
//   isHidden: boolean;
// }

// /**
//  * AdminReviewFilters — GET /api/reviews query params (Admin)
//  */
// export interface AdminReviewFilters {
//   isFlagged?: boolean;
//   isVisible?: boolean;
//   propertyId?: string;
//   page?: number;
//   limit?: number;
// }

// // ─── PAYMENT MANAGEMENT ───────────────────────────────────────────────────────

// /**
//  * AdminPayment — Admin-এর payments list (all users)
//  * GET /api/admin/payments
//  */
// export interface AdminPayment extends UserPayment {
//   user: Pick<AuthUser, "id" | "name" | "email">;
//   booking: Pick<
//     Booking,
//     "id" | "status" | "moveInDate" | "totalAmount" | "propertyId"
//   > & {
//     property: Pick<Property, "id" | "title" | "city" | "area">;
//   };
// }

// /**
//  * AdminPaymentsFilters — GET /api/admin/payments query params
//  */
// export interface AdminPaymentsFilters {
//   status?: PaymentStatus;
//   page?: number;
//   limit?: number;
// }

// /**
//  * RefundPaymentInput — POST /api/admin/payments/:id/refund
//  */
// export interface RefundPaymentInput {
//   reason: string;
// }

// // ─── BLOG MANAGEMENT ──────────────────────────────────────────────────────────

// /**
//  * BlogPost — Admin-এর blog post
//  * GET /api/admin/blog, GET /api/blog (public published only)
//  */
// export interface BlogPost {
//   id: string;
//   authorId: string;

//   title: string;
//   slug: string;                 // URL-friendly unique identifier
//   excerpt: string;
//   content: string;
//   featuredImage: string | null; // Cloudinary URL
//   tags: string[];
//   isPublished: boolean;
//   publishedAt: string | null;

//   createdAt: string;
//   updatedAt: string;

//   author?: Pick<AuthUser, "id" | "name" | "image">;
// }

// /**
//  * CreateBlogPostInput — POST /api/admin/blog
//  */
// export interface CreateBlogPostInput {
//   title: string;
//   slug: string;
//   excerpt: string;
//   content: string;
//   featuredImage?: string;
//   tags?: string[];
//   isPublished?: boolean;
// }

// /**
//  * UpdateBlogPostInput — PATCH /api/admin/blog/:id
//  */
// export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

// /**
//  * PublishBlogPostInput — PATCH /api/admin/blog/:id/publish
//  */
// export interface PublishBlogPostInput {
//   isPublished: boolean;
// }

// /**
//  * PublicBlogPost — Public route-এ দেখা যাবে (published only)
//  * GET /api/blog, GET /api/blog/:slug
//  */
// export type PublicBlogPost = Omit<BlogPost, "authorId"> & {
//   author: Pick<AuthUser, "id" | "name" | "image">;
// };

// // ─── ANALYTICS DASHBOARD ──────────────────────────────────────────────────────

// /**
//  * AdminAnalytics — GET /api/admin/analytics
//  * Admin dashboard-এর overview statistics
//  */
// export interface AdminAnalytics {
//   // Users
//   totalUsers: number;
//   totalOwners: number;
//   totalAdmins: number;
//   bannedUsers: number;
//   newUsersThisMonth: number;

//   // Properties
//   totalProperties: number;
//   approvedProperties: number;
//   pendingProperties: number;
//   rejectedProperties: number;

//   // Bookings
//   totalBookings: number;
//   confirmedBookings: number;
//   pendingBookings: number;
//   cancelledBookings: number;

//   // Revenue
//   totalRevenue: number;         // BDT
//   revenueThisMonth: number;
//   totalRefunds: number;

//   // Reviews
//   totalReviews: number;
//   flaggedReviews: number;
//   hiddenReviews: number;

//   // Owners
//   verifiedOwners: number;
//   unverifiedOwners: number;
// }

// // ─── NOTIFICATION MANAGEMENT ──────────────────────────────────────────────────

// /**
//  * SendNotificationInput — Admin system notification পাঠাতে পারবে
//  * (যদি backend এ এই feature add হয়)
//  */
// export interface SendNotificationInput {
//   userId: string;               // কাকে পাঠাবে
//   title: string;
//   message: string;
//   type: NotificationType;
//   actionUrl?: string;
// }