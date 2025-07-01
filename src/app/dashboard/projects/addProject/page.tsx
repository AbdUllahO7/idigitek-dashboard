"use client"
import { useSearchParams } from "next/navigation"
import { Layout, Sparkles, FileText } from "lucide-react"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { FormShell } from "@/src/components/dashboard/AddSectionlogic/FormShell"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { FormDataProject } from "@/src/api/types/sections/project/porjectSection.type"
import MoreInfoForm from "./tabs/MoreInfo/MoreInfoForm"
import BasicForm from "./tabs/BasicForm/BasicForm"
import MultiImageForm from "./tabs/MultiImageForm"
import { useTranslation } from "react-i18next"
import MultiFileForm from "./tabs/MultiFileForm/MultiFileForm"
import { ClickableImage } from "@/src/components/ClickableImage"

// Form sections to collect data from
const FORM_SECTIONS = ["" ]

export default function AddProject() {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  
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
      'basic-info': 'basic-info',
      'more-info': 'more-info',
      'multi-image': 'multi-image',
      'multi-file': 'multi-file',
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
      id: "project",
      label: t('addProject.projectTab', 'Project'),
      icon: <Layout className="h-4 w-4" />,
      component: (
        <>
         <ClickableImage
            imageSrc="/assets/PartsOfSections/project-hero.png"
            imageAlt={t('servicesPage.title', 'Services Section')}
            size="large"
            title={t('servicesPage.title', 'Services Section')}
            subtitle={t('servicesPage.description', 'Click to view full size')}
            t={t}
            priority
            className="w-full"
            previewClassName="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-2xl h-64 md:h-80 lg:h-96"
          />

          <BasicForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('project-section')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('project-section')}
        />
        </>
      )
    },
    {
      id: "moreInfo",
      label: t('addProject.moreInfoTab', 'More Info'),
      icon: <Sparkles className="h-4 w-4" />,
      component: (
        <>
             <ClickableImage
            imageSrc="/assets/PartsOfSections/project-client.png"
            imageAlt={t('servicesPage.title', 'Services Section')}
            size="large"
            title={t('servicesPage.title', 'Services Section')}
            subtitle={t('servicesPage.description', 'Click to view full size')}
            t={t}
            priority
            className="w-full"
            previewClassName="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-2xl h-64 md:h-80 lg:h-96"
          />

        <MoreInfoForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('project-moreInfo-section')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('project-moreInfo-section')}
        />
        </>
      )
    },
    {
      id: "images",
      label: t('addProject.imagesTab', 'Images'),
      icon: <Sparkles className="h-4 w-4" />,
      component: (
      <>
       <ClickableImage
            imageSrc="/assets/PartsOfSections/project-gallery.png"
            imageAlt={t('servicesPage.title', 'Services Section')}
            size="large"
            title={t('servicesPage.title', 'Services Section')}
            subtitle={t('servicesPage.description', 'Click to view full size')}
            t={t}
            priority
            className="w-full"
            previewClassName="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-2xl h-64 md:h-80 lg:h-96"
          />


        <MultiImageForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('project-images-section')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('project-images-section')}
        />
      </>
      )
    },
    {
      id: "files",
      label: t('addProject.filesTab', 'Files'),
      icon: <FileText className="h-4 w-4" />,
      component: (
       <>
        <ClickableImage
            imageSrc="/assets/PartsOfSections/project-file.png"
            imageAlt={t('servicesPage.title', 'Services Section')}
            size="large"
            title={t('servicesPage.title', 'Services Section')}
            subtitle={t('servicesPage.description', 'Click to view full size')}
            t={t}
            priority
            className="w-full"
            previewClassName="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-2xl h-64 md:h-80 lg:h-96"
          />

        <MultiFileForm
          languageIds={activeLanguages.map((lang: { _id: any }) => lang._id)}
          activeLanguages={activeLanguages}
          slug={getSlug('project-files-section')}
          ParentSectionId={isCreateMode ? sectionId || "" : (sectionItemId || "")}
          initialData={findSubsection('project-files-section')}
        />
        
       </>
      )
    },
  ]

  // Define save handler for the service
  const handleSaveProject = async (formData: FormDataProject) => {
    // Extract service info from project data for title/description
    const projectData = formData.project || {}
    
    // Get English title and description values or fallback to the first language
    let serviceName = t('addProject.newProjectName', 'New Project')
    let serviceDescription = ""
    
    // Loop through languages to find title and description
    for (const langCode in projectData) {
      if (langCode !== 'backgroundImage' && typeof projectData[langCode] === 'object') {
        const langValues = projectData[langCode] as Record<string, any>
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
      image: projectData.backgroundImage || null,
      isActive: true,
      section: sectionId
    }
    
    // Return data for saving
    return servicePayload
  }
  
  // Loading state
  const isLoading = isLoadingLanguages || (!isCreateMode && (isLoadingSectionItem || isLoadingSubsections))
  
  // Get project name for subtitle
  const projectName = sectionItemData?.data?.name || t('addProject.newProjectName', 'New Project')
  
  return (
    <>
     <ClickableImage
        imageSrc="/assets/sections/projects.png"
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
      title={isCreateMode ? t('addProject.createTitle', 'Create New Project') : t('addProject.editTitle', 'Edit Project')}
      subtitle={isCreateMode 
        ? t('addProject.createSubtitle', 'Create a new service with multilingual content')
        : t('addProject.editSubtitle', 'Editing "{{projectName}}" content across multiple languages', { projectName })
      }
      backUrl={`/dashboard/projects?sectionId=${sectionId}`}
      activeLanguages={activeLanguages}
      serviceData={sectionItemData?.data}
      sectionId={sectionId}
      sectionItemId={sectionItemId}
      mode={mode}
      onSave={handleSaveProject}
      tabs={tabs}
      formSections={FORM_SECTIONS}
      isLoading={isLoading}
    />
    </>
  )
}