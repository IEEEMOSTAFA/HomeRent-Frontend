"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useInView,
  type Variants,
} from "framer-motion";
import {
  Home,
  Mail,
  MapPin,
  Phone,
  Building2,
  Users,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  FileText,
  Lock,
  ArrowRight,
  Send,
  Globe,
  MessageCircle,
  Camera,
  Play,
  Briefcase,
  CheckCircle2,
  CreditCard,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}
interface FooterSection {
  title: string;
  icon: React.ElementType;
  links: FooterLink[];
}

// ─── Static data ───────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

const NAV_SECTIONS: FooterSection[] = [
  {
    title: "For Tenants",
    icon: Users,
    links: [
      { label: "Browse Properties", href: "/properties" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "My Bookings", href: "/dashboard/bookings" },
      { label: "Payment Guide", href: "/payment-guide", badge: "Stripe" },
      { label: "Submit a Review", href: "/reviews" },
    ],
  },
  {
    title: "For Owners",
    icon: Building2,
    links: [
      { label: "List a Property", href: "/owner/properties/new" },
      { label: "Owner Dashboard", href: "/owner/dashboard" },
      { label: "Manage Bookings", href: "/owner/bookings" },
      { label: "Performance Stats", href: "/owner/stats", badge: "New" },
      { label: "Profile Settings", href: "/owner/profile" },
    ],
  },
  {
    title: "Platform",
    icon: ShieldCheck,
    links: [
      { label: "About RentHome", href: "/about" },
      { label: "Admin Portal", href: "/admin" },
      { label: "AI Price Advisor", href: "/ai/price-hint", badge: "AI" },
      { label: "Notifications", href: "/notifications" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal & Support",
    icon: BookOpen,
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Safety Guidelines", href: "/safety" },
      { label: "Refund Policy", href: "/refunds" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Globe,          href: "https://facebook.com",  label: "Facebook" },
  { icon: MessageCircle, href: "https://twitter.com",   label: "Twitter / X" },
  { icon: Camera,        href: "https://instagram.com", label: "Instagram" },
  { icon: Briefcase,     href: "https://linkedin.com",  label: "LinkedIn" },
  { icon: Play,          href: "https://youtube.com",   label: "YouTube" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Admin-Verified Listings" },
  { icon: CreditCard, label: "Stripe-Secured Payments" },
  { icon: Lock, label: "BetterAuth Sessions" },
  { icon: Bell, label: "Real-time Notifications" },
];

// ─── Newsletter Input ──────────────────────────────────────────────────────────
function NewsletterInput() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`flex items-center gap-0 rounded-xl border transition-all duration-300 overflow-hidden ${
          focused
            ? "border-emerald-500/60 shadow-lg shadow-emerald-500/10"
            : "border-slate-700"
        } bg-slate-800/60`}
      >
        <Mail className="w-4 h-4 text-slate-500 ml-4 shrink-0" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="your@email.com"
          className="flex-1 px-3 py-3 text-sm bg-transparent text-slate-200 placeholder-slate-500 outline-none"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold text-sm transition-all duration-200 shrink-0"
        >
          {submitted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Subscribe</span>
            </>
          )}
        </motion.button>
      </div>
      {submitted && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-emerald-400 text-xs mt-2 flex items-center gap-1"
        >
          <CheckCircle2 className="w-3 h-3" /> You are subscribed!
        </motion.p>
      )}
    </form>
  );
}

// ─── Social Icon Button ────────────────────────────────────────────────────────
function SocialBtn({ icon: Icon, href, label }: { icon: React.ElementType; href: string; label: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.92 }}
      className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-center hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 group"
    >
      <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
    </motion.a>
  );
}

// ─── Footer Link ──────────────────────────────────────────────────────────────
function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <motion.li variants={fadeUp}>
      <Link
        href={link.href}
        className="group flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-400 transition-colors duration-200"
      >
        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-emerald-400" />
        <span>{link.label}</span>
        {link.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            {link.badge}
          </span>
        )}
      </Link>
    </motion.li>
  );
}

// ─── Main Footer ───────────────────────────────────────────────────────────────
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer className="relative bg-[#060c17] border-t border-slate-800/80 mt-auto overflow-hidden">

      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-gradient-to-b from-emerald-500/8 to-transparent blur-2xl pointer-events-none" />

      {/* Ambient orb */}
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-teal-500/4 blur-[100px] pointer-events-none" />

      <div ref={ref} className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Top strip: brand + newsletter ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="py-14 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start"
        >
          {/* Brand block */}
          <motion.div variants={fadeLeft} className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
                <Home className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">RentHome</span>
                <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase leading-none">Bangladesh's #1 Rental Platform</p>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Connecting verified owners with trusted tenants through a secure, payment-protected booking lifecycle — across Dhaka, Chittagong, Sylhet and beyond.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 mb-6">
              {[
                { icon: Mail, text: "support@renthome.com.bd", href: "mailto:support@renthome.com.bd" },
                { icon: Phone, text: "+880 1700-000000", href: "tel:+8801700000000" },
                { icon: MapPin, text: "Agrabad, Chittagong, Bangladesh", href: undefined },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-slate-500">
                  <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {href ? (
                    <a href={href} className="hover:text-emerald-400 transition-colors">{text}</a>
                  ) : (
                    <span>{text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((s) => (
                <SocialBtn key={s.label} {...s} />
              ))}
            </div>
          </motion.div>

          {/* Nav links grid */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {NAV_SECTIONS.map((section) => (
              <motion.div key={section.title} variants={fadeUp}>
                <div className="flex items-center gap-2 mb-4">
                  <section.icon className="w-3.5 h-3.5 text-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{section.title}</h3>
                </div>
                <motion.ul variants={stagger} className="space-y-2.5">
                  {section.links.map((link) => (
                    <FooterLinkItem key={link.label} link={link} />
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Glowing separator ── */}
        <div className="relative h-px w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>

        {/* ── Newsletter ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <motion.div variants={fadeLeft}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
                Newsletter
              </Badge>
            </div>
            <h3 className="text-xl font-black text-white mb-1.5">Stay in the Loop</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              New listings, market insights, and platform updates — delivered straight to your inbox. No spam, ever.
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <NewsletterInput />
            <p className="text-[11px] text-slate-600 mt-2">
              By subscribing, you agree to our{" "}
              <Link href="/privacy" className="text-slate-500 hover:text-emerald-400 transition-colors underline underline-offset-2">
                Privacy Policy
              </Link>
              . Unsubscribe anytime.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Trust badges ── */}
        <div className="relative h-px w-full mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="pb-8 flex flex-wrap gap-3 justify-center md:justify-start"
        >
          {TRUST_BADGES.map((b) => (
            <motion.div
              key={b.label}
              variants={fadeUp}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 group cursor-default"
            >
              <b.icon className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{b.label}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 border-t border-slate-800/60 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            {/* Copyright */}
            <motion.p variants={fadeUp} className="text-xs text-slate-600">
              © {currentYear}{" "}
              <span className="text-slate-500 font-semibold">RentHome</span>
              . All rights reserved. Built with{" "}
              <span className="text-emerald-500">♥</span>{" "}
              in Bangladesh.
            </motion.p>

            {/* Legal links */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              {[
                { label: "Terms", href: "/terms", icon: FileText },
                { label: "Privacy", href: "/privacy", icon: Lock },
                { label: "Safety", href: "/safety", icon: ShieldCheck },
                { label: "Help", href: "/help", icon: HelpCircle },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-400 transition-colors duration-200 group"
                >
                  <Icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  {label}
                </Link>
              ))}

              <Separator orientation="vertical" className="h-3 bg-slate-700 hidden md:block" />

              {/* Role badges */}
              <div className="flex items-center gap-2">
                {["USER", "OWNER", "ADMIN"].map((role) => (
                  <span
                    key={role}
                    className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border border-slate-800 text-slate-600 bg-slate-900"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </footer>
  );
}