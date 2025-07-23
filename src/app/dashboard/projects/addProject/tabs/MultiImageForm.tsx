"use client"

import type React from "react"
import { forwardRef, useEffect, useState, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/src/components/ui/form"
import { Button } from "@/src/components/ui/button"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import apiClient from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { Loader2, Save, Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import type { ContentElement } from "@/src/api/types/hooks/content.types"
import type { SubSection } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import * as z from "zod"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { Card, CardContent } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { createFormRef } from "../../../services/addService/Utils/Expose-form-data"
import { useTranslation } from "react-i18next"

// 🚀 IMAGE COMPRESSION SETTINGS
const COMPRESSION_SETTINGS = {
  targetWidth: 1200,
  targetHeight: 800,
  quality: 0.8,
  maxFileSize: 3 * 1024 * 1024, // 3MB max before compression
}

// 🚀 IMAGE OPTIMIZATION UTILITY
const optimizeImage = async (
  file: File, 
  targetWidth: number = COMPRESSION_SETTINGS.targetWidth, 
  targetHeight: number = COMPRESSION_SETTINGS.targetHeight,
  quality: number = COMPRESSION_SETTINGS.quality
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

// 🚀 FALLBACK FOR OLDER BROWSERS (JPEG)
const optimizeImageFallback = async (
  file: File, 
  targetWidth: number = COMPRESSION_SETTINGS.targetWidth, 
  targetHeight: number = COMPRESSION_SETTINGS.targetHeight,
  quality: number = COMPRESSION_SETTINGS.quality
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

// Define the image schema
const imageSchema = z
  .object({
    imageUrl: z.string().optional(),
    file: z.custom<File>((file) => file instanceof File).optional(),
  })
  .strict()

type ImageType = {
  imageUrl?: string;
  file?: File;
}

// Define the form schema with multiple images
const createMultiImageSchema = () => {
  return z.object({
    images: z.array(imageSchema).min(1, "At least one image is required"),
  })
}

// Props interface for the MultiImageForm component
interface MultiImageFormProps {
  languageIds: string[]
  activeLanguages: Array<{ _id: string; languageID: string }>
  onDataChange?: (data: any) => void
  slug?: string
  ParentSectionId?: string
  initialData?: {
    images?: string[]
  }
}

const MultiImageForm = forwardRef<any, MultiImageFormProps>((props, ref) => {
  const { languageIds, activeLanguages, onDataChange, slug, ParentSectionId, initialData } = props

  const { websiteId } = useWebsiteContext()
  const { t } = useTranslation()

  // Setup form with schema validation
  const formSchema = createMultiImageSchema()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [{ imageUrl: "" }],
    },
    mode: "onChange",
  })

  // State management
  const [state, setState] = useState({
    isLoadingData: !slug,
    dataLoaded: !slug,
    hasUnsavedChanges: false,
    existingSubSectionId: null as string | null,
    contentElements: [] as ContentElement[],
    isSaving: false,
    imagePreviews: [] as string[],
    elementsToDelete: [] as string[], // Track elements to delete
    // 🚀 NEW: Compression states
    compressionStates: {} as Record<number, { isCompressing: boolean; progress: number }>,
  })

  // Use object state update for better performance and readability
  const updateState = useCallback((newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }))
  }, [])

  // Extract state variables for readability
  const {
    isLoadingData,
    dataLoaded,
    hasUnsavedChanges,
    existingSubSectionId,
    contentElements,
    isSaving,    
    imagePreviews,
    elementsToDelete,
    compressionStates,
  } = state

  // Hooks
  const { toast } = useToast()
  const dataProcessed = useRef(false)
  const onDataChangeRef = useRef(onDataChange)

  // Services
  const { useCreate: useCreateSubSection, useGetCompleteBySlug, useUpdate: useUpdateSubSection } = useSubSections()
  const { useCreate: useCreateContentElement, useDelete: useDeleteContentElement } = useContentElements()
  const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()

  const createSubSection = useCreateSubSection()
  const updateSubSection = useUpdateSubSection()
  const createContentElement = useCreateContentElement()
  const deleteContentElement = useDeleteContentElement()

  // Data fetching from API
  const {
    data: completeSubsectionData,
    isLoading: isLoadingSubsection,
    refetch,
  } = useGetCompleteBySlug(slug || "", Boolean(slug))

  // Update reference when onDataChange changes
  useEffect(() => {
    onDataChangeRef.current = onDataChange
  }, [onDataChange])

  // Process initial data from parent
  const processInitialData = useCallback(() => {
    if (initialData && !dataLoaded && initialData.images && initialData.images.length > 0) {
      const formattedImages = initialData.images.map((imageUrl) => ({ imageUrl }))
      form.setValue("images", formattedImages)

      updateState({
        dataLoaded: true,
        hasUnsavedChanges: false,
        imagePreviews: initialData.images,
      })
    }
  }, [initialData, dataLoaded, form, updateState])

  // Process data from API
  const processMultiImageData = useCallback(
    (subsectionData: SubSection | null) => {
      if (!subsectionData) return

      try {
        updateState({ isLoadingData: true })

        // Set existing subsection ID
        updateState({ existingSubSectionId: subsectionData._id })

        // Find all image elements
        const imageElements =
          subsectionData.elements?.filter((el) => el.type === "image") ||
          subsectionData.contentElements?.filter((el) => el.type === "image") ||
          []

        updateState({ contentElements: imageElements })

        // Set image URLs and previews
        if (imageElements.length > 0) {
          const imagesData = imageElements.map((element) => ({
            imageUrl: element.imageUrl || "",
          }))

          form.setValue("images", imagesData)

          const previews = imageElements
            .map((element) => element.imageUrl)
            .filter((url): url is string => typeof url === "string")

          updateState({ imagePreviews: previews })
        }

        updateState({
          dataLoaded: true,
          isLoadingData: false,
          hasUnsavedChanges: false,
        })
      } catch (error) {
        console.error("Error processing multi-image data:", error)
        toast({
          title: t('projectMultiImage.error', 'Error'),
          description: t('projectMultiImage.failedToLoadImages', 'Failed to load image data'),
          variant: "destructive",
        })

        updateState({
          dataLoaded: true,
          isLoadingData: false,
        })
      }
    },
    [form, toast, updateState, t],
  )

  // Process initial data effect
  useEffect(() => {
    if (!dataLoaded && initialData) {
      processInitialData()
    }
  }, [initialData, dataLoaded, processInitialData])

  // Process API data effect
  useEffect(() => {
    if (!slug || isLoadingSubsection || dataProcessed.current) return

    if (completeSubsectionData?.data) {
      processMultiImageData(completeSubsectionData.data)
      dataProcessed.current = true
    }
  }, [completeSubsectionData, isLoadingSubsection, slug, processMultiImageData])

  // Form watch effect for unsaved changes
  useEffect(() => {
    if (isLoadingData || !dataLoaded) return

    const subscription = form.watch((value) => {
      updateState({ hasUnsavedChanges: true })
      if (onDataChangeRef.current) {
        onDataChangeRef.current(value)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, isLoadingData, dataLoaded, updateState])

  // 🚀 ENHANCED: Handle image upload with compression
  const handleImageUpload = useCallback(
    async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"]

      if (!validTypes.includes(file.type)) {
        toast({
          title: t('projectMultiImage.invalidFileType', 'Invalid File Type'),
          description: t('projectMultiImage.allowedFileTypes', 'Only JPEG, PNG, GIF, or SVG files are allowed'),
          variant: "destructive",
        })
        return
      }

      // Check file size
      if (file.size > COMPRESSION_SETTINGS.maxFileSize) {
        toast({
          title: t('projectMultiImage.fileTooLarge', 'File Too Large'),
          description: t('projectMultiImage.maxFileSize', 'Image must be less than {{size}}MB', { 
            size: COMPRESSION_SETTINGS.maxFileSize / (1024 * 1024) 
          }),
          variant: "destructive",
        })
        return
      }

      try {
        // 🚀 Set compression loading state
        updateState({
          compressionStates: {
            ...compressionStates,
            [index]: { isCompressing: true, progress: 0 }
          }
        })

        // 🚀 Show compression toast
        toast({
          title: t('projectMultiImage.compressingImage', 'Compressing Image'),
          description: t('projectMultiImage.pleaseWait', 'Please wait while we optimize your image...'),
        })

        let optimizedFile: File;
        const originalSizeKB = Math.round(file.size / 1024);

        try {
          // 🚀 Try WebP compression first
          optimizedFile = await optimizeImage(file);
        } catch (error) {
          console.warn('WebP optimization failed, falling back to JPEG:', error);
          try {
            optimizedFile = await optimizeImageFallback(file);
          } catch (fallbackError) {
            console.warn('Image optimization failed completely, using original:', fallbackError);
            optimizedFile = file;
          }
        }

        const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
        const compressionRatio = Math.round(((file.size - optimizedFile.size) / file.size) * 100);

        // 🚀 Show compression results
        if (optimizedFile !== file) {
          toast({
            title: t('projectMultiImage.imageCompressed', 'Image Compressed Successfully!'),
            description: t('projectMultiImage.compressionResult', 'Reduced from {{original}}KB to {{compressed}}KB ({{ratio}}% smaller)', {
              original: originalSizeKB,
              compressed: optimizedSizeKB,
              ratio: compressionRatio
            }),
          })
        }

        // Update form state with optimized file
        const images = form.getValues().images
        images[index] = { ...images[index], file: optimizedFile }
        form.setValue("images", images, { shouldDirty: true })

        // Create preview URL
        const previewUrl = URL.createObjectURL(optimizedFile)
        const newPreviews = [...imagePreviews]
        newPreviews[index] = previewUrl

        updateState({
          imagePreviews: newPreviews,
          hasUnsavedChanges: true,
        })

      } catch (error) {
        console.error('Image compression failed:', error)
        toast({
          title: t('projectMultiImage.compressionFailed', 'Compression Failed'),
          description: t('projectMultiImage.compressionError', 'Failed to compress image. Using original file.'),
          variant: "destructive",
        })

        // Fall back to original file
        const images = form.getValues().images
        images[index] = { ...images[index], file }
        form.setValue("images", images, { shouldDirty: true })

        const previewUrl = URL.createObjectURL(file)
        const newPreviews = [...imagePreviews]
        newPreviews[index] = previewUrl

        updateState({
          imagePreviews: newPreviews,
          hasUnsavedChanges: true,
        })
      } finally {
        // 🚀 Clear compression state
        updateState({
          compressionStates: {
            ...compressionStates,
            [index]: { isCompressing: false, progress: 100 }
          }
        })

        // Clear compression state after a delay
        setTimeout(() => {
          updateState({
            compressionStates: {
              ...compressionStates,
              [index]: { isCompressing: false, progress: 0 }
            }
          })
        }, 2000)
      }
    },
    [form, imagePreviews, toast, updateState, t, compressionStates],
  )

  // Handle image removal - FIXED VERSION
  const handleImageRemove = useCallback(
    (index: number) => {
      const images = form.getValues().images

      if (images.length <= 1) {
        toast({
          title: t('projectMultiImage.cannotRemove', 'Cannot Remove'),
          description: t('projectMultiImage.atLeastOneRequired', 'At least one image is required'),
          variant: "destructive",
        })
        return
      }

      // Check if there's a corresponding content element to mark for deletion
      if (contentElements[index]) {
        const elementToDelete = contentElements[index]._id
        updateState({
          elementsToDelete: [...elementsToDelete, elementToDelete]
        })
      }

      // Remove image at index
      const newImages = images.filter((_, i) => i !== index)
      form.setValue("images", newImages, { shouldDirty: true })

      // Remove preview
      const newPreviews = imagePreviews.filter((_, i) => i !== index)
      
      // Update content elements array to match the new images
      const newContentElements = contentElements.filter((_, i) => i !== index)

      // 🚀 Clear compression state for removed image
      const newCompressionStates = { ...compressionStates }
      delete newCompressionStates[index]

      updateState({
        imagePreviews: newPreviews,
        contentElements: newContentElements,
        hasUnsavedChanges: true,
        compressionStates: newCompressionStates,
      })
    },
    [form, imagePreviews, contentElements, elementsToDelete, toast, updateState, t, compressionStates],
  )

  // Add new image field
  const addImageField = useCallback(() => {
    const images = form.getValues().images
    form.setValue("images", [...images, { imageUrl: "" }], { shouldDirty: true })
    updateState({
      imagePreviews: [...imagePreviews, ""],
      hasUnsavedChanges: true,
    })
  }, [form, imagePreviews, updateState])

  // Upload image to server
  const uploadImage = useCallback(
    async (elementId: string, file: File) => {
      if (!file) return null

      try {
        const formData = new FormData()
        formData.append("image", file)

        const uploadResult = await apiClient.post(`/content-elements/${elementId}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        const imageUrl = uploadResult.data?.imageUrl || uploadResult.data?.url || uploadResult.data?.data?.imageUrl

        if (imageUrl) {
          toast({
            title: t('projectMultiImage.imageUploaded', 'Image Uploaded'),
            description: t('projectMultiImage.imageUploadSuccess', 'Image has been successfully uploaded.'),
          })
          return imageUrl
        }

        throw new Error("No image URL returned from server")
      } catch (error) {
        console.error("Image upload failed:", error)
        toast({
          title: t('projectMultiImage.imageUploadFailed', 'Image Upload Failed'),
          description: error instanceof Error ? error.message : t('projectMultiImage.imageUploadError', 'Failed to upload image'),
          variant: "destructive",
        })
        return null
      }
    },
    [toast, t],
  )

  // Save handler - UPDATED to handle deletions
  const handleSave = useCallback(async () => {
    // Validate form
    const isValid = await form.trigger()
    if (!isValid) {
      toast({
        title: t('projectMultiImage.validationError', 'Validation Error'),
        description: t('projectMultiImage.addAtLeastOneImage', 'Please add at least one image'),
        variant: "destructive",
      })
      return false
    }

    updateState({ isSaving: true })

    try {
      const images = form.getValues().images

      // Step 1: Delete marked elements
      if (elementsToDelete.length > 0) {
        try {
          await Promise.all(
            elementsToDelete.map(async (elementId) => {
              await deleteContentElement.mutateAsync(elementId)
            })
          )
          
          // Clear the deletion queue
          updateState({ elementsToDelete: [] })
          
          toast({
            title: t('projectMultiImage.elementsDeleted', 'Elements Deleted'),
            description: t('projectMultiImage.elementsDeletedSuccess', 'Removed elements have been deleted successfully.'),
          })
        } catch (error) {
          console.error("Error deleting elements:", error)
          toast({
            title: t('projectMultiImage.deletionError', 'Deletion Error'),
            description: t('projectMultiImage.deletionFailed', 'Some elements could not be deleted.'),
            variant: "destructive",
          })
        }
      }

      // Step 2: Create or update subsection
      let sectionId = existingSubSectionId
      if (!sectionId) {
        if (!ParentSectionId) {
          throw new Error(t('projectMultiImage.parentSectionRequired', 'Parent section ID is required to create a subsection'))
        }

        const subsectionData = {
          name: t('projectMultiImage.multiImageSection', 'Multi Image Section'),
          slug: slug || `multi-image-section-${Date.now()}`,
          description: "",
          isActive: true,
          isMain: false,
          order: 0,
          defaultContent: "",
          sectionItem: ParentSectionId,
          languages: languageIds,
          WebSiteId: websiteId,
        }

        const newSubSection = await createSubSection.mutateAsync(subsectionData)
        sectionId = newSubSection.data._id
        updateState({ existingSubSectionId: sectionId })
      } else {
        const updateData = {
          isActive: true,
          isMain: false,
          languages: languageIds,
        }

        await updateSubSection.mutateAsync({
          id: sectionId,
          data: updateData,
        })
      }

      if (!sectionId) {
        throw new Error(t('projectMultiImage.failedToCreateSection', 'Failed to create or retrieve subsection ID'))
      }

      // Step 3: Handle existing content elements
      if (contentElements.length > 0) {
        // For existing elements, update them with new images
        const existingElements = [...contentElements]
        const updatedImageUrls = []

        // Process elements that need updating
        for (let i = 0; i < Math.min(images.length, existingElements.length); i++) {
          const image = images[i] as ImageType;
          if (image.file) {
            const imageUrl = await uploadImage(existingElements[i]._id, image.file)
            if (imageUrl) {
              updatedImageUrls[i] = imageUrl
            } else {
              updatedImageUrls[i] = existingElements[i].imageUrl || ""
            }
          } else {
            updatedImageUrls[i] = images[i].imageUrl || existingElements[i].imageUrl || ""
          }
        }

        // Create new elements if we have more images than existing elements
        for (let i = existingElements.length; i < images.length; i++) {
          const elementData = {
            name: `Image ${i + 1}`,
            type: "image",
            parent: sectionId,
            isActive: true,
            order: i,
            defaultContent: "image-placeholder",
          }

          const newElement = await createContentElement.mutateAsync(elementData)
          existingElements.push(newElement.data)

          const image = images[i] as ImageType;
          if (image.file) {
            const imageUrl = await uploadImage(newElement.data._id, image.file)            
            updatedImageUrls[i] = imageUrl || ""
          } else {
            updatedImageUrls[i] = images[i].imageUrl || ""
          }
        }

        // Update form values and previews
        const updatedImages = updatedImageUrls.map((imageUrl) => ({ imageUrl }))
        form.setValue("images", updatedImages, { shouldDirty: false })
        updateState({
          imagePreviews: updatedImageUrls,
          contentElements: existingElements.slice(0, images.length),
        })
      } else {
        // Create new content elements for all images
        const createdElements = []
        const uploadedUrls = []

        for (let i = 0; i < images.length; i++) {
          const elementData = {
            name: `Image ${i + 1}`,
            type: "image",
            parent: sectionId,
            isActive: true,
            order: i,
            defaultContent: "image-placeholder",
          }

          const newElement = await createContentElement.mutateAsync(elementData)
          createdElements.push(newElement.data)

          const image = images[i] as ImageType;
          if (image.file) {
            const imageUrl = await uploadImage(newElement.data._id, image.file)
            uploadedUrls[i] = imageUrl || ""
          } else {
            uploadedUrls[i] = image.imageUrl || ""
          }
        }

        // Update form values and previews
        const updatedImages = uploadedUrls.map((imageUrl) => ({ imageUrl }))
        form.setValue("images", updatedImages, { shouldDirty: false })
        updateState({
          imagePreviews: uploadedUrls,
          contentElements: createdElements,
        })
      }

      // Show success message
      toast({
        title: existingSubSectionId
          ? t('projectMultiImage.sectionUpdatedSuccess', 'Multi-image section updated successfully!')
          : t('projectMultiImage.sectionCreatedSuccess', 'Multi-image section created successfully!'),
        description: t('projectMultiImage.allImagesSaved', 'All images have been saved.'),
      })

      updateState({ hasUnsavedChanges: false })

      // Refetch data if needed
      if (slug) {
        await refetch()
      }

      return true
    } catch (error) {
      console.error("Operation failed:", error)
      toast({
        title: t('projectMultiImage.error', 'Error'),
        variant: "destructive",
        description: error instanceof Error ? error.message : t('projectMultiImage.unknownError', 'Unknown error occurred'),
      })
      return false
    } finally {
      updateState({ isSaving: false })
    }
  }, [
    existingSubSectionId,
    form,
    ParentSectionId,
    slug,
    toast,
    t,
    contentElements,
    createContentElement,
    createSubSection,
    languageIds,
    refetch,
    updateState,
    updateSubSection,
    uploadImage,
    websiteId,
    elementsToDelete,
    deleteContentElement,
  ])

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: "MultiImage",
    extraMethods: {
      getImageFiles: () =>
        form
          .getValues()
          .images.map((img: ImageType) => img.file)
          .filter(Boolean),
      saveData: handleSave,
    },
    extraData: {
      images: form.getValues().images,
      existingSubSectionId,
    },
  })

  // Loading state
  if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          {t('projectMultiImage.loadingData', 'Loading multi-image section data...')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <LoadingDialog
        isOpen={isSaving}
        title={existingSubSectionId 
          ? t('projectMultiImage.savingUpdate', 'Updating Multi-Image Section')
          : t('projectMultiImage.savingCreate', 'Creating Multi-Image Section')
        }
        description={t('projectMultiImage.savingDescription', 'Please wait while we save your changes...')}
      />

      <Form {...form}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {form.getValues().images.map((_, index) => {
            const compressionState = compressionStates[index];
            const isCompressing = compressionState?.isCompressing || false;
            
            return (
              <Card key={index} className="overflow-hidden border border-muted">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* 🚀 ENHANCED: Image preview with compression indicator */}
                    <div className="relative h-32 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      {imagePreviews[index] ? (
                        <>
                          <img
                            src={imagePreviews[index] || "/placeholder.svg"}
                            alt={t('projectMultiImage.imageAlt', 'Image {{index}}', { index: index + 1 })}
                            className={`object-cover w-full h-full transition-opacity duration-200 ${isCompressing ? 'opacity-50' : ''}`}
                          />
                          {/* 🚀 Compression overlay */}
                          {isCompressing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-white mb-2" />
                              <div className="text-white text-xs">
                                {t('projectMultiImage.compressing', 'Compressing...')}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-muted-foreground text-sm flex flex-col items-center">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          {t('projectMultiImage.noImage', 'No image')}
                        </div>
                      )}
                    </div>

                    {/* 🚀 ENHANCED: Compression progress */}
                    {compressionState?.progress > 0 && compressionState?.progress < 100 && (
                      <div className="space-y-1">
                        <Progress value={compressionState.progress} className="h-2" />
                        <div className="text-xs text-center text-muted-foreground">
                          {t('projectMultiImage.compressingProgress', 'Compressing... {{progress}}%', { 
                            progress: compressionState.progress 
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/jpeg,image/png,image/gif,image/svg+xml"
                          input.onchange = (e) =>
                            handleImageUpload(index, e as unknown as React.ChangeEvent<HTMLInputElement>)
                          input.click()
                        }}
                        disabled={isCompressing}
                        className="flex-1 text-xs"
                      >
                        {isCompressing ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            {t('projectMultiImage.compressing', 'Compressing...')}
                          </>
                        ) : imagePreviews[index] ? (
                          t('projectMultiImage.change', 'Change')
                        ) : (
                          t('projectMultiImage.upload', 'Upload')
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleImageRemove(index)}
                        disabled={isCompressing}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Add image button as a card */}
          <Card className="border border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer h-[132px]">
            <CardContent className="p-0 h-full">
              <Button
                type="button"
                variant="ghost"
                onClick={addImageField}
                className="w-full h-full rounded-md flex flex-col items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">
                  {t('projectMultiImage.addImage', 'Add Image')}
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Form>

      {/* 🚀 ENHANCED: Info text about compression */}
      <div className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-md">
        {t('projectMultiImage.compressionInfo', 'Images are automatically compressed to {{quality}}% quality and resized to {{width}}x{{height}}px for optimal performance', {
          quality: COMPRESSION_SETTINGS.quality * 100,
          width: COMPRESSION_SETTINGS.targetWidth,
          height: COMPRESSION_SETTINGS.targetHeight
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <Button type="button" onClick={handleSave} disabled={isLoadingData || isSaving} className="flex items-center">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('projectMultiImage.saving', 'Saving...')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSubSectionId 
                ? t('projectMultiImage.updateImages', 'Update Images')
                : t('projectMultiImage.saveImages', 'Save Images')
              }
            </>
          )}
        </Button>
      </div>
    </div>
  )
})

MultiImageForm.displayName = "MultiImageForm"
export default MultiImageForm