"use client";
// src/app/(dashboardRoute)/admin/blog/_components/BlogForm.tsx
// Shared by: blog/new/page.tsx & blog/[id]/edit/page.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost, CreateBlogPostInput } from "@/hooks/admin/useAdminApi";

const schema = z.object({
  title:          z.string().min(5, "Min 5 chars"),
  slug:           z.string().min(3, "Required").regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
  excerpt:        z.string().min(10, "Min 10 chars"),
  content:        z.string().min(50, "Min 50 chars"),
  featuredImage:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags:           z.array(z.string()).optional(),
  isPublished:    z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface BlogFormProps {
  defaultValues?: Partial<BlogPost>;
  onSubmit: (data: CreateBlogPostInput) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function BlogForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: BlogFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:         defaultValues?.title         ?? "",
      slug:          defaultValues?.slug          ?? "",
      excerpt:       defaultValues?.excerpt       ?? "",
      content:       defaultValues?.content       ?? "",
      featuredImage: defaultValues?.featuredImage ?? "",
      tags:          defaultValues?.tags          ?? [],
      isPublished:   defaultValues?.isPublished   ?? false,
    },
  });

  const tagsValue = watch("tags") ?? [];

  function handleSubmitForm(data: FormValues) {
    onSubmit({
      title:         data.title,
      slug:          data.slug,
      excerpt:       data.excerpt,
      content:       data.content,
      featuredImage: data.featuredImage || undefined,
      tags:          data.tags ?? [],
      isPublished:   data.isPublished ?? false,
    });
  }

  // Auto-generate slug from title
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!defaultValues?.slug) {
      setValue("slug", val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">

      {/* Basic */}
      <Card className="shadow-none">
        <CardHeader className="pb-3"><CardTitle className="text-base">Post Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title" error={errors.title?.message}>
            <Input
              {...register("title")}
              placeholder="How to Find the Perfect Rental Property"
              onChange={(e) => { register("title").onChange(e); handleTitleChange(e); }}
            />
          </Field>

          <Field label="Slug (URL)" error={errors.slug?.message}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex-shrink-0">/blog/</span>
              <Input {...register("slug")} placeholder="how-to-find-perfect-rental" className="font-mono text-xs" />
            </div>
          </Field>

          <Field label="Excerpt" error={errors.excerpt?.message}>
            <Textarea {...register("excerpt")} rows={2} placeholder="Short description shown in listing…" className="resize-none" />
          </Field>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="shadow-none">
        <CardHeader className="pb-3"><CardTitle className="text-base">Content</CardTitle></CardHeader>
        <CardContent>
          <Field label="Body" error={errors.content?.message}>
            <Textarea {...register("content")} rows={12} placeholder="Write the full blog post content…" className="resize-none font-mono text-xs" />
          </Field>
        </CardContent>
      </Card>

      {/* Meta */}
      <Card className="shadow-none">
        <CardHeader className="pb-3"><CardTitle className="text-base">Media & Tags</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Featured Image URL" error={errors.featuredImage?.message}>
            <Input {...register("featuredImage")} placeholder="https://res.cloudinary.com/…" />
          </Field>

          <Field label="Tags (comma separated)" error={undefined}>
            <Input
              placeholder="rental, tips, dhaka"
              defaultValue={tagsValue.join(", ")}
              onChange={(e) =>
                setValue("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
              }
            />
          </Field>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublished"
              defaultChecked={defaultValues?.isPublished ?? false}
              onCheckedChange={(v) => setValue("isPublished", !!v)}
            />
            <Label htmlFor="isPublished" className="text-sm font-normal cursor-pointer">
              Publish immediately
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-rose-600 hover:bg-rose-700 text-white gap-2 px-8"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && <Label className="text-sm">{label}</Label>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}