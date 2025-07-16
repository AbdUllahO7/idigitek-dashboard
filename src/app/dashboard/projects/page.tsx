"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { getProjectSectionConfig, projectSectionConfig } from "./ProjectSectionConfig"
import { useTranslation } from "react-i18next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Navigation, Users } from "lucide-react"
import CreateNavigationSubSection from "../team/navigation/CreateNavigationSubSection"
import { getTeamNavigationSectionConfig } from "../team/navigation/team-navigation-config"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"

// Project table column definitions with translation support
const getProjectColumns = (t: any) => [
  {
    header: t('projectPage.name', 'Name'),
    accessor: "name",
    className: "font-medium"
  },
  {
    header: t('projectPage.tableDescription', 'Description'),
    accessor: "description",
    cell: TruncatedCell
  },
  {
    header: t('projectPage.status', 'Status'),
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {t('projectPage.main', 'Main')}
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: t('projectPage.order', 'Order'),
    accessor: "order"
  },
  {
    header: t('projectPage.subsections', 'Subsections'),
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]

// Helper function to check if a subsection matches project criteria
// Use SLUG and TYPE for language-agnostic matching
const isProjectMainSubsection = (sub: any) => {
  if (!sub.isMain) return false;
  
  // Check using slug (language-agnostic)
  const projectSlugs = [
    'Project-main',           // Exact match from your config
    'project-main',           // Case insensitive
    'projects-main',          // Plural variation
    'Project',                // Base project slug
    'project'                 // Case insensitive base
  ];
  
  // Check using type (language-agnostic)
  const projectTypes = [
    'Project',                // Exact match from your config
    'project',                // Case insensitive
    'projects',               // Plural variation
    'Projects'                // Capitalized plural
  ];
  
  return (
    projectSlugs.some(slug => 
      sub.slug === slug || 
      sub.slug?.toLowerCase() === slug.toLowerCase()
    ) ||
    projectTypes.some(type => 
      sub.type === type || 
      sub.type?.toLowerCase() === type.toLowerCase()
    )
  );
};

// Helper function to check if a subsection matches navigation criteria  
const isProjectNavigationSubsection = (sub: any) => {
  // Check using slug/type for navigation
  const navigationSlugs = [
    'projects-navigation',
    'project-navigation',
    'navigation-projects', 
    'navigation-project',
    'Project-navigation',    // With capital P
    'Projects-navigation'    // Plural
  ];
  
  const navigationTypes = [
    'navigation',
    'Navigation',
    'projects-nav',
    'project-nav',
    'Project-nav'
  ];
  
  return (
    navigationTypes.some(type => 
      sub.type === type || 
      sub.type?.toLowerCase() === type.toLowerCase()
    ) ||
    navigationSlugs.some(slug => 
      sub.slug === slug || 
      sub.slug?.toLowerCase() === slug.toLowerCase() ||
      sub.name === slug ||
      sub.name?.toLowerCase() === slug.toLowerCase()
    ) ||
    (sub.name && sub.name.toLowerCase().includes('project') && sub.name.toLowerCase().includes('navigation'))
  );
};

export default function ProjectPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const { t, i18n } = useTranslation()
  
  // Get current language from i18n
  const currentLanguage = i18n.language || 'en'

  // Get current language configurations
  const translatedProjectSectionConfig = useMemo(() => 
    getProjectSectionConfig(currentLanguage), [currentLanguage]
  )
  
  const NavigationConfig = getTeamNavigationSectionConfig(currentLanguage);
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)

  // Get basic section info for both navigation and main content pre-population
  const {useGetBasicInfoByWebsiteId} = useSections()
  const { data: basicInfo } = useGetBasicInfoByWebsiteId(websiteId)
  
  //  Process section data for both navigation and main content use
  const sectionInfoForNavigation = useMemo(() => {
    if (!basicInfo?.data?.length) return null;
    
    // Find the current section in the basic info
    const currentSection = sectionId ? 
      basicInfo.data.find(section => section.id === sectionId) : 
      basicInfo.data[0]; // Use first section if no specific sectionId
    
    if (!currentSection) return null;
    
    return {
      id: currentSection.id,
      name: currentSection.name,
      subName: currentSection.subName,
      // Create navigation-friendly data structure
      navigationData: {
        availableLanguages: ['en', 'ar', 'tr'], // Languages available in section data
        fallbackValues: {
          // Use section name as navigation label, subName as URL
          navigationLabel: currentSection.name,
          navigationUrl: `/${currentSection.subName.toLowerCase()}`
        }
      }
    };
  }, [basicInfo, sectionId]);

  // Configuration for the Project page with translations
  const PROJECTS_CONFIG = useMemo(() => ({
    title: t('projectPage.title', 'Project Management'),
    description: t('projectPage.description', 'Manage your Project inventory and multilingual content'),
    addButtonLabel: t('projectPage.addButtonLabel', 'Add New Project item'),
    emptyStateMessage: t('projectPage.emptyStateMessage', 'No Project found. Create your first Project by clicking the "Add New Project" button.'),
    noSectionMessage: t('projectPage.noSectionMessage', 'Please create a Project section first before adding Project.'),
    mainSectionRequiredMessage: t('projectPage.mainSectionRequiredMessage', 'Please enter your main section data before adding Project.'),
    emptyFieldsMessage: t('projectPage.emptyFieldsMessage', 'Please complete all required fields in the main section before adding Project.'),
    sectionIntegrationTitle: t('projectPage.sectionIntegrationTitle', 'Project Section Content'),
    sectionIntegrationDescription: t('projectPage.sectionIntegrationDescription', 'Manage your Project section content in multiple languages.'),
    addSectionButtonLabel: t('projectPage.addSectionButtonLabel', 'Add Project Section'),
    editSectionButtonLabel: t('projectPage.editSectionButtonLabel', 'Edit Project Section'),
    saveSectionButtonLabel: t('projectPage.saveSectionButtonLabel', 'Save Project Section'),
    listTitle: t('projectPage.listTitle', 'Project List'),
    editPath: t('projectPage.editPath', 'projects/addProject')
  }), [t]);

  // Get translated column definitions
  const PROJECTS_COLUMNS = useMemo(() => getProjectColumns(t), [t])

  // Check if main subsection exists
  const { useGetMainByWebSiteId, useGetBySectionId } = useSubSections()
  
  const {
    data: mainSubSectionData,
    isLoading: isLoadingCompleteSubsections,
    refetch: refetchMainSubSection
  } = useGetMainByWebSiteId(websiteId)

  // If we have a specific section ID, also fetch subsections for that section
  const {
    data: sectionSubsections,
    isLoading: isLoadingSectionSubsections
  } = useGetBySectionId(sectionId || "")

  // Use the generic list hook for Project management
  const {
    section: projectSection,
    items: projectItems,
    isLoadingItems: isLoadingProjectItems,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    itemToDelete,
    isDeleting,
    isAddButtonDisabled: defaultAddButtonDisabled,
    handleEdit,
    handleDelete,
    handleAddNew,
    handleItemCreated,
    showDeleteDialog,
    setIsCreateDialogOpen,
    setIsDeleteDialogOpen,
    setSection
  } = useGenericList({
    sectionId,
    apiHooks: useSectionItems(),
    editPath: PROJECTS_CONFIG.editPath
  })

  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = (subsection: any) => {
    // Use the flexible matching function
    const hasCorrectIdentifier = isProjectNavigationSubsection(subsection);
    
    // Set that we have a navigation subsection now
    setHasNavigationSubSection(hasCorrectIdentifier);
    
    // Force refetch of all subsection data
    if (refetchMainSubSection) {
      setTimeout(() => {
        refetchMainSubSection();
      }, 1000); // Give it a bit more time to ensure data is saved
    }
  };

  // FIXED useEffect with slug/type-based matching instead of name-based matching
  useEffect(() => {    
    console.log("=== DEBUG: useEffect triggered ===");
    console.log("Current language:", currentLanguage);
    console.log("Config slug:", translatedProjectSectionConfig.slug);
    console.log("Config type:", translatedProjectSectionConfig.type);
    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      setIsLoadingMainSubSection(true);
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let foundNavigationSubSection = false;
    let mainSubSection = null;
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      console.log("Section-specific data:", sectionData);
      
      if (Array.isArray(sectionData)) {
        // Use slug/type-based matching instead of name-based matching
        mainSubSection = sectionData.find(sub => {
          const matches = isProjectMainSubsection(sub);
          console.log(`Checking subsection: ${sub.name}, slug: ${sub.slug}, type: ${sub.type}, isMain: ${sub.isMain}, matches: ${matches}`);
          return matches;
        });
        foundMainSubSection = !!mainSubSection;

        // Check for navigation subsection using slug/type-based matching
        const navigationSubSection = sectionData.find(sub => {
          const matches = isProjectNavigationSubsection(sub);
          console.log(`Checking navigation subsection: ${sub.name}, slug: ${sub.slug}, type: ${sub.type}, matches: ${matches}`);
          return matches;
        });
        foundNavigationSubSection = !!navigationSubSection;
        
      } else {
        // Single object response - check using slug/type-based matching
        console.log("Single section data:", sectionData);
        if (isProjectMainSubsection(sectionData)) {
          foundMainSubSection = true;
          mainSubSection = sectionData;
        }
        
        // Check if it's a projects navigation subsection
        if (isProjectNavigationSubsection(sectionData)) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      console.log("Website-wide data:", websiteData);
      
      if (Array.isArray(websiteData)) {
        // Use slug/type-based matching instead of name-based matching
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub => {
            const matches = isProjectMainSubsection(sub);
            console.log(`Checking website subsection: ${sub.name}, slug: ${sub.slug}, type: ${sub.type}, isMain: ${sub.isMain}, matches: ${matches}`);
            return matches;
          });
          foundMainSubSection = !!mainSubSection;
        }

        // Check for navigation subsection using slug/type-based matching
        if (!foundNavigationSubSection) {
          const navigationSubSection = websiteData.find(sub => {
            const matches = isProjectNavigationSubsection(sub);
            console.log(`Checking website navigation subsection: ${sub.name}, slug: ${sub.slug}, type: ${sub.type}, matches: ${matches}`);
            return matches;
          });
          foundNavigationSubSection = !!navigationSubSection;
        }
        
      } else {
        // Single object response - check using slug/type-based matching
        console.log("Single website data:", websiteData);
        if (!foundMainSubSection && isProjectMainSubsection(websiteData)) {
          foundMainSubSection = true;
          mainSubSection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && isProjectNavigationSubsection(websiteData)) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    console.log("=== RESULTS ===");
    console.log("Found main subsection:", foundMainSubSection);
    console.log("Found navigation subsection:", foundNavigationSubSection);
    console.log("Main subsection data:", mainSubSection);
    
    setHasMainSubSection(foundMainSubSection);
    setHasNavigationSubSection(foundNavigationSubSection);
    setIsLoadingMainSubSection(false);
    
    // Extract section data from the main subsection if we found one
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      const sectionInfo = typeof mainSubSection.section === 'string' 
        ? { _id: mainSubSection.section } 
        : mainSubSection.section;
      
      // Set local section data
      setSectionData(sectionInfo);
      
      // Update the projectSection in useGenericList hook if not already set
      if (projectSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    projectSection, 
    setSection,
    currentLanguage  // Only depend on language for debugging, not for matching logic
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    console.log("handleMainSubSectionCreated", subsection)
    // Use slug/type-based matching instead of name-based matching
    const hasCorrectType = isProjectMainSubsection(subsection);
    
    // Set that we have a main subsection now (only if it has the correct type and is main)
    setHasMainSubSection(subsection.isMain === true && hasCorrectType);
    
    // If we have section data from the subsection, update it
    if (subsection.section) {
      const sectionInfo = typeof subsection.section === 'string' 
        ? { _id: subsection.section } 
        : subsection.section;
        
      setSectionData(sectionInfo);
      setSection(sectionInfo);
    }
    
    // Refetch the main subsection data to ensure we have the latest
    if (refetchMainSubSection) {
      refetchMainSubSection();
    }
  };

  // Logic for disabling the add button
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);
  
  // Custom message for empty state 
  const emptyStateMessage = !projectSection && !sectionData 
    ? PROJECTS_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? PROJECTS_CONFIG.mainSectionRequiredMessage
      : PROJECTS_CONFIG.emptyStateMessage;

  // Components
  const ProjectTable = (
    <GenericTable
      columns={PROJECTS_COLUMNS}
      data={projectItems}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
    />
  );

  const CreateDialog = (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('projectPage.dialogTitle', 'Project')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('projectPage.deleteTitle', 'Delete Project Item')}
      confirmText={t('projectPage.confirmText', 'Confirm')}
    />
  );

  return (
    <div className="space-y-6">
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

      {/* Section Configuration Tabs (only shown when section exists) */}
      {sectionId && (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Users size={16} />
              {t('Navigation.ContentConfiguration')}
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation size={16} />
              {t('Navigation.NavigationConfiguration')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <CreateMainSubSection 
              sectionId={sectionId}
              sectionConfig={translatedProjectSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation}
              imageUrl ={"/assets/PartsOfSections/project.png"}
            />
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            <CreateNavigationSubSection 
              sectionId={sectionId}
              sectionConfig={NavigationConfig}
              onSubSectionCreated={handleNavigationSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation}
            />
          </TabsContent>
        </Tabs>
      )}

        <GenericListPage
        config={PROJECTS_CONFIG}
        sectionId={sectionId}
        sectionConfig={translatedProjectSectionConfig} // Use translated config with language parameter
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={ProjectTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingProjectItems || isLoadingMainSubSection}
        emptyCondition={projectItems.length === 0}
        noSectionCondition={!projectSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
    </div>
  );
}