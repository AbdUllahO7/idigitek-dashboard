"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { getTeamSectionConfig } from "./TeamSectionConfig"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Users, Navigation } from "lucide-react"
import { getTeamNavigationSectionConfig } from "./navigation/team-navigation-config"
import CreateNavigationSubSection from "./navigation/CreateNavigationSubSection"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"

export default function Team() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const { t, i18n } = useTranslation();

  // Memoize configurations to make them reactive to language changes
  const teamSectionConfig = useMemo(() => 
    getTeamSectionConfig(i18n.language), 
    [i18n.language]
  );
  
  const NavigationConfig = useMemo(() => 
    getTeamNavigationSectionConfig(i18n.language), 
    [i18n.language]
  );

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

  // Configuration for the Team page - Memoized and reactive to language changes
  const TEAM_CONFIG = useMemo(() => ({
    title: t('teamManagement.title', 'Team Management'),
    description: t('teamManagement.description', 'Manage your team members and multilingual content'),
    addButtonLabel: t('teamManagement.addButtonLabel', 'Add New Team Member'),
    emptyStateMessage: t('teamManagement.emptyStateMessage', 'No team members found. Create your first team member by clicking the "Add New Team Member" button.'),
    noSectionMessage: t('teamManagement.noSectionMessage', 'Please create a Team section first before adding team members.'),
    mainSectionRequiredMessage: t('teamManagement.mainSectionRequiredMessage', 'Please enter your main section data before adding team members.'),
    emptyFieldsMessage: t('teamManagement.emptyFieldsMessage', 'Please complete all required fields in the main section before adding team members.'),
    sectionIntegrationTitle: t('teamManagement.sectionIntegrationTitle', 'Team Section Content'),
    sectionIntegrationDescription: t('teamManagement.sectionIntegrationDescription', 'Manage your team section content in multiple languages.'),
    addSectionButtonLabel: t('teamManagement.addSectionButtonLabel', 'Add Team Section'),
    editSectionButtonLabel: t('teamManagement.editSectionButtonLabel', 'Edit Team Section'),
    saveSectionButtonLabel: t('teamManagement.saveSectionButtonLabel', 'Save Team Section'),
    listTitle: t('teamManagement.listTitle', 'Team Members List'),
    editPath: "team/addTeam"
  }), [t]);

  // Team table column definitions with translations - Memoized and reactive to language changes
  const TEAM_COLUMNS = useMemo(() => [
    {
      header: t('teamManagement.name', 'Name'),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t('teamManagement.description', 'Description'),
      accessor: "description",
      cell: TruncatedCell
    },
    {
      header: t('teamManagement.status', 'Status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value)}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('teamManagement.main', 'Main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('teamManagement.order', 'Order'),
      accessor: "order"
    },
    {
      header: t('teamManagement.subsections', 'Subsections'),
      accessor: "subsections.length",
      cell: CountBadgeCell
    }
  ], [t]);

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

  // Use the generic list hook for Team management
  const {
    section: teamSection,
    items: teamItems,
    isLoadingItems: isLoadingTeamItems,
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
    editPath: TEAM_CONFIG.editPath
  })

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      setIsLoadingMainSubSection(true);
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let foundNavigationSubSection = false;
    let mainSubSection = null;
    
    // Get expected names from configurations
    const expectedTeamSlug = teamSectionConfig.name;
    const expectedNavigationSlug = NavigationConfig.name;
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main team subsection in the array with correct name
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedTeamSlug
        );
        foundMainSubSection = !!mainSubSection;

        // Check for navigation subsection - be more flexible in matching
        const navigationSubSection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === NavigationConfig.type) return true;
          // Match by name
          if (sub.name === expectedNavigationSlug) return true;
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('team') && sub.name.toLowerCase().includes('navigation')) return true;
          return false;
        });
        foundNavigationSubSection = !!navigationSubSection;
      } else {
        // Single object response - check if it's team or navigation
        if (sectionData.isMain === true && sectionData.name === expectedTeamSlug) {
          foundMainSubSection = true;
          mainSubSection = sectionData;
        }
        
        // Check if it's a navigation subsection
        if (sectionData.type === NavigationConfig.type || 
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('team') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main team subsection in the array with correct name
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub => 
            sub.isMain === true && sub.name === expectedTeamSlug
          );
          foundMainSubSection = !!mainSubSection;
        }

        // Check for navigation subsection - be more flexible in matching
        if (!foundNavigationSubSection) {
          const navigationSubSection = websiteData.find(sub => {
            // Match by type first (most reliable)
            if (sub.type === NavigationConfig.type) return true;
            // Match by name
            if (sub.name === expectedNavigationSlug) return true;
            // Match by partial name (in case of slug differences)
            if (sub.name && sub.name.toLowerCase().includes('team') && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          foundNavigationSubSection = !!navigationSubSection;
        }
      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedTeamSlug) {
          foundMainSubSection = true;
          mainSubSection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === NavigationConfig.type || 
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('team') && websiteData.name.toLowerCase().includes('navigation'))
        )) {
          foundNavigationSubSection = true;
        }
      }
    }
    
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
      
      // Update the teamSection in useGenericList hook if not already set
      if (teamSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    teamSection, 
    setSection,
    teamSectionConfig.name,
    NavigationConfig.name,
    NavigationConfig.type
  ]);

  // Handle main subsection creation - converted to useCallback to stabilize function reference
  const handleMainSubSectionCreated = useCallback((subsection: any) => {
    // Check if subsection has the correct name
    const expectedSlug = teamSectionConfig.name;
    const hasCorrectSlug = subsection.name === expectedSlug;
    
    // Set that we have a main subsection now (only if it also has the correct name)
    setHasMainSubSection(subsection.isMain === true && hasCorrectSlug);
    
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
  }, [teamSectionConfig.name, setSection, refetchMainSubSection]);

  // Handle navigation subsection creation - converted to useCallback to stabilize function reference
  const handleNavigationSubSectionCreated = useCallback((subsection: any) => {
    // Check if subsection has the correct name or type
    const expectedSlug = NavigationConfig.name;
    const expectedType = NavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('team') && subsection.name.toLowerCase().includes('navigation'))
    );
    
    // Set that we have a navigation subsection now
    setHasNavigationSubSection(hasCorrectIdentifier);
    
    // Force refetch of all subsection data
    if (refetchMainSubSection) {
      setTimeout(() => {
        refetchMainSubSection();
      }, 1000); // Give it a bit more time to ensure data is saved
    }
  }, [NavigationConfig.name, NavigationConfig.type, refetchMainSubSection]);

  // Logic for disabling the add button
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);
  
  // Custom message for empty state 
  const emptyStateMessage = !teamSection && !sectionData 
    ? TEAM_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? TEAM_CONFIG.mainSectionRequiredMessage
      : TEAM_CONFIG.emptyStateMessage;

  // Memoize component references to prevent recreation on each render
  const TeamTable = useMemo(() => (
    <GenericTable
      columns={TEAM_COLUMNS}
      data={teamItems}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
    />
  ), [TEAM_COLUMNS, teamItems, handleEdit, showDeleteDialog]);

  const CreateDialog = useMemo(() => (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('teamManagement.team', 'Team')}
    />
  ), [isCreateDialogOpen, setIsCreateDialogOpen, sectionId, handleItemCreated, t]);

  const DeleteDialog = useMemo(() => (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('teamManagement.deleteTeamItem', 'Delete Team Item')}
      confirmText={t('teamManagement.confirm', 'Confirm')}
    />
  ), [isDeleteDialogOpen, setIsDeleteDialogOpen, itemToDelete, handleDelete, isDeleting, t]);

  return (
    <div className="space-y-6">
      <ClickableImage
        imageSrc="/assets/sections/team.png"
        imageAlt={t('teamManagement.sectionImage', 'Team Section')}
        size="large"
        title={t('teamManagement.sectionImageTitle', 'Team Section')}
        subtitle={t('teamManagement.sectionImageSubtitle', 'Click to view full size')}
        t={t}
        priority
        className="w-full"
        previewClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl h-64 md:h-80 lg:h-96"
      />

      {/* Main list page with table and section integration */}
      <GenericListPage
        config={TEAM_CONFIG}
        sectionId={sectionId}
        sectionConfig={teamSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={TeamTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingTeamItems || isLoadingMainSubSection}
        emptyCondition={teamItems.length === 0}
        noSectionCondition={!teamSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Section Configuration Tabs (only shown when section exists) */}
      {sectionId && (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Users size={16} />
              {t('Navigation.ContentConfiguration', 'Content Configuration')}
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation size={16} />
              {t('Navigation.NavigationConfiguration', 'Navigation Configuration')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            {/* Main subsection management */}
            <CreateMainSubSection 
              sectionId={sectionId}
              sectionConfig={teamSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation}
              imageUrl ={"/assets/PartsOfSections/team.png"}
            />
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            {/* Navigation subsection management */}
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
    </div>
  );
}