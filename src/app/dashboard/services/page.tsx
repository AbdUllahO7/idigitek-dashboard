"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next" // or your i18n hook
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { getServiceSectionConfig } from "./serviceSectionConfig"

export default function ServicesPage() {
  const { t, i18n } = useTranslation() // i18n hook
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();

  // Get translated service section config based on current language
  const serviceSectionConfig = getServiceSectionConfig(i18n.language)

  // Configuration for the Services page using i18n
  const SERVICES_CONFIG = {
    title: t('servicesPage.title'),
    description: t('servicesPage.description'),
    addButtonLabel: t('servicesPage.addButtonLabel'),
    emptyStateMessage: t('servicesPage.emptyStateMessage'),
    noSectionMessage: t('servicesPage.noSectionMessage'),
    mainSectionRequiredMessage: t('servicesPage.mainSectionRequiredMessage'),
    emptyFieldsMessage: t('servicesPage.emptyFieldsMessage'),
    sectionIntegrationTitle: t('servicesPage.sectionIntegrationTitle'),
    sectionIntegrationDescription: t('servicesPage.sectionIntegrationDescription'),
    addSectionButtonLabel: t('servicesPage.addSectionButtonLabel'),
    editSectionButtonLabel: t('servicesPage.editSectionButtonLabel'),
    saveSectionButtonLabel: t('servicesPage.saveSectionButtonLabel'),
    listTitle: t('servicesPage.listTitle'),
    editPath: "services/addService"
  }

  // Service table column definitions with i18n
  const SERVICE_COLUMNS = [
    {
      header: t('servicesPage.table.columns.name'),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t('servicesPage.table.columns.description'),
      accessor: "description",
      cell: TruncatedCell
    },
    {
      header: t('servicesPage.table.columns.status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value)}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('servicesPage.table.badges.main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('servicesPage.table.columns.order'),
      accessor: "order"
    },
    {
      header: t('servicesPage.table.columns.subsections'),
      accessor: "subsections.length",
      cell: CountBadgeCell
    }
  ]

  // Check if main subsection exists
  const { useGetMainByWebSiteId, useGetBySectionId } = useSubSections()
  
  // Get the main subsection data
  const {
    data: mainSubSectionData,
    isLoading: isLoadingCompleteSubsections,
    refetch: refetchMainSubSection
  } = useGetMainByWebSiteId(websiteId)

  // If we have a sectionId, also try to get subsections for that specific section
  const {
    data: sectionSubsections,
    isLoading: isLoadingSectionSubsections
  } = useGetBySectionId(sectionId || "")

  // Use the generic list hook for service management
  const {
    section: serviceSection,
    items: services,
    isLoadingItems: isLoadingServices,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    itemToDelete,
    isDeleting,
    isAddButtonDisabled: defaultAddButtonDisabled,
    handleSectionChange,
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
    editPath: SERVICES_CONFIG.editPath
  })

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
    
    // Get expected name from configuration
    const expectedName = serviceSectionConfig.name;
    console.log("Expected subsection name:", expectedName);
    
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
      
      console.log("Section subsections check:", { 
        foundMainSubSection, 
        mainSubSection,
        matchesSlug: mainSubSection ? mainSubSection.name === expectedName : false
      });
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
        matchesSlug: mainSubSection ? mainSubSection.name === expectedName : false
      });
    }
    
    console.log("Final subsection result:", { 
      foundMainSubSection, 
      mainSubSection,
      name: mainSubSection?.name,
      expectedName
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
      
      // Update the serviceSection in useGenericList hook if not already set
      if (serviceSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    serviceSection, 
    setSection,
    serviceSectionConfig.name // Add this dependency since it can change with language
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    console.log("Main subsection created:", subsection);
    
    // Check if subsection has the correct name
    const expectedSlug = serviceSectionConfig.name;
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
    refetchMainSubSection();
  };

  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);

  // Debug logging for button disabling conditions
  useEffect(() => {
    console.log("BUTTON DISABLED LOGIC:", {
      defaultAddButtonDisabled,
      isLoadingMainSubSection,
      sectionId: sectionId || "none",
      hasMainSubSection,
      finalIsAddButtonDisabled: isAddButtonDisabled
    });
  }, [defaultAddButtonDisabled, isLoadingMainSubSection, sectionId, hasMainSubSection, isAddButtonDisabled]);

  // Custom message for empty state - keep it simple
  const emptyStateMessage = !serviceSection && !sectionData 
    ? SERVICES_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? SERVICES_CONFIG.mainSectionRequiredMessage
      : SERVICES_CONFIG.emptyStateMessage;

  // Components
  const ServicesTable = (
    <GenericTable
      columns={SERVICE_COLUMNS}
      data={services}
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
      title={t('servicesPage.dialogs.createTitle')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('servicesPage.dialogs.deleteTitle')}
      confirmText={t('servicesPage.dialogs.confirmText')}
    />
  );

  return (
    <div className="space-y-6">
      {/* Main list page with table and section integration */}
      <GenericListPage
        config={SERVICES_CONFIG}
        sectionId={sectionId}
        sectionConfig={serviceSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={ServicesTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingServices || isLoadingMainSubSection}
        emptyCondition={services.length === 0}
        noSectionCondition={!serviceSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={serviceSectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* Simplified: We don't care about form validity */}}
        />
      )}
    </div>
  );
}