"use client"

import type React from "react"
import { forwardRef, useEffect, useState, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import apiClient from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { Loader2, Save, Plus, Trash2, FileText, Download, Upload } from "lucide-react"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import type { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types"
import type { SubSection } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import * as z from "zod"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useTranslation } from "react-i18next"
import { createFormRef } from "@/src/utils/navigation-form-utils"
import { useLanguage } from "@/src/context/LanguageContext"

// Define the file schema
const fileSchema = z.object({
  fileUrl: z.string().optional(),
  file: z.custom<File>((file) => file instanceof File).optional(),
  fileName: z.string().optional(),
  displayName: z.string().min(1, "Display name is required")
}).strict()

type FileType = {
  fileUrl?: string;
  file?: File;
  fileName?: string;
  displayName: string;
}

// Define the form schema with title, description, and multiple files per language
const createMultiFileSchema = (activeLanguages: Array<{ _id: string; languageID: string }>) => {
  const languageSchema = z.object(
    activeLanguages.reduce((acc, lang) => {
      acc[lang.languageID] = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        files: z.array(fileSchema).default([])
      })
      return acc
    }, {} as Record<string, any>)
  ).refine((data) => {
    // Get all file arrays
    const fileArrays = Object.values(data).map((langData: any) => langData.files) as FileType[][]
    
    // If no files at all, that's valid
    if (fileArrays.every(arr => arr.length === 0)) {
      return true
    }
    
    // If any language has files, all languages must have the same number of files
    const maxLength = Math.max(...fileArrays.map(arr => arr.length))
    if (maxLength > 0) {
      return fileArrays.every(arr => arr.length === maxLength)
    }
    
    return true
  }, {
    message: "All languages must have the same number of files"
  })
  
  return languageSchema
}

// Props interface for the MultiFileForm component
interface MultiFileFormProps {
  languageIds: string[]
  activeLanguages: Array<{ _id: string; languageID: string }>
  onDataChange?: (data: any) => void
  slug?: string
  ParentSectionId?: string
  initialData?: {
    title?: Record<string, string>
    description?: Record<string, string>
    files?: Record<string, FileType[]>
  }
}

const MultiFileForm = forwardRef<any, MultiFileFormProps>((props, ref) => {
  const { languageIds, activeLanguages, onDataChange, slug, ParentSectionId, initialData } = props

  const { websiteId } = useWebsiteContext()
  const { t } = useTranslation()
  const { language } = useLanguage()

  // Setup form with schema validation
  const formSchema = createMultiFileSchema(activeLanguages)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: activeLanguages.reduce((acc, lang) => {
      acc[lang.languageID] = {
        title: "",
        description: "",
        files: []
      }
      return acc
    }, {} as Record<string, any>),
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
  const bulkUpsertTranslations = useBulkUpsertTranslations()

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
      const formValues: Record<string, any> = {}
      
      activeLanguages.forEach(lang => {
        formValues[lang.languageID] = {
          title: initialData.title?.[lang.languageID] || "",
          description: initialData.description?.[lang.languageID] || "",
          files: initialData.files?.[lang.languageID] || []
        }
      })
      
      form.reset(formValues)
      updateState({
        dataLoaded: true,
        hasUnsavedChanges: false,
      })
    }
  }, [initialData, dataLoaded, form, updateState, activeLanguages])

  // Process data from API
  const processMultiFileData = useCallback(
    (subsectionData: SubSection | null) => {
      if (!subsectionData) return

      try {
        updateState({ isLoadingData: true })

        console.log('Processing subsection data:', subsectionData) // Debug log

        // Set existing subsection ID
        updateState({ existingSubSectionId: subsectionData._id })

        // Find all elements
        const allElements =
          subsectionData.elements ||
          subsectionData.contentElements ||
          []

        console.log('All elements found:', allElements) // Debug log

        updateState({ contentElements: allElements })

        // Initialize form data for each language
        const formData: Record<string, any> = {}
        
        activeLanguages.forEach(lang => {
          formData[lang.languageID] = {
            title: "",
            description: "",
            files: []
          }
        })

        // Map language codes to IDs for translation processing
        // Create both directions of mapping to handle different formats
        const langIdToCodeMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
          acc[lang._id] = lang.languageID
          // Also handle string representations of ObjectId
          acc[lang._id.toString()] = lang.languageID
          return acc
        }, {})

        const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
          acc[lang.languageID] = lang._id
          return acc
        }, {})

        console.log('Language ID to Code map:', langIdToCodeMap) // Debug log
        console.log('Language Code to ID map:', langCodeToIdMap) // Debug log
        console.log('Active languages:', activeLanguages) // Debug log

        // Process title and description elements
        const titleElement = allElements.find(el => el.name === "Title" && el.type === "text")
        const descriptionElement = allElements.find(el => el.name === "Description" && el.type === "text")

        console.log('Title element:', titleElement) // Debug log
        console.log('Description element:', descriptionElement) // Debug log

        // Helper function to process translations
        const processTranslations = (element: any, fieldName: 'title' | 'description') => {
          if (!element) return

          console.log(`${fieldName} element translations:`, element.translations) // Debug log
          
          // If no translations exist yet, but we have default content, use it for all languages
          if ((!element.translations || element.translations.length === 0) && element.defaultContent) {
            console.log(`No translations found for ${fieldName}, using default content for all languages`) // Debug log
            activeLanguages.forEach(lang => {
              formData[lang.languageID][fieldName] = element.defaultContent
            })
            return
          }
          
          // If we have translations, process them
          if (element.translations && element.translations.length > 0) {
            // First, set default content if available
            if (element.defaultContent) {
              formData[activeLanguages[0].languageID][fieldName] = element.defaultContent
            }

            // Then process each translation
            element.translations.forEach((translation: any) => {
              console.log(`Processing ${fieldName} translation:`, translation) // Debug log
              
              // Try different ways to get the language code
              let langCode = langIdToCodeMap[translation.language]
              
              // If not found, try string version
              if (!langCode && translation.language) {
                langCode = langIdToCodeMap[translation.language.toString()]
              }
              
              // If still not found, try to find by matching language object
              if (!langCode && typeof translation.language === 'object' && translation.language._id) {
                langCode = langIdToCodeMap[translation.language._id]
              }
              
              console.log(`Language mapping: ${translation.language} -> ${langCode}`) // Debug log
              
              if (langCode && formData[langCode]) {
                formData[langCode][fieldName] = translation.content || ""
                console.log(`Set ${fieldName} for ${langCode}:`, translation.content) // Debug log
              } else {
                console.log(`Failed to map language or no form data for: ${translation.language}`) // Debug log
                console.log(`Available language codes:`, Object.keys(formData)) // Debug log
              }
            })

            // Check if we missed any languages and copy from first language if needed
            const firstLangCode = activeLanguages[0].languageID
            const firstLangValue = formData[firstLangCode][fieldName]
            
            if (firstLangValue) {
              activeLanguages.forEach(lang => {
                if (!formData[lang.languageID][fieldName]) {
                  console.log(`No ${fieldName} found for ${lang.languageID}, copying from first language`) // Debug log
                  formData[lang.languageID][fieldName] = firstLangValue
                }
              })
            }
          }
        }

        // Process title and description
        processTranslations(titleElement, 'title')
        processTranslations(descriptionElement, 'description')

        // Process file elements
        const fileElements = allElements.filter((el) => el.type === "file")

        // Group files by language
        fileElements.forEach(element => {
          // Extract language from element name (e.g., "File EN 1", "File AR 1")
          const nameMatch = element.name.match(/File (\w+) (\d+)/i)
          if (nameMatch) {
            const langCode = nameMatch[1].toLowerCase()
            const fileIndex = parseInt(nameMatch[2]) - 1

            if (formData[langCode]) {
              // Ensure array is large enough
              while (formData[langCode].files.length <= fileIndex) {
                formData[langCode].files.push({ displayName: `File ${formData[langCode].files.length + 1}` })
              }
              
              formData[langCode].files[fileIndex].fileUrl = element.fileUrl || ""
              formData[langCode].files[fileIndex].fileName = element.defaultContent || ""
              
              // Extract display name from translations or use filename
              const displayName = element.translations?.[0]?.content || 
                                element.defaultContent || 
                                `File ${fileIndex + 1}`
              formData[langCode].files[fileIndex].displayName = displayName
            }
          }
        })

        // Synchronize file arrays - all languages should have the same number of files
        const maxLength = Math.max(...Object.values(formData).map((langData: any) => langData.files.length))
        if (maxLength > 0) {
          activeLanguages.forEach(lang => {
            const langCode = lang.languageID
            while (formData[langCode].files.length < maxLength) {
              formData[langCode].files.push({ 
                displayName: `File ${formData[langCode].files.length + 1}` 
              })
            }
          })
        }

        console.log('Final form data before reset:', formData) // Debug log

        // Validate that all languages have data
        activeLanguages.forEach(lang => {
          const langCode = lang.languageID
          if (!formData[langCode].title && !formData[langCode].description) {
            console.log(`Warning: No data found for language ${langCode}, will use empty values`) // Debug log
          }
        })

        // Reset form with processed data
        form.reset(formData)
        
        // Also manually set values to ensure they're properly updated
        Object.entries(formData).forEach(([langCode, langData]: [string, any]) => {
          console.log(`Setting form values for ${langCode}:`, langData) // Debug log
          form.setValue(`${langCode}.title`, langData.title || "", { shouldDirty: false })
          form.setValue(`${langCode}.description`, langData.description || "", { shouldDirty: false })
          form.setValue(`${langCode}.files`, langData.files || [], { shouldDirty: false })
        })
        
        // Trigger form update to ensure UI reflects the changes
        setTimeout(() => {
          form.trigger()
          const currentValues = form.getValues()
          console.log('Form values after reset:', currentValues) // Debug log
          
          // Final validation - ensure all languages have at least empty strings
          activeLanguages.forEach(lang => {
            const langCode = lang.languageID
            if (!currentValues[langCode]) {
              console.log(`Missing form data for ${langCode}, setting defaults`) // Debug log
              form.setValue(`${langCode}.title`, "", { shouldDirty: false })
              form.setValue(`${langCode}.description`, "", { shouldDirty: false })
              form.setValue(`${langCode}.files`, [], { shouldDirty: false })
            }
          })
        }, 100)

        updateState({
          dataLoaded: true,
          isLoadingData: false,
          hasUnsavedChanges: false,
        })

        console.log('Form reset completed with data') // Debug log
      } catch (error) {
        console.error("Error processing multi-file data:", error)
        toast({
          title: t('projectMultiFile.error', 'Error'),
          description: t('projectMultiFile.failedToLoadFiles', 'Failed to load file data'),
          variant: "destructive",
        })

        updateState({
          dataLoaded: true,
          isLoadingData: false,
        })
      }
    },
    [form, toast, updateState, t, activeLanguages],
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

    console.log('Processing API data effect - completeSubsectionData:', completeSubsectionData) // Debug log

    if (completeSubsectionData?.data) {
      console.log('Found subsection data, processing...') // Debug log
      processMultiFileData(completeSubsectionData.data)
      dataProcessed.current = true
    } else {
      console.log('No subsection data found') // Debug log
    }
  }, [completeSubsectionData, isLoadingSubsection, slug, processMultiFileData])

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

  // Handle file upload
  const handleFileUpload = useCallback(
    (langCode: string, fileIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t('projectMultiFile.invalidFileType', 'Invalid File Type'),
          description: t('projectMultiFile.allowedFileTypes', 'Only PDF, DOC, DOCX, TXT, XLS, XLSX files are allowed'),
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('projectMultiFile.fileTooLarge', 'File Too Large'),
          description: t('projectMultiFile.fileSizeLimit', 'File size must be less than 10MB'),
          variant: "destructive",
        })
        return
      }

      // Update the specific file
      const currentData = form.getValues()
      const newData = { ...currentData }
      
      // Ensure the array is large enough
      while (newData[langCode].files.length <= fileIndex) {
        newData[langCode].files.push({ displayName: `File ${newData[langCode].files.length + 1}` })
      }
      
      // Update the specific file
      newData[langCode].files[fileIndex] = {
        ...newData[langCode].files[fileIndex],
        file,
        fileName: file.name,
        displayName: newData[langCode].files[fileIndex]?.displayName || file.name
      }
      
      form.setValue(`${langCode}.files`, newData[langCode].files, { shouldDirty: true })
      updateState({ hasUnsavedChanges: true })
    },
    [form, toast, updateState, t],
  )

  // Handle file removal (remove from all languages at the same index)
  const handleFileRemove = useCallback(
    (fileIndex: number) => {
      const currentData = form.getValues()
      
      // Remove file at the same index from all languages
      activeLanguages.forEach(lang => {
        const langCode = lang.languageID
        if (currentData[langCode].files) {
          // Create a new array without the item at fileIndex
          const newFiles = currentData[langCode].files.filter((_: any, index: number) => index !== fileIndex)
          form.setValue(`${langCode}.files`, newFiles, { shouldDirty: true })
        }
      })
      
      form.trigger() // Trigger validation to update UI
      updateState({ hasUnsavedChanges: true })
    },
    [form, updateState, activeLanguages],
  )

  // Add new file field for all languages (sync across languages)
  const addFileField = useCallback(() => {
    const currentData = form.getValues()
    
    // Add a new file slot to all languages
    activeLanguages.forEach(lang => {
      const langCode = lang.languageID
      const existingFiles = currentData[langCode].files || []
      const newFiles = [
        ...existingFiles,
        { displayName: `File ${existingFiles.length + 1}` }
      ]
      form.setValue(`${langCode}.files`, newFiles, { shouldDirty: true })
    })
    
    updateState({ hasUnsavedChanges: true })
  }, [form, updateState, activeLanguages])

  // Update display name
  const updateDisplayName = useCallback((langCode: string, fileIndex: number, displayName: string) => {
    const currentData = form.getValues()
    const newFiles = [...currentData[langCode].files]
    
    if (newFiles[fileIndex]) {
      newFiles[fileIndex] = {
        ...newFiles[fileIndex],
        displayName
      }
      form.setValue(`${langCode}.files`, newFiles, { shouldDirty: true })
      updateState({ hasUnsavedChanges: true })
    }
  }, [form, updateState])

  // Upload file to server
  const uploadFile = useCallback(
    async (elementId: string, file: File) => {
      if (!file) return null

      try {
        const formData = new FormData()
        formData.append("file", file)

        const uploadResult = await apiClient.post(`/content-elements/${elementId}/file`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        const fileUrl = uploadResult.data?.fileUrl || uploadResult.data?.url || uploadResult.data?.data?.fileUrl

        if (fileUrl) {
          // Update the content element with the file URL
          await apiClient.put(`/content-elements/${elementId}`, {
            fileUrl: fileUrl,
            defaultContent: file.name
          })

          toast({
            title: t('projectMultiFile.fileUploaded', 'File Uploaded'),
            description: t('projectMultiFile.fileUploadSuccess', 'File has been successfully uploaded.'),
          })
          return fileUrl
        }

        throw new Error("No file URL returned from server")
      } catch (error) {
        console.error("File upload failed:", error)
        toast({
          title: t('projectMultiFile.fileUploadFailed', 'File Upload Failed'),
          description: error instanceof Error ? error.message : t('projectMultiFile.fileUploadError', 'Failed to upload file'),
          variant: "destructive",
        })
        return null
      }
    },
    [toast, t],
  )

  // Save handler
  const handleSave = useCallback(async () => {
    // Validate form
    const isValid = await form.trigger()
    if (!isValid) {
      toast({
        title: t('projectMultiFile.validationError', 'Validation Error'),
        description: t('projectMultiFile.syncValidationError', 'All languages must have the same number of files with valid display names'),
        variant: "destructive",
      })
      return false
    }

    updateState({ isSaving: true })

    try {
      const formData = form.getValues()

      // Step 1: Create or update subsection
      let sectionId = existingSubSectionId
      if (!sectionId) {
        if (!ParentSectionId) {
          throw new Error(t('projectMultiFile.parentSectionRequired', 'Parent section ID is required to create a subsection'))
        }

        const subsectionData = {
          name: t('projectMultiFile.multiFileSection', 'Multi File Section'),
          slug: slug || `multi-file-section-${Date.now()}`,
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
        throw new Error(t('projectMultiFile.failedToCreateSection', 'Failed to create or retrieve subsection ID'))
      }

      // Step 2: Map language codes to IDs
      const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang.languageID] = lang._id
        return acc
      }, {})

      // Step 3: Handle title and description elements
      let titleElement = contentElements.find(el => el.name === "Title" && el.type === "text")
      let descriptionElement = contentElements.find(el => el.name === "Description" && el.type === "text")

      // Create title element if it doesn't exist
      if (!titleElement) {
        const elementData = {
          name: "Title",
          type: "text",
          parent: sectionId,
          isActive: true,
          order: 0,
          defaultContent: formData[activeLanguages[0].languageID]?.title || "",
        }
        const newElement = await createContentElement.mutateAsync(elementData)
        titleElement = newElement.data
      }

      // Create description element if it doesn't exist
      if (!descriptionElement) {
        const elementData = {
          name: "Description",
          type: "text",
          parent: sectionId,
          isActive: true,
          order: 1,
          defaultContent: formData[activeLanguages[0].languageID]?.description || "",
        }
        const newElement = await createContentElement.mutateAsync(elementData)
        descriptionElement = newElement.data
      }

      // Step 4: Handle translations for title and description
      const translations: any[] = []

      Object.entries(formData).forEach(([langCode, langData]: [string, any]) => {
        const langId = langCodeToIdMap[langCode]
        if (!langId) {
          console.log(`Warning: No language ID found for code ${langCode}`) // Debug log
          return
        }

        console.log(`Processing translations for ${langCode} (ID: ${langId}):`, langData) // Debug log

        // Title translation - always create even if empty to ensure consistency
        if (titleElement) {
          translations.push({
            content: langData.title || "",
            language: langId,
            contentElement: titleElement._id,
            isActive: true,
          })
          console.log(`Added title translation for ${langCode}: "${langData.title || ""}"`) // Debug log
        }

        // Description translation - always create even if empty to ensure consistency
        if (descriptionElement) {
          translations.push({
            content: langData.description || "",
            language: langId,
            contentElement: descriptionElement._id,
            isActive: true,
          })
          console.log(`Added description translation for ${langCode}: "${langData.description || ""}"`) // Debug log
        }
      })

      console.log('All translations to save:', translations) // Debug log
      console.log(`Total translations: ${translations.length} for ${activeLanguages.length} languages`) // Debug log

      if (translations.length > 0) {
        const translationResult = await bulkUpsertTranslations.mutateAsync(translations)
        console.log('Translation save result:', translationResult) // Debug log
      } else {
        console.log('Warning: No translations to save!') // Debug log
      }

      // Step 5: Handle file elements creation/update/deletion
      const processedElements: any[] = []
      let elementOrder = 2 // Start after title and description

      // First, collect all existing file elements that should be deleted
      const existingFileElements = contentElements.filter(el => el.type === "file")
      const elementsToDelete: string[] = []

      // Process files for each language
      for (const lang of activeLanguages) {
        const langCode = lang.languageID
        const langFiles = formData[langCode].files || []

        for (let fileIndex = 0; fileIndex < langFiles.length; fileIndex++) {
          const fileData = langFiles[fileIndex]
          const elementName = `File ${langCode.toUpperCase()} ${fileIndex + 1}`

          // Check if element already exists
          let existingElement = existingFileElements.find(el => el.name === elementName)

          if (existingElement) {
            // Update existing element
            if (fileData.file) {
              const fileUrl = await uploadFile(existingElement._id, fileData.file)
              if (fileUrl) {
                // Update element with new file URL
                await apiClient.put(`/content-elements/${existingElement._id}`, {
                  fileUrl: fileUrl,
                  defaultContent: fileData.fileName || fileData.file.name
                })
                fileData.fileUrl = fileUrl
              }
            }
            processedElements.push(existingElement)
          } else {
            // Create new element
            const elementData = {
              name: elementName,
              type: "file",
              parent: sectionId,
              isActive: true,
              order: elementOrder++,
              defaultContent: fileData.fileName || "file-placeholder",
            }

            const newElement = await createContentElement.mutateAsync(elementData)
            
            if (fileData.file) {
              const fileUrl = await uploadFile(newElement.data._id, fileData.file)
              if (fileUrl) {
                fileData.fileUrl = fileUrl
                // Update the newly created element
                await apiClient.put(`/content-elements/${newElement.data._id}`, {
                  fileUrl: fileUrl,
                  defaultContent: fileData.fileName || fileData.file.name
                })
              }
            }
            
            processedElements.push(newElement.data)
          }
        }
      }

      // Delete file elements that are no longer needed
      const processedElementIds = new Set(processedElements.map(el => el._id))
      const elementsToDeleteList = existingFileElements.filter(el => !processedElementIds.has(el._id))
      
      for (const elementToDelete of elementsToDeleteList) {
        try {
          await apiClient.delete(`/content-elements/${elementToDelete._id}`)
          console.log(`Deleted content element: ${elementToDelete.name}`)
        } catch (error) {
          console.error(`Failed to delete content element ${elementToDelete.name}:`, error)
        }
      }

      // Update content elements state
      const updatedElements = [
        ...(titleElement ? [titleElement] : []),
        ...(descriptionElement ? [descriptionElement] : []),
        ...processedElements
      ]
      updateState({ contentElements: updatedElements })

      // Show success message
      toast({
        title: existingSubSectionId
          ? t('projectMultiFile.sectionUpdatedSuccess', 'Multi-file section updated successfully!')
          : t('projectMultiFile.sectionCreatedSuccess', 'Multi-file section created successfully!'),
        description: t('projectMultiFile.allFilesSaved', 'All content has been saved.'),
      })

      updateState({ hasUnsavedChanges: false })

      // Refetch data if needed
      if (slug) {
        // Reset the processed flag so data gets reprocessed
        dataProcessed.current = false
        
        // Wait a bit and then refetch
        setTimeout(async () => {
          try {
            console.log('Refetching data after save...') // Debug log
            const result = await refetch()
            console.log('Refetch result:', result) // Debug log
            
            if (result.data?.data) {
              console.log('Reprocessing data after refetch...') // Debug log
              processMultiFileData(result.data.data)
            }
          } catch (error) {
            console.error('Error during refetch:', error)
          }
        }, 1000) // Increased delay to ensure server has time to save
      } else {
        // For new sections, manually update the form with saved data
        dataProcessed.current = false
      }

      return true
    } catch (error) {
      console.error("Operation failed:", error)
      toast({
        title: t('projectMultiFile.error', 'Error'),
        variant: "destructive",
        description: error instanceof Error ? error.message : t('projectMultiFile.unknownError', 'Unknown error occurred'),
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
    uploadFile,
    websiteId,
    activeLanguages,
    bulkUpsertTranslations,
  ])

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: "MultiFile",
    extraMethods: {
      getFiles: () => form.getValues(),
      saveData: handleSave,
    },
    extraData: {
      formData: form.getValues(),
      existingSubSectionId,
    },
  })

  // Loading state
  if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          {t('projectMultiFile.loadingData', 'Loading multi-file section data...')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <LoadingDialog
        isOpen={isSaving}
        title={existingSubSectionId 
          ? t('projectMultiFile.savingUpdate', 'Updating Multi-File Section')
          : t('projectMultiFile.savingCreate', 'Creating Multi-File Section')
        }
        description={t('projectMultiFile.savingDescription', 'Please wait while we save your changes...')}
      />

      <Form {...form}>
        {/* Title and Description Section for Each Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activeLanguages.map((lang) => {
            const langCode = lang.languageID
            const currentTitle = form.watch(`${langCode}.title`) || ""
            
            return (
              <Card key={lang._id} className="border-2 border-primary/20" dir={language === "ar" ? "rtl" : "ltr"}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-lg px-3 py-1.5 shadow-sm">
                      {langCode}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold">
                        {t('projectMultiFile.sectionContent', 'Section Content')}
                      </span>
                      {currentTitle && (
                        <span className="text-xs text-muted-foreground mt-1">
                          "{currentTitle}"
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Title Field */}
                  <FormField
                    control={form.control}
                    name={`${langCode}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t('projectMultiFile.title', 'Title')} <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('projectMultiFile.titlePlaceholder', 'Enter section title')}
                            className="h-11 hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name={`${langCode}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t('projectMultiFile.description', 'Description')}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('projectMultiFile.descriptionPlaceholder', 'Enter section description')}
                            className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Files Section */}
        {(() => {
          const allData = form.watch()
          const maxFiles = Math.max(...activeLanguages.map(lang => 
            allData[lang.languageID]?.files?.length || 0
          ), 0)

          return (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('projectMultiFile.filesSection', 'Files Section')}
                </h3>
                
                {/* File Groups - Each group represents files at the same index across all languages */}
                {Array.from({ length: maxFiles }, (_, fileIndex) => (
                  <Card key={fileIndex} className="border-2 border-primary/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {t('projectMultiFile.fileGroup', 'File Group {{index}}', { index: fileIndex + 1 })}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileRemove(fileIndex)}
                          className="flex items-center gap-1 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('projectMultiFile.removeGroup', 'Remove Group')}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Language Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeLanguages.map((lang) => {
                          const langCode = lang.languageID
                          const file = allData[langCode]?.files?.[fileIndex] || { displayName: `File ${fileIndex + 1}` }

                          return (
                            <Card key={lang._id} className="border border-muted">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <span className="uppercase font-bold text-xs bg-primary text-primary-foreground rounded px-2 py-1">
                                    {langCode}
                                  </span>
                                  {t('projectMultiFile.languageFile', '{{lang}} File', { lang: langCode.toUpperCase() })}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {/* Display Name Input */}
                                <FormField
                                  control={form.control}
                                  name={`${langCode}.files.${fileIndex}.displayName`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">
                                        {t('projectMultiFile.displayName', 'Display Name')}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder={t('projectMultiFile.enterDisplayName', 'Enter display name')}
                                          className="h-8 text-sm"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e)
                                            updateDisplayName(langCode, fileIndex, e.target.value)
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* File Upload Area */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">
                                      {t('projectMultiFile.file', 'File')}
                                    </span>
                                    {file.fileUrl && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(file.fileUrl, '_blank')}
                                        className="h-6 px-2 text-xs flex items-center gap-1"
                                      >
                                        <Download className="h-3 w-3" />
                                        {t('projectMultiFile.download', 'Download')}
                                      </Button>
                                    )}
                                  </div>

                                  <div className="border border-dashed border-muted rounded-lg p-3">
                                    {file.fileUrl || file.file ? (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                          <span className="text-xs truncate">
                                            {file.fileName || file.file?.name || 'Uploaded file'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const input = document.createElement("input")
                                              input.type = "file"
                                              input.accept = ".pdf,.doc,.docx,.txt,.xls,.xlsx"
                                              input.onchange = (e) =>
                                                handleFileUpload(langCode, fileIndex, e as unknown as React.ChangeEvent<HTMLInputElement>)
                                              input.click()
                                            }}
                                            className="h-6 px-2 text-xs flex-1"
                                          >
                                            {t('projectMultiFile.replace', 'Replace')}
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        onClick={() => {
                                          const input = document.createElement("input")
                                          input.type = "file"
                                          input.accept = ".pdf,.doc,.docx,.txt,.xls,.xlsx"
                                          input.onchange = (e) =>
                                            handleFileUpload(langCode, fileIndex, e as unknown as React.ChangeEvent<HTMLInputElement>)
                                          input.click()
                                        }}
                                        className="cursor-pointer text-center py-4"
                                      >
                                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                        <p className="text-xs text-muted-foreground">
                                          {t('projectMultiFile.clickToUpload', 'Click to upload')}
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                          {t('projectMultiFile.supportedFormats', 'PDF, DOC, DOCX, TXT, XLS, XLSX')}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Required indicator */}
                                  <div className="text-xs text-muted-foreground">
                                    <span className="text-destructive">*</span> {t('projectMultiFile.required', 'Required when other languages have files')}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add File Group Button */}
                <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFileField}
                      className="w-full h-16 flex flex-col items-center gap-2 border-dashed"
                    >
                      <Plus className="h-6 w-6" />
                      <span>{t('projectMultiFile.addFileGroup', 'Add File Group')}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('projectMultiFile.addFileGroupDesc', 'Add files for all languages at once')}
                      </span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Info Card */}
                {maxFiles > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {t('projectMultiFile.syncInfo', 'Files are synchronized across languages')}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            {t('projectMultiFile.syncInfoDesc', 'Each file group must have files for all languages. When you add a file group, it creates slots for all active languages.')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )
        })()}
      </Form>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button type="button" onClick={handleSave} disabled={isLoadingData || isSaving} className="flex items-center">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('projectMultiFile.saving', 'Saving...')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSubSectionId 
                ? t('projectMultiFile.updateFiles', 'Update Content')
                : t('projectMultiFile.saveFiles', 'Save Content')
              }
            </>
          )}
        </Button>
      </div>
    </div>
  )
})

MultiFileForm.displayName = "MultiFileForm"
export default MultiFileForm