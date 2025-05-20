"use client";

import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "@/src/hooks/use-toast";
import { LabeledImageUploader } from "../../../services/addService/Utils/Image-uploader";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface UseHeroImagesOptions {
  form: UseFormReturn<any>;
}

export const useHeroImages = (form: UseFormReturn<any>) => {
  const [heroImages, setHeroImages] = useState<Record<number, File>>({});
  const [heroPreviews, setHeroPreviews] = useState<Record<number, string>>({});

  const handleHeroImageUpload = useCallback(
    (featureIndex: number, file: File) => {
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

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

      // Store file and preview
      setHeroImages((prev) => ({ ...prev, [featureIndex]: file }));
      setHeroPreviews((prev) => ({ ...prev, [featureIndex]: previewUrl }));

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully for all languages",
      });

      // Return cleanup function
      return () => URL.revokeObjectURL(previewUrl);
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
    label = "Hero Image",
    helperText = "(applies to all languages)",
  }: {
    featureIndex: number;
    langCode: string;
    label?: string;
    helperText?: string;
  }) => {
    const imageValue = form.watch(`${langCode}.${featureIndex}.image`) || "";
    const inputId = `hero-image-${langCode}-${featureIndex}`;

    return (
      <LabeledImageUploader
        label={label}
        helperText={helperText}
        imageValue={imageValue}
        inputId={inputId}
        onUpload={(file) => handleHeroImageUpload(featureIndex, file)}
        onRemove={() => handleHeroImageRemove(featureIndex)}
        altText={`Hero ${featureIndex + 1} image`}
      />
    );
  };

  return {
    heroImages,
    heroPreviews,
    handleHeroImageUpload,
    handleHeroImageRemove,
    updateHeroImageIndices,
    HeroImageUploader,
  };
};