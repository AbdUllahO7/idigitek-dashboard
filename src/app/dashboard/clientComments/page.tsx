"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { getClientCommentsSectionConfig } from "./clientCommentsSectionConfig"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import { useTranslation } from "react-i18next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Navigation, Users } from "lucide-react"
import CreateNavigationSubSection from "../team/navigation/CreateNavigationSubSection"
import { contactSectionConfig } from "../contact/ContactSectionConfig"
import { getTeamNavigationSectionConfig } from "../team/navigation/team-navigation-config"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { add } from "date-fns"

export default function ClientComments() {
  const { t, i18n } = useTranslation()
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const { websiteId } = useWebsiteContext()
  
  // Memoize configurations to make them reactive to language changes
  const clientCommentsSectionConfig = useMemo(() => 
    getClientCommentsSectionConfig(i18n.language), 
    [i18n.language]
  )
  
  const NavigationConfig = useMemo(() => 
    getTeamNavigationSectionConfig(i18n.language), 
    [i18n.language]
  )

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

  // State management - simplified to reduce circular dependencies
  const [pageState, setPageState] = useState({
    hasMainSubSection: false,
    isLoadingMainSubSection: true,
    sectionData: null
  })

  // Destructure for easier access
  const { hasMainSubSection, isLoadingMainSubSection, sectionData } = pageState
  
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

  // Use the generic list hook for Client Comments management
  const {
    section: clientCommentsSection,
    items: clientCommentsItems,
    isLoadingItems: isLoadingClientComments,
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
    editPath: "clientComments/addClientComments"
  })

  // Determine if we should show the add button (hide it when items exist)
  const shouldShowAddButton = clientCommentsItems.length === 0;

  // Configuration for the Client Comments page - Memoized and reactive to language changes
  // Only include addButtonLabel when we should show the add button
  const ClientComments_CONFIG = useMemo(() => {
    const baseConfig = {
      title: t('clientComments.title', 'Client Comments Management'),
      description: t('clientComments.description', 'Manage your Client Comments inventory and multilingual content'),
      emptyStateMessage: t('clientComments.emptyStateMessage', 'No Client Comments found. Create your first Client Comments by clicking the "Add New Client Comments" button.'),
      noSectionMessage: t('clientComments.noSectionMessage', 'Please create a Client Comments section first before adding Client Comments.'),
      mainSectionRequiredMessage: t('clientComments.mainSectionRequiredMessage', 'Please enter your main section data before adding Client Comments.'),
      emptyFieldsMessage: t('clientComments.emptyFieldsMessage', 'Please complete all required fields in the main section before adding Client Comments.'),
      sectionIntegrationTitle: t('clientComments.sectionIntegrationTitle', 'Client Comments Section Content'),
      sectionIntegrationDescription: t('clientComments.sectionIntegrationDescription', 'Manage your Client Comments section content in multiple languages.'),
      addSectionButtonLabel: t('clientComments.addSectionButtonLabel', 'Add Client Comments Section'),
      editSectionButtonLabel: t('clientComments.editSectionButtonLabel', 'Edit Client Comments Section'),
      saveSectionButtonLabel: t('clientComments.saveSectionButtonLabel', 'Save Client Comments Section'),
      listTitle: t('clientComments.listTitle', 'Client Comments List'),
      editPath: "clientComments/addClientComments",
      addButtonLabel: '',
    };

    // Only add addButtonLabel if no items exist (this helps hide the button)
    if (shouldShowAddButton) {
      baseConfig.addButtonLabel = t('clientComments.addButtonLabel', 'Add New Client Comments item');
    }

    return baseConfig;
  }, [t, shouldShowAddButton])

  // Column definitions - Memoized and reactive to language changes
  const ClientComments_COLUMNS = useMemo(() => [
    {
      header: t('clientComments.columnName', 'Name'),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t('clientComments.columnDescription', 'Description'),
      accessor: "description",
      cell: TruncatedCell
    },
    {
      header: t('clientComments.columnStatus', 'Status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value)}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('clientComments.main', 'Main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('clientComments.columnOrder', 'Order'),
      accessor: "order"
    },
    {
      header: t('clientComments.columnSubsections', 'Subsections'),
      accessor: "subsections.length",
      cell: CountBadgeCell
    }
  ], [t])

  // Process subsection data - Moved to a stable, memoized function to reduce rerenders
  const processSubsectionData = useCallback(() => {
    // Skip processing if still loading
    if (isLoadingCompleteSubsections || isLoadingSectionSubsections) {
      return
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false
    let mainSubSection = null
  
    // Get expected name from configuration
    const expectedSlug = clientCommentsSectionConfig.name
    
    // First check if section-specific subsections exist
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data
      if (Array.isArray(sectionData)) {
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedSlug
        )
        foundMainSubSection = !!mainSubSection
      } else {
        foundMainSubSection = sectionData.isMain === true && sectionData.name === expectedSlug
        mainSubSection = foundMainSubSection ? sectionData : null
      }
    }
    
    // If not found, check website-wide data
    if (!foundMainSubSection && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data
      if (Array.isArray(websiteData)) {
        mainSubSection = websiteData.find(sub => 
          sub.isMain === true && sub.name === expectedSlug
        )
        foundMainSubSection = !!mainSubSection
      } else {
        foundMainSubSection = websiteData.isMain === true && websiteData.name === expectedSlug
        mainSubSection = foundMainSubSection ? websiteData : null
      }
    }

    // Extract section data from the main subsection if found
    let newSectionData = null
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      newSectionData = typeof mainSubSection.section === 'string' 
        ? { _id: mainSubSection.section } 
        : mainSubSection.section
    }
    
    // Update all state in a single batch to prevent multiple rerenders
    setPageState(prev => ({
      ...prev,
      hasMainSubSection: foundMainSubSection,
      isLoadingMainSubSection: false,
      sectionData: newSectionData
    }))
    
    // Only update section in generic list hook if needed
    if (newSectionData && (!clientCommentsSection || clientCommentsSection._id !== newSectionData._id)) {
      setSection(newSectionData)
    }
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    clientCommentsSection, 
    setSection,
    clientCommentsSectionConfig.name
  ])

  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = useCallback((subsection: any) => {
    // Check if subsection has the correct name or type for Client Comments Navigation
    const expectedSlug = NavigationConfig.name;
    const expectedType = NavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('client') && subsection.name.toLowerCase().includes('navigation'))
    );
    
    // Set that we have a navigation subsection now
    setHasNavigationSubSection(hasCorrectIdentifier);
    
    // Force refetch of all subsection data
    if (refetchMainSubSection) {
      setTimeout(() => {
        refetchMainSubSection();
      }, 1000);
    }
  }, [NavigationConfig.name, NavigationConfig.type, refetchMainSubSection]);

  // Process data only when dependencies change
  useEffect(() => {
    processSubsectionData()
  }, [processSubsectionData])

  // Check for navigation subsection existence
  useEffect(() => {    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let foundNavigationSubSection = false;
    let mainSubSection = null;
    
    const expectedClientCommentsSlug = clientCommentsSectionConfig.name;
    const expectedNavigationSlug = NavigationConfig.name;

    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main Client Comments subsection
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedClientCommentsSlug
        );
        foundMainSubSection = !!mainSubSection;

        // Check for navigation subsection - be more flexible in matching
        const navigationSubSection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === NavigationConfig.type) return true;
          // Match by name
          if (sub.name === expectedNavigationSlug) return true;
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('client') && sub.name.toLowerCase().includes('navigation')) return true;
          return false;
        });
        foundNavigationSubSection = !!navigationSubSection;

      } else {
        // Single object response - check if it's client comments main or navigation
        if (sectionData.isMain === true && sectionData.name === expectedClientCommentsSlug) {
          foundMainSubSection = true;
          mainSubSection = sectionData;
        }
        
        // Check if it's a client comments navigation subsection
        if (sectionData.type === NavigationConfig.type || 
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('client') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main Client Comments subsection
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub => 
            sub.isMain === true && sub.name === expectedClientCommentsSlug
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
            if (sub.name && sub.name.toLowerCase().includes('client') && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          foundNavigationSubSection = !!navigationSubSection;
        }
      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedClientCommentsSlug) {
          foundMainSubSection = true;
          mainSubSection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === NavigationConfig.type || 
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('client') && websiteData.name.toLowerCase().includes('navigation'))
        )) {
          foundNavigationSubSection = true;
        }
      }
    }

    setHasNavigationSubSection(foundNavigationSubSection);
    
    // Extract section data from the main subsection if we found one
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      const sectionInfo = typeof mainSubSection.section === 'string' 
        ? { _id: mainSubSection.section } 
        : mainSubSection.section;
      
      // Update the clientCommentsSection in useGenericList hook if not already set
      if (clientCommentsSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    clientCommentsSection, 
    setSection,
    clientCommentsSectionConfig.name,
    NavigationConfig.name,
    NavigationConfig.type
  ]);

  // Handle main subsection creation - converted to useCallback to stabilize function reference
  const handleMainSubSectionCreated = useCallback((subsection: any) => {
    // Check if subsection has the correct name
    const expectedSlug = clientCommentsSectionConfig.name
    const hasCorrectSlug = subsection.name === expectedSlug
    const isMainSubSection = subsection.isMain === true && hasCorrectSlug
    
    // If we have section data from the subsection, prepare it
    let newSectionData = null
    if (subsection.section) {
      newSectionData = typeof subsection.section === 'string' 
        ? { _id: subsection.section } 
        : subsection.section
    }
    
    // Update state in a single batch
    setPageState(prev => ({
      ...prev,
      hasMainSubSection: isMainSubSection,
      sectionData: newSectionData || prev.sectionData
    }))
    
    // Only update the hook section if we have new data
    if (newSectionData) {
      setSection(newSectionData)
    }
    
    // Refetch to ensure we have the latest data
    if (refetchMainSubSection) {
      refetchMainSubSection()
    }
  }, [refetchMainSubSection, setSection, clientCommentsSectionConfig.name])

  // Updated button disabling logic - removed the clientCommentsItems.length check since we're now hiding instead
  const isAddButtonDisabled = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);

  const emptyStateMessage = !clientCommentsSection && !sectionData 
    ? ClientComments_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? ClientComments_CONFIG.mainSectionRequiredMessage
      : ClientComments_CONFIG.emptyStateMessage

  // Memoize component references to prevent recreation on each render
  const ClientCommentsItemsTable = useMemo(() => (
    <GenericTable
      columns={ClientComments_COLUMNS}
      data={clientCommentsItems}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
    />
  ), [ClientComments_COLUMNS, clientCommentsItems, handleEdit, showDeleteDialog])

  const CreateDialog = useMemo(() => (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('clientComments.createClientCommentsTitle', 'Client Comments')}
    />
  ), [isCreateDialogOpen, setIsCreateDialogOpen, sectionId, handleItemCreated, t])

  const DeleteDialog = useMemo(() => (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('clientComments.deleteClientCommentsItem', 'Delete Client Comments Item')}
      confirmText={t('clientComments.confirmDelete', 'Confirm')}
    />
  ), [isDeleteDialogOpen, setIsDeleteDialogOpen, itemToDelete, handleDelete, isDeleting, t])

  return (
    <div className="space-y-6">
       <ClickableImage
              imageSrc="/assets/sections/testimonials.png"
              imageAlt={t('servicesPage.title', 'Services Section')}
              size="large"
              title={t('servicesPage.title', 'Services Section')}
              subtitle={t('servicesPage.description', 'Click to view full size')}
              t={t}
              priority
              className="w-full"
              previewClassName="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-2xl h-64 md:h-80 lg:h-96"
            />
      

      {/* Main list page with table and section integration */}
      <GenericListPage
        config={ClientComments_CONFIG}
        sectionId={sectionId}
        sectionConfig={clientCommentsSectionConfig}
        isAddButtonDisabled={false}
        tableComponent={ClientCommentsItemsTable}
        createDialogComponent={CreateDialog}
        showAddButton={shouldShowAddButton} // Only show button when we should
        onAddNew={shouldShowAddButton ? handleAddNew : () => {}} // Only pass handler when we should show button
        deleteDialogComponent={DeleteDialog}
        isLoading={isLoadingClientComments || isLoadingMainSubSection}
        emptyCondition={clientCommentsItems.length === 0}
        noSectionCondition={false}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
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
            <CreateMainSubSection 
              sectionId={sectionId}
              sectionConfig={clientCommentsSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation}
              imageUrl ={"/assets/PartsOfSections/clientComments.png"}

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
    </div>
  )
}