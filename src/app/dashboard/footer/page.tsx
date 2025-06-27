"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useMemo } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { getFooterSectionConfig } from "./FooterSectionConfig"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"
import { ClickableImage } from "@/src/components/ClickableImage"

// Column definitions with translation support
const getFooterColumns = (t: any) => [
  {
    header: t('footerPage.table.columns.name', 'Name'),
    accessor: "name",
    className: "font-medium"
  },
  {
    header: t('footerPage.table.columns.description', 'Description'),
    accessor: "description",
    cell: TruncatedCell
  },
  {
    header: t('footerPage.table.columns.status', 'Status'),
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {t('footerPage.table.status.main', 'Main')}
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: t('footerPage.table.columns.order', 'Order'),
    accessor: "order"
  },
  {
    header: t('footerPage.table.columns.subsections', 'Subsections'),
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]

export default function FooterPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const { language } = useLanguage()
  const { t } = useTranslation()

  // Get translated footer section config based on current language (MEMOIZED like HeaderPage)
  const footerSectionConfig = useMemo(() => {
    return getFooterSectionConfig(language)
  }, [language])

  // Memoized configuration for the Footer page with translations
  const Footer_CONFIG = useMemo(() => ({
    title: t('footerPage.config.title', 'Footer Management'),
    description: t('footerPage.config.description', 'Manage your footer inventory and multilingual footer content'),
    addButtonLabel: t('footerPage.config.addButtonLabel', 'Add New Footer'),
    emptyStateMessage: t('footerPage.config.emptyStateMessage', 'No footer found. Create your first footer by clicking the "Add New Footer" button.'),
    noSectionMessage: t('footerPage.config.noSectionMessage', 'Please create a footer section first before adding footer.'),
    mainSectionRequiredMessage: t('footerPage.config.mainSectionRequiredMessage', 'Please enter your main section data before adding footer.'),
    emptyFieldsMessage: t('footerPage.config.emptyFieldsMessage', 'Please complete all required fields in the main section before adding footer.'),
    sectionIntegrationTitle: t('footerPage.config.sectionIntegrationTitle', 'Footer Section Management'),
    sectionIntegrationDescription: t('footerPage.config.sectionIntegrationDescription', 'Manage your footer section content in multiple languages.'),
    addSectionButtonLabel: t('footerPage.config.addSectionButtonLabel', 'Add Footer Section'),
    editSectionButtonLabel: t('footerPage.config.editSectionButtonLabel', 'Edit Footer Section'),
    saveSectionButtonLabel: t('footerPage.config.saveSectionButtonLabel', 'Save Footer Section'),
    listTitle: t('footerPage.config.listTitle', 'Footer List'),
    editPath: "footer/addFooter"
  }), [t]);

  // Get translated column definitions (MEMOIZED like HeaderPage)
  const Footer_COLUMNS = useMemo(() => getFooterColumns(t), [t])

  // Refs to track previous values for debugging
  const prevHasMainSubSection = useRef(hasMainSubSection);
  const isFirstRender = useRef(true);

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

  // Use the generic list hook for Footer management
  const {
    section: footerSection,
    items: navItems,
    isLoadingItems: isLoadingNavItems,
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
    editPath: Footer_CONFIG.editPath
  })


  // Debug changes in hasMainSubSection
  useEffect(() => {
    prevHasMainSubSection.current = hasMainSubSection;
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [hasMainSubSection]);

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {

    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      setIsLoadingMainSubSection(true);
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let mainSubSection = null;
    
    // Get expected name from configuration (now translated)
    const expectedName = footerSectionConfig.subSectionName;
    

    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main subsection in the array with correct name
        sectionData.forEach((sub, index) => {
         
        });
        
        mainSubSection = sectionData.find(sub => {
          // Try exact match first
          if (sub.isMain === true && sub.name === expectedName) {
            return true;
          }
          // Also try matching if it contains "Footer" and "Basic" for backward compatibility
          if (sub.isMain === true && sub.name && 
              (sub.name.toLowerCase().includes('footer') && sub.name.toLowerCase().includes('basic'))) {
            return true;
          }
          return false;
        });
        foundMainSubSection = !!mainSubSection;
      } else {
        // Single object response

        foundMainSubSection = sectionData.isMain === true && sectionData.name === expectedName;
        mainSubSection = foundMainSubSection ? sectionData : null;
      }
    }
    
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if (!foundMainSubSection && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main subsection in the array with correct name
        websiteData.forEach((sub, index) => {
         
        });
        
        mainSubSection = websiteData.find(sub => {
          // Try exact match first
          if (sub.isMain === true && sub.name === expectedName) {
            return true;
          }
          // Also try matching if it contains "Footer" and "Basic" for backward compatibility
          if (sub.isMain === true && sub.name && 
              (sub.name.toLowerCase().includes('footer') && sub.name.toLowerCase().includes('basic'))) {
            return true;
          }
          return false;
        });
        foundMainSubSection = !!mainSubSection;
      } else {
        // Single object response
       
        foundMainSubSection = websiteData.isMain === true && websiteData.name === expectedName;
        mainSubSection = foundMainSubSection ? websiteData : null;
      }
    }
    
   
    
    // Update state based on what we found
    setHasMainSubSection(foundMainSubSection);
    setIsLoadingMainSubSection(false);
    
    // Extract section data from the main subsection if we found one
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      const sectionInfo = typeof mainSubSection.section === 'string' 
        ? { _id: mainSubSection.section } 
        : mainSubSection.section;
      
      // Set local section data
      setSectionData(sectionInfo);
      
      // Update the footerSection in useGenericList hook if not already set
      if (footerSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    footerSection, 
    setSection,
    footerSectionConfig.subSectionName // Add this dependency to re-run when language changes
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    
    // Check if subsection has the correct name (now using properly memoized translated name)
    const expectedName = footerSectionConfig.subSectionName;
    const hasCorrectName = subsection.name === expectedName;
    
    // Set that we have a main subsection now (only if it also has the correct name)
    setHasMainSubSection(subsection.isMain === true && hasCorrectName);
    

    
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

  // IMPORTANT: Here's the crux of the button enabling/disabling logic
  // Added check for navItems.length > 0 to disable when there's already a footer item
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection) ||
    (navItems.length > 0); // This disables the button if there's already at least one Footer Item

  // Custom message for empty state with translations
  const emptyStateMessage = !footerSection && !sectionData 
    ? Footer_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? Footer_CONFIG.mainSectionRequiredMessage
      : Footer_CONFIG.emptyStateMessage;

  // Components with translations
  const NavItemsTable = (
    <GenericTable
      columns={Footer_COLUMNS}
      data={navItems}
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
      title={t('footerPage.dialogs.create.title', 'Footer')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
    />
  );

  return (
    <div className="space-y-6">
       <ClickableImage
              imageSrc="/assets/sections/footer.png"
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
        config={Footer_CONFIG}
        sectionId={sectionId}
        sectionConfig={footerSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={NavItemsTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingNavItems || isLoadingMainSubSection}
        emptyCondition={navItems.length === 0}
        noSectionCondition={!footerSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={footerSectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  );
}