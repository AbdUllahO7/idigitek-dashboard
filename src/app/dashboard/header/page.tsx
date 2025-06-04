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
import { headerSectionConfig } from "./HeaderSectionConfig"
import { useTranslation } from "react-i18next"

export default function HeaderPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const { t } = useTranslation()

  // Column definitions with translations
  const HEADER_COLUMNS = [
    {
      header: t('header.columns.name'),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t('header.columns.description'),
      accessor: "description",
      cell: TruncatedCell
    },
    {
      header: t('header.columns.status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value)}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('header.badges.main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('header.columns.order'),
      accessor: "order"
    },
    {
      header: t('header.columns.subsections'),
      accessor: "subsections.length",
      cell: CountBadgeCell
    }
  ]

  const HEADER_CONFIG = useMemo (() => ({
    title: t('header.management.title'),
    description: t('header.management.description'),
    addButtonLabel: t('header.management.addButtonLabel'),
    emptyStateMessage: t('header.messages.emptyStateMessage'),
    noSectionMessage: t('header.messages.noSectionMessage'),
    mainSectionRequiredMessage: t('header.messages.mainSectionRequiredMessage'),
    emptyFieldsMessage: t('header.messages.emptyFieldsMessage'),
    sectionIntegrationTitle: t('header.section.title'),
    sectionIntegrationDescription: t('header.section.description'),
    addSectionButtonLabel: t('header.section.addButtonLabel'),
    editSectionButtonLabel: t('header.section.editButtonLabel'),
    saveSectionButtonLabel: t('header.section.saveButtonLabel'),
    listTitle: t('header.management.listTitle'),
    editPath: "header/addNavItems"
  }), [t]);

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
    if (!isFirstRender.current && prevHasMainSubSection.current !== hasMainSubSection) {
      console.log(`hasMainSubSection changed from ${prevHasMainSubSection.current} to ${hasMainSubSection}`);
    }
    
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
    
    // Get expected name from configuration
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
      
      console.log("Website subsections check:", { 
        foundMainSubSection, 
        mainSubSection,
        matchesName: mainSubSection ? mainSubSection.name === expectedName : false
      });
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
    setSection
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    console.log("Main subsection created:", subsection);
    
    // Check if subsection has the correct name
    const expectedName = headerSectionConfig.subSectionName;
    const hasCorrectName = subsection.name === expectedName;
    
    // Set that we have a main subsection now (only if it also has the correct name)
    setHasMainSubSection(subsection.isMain === true && hasCorrectName);
    
    // Log the name check
    console.log("Main subsection name check:", {
      actualName: subsection.name,
      expectedName,
      isCorrect: hasCorrectName
    });
    
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
      title={t('header.dialogs.create.title')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('header.dialogs.delete.title')}
      confirmText={t('header.dialogs.delete.confirmText')}
    />
  );

  return (
    <div className="space-y-6">
      {/* Main list page with table and section integration */}
      <GenericListPage
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