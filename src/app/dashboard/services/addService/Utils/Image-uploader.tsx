import { useCallback, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from '@/src/hooks/use-toast';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Options for the useImageUpload hook
 */
interface UseImageUploadOptions {
  /**
   * Form instance from react-hook-form
   */
  form: UseFormReturn<any>;
  
  /**
   * Form field path for the image value 
   * (e.g., "backgroundImage" or language-specific path)
   */
  fieldPath?: string;
  
  /**
   * Callback when an image is uploaded
   */
  onUpload?: (file: File, previewUrl: string) => void;
  
  /**
   * Callback when an image is removed
   */
  onRemove?: () => void;
  
  /**
   * Initial image URL for preview
   */
  initialImageUrl?: string;
  
  /**
   * Custom validation for file uploads
   */
  validate?: (file: File) => boolean | string;
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
    validate 
  } = options;
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl || null);
  
  /**
   * Handle image upload
   */
  const handleImageUpload = (file: File) => {
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

    // Store the file in state
    setImageFile(file);

    // Create a temporary URL for preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Set form value if fieldPath is provided
    if (fieldPath) {
      form.setValue(fieldPath, previewUrl, { shouldDirty: true });
    }

    // Call the onUpload callback if provided
    if (onUpload) {
      onUpload(file, previewUrl);
    }

    toast({
      title: "Image selected",
      description: "Image has been selected successfully",
    });

    // Return cleanup function
    return () => URL.revokeObjectURL(previewUrl);
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
    
    toast({
      title: "Image removed",
      description: "Image has been removed",
    });
  };
  
  return {
    imageFile,
    imagePreview,
    handleImageUpload,
    handleImageRemove,
  };
};

/**
 * Props for the SimpleImageUploader component
 */
interface SimpleImageUploaderProps {
  /**
   * Image URL for preview
   */
  imageValue?: string;
  
  /**
   * Unique ID for the file input
   */
  inputId: string;
  
  /**
   * Handler for file upload
   */
  onUpload: (file: File) => void;
  
  /**
   * Handler for image removal
   */
  onRemove: () => void;
  
  /**
   * Alt text for the image
   */
  altText?: string;
  
  /**
   * Custom placeholder text
   */
  placeholderText?: string;
  
  /**
   * Custom description text
   */
  descriptionText?: string;
  
  /**
   * Custom height for the image preview
   */
  imageHeight?: string;
  
  /**
   * Accepted file types
   */
  acceptedTypes?: string;
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
  descriptionText = "SVG, PNG, JPG or GIF (max. 2MB)",
  imageHeight = "h-48",
  acceptedTypes = "image/*"
}: SimpleImageUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {imageValue ? (
          <div className="relative">
            <img
              src={imageValue}
              alt={altText}
              className={`w-full ${imageHeight} object-cover rounded-md`}
              key={imageValue} // Force re-render when imageValue changes
              onError={() => {
                console.error("Failed to load image:", imageValue);
                toast({
                  title: "Image Load Error",
                  description: "Failed to load the image. Please check the URL or try uploading again.",
                  variant: "destructive",
                });
              }}
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => document.getElementById(inputId)?.click()}
              >
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">{placeholderText}</p>
            <p className="text-xs text-muted-foreground mt-1">{descriptionText}</p>
          </div>
        )}
        <input id={inputId} type="file" accept={acceptedTypes} className="hidden" onChange={handleFileChange} />
      </div>
    </Card>
  );
};

/**
 * Props for the LabeledImageUploader component
 */
interface LabeledImageUploaderProps extends SimpleImageUploaderProps {
  /**
   * Label text for the image uploader
   */
  label: string;
  
  /**
   * Optional helper text
   */
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
  
  /**
   * Handle image upload for a specific feature
   */
  const handleFeatureImageUpload = (featureIndex: number, file: File) => {
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

    // Read file as data URL for preview
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

        // Store the file in our local state
        setFeatureImages((prev) => ({ ...prev, [featureIndex]: file }));

        toast({
          title: "Image uploaded",
          description: "Image has been uploaded successfully for all languages",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the selected file",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
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

    toast({
      title: "Image removed",
      description: "Image has been removed from all languages",
    });
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
    helperText = "(applies to all languages)" 
  }: { 
    featureIndex: number;
    label?: string;
    helperText?: string;
  }) => {
    // Get image value from first language
    const firstLangCode = Object.keys(form.getValues())[0];
    const features = form.getValues()[firstLangCode] || [];
    const imageValue = features[featureIndex]?.content?.image || "";

    const inputId = `file-upload-feature-${featureIndex}`;

    return (
      <LabeledImageUploader
        label={label}
        helperText={helperText}
        imageValue={imageValue}
        inputId={inputId}
        onUpload={(file) => handleFeatureImageUpload(featureIndex, file)}
        onRemove={() => handleFeatureImageRemove(featureIndex)}
        altText={`Feature ${featureIndex + 1} image`}
      />
    );
  };
  
  return {
    featureImages,
    handleFeatureImageUpload,
    handleFeatureImageRemove,
    updateFeatureImageIndices,
    FeatureImageUploader,
  };
  };

  interface ImageUploaderOptions {
    form: UseFormReturn<any>;
    fieldPath: string;
    initialImageUrl?: string;
    onUpload?: (file: File, previewUrl: string) => void;
    onRemove?: () => void;
    validate?: (file: File) => boolean | string;
  }
  
  export const useImageUploader = ({ form, fieldPath, initialImageUrl, onUpload, onRemove, validate }: ImageUploaderOptions) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    
    // Handle image upload
    const handleImageUpload = useCallback((e: { target: { files: any[]; }; }) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Validate file if validation function provided
      if (validate) {
        const validationResult = validate(file);
        if (typeof validationResult === 'string') {
          alert(validationResult);
          return;
        }
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(previewUrl);
      
      // Call onUpload callback if provided
      if (onUpload) {
        onUpload(file, previewUrl);
      }
    }, [validate, onUpload]);
    
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
    };
  };