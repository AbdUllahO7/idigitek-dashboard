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
import { useTranslation } from "react-i18next"
import { getPartnersSectionConfig } from "./PartnersSectionConfig"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Copy, Navigation, Users } from "lucide-react"
import CreateNavigationSubSection from "../team/navigation/CreateNavigationSubSection"
import { getTeamNavigationSectionConfig } from "../team/navigation/team-navigation-config"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { add } from "date-fns"

export default function PartnersPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const {t , i18n} = useTranslation()
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)
  const NavigationConfig = getTeamNavigationSectionConfig(i18n.language);
  const [isDuplicateSection, setIsDuplicateSection] = useState<boolean>(false)
  const [originalSectionInfo, setOriginalSectionInfo] = useState<any>(null)

   const { useGetById: useGetSectionById } = useSections()
  const { data: currentSectionData } = useGetSectionById(sectionId || "", !!sectionId)
  useEffect(() => {
    if (currentSectionData?.data) {
      const section = currentSectionData.data;
      
      // Check for duplication metadata
      if (section.isDuplicate) {
        setIsDuplicateSection(true);
        setOriginalSectionInfo({
          name: section.duplicateOf || 'Original Section',
          index: section.duplicateIndex || 1,
          originalId: section.originalSectionId
        });
      } else {
        setIsDuplicateSection(false);
        setOriginalSectionInfo(null);
      }
    }
  }, [currentSectionData]);
  
  // Get basic section info for both navigation and main content pre-population
  const {useGetBasicInfoByWebsiteId} = useSections()
  const { data: basicInfo } = useGetBasicInfoByWebsiteId(websiteId)
  
  //  Process section data for both navigation and main content use
  const sectionInfoForNavigation = useMemo(() => {
    if (!basicInfo?.data?.length) return null;
    
    // Find the current section in the basic info
    const currentSection = sectionId ? 
      basicInfo.data.find(section => section.id === sectionId) : 
      basicInfo.data[0]; // Use first section if no specific sectionId
    
    if (!currentSection) return null;
    
    return {
      id: currentSection.id,
      name: currentSection.name,
      subName: currentSection.subName,
      // Create navigation-friendly data structure
      navigationData: {
        availableLanguages: ['en', 'ar', 'tr'], // Languages available in section data
        fallbackValues: {
          // Use section name as navigation label, subName as URL
          navigationLabel: currentSection.name,
          navigationUrl: `/${currentSection.subName.toLowerCase()}`
        }
      }
    };
  }, [basicInfo, sectionId]);

  const currentLanguage = i18n.language; // 'en', 'ar', 'tr'
  const partnersSectionConfig = getPartnersSectionConfig(currentLanguage);

  // Use the generic list hook for Partners management
  const {
    section: partnersSection,
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
    editPath: "partners/addPartners"
  })

  // Determine if we should show the add button (hide it when items exist)
  const shouldShowAddButton = navItems.length === 0;

  // Configuration for Partners page with dynamic addButtonLabel
   const HEADER_CONFIG = useMemo(() => {
    const baseTitle = isDuplicateSection && originalSectionInfo
      ? t('partners.management.duplicateTitle', 'Partners Management (Copy {{index}})', { 
          index: originalSectionInfo.index 
        })
      : t('partners.management.title', 'Partners Management');

    const baseDescription = isDuplicateSection && originalSectionInfo
      ? t('partners.management.duplicateDescription', 'Manage your partners inventory - this is an independent copy of "{{originalName}}"', {
          originalName: originalSectionInfo.name
        })
      : t('partners.management.description', 'Manage your partners inventory and multilingual content');

    const baseConfig = {
      title: baseTitle,
      description: baseDescription,
      emptyStateMessage: t('partners.management.emptyStateMessage', 'No partners found. Create your first partner by clicking the "Add New Partner" button.'),
      noSectionMessage: t('partners.management.noSectionMessage', 'Please create a partners section first before adding partners.'),
      mainSectionRequiredMessage: t('partners.management.mainSectionRequiredMessage', 'Please enter your main section data before adding partners.'),
      emptyFieldsMessage: t('partners.management.emptyFieldsMessage', 'Please complete all required fields in the main section before adding partners.'),
      sectionIntegrationTitle: t('partners.management.sectionIntegrationTitle', 'Partners Section Content'),
      sectionIntegrationDescription: t('partners.management.sectionIntegrationDescription', 'Manage your partners section content in multiple languages.'),
      addSectionButtonLabel: t('partners.management.addSectionButtonLabel', 'Add Partners Section'),
      editSectionButtonLabel: t('partners.management.editSectionButtonLabel', 'Edit Partners Section'),
      saveSectionButtonLabel: t('partners.management.saveSectionButtonLabel', 'Save Partners Section'),
      listTitle: t('partners.management.listTitle', 'Partners List'),
      editPath: "partners/addPartners",
      addButtonLabel: '', 
    };

    // Only add addButtonLabel if no items exist
    if (shouldShowAddButton) {
      baseConfig.addButtonLabel = t('partners.management.addButtonLabel', 'Add New Partner');
    }

    return baseConfig;
  }, [t, shouldShowAddButton, isDuplicateSection, originalSectionInfo]);


  const PARTNERS_COLUMNS = [
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

  // Debug changes in hasMainSubSection
  useEffect(() => {
    prevHasMainSubSection.current = hasMainSubSection;
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [hasMainSubSection]);

   useEffect(() => {    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      setIsLoadingMainSubSection(true);
      return;
    }
    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let foundNavigationSubSection = false;
    let mainSubSection = null;
    
    // Use Partners configurations
    const expectedPartnersSlug = partnersSectionConfig.name;
    const expectedNavigationSlug = NavigationConfig.name;
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main Partners subsection
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedPartnersSlug
        );
        foundMainSubSection = !!mainSubSection;

        // Check for navigation subsection - be more flexible in matching
        const navigationSubSection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === NavigationConfig.type) return true;
          // Match by name
          if (sub.name === expectedNavigationSlug) return true;
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('partners') && sub.name.toLowerCase().includes('navigation')) return true;
          return false;
        });
        foundNavigationSubSection = !!navigationSubSection;
    
      } else {
        // Single object response - check if it's partners main or navigation
        if (sectionData.isMain === true && sectionData.name === expectedPartnersSlug) {
          foundMainSubSection = true;
          mainSubSection = sectionData;
        }
        
        // Check if it's a partners navigation subsection
        if (sectionData.type === NavigationConfig.type || 
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('partners') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main Partners subsection
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub => 
            sub.isMain === true && sub.name === expectedPartnersSlug
          );
          foundMainSubSection = !!mainSubSection;
        }

        // Check for navigation subsection - be more flexible in matching
        if (!foundNavigationSubSection) {
          const navigationSubSection = websiteData.find(sub => {
            // Match by type first (most reliable)
            if (sub.type === NavigationConfig.type) return true;
            // Match by name
            if (sub.name === expectedNavigationSlug) return true;
            // Match by partial name (in case of slug differences)
            if (sub.name && sub.name.toLowerCase().includes('partners') && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          foundNavigationSubSection = !!navigationSubSection;
        }
      
      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedPartnersSlug) {
          foundMainSubSection = true;
          mainSubSection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === NavigationConfig.type || 
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('partners') && websiteData.name.toLowerCase().includes('navigation'))
        )) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    setHasMainSubSection(foundMainSubSection);
    setHasNavigationSubSection(foundNavigationSubSection);
    setIsLoadingMainSubSection(false);
    
    // Extract section data from the main subsection if we found one
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      const sectionInfo = typeof mainSubSection.section === 'string' 
        ? { _id: mainSubSection.section } 
        : mainSubSection.section;
      
      // Set local section data
      setSectionData(sectionInfo);
      
      // Update the partnersSection in useGenericList hook if not already set
      if (partnersSection === null) {
        setSection(sectionInfo);
      }
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    partnersSection, 
    setSection,
    partnersSectionConfig.name,
    NavigationConfig.name,
    NavigationConfig.type
  ]);

  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = (subsection: any) => {    
    // Check if subsection has the correct name or type for Partners
    const expectedSlug = NavigationConfig.name;
    const expectedType = NavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('partners') && subsection.name.toLowerCase().includes('navigation'))
    );
    
    // Set that we have a navigation subsection now
    setHasNavigationSubSection(hasCorrectIdentifier);
    
    // Force refetch of all subsection data
    if (refetchMainSubSection) {
      setTimeout(() => {
        refetchMainSubSection();
      }, 1000); // Give it a bit more time to ensure data is saved
    }
  };

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    // Check if subsection has the correct name
    const expectedName = partnersSectionConfig.subSectionName;
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

  // Updated button disabling logic - removed the navItems.length check since we're now hiding instead
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);

  // Custom message for empty state 
  const emptyStateMessage = !partnersSection && !sectionData 
    ? HEADER_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? HEADER_CONFIG.mainSectionRequiredMessage
      : HEADER_CONFIG.emptyStateMessage;

  // Components
  const NavItemsTable = (
    <GenericTable
      columns={PARTNERS_COLUMNS}
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
      title="Partners"
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

      {isDuplicateSection && originalSectionInfo && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Copy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                {t('partners.management.duplicateIndicator.title', 'Duplicate Section')}
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {t('partners.management.duplicateIndicator.description', 'This is copy {{index}} of "{{originalName}}". All content is independent.', {
                  index: originalSectionInfo.index,
                  originalName: originalSectionInfo.name
                })}
              </p>
            </div>
          </div>
        </div>
      )}

       <ClickableImage
              imageSrc="/assets/sections/partners.png"
              imageAlt={t('HeroManagement.tabLabel', 'Hero Section')}
              size="large"
              title={t('HeroManagement.tabLabel', 'Hero Section')}
              subtitle={t('HeroManagement.createSubtitle', 'Click to view full size')}
              t={t}
              priority
              className="w-full"
              previewClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl h-64 md:h-80 lg:h-96"
            />
      
      {/* Main list page with table and section integration */}
      <GenericListPage
        config={HEADER_CONFIG}
        sectionId={sectionId}
        sectionConfig={partnersSectionConfig}
        isAddButtonDisabled={false}
        tableComponent={NavItemsTable}
        createDialogComponent={CreateDialog}
        showAddButton={shouldShowAddButton} // Only show button when we should
        onAddNew={shouldShowAddButton ? handleAddNew : () => {}} // Only pass handler when we should show button
        deleteDialogComponent={DeleteDialog}
        isLoading={isLoadingNavItems || isLoadingMainSubSection}
        emptyCondition={navItems.length === 0}
        noSectionCondition={false}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Users size={16} />
              {t('Navigation.ContentConfiguration')}
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation size={16} />
              {t('Navigation.NavigationConfiguration')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <CreateMainSubSection 
              sectionId={sectionId}
              sectionConfig={partnersSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation}
              imageUrl ={"/assets/PartsOfSections/partners.png"}
              
            />
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            <CreateNavigationSubSection 
              sectionId={sectionId}
              sectionConfig={NavigationConfig}
              onSubSectionCreated={handleNavigationSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}