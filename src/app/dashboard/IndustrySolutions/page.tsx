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
import { getIndustrySectionConfig } from "./industrySectionConfig"
import { useTranslation } from "react-i18next"
// Import your translation hook - adjust the import path as needed

export default function IndustryPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  
  // Get translation function
  const { t , i18n } = useTranslation() // Adjust based on your translation hook
    const currentLanguage = i18n.language; // 'en', 'ar', 'tr'
    const industrySectionConfig = getIndustrySectionConfig(currentLanguage);

  // Configuration for the Industry page - now using translations
  const INDUSTRY_CONFIG = {
    title: t("industryPage.title"),
    description: t("industryPage.description"),
    addButtonLabel: t("industryPage.addButtonLabel"),
    emptyStateMessage: t("industryPage.emptyStateMessage"),
    noSectionMessage: t("industryPage.noSectionMessage"),
    mainSectionRequiredMessage: t("industryPage.mainSectionRequiredMessage"),
    emptyFieldsMessage: t("industryPage.emptyFieldsMessage"),
    sectionIntegrationTitle: t("industryPage.sectionIntegrationTitle"),
    sectionIntegrationDescription: t("industryPage.sectionIntegrationDescription"),
    addSectionButtonLabel: t("industryPage.addSectionButtonLabel"),
    editSectionButtonLabel: t("industryPage.editSectionButtonLabel"),
    saveSectionButtonLabel: t("industryPage.saveSectionButtonLabel"),
    listTitle: t("industryPage.listTitle"),
    editPath: "IndustrySolutions/addIndustry"
  }

  // Column definitions - now using translations
  const INDUSTRY_COLUMNS = [
    {
      header: t("industryPage.columnName"),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t("industryPage.columnDescription"),
      accessor: "description",
      cell: TruncatedCell
    },
    {
      header: t("industryPage.columnStatus"),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value)}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t("industryPage.main")}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t("industryPage.columnOrder"),
      accessor: "order"
    },
    {
      header: t("industryPage.columnSubsections"),
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

  // Use the generic list hook for Industry management
  const {
    section: industrySection,
    items: industryItems,
    isLoadingItems: isLoadingIndustryItems,
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
    editPath: INDUSTRY_CONFIG.editPath
  })

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {    
    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      console.log(t("industryPage.loadingSubsections"));
      setIsLoadingMainSubSection(true);
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let mainSubSection = null;
    
    // Get expected name from configuration - FIXED: Use .name instead of .subSectionName
    const expectedSlug = industrySectionConfig.name;
    console.log(t("industryPage.expectedSubsectionName"), expectedSlug);
    
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
    
    console.log(t("industryPage.finalSubsectionResult"), { 
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
      
      console.log(t("industryPage.settingSectionData"), sectionInfo);
      
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
    setSection,
    t
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    console.log(t("industryPage.subsectionCreated"), subsection);
    
    // Check if subsection has the correct name - FIXED: Use .name instead of .subSectionName
    const expectedSlug = industrySectionConfig.name;
    const hasCorrectSlug = subsection.name === expectedSlug;
    
    // Set that we have a main subsection now (only if it also has the correct name)
    setHasMainSubSection(subsection.isMain === true && hasCorrectSlug);
    
    // Log the name check
    console.log(t("industryPage.subsectionNameCheck"), {
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
  const emptyStateMessage = !industrySection && !sectionData 
    ? INDUSTRY_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? INDUSTRY_CONFIG.mainSectionRequiredMessage
      : INDUSTRY_CONFIG.emptyStateMessage;

  // Components
  const IndustryTable = (
    <GenericTable
      columns={INDUSTRY_COLUMNS}
      data={industryItems}
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
      title={t("industryPage.createIndustryTitle")}
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
        config={INDUSTRY_CONFIG}
        sectionId={sectionId}
        sectionConfig={industrySectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={IndustryTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingIndustryItems || isLoadingMainSubSection}
        emptyCondition={industryItems.length === 0}
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