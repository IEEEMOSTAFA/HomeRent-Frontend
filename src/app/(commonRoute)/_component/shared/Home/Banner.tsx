import { Button } from "@/components/ui/button";
import Link from "next/link";
// import Button4 from "./Button4";
// import MotionCar from "./MotionCar";

const endpoints = [
  { method: "POST", path: "/auth/login",   color: "bg-blue-500/15 text-blue-400" },
  { method: "GET",  path: "/cars",         color: "bg-green-500/15 text-green-400" },
  { method: "POST", path: "/rents",        color: "bg-blue-500/15 text-blue-400" },
  { method: "POST", path: "/bids",         color: "bg-blue-500/15 text-blue-400" },
  { method: "PATCH",path: "/bids/:id",     color: "bg-orange-500/15 text-orange-400" },
];

const tickerItems = [
  "JWT Auth · Access & Refresh Tokens",
  "Role-Based Access · Admin / User / Driver",
  "Prisma ORM · PostgreSQL",
  "Zod Validation · Type-Safe",
  "Bid System · Real-time Driver Matching",
  "RESTful API · v1.0.0",
];

const features = [
  {
    num: "01 — AUTH",
    title: "JWT Authentication",
    description:
      "Secure access & refresh token system. Role-based guards for Admin, User, and Driver with bcrypt password hashing.",
    tags: ["POST /auth/register", "POST /auth/login", "POST /auth/refresh-token"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#ff7828" strokeWidth="1.5" />
        <path d="M8 11V7a4 4 0 018 0v4" stroke="#ff7828" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="#ff7828" />
      </svg>
    ),
  },
  {
    num: "02 — CARS",
    title: "Car Management",
    description:
      "Full CRUD for the vehicle fleet. Search & filter by brand, model, fuel type, and condition. Paginated list responses.",
    tags: ["GET /cars", "POST /cars", "PATCH /cars/:id", "DELETE /cars/:id"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path
          d="M5 17H3V12L6 6h12l3 6v5h-2"
          stroke="#ff7828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="7.5" cy="17.5" r="2" stroke="#ff7828" strokeWidth="1.5" />
        <circle cx="16.5" cy="17.5" r="2" stroke="#ff7828" strokeWidth="1.5" />
        <path d="M9.5 17.5h5" stroke="#ff7828" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03 — BIDS",
    title: "Driver Bidding",
    description:
      "Drivers compete on rent requests with live bids. Accept a bid to lock the ride — automatically sets rent to Ongoing.",
    tags: ["POST /bids", "PATCH /bids/:id", "status: pending → ongoing"],
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
          stroke="#ff7828" strokeWidth="1.5" strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function HeroBanner() {
  return (
    <div>
<div> This is Banner page .we test it </div>

    <div> this is two testing button</div>

    {/* <Button4></Button4> */}
    <Button></Button>
     {/* <MotionCar></MotionCar> */}
     {/* <MotionCar></MotionCar> */}
    </div>
    
  );
}