"use client"

import type React from "react"
import { forwardRef, useEffect, useState, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Button } from "@/src/components/ui/button"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import apiClient from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { Loader2, Save, Plus, Trash2, FileText, Download, Upload } from "lucide-react"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import type { ContentElement } from "@/src/api/types/hooks/content.types"
import type { SubSection } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import * as z from "zod"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useTranslation } from "react-i18next"
import { Input } from "@/src/components/ui/input"
import { createFormRef } from "@/src/utils/navigation-form-utils"

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

// Define the form schema with multiple files per language - files are required across all languages
const createMultiFileSchema = (activeLanguages: Array<{ _id: string; languageID: string }>) => {
  const languageSchema = z.object(
    activeLanguages.reduce((acc, lang) => {
      acc[lang.languageID] = z.array(fileSchema).default([])
      return acc
    }, {} as Record<string, any>)
  ).refine((data) => {
    // Get all file arrays
    const fileArrays = Object.values(data) as FileType[][]
    
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
  
  return z.object({
    files: languageSchema
  })
}

// Props interface for the MultiFileForm component
interface MultiFileFormProps {
  languageIds: string[]
  activeLanguages: Array<{ _id: string; languageID: string }>
  onDataChange?: (data: any) => void
  slug?: string
  ParentSectionId?: string
  initialData?: {
    files?: Record<string, FileType[]>
  }
}

const MultiFileForm = forwardRef<any, MultiFileFormProps>((props, ref) => {
  const { languageIds, activeLanguages, onDataChange, slug, ParentSectionId, initialData } = props

  const { websiteId } = useWebsiteContext()
  const { t } = useTranslation()

  // Setup form with schema validation
  const formSchema = createMultiFileSchema(activeLanguages)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: activeLanguages.reduce((acc, lang) => {
        acc[lang.languageID] = []
        return acc
      }, {} as Record<string, FileType[]>)
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
    if (initialData && !dataLoaded && initialData.files) {
      form.setValue("files", initialData.files)
      updateState({
        dataLoaded: true,
        hasUnsavedChanges: false,
      })
    }
  }, [initialData, dataLoaded, form, updateState])

  // Process data from API
  const processMultiFileData = useCallback(
    (subsectionData: SubSection | null) => {
      if (!subsectionData) return

      try {
        updateState({ isLoadingData: true })

        // Set existing subsection ID
        updateState({ existingSubSectionId: subsectionData._id })

        // Find all file elements
        const fileElements =
          subsectionData.elements?.filter((el) => el.type === "file") ||
          subsectionData.contentElements?.filter((el) => el.type === "file") ||
          []

        updateState({ contentElements: fileElements })

        // Group files by language
        const filesByLanguage: Record<string, FileType[]> = {}
        
        activeLanguages.forEach(lang => {
          filesByLanguage[lang.languageID] = []
        })

        // Process existing file elements
        fileElements.forEach(element => {
          // Extract language from element name (e.g., "File EN 1", "File AR 1")
          const nameMatch = element.name.match(/File (\w+) (\d+)/i)
          if (nameMatch) {
            const langCode = nameMatch[1].toLowerCase()
            const fileIndex = parseInt(nameMatch[2]) - 1

            if (filesByLanguage[langCode]) {
              // Ensure array is large enough
              while (filesByLanguage[langCode].length <= fileIndex) {
                filesByLanguage[langCode].push({ displayName: `File ${filesByLanguage[langCode].length + 1}` })
              }
              
              filesByLanguage[langCode][fileIndex].fileUrl = element.fileUrl || ""
              filesByLanguage[langCode][fileIndex].fileName = element.defaultContent || ""
              
              // Extract display name from translations or use filename
              const displayName = element.translations?.[0]?.content || 
                                element.defaultContent || 
                                `File ${fileIndex + 1}`
              filesByLanguage[langCode][fileIndex].displayName = displayName
            }
          }
        })

        // Synchronize file arrays - all languages should have the same number of files
        const maxLength = Math.max(...Object.values(filesByLanguage).map(arr => arr.length))
        if (maxLength > 0) {
          activeLanguages.forEach(lang => {
            const langCode = lang.languageID
            while (filesByLanguage[langCode].length < maxLength) {
              filesByLanguage[langCode].push({ 
                displayName: `File ${filesByLanguage[langCode].length + 1}` 
              })
            }
          })
        }

        form.setValue("files", filesByLanguage)

        updateState({
          dataLoaded: true,
          isLoadingData: false,
          hasUnsavedChanges: false,
        })
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

    if (completeSubsectionData?.data) {
      processMultiFileData(completeSubsectionData.data)
      dataProcessed.current = true
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

      // Create a new files object to ensure React detects the change
      const currentFiles = form.getValues().files
      const newFiles: Record<string, FileType[]> = {}
      
      activeLanguages.forEach(lang => {
        const code = lang.languageID
        newFiles[code] = currentFiles[code] ? [...currentFiles[code]] : []
        
        if (code === langCode) {
          // Ensure the array is large enough
          while (newFiles[code].length <= fileIndex) {
            newFiles[code].push({ displayName: `File ${newFiles[code].length + 1}` })
          }
          
          // Update the specific file
          newFiles[code][fileIndex] = {
            ...newFiles[code][fileIndex],
            file,
            fileName: file.name,
            displayName: newFiles[code][fileIndex]?.displayName || file.name
          }
        }
      })
      
      form.setValue("files", newFiles, { shouldDirty: true })
      updateState({ hasUnsavedChanges: true })
    },
    [form, toast, updateState, t, activeLanguages],
  )

  // Handle file removal (remove from all languages at the same index)
  const handleFileRemove = useCallback(
    (fileIndex: number) => {
      const currentFiles = form.getValues().files
      
      // Create a new files object to ensure React detects the change
      const newFiles: Record<string, FileType[]> = {}
      
      // Remove file at the same index from all languages
      activeLanguages.forEach(lang => {
        const langCode = lang.languageID
        if (currentFiles[langCode]) {
          // Create a new array without the item at fileIndex
          newFiles[langCode] = currentFiles[langCode].filter((_, index) => index !== fileIndex)
        } else {
          newFiles[langCode] = []
        }
      })
      
      form.setValue("files", newFiles, { shouldDirty: true })
      form.trigger() // Trigger validation to update UI
      updateState({ hasUnsavedChanges: true })
    },
    [form, updateState, activeLanguages],
  )

  // Add new file field for all languages (sync across languages)
  const addFileField = useCallback(() => {
    const currentFiles = form.getValues().files
    
    // Create a new files object to ensure React detects the change
    const newFiles: Record<string, FileType[]> = {}
    
    // Add a new file slot to all languages
    activeLanguages.forEach(lang => {
      const langCode = lang.languageID
      const existingFiles = currentFiles[langCode] || []
      newFiles[langCode] = [
        ...existingFiles,
        { displayName: `File ${existingFiles.length + 1}` }
      ]
    })
    
    form.setValue("files", newFiles, { shouldDirty: true })
    updateState({ hasUnsavedChanges: true })
  }, [form, updateState, activeLanguages])

  // Update display name
  const updateDisplayName = useCallback((langCode: string, fileIndex: number, displayName: string) => {
    const currentFiles = form.getValues().files
    
    // Create a new files object to ensure React detects the change
    const newFiles: Record<string, FileType[]> = {}
    
    activeLanguages.forEach(lang => {
      const code = lang.languageID
      if (code === langCode) {
        // Update the specific file's display name
        newFiles[code] = currentFiles[code] ? [...currentFiles[code]] : []
        if (newFiles[code][fileIndex]) {
          newFiles[code][fileIndex] = {
            ...newFiles[code][fileIndex],
            displayName
          }
        }
      } else {
        // Keep other languages unchanged
        newFiles[code] = currentFiles[code] ? [...currentFiles[code]] : []
      }
    })
    
    form.setValue("files", newFiles, { shouldDirty: true })
    updateState({ hasUnsavedChanges: true })
  }, [form, updateState, activeLanguages])

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

    // Additional validation: Check if files are synchronized across languages
    const files = form.getValues().files
    const fileCounts = activeLanguages.map(lang => files[lang.languageID]?.length || 0)
    const maxCount = Math.max(...fileCounts)
    
    if (maxCount > 0 && !fileCounts.every(count => count === maxCount)) {
      toast({
        title: t('projectMultiFile.validationError', 'Validation Error'),
        description: t('projectMultiFile.syncValidationError', 'All languages must have the same number of files'),
        variant: "destructive",
      })
      return false
    }

    updateState({ isSaving: true })

    try {
      const files = form.getValues().files

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

      // Step 2: Handle file elements creation/update/deletion
      const processedElements: any[] = []
      let elementOrder = 0

      // First, collect all existing elements that should be deleted
      const elementsToDelete: string[] = []
      
      // Process files for each language
      for (const lang of activeLanguages) {
        const langCode = lang.languageID
        const langFiles = files[langCode] || []

        for (let fileIndex = 0; fileIndex < langFiles.length; fileIndex++) {
          const fileData = langFiles[fileIndex]
          const elementName = `File ${langCode.toUpperCase()} ${fileIndex + 1}`

          // Check if element already exists
          let existingElement = contentElements.find(el => el.name === elementName)

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

      // Delete elements that are no longer needed
      const processedElementIds = new Set(processedElements.map(el => el._id))
      const elementsToDeleteList = contentElements.filter(el => !processedElementIds.has(el._id))
      
      for (const elementToDelete of elementsToDeleteList) {
        try {
          await apiClient.delete(`/content-elements/${elementToDelete._id}`)
          console.log(`Deleted content element: ${elementToDelete.name}`)
        } catch (error) {
          console.error(`Failed to delete content element ${elementToDelete.name}:`, error)
          // Don't throw error here, just log it
        }
      }

      // Update content elements state
      updateState({ contentElements: processedElements })

      // Show success message
      toast({
        title: existingSubSectionId
          ? t('projectMultiFile.sectionUpdatedSuccess', 'Multi-file section updated successfully!')
          : t('projectMultiFile.sectionCreatedSuccess', 'Multi-file section created successfully!'),
        description: t('projectMultiFile.allFilesSaved', 'All files have been saved.'),
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
      getFiles: () => form.getValues().files,
      saveData: handleSave,
    },
    extraData: {
      files: form.getValues().files,
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
        {/* Get the maximum number of files across all languages */}
        {(() => {
          const allFiles = form.watch("files")
          const maxFiles = Math.max(...activeLanguages.map(lang => 
            allFiles[lang.languageID]?.length || 0
          ), 0)

          return (
            <div className="space-y-6">
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
                        const file = allFiles[langCode]?.[fileIndex] || { displayName: `File ${fileIndex + 1}` }

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
                                name={`files.${langCode}.${fileIndex}.displayName`}
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
                ? t('projectMultiFile.updateFiles', 'Update Files')
                : t('projectMultiFile.saveFiles', 'Save Files')
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