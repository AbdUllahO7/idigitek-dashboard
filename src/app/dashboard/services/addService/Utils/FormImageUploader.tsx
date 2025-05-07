import React, { useState, useEffect, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from '@/src/hooks/use-toast';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Options for the useFormImageUpload hook
 */
interface UseFormImageUploadOptions {
  /**
   * Form instance from react-hook-form
   */
  form: UseFormReturn<any>;
  
  /**
   * Form field path for the image value 
   * (e.g., "logo" or "sections[0].image")
   */
  fieldPath: string;
  
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
 * Hook for managing form-integrated image upload
 */
export const useFormImageUpload = (options: UseFormImageUploadOptions) => {
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
  
  // Update the preview when initialImageUrl changes
  useEffect(() => {
    if (initialImageUrl) {
      setImagePreview(initialImageUrl);
      form.setValue(fieldPath, initialImageUrl, { shouldDirty: false });
    }
  }, [initialImageUrl, form, fieldPath]);
  
  /**
   * Handle image upload
   */
  const handleImageUpload = useCallback((file: File) => {
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

    // Clean up previous preview URL if it exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    // Store the file in state
    setImageFile(file);

    // Create a temporary URL for preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Set form value for the field path
    form.setValue(fieldPath, file, { shouldDirty: true });

    // Call the onUpload callback if provided
    if (onUpload) {
      onUpload(file, previewUrl);
    }

    toast({
      title: "Image selected",
      description: "Image has been selected successfully",
    });
  }, [fieldPath, form, imagePreview, onUpload, validate]);

  /**
   * Handle image removal
   */
  const handleImageRemove = useCallback(() => {
    // Clean up the preview URL if it's a blob
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(null);
    setImagePreview(null);
    
    // Clear form value
    form.setValue(fieldPath, "", { shouldDirty: true });
    
    // Call the onRemove callback if provided
    if (onRemove) {
      onRemove();
    }
    
    toast({
      title: "Image removed",
      description: "Image has been removed",
    });
  }, [fieldPath, form, imagePreview, onRemove]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return {
    imageFile,
    imagePreview,
    handleImageUpload,
    handleImageRemove,
  };
};

/**
 * Props for the FormImageUploader component
 */
interface FormImageUploaderProps {
  /**
   * Form instance from react-hook-form
   */
  form: UseFormReturn<any>;
  
  /**
   * Form field path for the image
   */
  fieldPath: string;
  
  /**
   * Label for the image field
   */
  label?: string;
  
  /**
   * Helper text below the label
   */
  helperText?: string;
  
  /**
   * Initial image URL
   */
  initialImageUrl?: string;
  
  /**
   * Custom placeholder text
   */
  placeholderText?: string;
  
  /**
   * Custom description text
   */
  descriptionText?: string;
  
  /**
   * Alt text for the image
   */
  altText?: string;
  
  /**
   * Custom height for the image preview
   */
  imageHeight?: string;
  
  /**
   * Accepted file types
   */
  acceptedTypes?: string;
  
  /**
   * Whether the upload is in progress
   */
  isUploading?: boolean;
  
  /**
   * Custom validation function
   */
  validate?: (file: File) => boolean | string;
  
  /**
   * Callback when a file is uploaded
   */
  onUpload?: (file: File, previewUrl: string) => void;
  
  /**
   * Callback when the image is removed
   */
  onRemove?: () => void;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Form-integrated image uploader component
 */
const FormImageUploader: React.FC<FormImageUploaderProps> = ({
  form,
  fieldPath,
  label,
  helperText,
  initialImageUrl,
  placeholderText = "Click to upload image",
  descriptionText = "SVG, PNG, JPG or GIF (max. 2MB)",
  altText = "Image preview",
  imageHeight = "h-48",
  acceptedTypes = "image/*",
  isUploading = false,
  validate,
  onUpload,
  onRemove,
  className = "",
}) => {
  // Generate a unique ID for the file input
  const inputId = `file-upload-${fieldPath.replace(/\[|\]|\./g, '-')}`;
  
  // Use the form image upload hook
  const { 
    imagePreview, 
    handleImageUpload, 
    handleImageRemove 
  } = useFormImageUpload({
    form,
    fieldPath,
    initialImageUrl,
    onUpload,
    onRemove,
    validate,
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={inputId} className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {label}
        </Label>
      )}
      
      {helperText && (
        <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1">{helperText}</p>
      )}
      
      <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt={altText}
                className={`w-full ${imageHeight} object-cover rounded-md`}
                onError={() => {
                  console.error("Failed to load image:", imagePreview);
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
                onClick={handleImageRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  onClick={() => document.getElementById(inputId)?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Change Image'}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-blue-400 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => !isUploading && document.getElementById(inputId)?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-sm font-medium dark:text-white">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground dark:text-gray-400 mb-2" />
                  <p className="text-sm font-medium dark:text-white">{placeholderText}</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{descriptionText}</p>
                </>
              )}
            </div>
          )}
          <input 
            id={inputId} 
            type="file" 
            accept={acceptedTypes} 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
            tabIndex={-1}
          />
        </div>
      </Card>
    </div>
  );
};

export default FormImageUploader;