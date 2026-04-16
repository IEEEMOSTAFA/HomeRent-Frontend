"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { Calendar, Clock, ArrowRight, Share2, User, BookOpen } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface BlogCardProps {
  blog: {
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
  };
  index: number;
}

export default function BlogCard({ blog, index }: BlogCardProps) {
  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 28 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 28 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = (e.clientX - centerX) / rect.width;
    const mouseY = (e.clientY - centerY) / rect.height;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Fixed Arrow Variants with proper typing
  const arrowVariants: Variants = {
    initial: { x: 0 },
    hover: {
      x: 6,
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,   // ← This "as const" fixes the TS error
        duration: 0.55,
      },
    },
  };

  const formattedDate = blog.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(blog.publishedAt))
    : "Recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="perspective-[1200px] group h-full"
    >
      <Card className="relative h-full flex flex-col overflow-hidden border border-border/60 bg-card/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 group-hover:border-primary/30">
        
        {/* Image Section */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-md border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {blog.category || "Article"}
          </Badge>

          <button
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
            aria-label="Share this article"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <motion.div
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0"
          >
            {blog.featuredImage ? (
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted via-muted to-muted/70 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/40" />
              </div>
            )}
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-6 flex flex-col">
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.readingTime || "5 min read"}</span>
            </div>
            <BookOpen className="w-4 h-4 text-primary/70" />
          </div>

          <Link href={`/blog/${blog.slug}`} className="block group-hover:text-primary transition-colors duration-300">
            <h3 className="text-[1.35rem] leading-[1.25] font-semibold tracking-tight line-clamp-3 mb-3">
              {blog.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
            {blog.excerpt}
          </p>
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 ring-1 ring-border">
              <AvatarImage src={blog.author?.image} alt={blog.author?.name || ""} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">
              {blog.author?.name || "Anonymous"}
            </span>
          </div>

          <motion.div whileHover="hover" initial="initial">
            <Link
              href={`/blog/${blog.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90 transition-colors"
            >
              Read Article
              <motion.span variants={arrowVariants}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}




























