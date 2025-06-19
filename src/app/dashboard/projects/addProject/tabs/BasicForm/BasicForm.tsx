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
import { Loader2, Save } from "lucide-react"
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

const BasicForm = forwardRef<any, ProjectFormProps>((props, ref) => {
  const { languageIds, activeLanguages, onDataChange, slug, ParentSectionId, initialData } = props

  const { websiteId } = useWebsiteContext()
  const { t } = useTranslation()

  // Setup form with schema validation
  const formSchema = createProjectBasicInfoSchema(languageIds, activeLanguages)
  const defaultValues = createProjectDefaultValues(languageIds, activeLanguages)
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

  // Add file storage state
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})

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

  console.log("completeSubsectionData", completeSubsectionData)

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

      updateState({
        dataLoaded: true,
        hasUnsavedChanges: false,
      })
    }
  }, [initialData, dataLoaded, defaultLangCode, form])

  // Process hero data from API
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
              (el) => el.type === "text" || el.type === "image" || el.type === "file",
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
              uploadedFile: "",
            }

            elements
              .filter((el) => el.type === "text")
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
            uploadedFile: "",
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

      // Handle file elements for each language separately
      if (subsectionData?.elements || subsectionData?.contentElements) {
        const allElements = subsectionData.elements || subsectionData.contentElements || []
        
        console.log("All elements found:", allElements.map(el => ({ name: el.name, type: el.type, fileUrl: el.fileUrl })))
        
        // Find and process file elements for each language
        activeLanguages.forEach(language => {
          const langCode = language.languageID
          const fileElementName = `Uploaded File ${langCode.toUpperCase()}`
          
          const fileElement = allElements.find((el) => 
            el.type === "file" && el.name === fileElementName
          )
          
          
          if (fileElement?.fileUrl) {
            console.log(`Setting ${langCode}.uploadedFile to:`, fileElement.fileUrl)
            form.setValue(`${langCode}.uploadedFile`, fileElement.fileUrl, { shouldDirty: false })
          }
        })
      }
    },
    [form, languageIds, activeLanguages],
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

  // Debug effect to log form values for uploaded files
  useEffect(() => {
    const subscription = form.watch((value) => {
      activeLanguages.forEach(language => {
        const langCode = language.languageID
        const fileValue = value[langCode]?.uploadedFile
        if (fileValue) {
          console.log(`Form value for ${langCode}.uploadedFile:`, fileValue)
        }
      })
    })

    return () => subscription.unsubscribe()
  }, [form, activeLanguages])

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

  const uploadFile = useCallback(
    async (elementId: any, file: File) => {
      if (!file) return null

      try {
        const formData = new FormData()
        formData.append("file", file)

        const uploadResult = await apiClient.post(`/content-elements/${elementId}/file`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        const fileUrl = uploadResult.data?.fileUrl || uploadResult.data?.url || uploadResult.data?.data?.fileUrl

        if (fileUrl) {
          toast({
            title: t("projectBasicForm.fileUploaded", "File Uploaded"),
            description: t("projectBasicForm.fileUploadSuccess", "File has been successfully uploaded."),
          })
          return fileUrl
        }

        throw new Error("No file URL returned from server. Response: " + JSON.stringify(uploadResult.data))
      } catch (error) {
        console.error("File upload failed:", error)
        toast({
          title: t("projectBasicForm.fileUploadFailed", "File Upload Failed"),
          description:
            error instanceof Error ? error.message : t("projectBasicForm.fileUploadError", "Failed to upload file"),
          variant: "destructive",
        })
        throw error
      }
    },
    [toast, t],
  )

  // File upload handlers
  const handleFileUpload = useCallback((langCode: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [langCode]: file
    }))
    updateState({ hasUnsavedChanges: true })
  }, [updateState])

  const handleFileRemove = useCallback((langCode: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[langCode]
      return newFiles
    })
    updateState({ hasUnsavedChanges: true })
  }, [updateState])

  // Save handler with optimized process
  const handleSave = useCallback(async () => {
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
      const allFormValues = form.getValues()

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
          slug: slug || `hero-section-${Date.now()}`,
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

        // Handle file uploads for each language
        for (const [langCode, file] of Object.entries(uploadedFiles)) {
          const fileElement = contentElements.find((e) => e.type === "file" && e.name === `Uploaded File ${langCode.toUpperCase()}`)
          if (fileElement) {
            const fileUrl = await uploadFile(fileElement._id, file)
            if (fileUrl) {
              form.setValue(`${langCode}.uploadedFile`, fileUrl, { shouldDirty: false })
            }
          }
        }

        // Update translations for text elements
        const textElements = contentElements.filter((e) => e.type === "text")
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

        Object.entries(allFormValues).forEach(([langCode, values]) => {
          if (langCode === "backgroundImage") return

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
        // Create new content elements
        const elementTypes = [
          { type: "image", key: "backgroundImage", name: "Background Image" },
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

        // Add file elements for each language that has uploaded files
        Object.keys(uploadedFiles).forEach(langCode => {
          elementTypes.push({
            type: "file",
            key: `uploadedFile_${langCode}`,
            name: `Uploaded File ${langCode.toUpperCase()}`
          })
        })

        const createdElements = []
        for (const [index, el] of elementTypes.entries()) {
          let defaultContent = ""
          if (el.type === "image") {
            defaultContent = "image-placeholder"
          } else if (el.type === "text" && typeof allFormValues[defaultLangCode] === "object") {
            const langValues = allFormValues[defaultLangCode]
            defaultContent =
              langValues && typeof langValues === "object" && el.key in langValues ? langValues[el.key] : ""
          } else if (el.type === "file") {
            defaultContent = "file-placeholder"
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

        // Handle file uploads for each language
        for (const [langCode, file] of Object.entries(uploadedFiles)) {
          const fileElement = createdElements.find((e) => e.key === `uploadedFile_${langCode}`)
          if (fileElement) {
            const fileUrl = await uploadFile(fileElement._id, file)
            if (fileUrl) {
              form.setValue(`${langCode}.uploadedFile`, fileUrl, { shouldDirty: false })
            }
          }
        }

        // Create translations for new elements
        const textElements = createdElements.filter((e) => e.key !== "backgroundImage" && !e.key.startsWith("uploadedFile_"))
        const translations:
          | (Omit<ContentTranslation, "_id"> & { id?: string })[]
          | { content: any; language: string; contentElement: any; isActive: boolean }[] = []

        Object.entries(allFormValues).forEach(([langCode, langValues]) => {
          if (langCode === "backgroundImage") return

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

      // Clear uploaded files after successful save
      setUploadedFiles({})

      // Update form state with saved data
      if (slug) {
        const result = await refetch()
        if (result.data?.data) {
          updateState({ dataLoaded: false })
          await processProjectData(result.data.data)
        }
      } else {
        // For new subsections, manually update form
        const updatedData = {
          ...allFormValues,
          backgroundImage: form.getValues("backgroundImage"),
        }

        Object.entries(updatedData).forEach(([key, value]) => {
          if (key !== "backgroundImage") {
            Object.entries(value).forEach(([field, content]) => {
              form.setValue(`${key}.${field}`, content, { shouldDirty: false })
            })
          }
        })

        form.setValue("backgroundImage", updatedData.backgroundImage, { shouldDirty: false })
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
    uploadFile,
    uploadedFiles,
    activeLanguages,
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
      getUploadedFiles: () => uploadedFiles,
    },
    extraData: {
      imageFile,
      existingSubSectionId,
      uploadedFiles,
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
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
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