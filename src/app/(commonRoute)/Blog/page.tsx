// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence, useInView } from "framer-motion";
// import dynamic from "next/dynamic";

// // Dynamic import for Lottie Player (fixes "document is not defined")
// const Player = dynamic(
//   () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
//   { ssr: false }
// );

// import {
//   Search,
//   BookOpen,
//   Clock,
//   Calendar,
//   ArrowRight,
//   Tag,
//   Sparkles,
//   TrendingUp,
//   Eye,
//   Heart,
//   ChevronRight,
//   Rss,
// } from "lucide-react";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { TooltipProvider } from "@/components/ui/tooltip";

// // ── Types ──────────────────────────────────────────────────────────────────────
// type Blog = {
//   id: string;
//   title: string;
//   slug: string;
//   excerpt?: string;
//   content?: string;
//   coverImage?: string;
//   category?: string;
//   tags?: string[];
//   author?: { name: string; avatar?: string };
//   publishedAt?: string;
//   readTime?: number;
//   views?: number;
//   likes?: number;
// };

// // ── Helpers ────────────────────────────────────────────────────────────────────
// function getReadTime(blog: Blog) {
//   if (blog.readTime) return blog.readTime;
//   const words = (blog.content ?? blog.excerpt ?? "").split(" ").length;
//   return Math.max(1, Math.ceil(words / 200));
// }

// function formatDate(dateStr?: string) {
//   if (!dateStr) return "";
//   return new Date(dateStr).toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// // ── Animation Variants ─────────────────────────────────────────────────────────
// const containerVariants = {
//   hidden: {},
//   show: { transition: { staggerChildren: 0.09 } },
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 28, scale: 0.97 },
//   show: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { type: "spring" as const, stiffness: 240, damping: 22 },
//   },
//   exit: { opacity: 0, scale: 0.95, transition: { duration: 0.18 } },
// };

// // ── Animated Heading (Framer Motion only) ───────────────────────
// function AnimatedHeading() {
//   const text = "Our Blog";
//   const letters = text.split("");

//   return (
//     <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight overflow-hidden">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="flex flex-wrap justify-center gap-x-1"
//       >
//         {letters.map((char, index) => (
//           <motion.span
//             key={index}
//             initial={{ opacity: 0, y: 40, scale: 0.8 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             transition={{
//               duration: 0.6,
//               delay: 0.3 + index * 0.04,
//               type: "spring",
//               stiffness: 200,
//               damping: 20,
//             }}
//             className="inline-block"
//             style={{
//               display: char === " " ? "inline" : "inline-block",
//               whiteSpace: char === " " ? "pre" : "normal",
//             }}
//           >
//             {char === " " ? "\u00A0" : char}
//           </motion.span>
//         ))}
//       </motion.div>
//     </h1>
//   );
// }

// // ── Featured Blog Card ─────────────────────────────────────────────────────────
// function FeaturedCard({ blog }: { blog: Blog }) {
//   return (
//     <motion.div
//       variants={cardVariants}
//       whileHover={{ y: -4 }}
//       transition={{ type: "spring", stiffness: 300, damping: 25 }}
//       className="col-span-full"
//     >
//       <Link href={`/blog/${blog.slug ?? blog.id}`}>
//         <div className="group relative bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-shadow duration-300 flex flex-col md:flex-row min-h-[17rem]">
//           <div className="relative w-full md:w-2/5 h-56 md:h-auto flex-shrink-0 overflow-hidden bg-emerald-50">
//             {blog.coverImage ? (
//               <motion.img
//                 src={blog.coverImage}
//                 alt={blog.title}
//                 className="w-full h-full object-cover"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ duration: 0.5 }}
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 <BookOpen size={52} className="text-emerald-200" />
//               </div>
//             )}
//             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
//             <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow">
//               <TrendingUp size={11} /> Featured
//             </div>
//           </div>

//           <div className="flex-1 flex flex-col justify-between p-6 md:p-8">
//             <div className="space-y-3">
//               {blog.category && (
//                 <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
//                   <Tag size={10} /> {blog.category}
//                 </span>
//               )}
//               <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
//                 {blog.title}
//               </h2>
//               {blog.excerpt && (
//                 <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
//                   {blog.excerpt}
//                 </p>
//               )}
//             </div>
//             <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
//               <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
//                 {blog.author?.name && (
//                   <div className="flex items-center gap-1.5">
//                     <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
//                       {blog.author.name[0]}
//                     </div>
//                     <span className="font-medium text-gray-600">
//                       {blog.author.name}
//                     </span>
//                   </div>
//                 )}
//                 {blog.publishedAt && (
//                   <span className="flex items-center gap-1">
//                     <Calendar size={10} /> {formatDate(blog.publishedAt)}
//                   </span>
//                 )}
//                 <span className="flex items-center gap-1">
//                   <Clock size={10} /> {getReadTime(blog)} min read
//                 </span>
//               </div>
//               <motion.span
//                 whileHover={{ x: 4 }}
//                 className="flex items-center gap-1 text-xs font-bold text-emerald-600 flex-shrink-0"
//               >
//                 Read more <ArrowRight size={12} />
//               </motion.span>
//             </div>
//           </div>
//         </div>
//       </Link>
//     </motion.div>
//   );
// }

// // ── Regular Blog Card (unchanged) ─────────────────────────────────────────────
// function BlogCard({ blog }: { blog: Blog }) {
//   const ref = useRef(null);
//   const inView = useInView(ref, { once: true, margin: "-60px" });

//   return (
//     <motion.div
//       ref={ref}
//       variants={cardVariants}
//       initial="hidden"
//       animate={inView ? "show" : "hidden"}
//       whileHover={{ y: -5 }}
//       transition={{ type: "spring", stiffness: 280, damping: 22 }}
//     >
//       <Link href={`/blog/${blog.slug ?? blog.id}`}>
//         <div className="group bg-white rounded-2xl border border-emerald-50 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-emerald-100/40 hover:border-emerald-200 transition-all duration-300 h-full flex flex-col">
//           <div className="relative h-48 bg-emerald-50 overflow-hidden flex-shrink-0">
//             {blog.coverImage ? (
//               <motion.img
//                 src={blog.coverImage}
//                 alt={blog.title}
//                 className="w-full h-full object-cover"
//                 whileHover={{ scale: 1.07 }}
//                 transition={{ duration: 0.45 }}
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 <BookOpen size={36} className="text-emerald-200" />
//               </div>
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
//             {blog.category && (
//               <span className="absolute top-3 left-3 text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
//                 {blog.category}
//               </span>
//             )}
//             <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
//               {blog.views !== undefined && (
//                 <span className="flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
//                   <Eye size={9} /> {blog.views}
//                 </span>
//               )}
//               {blog.likes !== undefined && (
//                 <span className="flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
//                   <Heart size={9} /> {blog.likes}
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="flex-1 flex flex-col p-5 gap-3">
//             <div className="flex-1 space-y-2">
//               <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
//                 {blog.title}
//               </h3>
//               {blog.excerpt && (
//                 <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
//                   {blog.excerpt}
//                 </p>
//               )}
//             </div>

//             {blog.tags && blog.tags.length > 0 && (
//               <div className="flex flex-wrap gap-1">
//                 {blog.tags.slice(0, 3).map((tag) => (
//                   <span
//                     key={tag}
//                     className="text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full"
//                   >
//                     #{tag}
//                   </span>
//                 ))}
//               </div>
//             )}

//             <div className="flex items-center justify-between pt-3 border-t border-gray-50">
//               <div className="flex items-center gap-2 text-[11px] text-gray-400">
//                 {blog.author?.name && (
//                   <div className="flex items-center gap-1">
//                     <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[9px] flex-shrink-0">
//                       {blog.author.name[0]}
//                     </div>
//                     <span className="font-medium text-gray-500 truncate max-w-[80px]">
//                       {blog.author.name}
//                     </span>
//                   </div>
//                 )}
//                 <span className="flex items-center gap-0.5">
//                   <Clock size={9} /> {getReadTime(blog)}m
//                 </span>
//               </div>
//               <motion.span
//                 whileHover={{ x: 3 }}
//                 className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600"
//               >
//                 Read <ChevronRight size={11} />
//               </motion.span>
//             </div>
//           </div>
//         </div>
//       </Link>
//     </motion.div>
//   );
// }

// // ── Loading Skeleton ───────────────────────────────────────────────────────────
// function SkeletonGrid() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       <div className="col-span-full">
//         <div className="bg-white rounded-3xl border border-emerald-50 overflow-hidden flex flex-col md:flex-row h-64">
//           <Skeleton className="w-full md:w-2/5 h-56 md:h-full rounded-none" />
//           <div className="flex-1 p-8 space-y-4">
//             <Skeleton className="h-3 w-24" />
//             <Skeleton className="h-6 w-3/4" />
//             <Skeleton className="h-6 w-1/2" />
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-2/3" />
//           </div>
//         </div>
//       </div>
//       {[1, 2, 3, 4, 5, 6].map((i) => (
//         <motion.div
//           key={i}
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: i * 0.06 }}
//           className="bg-white rounded-2xl border border-emerald-50 overflow-hidden"
//         >
//           <Skeleton className="h-48 w-full rounded-none" />
//           <div className="p-5 space-y-3">
//             <Skeleton className="h-4 w-3/4" />
//             <Skeleton className="h-3 w-full" />
//             <Skeleton className="h-3 w-2/3" />
//             <div className="flex gap-1.5 pt-1">
//               <Skeleton className="h-5 w-16 rounded-full" />
//               <Skeleton className="h-5 w-12 rounded-full" />
//             </div>
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// // ── Main Page ──────────────────────────────────────────────────────────────────
// export default function BlogListingPage() {
//   const [blogs, setBlogs] = useState<Blog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [search, setSearch] = useState("");
//   const [activeCategory, setActiveCategory] = useState("All");

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog`,
//           { cache: "no-store" }
//         );
//         const { data } = await res.json();
//         setBlogs(data ?? []);
//       } catch {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   const categories = [
//     "All",
//     ...Array.from(
//       new Set(blogs.map((b) => b.category).filter(Boolean) as string[])
//     ),
//   ];

//   const filtered = blogs.filter((b) => {
//     const matchSearch =
//       !search ||
//       b.title.toLowerCase().includes(search.toLowerCase()) ||
//       (b.excerpt ?? "").toLowerCase().includes(search.toLowerCase());
//     const matchCat = activeCategory === "All" || b.category === activeCategory;
//     return matchSearch && matchCat;
//   });

//   const [featured, ...rest] = filtered;

//   return (
//     <TooltipProvider delayDuration={200}>
//       <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
//           {/* Hero Header */}
//           <motion.div
//             initial={{ opacity: 0, y: -18 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ type: "spring", stiffness: 200, damping: 20 }}
//             className="text-center space-y-4"
//           >
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.1 }}
//               className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full"
//             >
//               <Rss size={11} /> Latest Articles & Insights
//             </motion.div>

//             <AnimatedHeading />

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.6 }}
//               className="text-gray-400 text-base max-w-md mx-auto leading-relaxed"
//             >
//               Tips, guides, and stories from our community of property owners and tenants.
//             </motion.p>
//           </motion.div>

//           {/* Search + Filter */}
//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="flex flex-col sm:flex-row gap-3"
//           >
//             <div className="relative flex-1">
//               <Search
//                 size={14}
//                 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//               <Input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search articles…"
//                 className="pl-9 rounded-xl border-emerald-100 bg-white focus-visible:ring-emerald-300 text-sm h-10"
//               />
//             </div>
//             <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
//               {categories.map((cat) => (
//                 <motion.button
//                   key={cat}
//                   whileTap={{ scale: 0.94 }}
//                   onClick={() => setActiveCategory(cat)}
//                   className={`flex-shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
//                     activeCategory === cat
//                       ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
//                       : "bg-white text-gray-500 border-emerald-100 hover:border-emerald-300 hover:text-emerald-700"
//                   }`}
//                 >
//                   {cat}
//                 </motion.button>
//               ))}
//             </div>
//           </motion.div>

//           {/* Count */}
//           {!loading && blogs.length > 0 && (
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="flex items-center gap-2 text-xs text-gray-400"
//             >
//               <Sparkles size={12} className="text-emerald-400" />
//               Showing{" "}
//               <span className="font-bold text-emerald-600">{filtered.length}</span> of{" "}
//               <span className="font-bold text-gray-600">{blogs.length}</span> articles
//             </motion.p>
//           )}

//           {loading && <SkeletonGrid />}

//           {error && !loading && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="flex flex-col items-center justify-center py-20 gap-4"
//             >
//               <Player
//                 autoplay
//                 loop
//                 src="https://lottie.host/f0a49635-3f8d-4b2f-8e1e-34c70e09c1cf/IrItCHGOBT.json"
//                 style={{ height: 120, width: 120 }}
//               />
//               <p className="text-sm text-red-500 font-medium">Failed to load articles.</p>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => window.location.reload()}
//                 className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
//               >
//                 Try Again
//               </Button>
//             </motion.div>
//           )}

//           {!loading && !error && filtered.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="flex flex-col items-center justify-center py-20 gap-3 text-center"
//             >
//               <Player
//                 autoplay
//                 loop
//                 src="https://lottie.host/4db68bbd-246e-4e78-9b82-3f93d4c0e6c3/8HVSanSZMj.json"
//                 style={{ height: 140, width: 140 }}
//               />
//               <h3 className="text-base font-bold text-gray-800">No articles found</h3>
//               <p className="text-sm text-gray-400 max-w-xs">
//                 {search
//                   ? `No results for "${search}". Try a different keyword.`
//                   : "No articles in this category yet."}
//               </p>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   setSearch("");
//                   setActiveCategory("All");
//                 }}
//                 className="rounded-xl mt-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
//               >
//                 Clear filters
//               </Button>
//             </motion.div>
//           )}

//           {!loading && !error && filtered.length > 0 && (
//             <motion.div
//               variants={containerVariants}
//               initial="hidden"
//               animate="show"
//               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//             >
//               <AnimatePresence mode="popLayout">
//                 {featured && <FeaturedCard key={`featured-${featured.id}`} blog={featured} />}
//                 {rest.map((blog) => (
//                   <BlogCard key={blog.id} blog={blog} />
//                 ))}
//               </AnimatePresence>
//             </motion.div>
//           )}

//           {/* Newsletter CTA */}
//           {!loading && !error && blogs.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ type: "spring", stiffness: 160, damping: 20 }}
//               className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white"
//             >
//               <div className="space-y-1 text-center md:text-left">
//                 <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">
//                   <Sparkles size={11} /> Stay Updated
//                 </div>
//                 <h3 className="text-xl font-black">Never miss an article</h3>
//                 <p className="text-emerald-100 text-sm">
//                   Get the latest posts delivered to your inbox weekly.
//                 </p>
//               </div>
//               <div className="flex gap-2 w-full md:w-auto">
//                 <Input
//                   placeholder="your@email.com"
//                   className="rounded-xl bg-white/15 border-white/25 text-white placeholder:text-emerald-200 focus-visible:ring-white/40 min-w-0 flex-1 md:w-56"
//                 />
//                 <motion.div whileTap={{ scale: 0.96 }}>
//                   <Button className="rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold flex-shrink-0">
//                     Subscribe
//                   </Button>
//                 </motion.div>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// }



























// src/app/(commonRoute)/Blog/page.tsx
// import BlogCard from '../_component/shared/BlogCard'

// import BlogCard from "../_component/BlogCard"

// export default async function BlogListingPage() {
//   // Fetch published blogs (Server Component)
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog`, {
//     cache: 'no-store'
//   })
//   const { data: blogs } = await res.json()

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-12">
//       <h1 className="text-4xl font-bold text-center mb-12">Our Blog</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//         {blogs?.map((blog: any) => (
//           <BlogCard key={blog.id} blog={blog} />
//         ))}
//       </div>
//     </div>
//   )
// }












import React from "react";
import BlogCard from "../_component/BlogCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen } from "lucide-react";

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

async function getBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog`, {
      cache: "no-store",        // Always fresh data
      next: { revalidate: 3600 }, // Optional: revalidate every hour if you want ISR later
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