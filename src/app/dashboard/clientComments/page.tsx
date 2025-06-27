"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
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

export default function ClientComments() {
  const { t, i18n } = useTranslation() // Explicitly use clientComments namespace
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const { websiteId } = useWebsiteContext()
  const NavigationConfig = getTeamNavigationSectionConfig(i18n.language);
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)

  // Configuration for the Client Comments page 
  const ClientComments_CONFIG = {
    title: t('clientComments.title', 'Client Comments Management'),
    description: t('clientComments.description', 'Manage your Client Comments inventory and multilingual content'),
    addButtonLabel: t('clientComments.addButtonLabel', 'Add New Client Comments item'),
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
    editPath: "clientComments/addClientComments"
  }

  const currentLanguage = i18n.language // 'en', 'es', 'fr'
  const clientCommentsSectionConfig = getClientCommentsSectionConfig(currentLanguage)

  // Column definitions
  const ClientComments_COLUMNS = [
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
  ]

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
    section: industrySection,
    items: navItems,
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
    editPath: ClientComments_CONFIG.editPath
  })

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
        mainSubSection = foundMainSubSection ? sectionData : null
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
    if (newSectionData && (!industrySection || industrySection._id !== newSectionData._id)) {
      setSection(newSectionData)
    }
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    industrySection, 
    setSection,
    clientCommentsSectionConfig.name
  ])
  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = (subsection: any) => {
    
    // 🔧 FIXED: Check if subsection has the correct name or type for NEWS
    const expectedSlug = NavigationConfig.name;
    const expectedType = NavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('news') && subsection.name.toLowerCase().includes('navigation'))
    );
    
    // Set that we have a navigation subsection now
    setHasNavigationSubSection(hasCorrectIdentifier);
    

    
    // Force refetch of all subsection data
    if (refetchMainSubSection) {
      setTimeout(() => {
        refetchMainSubSection();
      }, 1000); // Give it a bit more time to ensure data is saved
    }
  };
  // Process data only when dependencies change
  useEffect(() => {
    processSubsectionData()
  }, [processSubsectionData])
  useEffect(() => {    
 
 
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let foundNavigationSubSection = false;
    let mainSubSection = null;
    
    // 🔧 FIXED: Use NEWS configurations instead of team configurations
    const expectedNewsSlug = clientCommentsSectionConfig.name; // This is correct for NEWS
    const expectedNavigationSlug = NavigationConfig.name; // This is correct for NEWS navigation

    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // 🔧 FIXED: Find the main NEWS subsection (not team!)
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedNewsSlug
        );
        foundMainSubSection = !!mainSubSection;

        // Check for navigation subsection - be more flexible in matching
        const navigationSubSection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === NavigationConfig.type) return true;
          // Match by name
          if (sub.name === expectedNavigationSlug) return true;
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('news') && sub.name.toLowerCase().includes('navigation')) return true;
          return false;
        });
        foundNavigationSubSection = !!navigationSubSection;

      } else {
        // Single object response - check if it's news main or navigation
        if (sectionData.isMain === true && sectionData.name === expectedNewsSlug) {
          foundMainSubSection = true;
          mainSubSection = sectionData;
        }
        
        // Check if it's a news navigation subsection
        if (sectionData.type === NavigationConfig.type || 
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('news') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // 🔧 FIXED: Find the main NEWS subsection (not team!)
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub => 
            sub.isMain === true && sub.name === expectedNewsSlug
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
            if (sub.name && sub.name.toLowerCase().includes('news') && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          foundNavigationSubSection = !!navigationSubSection;
        }
        
  
      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedNewsSlug) {
          foundMainSubSection = true;
          mainSubSection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === NavigationConfig.type || 
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('news') && websiteData.name.toLowerCase().includes('navigation'))
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
      
      // Set local section data
      
      // Update the newsSection in useGenericList hook if not already set
      if (industrySection === null) {
        setSection(sectionInfo);
      }
      
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    industrySection, 
    setSection,
    clientCommentsSectionConfig.name,        // 🔧 FIXED: Use news config
    NavigationConfig.name,     // 🔧 FIXED: Use news navigation config
    NavigationConfig.type      // 🔧 FIXED: Use news navigation config
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

  // Compute derived values ONCE per render - not during render
  const isAddButtonDisabled = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection) ||
    (navItems.length > 0) // Added to disable button if there's at least one Client Comments item

  const emptyStateMessage = !industrySection && !sectionData 
    ? ClientComments_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? ClientComments_CONFIG.mainSectionRequiredMessage
      : ClientComments_CONFIG.emptyStateMessage

  // Memoize component references to prevent recreation on each render
  const ClientCommentsItemsTable = (
    <GenericTable
      columns={ClientComments_COLUMNS}
      data={navItems}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
    />
  )

  const CreateDialog = (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('clientComments.createClientCommentsTitle', 'Client Comments')}
    />
  )

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('clientComments.deleteClientCommentsItem', 'Delete Client Comments Item')}
      confirmText={t('clientComments.confirmDelete', 'Confirm')}
    />
  )

  return (
    <div className="space-y-6">
       <ClickableImage
              imageSrc="/assets/sections/testimonials.png"
              imageAlt={t('HeroManagement.tabLabel', 'Hero Section')}
              size="large"
              title={t('HeroManagement.tabLabel', 'Hero Section')}
              subtitle={t('HeroManagement.createSubtitle', 'Click to view full size')}
              t={t}
              priority
              className="w-full"
              previewClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl h-64 md:h-80 lg:h-96"
            />
      

      {/* Main list page with table and section integration */}
      <GenericListPage
        config={ClientComments_CONFIG}
        sectionId={sectionId}
        sectionConfig={clientCommentsSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={ClientCommentsItemsTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingClientComments || isLoadingMainSubSection}
        emptyCondition={navItems.length === 0}
        noSectionCondition={!industrySection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
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
              sectionConfig={contactSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
            />
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            <CreateNavigationSubSection 
              sectionId={sectionId}
              sectionConfig={NavigationConfig}
              onSubSectionCreated={handleNavigationSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
