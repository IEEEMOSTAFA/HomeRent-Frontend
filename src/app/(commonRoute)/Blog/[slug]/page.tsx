// src/app/(commonRoute)/Blog/[slug]/page.tsx
// export default async function SingleBlogPage({ 
//   params 
// }: { 
//   params: { slug: string } 
// }) {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/${params.slug}`, {
//     cache: 'no-store'
//   })
  
//   if (!res.ok) {
//     return <div>Blog post not found</div>
//   }

//   const { data: blog } = await res.json()

//   return (
//     <div className="max-w-4xl mx-auto px-6 py-12">
//       <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
//       <div 
//         className="prose prose-lg max-w-none"
//         dangerouslySetInnerHTML={{ __html: blog.content }} 
//       />
//     </div>
//   )
// }


























import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";

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
      next: { revalidate: 3600 }, // Optional: ISR fallback
    });

    if (!res.ok) return null;

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return null;
  }
}

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound(); // Uses Next.js built-in 404 page
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
      {/* Hero Image Section */}
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
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button variant="ghost" asChild className="mb-8 -ml-2">
            <a href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </a>
          </Button>
        </motion.div>

        {/* Category & Meta */}
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

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-10">
          {blog.title}
        </h1>

        {/* Author Info */}
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

            {/* Share Button */}
            <Button variant="outline" size="sm" className="ml-auto gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        )}

        <Separator className="mb-12" />

        {/* Blog Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert 
                     prose-headings:font-semibold prose-headings:tracking-tight
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Optional: Related Articles / Footer CTA can be added here later */}
      </div>
    </article>
  );
}