"use client"

import type React from "react"

import { forwardRef, useEffect, useState, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form"
import { Button } from "@/src/components/ui/button"
import { Switch } from "@/src/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import apiClient from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { Loader2, Save, Navigation } from "lucide-react"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import type { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types"
import type { SubSection } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import type { ProjectFormProps } from "@/src/api/types/sections/project/porjectSection.type"
import {
  createLanguageCodeMap,
  createProjectDefaultValues,
} from "@/src/app/dashboard/services/addService/Utils/Language-default-values"
import { useImageUploader } from "@/src/app/dashboard/services/addService/Utils/Image-uploader"
import { processAndLoadData } from "@/src/app/dashboard/services/addService/Utils/load-form-data"
import { createFormRef } from "@/src/app/dashboard/services/addService/Utils/Expose-form-data"
import { BackgroundImageSection } from "@/src/app/dashboard/services/addService/Components/Hero/SimpleImageUploader"
import { LanguageCard } from "./LanguageCard"
import { createProjectBasicInfoSchema } from "@/src/app/dashboard/services/addService/Utils/language-specific-schemas"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation"

const BasicForm = forwardRef<any, ProjectFormProps>((props, ref) => {
  const { languageIds, activeLanguages, onDataChange, slug, ParentSectionId, initialData } = props

  const { websiteId } = useWebsiteContext()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const sectionIdFromUrl = searchParams.get("sectionId") || ""

  // Setup form with schema validation - Updated to include navigation fields
  const formSchema = createProjectBasicInfoSchema(languageIds, activeLanguages, true)
  const defaultValues = createProjectDefaultValues(languageIds, activeLanguages, true)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange", // Enable validation on change for better UX
  })

  // State management
  const [state, setState] = useState({
    isLoadingData: !slug,
    dataLoaded: !slug,
    hasUnsavedChanges: false,
    existingSubSectionId: null as string | null,
    contentElements: [] as ContentElement[],
    isSaving: false,
  })

  // Use object state update for better performance and readability
  const updateState = useCallback(
    (newState: {
      isLoadingData?: boolean
      dataLoaded?: boolean
      hasUnsavedChanges?: boolean
      existingSubSectionId?: string | null
      contentElements?: any[]
      isSaving?: boolean
    }) => {
      setState((prev) => ({ ...prev, ...newState }))
    },
    [],
  )

  // Extract state variables for readability
  const { isLoadingData, dataLoaded, hasUnsavedChanges, existingSubSectionId, contentElements, isSaving } = state

  // Hooks
  const { toast } = useToast()
  const dataProcessed = useRef(false)
  const onDataChangeRef = useRef(onDataChange)
  const defaultLangCode = activeLanguages[0]?.languageID || "en"

  // Services
  const { useCreate: useCreateSubSection, useGetCompleteBySlug, useUpdate: useUpdateSubSection } = useSubSections()

  const { useCreate: useCreateContentElement } = useContentElements()
  const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()

  const createSubSection = useCreateSubSection()
  const updateSubSection = useUpdateSubSection()
  const createContentElement = useCreateContentElement()
  const bulkUpsertTranslations = useBulkUpsertTranslations()

  // Dynamic URL construction function
  const constructDynamicUrl = useCallback((subsectionId: string) => {
    // Get base URL from environment or use default
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://idigitek-client-dynamic.vercel.app"
    
    // Construct the dynamic URL for project details
    const dynamicUrl = `${baseUrl}/Pages/ProjectsDetailPage/${subsectionId}`
    
    return dynamicUrl
  }, [])

  // Update dynamic URL when IDs change
  useEffect(() => {
    if (existingSubSectionId && websiteId) {
      const currentDynamicUrl = form.getValues("dynamicUrl")
      if (!currentDynamicUrl) {
        const dynamicUrl = constructDynamicUrl(existingSubSectionId)
        form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false })
      }
    }
  }, [existingSubSectionId, websiteId, constructDynamicUrl, form])

  // Image upload hook
  const {
    imageFile,
    imagePreview,
    handleImageUpload: handleOriginalImageUpload,
    handleImageRemove,
  } = useImageUploader({
    form,
    fieldPath: "backgroundImage",
    initialImageUrl: initialData?.image || form.getValues().backgroundImage,
    onUpload: () =>
      updateState({
        hasUnsavedChanges: true,
      }),
    onRemove: () =>
      updateState({
        hasUnsavedChanges: true,
      }),
    validate: (file: { type: string }) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"]
      return validTypes.includes(file.type) || "Only JPEG, PNG, GIF, or SVG files are allowed"
    },
  })

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
    if (initialData && !dataLoaded) {
      if (initialData.description) {
        form.setValue(`${defaultLangCode}.description`, initialData.description)
      }

      if (initialData.image) {
        form.setValue("backgroundImage", initialData.image)
      }

      // Set default value for addSubNavigation if not provided
      if (initialData.addSubNavigation !== undefined) {
        form.setValue("addSubNavigation", initialData.addSubNavigation)
      }

      // Set dynamic URL if available
      if (initialData.dynamicUrl) {
        form.setValue("dynamicUrl", initialData.dynamicUrl)
      }

      updateState({
        dataLoaded: true,
        hasUnsavedChanges: false,
      })
    }
  }, [initialData, dataLoaded, defaultLangCode, form])

  // Process project data from API
  const processProjectData = useCallback(
    (subsectionData: SubSection | null) => {
      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          groupElements: (elements) => ({
            project: elements.filter(
              (el) => el.type === "text" || el.type === "image" || el.type === "boolean",
            ),
          }),
          processElementGroup: (groupId, elements, langId, getTranslationContent) => {
            const elementKeyMap: Record<string, keyof typeof result> = {
              Title: "title",
              Description: "description",
              Category: "category",
              Date: "date",
              "Back Link Text": "backLinkText",
              "Gallery Text": "galleryText",
            }

            const result = {
              title: "",
              description: "",
              backLinkText: "",
              category: "",
              date: "",
              galleryText: "",
            }

            elements
              .filter((el) => el.type === "text" && el.name !== "Dynamic URL")
              .forEach((element) => {
                const key = elementKeyMap[element.name]
                if (key) {
                  result[key] = getTranslationContent(element, "")
                }
              })

            return result
          },
          getDefaultValue: () => ({
            title: "",
            description: "",
            backLinkText: "",
            galleryText: "",
            category: "",
            date: "",
          }),
        },
        {
          setExistingSubSectionId: (id) => updateState({ existingSubSectionId: id }),
          setContentElements: (elements) => updateState({ contentElements: elements }),
          setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
          setHasUnsavedChanges: (hasChanges) => updateState({ hasUnsavedChanges: hasChanges }),
          setIsLoadingData: (loading) => updateState({ isLoadingData: loading }),
        },
      )

      // Handle background image
      const bgImageElement =
        subsectionData?.elements?.find((el) => el.name === "Background Image" && el.type === "image") ||
        subsectionData?.contentElements?.find((el) => el.name === "Background Image" && el.type === "image")

      if (bgImageElement?.imageUrl) {
        form.setValue("backgroundImage", bgImageElement.imageUrl)
      }

      // Handle subNavigation setting
      const subNavElement = subsectionData?.elements?.find(
        (el) => el.name === "Add SubNavigation" && el.type === "boolean"
      ) || subsectionData?.contentElements?.find(
        (el) => el.name === "Add SubNavigation" && el.type === "boolean"
      )

      if (subNavElement) {
        const booleanValue = subNavElement.defaultContent === "true" || subNavElement.defaultContent === true
        form.setValue("addSubNavigation", booleanValue)
      }

      // Handle dynamic URL
      const dynamicUrlElement = subsectionData?.elements?.find(
        (el) => el.name === "Dynamic URL" && el.type === "text"
      ) || subsectionData?.contentElements?.find(
        (el) => el.name === "Dynamic URL" && el.type === "text"
      )

     
      if (dynamicUrlElement?.defaultContent) {
        form.setValue("dynamicUrl", dynamicUrlElement.defaultContent)
      } else if (subsectionData?._id && websiteId) {
        // Construct dynamic URL if not found in data
        const dynamicUrl = constructDynamicUrl(subsectionData._id)
        form.setValue("dynamicUrl", dynamicUrl)
      }
    },
    [form, languageIds, activeLanguages, websiteId, constructDynamicUrl],
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
      updateState({ isLoadingData: true })
      processProjectData(completeSubsectionData.data)
      updateState({
        dataLoaded: true,
        isLoadingData: false,
      })
      dataProcessed.current = true
    }
  }, [completeSubsectionData, isLoadingSubsection, slug, processProjectData])

  // Ensure dynamic URL is always set when data is loaded
  useEffect(() => {
    if (dataLoaded && existingSubSectionId && websiteId) {
      const currentDynamicUrl = form.getValues("dynamicUrl")
      if (!currentDynamicUrl) {
        const dynamicUrl = constructDynamicUrl(existingSubSectionId)
        form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false })
      }
    }
  }, [dataLoaded, existingSubSectionId, websiteId, constructDynamicUrl, form])

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

  // Image upload handler
  const uploadImage = useCallback(
    async (elementId: any, file: string | Blob) => {
      if (!file) return null

      try {
        const formData = new FormData()
        formData.append("image", file)

        const uploadResult = await apiClient.post(`/content-elements/${elementId}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        const imageUrl = uploadResult.data?.imageUrl || uploadResult.data?.url || uploadResult.data?.data?.imageUrl

        if (imageUrl) {
          form.setValue("backgroundImage", imageUrl, { shouldDirty: false })
          toast({
            title: t("projectBasicForm.imageUploaded", "Image Uploaded"),
            description: t("projectBasicForm.imageUploadSuccess", "Background image has been successfully uploaded."),
          })
          return imageUrl
        }

        throw new Error("No image URL returned from server. Response: " + JSON.stringify(uploadResult.data))
      } catch (error) {
        console.error("Image upload failed:", error)
        toast({
          title: t("projectBasicForm.imageUploadFailed", "Image Upload Failed"),
          description:
            error instanceof Error ? error.message : t("projectBasicForm.imageUploadError", "Failed to upload image"),
          variant: "destructive",
        })
        throw error
      }
    },
    [form, toast, t],
  )

  // Save handler with optimized process
  const handleSave = useCallback(async () => {
    const allFormValues = form.getValues()

    // Validate form
    const isValid = await form.trigger()
    if (!isValid) {
      toast({
        title: t("projectBasicForm.validationError", "Validation Error"),
        description: t("projectBasicForm.fillAllFields", "Please fill all required fields correctly"),
        variant: "destructive",
      })
      return false
    }

    updateState({ isSaving: true })

    try {
      // Step 1: Create or update subsection
      let sectionId = existingSubSectionId
      if (!sectionId) {
        if (!ParentSectionId) {
          throw new Error(
            t("projectBasicForm.parentSectionRequired", "Parent section ID is required to create a subsection"),
          )
        }

        const subsectionData = {
          name: t("projectBasicForm.projectSection", "Project Section"),
          slug: slug || `project-section-${Date.now()}`,
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

        // Update dynamic URL with the new subsection ID
        const dynamicUrl = constructDynamicUrl(sectionId)
        form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false })
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

        // Ensure dynamic URL is set for existing sections too
        const currentDynamicUrl = form.getValues("dynamicUrl")
        if (!currentDynamicUrl) {
          const dynamicUrl = constructDynamicUrl(sectionId)
          form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false })
        }
      }

      // Get updated form values after dynamic URL has been set
      const updatedFormValues = form.getValues()

      if (!sectionId) {
        throw new Error(t("projectBasicForm.failedToCreateSection", "Failed to create or retrieve subsection ID"))
      }

      // Step 2: Map language codes to IDs
      const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang.languageID] = lang._id
        return acc
      }, {})

      // Step 3: Handle existing content or create new content
      if (contentElements.length > 0) {
        // Handle existing content elements
        if (imageFile) {
          const imageElement = contentElements.find((e) => e.type === "image")
          if (imageElement) {
            await uploadImage(imageElement._id, imageFile)
          }
        }

        // Update subNavigation boolean element
        const subNavElement = contentElements.find((e) => e.name === "Add SubNavigation" && e.type === "boolean")
        if (subNavElement) {
          await apiClient.put(`/content-elements/${subNavElement._id}`, {
            defaultContent: String(allFormValues.addSubNavigation)
          })
        }

        // Update dynamic URL element
        const dynamicUrlElement = contentElements.find((e) => e.name === "Dynamic URL" && e.type === "text")
        if (dynamicUrlElement) {
          const finalDynamicUrl = updatedFormValues.dynamicUrl || constructDynamicUrl(sectionId)
          await apiClient.put(`/content-elements/${dynamicUrlElement._id}`, {
            defaultContent: finalDynamicUrl
          })
        }

        // Update translations for text elements
        const textElements = contentElements.filter((e) => e.type === "text" && e.name !== "Dynamic URL")
        const translations:
          | (Omit<ContentTranslation, "_id"> & { id?: string })[]
          | { content: any; language: string; contentElement: string; isActive: boolean }[] = []
        const elementNameToKeyMap: Record<
          string,
          "title" | "description" | "backLinkText" | "category" | "date" | "galleryText"
        > = {
          Title: "title",
          Description: "description",
          "Back Link Text": "backLinkText",
          Category: "category",
          Date: "date",
          "Gallery Text": "galleryText",
        }

        Object.entries(updatedFormValues).forEach(([langCode, values]) => {
          if (langCode === "backgroundImage" || langCode === "addSubNavigation" || langCode === "dynamicUrl") return

          const langId = langCodeToIdMap[langCode]
          if (!langId) return

          textElements.forEach((element) => {
            const key = elementNameToKeyMap[element.name]
            if (key && values && typeof values === "object" && key in values) {
              translations.push({
                content: values[key],
                language: langId,
                contentElement: element._id,
                isActive: true,
              })
            }
          })
        })

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations)
        }
      } else {
        // Create new content elements - Updated to include navigation fields
        const elementTypes = [
          { type: "image", key: "backgroundImage", name: "Background Image" },
          { type: "boolean", key: "addSubNavigation", name: "Add SubNavigation" },
          { type: "text", key: "dynamicUrl", name: "Dynamic URL" },
          { type: "text", key: "title", name: "Title" },
          { type: "text", key: "description", name: "Description" },
          { type: "text", key: "category", name: "Category" },
          { type: "text", key: "date", name: "Date" },
          { type: "text", key: "backLinkText", name: "Back Link Text" },
          { type: "text", key: "galleryText", name: "Gallery Text" },
          { type: "text", key: "client", name: "Client" },
          { type: "text", key: "industry", name: "Industry" },
          { type: "text", key: "year", name: "Year" },
          { type: "text", key: "technologies", name: "Technologies" },
        ]

        const createdElements = []
        for (const [index, el] of elementTypes.entries()) {
          let defaultContent = ""
          if (el.type === "image") {
            defaultContent = "image-placeholder"
          } else if (el.type === "boolean") {
            defaultContent = String(updatedFormValues.addSubNavigation)
          } else if (el.key === "dynamicUrl") {
            // Ensure dynamic URL is properly constructed
            const finalDynamicUrl = updatedFormValues.dynamicUrl || constructDynamicUrl(sectionId)
            defaultContent = finalDynamicUrl
          } else if (el.type === "text" && typeof updatedFormValues[defaultLangCode] === "object") {
            const langValues = updatedFormValues[defaultLangCode]
            defaultContent =
              langValues && typeof langValues === "object" && el.key in langValues ? langValues[el.key] : ""
          }

          const elementData = {
            name: el.name,
            type: el.type,
            parent: sectionId,
            isActive: true,
            order: index,
            defaultContent: defaultContent,
          }

          const newElement = await createContentElement.mutateAsync(elementData)
          createdElements.push({ ...newElement.data, key: el.key })
        }

        updateState({ contentElements: createdElements.map((e) => ({ ...e, translations: [] })) })

        // Handle image upload for new elements
        const bgImageElement = createdElements.find((e) => e.key === "backgroundImage")
        if (bgImageElement && imageFile) {
          await uploadImage(bgImageElement._id, imageFile)
        }

        // Create translations for new elements (excluding navigation fields)
        const textElements = createdElements.filter((e) => 
          e.key !== "backgroundImage" && 
          e.key !== "addSubNavigation" && 
          e.key !== "dynamicUrl"
        )
        const translations:
          | (Omit<ContentTranslation, "_id"> & { id?: string })[]
          | { content: any; language: string; contentElement: any; isActive: boolean }[] = []

        Object.entries(updatedFormValues).forEach(([langCode, langValues]) => {
          if (langCode === "backgroundImage" || langCode === "addSubNavigation" || langCode === "dynamicUrl") return

          const langId = langCodeToIdMap[langCode]
          if (!langId) return

          for (const element of textElements) {
            if (langValues && typeof langValues === "object" && element.key in langValues) {
              translations.push({
                content: langValues[element.key],
                language: langId,
                contentElement: element._id,
                isActive: true,
              })
            }
          }
        })

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations)
        }
      }

      // Show success message
      toast({
        title: existingSubSectionId
          ? t("projectBasicForm.sectionUpdatedSuccess", "Project section updated successfully!")
          : t("projectBasicForm.sectionCreatedSuccess", "Project section created successfully!"),
        description: t("projectBasicForm.allContentSaved", "All content has been saved."),
      })

      updateState({ hasUnsavedChanges: false })

      // Update form state with saved data
      if (slug) {
        const result = await refetch()
        if (result.data?.data) {
          updateState({ dataLoaded: false })
          dataProcessed.current = false  // Reset the processed flag
          await processProjectData(result.data.data)
        }
      } else {
        // For new subsections, manually update form
        const finalUpdatedData = {
          ...updatedFormValues,
          backgroundImage: form.getValues("backgroundImage"),
          addSubNavigation: form.getValues("addSubNavigation"),
          dynamicUrl: form.getValues("dynamicUrl"),
        }

        Object.entries(finalUpdatedData).forEach(([key, value]) => {
          if (key !== "backgroundImage" && key !== "addSubNavigation" && key !== "dynamicUrl") {
            Object.entries(value).forEach(([field, content]) => {
              form.setValue(`${key}.${field}`, content, { shouldDirty: false })
            })
          }
        })

        form.setValue("backgroundImage", finalUpdatedData.backgroundImage, { shouldDirty: false })
        form.setValue("addSubNavigation", finalUpdatedData.addSubNavigation, { shouldDirty: false })
        form.setValue("dynamicUrl", finalUpdatedData.dynamicUrl, { shouldDirty: false })
      }

      return true
    } catch (error) {
      console.error("Operation failed:", error)
      toast({
        title: existingSubSectionId
          ? t("projectBasicForm.errorUpdatingSection", "Error updating project section")
          : t("projectBasicForm.errorCreatingSection", "Error creating project section"),
        variant: "destructive",
        description:
          error instanceof Error ? error.message : t("projectBasicForm.unknownError", "Unknown error occurred"),
      })
      return false
    } finally {
      updateState({ isSaving: false })
    }
  }, [
    existingSubSectionId,
    form,
    imageFile,
    ParentSectionId,
    slug,
    toast,
    t,
    bulkUpsertTranslations,
    contentElements,
    createContentElement,
    createSubSection,
    defaultLangCode,
    languageIds,
    processProjectData,
    refetch,
    updateState,
    updateSubSection,
    uploadImage,
    activeLanguages,
    websiteId,
    constructDynamicUrl,
  ])

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: "Project",
    extraMethods: {
      getImageFile: () => imageFile,
      saveData: handleSave,
    },
    extraData: {
      imageFile,
      existingSubSectionId,
      addSubNavigation: form.getValues("addSubNavigation"),
      dynamicUrl: form.getValues("dynamicUrl"),
    },
  })

  const languageCodes = createLanguageCodeMap(activeLanguages)

  // Loading state
  if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          {t("projectBasicForm.loadingData", "Loading project section data...")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <LoadingDialog
        isOpen={isSaving}
        title={
          existingSubSectionId
            ? t("projectBasicForm.savingUpdate", "Updating Project Section")
            : t("projectBasicForm.savingCreate", "Creating Project Section")
        }
        description={t("projectBasicForm.savingDescription", "Please wait while we save your changes...")}
      />

      <Form {...form}>
        {/* Hidden Dynamic URL Field */}
        <FormField
          control={form.control}
          name="dynamicUrl"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Background Image Section */}
        <BackgroundImageSection
          imagePreview={imagePreview || undefined}
          imageValue={form.getValues().backgroundImage}
          onUpload={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files && event.target.files.length > 0) {
              handleOriginalImageUpload({ target: { files: Array.from(event.target.files) } })
            }
          }}
          onRemove={handleImageRemove}
          imageType="logo"
        />

        {/* Navigation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
               {t('Navigation.NavigationSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="addSubNavigation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      {t('Navigation.AddSubNavigation')}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t('Navigation.enable')}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languageIds.map((langId, index) => {
            const langCode = languageCodes[langId] || langId
            return (
              <LanguageCard
                key={langId}
                langCode={langCode}
                form={form}
                isFirstLanguage={index === 0}
              />
            )
          })}
        </div>
      </Form>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button type="button" onClick={handleSave} disabled={isLoadingData || isSaving} className="flex items-center">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("projectBasicForm.saving", "Saving...")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSubSectionId
                ? t("projectBasicForm.updateContent", "Update Project Content")
                : t("projectBasicForm.saveContent", "Save Project Content")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
})

BasicForm.displayName = "BasicForm"
export default BasicForm