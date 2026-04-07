// src/hooks/owner/useImageUpload.ts
// Fixed: Removed unstable dependency to prevent infinite re-render loop

import { useState, useCallback, useMemo } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface UploadedImage {
  url: string;
  file: File;
  preview: string;
  uploading: boolean;
  error?: string;
}

interface UseImageUploadReturn {
  images: UploadedImage[];
  uploadedUrls: string[];
  isUploading: boolean;
  addImages: (files: File[]) => Promise<void>;
  removeImage: (index: number) => void;
  clearAll: () => void;
  error: string | null;
}

export function useImageUpload(maxImages = 10): UseImageUploadReturn {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Stable uploadedUrls (useMemo দিয়ে)
  const uploadedUrls = useMemo(() => {
    return images
      .filter((img) => !img.uploading && !img.error)
      .map((img) => img.url);
  }, [images]);

  const isUploading = images.some((img) => img.uploading);

  const addImages = useCallback(
    async (files: File[]) => {
      setError(null);

      const remaining = maxImages - images.length;
      if (files.length > remaining) {
        setError(`সর্বোচ্চ ${maxImages}টি ছবি upload করা যাবে।`);
        files = files.slice(0, remaining);
      }

      if (files.length === 0) return;

      // Add local previews
      const newImages: UploadedImage[] = files.map((file) => ({
        url: "",
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
      }));

      setImages((prev) => [...prev, ...newImages]);

      // Upload to backend
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      try {
        const res = await fetch(`${BACKEND_URL}/api/images/upload-multiple`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.message || `Upload failed: ${res.status}`);
        }

        const data = await res.json();
        const cloudinaryUrls: string[] = data?.data?.urls || [];

        // Update state with uploaded URLs
        setImages((prev) => {
          const updated = [...prev];
          let urlIndex = 0;
          for (let i = 0; i < updated.length; i++) {
            if (updated[i].uploading && cloudinaryUrls[urlIndex]) {
              updated[i] = {
                ...updated[i],
                url: cloudinaryUrls[urlIndex],
                uploading: false,
              };
              urlIndex++;
            }
          }
          return updated;
        });
      } catch (err) {
        const message = (err as Error).message || "Upload failed";
        setError(message);

        setImages((prev) =>
          prev.map((img) =>
            img.uploading ? { ...img, uploading: false, error: message } : img
          )
        );
      }
    },
    [images.length, maxImages]   // এখানে images.length রাখা আছে কিন্তু সতর্কতার সাথে
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated.splice(index, 1);
      return updated;
    });
    setError(null);
  }, []);

  const clearAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      return [];
    });
    setError(null);
  }, []);

  return {
    images,
    uploadedUrls,
    isUploading,
    addImages,
    removeImage,
    clearAll,
    error,
  };
}