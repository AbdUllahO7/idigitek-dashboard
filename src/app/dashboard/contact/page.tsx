"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { getContactSectionConfig } from "./ContactSectionConfig"
import { useTranslation } from "react-i18next"

export default function ContactPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language; // 'en', 'ar', 'tr'
  const contactSectionConfig = getContactSectionConfig(currentLanguage);

  // Memoized configuration for the Contact page with translations
  const PROJECTS_CONFIG = useMemo(() => ({
    title: t('contactPage.config.title'),
    description: t('contactPage.config.description'),
    addButtonLabel: t('contactPage.config.addButtonLabel'),
    emptyStateMessage: t('contactPage.config.emptyStateMessage'),
    noSectionMessage: t('contactPage.config.noSectionMessage'),
    mainSectionRequiredMessage: t('contactPage.config.mainSectionRequiredMessage'),
    emptyFieldsMessage: t('contactPage.config.emptyFieldsMessage'),
    sectionIntegrationTitle: t('contactPage.config.sectionIntegrationTitle'),
    sectionIntegrationDescription: t('contactPage.config.sectionIntegrationDescription'),
    addSectionButtonLabel: t('contactPage.config.addSectionButtonLabel'),
    editSectionButtonLabel: t('contactPage.config.editSectionButtonLabel'),
    saveSectionButtonLabel: t('contactPage.config.saveSectionButtonLabel'),
    listTitle: t('contactPage.config.listTitle'),
    editPath: "contact/addContact"
  }), [t]);

  // Contact table column definitions with translations
  const PROJECTS_COLUMNS = useMemo(() => [
    {
      header: t('contactPage.table.columns.name'),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t('contactPage.table.columns.description'),
      accessor: "description", 
      cell: TruncatedCell
    },
    {
      header: t('contactPage.table.columns.status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value, { 
              active: t('contactPage.table.status.active'), 
              inactive: t('contactPage.table.status.inactive') 
            })}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('contactPage.table.status.main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('contactPage.table.columns.order'),
      accessor: "order"
    },
    {
      header: t('contactPage.table.columns.subsections'),
      accessor: "subsections.length",
      cell: CountBadgeCell
    }
  ], [t]);

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

  // Use the generic list hook for Contact management
  const {
    section: contactSection,
    items: contactItems,
    isLoadingItems: isLoadingContactItems,
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
    editPath: PROJECTS_CONFIG.editPath
  })

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
    const expectedSlug = contactSectionConfig.name;
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
      
      // Update the contactSection in useGenericList hook if not already set
      if (contactSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    contactSection, 
    setSection,
    contactSectionConfig.name
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    console.log("Main subsection created:", subsection);
    
    // Check if subsection has the correct name
    const expectedSlug = contactSectionConfig.name;
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
    (Boolean(sectionId) && !hasMainSubSection) ||
    contactItems.length > 0; // Disable if there is at least one contact item

  // Custom message for empty state with translations
  const emptyStateMessage = !contactSection && !sectionData 
    ? PROJECTS_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? PROJECTS_CONFIG.mainSectionRequiredMessage
      : PROJECTS_CONFIG.emptyStateMessage;

  // Components with translations
  const ContactTable = (
    <GenericTable
      columns={PROJECTS_COLUMNS}
      data={contactItems}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
      actionColumnHeader={t('contactPage.actions.edit')}
      emptyMessage={t('contactPage.messages.noData')}
      loading={isLoadingContactItems}
    />
  );

  const CreateDialog = (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('contactPage.dialogs.create.title')}
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
        config={PROJECTS_CONFIG}
        sectionId={sectionId}
        sectionConfig={contactSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={ContactTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingContactItems || isLoadingMainSubSection}
        emptyCondition={contactItems.length === 0}
        noSectionCondition={!contactSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateMainSubSection 
          sectionId={sectionId}
          sectionConfig={contactSectionConfig}
          onSubSectionCreated={handleMainSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  );
}