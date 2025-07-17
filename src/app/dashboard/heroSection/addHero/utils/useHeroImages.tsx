"use client";

import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "@/src/hooks/use-toast";
import { LabeledImageUploader } from "../../../services/addService/Utils/Image-uploader";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
// 🚀 OPTIMIZATION: Target dimensions for hero images (LCP optimized)
const HERO_TARGET_WIDTH = 600;
const HERO_TARGET_HEIGHT = 400;
const HERO_QUALITY = 0.75; // 75% quality for good balance

interface UseHeroImagesOptions {
  form: UseFormReturn<any>;
}

// 🚀 OPTIMIZATION: Image optimization utility
const optimizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 🚀 Set target dimensions (optimized for LCP)
      canvas.width = HERO_TARGET_WIDTH;
      canvas.height = HERO_TARGET_HEIGHT;

      // 🚀 Draw and resize image
      ctx?.drawImage(img, 0, 0, HERO_TARGET_WIDTH, HERO_TARGET_HEIGHT);

      // 🚀 Convert to WebP with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          // 🚀 Create optimized file
          const optimizedFile = new File(
            [blob], 
            `optimized-${file.name.replace(/\.[^/.]+$/, '.webp')}`, // Change extension to .webp
            { 
              type: 'image/webp',
              lastModified: Date.now()
            }
          );

          console.log(`🚀 Image optimized: ${Math.round(file.size / 1024)}KB → ${Math.round(optimizedFile.size / 1024)}KB`);
          resolve(optimizedFile);
        },
        'image/webp', // 🚀 Use WebP format for better compression
        HERO_QUALITY // 🚀 Quality setting
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// 🚀 OPTIMIZATION: Fallback for older browsers (JPEG)
const optimizeImageFallback = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = HERO_TARGET_WIDTH;
      canvas.height = HERO_TARGET_HEIGHT;
      ctx?.drawImage(img, 0, 0, HERO_TARGET_WIDTH, HERO_TARGET_HEIGHT);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          const optimizedFile = new File(
            [blob], 
            `optimized-${file.name}`,
            { 
              type: 'image/jpeg',
              lastModified: Date.now()
            }
          );

          resolve(optimizedFile);
        },
        'image/jpeg',
        HERO_QUALITY
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const useHeroImages = (form: UseFormReturn<any>) => {
  const [heroImages, setHeroImages] = useState<Record<number, File>>({});
  const [heroPreviews, setHeroPreviews] = useState<Record<number, string>>({});
  const [isOptimizing, setIsOptimizing] = useState<Record<number, boolean>>({});

  const handleHeroImageUpload = useCallback(
    async (featureIndex: number, file: File) => {
      if (!file) return;

      // Check file size (max 2MB for original)
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      try {
        // 🚀 OPTIMIZATION: Show loading state
        setIsOptimizing(prev => ({ ...prev, [featureIndex]: true }));

        toast({
          title: "Optimizing image...",
          description: "Please wait while we optimize your image for better performance",
        });

        // 🚀 OPTIMIZATION: Optimize the image
        let optimizedFile: File;
        try {
          // Try WebP first (better compression)
          optimizedFile = await optimizeImage(file);
        } catch (error) {
          console.warn('WebP optimization failed, falling back to JPEG:', error);
          // Fallback to JPEG
          optimizedFile = await optimizeImageFallback(file);
        }

        // 🚀 Create preview URL from optimized file
        const previewUrl = URL.createObjectURL(optimizedFile);

        // Update form values for all languages
        const formValues = form.getValues();
        Object.keys(formValues).forEach((langCode) => {
          if (formValues[langCode] && formValues[langCode][featureIndex]) {
            form.setValue(
              `${langCode}.${featureIndex}.image`,
              previewUrl,
              { shouldDirty: true }
            );
          }
        });

        // 🚀 Store optimized file and preview
        setHeroImages((prev) => ({ ...prev, [featureIndex]: optimizedFile }));
        setHeroPreviews((prev) => ({ ...prev, [featureIndex]: previewUrl }));


        // Return cleanup function
        return () => URL.revokeObjectURL(previewUrl);

      } catch (error) {
        console.error('Image optimization failed:', error);
        toast({
          title: "Image optimization failed",
          description: "Failed to optimize image. Please try a different image.",
          variant: "destructive",
        });
      } finally {
        // 🚀 Clear loading state
        setIsOptimizing(prev => ({ ...prev, [featureIndex]: false }));
      }
    },
    [form]
  );

  const handleHeroImageRemove = useCallback(
    (featureIndex: number) => {
      // Clear form values for all languages
      const formValues = form.getValues();
      Object.keys(formValues).forEach((langCode) => {
        if (formValues[langCode] && formValues[langCode][featureIndex]) {
          form.setValue(`${langCode}.${featureIndex}.image`, "", {
            shouldDirty: true,
          });
        }
      });

      // Remove from state
      setHeroImages((prev) => {
        const newImages = { ...prev };
        delete newImages[featureIndex];
        return newImages;
      });
      setHeroPreviews((prev) => {
        const newPreviews = { ...prev };
        if (newPreviews[featureIndex]) {
          URL.revokeObjectURL(newPreviews[featureIndex]);
        }
        delete newPreviews[featureIndex];
        return newPreviews;
      });

      toast({
        title: "Image removed",
        description: "Image has been removed from all languages",
      });
    },
    [form]
  );

  const updateHeroImageIndices = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex || !heroImages[oldIndex]) return;

      setHeroImages((prev) => {
        const newImages = { ...prev };
        newImages[newIndex] = newImages[oldIndex];
        delete newImages[oldIndex];
        return newImages;
      });

      setHeroPreviews((prev) => {
        const newPreviews = { ...prev };
        newPreviews[newIndex] = newPreviews[oldIndex];
        delete newPreviews[oldIndex];
        return newPreviews;
      });
    },
    [heroImages]
  );

  const HeroImageUploader = ({
    featureIndex,
    langCode,
    label = "Image",
  }: {
    featureIndex: number;
    langCode: string;
    label?: string;
    helperText?: string;
  }) => {
    const imageValue = form.watch(`${langCode}.${featureIndex}.image`) || "";
    const inputId = `hero-image-${langCode}-${featureIndex}`;
    const isCurrentlyOptimizing = isOptimizing[featureIndex] || false;

    return (
      <div className="space-y-2">
        <LabeledImageUploader
          label={`${label} ${isCurrentlyOptimizing ? '(Optimizing...)' : ''}`}
          imageValue={imageValue}
          inputId={inputId}
          onUpload={(file) => handleHeroImageUpload(featureIndex, file)}
          onRemove={() => handleHeroImageRemove(featureIndex)}
          altText={`Hero ${featureIndex + 1} image`}
          disabled={isCurrentlyOptimizing}
        />
        {/* 🚀 OPTIMIZATION: Show optimization info */}
        <p className="text-xs text-muted-foreground">
          📸 Images are automatically optimized to {HERO_TARGET_WIDTH}×{HERO_TARGET_HEIGHT} WebP format for best performance
        </p>
        {isCurrentlyOptimizing && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Optimizing image for better performance...
          </div>
        )}
      </div>
    );
  };

  return {
    heroImages,
    heroPreviews,
    handleHeroImageUpload,
    handleHeroImageRemove,
    updateHeroImageIndices,
    HeroImageUploader,
    isOptimizing, // 🚀 Export optimization state
  };
};