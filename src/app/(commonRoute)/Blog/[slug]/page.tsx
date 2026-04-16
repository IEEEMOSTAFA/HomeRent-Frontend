"use client";
import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  readingTime?: string;
  category?: string;
  author?: {
    name: string;
    image?: string;
  };
}

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return null;
  }
}

// ✅ Fix 1: params এখন Promise
export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ Fix 2: await করো
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const formattedDate = blog.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(blog.publishedAt))
    : "Recently";

  return (
    <article className="min-h-screen bg-background">
      {blog.featuredImage && (
        <div className="relative h-[500px] w-full overflow-hidden">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button variant="ghost" asChild className="mb-8 -ml-2">
            <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {blog.category && (
            <Badge variant="secondary" className="text-sm px-4 py-1">
              {blog.category}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          {blog.readingTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{blog.readingTime}</span>
            </div>
          )}
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-10">
          {blog.title}
        </h1>

        {blog.author && (
          <div className="flex items-center gap-4 mb-12">
            <Avatar className="w-12 h-12 border-2 border-background">
              <AvatarImage src={blog.author.image} alt={blog.author.name} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{blog.author.name}</p>
              <p className="text-sm text-muted-foreground">Author</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        )}

        <Separator className="mb-12" />

        <div
          className="prose prose-lg max-w-none dark:prose-invert 
                     prose-headings:font-semibold prose-headings:tracking-tight
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </article>
  );
}