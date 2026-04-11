"use client";
// src/components/Admin/BlogForm.tsx
// Shared by: blog/new/page.tsx & blog/[id]/edit/page.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UploadCloud, X, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost, CreateBlogPostInput } from "@/hooks/admin/useAdminApi";

const schema = z.object({
  title:         z.string().min(5, "Min 5 chars"),
  slug:          z.string().min(3, "Required").regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
  excerpt:       z.string().min(10, "Min 10 chars"),
  content:       z.string().min(50, "Min 50 chars"),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags:          z.array(z.string()).optional(),
  isPublished:   z.boolean().optional(),
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

  // ── Image upload state ──────────────────────────────────────
  const [imageUploading, setImageUploading] = useState(false);
  const [previewUrl, setPreviewUrl]         = useState<string>(defaultValues?.featuredImage ?? "");
  const fileInputRef                        = useRef<HTMLInputElement>(null);

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

  // Auto-generate slug from title (only on new post)
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!defaultValues?.slug) {
      setValue("slug", val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }

  // ── Upload to Cloudinary via /api/images/upload ─────────────
  async function handleImageUpload(file: File) {
    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, or GIF allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "homerent/blog");

      // const res = await fetch("/api/images/upload", {
      //   method: "POST",
      //   body: formData,
      // });
      const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/images/upload`,
  {
    method: "POST",
    body: formData,
  }
);

      if (!res.ok) throw new Error("Upload failed");

      const json = await res.json();
      const url: string = json?.data?.url;

      if (!url) throw new Error("No URL returned");

      setValue("featuredImage", url);
      setPreviewUrl(url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed. Try again.");
    } finally {
      setImageUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }

  function handleRemoveImage() {
    setPreviewUrl("");
    setValue("featuredImage", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">

      {/* ── Post Details ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Post Details</CardTitle>
        </CardHeader>
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
            <Textarea
              {...register("excerpt")}
              rows={2}
              placeholder="Short description shown in listing…"
              className="resize-none"
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Content ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Body" error={errors.content?.message}>
            <Textarea
              {...register("content")}
              rows={12}
              placeholder="Write the full blog post content…"
              className="resize-none font-mono text-xs"
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Media & Tags ── */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Media & Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* ── Featured Image Upload Box ── */}
          <Field label="Featured Image" error={errors.featuredImage?.message}>
            {/* Hidden real input for form value */}
            <input type="hidden" {...register("featuredImage")} />

            {previewUrl ? (
              /* ── Preview ── */
              <div className="relative rounded-xl overflow-hidden border border-border group">
                <img
                  src={previewUrl}
                  alt="Featured"
                  className="w-full h-52 object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="text-xs gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                  >
                    {imageUploading
                      ? <Loader2 size={13} className="animate-spin" />
                      : <UploadCloud size={13} />}
                    Replace
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="text-xs gap-1.5"
                    onClick={handleRemoveImage}
                  >
                    <X size={13} /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Drop Zone ── */
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl h-44 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-400 hover:bg-rose-50/40 transition-colors group"
              >
                {imageUploading ? (
                  <>
                    <Loader2 size={28} className="animate-spin text-rose-500" />
                    <p className="text-sm text-muted-foreground">Uploading…</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                      <ImageIcon size={20} className="text-muted-foreground group-hover:text-rose-500 transition-colors" />
                    </div>
                    <p className="text-sm font-medium">Click or drag & drop to upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, GIF · Max 5MB</p>
                  </>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </Field>

          {/* ── Tags ── */}
          <Field label="Tags (comma separated)" error={undefined}>
            <Input
              placeholder="rental, tips, dhaka"
              defaultValue={tagsValue.join(", ")}
              onChange={(e) =>
                setValue("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
              }
            />
          </Field>

          {/* ── Publish toggle ── */}
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
          disabled={isSubmitting || imageUploading}
          className="bg-rose-600 hover:bg-rose-700 text-white gap-2 px-8"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && <Label className="text-sm">{label}</Label>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}









// "use client";
// // src/app/(dashboardRoute)/admin/blog/_components/BlogForm.tsx
// // Shared by: blog/new/page.tsx & blog/[id]/edit/page.tsx

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Loader2 } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import type { BlogPost, CreateBlogPostInput } from "@/hooks/admin/useAdminApi";

// const schema = z.object({
//   title:          z.string().min(5, "Min 5 chars"),
//   slug:           z.string().min(3, "Required").regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
//   excerpt:        z.string().min(10, "Min 10 chars"),
//   content:        z.string().min(50, "Min 50 chars"),
//   featuredImage:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
//   tags:           z.array(z.string()).optional(),
//   isPublished:    z.boolean().optional(),
// });

// type FormValues = z.infer<typeof schema>;

// interface BlogFormProps {
//   defaultValues?: Partial<BlogPost>;
//   onSubmit: (data: CreateBlogPostInput) => void;
//   isSubmitting: boolean;
//   submitLabel: string;
// }

// export default function BlogForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: BlogFormProps) {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       title:         defaultValues?.title         ?? "",
//       slug:          defaultValues?.slug          ?? "",
//       excerpt:       defaultValues?.excerpt       ?? "",
//       content:       defaultValues?.content       ?? "",
//       featuredImage: defaultValues?.featuredImage ?? "",
//       tags:          defaultValues?.tags          ?? [],
//       isPublished:   defaultValues?.isPublished   ?? false,
//     },
//   });

//   const tagsValue = watch("tags") ?? [];

//   function handleSubmitForm(data: FormValues) {
//     onSubmit({
//       title:         data.title,
//       slug:          data.slug,
//       excerpt:       data.excerpt,
//       content:       data.content,
//       featuredImage: data.featuredImage || undefined,
//       tags:          data.tags ?? [],
//       isPublished:   data.isPublished ?? false,
//     });
//   }

//   // Auto-generate slug from title
//   function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const val = e.target.value;
//     if (!defaultValues?.slug) {
//       setValue("slug", val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">

//       {/* Basic */}
//       <Card className="shadow-none">
//         <CardHeader className="pb-3"><CardTitle className="text-base">Post Details</CardTitle></CardHeader>
//         <CardContent className="space-y-4">
//           <Field label="Title" error={errors.title?.message}>
//             <Input
//               {...register("title")}
//               placeholder="How to Find the Perfect Rental Property"
//               onChange={(e) => { register("title").onChange(e); handleTitleChange(e); }}
//             />
//           </Field>

//           <Field label="Slug (URL)" error={errors.slug?.message}>
//             <div className="flex items-center gap-2">
//               <span className="text-xs text-muted-foreground flex-shrink-0">/blog/</span>
//               <Input {...register("slug")} placeholder="how-to-find-perfect-rental" className="font-mono text-xs" />
//             </div>
//           </Field>

//           <Field label="Excerpt" error={errors.excerpt?.message}>
//             <Textarea {...register("excerpt")} rows={2} placeholder="Short description shown in listing…" className="resize-none" />
//           </Field>
//         </CardContent>
//       </Card>

//       {/* Content */}
//       <Card className="shadow-none">
//         <CardHeader className="pb-3"><CardTitle className="text-base">Content</CardTitle></CardHeader>
//         <CardContent>
//           <Field label="Body" error={errors.content?.message}>
//             <Textarea {...register("content")} rows={12} placeholder="Write the full blog post content…" className="resize-none font-mono text-xs" />
//           </Field>
//         </CardContent>
//       </Card>

//       {/* Meta */}
//       <Card className="shadow-none">
//         <CardHeader className="pb-3"><CardTitle className="text-base">Media & Tags</CardTitle></CardHeader>
//         <CardContent className="space-y-4">
//           <Field label="Featured Image URL" error={errors.featuredImage?.message}>
//             <Input {...register("featuredImage")} placeholder="https://res.cloudinary.com/…" />
//           </Field>

//           <Field label="Tags (comma separated)" error={undefined}>
//             <Input
//               placeholder="rental, tips, dhaka"
//               defaultValue={tagsValue.join(", ")}
//               onChange={(e) =>
//                 setValue("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
//               }
//             />
//           </Field>

//           <div className="flex items-center gap-2">
//             <Checkbox
//               id="isPublished"
//               defaultChecked={defaultValues?.isPublished ?? false}
//               onCheckedChange={(v) => setValue("isPublished", !!v)}
//             />
//             <Label htmlFor="isPublished" className="text-sm font-normal cursor-pointer">
//               Publish immediately
//             </Label>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex justify-end">
//         <Button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-rose-600 hover:bg-rose-700 text-white gap-2 px-8"
//         >
//           {isSubmitting && <Loader2 size={15} className="animate-spin" />}
//           {submitLabel}
//         </Button>
//       </div>
//     </form>
//   );
// }

// function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
//   return (
//     <div className="space-y-1.5">
//       {label && <Label className="text-sm">{label}</Label>}
//       {children}
//       {error && <p className="text-xs text-destructive">{error}</p>}
//     </div>
//   );
// }