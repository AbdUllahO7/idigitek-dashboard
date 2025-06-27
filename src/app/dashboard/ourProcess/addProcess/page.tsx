"use client"
import { useSearchParams } from "next/navigation"
import { Layout } from "lucide-react"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { FormShell } from "@/src/components/dashboard/AddSectionlogic/FormShell"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import ProcessForm from "./Process/ProcessForm"
import { FormDataProcess } from "@/src/api/types/sections/Process/processSection.type"
import { useTranslation } from "react-i18next"
import { ClickableImage } from "@/src/components/ClickableImage"

// Form sections to collect data from
const FORM_SECTIONS = ["process"]

export default function AddProcess() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  
  // Get URL parameters
  const sectionId = searchParams.get('sectionId')
  const sectionItemId = searchParams.get('sectionItemId')
  const mode = searchParams.get('mode') || 'edit'
  const isCreateMode = mode === 'create'
  const { websiteId } = useWebsiteContext();

  // API hooks
  const { useGetByWebsite: useGetAllLanguages } = useLanguages()
  const { useGetById: useGetSectionItemById } = useSectionItems()
  const { useGetBySectionItemId: useGetSubSectionsBySectionItemId } = useSubSections()
  
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
  
  // Get subsections for this service if in edit mode
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
  
  // Helper function to find a subsection by slug - FIXED to be case-insensitive and process-specific
  const findSubsection = (baseSlug: string) => {
    if (!subsectionsData?.data) return undefined;
    
    // Normalize the baseSlug to lowercase and handle special cases
    const normalizedBaseSlug = baseSlug.toLowerCase();
    
    // Create a mapping for known process slug patterns
    const slugMappings: Record<string, string> = {
      'process-steps': 'process-steps',
      'process-section': 'process-section',
      'process-details': 'process-details',
      'process-benefits': 'process-benefits',
      'process-features': 'process-features',
      'process-faq': 'process-faq'
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
    
    // Special case handling for process steps - correct the capitalization
    if (baseSlug === "process-Steps") {
      baseSlug = "process-steps";
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
  
  // Define tabs configuration with translations
  const tabs = [
    {
      id: "process",
      label: t('addProcess.processTabLabel', 'Process'),
      icon: <Layout className="h-4 w-4" />,
      component: (
        <ProcessForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('process-section')} // Changed from 'news-section' to 'process-section'
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('process-section')} // Changed from 'news-section' to 'process-section'
        />
      )
    }
  ]
  
  // Define save handler for the process with translations
  const handleSaveProcess = async (formData: FormDataProcess) => {
    // Extract process info from process data for title/description
    const processData = formData.process || {}
    
    // Get English title and description values or fallback to the first language
    let serviceName = t('addProcess.defaultProcessName', 'New Process')
    let serviceDescription = ""
    
    // Loop through languages to find title and description
    for (const langCode in processData) {
      if (langCode !== 'backgroundImage' && typeof processData[langCode] === 'object') {
        const langValues = processData[langCode] as Record<string, any>
        if (langValues?.title) {
          serviceName = langValues.title
        }
        if (langValues?.description) {
          serviceDescription = langValues.description
        }
        // Prefer English if available
        if (langCode === 'en') {
          break
        }
      }
    }
    
    // Create the service payload
    const servicePayload = {
      name: serviceName,
      description: serviceDescription,
      image: processData.backgroundImage || null,
      isActive: true,
      section: sectionId
    }
    
    // Return data for saving
    return servicePayload
  }
  
  // Loading state
  const isLoading = isLoadingLanguages || (!isCreateMode && (isLoadingSectionItem || isLoadingSubsections))
  
  // Get translated title and subtitle
  const getTitle = () => {
    return isCreateMode 
      ? t('addProcess.createTitle', 'Create New Process')
      : t('addProcess.editTitle', 'Edit Process')
  }
  
  const getSubtitle = () => {
    return isCreateMode 
      ? t('addProcess.createSubtitle', 'Create a new process with multilingual content')
      : t('addProcess.editSubtitle', `Editing "${sectionItemData?.data?.name || t('addProcess.processPlaceholder', 'Process')}" content across multiple languages`)
  }
  
  return (
   <>
    <ClickableImage
                  imageSrc="/assets/sections/process.png"
                  imageAlt={t('HeroManagement.tabLabel', 'Hero Section')}
                  size="large"
                  title={t('HeroManagement.tabLabel', 'Hero Section')}
                  subtitle={t('HeroManagement.createSubtitle', 'Click to view full size')}
                  t={t}
                  priority
                  className="w-full"
                  previewClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl h-64 md:h-80 lg:h-96"
                />
          
    
                
    <FormShell
      title={getTitle()}
      subtitle={getSubtitle()}
      backUrl={`/dashboard/ourProcess?sectionId=${sectionId}`}
      activeLanguages={activeLanguages}
      serviceData={sectionItemData?.data}
      sectionId={sectionId}
      sectionItemId={sectionItemId}
      mode={mode}
      onSave={handleSaveProcess}
      tabs={tabs}
      formSections={FORM_SECTIONS}
      isLoading={isLoading}
    />
   </>
  )
}