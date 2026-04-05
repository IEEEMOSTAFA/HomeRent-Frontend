// src/app/(commonRoute)/_component/shared/BlogCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Calendar, User } from "lucide-react";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    publishedAt?: string;
    author?: {
      name: string;
    };
  };
}

export default function BlogCard({ blog }: BlogCardProps) {
  const formattedDate = blog.publishedAt
    ? new Intl.DateTimeFormat("en-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(blog.publishedAt))
    : "Recently";

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <Link href={`/Blog/${blog.slug}`}>
          <h3 className="text-xl font-semibold leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
          {blog.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          {blog.author && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{blog.author.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}