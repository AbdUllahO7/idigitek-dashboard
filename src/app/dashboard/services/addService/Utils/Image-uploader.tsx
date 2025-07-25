import { useCallback, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from '@/src/hooks/use-toast';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { useTranslation } from 'react-i18next';

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// 🚀 FIXED: Proper compression settings
const STANDARD_TARGET_WIDTH = 1200; // Reduced from 1800
const STANDARD_TARGET_HEIGHT = 1000; // Reduced from 1600
const THUMBNAIL_TARGET_WIDTH = 400;
const THUMBNAIL_TARGET_HEIGHT = 300;
const OPTIMIZATION_QUALITY = 0.8; // FIXED: 80% quality instead of 100%
const THUMBNAIL_QUALITY = 0.75; // 75% quality for thumbnails

// 🚀 ENHANCED: Image optimization utility with better compression
const optimizeImage = async (
  file: File, 
  targetWidth: number = STANDARD_TARGET_WIDTH, 
  targetHeight: number = STANDARD_TARGET_HEIGHT,
  quality: number = OPTIMIZATION_QUALITY
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;

      // 🚀 ENHANCED: Better dimension calculation for compression
      if (img.width > targetWidth || img.height > targetHeight) {
        if (aspectRatio > targetWidth / targetHeight) {
          // Image is wider relative to target
          newWidth = targetWidth;
          newHeight = targetWidth / aspectRatio;
        } else {
          // Image is taller relative to target
          newHeight = targetHeight;
          newWidth = targetHeight * aspectRatio;
        }
      } else {
        // Image is smaller than target, don't upscale
        newWidth = img.width;
        newHeight = img.height;
      }

      // Ensure dimensions are integers
      newWidth = Math.round(newWidth);
      newHeight = Math.round(newHeight);

      canvas.width = newWidth;
      canvas.height = newHeight;

      // 🚀 ENHANCED: Better image drawing with smoothing
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      }

      // Convert to WebP with compression
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

          const originalSizeKB = Math.round(file.size / 1024);
          const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
          const compressionRatio = Math.round(((file.size - optimizedFile.size) / file.size) * 100);
          
          console.log(`🚀 Image optimized: ${originalSizeKB}KB → ${optimizedSizeKB}KB (${compressionRatio}% compression)`);
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

// 🚀 ENHANCED: Fallback for older browsers (JPEG) with better compression
const optimizeImageFallback = async (
  file: File, 
  targetWidth: number = STANDARD_TARGET_WIDTH, 
  targetHeight: number = STANDARD_TARGET_HEIGHT,
  quality: number = OPTIMIZATION_QUALITY
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;

      // 🚀 ENHANCED: Same dimension calculation as WebP version
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

          const originalSizeKB = Math.round(file.size / 1024);
          const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
          const compressionRatio = Math.round(((file.size - optimizedFile.size) / file.size) * 100);
          
          console.log(`🚀 Image optimized (JPEG fallback): ${originalSizeKB}KB → ${optimizedSizeKB}KB (${compressionRatio}% compression)`);
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

/**
 * Options for the useImageUpload hook
 */
interface UseImageUploadOptions {
  form: UseFormReturn<any>;
  fieldPath?: string;
  onUpload?: (file: File, previewUrl: string) => void;
  onRemove?: () => void;
  initialImageUrl?: string;
  validate?: (file: File) => boolean | string;
  // 🚀 OPTIMIZATION: Add optimization options
  enableOptimization?: boolean;
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
}

/**
 * Hook for managing image upload state and handlers
 */
export const useImageUpload = (options: UseImageUploadOptions) => {
  const { 
    form, 
    fieldPath, 
    onUpload, 
    onRemove, 
    initialImageUrl,
    validate,
    enableOptimization = true, // 🚀 Enable by default
    targetWidth = STANDARD_TARGET_WIDTH,
    targetHeight = STANDARD_TARGET_HEIGHT,
    quality = OPTIMIZATION_QUALITY
  } = options;
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl || null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  /**
   * Handle image upload with optimization
   */
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Check file size (max 2MB for original file)
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    // Run custom validation if provided
    if (validate) {
      const validationResult = validate(file);
      if (validationResult !== true) {
        const errorMessage = typeof validationResult === 'string' 
          ? validationResult 
          : "File validation failed";
        
        toast({
          title: "Invalid file",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      let finalFile = file;

      // 🚀 OPTIMIZATION: Optimize image if enabled
      if (enableOptimization) {
        setIsOptimizing(true);
        
     
        
        try {
          finalFile = await optimizeImage(file, targetWidth, targetHeight, quality);
          

          
        
        } catch (error) {
          console.warn('WebP optimization failed, falling back to JPEG:', error);
          try {
            finalFile = await optimizeImageFallback(file, targetWidth, targetHeight, quality);
            
         
         
          } catch (fallbackError) {
            console.warn('Image optimization failed completely, using original:', fallbackError);
            finalFile = file;
            toast({
              title: "Compression failed",
              description: "Using original image without compression",
              variant: "destructive",
            });
          }
        }
      }

      // Store the optimized file in state
      setImageFile(finalFile);

      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(finalFile);
      setImagePreview(previewUrl);

      // Set form value if fieldPath is provided
      if (fieldPath) {
        form.setValue(fieldPath, previewUrl, { shouldDirty: true });
      }

      // Call the onUpload callback if provided
      if (onUpload) {
        onUpload(finalFile, previewUrl);
      }

      // Return cleanup function
      return () => URL.revokeObjectURL(previewUrl);

    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  /**
   * Handle image removal
   */
  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    
    // Clear form value if fieldPath is provided
    if (fieldPath) {
      form.setValue(fieldPath, "", { shouldDirty: true });
    }
    
    // Call the onRemove callback if provided
    if (onRemove) {
      onRemove();
    }
  };
  
  return {
    imageFile,
    imagePreview,
    handleImageUpload,
    handleImageRemove,
    isOptimizing, // 🚀 Export optimization state
  };
};

/**
 * Props for the SimpleImageUploader component
 */
interface SimpleImageUploaderProps {
  imageValue?: string;
  inputId: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  altText?: string;
  placeholderText?: string;
  descriptionText?: string;
  imageHeight?: string;
  acceptedTypes?: string;
  disabled?: boolean; // 🚀 Add disabled prop
}

/**
 * Reusable simple image uploader component with enhanced customization
 */
export const SimpleImageUploader = ({
  imageValue,
  inputId,
  onUpload,
  onRemove,
  altText = "Image preview",
  placeholderText = "Click to upload image",
  descriptionText = "SVG, PNG, JPG or GIF (max. 2MB, auto-compressed to 80% quality)",
  imageHeight = "h-48",
  acceptedTypes = "image/*",
  disabled = false
}: SimpleImageUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onUpload(file);
    }
  };

  const {t} = useTranslation()

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {imageValue ? (
          <div className="relative">
            <img
              src={imageValue}
              alt={altText}
              className={`w-full ${imageHeight} object-cover rounded-md ${disabled ? 'opacity-50' : ''}`}
              key={imageValue}
              onError={() => {
                console.error("Failed to load image:", imageValue);
              }}
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={onRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => document.getElementById(inputId)?.click()}
                disabled={disabled}
              >
                {disabled ? 'Compressing...' : t('SectionTable.ChangeImage')}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !disabled && document.getElementById(inputId)?.click()}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">{disabled ? 'Compressing...' : placeholderText}</p>
            <p className="text-xs text-muted-foreground mt-1">{descriptionText}</p>
          </div>
        )}
        <input 
          id={inputId} 
          type="file" 
          accept={acceptedTypes} 
          className="hidden" 
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    </Card>
  );
};

/**
 * Props for the LabeledImageUploader component
 */
interface LabeledImageUploaderProps extends SimpleImageUploaderProps {
  label: string;
  helperText?: string;
}

/**
 * Image uploader with a label
 */
export const LabeledImageUploader = ({
  label,
  helperText,
  ...uploaderProps
}: LabeledImageUploaderProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        {label}
      </Label>
      {helperText && (
        <p className="text-xs text-muted-foreground mb-1">{helperText}</p>
      )}
      <SimpleImageUploader {...uploaderProps} />
    </div>
  );
};

/**
 * Custom hook for handling feature images across all languages
 */
export const useFeatureImages = (form: UseFormReturn<any>) => {
  const [featureImages, setFeatureImages] = useState<Record<number, File>>({});
  const [isOptimizing, setIsOptimizing] = useState<Record<number, boolean>>({});
  
  /**
   * Handle image upload for a specific feature with optimization
   */
  const handleFeatureImageUpload = async (featureIndex: number, file: File) => {
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

    try {
      // 🚀 OPTIMIZATION: Show loading state
      setIsOptimizing(prev => ({ ...prev, [featureIndex]: true }));

      let optimizedFile: File;
      try {
        // 🚀 FIXED: Use proper compression for feature images
        optimizedFile = await optimizeImage(file, THUMBNAIL_TARGET_WIDTH, THUMBNAIL_TARGET_HEIGHT, THUMBNAIL_QUALITY);
        
        const originalSizeKB = Math.round(file.size / 1024);
        const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
        const compressionRatio = Math.round(((file.size - optimizedFile.size) / file.size) * 100);
        
        toast({
          title: "Feature image compressed!",
          description: `${originalSizeKB}KB → ${optimizedSizeKB}KB (${compressionRatio}% smaller)`,
        });
      } catch (error) {
        console.warn('WebP optimization failed, falling back to JPEG:', error);
        try {
          optimizedFile = await optimizeImageFallback(file, THUMBNAIL_TARGET_WIDTH, THUMBNAIL_TARGET_HEIGHT, THUMBNAIL_QUALITY);
        } catch (fallbackError) {
          console.warn('Image optimization failed completely, using original:', fallbackError);
          optimizedFile = file;
          toast({
            title: "Compression failed",
            description: "Using original image without compression",
            variant: "destructive",
          });
        }
      }

      // Convert optimized file to data URL for form storage
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target.result as string;

          // Update the image for this feature across all languages
          const formValues = form.getValues();

          Object.keys(formValues).forEach((langCode) => {
            if (formValues[langCode] && formValues[langCode][featureIndex]) {
              form.setValue(`${langCode}.${featureIndex}.content.image` as any, imageData);
            }
          });

          // Store the optimized file in our local state
          setFeatureImages((prev) => ({ ...prev, [featureIndex]: optimizedFile }));
        }
      };

      reader.readAsDataURL(optimizedFile);

    } catch (error) {
      console.error('Feature image optimization failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process feature image. Please try again.",
        variant: "destructive",
      });
    } finally {
      // 🚀 Clear loading state
      setIsOptimizing(prev => ({ ...prev, [featureIndex]: false }));
    }
  };

  /**
   * Handle image removal for a specific feature
   */
  const handleFeatureImageRemove = (featureIndex: number) => {
    // Remove the image for this feature across all languages
    const formValues = form.getValues();

    Object.keys(formValues).forEach((langCode) => {
      if (formValues[langCode] && formValues[langCode][featureIndex]) {
        form.setValue(`${langCode}.${featureIndex}.content.image` as any, "");
      }
    });

    // Remove from our local state
    const newFeatureImages = { ...featureImages };
    delete newFeatureImages[featureIndex];
    setFeatureImages(newFeatureImages);
  };
  
  /**
   * Update feature image indices when features are reordered
   */
  const updateFeatureImageIndices = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex || !featureImages[oldIndex]) return;
    
    const newFeatureImages = { ...featureImages };
    newFeatureImages[newIndex] = newFeatureImages[oldIndex];
    delete newFeatureImages[oldIndex];
    
    setFeatureImages(newFeatureImages);
  };
  
  /**
   * Get a component for uploading a feature image
   */
  const FeatureImageUploader = ({ 
    featureIndex,
    label = "Feature Image",
    helperText = "(auto-compressed for all languages)" 
  }: { 
    featureIndex: number;
    label?: string;
    helperText?: string;
  }) => {
    // Get image value from first language
    const firstLangCode = Object.keys(form.getValues())[0];
    const features = form.getValues()[firstLangCode] || [];
    const imageValue = features[featureIndex]?.content?.image || "";
    const isCurrentlyOptimizing = isOptimizing[featureIndex] || false;

    const inputId = `file-upload-feature-${featureIndex}`;

    return (
      <LabeledImageUploader
        label={`${label} ${isCurrentlyOptimizing ? '(Compressing...)' : ''}`}
        helperText={helperText}
        imageValue={imageValue}
        inputId={inputId}
        onUpload={(file) => handleFeatureImageUpload(featureIndex, file)}
        onRemove={() => handleFeatureImageRemove(featureIndex)}
        altText={`Feature ${featureIndex + 1} image`}
        disabled={isCurrentlyOptimizing}
      />
    );
  };
  
  return {
    featureImages,
    handleFeatureImageUpload,
    handleFeatureImageRemove,
    updateFeatureImageIndices,
    FeatureImageUploader,
    isOptimizing, // 🚀 Export optimization state
  };
};

interface ImageUploaderOptions {
  form: UseFormReturn<any>;
  fieldPath: string;
  initialImageUrl?: string;
  onUpload?: (file: File, previewUrl: string) => void;
  onRemove?: () => void;
  validate?: (file: File) => boolean | string;
  // 🚀 OPTIMIZATION: Add optimization options
  enableOptimization?: boolean;
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
}

export const useImageUploader = ({ 
  form, 
  fieldPath, 
  initialImageUrl, 
  onUpload, 
  onRemove, 
  validate,
  enableOptimization = true,
  targetWidth = STANDARD_TARGET_WIDTH,
  targetHeight = STANDARD_TARGET_HEIGHT,
  quality = OPTIMIZATION_QUALITY
}: ImageUploaderOptions) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Handle image upload with optimization
  const handleImageUpload = useCallback(async (e: { target: { files: any[]; }; }) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file if validation function provided
    if (validate) {
      const validationResult = validate(file);
      if (typeof validationResult === 'string') {
        toast({
          title: "Invalid file",
          description: validationResult,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      let finalFile = file;

      // 🚀 OPTIMIZATION: Optimize image if enabled
      if (enableOptimization) {
        setIsOptimizing(true);
        
        toast({
          title: "Compressing image...",
          description: "Please wait while we optimize your image",
        });
        
        try {
          finalFile = await optimizeImage(file, targetWidth, targetHeight, quality);
          
          const originalSizeKB = Math.round(file.size / 1024);
          const optimizedSizeKB = Math.round(finalFile.size / 1024);
          const compressionRatio = Math.round(((file.size - finalFile.size) / file.size) * 100);
          
          toast({
            title: "Image compressed successfully!",
            description: `Reduced from ${originalSizeKB}KB to ${optimizedSizeKB}KB (${compressionRatio}% smaller)`,
          });
        } catch (error) {
          console.warn('WebP optimization failed, falling back to JPEG:', error);
          try {
            finalFile = await optimizeImageFallback(file, targetWidth, targetHeight, quality);
          } catch (fallbackError) {
            console.warn('Image optimization failed completely, using original:', fallbackError);
            finalFile = file;
            toast({
              title: "Compression failed",
              description: "Using original image without compression",
              variant: "destructive",
            });
          }
        }
      }

      // Create preview URL from optimized file
      const previewUrl = URL.createObjectURL(finalFile);
      setImageFile(finalFile);
      setImagePreview(previewUrl);
      
      // Update form with optimized image URL
      form.setValue(fieldPath, previewUrl, { shouldDirty: true });
      
      // Call onUpload callback if provided
      if (onUpload) {
        onUpload(finalFile, previewUrl);
      }

    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [validate, onUpload, form, fieldPath, enableOptimization, targetWidth, targetHeight, quality]);
  
  // Handle image removal
  const handleImageRemove = useCallback(() => {
    setImageFile(null);
    setImagePreview(undefined);
    form.setValue(fieldPath, '', { shouldDirty: true });
    
    // Call onRemove callback if provided
    if (onRemove) {
      onRemove();
    }
  }, [form, fieldPath, onRemove]);
  
  // Initialize with initial image URL if provided
  useState(() => {
    if (initialImageUrl) {
      form.setValue(fieldPath, initialImageUrl);
    }
  });
  
  return {
    imageFile,
    imagePreview,
    handleImageUpload,
    handleImageRemove,
    isOptimizing, 
  };
};