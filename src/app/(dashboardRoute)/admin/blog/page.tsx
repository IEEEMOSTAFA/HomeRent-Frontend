"use client";
// src/app/(dashboardRoute)/admin/blog/page.tsx
// API: GET /api/admin/blog | PATCH publish | DELETE

import Link from "next/link";
import { Plus, BookOpen, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useAdminBlogPosts,
  usePublishBlogPost,
  useDeleteBlogPost,
} from "@/hooks/admin/useAdminApi";

export default function AdminBlogPage() {
  const { data, isLoading } = useAdminBlogPosts();
  const { mutate: publishPost, isPending: publishing } = usePublishBlogPost();
  const { mutate: deletePost, isPending: deleting }    = useDeleteBlogPost();

  const posts = data?.data ?? [];

  function handlePublish(id: string, isPublished: boolean) {
    publishPost(
      { id, isPublished },
      {
        onSuccess: () => toast.success(isPublished ? "Post published" : "Post unpublished"),
        onError:   () => toast.error("Action failed"),
      }
    );
  }

  function handleDelete(id: string) {
    deletePost(id, {
      onSuccess: () => toast.success("Post deleted"),
      onError:   () => toast.error("Delete failed"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} posts</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2 text-sm">
            <Plus size={15} /> New Post
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-20">
          <BookOpen size={40} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No blog posts yet</p>
          <Link href="/admin/blog/new">
            <Button variant="link" className="text-rose-600 mt-2">Create your first post →</Button>
          </Link>
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <Card className="shadow-none divide-y">
          {posts.map((post) => (
            <div key={post.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{post.title}</h3>
                    {post.isPublished ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[10px]">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 border-gray-200 text-[10px]">Draft</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span>/{post.slug}</span>
                    {post.tags.length > 0 && (
                      <span className="flex gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{tag}</span>
                        ))}
                      </span>
                    )}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePublish(post.id, !post.isPublished)}
                    disabled={publishing}
                    className={`h-7 gap-1 text-xs ${post.isPublished ? "text-muted-foreground" : "text-emerald-600"}`}
                    title={post.isPublished ? "Unpublish" : "Publish"}
                  >
                    {post.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                  </Button>
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-blue-600 hover:text-blue-700">
                      <Pencil size={13} />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive hover:text-destructive">
                        <Trash2 size={13} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{post.title}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id)} disabled={deleting} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}