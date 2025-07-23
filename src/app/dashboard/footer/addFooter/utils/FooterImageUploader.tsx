// useHeroImages.ts
import { useState, useCallback } from "react";
import { LabeledImageUploader, useImageUpload } from "../../../services/addService/Utils/Image-uploader";
import { useToast } from "@/src/hooks/use-toast";

// 🚀 IMAGE COMPRESSION UTILITIES
const optimizeImage = async (
  file: File, 
  targetWidth: number, 
  targetHeight: number,
  quality: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;

      if (img.width > targetWidth || img.height > targetHeight) {
        if (aspectRatio > targetWidth / targetHeight) {
          newWidth = targetWidth;
          newHeight = targetWidth / aspectRatio;
        } else {
          newHeight = targetHeight;
          newWidth = targetHeight * aspectRatio;
        }
      } else {
        newWidth = img.width;
        newHeight = img.height;
      }

      newWidth = Math.round(newWidth);
      newHeight = Math.round(newHeight);

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          const optimizedFile = new File(
            [blob], 
            `optimized-${file.name.replace(/\.[^/.]+$/, '.webp')}`,
            { 
              type: 'image/webp',
              lastModified: Date.now()
            }
          );

          resolve(optimizedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const optimizeImageFallback = async (
  file: File, 
  targetWidth: number, 
  targetHeight: number,
  quality: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;

      if (img.width > targetWidth || img.height > targetHeight) {
        if (aspectRatio > targetWidth / targetHeight) {
          newWidth = targetWidth;
          newHeight = targetWidth / aspectRatio;
        } else {
          newHeight = targetHeight;
          newWidth = targetHeight * aspectRatio;
        }
      } else {
        newWidth = img.width;
        newHeight = img.height;
      }

      newWidth = Math.round(newWidth);
      newHeight = Math.round(newHeight);

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          const optimizedFile = new File(
            [blob], 
            `optimized-${file.name.replace(/\.[^/.]+$/, '.jpg')}`,
            { 
              type: 'image/jpeg',
              lastModified: Date.now()
            }
          );

          resolve(optimizedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// 🚀 ENHANCED: Compression settings for different image types
const HERO_IMAGE_SETTINGS = {
  targetWidth: 1920,  // Full HD width for hero images
  targetHeight: 1080, // Full HD height for hero images
  quality: 0.85,      // 85% quality for hero images (higher quality)
  maxFileSize: 3 * 1024 * 1024, // 3MB max for hero images
};

const SOCIAL_LINK_SETTINGS = {
  targetWidth: 200,   // Small size for social link icons
  targetHeight: 200,  // Square aspect ratio
  quality: 0.8,       // 80% quality for social links
  maxFileSize: 1 * 1024 * 1024, // 1MB max for social links
};

export const useHeroImages = (form: any) => {
  const { toast } = useToast();
  
  const [heroImages, setHeroImages] = useState<(File | null)[]>([]);
  const [socialLinkImages, setSocialLinkImages] = useState<{ [heroIndex: number]: (File | null)[] }>({});
  
  // 🚀 ENHANCED: Track optimization states with progress
  const [heroImageOptimizing, setHeroImageOptimizing] = useState<{ [index: number]: boolean }>({});
  const [socialLinkOptimizing, setSocialLinkOptimizing] = useState<{ [heroIndex: number]: { [socialIndex: number]: boolean } }>({});
  const [compressionProgress, setCompressionProgress] = useState<{ [key: string]: number }>({});

  const handleHeroImageRemove = useCallback((index: number) => {
    setHeroImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
    
    // 🚀 Clear optimization state
    setHeroImageOptimizing((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });

    // Clear compression progress
    setCompressionProgress((prev) => {
      const newState = { ...prev };
      delete newState[`hero-${index}`];
      return newState;
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
    
    // 🚀 Update optimization states
    setHeroImageOptimizing((prev) => {
      const newState = { ...prev };
      newState[newIndex] = prev[oldIndex] || false;
      delete newState[oldIndex];
      return newState;
    });
    
    setSocialLinkOptimizing((prev) => {
      const newState = { ...prev };
      newState[newIndex] = prev[oldIndex] || {};
      delete newState[oldIndex];
      return newState;
    });

    // Update compression progress keys
    setCompressionProgress((prev) => {
      const newState = { ...prev };
      if (prev[`hero-${oldIndex}`]) {
        newState[`hero-${newIndex}`] = prev[`hero-${oldIndex}`];
        delete newState[`hero-${oldIndex}`];
      }
      return newState;
    });
  }, []);

  // 🚀 ENHANCED: Hero image upload with full compression
  const compressHeroImage = useCallback(async (file: File, featureIndex: number) => {
    const progressKey = `hero-${featureIndex}`;
    
    try {
      // Set compression state
      setHeroImageOptimizing((prev) => ({ ...prev, [featureIndex]: true }));
      setCompressionProgress((prev) => ({ ...prev, [progressKey]: 0 }));

      // Show compression toast
      toast({
        title: "Compressing Hero Image",
        description: "Please wait while we optimize your hero image for the best quality...",
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCompressionProgress((prev) => ({
          ...prev,
          [progressKey]: Math.min((prev[progressKey] || 0) + 10, 80)
        }));
      }, 100);

      let optimizedFile: File;
      const originalSizeKB = Math.round(file.size / 1024);

      try {
        // Try WebP compression first
        optimizedFile = await optimizeImage(
          file, 
          HERO_IMAGE_SETTINGS.targetWidth, 
          HERO_IMAGE_SETTINGS.targetHeight, 
          HERO_IMAGE_SETTINGS.quality
        );
      } catch (error) {
        console.warn('WebP optimization failed, falling back to JPEG:', error);
        try {
          optimizedFile = await optimizeImageFallback(
            file, 
            HERO_IMAGE_SETTINGS.targetWidth, 
            HERO_IMAGE_SETTINGS.targetHeight, 
            HERO_IMAGE_SETTINGS.quality
          );
        } catch (fallbackError) {
          console.warn('Image optimization failed completely, using original:', fallbackError);
          optimizedFile = file;
        }
      }

      clearInterval(progressInterval);
      setCompressionProgress((prev) => ({ ...prev, [progressKey]: 100 }));

      const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
      const compressionRatio = Math.round(((file.size - optimizedFile.size) / file.size) * 100);

      // Show compression results
      if (optimizedFile !== file && compressionRatio > 0) {
        toast({
          title: "Hero Image Compressed Successfully!",
          description: `Reduced from ${originalSizeKB}KB to ${optimizedSizeKB}KB (${compressionRatio}% smaller)`,
        });
      }

      return optimizedFile;

    } catch (error) {
      console.error('Hero image compression failed:', error);
      toast({
        title: "Compression Failed",
        description: "Failed to compress hero image. Using original file.",
        variant: "destructive",
      });
      return file;
    } finally {
      // Clear states after delay
      setTimeout(() => {
        setHeroImageOptimizing((prev) => ({ ...prev, [featureIndex]: false }));
        setCompressionProgress((prev) => {
          const newState = { ...prev };
          delete newState[progressKey];
          return newState;
        });
      }, 1500);
    }
  }, [toast]);

  // 🚀 ENHANCED: Social link image compression
  const compressSocialLinkImage = useCallback(async (file: File, heroIndex: number, socialIndex: number) => {
    const progressKey = `social-${heroIndex}-${socialIndex}`;
    
    try {
      // Set compression state
      setSocialLinkOptimizing((prev) => ({
        ...prev,
        [heroIndex]: {
          ...prev[heroIndex],
          [socialIndex]: true
        }
      }));
      setCompressionProgress((prev) => ({ ...prev, [progressKey]: 0 }));

      toast({
        title: "Compressing Social Link Icon",
        description: "Optimizing social link icon for perfect square format...",
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setCompressionProgress((prev) => ({
          ...prev,
          [progressKey]: Math.min((prev[progressKey] || 0) + 15, 80)
        }));
      }, 80);

      let optimizedFile: File;
      const originalSizeKB = Math.round(file.size / 1024);

      try {
        optimizedFile = await optimizeImage(
          file, 
          SOCIAL_LINK_SETTINGS.targetWidth, 
          SOCIAL_LINK_SETTINGS.targetHeight, 
          SOCIAL_LINK_SETTINGS.quality
        );
      } catch (error) {
        console.warn('WebP optimization failed, falling back to JPEG:', error);
        try {
          optimizedFile = await optimizeImageFallback(
            file, 
            SOCIAL_LINK_SETTINGS.targetWidth, 
            SOCIAL_LINK_SETTINGS.targetHeight, 
            SOCIAL_LINK_SETTINGS.quality
          );
        } catch (fallbackError) {
          console.warn('Image optimization failed completely, using original:', fallbackError);
          optimizedFile = file;
        }
      }

      clearInterval(progressInterval);
      setCompressionProgress((prev) => ({ ...prev, [progressKey]: 100 }));

      const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
      const compressionRatio = Math.round(((file.size - optimizedFile.size) / file.size) * 100);

      if (optimizedFile !== file && compressionRatio > 0) {
        toast({
          title: "Social Icon Compressed!",
          description: `${originalSizeKB}KB → ${optimizedSizeKB}KB (${compressionRatio}% smaller)`,
        });
      }

      return optimizedFile;

    } catch (error) {
      console.error('Social link image compression failed:', error);
      toast({
        title: "Compression Failed", 
        description: "Failed to compress social link image. Using original file.",
        variant: "destructive",
      });
      return file;
    } finally {
      setTimeout(() => {
        setSocialLinkOptimizing((prev) => ({
          ...prev,
          [heroIndex]: {
            ...prev[heroIndex],
            [socialIndex]: false
          }
        }));
        setCompressionProgress((prev) => {
          const newState = { ...prev };
          delete newState[progressKey];
          return newState;
        });
      }, 1500);
    }
  }, [toast]);

  const HeroImageUploader = ({ featureIndex, langCode }: { featureIndex: number; langCode: string }) => {
    const { 
      imageFile, 
      imagePreview, 
      handleImageUpload, 
      handleImageRemove, 
      isOptimizing 
    } = useImageUpload({
      form,
      fieldPath: `${langCode}.${featureIndex}.image`,
      // 🚀 ENHANCED: Custom validation for hero images
      validate: (file) => {
        if (file.size > HERO_IMAGE_SETTINGS.maxFileSize) {
          return `Hero image must be less than ${HERO_IMAGE_SETTINGS.maxFileSize / (1024 * 1024)}MB`;
        }
        
        if (!file.type.startsWith('image/')) {
          return "Please upload a valid image file";
        }
        
        return true;
      },
      // 🚀 OPTIMIZATION: Custom settings for hero images
      enableOptimization: false, // We handle compression manually
    });

    const isCurrentlyOptimizing = heroImageOptimizing[featureIndex] || isOptimizing;
    const progress = compressionProgress[`hero-${featureIndex}`] || 0;

    return (
      <LabeledImageUploader
        label={`Hero Image ${isCurrentlyOptimizing ? '(Compressing...)' : ''}`}
        helperText={`High quality hero image (max ${HERO_IMAGE_SETTINGS.maxFileSize / (1024 * 1024)}MB, auto-compressed to ${HERO_IMAGE_SETTINGS.quality * 100}% quality)${progress > 0 && progress < 100 ? ` - ${progress}%` : ''}`}
        imageValue={imagePreview || form.watch(`${langCode}.${featureIndex}.image`) || ""}
        inputId={`hero-image-${langCode}-${featureIndex}`}
        onUpload={async (file) => {
          try {
            // 🚀 ENHANCED: Use custom compression
            const compressedFile = await compressHeroImage(file, featureIndex);
            
            // Use the compressed file for upload
            await handleImageUpload(compressedFile);
            
            setHeroImages((prev) => {
              const newImages = [...prev];
              newImages[featureIndex] = compressedFile;
              return newImages;
            });
          } catch (error) {
            console.error('Hero image upload failed:', error);
            toast({
              title: "Upload Failed",
              description: "Failed to upload hero image. Please try again.",
              variant: "destructive",
            });
          }k
        }}
        onRemove={() => {
          handleImageRemove();
          handleHeroImageRemove(featureIndex);
        }}
        altText={`Hero ${featureIndex + 1} image`}
        disabled={isCurrentlyOptimizing}
        showProgress={progress > 0 && progress < 100}
        progressValue={progress}
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
    const { 
      imageFile, 
      imagePreview, 
      handleImageUpload, 
      handleImageRemove, 
      isOptimizing 
    } = useImageUpload({
      form,
      fieldPath: `${langCode}.${heroIndex}.socialLinks.${socialLinkIndex}.image`,
      // 🚀 ENHANCED: Custom validation for social link images
      validate: (file) => {
        if (file.size > SOCIAL_LINK_SETTINGS.maxFileSize) {
          return `Social link image must be less than ${SOCIAL_LINK_SETTINGS.maxFileSize / (1024 * 1024)}MB`;
        }
        
        if (!file.type.startsWith('image/')) {
          return "Please upload a valid image file";
        }
        
        return true;
      },
      // 🚀 OPTIMIZATION: Custom settings for social link images
      enableOptimization: false, // We handle compression manually
    });

    const isCurrentlyOptimizing = socialLinkOptimizing[heroIndex]?.[socialLinkIndex] || isOptimizing;
    const progress = compressionProgress[`social-${heroIndex}-${socialLinkIndex}`] || 0;

    return (
      <LabeledImageUploader
        label={`Social Link ${socialLinkIndex + 1} Image ${isCurrentlyOptimizing ? '(Compressing...)' : ''}`}
        helperText={`Small icon image (max ${SOCIAL_LINK_SETTINGS.maxFileSize / (1024 * 1024)}MB, optimized to ${SOCIAL_LINK_SETTINGS.targetWidth}x${SOCIAL_LINK_SETTINGS.targetHeight}px)${progress > 0 && progress < 100 ? ` - ${progress}%` : ''}`}
        imageValue={imagePreview || form.watch(`${langCode}.${heroIndex}.socialLinks.${socialLinkIndex}.image`) || ""}
        inputId={`social-link-image-${langCode}-${heroIndex}-${socialLinkIndex}`}
        onUpload={async (file) => {
          try {
            // 🚀 ENHANCED: Use custom compression for social links
            const compressedFile = await compressSocialLinkImage(file, heroIndex, socialLinkIndex);
            
            await handleImageUpload(compressedFile);
            
            setSocialLinkImages((prev) => {
              const newSocialImages = { ...prev };
              newSocialImages[heroIndex] = newSocialImages[heroIndex] || [];
              newSocialImages[heroIndex][socialLinkIndex] = compressedFile;
              return newSocialImages;
            });
          } catch (error) {
            console.error('Social link image upload failed:', error);
            toast({
              title: "Upload Failed",
              description: "Failed to upload social link image. Please try again.",
              variant: "destructive",
            });
          }
        }}
        onRemove={() => {
          handleImageRemove();
          setSocialLinkImages((prev) => {
            const newSocialImages = { ...prev };
            newSocialImages[heroIndex] = newSocialImages[heroIndex] || [];
            newSocialImages[heroIndex][socialLinkIndex] = null;
            return newSocialImages;
          });
          
          // Clear optimization state
          setSocialLinkOptimizing((prev) => ({
            ...prev,
            [heroIndex]: {
              ...prev[heroIndex],
              [socialLinkIndex]: false
            }
          }));
        }}
        altText={`Social Link ${socialLinkIndex + 1} image`}
        disabled={isCurrentlyOptimizing}
        imageHeight="h-32"
        showProgress={progress > 0 && progress < 100}
        progressValue={progress}
      />
    );
  };

  // 🚀 ENHANCED: Utility functions for checking optimization states
  const isHeroImageOptimizing = useCallback((index: number) => {
    return heroImageOptimizing[index] || false;
  }, [heroImageOptimizing]);

  const isSocialLinkOptimizing = useCallback((heroIndex: number, socialIndex: number) => {
    return socialLinkOptimizing[heroIndex]?.[socialIndex] || false;
  }, [socialLinkOptimizing]);

  // 🚀 ENHANCED: Get comprehensive compression statistics
  const getCompressionStats = useCallback(() => {
    const heroCount = heroImages.filter(img => img !== null).length;
    const socialCount = Object.values(socialLinkImages).reduce(
      (total, socialArray) => total + socialArray.filter(img => img !== null).length, 
      0
    );
    
    const optimizingHeroes = Object.values(heroImageOptimizing).filter(Boolean).length;
    const optimizingSocials = Object.values(socialLinkOptimizing).reduce(
      (total, heroSocial) => total + Object.values(heroSocial).filter(Boolean).length,
      0
    );
    
    return {
      heroImagesCount: heroCount,
      socialLinksCount: socialCount,
      totalImagesCount: heroCount + socialCount,
      isAnyOptimizing: optimizingHeroes > 0 || optimizingSocials > 0,
      optimizingCount: optimizingHeroes + optimizingSocials,
      compressionSettings: {
        hero: HERO_IMAGE_SETTINGS,
        social: SOCIAL_LINK_SETTINGS
      }
    };
  }, [heroImages, socialLinkImages, heroImageOptimizing, socialLinkOptimizing]);

  // 🚀 NEW: Get overall compression progress
  const getOverallProgress = useCallback(() => {
    const progressValues = Object.values(compressionProgress);
    if (progressValues.length === 0) return 0;
    
    const totalProgress = progressValues.reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / progressValues.length);
  }, [compressionProgress]);

  return {
    // Original exports
    heroImages,
    socialLinkImages,
    handleHeroImageRemove,
    updateHeroImageIndices,
    HeroImageUploader,
    SocialLinkImageUploader,
    
    // 🚀 ENHANCED: Enhanced exports
    isHeroImageOptimizing,
    isSocialLinkOptimizing,
    getCompressionStats,
    getOverallProgress,
    heroImageOptimizing,
    socialLinkOptimizing,
    compressionProgress,
    
    // 🚀 NEW: Manual compression methods
    compressHeroImage,
    compressSocialLinkImage,
  };
};