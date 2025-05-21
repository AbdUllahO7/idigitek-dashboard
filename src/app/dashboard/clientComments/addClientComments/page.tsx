// Updated AddIndustry.tsx to fix the edit mode data display issue

"use client"

import { Layout } from "lucide-react"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"

import { FormData } from "@/src/api/types/sections/service/serviceSections.types"
import { FormShell } from "@/src/components/dashboard/AddSectionlogic/FormShell"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useSearchParams } from "next/navigation"
import ClientCommentsForm from "./ClientCommentsForm"

// Form sections to collect data from
const FORM_SECTIONS = ["Client Comments"]

export default function AddIndustry() {
  const searchParams = useSearchParams()
  
  // Get URL parameters
  const sectionId = searchParams.get('sectionId')
  const sectionItemId = searchParams.get('sectionItemId')
  const mode = searchParams.get('mode') || 'edit'
  const isCreateMode = mode === 'create'
  
  // API hooks
  const { useGetByWebsite: useGetAllLanguages } = useLanguages()
  const { useGetById: useGetSectionItemById } = useSectionItems()
  const { useGetBySectionItemId: useGetSubSectionsBySectionItemId } = useSubSections()
    const { websiteId } = useWebsiteContext();
  
  // Get languages
  const { 
    data: languagesData, 
    isLoading: isLoadingLanguages 
  } = useGetAllLanguages(websiteId)
  
  // Get section item data if in edit mode
  const {
    data: sectionItemData,
    isLoading: isLoadingSectionItem
  } = useGetSectionItemById(
    sectionItemId || '', 
    Boolean(sectionItemId) && !isCreateMode, // Only fetch in edit mode
    false,
  )
  
  // Get subsections for this Client Comment if in edit mode
  const {
    data: subsectionsData,
    isLoading: isLoadingSubsections
  } = useGetSubSectionsBySectionItemId(
    sectionItemId || '',
    Boolean(sectionItemId) && !isCreateMode, // Only fetch in edit mode
    100,
    0,
    false,
  )
  
  // Filter active languages
  const activeLanguages = languagesData?.data?.filter((lang: { isActive: any }) => lang.isActive) || []
  
  // Helper function to find a subsection by slug - FIXED to be case-insensitive
  const findSubsection = (baseSlug: string) => {
    if (!subsectionsData?.data) return undefined;
    
    // Normalize the baseSlug to lowercase and handle special cases
    const normalizedBaseSlug = baseSlug.toLowerCase();
    
    // Create a mapping for known slug patterns
    const slugMappings: Record<string, string> = {
      'ClientComments-section': 'ClientComments-section',
    };
    
    // Get the normalized version of the slug
    const normalizedSlug = slugMappings[normalizedBaseSlug] || normalizedBaseSlug;
    
    // Expected pattern is: normalizedSlug-sectionItemId
    const expectedSlug = `${normalizedSlug}-${sectionItemId}`;
    
    // Find subsection that matches in a case-insensitive way
    const subsection = subsectionsData.data.find((s: { slug: string }) => 
      s.slug.toLowerCase() === expectedSlug.toLowerCase()
    );
    
    if (subsection) {
      return subsection;
    }
    
    // If no exact match, try partial matching (containing both the base slug and section ID)
    const partialMatch = subsectionsData.data.find((s: { slug: string }) => {
      const lowerSlug = s.slug.toLowerCase();
      // Check both with hyphen and without
      return (lowerSlug.includes(normalizedSlug.replace('-', '')) || 
              lowerSlug.includes(normalizedSlug)) && 
              sectionItemId && lowerSlug.includes(sectionItemId.toLowerCase());
    });
    
    if (partialMatch) {
      return partialMatch;
    }
    
      return undefined;
  };
  
  // Generate proper slugs for subsections
  const getSlug = (baseSlug: string) => {
    if (isCreateMode) return "";
    
    // Special case handling for processSteps - correct the capitalization
    if (baseSlug === "process-Steps") {
      baseSlug = "ClientComments";
    }
    
    // Find the subsection
    const subsection = findSubsection(baseSlug);
    
    // If found, use its actual slug
    if (subsection) {
      return subsection.slug;
    }
    
    // Default fallback - construct the expected slug format
    return `${baseSlug.toLowerCase()}-${sectionItemId}`;
  };
  
  // Define tabs configuration
  const tabs = [
    {
      id: "ClientComments",
      label: "Client Comments",
      icon: <Layout className="h-4 w-4" />,
      component: (
        <ClientCommentsForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('ClientComments')}
          subSectionId = {sectionItemId}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('ClientComments')}
        />
      )
    }
  ]
   
  // Define save handler for the Client Comment
  const handleSaveIndustry = async (formData: FormData) => {
    // Extract Client Comment info from hero data for title/description
    const heroData = formData.hero || {}
    
    // Get English title and description values or fallback to the first language
    let ClientCommentName = "New Comment"
    let ClientCommentDescription = ""
    
    // Loop through languages to find title and description
    for (const langCode in heroData) {
      if (langCode !== 'backgroundImage' && typeof heroData[langCode] === 'object') {
        const langValues = heroData[langCode] as Record<string, any>
        if (langValues?.title) {
          ClientCommentName = langValues.title
        }
        if (langValues?.description) {
          ClientCommentDescription = langValues.description
        }
        // Prefer English if available
        if (langCode === 'en') {
          break
        }
      }
    }
    
    // Create the Client Comment payload
    const ClientCommentPayload = {
      name: ClientCommentName,
      description: ClientCommentDescription,
      image: heroData.backgroundImage || null,
      isActive: true,
      section: sectionId
    }
    
    // Return data for saving
    return ClientCommentPayload
  }
  
  // Loading state
  const isLoading = isLoadingLanguages || (!isCreateMode && (isLoadingSectionItem || isLoadingSubsections))
  
  return (
    <FormShell
      title={isCreateMode ? "Create New Client Comment item " : "Edit Client Comment item "}
      subtitle={isCreateMode 
        ? "Create a new Client Comment item with multilingual content" 
        : `Editing "${sectionItemData?.data?.name || 'Client Comment item'}" content across multiple languages`}
      backUrl={`/dashboard/clientComments?sectionId=${sectionId}`}
      activeLanguages={activeLanguages}
      serviceData={sectionItemData?.data}
      sectionId={sectionId}
      sectionItemId={sectionItemId}
      mode={mode}
      onSave={handleSaveIndustry}
      tabs={tabs}
      formSections={FORM_SECTIONS}
      isLoading={isLoading}
    />
  )
}