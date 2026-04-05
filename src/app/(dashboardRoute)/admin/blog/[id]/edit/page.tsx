"use client";
// src/app/(dashboardRoute)/admin/blog/[id]/edit/page.tsx
// API: PATCH /api/admin/blog/:id

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// import BlogForm from "../../_components/BlogForm";
import {
  useAdminBlogPosts,
  useUpdateBlogPost,
  type CreateBlogPostInput,
} from "@/hooks/admin/useAdminApi";
import BlogForm from "@/components/Admin/BlogForm";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Find post from list (no single-post endpoint in backend routes)
  const { data, isLoading } = useAdminBlogPosts();
  const post = data?.data?.find((p) => p.id === id);

  const { mutate: updatePost, isPending } = useUpdateBlogPost();

  function handleSubmit(data: CreateBlogPostInput) {
    updatePost(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Post updated!");
          router.push("/admin/blog");
        },
        onError: () => toast.error("Update failed"),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft size={17} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Blog Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{post?.title}</p>
        </div>
      </div>

      <BlogForm
        defaultValues={post}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}