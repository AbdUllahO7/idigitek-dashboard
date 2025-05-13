import React, { useState, useEffect } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from '@/src/hooks/use-toast';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Props for the WebSiteImageUploader component
 */
interface WebSiteImageUploaderProps {
  /**
   * Image URL for preview
   */
  imageUrl?: string;
  
  /**
   * Handler for when an image is selected
   * This will receive the actual File object
   */
  onImageSelect?: (file: File) => void;
  
  /**
   * Handler for when an image is removed
   */
  onImageRemove?: () => void;
  
  /**
   * Whether an upload is in progress
   */
  isUploading?: boolean;
  
  /**
   * Label text for the uploader
   */
  label?: string;
  
  /**
   * Helper text below the label
   */
  helperText?: string;
  
  /**
   * Text shown when no image is selected
   */
  placeholderText?: string;
  
  /**
   * Description text below the placeholder
   */
  descriptionText?: string;
  
  /**
   * Alt text for the image preview
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
   * Custom validation function
   */
  validate?: (file: File) => boolean | string;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Image uploader component specifically for WebSite model
 */
const WebSiteImageUploader: React.FC<WebSiteImageUploaderProps> = ({
  imageUrl,
  onImageSelect,
  onImageRemove,
  isUploading = false,
  label = "Upload Image",
  helperText,
  placeholderText = "Click to upload image",
  descriptionText = "SVG, PNG, JPG or GIF (max. 2MB)",
  altText = "Image preview",
  imageHeight = "h-48",
  acceptedTypes = "image/*",
  validate,
  className = "",
}) => {
  // State for preview URL (created from the selected file)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Generate a unique ID for the file input
  const inputId = `file-upload-${Math.random().toString(36).substring(2, 9)}`;
  
  // Update preview when imageUrl prop changes
  useEffect(() => {
    setPreviewUrl(imageUrl || null);
  }, [imageUrl]);

  // Handle file validation and selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    // Call the onImageSelect callback with the file
    if (onImageSelect) {
      onImageSelect(file);
    }
    
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  // Handle image removal
  const handleImageRemove = () => {
    // Call the onImageRemove callback
    if (onImageRemove) {
      onImageRemove();
    }
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
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt={altText}
                className={`w-full ${imageHeight} object-cover rounded-md`}
                onError={() => {
                  console.error("Failed to load image:", previewUrl);
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
          />
        </div>
      </Card>
    </div>
  );
};

export default WebSiteImageUploader;