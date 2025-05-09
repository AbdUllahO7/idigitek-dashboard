"use client"

import { useState, useEffect } from "react"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { Loader2 } from "lucide-react"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { FieldConfig, MultilingualSectionData } from "@/src/api/types/hooks/MultilingualSection.types"

interface SectionConfig {
  name: string // Section name used for display
  slug: string // Section slug used in API calls
  subSectionName: string // Name of the subsection entity
  description: string // Description of the subsection
  fields: FieldConfig[] // Fields configuration
  elementsMapping: Record<string, string> // Mapping of field IDs to element names
  isMain: boolean // Flag to indicate if this is a main section
}

interface GenericSectionIntegrationProps {
  onSectionChange?: (data: MultilingualSectionData) => void
  config: SectionConfig // Configuration for this specific section
  sectionTitle?: string // Optional override for section title
  sectionDescription?: string // Optional override for section description
  addButtonLabel?: string // Optional override for add button label
  editButtonLabel?: string // Optional override for edit button label
  saveButtonLabel?: string // Optional override for save button label
  noDataMessage?: string // Optional override for no data message
  ParentSectionId: string // The ID of the parent entity (section or sectionItem)
  createMainService?: boolean // Whether to create a main-service section item
}


// Helper function to extract ID from various response formats
function extractId(response: any): string | null {
  if (!response) return null

  if (response._id) return response._id
  if (response.data?._id) return response.data._id
  if (response.id) return response.id
  if (response.data?.id) return response.data.id

  // Try to extract from JSON stringification if response is complex
  try {
    const stringified = JSON.stringify(response)
    const idMatch = stringified.match(/"_id":"([^"]+)"/i) || stringified.match(/"id":"([^"]+)"/i)
    if (idMatch && idMatch[1]) {
      return idMatch[1]
    }
  } catch (e) {
    console.error("Error parsing response:", e)
  }

  return null
}

function GenericSectionIntegration({
  onSectionChange,
  config,
  ParentSectionId,
  createMainService = false,
}: GenericSectionIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sectionData, setSectionData] = useState<MultilingualSectionData | null>(null)
  const [isDataProcessed, setIsDataProcessed] = useState(false)
  const [mainServiceId, setMainServiceId] = useState<string | null>(null)

  // Get hooks for API calls
  const {
    useGetAll: useGetAllSubSections,
    useGetCompleteBySlug,
    useGetBySectionItemId,
  } = useSubSections()

  const { useGetAll: useGetAllLanguages } = useLanguages()

  // Section Items hooks for main-service creation
  const { useGetBySectionId: useGetSectionItemsBySectionId, useCreate: useCreateSectionItem } = useSectionItems()

  // Get section items for this section if createMainService is true
  const {
    data: sectionItemsData,
    isLoading: isLoadingSectionItems,
    refetch: refetchSectionItems,
  } = useGetSectionItemsBySectionId(ParentSectionId, true, 100, 0, false)

  // Section Item creation mutation
  const createSectionItem = useCreateSectionItem()

  // Effect to create or find main-service section item if needed
  useEffect(() => {
    const createMainServiceItem = async () => {
      if (!createMainService || mainServiceId || isLoadingSectionItems || !sectionItemsData?.data) {
        return
      }

      try {
        setIsLoading(true)

        // Check if main-service already exists
        const existingMainService = sectionItemsData.data.find((item: any) => item.name === "main-service")

        // If main-service exists, use its ID
        if (existingMainService?._id) {
          setMainServiceId(existingMainService._id)
          return
        }

        // Extract title and description if we have sectionData
        let description = "Primary service offering"
        let title = config.subSectionName // Default name
        // Try to get title from section data
        if (sectionData && sectionData.title && typeof sectionData.title === "object") {
          const firstLangTitle = Object.values(sectionData.title)[0] as string
          if (firstLangTitle) {
            title = firstLangTitle
          }
        }

        // Try to get description from section data
        if (sectionData && sectionData.description && typeof sectionData.description === "object") {
          const firstLangDesc = Object.values(sectionData.description)[0] as string
          if (firstLangDesc) {
            description = firstLangDesc
          }
        }


        // Create the main-service section item
        const sectionItemData = {
          name: "main-service",
          description: description,
          section: ParentSectionId,
          isActive: true,
          order: 0,
          isMain: true,
          WibSite : "1",
          // Optional image from section data if available
          image: sectionData?.imageUrl || null,

        }


        const response = await createSectionItem.mutateAsync(sectionItemData)

        // Get ID from response
        const newServiceId = extractId(response)

        if (newServiceId) {
          setMainServiceId(newServiceId)

          // Refetch section items to include the new one
          if (refetchSectionItems) {
            await refetchSectionItems()
          }
        }
      } catch (error) {
        console.error("Error creating main-service:", error)
      } finally {
        setIsLoading(false)
      }
    }

    createMainServiceItem()
  }, [
    createMainService,
    mainServiceId,
    ParentSectionId,
    sectionItemsData,
    isLoadingSectionItems,
    sectionData,
    createSectionItem,
    refetchSectionItems,
  ])

  // Determine the actual parent ID to use (section ID or main-service ID)
  const effectiveParentId = createMainService && mainServiceId ? mainServiceId : ParentSectionId

  const { data: sectionItemSubSections, isLoading: isLoadingSectionItemSubSections } = useGetBySectionItemId(
    effectiveParentId,
    true,
    100,
    0,
    false,
  )

  // Query data with refetch capabilities
  const getAllSubSectionsQuery = useGetAllSubSections()
  const { data: subSectionsData, isLoading: isLoadingSubSections } = getAllSubSectionsQuery

  // Find the section in all subsections - check first in section item subsections, then in all subsections
  let sectionSubsection = sectionItemSubSections?.data?.find((subsection: any) => subsection.slug === config.slug)

  // If not found in section item subsections, try all subsections
  if (!sectionSubsection) {
    sectionSubsection = subSectionsData?.data?.find((subsection: any) => subsection.slug === config.slug)
  }

  // Get complete section data with elements and translations
  const getCompleteSectionQuery = useGetCompleteBySlug(config.slug, false)
  const {
    data: completeSectionData,
    isLoading: isLoadingSectionData,
  } = getCompleteSectionQuery

  const { data: languagesData, isLoading: isLoadingLanguages } = useGetAllLanguages()

  // Build section data when complete service data loads
  useEffect(() => {
    // Skip if we've already processed this data or dependencies are loading
    if (
      isDataProcessed ||
      isLoading ||
      !completeSectionData?.data ||
      !languagesData?.data ||
      isLoadingLanguages ||
      isLoadingSectionData
    ) {
      return
    }

    try {
      setIsLoading(true)

      // Get active languages
      const activeLanguages = languagesData?.data?.filter((lang: any) => lang.isActive) || []
      if (activeLanguages.length === 0) {
        setIsLoading(false)
        setIsDataProcessed(true)
        return
      }

      // Get content elements from complete data
      const contentElements = completeSectionData.data.contentElements || []

      // Initialize section data
      const initialSectionData: MultilingualSectionData = {
        id: completeSectionData.data._id,
      }

      // Initialize fields
      config.fields.forEach((field) => {
        initialSectionData[field.id] = {}
      })

      // Map content elements to section data
      for (const element of contentElements) {
        // Find which field this element maps to
        let fieldId: string | null = null

        // Check for exact name match first
        for (const [key, value] of Object.entries(config.elementsMapping)) {
          if (value === element.name) {
            fieldId = key
            break
          }
        }

        // If no match found, check for case-insensitive match
        if (!fieldId) {
          for (const [key, value] of Object.entries(config.elementsMapping)) {
            if (value.toLowerCase() === element.name.toLowerCase()) {
              fieldId = key
              break
            }
          }
        }

        if (!fieldId) {
          console.log(`Could not find field mapping for element: ${element.name}`)
          continue
        }

        // Get translations for this element
        const translations = element.translations || []

        // Add translations to section data
        for (const lang of activeLanguages) {
          if (!lang.languageID) continue

          const translation = translations.find((t: any) => {
            if (typeof t.language === "string") {
              return t.language === lang.languageID || t.language === lang._id
            } else if (t.language && typeof t.language === "object") {
              return t.language.languageID === lang.languageID || t.language._id === lang._id
            }
            return false
          })

          if (!initialSectionData[fieldId]) {
            initialSectionData[fieldId] = {}
          } else if (typeof initialSectionData[fieldId] === "string") {
            initialSectionData[fieldId] = {}
          }

          const fieldObj = initialSectionData[fieldId] as Record<string, string>
          fieldObj[lang.languageID] = translation?.content || element.defaultContent || ""
        }
      }

      setSectionData(initialSectionData)
      setIsDataProcessed(true)

      // Notify parent component
      if (onSectionChange) {
        onSectionChange(initialSectionData)
      }
    } catch (error) {
      console.error(`Error building ${config.name} section data:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [
    completeSectionData,
    languagesData,
    isLoading,
    isLoadingLanguages,
    isLoadingSectionData,
    isDataProcessed,
    onSectionChange,
    config.fields,
    config.elementsMapping,
    config.name,
  ])

  // Reset processed flag when dependencies change
  useEffect(() => {
    if (completeSectionData || languagesData) {
      setIsDataProcessed(false)
    }
  }, [completeSectionData, languagesData])

  // Show loading state if we're still creating/finding the main-service section item
  if (createMainService && !mainServiceId && (isLoading || isLoadingSectionItems)) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <span className="ml-2 text-muted-foreground">Setting up main service...</span>
      </div>
    )
  }

  if (
    isLoadingSubSections ||
    isLoadingLanguages ||
    isLoadingSectionData ||
    isLoading ||
    isLoadingSectionItemSubSections
  ) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <span className="ml-2 text-muted-foreground">Loading {config.name.toLowerCase()} section data...</span>
      </div>
    )
  }

  return (
    <>
    </>
  )
}

export default GenericSectionIntegration
