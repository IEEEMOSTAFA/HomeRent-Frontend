// "use client";
import React from "react";
import BlogCard from "../_component/BlogCard";
import { BookOpen } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt?: string;
  category?: string;
  readingTime?: string;
  author?: {
    name: string;
    image?: string;
  };
}
export const dynamic = "force-dynamic"; // ✅ এই একটা লাইন যোগ করো


async function getBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog`, {
      cache: "no-store",        // Always fresh data
      // next: { revalidate: 3600 }, // Optional: revalidate every hour if you want ISR later
    });

    if (!res.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Blog fetch error:", error);
    return [];
  }
}
export default async function BlogListingPage() {
  const blogs = await getBlogs();

  // Empty State
  if (blogs.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No blog posts yet</h2>
          <p className="text-muted-foreground max-w-md">
            We&apos;re working on something amazing. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            INSIGHTS &amp; STORIES
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Thoughts, tutorials, and stories from our team. 
            Discover ideas that matter.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: Blog, index: number) => (
            <BlogCard 
              key={blog.id} 
              blog={blog} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
