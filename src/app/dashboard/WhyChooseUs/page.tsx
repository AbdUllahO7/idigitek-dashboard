"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { whyChooseUsSectionConfig } from "./whyChooseUsSectionConfig"

// Configuration for the Chose Us page
const ChoseUs_CONFIG = {
  title: "Chose Us Management",
  description: "Manage your Chose Us inventory and multilingual content",
  addButtonLabel: "Add New Chose Us item",
  emptyStateMessage: "No Chose Us found. Create your first Chose Us by clicking the \"Add New Chose Us\" button.",
  noSectionMessage: "Please create a Chose Us section first before adding Chose Us.",
  mainSectionRequiredMessage: "Please enter your main section data before adding Chose Us.",
  emptyFieldsMessage: "Please complete all required fields in the main section before adding Chose Us.",
  sectionIntegrationTitle: "Chose Us Section Content",
  sectionIntegrationDescription: "Manage your Chose Us section content in multiple languages.",
  addSectionButtonLabel: "Add Chose Us Section",
  editSectionButtonLabel: "Edit Chose Us Section",
  saveSectionButtonLabel: "Save Chose Us Section",
  listTitle: "Chose Us List",
  editPath: "WhyChooseUs/addChoseUs"
}
// Column definitions
const ChoseUs_COLUMNS = [
  {
    header: "Name",
    accessor: "name",
    className: "font-medium"
  },
  {
    header: "Description",
    accessor: "description",
    cell: TruncatedCell
  },
  {
    header: "Status",
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Main
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: "Order",
    accessor: "order"
  },
  {
    header: "Subsections",
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]

export default function ChoseUsPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const { websiteId } = useWebsiteContext();
  
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

  // Use the generic list hook for Chose Us management
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
    editPath: ChoseUs_CONFIG.editPath
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
  
    // Get expected name from configuration
    const expectedSlug = whyChooseUsSectionConfig.name;
    
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
    whyChooseUsSectionConfig.name
  ]);

  // Process data only when dependencies change
  useEffect(() => {
    processSubsectionData();
  }, [processSubsectionData]);

  // Handle main subsection creation - converted to useCallback to stabilize function reference
  const handleMainSubSectionCreated = useCallback((subsection: any) => {
    // Check if subsection has the correct name
    const expectedSlug = whyChooseUsSectionConfig.name;
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
  }, [refetchMainSubSection, setSection, whyChooseUsSectionConfig.name]);

  // Compute derived values ONCE per render - not during render
  const isAddButtonDisabled = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);

  const emptyStateMessage = !industrySection && !sectionData 
    ? ChoseUs_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? ChoseUs_CONFIG.mainSectionRequiredMessage
      : ChoseUs_CONFIG.emptyStateMessage;

  // Memoize component references to prevent recreation on each render
  const ChoseUsItemsTable = (
    <GenericTable
      columns={ChoseUs_COLUMNS}
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
      title="Chose Us"
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
        config={ChoseUs_CONFIG}
        sectionId={sectionId}
        sectionConfig={whyChooseUsSectionConfig}
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
          sectionConfig={whyChooseUsSectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  );
}