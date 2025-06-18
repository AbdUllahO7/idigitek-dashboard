"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { getWhyChooseUsSectionConfig, whyChooseUsSectionConfig } from "./whyChooseUsSectionConfig"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"

// Column definitions with translation support
const getWhyChooseUsColumns = (t: any) => [
  {
    header: t('WhyChooseUsTable.name', 'Name'),
    accessor: "name",
    className: "font-medium"
  },
  {
    header: t('WhyChooseUsTable.description', 'Description'),
    accessor: "description",
    cell: TruncatedCell
  },
  {
    header: t('WhyChooseUsTable.status', 'Status'),
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {t('WhyChooseUsTable.main', 'Main')}
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: t('WhyChooseUsTable.order', 'Order'),
    accessor: "order"
  },
  {
    header: t('WhyChooseUsTable.subsections', 'Subsections'),
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]

export default function ChoseUsPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const { websiteId } = useWebsiteContext();
  const { language } = useLanguage()
  const { t } = useTranslation()

  // Get translated why choose us section config based on current language
  const whyChooseUsSectionConfigTranslated = useMemo(() => {
    return getWhyChooseUsSectionConfig(language)
  }, [language])

  // Get translated configuration for the Why Choose Us page
  const CHOSE_US_CONFIG = useMemo(() => ({
    title: t('WhyChooseUsConfig.title', 'Why Choose Us Management'),
    description: t('WhyChooseUsConfig.description', 'Manage your Why Choose Us inventory and multilingual content'),
    addButtonLabel: t('WhyChooseUsConfig.addButtonLabel', 'Add New Why Choose Us item'),
    emptyStateMessage: t('WhyChooseUsConfig.emptyStateMessage', 'No Why Choose Us found. Create your first Why Choose Us by clicking the "Add New Why Choose Us" button.'),
    noSectionMessage: t('WhyChooseUsConfig.noSectionMessage', 'Please create a Why Choose Us section first before adding Why Choose Us.'),
    mainSectionRequiredMessage: t('WhyChooseUsConfig.mainSectionRequiredMessage', 'Please enter your main section data before adding Why Choose Us.'),
    emptyFieldsMessage: t('WhyChooseUsConfig.emptyFieldsMessage', 'Please complete all required fields in the main section before adding Why Choose Us.'),
    sectionIntegrationTitle: t('WhyChooseUsConfig.sectionIntegrationTitle', 'Why Choose Us Section Content'),
    sectionIntegrationDescription: t('WhyChooseUsConfig.sectionIntegrationDescription', 'Manage your Why Choose Us section content in multiple languages.'),
    addSectionButtonLabel: t('WhyChooseUsConfig.addSectionButtonLabel', 'Add Why Choose Us Section'),
    editSectionButtonLabel: t('WhyChooseUsConfig.editSectionButtonLabel', 'Edit Why Choose Us Section'),
    saveSectionButtonLabel: t('WhyChooseUsConfig.saveSectionButtonLabel', 'Save Why Choose Us Section'),
    listTitle: t('WhyChooseUsConfig.listTitle', 'Why Choose Us List'),
    editPath: "WhyChooseUs/addChoseUs"
  }), [t]);

  // Get translated column definitions
  const CHOSE_US_COLUMNS = useMemo(() => getWhyChooseUsColumns(t), [t])
  
  // State management - simplified to reduce circular dependencies
  const [pageState, setPageState] = useState({
    hasMainSubSection: false,
    isLoadingMainSubSection: true,
    sectionData: null
  });

  // Destructure for easier access
  const { hasMainSubSection, isLoadingMainSubSection, sectionData } = pageState;
  
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

  // Use the generic list hook for Why Choose Us management
  const {
    section: industrySection,
    items: navItems,
    isLoadingItems: isLoadingChoseUs,
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
    editPath: CHOSE_US_CONFIG.editPath
  })

  // Process subsection data - Moved to a stable, memoized function to reduce rerenders
  const processSubsectionData = useCallback(() => {
    // Skip processing if still loading
    if (isLoadingCompleteSubsections || isLoadingSectionSubsections) {
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let mainSubSection = null;
  
    // Get expected name from configuration (now translated)
    const expectedSlug = whyChooseUsSectionConfigTranslated.name;
    
    // First check if section-specific subsections exist
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedSlug
        );
        foundMainSubSection = !!mainSubSection;
      } else {
        foundMainSubSection = sectionData.isMain === true && sectionData.name === expectedSlug;
        mainSubSection = foundMainSubSection ? sectionData : null;
      }
    }
    
    // If not found, check website-wide data
    if (!foundMainSubSection && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        mainSubSection = websiteData.find(sub => 
          sub.isMain === true && sub.name === expectedSlug
        );
        foundMainSubSection = !!mainSubSection;
      } else {
        foundMainSubSection = websiteData.isMain === true && websiteData.name === expectedSlug;
        mainSubSection = foundMainSubSection ? websiteData : null;
      }
    }

    // Extract section data from the main subsection if found
    let newSectionData = null;
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      newSectionData = typeof mainSubSection.section === 'string' 
        ? { _id: mainSubSection.section } 
        : mainSubSection.section;
    }
    
    // Update all state in a single batch to prevent multiple rerenders
    setPageState(prev => ({
      ...prev,
      hasMainSubSection: foundMainSubSection,
      isLoadingMainSubSection: false,
      sectionData: newSectionData
    }));
    
    // Only update section in generic list hook if needed
    if (newSectionData && (!industrySection || industrySection._id !== newSectionData._id)) {
      setSection(newSectionData);
    }
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    industrySection, 
    setSection,
    whyChooseUsSectionConfigTranslated.name // Add this dependency to re-run when language changes
  ]);

  // Process data only when dependencies change
  useEffect(() => {
    processSubsectionData();
  }, [processSubsectionData]);

  // Handle main subsection creation - converted to useCallback to stabilize function reference
  const handleMainSubSectionCreated = useCallback((subsection: any) => {
    // Check if subsection has the correct name (now using translated name)
    const expectedSlug = whyChooseUsSectionConfigTranslated.name;
    const hasCorrectSlug = subsection.name === expectedSlug;
    const isMainSubSection = subsection.isMain === true && hasCorrectSlug;
    
    // If we have section data from the subsection, prepare it
    let newSectionData = null;
    if (subsection.section) {
      newSectionData = typeof subsection.section === 'string' 
        ? { _id: subsection.section } 
        : subsection.section;
    }
    
    // Update state in a single batch
    setPageState(prev => ({
      ...prev,
      hasMainSubSection: isMainSubSection,
      sectionData: newSectionData || prev.sectionData
    }));
    
    // Only update the hook section if we have new data
    if (newSectionData) {
      setSection(newSectionData);
    }
    
    // Refetch to ensure we have the latest data
    if (refetchMainSubSection) {
      refetchMainSubSection();
    }
  }, [refetchMainSubSection, setSection, whyChooseUsSectionConfigTranslated.name]);

  // IMPORTANT: Here's the crux of the button enabling/disabling logic
  // Added check for navItems.length > 0 to disable when there's already a section item
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection) ||
    (navItems.length > 0); // This disables the button if there's already at least one section item

  const emptyStateMessage = !industrySection && !sectionData 
    ? CHOSE_US_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? CHOSE_US_CONFIG.mainSectionRequiredMessage
      : CHOSE_US_CONFIG.emptyStateMessage;

  // Memoize component references to prevent recreation on each render
  const ChoseUsItemsTable = (
    <GenericTable
      columns={CHOSE_US_COLUMNS}
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
      title={t('WhyChooseUsConfig.title', 'Why Choose Us')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title="Delete Section"
      confirmText="Confirm"
    />
  );

  return (
    <div className="space-y-6">
      {/* Main list page with table and section integration */}
      <GenericListPage
        config={CHOSE_US_CONFIG}
        sectionId={sectionId}
        sectionConfig={whyChooseUsSectionConfigTranslated}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={ChoseUsItemsTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingChoseUs || isLoadingMainSubSection}
        emptyCondition={navItems.length === 0}
        noSectionCondition={!industrySection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={whyChooseUsSectionConfigTranslated}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  );
}