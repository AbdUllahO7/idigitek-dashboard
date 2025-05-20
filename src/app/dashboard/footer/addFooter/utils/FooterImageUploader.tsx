// useHeroImages.ts
import { useState, useCallback } from "react";
import { LabeledImageUploader, useImageUpload } from "../../../services/addService/Utils/Image-uploader";

export const useHeroImages = (form: any) => {
  const [heroImages, setHeroImages] = useState<(File | null)[]>([]);
  const [socialLinkImages, setSocialLinkImages] = useState<{ [heroIndex: number]: (File | null)[] }>({});

  const handleHeroImageRemove = useCallback((index: number) => {
    setHeroImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
  }, []);

  const updateHeroImageIndices = useCallback((oldIndex: number, newIndex: number) => {
    setHeroImages((prev) => {
      const newImages = [...prev];
      newImages[newIndex] = prev[oldIndex];
      newImages[oldIndex] = null;
      return newImages;
    });
    setSocialLinkImages((prev) => {
      const newSocialImages = { ...prev };
      newSocialImages[newIndex] = prev[oldIndex] || [];
      delete newSocialImages[oldIndex];
      return newSocialImages;
    });
  }, []);

  const HeroImageUploader = ({ featureIndex, langCode }: { featureIndex: number; langCode: string }) => {
    const { imageFile, imagePreview, handleImageUpload, handleImageRemove } = useImageUpload({
      form,
      fieldPath: `${langCode}.${featureIndex}.image`,
      validate: (file) => file.size <= 2 * 1024 * 1024 || "Image must be less than 2MB",
    });

    return (
      <LabeledImageUploader
        label="Hero Image"
        helperText="(applies to all languages)"
        imageValue={imagePreview || form.watch(`${langCode}.${featureIndex}.image`) || ""}
        inputId={`hero-image-${langCode}-${featureIndex}`}
        onUpload={(file) => {
          handleImageUpload(file);
          setHeroImages((prev) => {
            const newImages = [...prev];
            newImages[featureIndex] = file;
            return newImages;
          });
        }}
        onRemove={() => {
          handleImageRemove();
          handleHeroImageRemove(featureIndex);
        }}
        altText={`Hero ${featureIndex + 1} image`}
      />
    );
  };

  const SocialLinkImageUploader = ({
    heroIndex,
    socialLinkIndex,
    langCode,
  }: {
    heroIndex: number;
    socialLinkIndex: number;
    langCode: string;
  }) => {
    const { imageFile, imagePreview, handleImageUpload, handleImageRemove } = useImageUpload({
      form,
      fieldPath: `${langCode}.${heroIndex}.socialLinks.${socialLinkIndex}.image`,
      validate: (file) => file.size <= 1 * 1024 * 1024 || "Social link image must be less than 1MB",
    });

    return (
      <LabeledImageUploader
        label={`Social Link ${socialLinkIndex + 1} Image`}
        helperText="(applies to all languages)"
        imageValue={imagePreview || form.watch(`${langCode}.${heroIndex}.socialLinks.${socialLinkIndex}.image`) || ""}
        inputId={`social-link-image-${langCode}-${heroIndex}-${socialLinkIndex}`}
        onUpload={(file) => {
          handleImageUpload(file);
          setSocialLinkImages((prev) => {
            const newSocialImages = { ...prev };
            newSocialImages[heroIndex] = newSocialImages[heroIndex] || [];
            newSocialImages[heroIndex][socialLinkIndex] = file;
            return newSocialImages;
          });
        }}
        onRemove={() => {
          handleImageRemove();
          setSocialLinkImages((prev) => {
            const newSocialImages = { ...prev };
            newSocialImages[heroIndex] = newSocialImages[heroIndex] || [];
            newSocialImages[heroIndex][socialLinkIndex] = null;
            return newSocialImages;
          });
        }}
        altText={`Social Link ${socialLinkIndex + 1} image`}
      />
    );
  };

  return {
    heroImages,
    socialLinkImages,
    handleHeroImageRemove,
    updateHeroImageIndices,
    HeroImageUploader,
    SocialLinkImageUploader,
  };
};