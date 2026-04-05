"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { ApiResponse, Category } from "@/types,/admin";
// import type { ApiResponse, Category } from "@/types/admin";

// Skeleton loader for categories
function CategorySkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-xl bg-card border border-border animate-pulse"
        >
          <div className="w-10 h-10 bg-muted rounded-full mx-auto mb-3" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
          <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
        </div>
      ))}
    </>
  );
}

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ API থেকে active categories load করা
  useEffect(() => {
    apiFetch<ApiResponse<Category[]>>("/categories")
      .then((res) => {
        // শুধু active categories দেখাবো
        const active = res.data.filter((cat) => cat.isActive);
        setCategories(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/tutors?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      {/* ================= SEARCH BAR ================= */}
      <section className="py-12 bg-background border-b">
        <div className="mx-auto w-full max-w-4xl px-4">
          <div className="flex gap-3 p-2 bg-background rounded-xl border-2 border-border shadow-lg">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for tutors, subjects, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button size="lg" className="px-8" onClick={handleSearch}>
              Search
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Popular Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find expert tutors in hundreds of subjects
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              <CategorySkeleton />
            ) : categories.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                No categories available yet.
              </div>
            ) : (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/tutors?category=${encodeURIComponent(category.name)}`}
                  className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Icon */}
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon || "📚"}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold mb-1 text-sm leading-tight">
                    {category.name}
                  </h3>

                  {/* Description (optional, truncated) */}
                  {category.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {category.description}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}


