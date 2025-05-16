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
import { Loader2, Save, Plus, Trash2 } from "lucide-react"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import type { ContentElement } from "@/src/api/types/hooks/content.types"
import type { SubSection } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import * as z from "zod"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { Card, CardContent } from "@/src/components/ui/card"
import { createFormRef } from "../../../services/addService/Utils/Expose-form-data"

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
  } = state

  // Hooks
  const { toast } = useToast()
  const dataProcessed = useRef(false)
  const onDataChangeRef = useRef(onDataChange)

  // Services
  const { useCreate: useCreateSubSection, useGetCompleteBySlug, useUpdate: useUpdateSubSection } = useSubSections()

  const { useCreate: useCreateContentElement } = useContentElements()
  const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()

  const createSubSection = useCreateSubSection()
  const updateSubSection = useUpdateSubSection()
  const createContentElement = useCreateContentElement()

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
          title: "Error",
          description: "Failed to load image data",
          variant: "destructive",
        })

        updateState({
          dataLoaded: true,
          isLoadingData: false,
        })
      }
    },
    [form, toast, updateState],
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

  // Handle image upload
  const handleImageUpload = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"]

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPEG, PNG, GIF, or SVG files are allowed",
          variant: "destructive",
        })
        return
      }

      // Update form state
      const images = form.getValues().images
      images[index] = { ...images[index], file }
      form.setValue("images", images, { shouldDirty: true })

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      const newPreviews = [...imagePreviews]
      newPreviews[index] = previewUrl
      updateState({
        imagePreviews: newPreviews,
        hasUnsavedChanges: true,
      })
    },
    [form, imagePreviews, toast, updateState],
  )

  // Handle image removal
  const handleImageRemove = useCallback(
    (index: number) => {
      const images = form.getValues().images

      if (images.length <= 1) {
        toast({
          title: "Cannot Remove",
          description: "At least one image is required",
          variant: "destructive",
        })
        return
      }

      // Remove image at index
      const newImages = images.filter((_, i) => i !== index)
      form.setValue("images", newImages, { shouldDirty: true })

      // Remove preview
      const newPreviews = imagePreviews.filter((_, i) => i !== index)
      updateState({
        imagePreviews: newPreviews,
        hasUnsavedChanges: true,
      })
    },
    [form, imagePreviews, toast, updateState],
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
            title: "Image Uploaded",
            description: "Image has been successfully uploaded.",
          })
          return imageUrl
        }

        throw new Error("No image URL returned from server")
      } catch (error) {
        console.error("Image upload failed:", error)
        toast({
          title: "Image Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        })
        return null
      }
    },
    [toast],
  )

  // Save handler
  const handleSave = useCallback(async () => {
    // Validate form
    const isValid = await form.trigger()
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please add at least one image",
        variant: "destructive",
      })
      return false
    }

    updateState({ isSaving: true })

    try {
      const images = form.getValues().images

      // Step 1: Create or update subsection
      let sectionId = existingSubSectionId
      if (!sectionId) {
        if (!ParentSectionId) {
          throw new Error("Parent section ID is required to create a subsection")
        }

        const subsectionData = {
          name: "Multi Image Section",
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
        throw new Error("Failed to create or retrieve subsection ID")
      }

      // Step 2: Handle existing content elements
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
          ? "Multi-image section updated successfully!"
          : "Multi-image section created successfully!",
        description: "All images have been saved.",
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
        title: "Error",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error occurred",
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
    contentElements,
    createContentElement,
    createSubSection,
    languageIds,
    refetch,
    updateState,
    updateSubSection,
    uploadImage,
    websiteId,
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
        <p className="ml-2 text-muted-foreground">Loading multi-image section data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <LoadingDialog
        isOpen={isSaving}
        title={existingSubSectionId ? "Updating Multi-Image Section" : "Creating Multi-Image Section"}
        description="Please wait while we save your changes..."
      />

      <Form {...form}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {form.getValues().images.map((_, index) => (
            <Card key={index} className="overflow-hidden border border-muted">
              <CardContent className="p-3">
                <div className="space-y-3">
                  {/* Smaller image preview */}
                  <div className="relative h-32 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                    {imagePreviews[index] ? (
                      <img
                        src={imagePreviews[index] || "/placeholder.svg"}
                        alt={`Image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">No image</div>
                    )}
                  </div>

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
                      className="flex-1 text-xs"
                    >
                      {imagePreviews[index] ? "Change" : "Upload"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleImageRemove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

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
                <span className="text-xs">Add Image</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Form>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <Button type="button" onClick={handleSave} disabled={isLoadingData || isSaving} className="flex items-center">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSubSectionId ? "Update Images" : "Save Images"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
})

MultiImageForm.displayName = "MultiImageForm"
export default MultiImageForm
