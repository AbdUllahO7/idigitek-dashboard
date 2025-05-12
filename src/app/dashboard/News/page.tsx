"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { newsSectionConfig } from "./NewsSectionConfig"

// Configuration for the News page
const NEWS_CONFIG = {
  title: "News Management",
  description: "Manage your News inventory and multilingual content",
  addButtonLabel: "Add New News item",
  emptyStateMessage: "No News found. Create your first News by clicking the \"Add New News\" button.",
  noSectionMessage: "Please create a News section first before adding News.",
  mainSectionRequiredMessage: "Please enter your main section data before adding News.",
  emptyFieldsMessage: "Please complete all required fields in the main section before adding News.",
  sectionIntegrationTitle: "News Section Content",
  sectionIntegrationDescription: "Manage your News section content in multiple languages.",
  addSectionButtonLabel: "Add News Section",
  editSectionButtonLabel: "Edit News Section",
  saveSectionButtonLabel: "Save News Section",
  listTitle: "News List",
  editPath: "News/addNews"
}

// News table column definitions
const NEWS_COLUMNS = [
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

export default function NewsPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();

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

  // Use the generic list hook for News management
  const {
    section: newsSection,
    items: newsItems,
    isLoadingItems: isLoadingNewsItems,
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
    editPath: NEWS_CONFIG.editPath
  })

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {
    console.log("Checking for main subsection...");
    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
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
      
      // Update the newsSection in useGenericList hook if not already set
      if (newsSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    newsSection, 
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

  // Custom add button logic - simplified to only care about having a main subsection
  const isAddButtonDisabled = 
    defaultAddButtonDisabled || 
    isLoadingMainSubSection ||
    (sectionId && !hasMainSubSection);  // Only require main subsection when we have a section
  
  // Custom tooltip message based on condition
  const addButtonTooltip = !newsSection && !sectionData 
    ? NEWS_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? NEWS_CONFIG.mainSectionRequiredMessage
      : defaultAddButtonTooltip;

  // Custom message for empty state 
  const emptyStateMessage = !newsSection && !sectionData 
    ? NEWS_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? NEWS_CONFIG.mainSectionRequiredMessage
      : NEWS_CONFIG.emptyStateMessage;

  // Debug logging
  useEffect(() => {
    console.log("Current state:", {
      hasMainSubSection,
      isLoadingMainSubSection,
      isAddButtonDisabled,
      sectionId: sectionId || "none"
    });
  }, [hasMainSubSection, isLoadingMainSubSection, isAddButtonDisabled, sectionId]);

  // Components
  const NewsTable = (
    <GenericTable
      columns={NEWS_COLUMNS}
      data={newsItems}
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
      title="News"
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title="Delete News Item"
      confirmText="Confirm"
    />
  );

  return (
    <div className="space-y-6">
      {/* Main list page with table and section integration */}
      <GenericListPage
        config={NEWS_CONFIG}
        sectionId={sectionId}
        sectionConfig={newsSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        addButtonTooltip={addButtonTooltip}
        tableComponent={NewsTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingNewsItems || isLoadingMainSubSection}
        emptyCondition={newsItems.length === 0}
        noSectionCondition={!newsSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={newsSectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  );
}