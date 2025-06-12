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
import { getNewsSectionConfig } from "./NewsSectionConfig"
import { useTranslation } from "react-i18next"

export default function NewsPage() {
  const { t, i18n } = useTranslation()
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();

  // Configuration for the News page - now using translations
  const NEWS_CONFIG = {
    title: t('newsPage.title', 'News Management'),
    description: t('newsPage.description', 'Manage your News inventory and multilingual content'),
    addButtonLabel: t('newsPage.addButtonLabel', 'Add New News item'),
    emptyStateMessage: t('newsPage.emptyStateMessage', 'No News found. Create your first News by clicking the "Add New News" button.'),
    noSectionMessage: t('newsPage.noSectionMessage', 'Please create a News section first before adding News.'),
    mainSectionRequiredMessage: t('newsPage.mainSectionRequiredMessage', 'Please enter your main section data before adding News.'),
    emptyFieldsMessage: t('newsPage.emptyFieldsMessage', 'Please complete all required fields in the main section before adding News.'),
    sectionIntegrationTitle: t('newsPage.sectionIntegrationTitle', 'News Section Content'),
    sectionIntegrationDescription: t('newsPage.sectionIntegrationDescription', 'Manage your News section content in multiple languages.'),
    addSectionButtonLabel: t('newsPage.addSectionButtonLabel', 'Add News Section'),
    editSectionButtonLabel: t('newsPage.editSectionButtonLabel', 'Edit News Section'),
    saveSectionButtonLabel: t('newsPage.saveSectionButtonLabel', 'Save News Section'),
    listTitle: t('newsPage.listTitle', 'News List'),
    editPath: "News/addNews"
  }

  // News table column definitions - now using translations
  const NEWS_COLUMNS = [
    {
      header: t('newsPage.columnName', 'Name'),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t('newsPage.columnDescription', 'Description'),
      accessor: "description",
      cell: TruncatedCell
    },
    {
      header: t('newsPage.columnStatus', 'Status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value)}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('newsPage.main', 'Main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('newsPage.columnOrder', 'Order'),
      accessor: "order"
    },
    {
      header: t('newsPage.columnSubsections', 'Subsections'),
      accessor: "subsections.length",
      cell: CountBadgeCell
    }
  ]

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
    const currentLanguage = i18n.language; // 'en', 'ar', 'tr'
    const newsSectionConfig = getNewsSectionConfig(currentLanguage);

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      console.log("Still loading subsection data...");
      setIsLoadingMainSubSection(true);
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let mainSubSection = null;
    
    // Get expected name from configuration
    const expectedSlug = newsSectionConfig.name;
    console.log("Expected subsection name:", expectedSlug);
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main subsection in the array with correct name
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedSlug
        );
        foundMainSubSection = !!mainSubSection;
      } else {
        // Single object response
        foundMainSubSection = sectionData.isMain === true && sectionData.name === expectedSlug;
        mainSubSection = foundMainSubSection ? sectionData : null;
      }
      
      console.log("Section subsections check:", { 
        foundMainSubSection, 
        mainSubSection,
        matchesSlug: mainSubSection ? mainSubSection.name === expectedSlug : false
      });
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if (!foundMainSubSection && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main subsection in the array with correct name
        mainSubSection = websiteData.find(sub => 
          sub.isMain === true && sub.name === expectedSlug
        );
        foundMainSubSection = !!mainSubSection;
      } else {
        // Single object response
        foundMainSubSection = websiteData.isMain === true && websiteData.name === expectedSlug;
        mainSubSection = foundMainSubSection ? websiteData : null;
      }
      
      console.log("Website subsections check:", { 
        foundMainSubSection, 
        mainSubSection,
        matchesSlug: mainSubSection ? mainSubSection.name === expectedSlug : false
      });
    }
    
    console.log("Final subsection result:", { 
      foundMainSubSection, 
      mainSubSection,
      name: mainSubSection?.name,
      expectedSlug
    });
    
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
    
    // Check if subsection has the correct name
    const expectedSlug = newsSectionConfig.name;
    const hasCorrectSlug = subsection.name === expectedSlug;
    
    // Set that we have a main subsection now (only if it also has the correct name)
    setHasMainSubSection(subsection.isMain === true && hasCorrectSlug);
    
    // Log the name check
    console.log("Main subsection name check:", {
      actualSlug: subsection.name,
      expectedSlug,
      isCorrect: hasCorrectSlug
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

  // Logic for disabling the add button
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);
  
  // Custom message for empty state 
  const emptyStateMessage = !newsSection && !sectionData 
    ? NEWS_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? NEWS_CONFIG.mainSectionRequiredMessage
      : NEWS_CONFIG.emptyStateMessage;

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
      title={t('newsPage.createNewsTitle', 'News')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('newsPage.deleteNewsItem', 'Delete News Item')}
      confirmText={t('newsPage.confirmDelete', 'Confirm')}
      itemType="item"
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