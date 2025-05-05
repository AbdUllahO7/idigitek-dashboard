"use client"

import { forwardRef, useEffect, useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-conent-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-conent-translitions"
import apiClient from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { LoadingDialog } from "./MainSectionComponents"
import { ContentElement, FormLanguageValues, HeroFormProps, SubSectionData, Translation } from "../../types/HeroFor.types"
import { HeroFormRef } from "../../types/BenefitsForm.types"
import { Label } from "@/src/components/ui/label"
import { createHeroSchema } from "../../Utils/language-specifi-schemas"
import { createHeroDefaultValues } from "../../Utils/Language-default-values"
import { createFormRef } from "../../Utils/Expose-form-data"
import { processAndLoadData } from "../../Utils/load-form-data"
import { createLanguageCodeMap } from "../../Utils/language-utils"
import { SimpleImageUploader, useImageUpload } from "../../Utils/Image-uploader"
import { ImageIcon, Loader2, Save } from "lucide-react"

const HeroForm = forwardRef<HeroFormRef, HeroFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId, initialData }, ref) => {
    const formSchema = createHeroSchema(languageIds, activeLanguages)
    type FormSchemaType = z.infer<typeof formSchema>
    const defaultValues = createHeroDefaultValues(languageIds, activeLanguages)
    const [isLoadingData, setIsLoadingData] = useState(!slug)
    const [dataLoaded, setDataLoaded] = useState(!slug)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null)
    const [contentElements, setContentElements] = useState<any[]>([])
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const { toast } = useToast()
    const dataProcessed = useRef<boolean>(false)

    const { useCreate: useCreateSubSection, useGetCompleteBySlug, useUpdate: useUpdateSubSection } = useSubSections()
    const { useCreate: useCreateContentElement } = useContentElements()
    const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()
    const createSubSection = useCreateSubSection()
    const updateSubSection = useUpdateSubSection()
    const createContentElement = useCreateContentElement()
    const bulkUpsertTranslations = useBulkUpsertTranslations()

    const defaultLangCode = activeLanguages.length > 0 ? activeLanguages[0].languageID : 'en'

    const form = useForm<FormSchemaType>({
      resolver: zodResolver(formSchema),
      defaultValues: defaultValues
    })

    const { 
      imageFile, 
      imagePreview, 
      handleImageUpload, 
      handleImageRemove,
    } = useImageUpload({
      form,
      fieldPath: 'backgroundImage',
      initialImageUrl: initialData?.image || form.getValues().backgroundImage,
      onUpload: (file) => {
        setHasUnsavedChanges(true)
      },
      onRemove: () => {
        setHasUnsavedChanges(true)
      },
      validate: (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
        return validTypes.includes(file.type) || 'Only JPEG, PNG, GIF, or SVG files are allowed'
      }
    })

    const onDataChangeRef = useRef<((data: any) => void) | undefined>(onDataChange)
    useEffect(() => {
      onDataChangeRef.current = onDataChange
    }, [onDataChange])

    const { 
      data: completeSubsectionData, 
      isLoading: isLoadingSubsection, 
      refetch 
    } = useGetCompleteBySlug(slug || '', Boolean(slug))

    const processInitialData = () => {
      if (initialData && !dataLoaded) {
        console.log("Processing initial data from parent:", initialData)
        if (initialData.description) {
          form.setValue(`${defaultLangCode}.description` as any, initialData.description)
        }
        if (initialData.image) {
          form.setValue('backgroundImage', initialData.image)
        }
        setDataLoaded(true)
        setHasUnsavedChanges(false)
      }
    }

    const processHeroData = (subsectionData: SubSectionData | null) => {
      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          groupElements: (elements) => ({
            'hero': elements.filter(el => el.type === 'text' || (el.name === 'Background Image' && el.type === 'image'))
          }),
          processElementGroup: (groupId, elements, langId, getTranslationContent) => {
            const elementKeyMap = {
              'Title': 'title',
              'Description': 'description',
              'Back Link Text': 'backLinkText'
            }
            const result = {
              title: '',
              description: '',
              backLinkText: ''
            }
            elements.filter(el => el.type === 'text').forEach(element => {
              const key = elementKeyMap[element.name]
              if (key) {
                result[key] = getTranslationContent(element, '')
              }
            })
            return result
          },
          getDefaultValue: () => ({
            title: '',
            description: '',
            backLinkText: ''
          })
        },
        {
          setExistingSubSectionId,
          setContentElements,
          setDataLoaded,
          setHasUnsavedChanges,
          setIsLoadingData
        }
      )
      const bgImageElement = subsectionData?.elements?.find(
        (el) => el.name === 'Background Image' && el.type === 'image'
      ) || subsectionData?.contentElements?.find(
        (el) => el.name === 'Background Image' && el.type === 'image'
      )
      if (bgImageElement?.imageUrl) {
        form.setValue('backgroundImage', bgImageElement.imageUrl)
      }
    }

    useEffect(() => {
      if (!dataLoaded && initialData) {
        processInitialData()
      }
    }, [initialData])

    useEffect(() => {
      if (!slug || isLoadingSubsection || dataProcessed.current) return
      if (completeSubsectionData?.data) {
        setIsLoadingData(true)
        processHeroData(completeSubsectionData.data as unknown as SubSectionData)
        setDataLoaded(true)
        dataProcessed.current = true
        setIsLoadingData(false)
      }
    }, [completeSubsectionData, isLoadingSubsection, slug])

    useEffect(() => {
      if (isLoadingData || !dataLoaded) return
      const subscription = form.watch((value) => {
        setHasUnsavedChanges(true)
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value)
        }
      })
      return () => subscription.unsubscribe()
    }, [form, isLoadingData, dataLoaded])

    const handleSave = async (): Promise<boolean> => {
      const isValid = await form.trigger()
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly",
          variant: "destructive",
        })
        return false
      }

      setIsSaving(true)
      try {
        const allFormValues = form.getValues()
        console.log("Form values at save:", allFormValues)

        let sectionId = existingSubSectionId
        if (!existingSubSectionId) {
          if (!ParentSectionId) {
            throw new Error("Parent section ID is required to create a subsection")
          }
          const subsectionData = {
            name: "Hero Section",
            slug: slug || `hero-section-${Date.now()}`,
            description: "",
            isActive: true,
            isMain: false,
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
          }
          const newSubSection = await createSubSection.mutateAsync(subsectionData)
          sectionId = newSubSection.data._id
          setExistingSubSectionId(sectionId)
        } else {
          const updateData = {
            isActive: true,
            isMain: false,
            languages: languageIds,
          }
          await updateSubSection.mutateAsync({
            id: existingSubSectionId,
            data: updateData,
          })
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID")
        }

        const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
          acc[lang.languageID] = lang._id
          return acc
        }, {})

        if (contentElements.length > 0) {
          if (imageFile) {
            const imageElement = contentElements.find((e) => e.type === "image")
            if (imageElement) {
              try {
                const formData = new FormData()
                formData.append("image", imageFile)
                const uploadResult = await apiClient.post(`/content-elements/${imageElement._id}/image`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                })
                console.log("Image upload response:", uploadResult.data) // Log for debugging
                const imageUrl = uploadResult.data?.imageUrl || uploadResult.data?.url || uploadResult.data?.data?.imageUrl
                if (imageUrl) {
                  form.setValue("backgroundImage", imageUrl, { shouldDirty: false })
                  toast({
                    title: "Image Uploaded",
                    description: "Background image has been successfully uploaded.",
                  })
                } else {
                  throw new Error("No image URL returned from server. Response: " + JSON.stringify(uploadResult.data))
                }
              } catch (error) {
                console.error("Image upload failed:", error)
                toast({
                  title: "Image Upload Failed",
                  description: error instanceof Error ? error.message : "Failed to upload image",
                  variant: "destructive",
                })
                throw error
              }
            }
          }

          const textElements = contentElements.filter((e) => e.type === "text")
          const translations: Translation[] = []
          const elementNameToKeyMap: Record<string, string> = {
            Title: "title",
            Description: "description",
            "Back Link Text": "backLinkText",
          }

          Object.entries(allFormValues).forEach(([langCode, values]) => {
            if (langCode === "backgroundImage") return
            const langId = langCodeToIdMap[langCode]
            if (!langId) return
            textElements.forEach((element) => {
              const key = elementNameToKeyMap[element.name]
              if (key && values && typeof values === "object" && key in values) {
                translations.push({
                  content: (values as FormLanguageValues)[key as keyof FormLanguageValues] as string,
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
          const elementTypes = [
            { type: "image", key: "backgroundImage", name: "Background Image" },
            { type: "text", key: "title", name: "Title" },
            { type: "text", key: "description", name: "Description" },
            { type: "text", key: "backLinkText", name: "Back Link Text" },
          ]

          const createdElements: (ContentElement & { key: string })[] = []
          for (const [index, el] of elementTypes.entries()) {
            let defaultContent = ""
            if (el.type === "image") {
              defaultContent = "image-placeholder"
            } else if (el.type === "text" && typeof allFormValues[defaultLangCode] === "object") {
              const langValues = allFormValues[defaultLangCode] as FormLanguageValues
              defaultContent =
                langValues && typeof langValues === "object" && el.key in langValues
                  ? (langValues[el.key as keyof FormLanguageValues] as string)
                  : ""
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

          setContentElements(createdElements.map((e) => ({ ...e, translations: [] })))

          const bgImageElement = createdElements.find((e) => e.key === "backgroundImage")
          if (bgImageElement && imageFile) {
            try {
              const formData = new FormData()
              formData.append("image", imageFile)
              const uploadResult = await apiClient.post(`/content-elements/${bgImageElement._id}/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              })
              console.log("Image upload response (new element):", uploadResult.data) // Log for debugging
              const imageUrl = uploadResult.data?.imageUrl || uploadResult.data?.url || uploadResult.data?.data?.imageUrl
              if (imageUrl) {
                form.setValue("backgroundImage", imageUrl, { shouldDirty: false })
                toast({
                  title: "Image Uploaded",
                  description: "Background image has been successfully uploaded.",
                })
              } else {
                throw new Error("No image URL returned from server. Response: " + JSON.stringify(uploadResult.data))
              }
            } catch (error) {
              console.error("Image upload failed:", error)
              toast({
                title: "Image Upload Failed",
                description: error instanceof Error ? error.message : "Failed to upload image",
                variant: "destructive",
              })
              throw error
            }
          }

          const textElements = createdElements.filter((e) => e.key !== "backgroundImage")
          const translations: Translation[] = []
          for (const [langCode, langValues] of Object.entries(allFormValues)) {
            if (langCode === "backgroundImage") continue
            const langId = langCodeToIdMap[langCode]
            if (!langId) continue
            for (const element of textElements) {
              if (langValues && typeof langValues === "object" && element.key in langValues) {
                const content = (langValues as FormLanguageValues)[element.key as keyof FormLanguageValues] as string
                translations.push({
                  content: content,
                  language: langId,
                  contentElement: element._id,
                  isActive: true,
                })
              }
            }
          }

          if (translations.length > 0) {
            await bulkUpsertTranslations.mutateAsync(translations)
          }
        }

        toast({
          title: existingSubSectionId ? "Hero section updated successfully!" : "Hero section created successfully!",
          description: "All content has been saved.",
        })

        setHasUnsavedChanges(false)

        // Update form state with saved data
        if (slug) {
          const result = await refetch()
          if (result.data?.data) {
            setDataLoaded(false)
            await processHeroData(result.data.data)
          }
        } else {
          // For new subsections, manually update form state
          const updatedData = {
            ...allFormValues,
            backgroundImage: form.getValues("backgroundImage"),
          }
          Object.entries(updatedData).forEach(([key, value]) => {
            if (key !== "backgroundImage") {
              Object.entries(value as FormLanguageValues).forEach(([field, content]) => {
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
          title: existingSubSectionId ? "Error updating hero section" : "Error creating hero section",
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        })
        return false
      } finally {
        setIsSaving(false)
      }
    }

    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      existingSubSectionId,
      contentElements,
      componentName: 'Hero',
      extraMethods: {
        getImageFile: () => imageFile,
        saveData: handleSave
      },
      extraData: {
        imageFile,
        existingSubSectionId
      }
    })

    const languageCodes = createLanguageCodeMap(activeLanguages)

    return (
      <div className="space-y-6">
        <LoadingDialog 
          isOpen={isSaving} 
          title={existingSubSectionId ? "Updating Hero Section" : "Creating Hero Section"}
          description="Please wait while we save your changes..."
        />
        {slug && (isLoadingData || isLoadingSubsection) && !dataLoaded ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading hero section data...</p>
          </div>
        ) : (
          <Form {...form}>
            <div className="mb-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Hero Background Image</CardTitle>
                  <CardDescription>Upload a background image for the hero section (applies to all languages)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4" />
                        Background Image
                        <span className="text-xs text-muted-foreground">(applies to all languages)</span>
                      </Label>
                      <SimpleImageUploader
                        imageValue={imagePreview || form.getValues().backgroundImage}
                        inputId="file-upload-background-image"
                        onUpload={handleImageUpload}
                        onRemove={handleImageRemove}
                        altText="Background image preview"
                        acceptedTypes="image/jpeg,image/png,image/gif,image/svg+xml"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languageIds.map((langId) => {
                const langCode = languageCodes[langId] || langId
                return (
                  <Card key={langId} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
                          {langCode}
                        </span>
                        Hero Section
                      </CardTitle>
                      <CardDescription>Manage hero content for {langCode.toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`${langCode}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${langCode}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter description" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${langCode}.backLinkText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Get Started" {...field} />
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
          </Form>
        )}
        <div className="flex justify-end mt-6">
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isLoadingData || isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {existingSubSectionId ? "Update Hero Content" : "Save Hero Content"}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }
)

HeroForm.displayName = "HeroForm"
export default HeroForm