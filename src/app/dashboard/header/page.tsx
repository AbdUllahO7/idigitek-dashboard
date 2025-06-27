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
import { getHeaderSectionConfig, headerSectionTranslations } from "./HeaderSectionConfig"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"

// Column definitions with translation support
const getHeaderColumns = (t: any) => [
  {
    header: t('SectionTable.name', 'Name'),
    accessor: "name",
    className: "font-medium"
  },
  {
    header: t('SectionTable.description', 'Description'),
    accessor: "description",
    cell: TruncatedCell
  },
  {
    header: t('SectionTable.status', 'Status'),
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {t('SectionTable.main', 'Main')}
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: t('SectionTable.order', 'Order'),
    accessor: "order"
  },
  {
    header: t('SectionTable.subsections', 'Subsections'),
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]

export default function HeaderPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const { language } = useLanguage()
  const { t } = useTranslation()

  // Get translated header section config based on current language
  const headerSectionConfig = useMemo(() => {
    return getHeaderSectionConfig(language)
  }, [language])

  // Get translations for the current language

  const HEADER_CONFIG = useMemo(() => ({
    title: t('HeaderConfig.title', 'Header Management'),
    description: t('HeaderConfig.description', 'Manage your Header inventory and multilingual content'),
    addButtonLabel: t('HeaderConfig.addButtonLabel', 'Add New Nav Item'),
    emptyStateMessage: t('HeaderConfig.emptyStateMessage', 'No Header found. Create your first Header by clicking the "Add New Header" button.'),
    noSectionMessage: t('HeaderConfig.noSectionMessage', 'Please create a Header section first before adding Header.'),
    mainSectionRequiredMessage: t('HeaderConfig.mainSectionRequiredMessage', 'Please enter your main section data before adding Header.'),
    emptyFieldsMessage: t('header-config:emptyFieldsMessage', 'Please complete all required fields in the main section before adding Header.'),
    sectionIntegrationTitle: t('HeaderConfig.sectionIntegrationTitle', 'Header Section Content'),
    sectionIntegrationDescription: t('HeaderConfig.sectionIntegrationDescription', 'Manage your Header section content in multiple languages.'),
    addSectionButtonLabel: t('HeaderConfig.addSectionButtonLabel', 'Add Header Section'),
    editSectionButtonLabel: t('HeaderConfig.editSectionButtonLabel', 'Edit Header Section'),
    saveSectionButtonLabel: t('HeaderConfig.aveSectionButtonLabel', 'Save Header Section'),
    listTitle: t('HeaderConfig.listTitle', 'Header List'),
    editPath: "header/addNavItems"
  }), [t]);

  // Get translated column definitions
  const HEADER_COLUMNS = useMemo(() => getHeaderColumns(t), [t])

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
  // Use the generic list hook for Header management
  const {
    section: headerSection,
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
    editPath: HEADER_CONFIG.editPath
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
    const expectedName = headerSectionConfig.subSectionName;
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main subsection in the array with correct name
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedName
        );
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
        mainSubSection = websiteData.find(sub => 
          sub.isMain === true && sub.name === expectedName
        );
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
      
      // Update the headerSection in useGenericList hook if not already set
      if (headerSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    headerSection, 
    setSection,
    headerSectionConfig.subSectionName // Add this dependency to re-run when language changes
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    
    // Check if subsection has the correct name (now using translated name)
    const expectedName = headerSectionConfig.subSectionName;
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

  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection) ||
    (navItems.length > 0); // This disables the button if there's already at least one NavItem

  // Custom message for empty state 
  const emptyStateMessage = !headerSection && !sectionData 
    ? HEADER_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? HEADER_CONFIG.mainSectionRequiredMessage
      : HEADER_CONFIG.emptyStateMessage;

  // Components
  const NavItemsTable = (
    <GenericTable
      columns={HEADER_COLUMNS}
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
      title={t('HeaderConfig.title', 'Header')}
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
      {/* Main list page with table and section integration */}
      <GenericListPage
        showAddButton={false}
        config={HEADER_CONFIG}
        sectionId={sectionId}
        sectionConfig={headerSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={NavItemsTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingNavItems || isLoadingMainSubSection}
        emptyCondition={navItems.length === 0}
        noSectionCondition={!headerSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={headerSectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  );
}