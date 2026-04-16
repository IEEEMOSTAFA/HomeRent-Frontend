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

## 🌐 API Reference (Key Endpoints)

### 🔐 Authentication
```http
POST /api/auth/sign-up/email     → Register new user
POST /api/auth/sign-in/email     → Login
POST /api/auth/sign-out          → Logout
GET  /api/auth/get-session       → Get current session
```

### 🏘️ Properties (Public)
```http
GET  /api/properties             → List all approved properties
     Query: city, area, minRent, maxRent, bedrooms, sort, page

GET  /api/properties/:id         → Single property details
```

### 🏠 Owner APIs
```http
POST   /api/owner/properties          → Create property listing
GET    /api/owner/properties          → My listings
PUT    /api/owner/properties/:id      → Update listing
DELETE /api/owner/properties/:id      → Delete listing

GET    /api/owner/bookings            → View all booking requests
PATCH  /api/owner/bookings/:id        → Accept or decline booking
```

### 📅 Bookings (User)
```http
POST /api/bookings               → Create a booking request
GET  /api/bookings               → View my bookings
```

### 💰 Payments (User)
```http
POST /api/payments/create-intent → Create Stripe payment intent
POST /api/payments/confirm       → Confirm payment after Stripe
```

### ⭐ Reviews
```http
POST /api/reviews                → Submit review (1 per booking)
```

### 🔔 Notifications
```http
GET   /api/notifications             → Get all notifications
PATCH /api/notifications/mark-all-read → Mark all as read
```

### 🛡️ Admin APIs
```http
GET   /api/admin/properties/pending         → Properties awaiting approval
PATCH /api/admin/properties/:id/status      → Approve or reject property

GET   /api/users                            → All users
PATCH /api/users/:id/ban                    → Ban a user

GET   /api/admin/payments                   → All payment records
POST  /api/admin/payments/:id/refund        → Issue refund

GET   /api/admin/analytics                  → Platform analytics dashboard
```

---

## 🧪 Step-by-Step Testing Guide (Postman / Frontend)

Follow this order to test the full lifecycle:

```
1.  Register as OWNER        → POST /api/auth/sign-up/email
2.  Login as OWNER           → POST /api/auth/sign-in/email
3.  Create a property        → POST /api/owner/properties
4.  Login as ADMIN           → POST /api/auth/sign-in/email
5.  Approve the property     → PATCH /api/admin/properties/:id/status
6.  Login as USER            → POST /api/auth/sign-in/email
7.  Browse properties        → GET /api/properties
8.  View property details    → GET /api/properties/:id
9.  Create a booking         → POST /api/bookings
10. Login as OWNER           → POST /api/auth/sign-in/email
11. Accept the booking       → PATCH /api/owner/bookings/:id
12. Login as USER            → POST /api/auth/sign-in/email
13. Create payment intent    → POST /api/payments/create-intent
14. Confirm payment          → POST /api/payments/confirm
15. Submit a review          → POST /api/reviews
16. Check notifications      → GET /api/notifications
17. Login as ADMIN           → Check analytics dashboard
```

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