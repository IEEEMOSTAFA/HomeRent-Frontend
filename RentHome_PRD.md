Understood. Below is a **clean, industry-standard, English PRD (execution-focused)** tailored for your RentHome platform. It is optimized for **engineering, API integration, and frontend alignment**—not just documentation.

---

# 🏠 RentHome — Product Requirements Document (Execution Version)

**Architecture:** Full-Stack Web Application
**Frontend:** Next.js
**Backend:** Express + TypeScript
**Database:** PostgreSQL + Prisma
**Auth:** BetterAuth
**Payments:** Stripe

---

# 1. 🎯 Objective

RentHome is a **rental marketplace platform** that enables:

* Property owners to list and manage rental properties
* Users to discover, book, and pay for properties
* Admins to moderate and control the platform

The system enforces a **structured booking lifecycle with payment validation and role-based access control**.

---

# 2. 👥 User Roles & Responsibilities

## 2.1 USER (Tenant)

**Capabilities:**

* Browse and filter properties
* View property details
* Create booking requests
* Complete payments
* Submit reviews
* Receive notifications

**Primary APIs:**

```
GET    /api/properties
GET    /api/properties/:id
POST   /api/bookings
GET    /api/bookings
POST   /api/payments/create-intent
POST   /api/payments/confirm
POST   /api/reviews
GET    /api/notifications
```

---

## 2.2 OWNER (Landlord)

**Capabilities:**

* Create, update, delete property listings
* Manage bookings (accept/decline)
* View performance and stats
* Manage profile

**Primary APIs:**

```
POST   /api/owner/properties
GET    /api/owner/properties
PUT    /api/owner/properties/:id
DELETE /api/owner/properties/:id

GET    /api/owner/bookings
PATCH  /api/owner/bookings/:id

GET    /api/owner/profile
PATCH  /api/owner/profile
```

---

## 2.3 ADMIN

**Capabilities:**

* Approve/reject properties
* Manage users (ban/delete)
* Monitor payments
* Manage reviews and content
* Access analytics dashboard

**Primary APIs:**

```
GET    /api/admin/properties/pending
PATCH  /api/admin/properties/:id/status

GET    /api/users
PATCH  /api/users/:id/ban

GET    /api/admin/payments
POST   /api/admin/payments/:id/refund

GET    /api/admin/analytics
```

---

# 3. 🔐 Authentication & Session Flow

**Auth APIs:**

```
POST /api/auth/sign-up/email
POST /api/auth/sign-in/email
POST /api/auth/sign-out
GET  /api/auth/get-session
```

**Flow:**

1. User registers with role (USER or OWNER)
2. User logs in → session cookie issued
3. All protected APIs require session cookie
4. Role-based middleware enforces access control

---

# 4. 🔄 End-to-End System Workflow

## Core Lifecycle

```
OWNER → Create Property
        ↓
ADMIN → Approve Property
        ↓
USER → Browse Property
        ↓
USER → Create Booking
        ↓
OWNER → Accept Booking
        ↓
USER → Initiate Payment
        ↓
USER → Confirm Payment
        ↓
SYSTEM → Booking Confirmed
        ↓
USER → Submit Review
```

---

# 5. 📦 Booking Lifecycle

## Status Flow

```
PENDING → ACCEPTED → PAYMENT_PENDING → CONFIRMED
        ↘ DECLINED
PENDING/ACCEPTED → CANCELLED
```

**Rules:**

* Booking must be accepted before payment
* Payment required for confirmation
* User can cancel before payment
* One payment per booking (enforced)

---

# 6. 💳 Payment Flow (Stripe Integration)

## Step-by-Step

### 1. Create Payment Intent

```
POST /api/payments/create-intent
```

**Input:**

```json
{
  "bookingId": "booking_id"
}
```

**Output:**

```json
{
  "clientSecret": "pi_secret",
  "paymentId": "payment_id"
}
```

---

### 2. Confirm Payment

```
POST /api/payments/confirm
```

**Input:**

```json
{
  "paymentId": "payment_id",
  "stripePaymentIntentId": "pi_xxx"
}
```

---

### 3. System Outcome

* Payment status → SUCCESS
* Booking status → CONFIRMED
* Notification triggered

---

# 7. 🧪 API Execution Flow (Postman + Frontend)

## Recommended Testing Order

```
1.  Register (USER / OWNER / ADMIN)
2.  Login (OWNER)
3.  Upload images
4.  Create property
5.  Login (ADMIN)
6.  Approve property
7.  Login (USER)
8.  Browse properties
9.  View property details
10. Create booking
11. Login (OWNER)
12. Accept booking
13. Login (USER)
14. Create payment intent
15. Confirm payment
16. Submit review
17. Fetch notifications
18. Admin analytics
```

---

# 8. 🧩 Frontend Integration Mapping

## 8.1 Authentication (Signup/Login)

```
POST /api/auth/sign-up/email
POST /api/auth/sign-in/email
```

---

## 8.2 Property Listing Page

```
GET /api/properties
```

Supports query params:

```
city, area, minRent, maxRent, bedrooms, sort, page
```

---

## 8.3 Property Details Page

```
GET /api/properties/:id
```

---

## 8.4 Booking Action

```
POST /api/bookings
```

---

## 8.5 Payment UI Flow

```
POST /api/payments/create-intent
→ Stripe UI (client)
→ POST /api/payments/confirm
```

---

## 8.6 Review Submission

```
POST /api/reviews
```

---

## 8.7 Notifications Panel

```
GET /api/notifications
PATCH /api/notifications/mark-all-read
```

---

# 9. 🧠 Architecture Guidelines

## Backend

* Layered architecture (Controller → Service → Repository)
* Role-based middleware (RBAC)
* Prisma ORM with strict typing
* Centralized error handling
* Validation using Zod or equivalent

## Frontend (Next.js)

* App Router architecture
* Server Components for data fetching
* Client Components for interaction
* Global auth session management
* API abstraction layer (hooks/services)

---

# 10. ⚠️ Critical Constraints

* Role is immutable after registration (except Admin override)
* Only Admin can approve properties
* Only accepted bookings can proceed to payment
* One review per booking
* One payment per booking
* Banned users cannot access protected routes

---

# 11. 🚀 MVP Scope (Minimum Launch Features)

To ship the first production version, implement:

* Authentication system
* Owner property CRUD
* Admin property approval
* Public property browsing
* Booking system
* Stripe payment integration
* Review system

---

# 12. ✅ Engineering Checklist

* [ ] Authentication & session handling working
* [ ] Role-based access control enforced
* [ ] Property lifecycle (create → approve → publish)
* [ ] Booking lifecycle functioning correctly
* [ ] Payment integration stable
* [ ] Review system validated
* [ ] Notification system working
* [ ] Admin dashboard operational

---

# 13. 📌 Key Development Focus

At your current stage:

1. **Frontend–Backend Integration**
2. **Booking → Payment → Confirmation pipeline**
3. **Session handling (cookies)**
4. **Role-based UI rendering**
5. **Error handling and edge cases**




