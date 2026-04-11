"use client";
// src/app/(dashboardRoute)/admin/blog/new/page.tsx
// API: POST /api/admin/blog

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
// import BlogForm from "../_components/BlogForm";
import { useCreateBlogPost, type CreateBlogPostInput } from "@/hooks/admin/useAdminApi";
import BlogForm from "@/components/Admin/BlogForm";

export default function NewBlogPostPage() {
  const router = useRouter();
  const { mutate: createPost, isPending } = useCreateBlogPost();

  function handleSubmit(data: CreateBlogPostInput) {
    createPost(data, {
      onSuccess: () => {
        toast.success("Blog post created!");
        router.push("/admin/blog");
      },
      onError: () => toast.error("Failed to create post"),
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft size={17} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Blog Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and publish a new article</p>
        </div>
      </div>

      <BlogForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Post"
      />
    </div>
  );
}