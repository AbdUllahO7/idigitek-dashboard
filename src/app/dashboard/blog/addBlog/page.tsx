// Updated AddBlog.tsx to fix the edit mode data display issue

"use client"
import { useSearchParams } from "next/navigation"
import { Layout } from "lucide-react"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"

import { FormShell } from "@/src/components/dashboard/AddSectionlogic/FormShell"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { FormDataBlog } from "@/src/api/types/sections/blog/blogSection.types"
import BlogForm from "./Blog/BlogForm"


// Form sections to collect data from
const FORM_SECTIONS = ["blog"]

export default function AddBlog() {
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
  
  // Helper function to find a subsection by slug - FIXED to be case-insensitive
  const findSubsection = (baseSlug: string) => {
    if (!subsectionsData?.data) return undefined;
    
    // Normalize the baseSlug to lowercase and handle special cases
    const normalizedBaseSlug = baseSlug.toLowerCase();
    
    // Create a mapping for known slug patterns
    const slugMappings: Record<string, string> = {
      'process-steps': 'process-steps',
      'blog-section': 'blog-section',
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
    if (baseSlug === "blog-") {
      baseSlug = "blog-";
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
      id: "blog",
      label: "Blog",
      icon: <Layout className="h-4 w-4" />,
      component: (
        <BlogForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('blog-section')}
          subSectionId = {sectionItemId}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('blog-section')}
        />
      )
    }
  ]
   
  // Define save handler for the service
  const handleSaveBlog = async (formData: FormDataBlog) => {
    // Extract service info from blog data for title/description
    const blogData = formData.blog || {}
    
    // Get English title and description values or fallback to the first language
    let serviceName = "New Blog"
    let serviceDescription = ""
    
    // Loop through languages to find title and description
    for (const langCode in blogData) {
      if (langCode !== 'backgroundImage' && typeof blogData[langCode] === 'object') {
        const langValues = blogData[langCode] as Record<string, any>
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
      image: blogData.backgroundImage || null,
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
      title={isCreateMode ? "Create New Blog" : "Edit Blog"}
      subtitle={isCreateMode 
        ? "Create a new service with multilingual content" 
        : `Editing "${sectionItemData?.data?.name || 'Blog'}" content across multiple languages`}
      backUrl={`/dashboard/blog?sectionId=${sectionId}`}
      activeLanguages={activeLanguages}
      serviceData={sectionItemData?.data}
      sectionId={sectionId}
      sectionItemId={sectionItemId}
      mode={mode}
      onSave={handleSaveBlog}
      tabs={tabs}
      formSections={FORM_SECTIONS}
      isLoading={isLoading}
    />
  )
}