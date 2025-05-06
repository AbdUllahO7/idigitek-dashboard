// Updated AddService.tsx to fix the edit mode data display issue

"use client"

import { useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Layout, Sparkles, ListChecks, ArrowRight, HelpCircle } from "lucide-react"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"

import { FormData } from "@/src/api/types/sections/service/serviceSections.types"
import { FormShell } from "@/src/components/dashboard/AddSectionlogic/FormShell"
import HeroForm from "./Components/Hero/HeroForm"
import BenefitsForm from "./Components/BenefitsForm/BenefitsForm"
import ProcessStepsForm from "./Components/ProcessStepsForm/process-steps-form"
import FaqForm from "./Components/FaqForm/faq-form"
import FeaturesForm from "./Components/FeaturesForm/features-form"

// Form sections to collect data from
const FORM_SECTIONS = ["hero", "benefits", "features", "processSteps", "faq"]

export default function AddService() {
  const searchParams = useSearchParams()
  
  // Get URL parameters
  const sectionId = searchParams.get('sectionId')
  const sectionItemId = searchParams.get('sectionItemId')
  const mode = searchParams.get('mode') || 'edit'
  const isCreateMode = mode === 'create'
  
  // API hooks
  const { useGetAll: useGetAllLanguages } = useLanguages()
  const { useGetById: useGetSectionItemById } = useSectionItems()
  const { useGetBySectionItemId: useGetSubSectionsBySectionItemId } = useSubSections()
  
  // Get languages
  const { 
    data: languagesData, 
    isLoading: isLoadingLanguages 
  } = useGetAllLanguages()
  
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
  
  // Helper function to find a subsection by slug - FIXED to be case-insensitive
  const findSubsection = (baseSlug: string) => {
    if (!subsectionsData?.data) return undefined;
    
    // Normalize the baseSlug to lowercase and handle special cases
    const normalizedBaseSlug = baseSlug.toLowerCase();
    
    // Create a mapping for known slug patterns
    const slugMappings: Record<string, string> = {
      'process-steps': 'process-steps',
      'hero-section': 'hero-section',
      'benefits': 'benefits',
      'features': 'features',
      'faq-section': 'faq-section'
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
      console.log(`Found subsection for ${baseSlug} using slug: ${subsection.slug}`);
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
      console.log(`Found partial match for ${baseSlug} with slug: ${partialMatch.slug}`);
      return partialMatch;
    }
    
    console.log(`No subsection found for ${baseSlug}. Available slugs:`, 
      subsectionsData.data.map((s: {slug: string}) => s.slug).join(', ')
    );
    
    return undefined;
  };
  
  // Generate proper slugs for subsections
  const getSlug = (baseSlug: string) => {
    if (isCreateMode) return "";
    
    // Special case handling for processSteps - correct the capitalization
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
  
  // Define tabs configuration
  const tabs = [
    {
      id: "hero",
      label: "Hero",
      icon: <Layout className="h-4 w-4" />,
      component: (
        <HeroForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('hero-section')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('hero-section')}
        />
      )
    },
    {
      id: "benefits",
      label: "Benefits",
      icon: <Sparkles className="h-4 w-4" />,
      component: (
        <BenefitsForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('benefits')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('benefits')}
        />
      )
    },
    {
      id: "features",
      label: "Features",
      icon: <ListChecks className="h-4 w-4" />,
      component: (
        <FeaturesForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('features')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('features')}
        />
      )
    },
    {
      id: "process",
      label: "Process",
      icon: <ArrowRight className="h-4 w-4" />,
      component: (
        <ProcessStepsForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('process-steps')}  // Fixed: now using lowercase 's'
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('process-steps')} // Fixed: now using lowercase 's'
        />
      )
    },
    {
      id: "faq",
      label: "FAQ",
      icon: <HelpCircle className="h-4 w-4" />,
      component: (
        <FaqForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('faq-section')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('faq-section')}
        />
      )
    }
  ]
  
  // Debugging effects to see what's happening
  useEffect(() => {
    if (subsectionsData?.data && sectionItemId && !isCreateMode) {
      console.log("Subsections loaded:", subsectionsData.data.length);
      console.log("All subsection slugs:", subsectionsData.data.map((s: { slug: string }) => s.slug));
      
      // Check what we find for each section
      console.log("hero-section subsection:", findSubsection('hero-section'));
      console.log("benefits subsection:", findSubsection('benefits'));
      console.log("features subsection:", findSubsection('features'));
      console.log("process-steps subsection:", findSubsection('process-steps'));
      console.log("faq-section subsection:", findSubsection('faq-section'));
    }
  }, [subsectionsData, sectionItemId, isCreateMode]);
  
  // Define save handler for the service
  const handleSaveService = async (formData: FormData) => {
    // Extract service info from hero data for title/description
    const heroData = formData.hero || {}
    
    // Get English title and description values or fallback to the first language
    let serviceName = "New Service"
    let serviceDescription = ""
    
    // Loop through languages to find title and description
    for (const langCode in heroData) {
      if (langCode !== 'backgroundImage' && typeof heroData[langCode] === 'object') {
        const langValues = heroData[langCode] as Record<string, any>
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
      image: heroData.backgroundImage || null,
      isActive: true,
      section: sectionId
    }
    
    // Return data for saving
    return servicePayload
  }
  
  // Loading state
  const isLoading = isLoadingLanguages || (!isCreateMode && (isLoadingSectionItem || isLoadingSubsections))
  
  return (
    <FormShell
      title={isCreateMode ? "Create New Service" : "Edit Service"}
      subtitle={isCreateMode 
        ? "Create a new service with multilingual content" 
        : `Editing "${sectionItemData?.data?.name || 'Service'}" content across multiple languages`}
      backUrl={`/dashboard/services?sectionId=${sectionId}`}
      activeLanguages={activeLanguages}
      serviceData={sectionItemData?.data}
      sectionId={sectionId}
      sectionItemId={sectionItemId}
      mode={mode}
      onSave={handleSaveService}
      tabs={tabs}
      formSections={FORM_SECTIONS}
      isLoading={isLoading}
    />
  )
}