"use client";
// src/components/shared/ImageUploader.tsx
// বাংলা: এটা drag-and-drop image uploader component
// Owner property create/edit page এ এটা use করবে
// Props এ uploadedUrls পাবে — সেটাই form submit এ পাঠাবে
import { useCallback, useRef, useEffect } from "react";
// import { useCallback, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, AlertCircle, ImagePlus } from "lucide-react";
import { useImageUpload } from "@/hooks/owner/useImageUpload";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  // Parent component এ URL গুলো জানাতে এই callback
  onUrlsChange: (urls: string[]) => void;
  maxImages?: number;
  defaultUrls?: string[]; // Edit page এর জন্য — existing images
  className?: string;
}

export default function ImageUploader({
  onUrlsChange,
  maxImages = 10,
  className,
}: ImageUploaderProps) {
  const { images, uploadedUrls, isUploading, addImages, removeImage, error } =
    useImageUpload(maxImages);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload complete হলে parent কে জানাও
  const handleAdd = useCallback(
    async (files: File[]) => {
      await addImages(files);
      // addImages শেষ হলে uploadedUrls update হবে — কিন্তু
      // React state async, তাই useEffect দিয়ে করা ভালো
    },
    [addImages]
  );


useEffect(() => {
  onUrlsChange(uploadedUrls);
}, [uploadedUrls]);
  // File input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleAdd(files);
    // Input reset করো same file আবার select করার জন্য
    e.target.value = "";
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length > 0) handleAdd(files);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop Zone — শুধু দেখাবে যদি আরো add করা যায় */}
      {canAddMore && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 size={28} className="text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Cloudinary তে upload হচ্ছে...
                </p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10">
                  <ImagePlus size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    ছবি drag করুন অথবা{" "}
                    <span className="text-primary underline">বেছে নিন</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    JPG, PNG, WEBP • সর্বোচ্চ 5MB • {maxImages - images.length}টি
                    আরো যোগ করতে পারবেন
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Image Grid — preview দেখাবে */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted border"
            >
              {/* Preview image */}
              <Image
                src={img.preview}
                alt={`upload-${index}`}
                fill
                className="object-cover"
              />

              {/* Uploading overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={20} className="text-white animate-spin" />
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-destructive/70 flex items-center justify-center">
                  <AlertCircle size={18} className="text-white" />
                </div>
              )}

              {/* Success indicator — ছোট সবুজ dot */}
              {!img.uploading && !img.error && (
                <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
              )}

              {/* Remove button */}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className={cn(
                    "absolute top-1.5 right-1.5 p-0.5 rounded-full",
                    "bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-black/80"
                  )}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload count info */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {uploadedUrls.length}/{images.length} ছবি Cloudinary তে upload সম্পন্ন
          {images.length >= maxImages && (
            <span className="text-amber-600 ml-2">
              (সর্বোচ্চ সংখ্যায় পৌঁছেছেন)
            </span>
          )}
        </p>
      )}
    </div>
  );
}