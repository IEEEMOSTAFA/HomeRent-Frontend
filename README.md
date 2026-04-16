# 🏠 HomeRent — Rental Marketplace Platform

<div align="center">

![HomeRent Banner](https://res.cloudinary.com/dldqjm9da/image/upload/v1775882623/homerent/properties/x0visc67d5pqiufymdgh.jpg)

**A full-stack rental property marketplace — Find, Book, and Pay for your next home.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-4f46e5?style=for-the-badge)](https://home-rent-frontend.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️_Backend_API-Render-22c55e?style=for-the-badge)](https://homerentbackend.onrender.com)
[![Frontend Repo](https://img.shields.io/badge/💻_Frontend-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/IEEEMOSTAFA/HomeRent-Frontend)
[![Backend Repo](https://img.shields.io/badge/🔧_Backend-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/IEEEMOSTAFA/HomeRentBackend)

</div>

---

## 📌 What is HomeRent?

**HomeRent** is a rental marketplace platform that connects **Property Owners** with **Tenants**. Owners list properties, Admins approve them, and Users can browse, book, and pay — all in one place.

> Think of it like Airbnb — but focused on long-term home rentals with a full booking and payment lifecycle.

---

## 🧑‍🤝‍🧑 Who Uses HomeRent?

| Role | Who They Are | What They Can Do |
|------|-------------|-----------------|
| 👤 **USER** | Tenant / Renter | Browse properties, create bookings, make payments, write reviews |
| 🏠 **OWNER** | Landlord | List properties, manage bookings (accept/decline) |
| 🛡️ **ADMIN** | Platform Manager | Approve properties, manage users, monitor payments, view analytics |

---

## 🔄 How the Full System Works (Big Picture)

```
OWNER creates property
       ↓
ADMIN approves it
       ↓
USER browses & views property
       ↓
USER creates a booking (status: PENDING)
       ↓
OWNER accepts booking (status: ACCEPTED)
       ↓
USER pays via Stripe (status: PAYMENT_PENDING → CONFIRMED)
       ↓
USER writes a review
```

---

## 📦 Booking Status Lifecycle

```
PENDING ──→ ACCEPTED ──→ PAYMENT_PENDING ──→ CONFIRMED
         ↘ DECLINED
PENDING / ACCEPTED ──→ CANCELLED
```

**Key Rules:**
- ✅ Booking must be **accepted** before payment can proceed
- ✅ Only **one payment** allowed per booking
- ✅ Only **one review** allowed per booking
- ✅ Cancelled bookings cannot be paid

---

## 💳 Payment Flow (Stripe)

```
Step 1: POST /api/payments/create-intent
        → Returns { clientSecret, paymentId }

Step 2: Stripe UI collects card info on the frontend

Step 3: POST /api/payments/confirm
        → Sends { paymentId, stripePaymentIntentId }

Result: Booking status → CONFIRMED ✅
        Notification sent to both USER and OWNER
```

---

## 🌐 API Reference

### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| `POST` | `/api/auth/sign-up/email` | Register a new user (USER or OWNER) | ❌ |
| `POST` | `/api/auth/sign-in/email` | Login and receive session cookie | ❌ |
| `POST` | `/api/auth/sign-out` | Logout and clear session | ✅ |
| `GET`  | `/api/auth/get-session` | Get current logged-in user info | ✅ |

---

### 🏘️ Properties — Public

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/properties` | List all approved properties | `city`, `area`, `minRent`, `maxRent`, `bedrooms`, `sort`, `page` |
| `GET` | `/api/properties/:id` | Get single property details | — |

---

### 🏠 Owner APIs

> 🔒 Requires login as **OWNER**

#### Property Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/api/owner/properties`       | Create a new property listing |
| `GET`    | `/api/owner/properties`       | Get all my listed properties  |
| `PUT`    | `/api/owner/properties/:id`   | Update an existing listing    |
| `DELETE` | `/api/owner/properties/:id`   | Delete a property listing     |

#### Booking Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/owner/bookings`     | View all booking requests for my properties |
| `PATCH` | `/api/owner/bookings/:id` | Accept or decline a booking request         |

#### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/owner/profile` | View owner profile   |
| `PATCH` | `/api/owner/profile` | Update owner profile |

---

### 📅 Bookings — User

> 🔒 Requires login as **USER**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings` | Create a new booking request (status: `PENDING`) |
| `GET`  | `/api/bookings` | View all my bookings and their statuses          |

---

### 💰 Payments — User

> 🔒 Requires login as **USER** · Booking must be in `ACCEPTED` status

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| `POST` | `/api/payments/create-intent` | Create a Stripe payment intent | Returns `clientSecret` + `paymentId` |
| `POST` | `/api/payments/confirm`       | Confirm payment after Stripe UI | Booking moves to `CONFIRMED` |

---

### ⭐ Reviews

> 🔒 Requires login as **USER** · Booking must be `CONFIRMED`

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| `POST` | `/api/reviews` | Submit a review for a completed booking | One review per booking only |

---

### 🔔 Notifications

> 🔒 Requires login (any role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/notifications`               | Get all my notifications       |
| `PATCH` | `/api/notifications/mark-all-read` | Mark all notifications as read |

---

### 🛡️ Admin APIs

> 🔒 Requires login as **ADMIN**

#### Property Moderation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/admin/properties/pending`    | List all properties awaiting approval |
| `PATCH` | `/api/admin/properties/:id/status` | Approve or reject a property          |

#### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/users`         | Get all registered users |
| `PATCH` | `/api/users/:id/ban` | Ban or unban a user      |

#### Payment Oversight

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/admin/payments`            | View all payment records |
| `POST` | `/api/admin/payments/:id/refund` | Issue a refund           |

#### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/analytics` | Platform-wide stats and analytics dashboard |

---

## 🧪 Step-by-Step Testing Guide

Follow this exact order to test the complete lifecycle end-to-end:

| Step | Role | Action | API |
|:----:|------|--------|-----|
| 1  | —     | Register as OWNER        | `POST /api/auth/sign-up/email` |
| 2  | OWNER | Login                    | `POST /api/auth/sign-in/email` |
| 3  | OWNER | Create a property        | `POST /api/owner/properties` |
| 4  | —     | Login as ADMIN           | `POST /api/auth/sign-in/email` |
| 5  | ADMIN | Approve the property     | `PATCH /api/admin/properties/:id/status` |
| 6  | —     | Login as USER            | `POST /api/auth/sign-in/email` |
| 7  | USER  | Browse properties        | `GET /api/properties` |
| 8  | USER  | View property details    | `GET /api/properties/:id` |
| 9  | USER  | Create a booking         | `POST /api/bookings` |
| 10 | —     | Login as OWNER           | `POST /api/auth/sign-in/email` |
| 11 | OWNER | Accept the booking       | `PATCH /api/owner/bookings/:id` |
| 12 | —     | Login as USER            | `POST /api/auth/sign-in/email` |
| 13 | USER  | Create payment intent    | `POST /api/payments/create-intent` |
| 14 | USER  | Confirm payment          | `POST /api/payments/confirm` |
| 15 | USER  | Submit a review          | `POST /api/reviews` |
| 16 | USER  | Check notifications      | `GET /api/notifications` |
| 17 | ADMIN | View analytics dashboard | `GET /api/admin/analytics` |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js (App Router), Tailwind CSS, Framer Motion |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | BetterAuth (session cookies) |
| **Payments** | Stripe |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

## 🚀 Local Setup

### Backend
```bash
git clone https://github.com/IEEEMOSTAFA/HomeRentBackend
cd HomeRentBackend
npm install

# Create .env file
DATABASE_URL=your_postgres_url
STRIPE_SECRET_KEY=your_stripe_key
BETTER_AUTH_SECRET=your_secret
FRONTEND_URL=http://localhost:3000

npx prisma migrate dev
npm run dev
```

### Frontend
```bash
git clone https://github.com/IEEEMOSTAFA/HomeRent-Frontend
cd HomeRent-Frontend
npm install

# Create .env.local file
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

npm run dev
```

---

## ⚠️ Important Constraints

- 🔒 User **role cannot be changed** after registration (only Admin can override)
- 🏠 Only **Admin can approve** properties — owners cannot self-publish
- 💳 Payment only allowed on **ACCEPTED** bookings
- ⭐ Only **one review** per booking, after confirmation
- 🚫 **Banned users** cannot access any protected routes

---

## 📁 Project Links

| Resource | Link |
|----------|------|
| 🌐 Live Frontend | [home-rent-frontend.vercel.app](https://home-rent-frontend.vercel.app) |
| ⚙️ Backend API | [homerentbackend.onrender.com](https://homerentbackend.onrender.com) |
| 💻 Frontend GitHub | [IEEEMOSTAFA/HomeRent-Frontend](https://github.com/IEEEMOSTAFA/HomeRent-Frontend) |
| 🔧 Backend GitHub | [IEEEMOSTAFA/HomeRentBackend](https://github.com/IEEEMOSTAFA/HomeRentBackend) |

---

<div align="center">

Built with ❤️ by **IEEEMOSTAFA**

</div>