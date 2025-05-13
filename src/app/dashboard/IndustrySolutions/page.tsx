"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { industrySectionConfig } from "./industrySectionConfig"

// Configuration for the Industry page
const INDUSTRY_CONFIG = {
  title: "Industry Management",
  description: "Manage your Industry inventory and multilingual content",
  addButtonLabel: "Add New Industry item",
  emptyStateMessage: "No Industry found. Create your first Industry by clicking the \"Add New Industry\" button.",
  noSectionMessage: "Please create a Industry section first before adding Industry.",
  mainSectionRequiredMessage: "Please enter your main section data before adding Industry.",
  emptyFieldsMessage: "Please complete all required fields in the main section before adding Industry.",
  sectionIntegrationTitle: "Industry Section Content",
  sectionIntegrationDescription: "Manage your Industry section content in multiple languages.",
  addSectionButtonLabel: "Add Industry Section",
  editSectionButtonLabel: "Edit Industry Section",
  saveSectionButtonLabel: "Save Industry Section",
  listTitle: "Industry List",
  editPath: "IndustrySolutions/addIndustry"
}
// Column definitions
const INDUSTRY_COLUMNS = [
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

export default function IndustryPage() {

  
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  
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

  // Use the generic list hook for Industry management
  const {
    section: industrySection,
    items: navItems,
    isLoadingItems: isLoadingIndustryItems,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    itemToDelete,
    isDeleting,
    isAddButtonDisabled: defaultAddButtonDisabled,
    addButtonTooltip: defaultAddButtonTooltip,
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
    editPath: INDUSTRY_CONFIG.editPath
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
    console.log("Checking for main subsection...");
    console.log("Subsection data state:", { 
      mainSubSectionData, 
      sectionSubsections,
      isLoadingCompleteSubsections,
      isLoadingSectionSubsections
    });
    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      console.log("Still loading subsection data...");
      setIsLoadingMainSubSection(true);
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let mainSubSection = null;
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main subsection in the array
        mainSubSection = sectionData.find(sub => sub.isMain === true);
        foundMainSubSection = !!mainSubSection;
      } else {
        // Single object response
        foundMainSubSection = sectionData.isMain === true;
        mainSubSection = foundMainSubSection ? sectionData : null;
      }
      
      console.log("Section subsections check:", { foundMainSubSection, mainSubSection });
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if (!foundMainSubSection && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main subsection in the array
        mainSubSection = websiteData.find(sub => sub.isMain === true);
        foundMainSubSection = !!mainSubSection;
      } else {
        // Single object response
        foundMainSubSection = websiteData.isMain === true;
        mainSubSection = foundMainSubSection ? websiteData : null;
      }
      
      console.log("Website subsections check:", { foundMainSubSection, mainSubSection });
    }
    
    console.log("Final subsection result:", { foundMainSubSection, mainSubSection });
    
    // Update state based on what we found
    setHasMainSubSection(foundMainSubSection);
    setIsLoadingMainSubSection(false);
    
    // Extract section data from the main subsection if we found one
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      const sectionInfo = typeof mainSubSection.section === 'string' 
        ? { _id: mainSubSection.section } 
        : mainSubSection.section;
      
      console.log("Setting section data:", sectionInfo);
      
      // Set local section data
      setSectionData(sectionInfo);
      
      // Update the industrySection in useGenericList hook if not already set
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
    setSection
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    console.log("Main subsection created:", subsection);
    
    // Set that we have a main subsection now
    setHasMainSubSection(subsection.isMain === true);
    
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
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);
  
  // Debug logging specifically for our button disabling conditions
  useEffect(() => {
    console.log("BUTTON DISABLED LOGIC:", {
      defaultAddButtonDisabled,
      isLoadingMainSubSection,
      sectionId: sectionId || "none",
      hasMainSubSection,
      finalIsAddButtonDisabled: isAddButtonDisabled
    });
  }, [defaultAddButtonDisabled, isLoadingMainSubSection, sectionId, hasMainSubSection, isAddButtonDisabled]);
  
  // Custom tooltip message based on condition
  const addButtonTooltip = !industrySection && !sectionData 
    ? INDUSTRY_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? INDUSTRY_CONFIG.mainSectionRequiredMessage
      : defaultAddButtonTooltip;

  // Custom message for empty state 
  const emptyStateMessage = !industrySection && !sectionData 
    ? INDUSTRY_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? INDUSTRY_CONFIG.mainSectionRequiredMessage
      : INDUSTRY_CONFIG.emptyStateMessage;

  // Components
  const IndustryItemsTable = (
    <GenericTable
      columns={INDUSTRY_COLUMNS}
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
      title="Industry"
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
        config={INDUSTRY_CONFIG}
        sectionId={sectionId}
        sectionConfig={industrySectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        addButtonTooltip={addButtonTooltip}
        tableComponent={IndustryItemsTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingIndustryItems || isLoadingMainSubSection}
        emptyCondition={navItems.length === 0}
        noSectionCondition={!industrySection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={industrySectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  );
}