"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Star,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const stats = [
    { label: "Expert Tutors", value: "500+", icon: Users },
    { label: "Students Taught", value: "10,000+", icon: GraduationCap },
    { label: "Success Rate", value: "98%", icon: TrendingUp },
    { label: "Countries", value: "50+", icon: Globe },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Join 10,000+ successful students
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
              Learn From The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
                Best Tutors
              </span>{" "}
              Worldwide
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Connect with verified expert tutors for personalized one-on-one
              sessions. Master any subject at your own pace.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="px-8 text-base">
                <Link href="/tutors">
                  Browse Tutors
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 text-base"
              >
                <Link href="/register?role=tutor">Become a Tutor</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                    alt="Student"
                    className="w-10 h-10 rounded-full border-2 border-background"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  4.9/5 from 2,500+ reviews
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <div className="text-4xl font-black mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}