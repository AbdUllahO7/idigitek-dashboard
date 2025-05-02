"use client"

import type React from "react"
import { forwardRef, useEffect, useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"

import { Textarea } from "@/src/components/ui/textarea"
import { Plus, Trash2, Save, AlertTriangle, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-conent-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-conent-translitions"
import apiClient from "@/src/lib/api-client"
import type { Feature } from "@/src/api/types"
import { useToast } from "@/src/hooks/use-toast"
import { LoadingDialog } from "./MainSectionComponents"
import { createFeaturesSchema } from "../../Utils/language-specifi-schemas"
import { createFeaturesDefaultValues } from "../../Utils/Language-default-values"
import { FeaturesFormProps, SubsectionData } from "../../types/Features.types"
import { createFormRef } from "../../Utils/Expose-form-data"
import { processAndLoadData } from "../../Utils/load-form-data"
import { createLanguageCodeMap } from "../../Utils/language-utils"
import { useFeatureImages } from "../../Utils/Image-uploader"
import { Label } from "@/src/components/ui/label"

// Helper type to infer the schema type
type FeaturesSchemaType = ReturnType<typeof createFeaturesSchema>

const FeaturesForm = forwardRef<any, FeaturesFormProps>(({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
  const featuresSchema = createFeaturesSchema(languageIds, activeLanguages)
  const [isLoadingData, setIsLoadingData] = useState(!slug)
  const [dataLoaded, setDataLoaded] = useState(!slug)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [featureCountMismatch, setFeatureCountMismatch] = useState(false)
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)
  const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null)
  const [contentElements, setContentElements] = useState<any[]>([])
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const defaultValues = createFeaturesDefaultValues(languageIds, activeLanguages)

  const form = useForm<z.infer<FeaturesSchemaType>>({
    resolver: zodResolver(featuresSchema),
    defaultValues: defaultValues,
  })

  // Initialize useFeatureImages hook
  const { featureImages, handleFeatureImageUpload, handleFeatureImageRemove, updateFeatureImageIndices, FeatureImageUploader } = useFeatureImages(form)

  const onDataChangeRef = useRef(onDataChange)
  useEffect(() => {
    onDataChangeRef.current = onDataChange
  }, [onDataChange])

  // API hooks
  const { useCreate: useCreateSubSection, useGetCompleteBySlug } = useSubSections()
  const {
    useCreate: useCreateContentElement,
    useUpdate: useUpdateContentElement,
    useDelete: useDeleteContentElement,
  } = useContentElements()
  const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()

  const createSubSection = useCreateSubSection()
  const createContentElement = useCreateContentElement()
  const deleteContentElement = useDeleteContentElement()
  const bulkUpsertTranslations = useBulkUpsertTranslations()

  // Query for complete subsection data by slug if provided
  const {
    data: completeSubsectionData,
    isLoading: isLoadingSubsection,
    refetch,
  } = useGetCompleteBySlug(slug || "", Boolean(slug))

  // Check if all languages have the same number of features
  const validateFeatureCounts = () => {
    const values = form.getValues()
    const counts = Object.values(values).map((features) => features?.length || 0)
    const allEqual = counts.every((count) => count === counts[0])
    setFeatureCountMismatch(!allEqual)
    return allEqual
  }

  // Function to process and load data into the form
  const processFeaturesData = (subsectionData: SubsectionData | null) => {
    processAndLoadData(
      subsectionData,
      form,
      languageIds,
      activeLanguages,
      {
        groupElements: (elements) => {
          const featureGroups: Record<string, any[]> = {}
          elements.forEach((element) => {
            const featureIdMatch = element.name.match(/Feature (\d+)/i)
            if (featureIdMatch) {
              const featureId = featureIdMatch[1]
              if (!featureGroups[featureId]) {
                featureGroups[featureId] = []
              }
              featureGroups[featureId].push(element)
            }
          })
          return featureGroups
        },
        processElementGroup: (featureId, elements, langId, getTranslationContent) => {
          const titleElement = elements.find((el) => el.name.includes("Title"))
          const headingElement = elements.find((el) => el.name.includes("Heading"))
          const descriptionElement = elements.find((el) => el.name.includes("Description"))
          const imageElement = elements.find((el) => el.name.includes("Image") && el.type === "image")
          const featureListElements = elements.filter((el) => el.name.includes("Feature Item"))

          const featureItems = featureListElements
            .map((el) => getTranslationContent(el, ""))
            .filter(Boolean)

          if (featureItems.length === 0) {
            featureItems.push("")
          }

          const imageUrl = imageElement?.imageUrl || ""
          return {
            id: `feature-${featureId}`,
            title: getTranslationContent(titleElement, ""),
            content: {
              heading: getTranslationContent(headingElement, ""),
              description: getTranslationContent(descriptionElement, ""),
              features: featureItems,
              image: imageUrl,
            },
          }
        },
        getDefaultValue: () => [{
          id: "feature-1",
          title: "",
          content: {
            heading: "",
            description: "",
            features: [""],
            image: "",
          },
        }],
      },
      {
        setExistingSubSectionId,
        setContentElements,
        setDataLoaded,
        setHasUnsavedChanges,
        setIsLoadingData,
        validateCounts: validateFeatureCounts,
        onLoad: (data) => {
          // No need to set image previews here since FeatureImageUploader uses form values
        },
      }
    )
  }

  // Effect to populate form with existing data from complete subsection
  useEffect(() => {
    if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
      return
    }
    setIsLoadingData(true)
    processFeaturesData(completeSubsectionData.data)
  }, [completeSubsectionData, isLoadingSubsection, dataLoaded, form, activeLanguages, languageIds, slug])

  // Update parent component with form data on change
  useEffect(() => {
    if (isLoadingData || !dataLoaded) return
    const subscription = form.watch((value) => {
      setHasUnsavedChanges(true)
      validateFeatureCounts()
      if (onDataChangeRef.current) {
        onDataChangeRef.current(value)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, isLoadingData, dataLoaded])

  // Handle form save
  const handleSave = async () => {
    const isValid = await form.trigger()
    const hasEqualFeatureCounts = validateFeatureCounts()
    if (!hasEqualFeatureCounts) {
      setIsValidationDialogOpen(true)
      return
    }

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const allFormValues = form.getValues()
      let sectionId = existingSubSectionId

      if (!existingSubSectionId) {
        const subsectionData = {
          name: "Features Section",
          slug: slug || `features-section-${Date.now()}`,
          description: "Features section for the website",
          isActive: true,
          order: 0,
          sectionItem: ParentSectionId,
          languages: languageIds as string[],
        }
        const newSubSection = await createSubSection.mutateAsync(subsectionData)
        sectionId = newSubSection.data._id
        setExistingSubSectionId(sectionId)
      }

      if (!sectionId) {
        throw new Error("Failed to create or retrieve subsection ID")
      }

      const langCodeToIdMap = activeLanguages.reduce((acc, lang) => {
        acc[lang.languageID] = lang._id
        return acc
      }, {})

      const firstLangCode = Object.keys(allFormValues)[0]
      const features = allFormValues[firstLangCode]

      if (!Array.isArray(features)) {
        throw new Error("Invalid features data")
      }

      let highestFeatureNum = 0
      contentElements.forEach((element) => {
        const featureMatch = element.name.match(/Feature (\d+)/i)
        if (featureMatch) {
          const num = parseInt(featureMatch[1], 10)
          if (num > highestFeatureNum) {
            highestFeatureNum = num
          }
        }
      })

      for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
        const featureNum = featureIndex + 1
        const headingElementName = `Feature ${featureNum} - Heading`
        const titleElementName = `Feature ${featureNum} - Title`
        const existingHeading = contentElements.find((e) => e.name === headingElementName)
        const existingTitle = contentElements.find((e) => e.name === titleElementName)

        if (existingHeading || existingTitle) {
          const translations = []
          Object.entries(allFormValues).forEach(([langCode, langFeatures]) => {
            const langId = langCodeToIdMap[langCode]
            if (!langId || !Array.isArray(langFeatures) || !langFeatures[featureIndex]) return

            const feature = langFeatures[featureIndex]
            const headingElement = contentElements.find((e) => e.name === `Feature ${featureNum} - Heading`)
            const titleElement = contentElements.find((e) => e.name === `Feature ${featureNum} - Title`)
            const descriptionElement = contentElements.find((e) => e.name === `Feature ${featureNum} - Description`)

            if (headingElement) {
              translations.push({
                content: feature.content.heading,
                language: langId,
                contentElement: headingElement._id,
                isActive: true,
              })
            }

            if (titleElement) {
              translations.push({
                content: feature.title,
                language: langId,
                contentElement: titleElement._id,
                isActive: true,
              })
            }

            if (descriptionElement) {
              translations.push({
                content: feature.content.description,
                language: langId,
                contentElement: descriptionElement._id,
                isActive: true,
              })
            }

            const featureItems = feature.content.features || []
            featureItems.forEach((item, itemIndex) => {
              const itemName = `Feature ${featureNum} - Feature Item ${itemIndex + 1}`
              const itemElement = contentElements.find((e) => e.name === itemName)

              if (itemElement) {
                translations.push({
                  content: item,
                  language: langId,
                  contentElement: itemElement._id,
                  isActive: true,
                })
              } else {
                createContentElement.mutateAsync({
                  name: itemName,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: itemIndex,
                  defaultContent: item,
                }).then((newElement) => {
                  bulkUpsertTranslations.mutateAsync([{
                    content: item,
                    language: langId,
                    contentElement: newElement.data._id,
                    isActive: true,
                  }])
                })
              }
            })
          })

          if (translations.length > 0) {
            await bulkUpsertTranslations.mutateAsync(translations)
          }

          const imageFile = featureImages[featureIndex]
          if (imageFile) {
            const imageElement = contentElements.find((e) => e.type === "image" && e.name === `Feature ${featureNum} - Image`)
            if (imageElement) {
              const formData = new FormData()
              formData.append("image", imageFile)
              const uploadResult = await apiClient.post(`/content-elements/${imageElement._id}/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              })
              if (uploadResult.data?.imageUrl) {
                Object.keys(allFormValues).forEach((langCode) => {
                  if (allFormValues[langCode] && allFormValues[langCode][featureIndex]) {
                    form.setValue(`${langCode}.${featureIndex}.content.image` as any, uploadResult.data.imageUrl)
                  }
                })
              }
            }
          }
        } else {
          const actualFeatureNum = highestFeatureNum + 1
          highestFeatureNum = actualFeatureNum

          const elementTypes = [
            { type: "image", key: "image", name: `Feature ${actualFeatureNum} - Image` },
            { type: "text", key: "title", name: `Feature ${actualFeatureNum} - Title` },
            { type: "text", key: "heading", name: `Feature ${actualFeatureNum} - Heading` },
            { type: "text", key: "description", name: `Feature ${actualFeatureNum} - Description` },
          ]

          const createdElements = []
          for (const [index, el] of elementTypes.entries()) {
            let defaultContent = ""
            if (el.type === "image") {
              defaultContent = "image-placeholder"
            } else if (el.type === "text" && allFormValues[firstLangCode]) {
              const feature = allFormValues[firstLangCode][featureIndex]
              if (el.key === "title") {
                defaultContent = feature.title || ""
              } else if (feature?.content && el.key in feature.content) {
                defaultContent = feature.content[el.key]
              }
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

          const featureItemElements = []
          const featureItems = features[featureIndex].content.features || []
          for (let itemIndex = 0; itemIndex < featureItems.length; itemIndex++) {
            const itemName = `Feature ${actualFeatureNum} - Feature Item ${itemIndex + 1}`
            const defaultContent = featureItems[itemIndex] || ""
            const elementData = {
              name: itemName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: itemIndex,
              defaultContent: defaultContent,
            }
            const newElement = await createContentElement.mutateAsync(elementData)
            featureItemElements.push({ ...newElement.data, itemIndex })
          }

          const imageElement = createdElements.find((e) => e.key === "image")
          const imageFile = featureImages[featureIndex]
          if (imageElement && imageFile) {
            const formData = new FormData()
            formData.append("image", imageFile)
            const uploadResult = await apiClient.post(`/content-elements/${imageElement._id}/image`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            if (uploadResult.data?.imageUrl) {
              Object.keys(allFormValues).forEach((langCode) => {
                if (allFormValues[langCode] && allFormValues[langCode][featureIndex]) {
                  form.setValue(`${langCode}.${featureIndex}.content.image` as any, uploadResult.data.imageUrl)
                }
              })
            }
          }

          const translations = []
          for (const [langCode, langFeatures] of Object.entries(allFormValues)) {
            const langId = langCodeToIdMap[langCode]
            if (!langId || !Array.isArray(langFeatures) || !langFeatures[featureIndex]) continue

            const feature = langFeatures[featureIndex]
            for (const element of createdElements) {
              if (element.key === "image") continue
              if (element.key === "title") {
                translations.push({
                  content: feature.title,
                  language: langId,
                  contentElement: element._id,
                  isActive: true,
                })
              } else if (feature.content && element.key in feature.content) {
                translations.push({
                  content: feature.content[element.key],
                  language: langId,
                  contentElement: element._id,
                  isActive: true,
                })
              }
            }

            const items = feature.content?.features || []
            for (let i = 0; i < items.length && i < featureItemElements.length; i++) {
              translations.push({
                content: items[i],
                language: langId,
                contentElement: featureItemElements[i]._id,
                isActive: true,
              })
            }
          }

          if (translations.length > 0) {
            const batchSize = 20
            for (let i = 0; i < translations.length; i += batchSize) {
              const batch = translations.slice(i, i + batchSize)
              await bulkUpsertTranslations.mutateAsync(batch)
            }
          }
        }
      }

      toast({
        title: existingSubSectionId ? "Features section updated successfully!" : "Features section created successfully!",
        description: "All content has been saved.",
      })

      setHasUnsavedChanges(false)

      if (slug) {
        const result = await refetch()
        if (result.data?.data) {
          setDataLoaded(false)
          await processFeaturesData(result.data.data)
        }
      }
    } catch (error) {
      console.error("Operation failed:", error)
      toast({
        title: existingSubSectionId ? "Error updating features section" : "Error creating features section",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
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
    componentName: 'Features',
    extraMethods: {
      getFeatureImages: () => featureImages,
    },
  })

  const addFeatureItem = (langCode: string, featureIndex: number) => {
    Object.keys(form.getValues()).forEach((lang) => {
      const features = [...(form.getValues()[lang] || [])]
      if (features[featureIndex]) {
        const feature = { ...features[featureIndex] }
        const featureItems = [...(feature.content.features || [])]
        featureItems.push("")
        feature.content = {
          ...feature.content,
          features: featureItems,
        }
        features[featureIndex] = feature
        form.setValue(lang as any, features)
      }
    })
  }

  const removeFeatureItem = (langCode: string, featureIndex: number, itemIndex: number) => {
    const currentFeatures = form.getValues()[langCode] || []
    const currentFeature = currentFeatures[featureIndex]
    if (!currentFeature || currentFeature.content.features.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one feature item",
        variant: "destructive",
      })
      return
    }

    if (existingSubSectionId && contentElements.length > 0) {
      const featureNum = featureIndex + 1
      const itemNum = itemIndex + 1
      const featureItemElement = contentElements.find(
        (element) => element.name === `Feature ${featureNum} - Feature Item ${itemNum}`
      )
      if (featureItemElement) {
        deleteContentElement.mutate(featureItemElement._id)
      }
    }

    Object.keys(form.getValues()).forEach((lang) => {
      const features = [...(form.getValues()[lang] || [])]
      if (features[featureIndex]) {
        const feature = { ...features[featureIndex] }
        const featureItems = [...(feature.content.features || [])]
        featureItems.splice(itemIndex, 1)
        feature.content = {
          ...feature.content,
          features: featureItems,
        }
        features[featureIndex] = feature
        form.setValue(lang as any, features)
      }
    })
  }

  const getFeatureCountsByLanguage = () => {
    const values = form.getValues()
    return Object.entries(values).map(([langCode, features]) => ({
      language: langCode,
      count: Array.isArray(features) ? features.length : 0,
    }))
  }

  const addFeature = (langCode: string) => {
    const newFeatureId = `feature-${Date.now()}`
    const newFeature: Feature = {
      id: newFeatureId,
      title: "",
      content: {
        heading: "",
        description: "",
        features: [""],
        image: "",
      },
    }

    Object.keys(form.getValues()).forEach((lang) => {
      const currentFeatures = form.getValues()[lang] || []
      const updatedFeatures = [...currentFeatures, newFeature]
      form.setValue(lang as any, updatedFeatures, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    })

    validateFeatureCounts()
    setHasUnsavedChanges(true)
    toast({
      title: "Feature added",
      description: "A new feature has been added. Please fill in the details and save your changes.",
    })
  }

  const removeFeature = (langCode: string, featureIndex: number) => {
    const currentFeatures = form.getValues()[langCode] || []
    if (currentFeatures.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one feature",
        variant: "destructive",
      })
      return
    }

    if (existingSubSectionId && contentElements.length > 0) {
      const featureNum = featureIndex + 1
      const updatedContentElements = [...contentElements]
      const featureElements = updatedContentElements.filter(
        (element) => element.name.includes(`Feature ${featureNum}`)
      )

      featureElements.forEach((element) => {
        const elementIndex = updatedContentElements.findIndex((el) => el._id === element._id)
        if (elementIndex !== -1) {
          updatedContentElements.splice(elementIndex, 1)
        }
        deleteContentElement.mutate(element._id)
      })
      setContentElements(updatedContentElements)
    }

    Object.keys(form.getValues()).forEach((lang) => {
      const features = [...(form.getValues()[lang] || [])]
      features.splice(featureIndex, 1)
      form.setValue(lang as any, features, { shouldDirty: true })
    })

    // Update feature image indices
    for (let i = featureIndex + 1; i < currentFeatures.length; i++) {
      updateFeatureImageIndices(i, i - 1)
    }

    handleFeatureImageRemove(featureIndex)

    setHasUnsavedChanges(true)
    validateFeatureCounts()
    toast({
      title: "Feature removed",
      description: "The feature has been removed. Don't forget to save your changes.",
    })
  }

  // Get language codes for display
  const languageCodes = createLanguageCodeMap(activeLanguages)

  return (
    <div className="space-y-6">
      <LoadingDialog
        isOpen={isSaving}
        title={existingSubSectionId ? "Updating Features Section" : "Creating Features Section"}
        description="Please wait while we save your changes..."
      />
      {slug && (isLoadingData || isLoadingSubsection) && !dataLoaded ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading features section data...</p>
        </div>
      ) : (
        <Form {...form}>
          <div className="grid grid-cols-1 gap-6">
            {languageIds.map((langId) => {
              const langCode = languageCodes[langId] || langId
              return (
                <Card key={langId} className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
                        {langCode}
                      </span>
                      Features Section
                    </CardTitle>
                    <CardDescription>Manage features content for {langCode.toUpperCase()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      {form.watch(`${langCode}` as any)?.map((feature: Feature, index: number) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <div className="flex items-center justify-between">
                            <AccordionTrigger className="flex-1">
                              {feature.title || `Feature ${index + 1}`}
                            </AccordionTrigger>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="mr-4"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFeature(langCode, index)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <AccordionContent>
                            <Card className="border border-muted">
                              <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`${langCode}.${index}.id` as any}
                                    render={({ field }) => (
                                      <FormItem className="hidden">
                                        <FormLabel>ID</FormLabel>
                                        <FormControl>
                                          <Input placeholder="feature-id" {...field} />
                                        </FormControl>
                                        <FormDescription>A unique identifier for this feature</FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`${langCode}.${index}.title` as any}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Feature title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`${langCode}.${index}.content.heading` as any}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Heading</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Feature heading" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={form.control}
                                  name={`${langCode}.${index}.content.description` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Feature description"
                                          className="min-h-[100px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label>Feature List</Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addFeatureItem(langCode, index)}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add Feature
                                    </Button>
                                  </div>
                                  {feature.content.features.map((featureItem: string, featureItemIndex: number) => (
                                    <FormField
                                      key={featureItemIndex}
                                      control={form.control}
                                      name={`${langCode}.${index}.content.features.${featureItemIndex}` as any}
                                      render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                          <div className="flex-1">
                                            <FormControl>
                                              <Input placeholder={`Feature ${featureItemIndex + 1}`} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeatureItem(langCode, index, featureItemIndex)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                                {langId === languageIds[0] && (
                                  <div className="grid grid-cols-1 gap-4">
                                    <FeatureImageUploader featureIndex={index} />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <Button type="button" variant="outline" size="sm" onClick={() => addFeature(langCode)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Form>
      )}
      <div className="flex justify-end mt-6">
        {featureCountMismatch && (
          <div className="flex items-center text-amber-500 mr-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">Each language must have the same number of features</span>
          </div>
        )}
        <Button
          type="button"
          onClick={handleSave}
          disabled={isLoadingData || isSaving}
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving
            ? "Saving..."
            : existingSubSectionId
              ? "Update Features Content"
              : "Save Features Content"}
        </Button>
      </div>
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Count Mismatch</DialogTitle>
            <DialogDescription>
              <div className="mt-4 mb-4">
                Each language must have the same number of features before saving. Please add or remove features to
                ensure all languages have the same count:
              </div>
              <ul className="list-disc pl-6 space-y-1">
                {getFeatureCountsByLanguage().map(({ language, count }) => (
                  <li key={language}>
                    <span className="font-semibold uppercase">{language}</span>: {count} features
                  </li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

FeaturesForm.displayName = "FeaturesForm"
export default FeaturesForm
