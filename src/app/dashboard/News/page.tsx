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
import { getNewsSectionConfig } from "./NewsSectionConfig"
import { useTranslation } from "react-i18next"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Navigation, Users } from "lucide-react"
import { TabsContent } from "@radix-ui/react-tabs"
import CreateNavigationSubSection from "../team/navigation/CreateNavigationSubSection"
import { getTeamNavigationSectionConfig } from "../team/navigation/team-navigation-config"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"

export default function NewsPage() {
  const { t, i18n } = useTranslation()
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext();
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)
  const NavigationConfig = getTeamNavigationSectionConfig(i18n.language);

  // Get the correct configurations for News (not Team!)
  const currentLanguage = i18n.language;
  const newsSectionConfig = getNewsSectionConfig(currentLanguage);

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
    
    // 🔧 FIXED: Use NEWS configurations instead of team configurations
    const expectedNewsSlug = newsSectionConfig.name; // This is correct for NEWS
    const expectedNavigationSlug = NavigationConfig.name; // This is correct for NEWS navigation

    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // 🔧 FIXED: Find the main NEWS subsection (not team!)
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedNewsSlug
        );
        foundMainSubSection = !!mainSubSection;

        // Check for navigation subsection - be more flexible in matching
        const navigationSubSection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === NavigationConfig.type) return true;
          // Match by name
          if (sub.name === expectedNavigationSlug) return true;
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('news') && sub.name.toLowerCase().includes('navigation')) return true;
          return false;
        });
        foundNavigationSubSection = !!navigationSubSection;

      } else {
        // Single object response - check if it's news main or navigation
        if (sectionData.isMain === true && sectionData.name === expectedNewsSlug) {
          foundMainSubSection = true;
          mainSubSection = sectionData;
        }
        
        // Check if it's a news navigation subsection
        if (sectionData.type === NavigationConfig.type || 
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('news') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // 🔧 FIXED: Find the main NEWS subsection (not team!)
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub => 
            sub.isMain === true && sub.name === expectedNewsSlug
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
            if (sub.name && sub.name.toLowerCase().includes('news') && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          foundNavigationSubSection = !!navigationSubSection;
        }

      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedNewsSlug) {
          foundMainSubSection = true;
          mainSubSection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === NavigationConfig.type || 
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('news') && websiteData.name.toLowerCase().includes('navigation'))
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
    setSection,
    newsSectionConfig.name,        // 🔧 FIXED: Use news config
    NavigationConfig.name,     // 🔧 FIXED: Use news navigation config
    NavigationConfig.type      // 🔧 FIXED: Use news navigation config
  ]);

  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = (subsection: any) => {
    
    // 🔧 FIXED: Check if subsection has the correct name or type for NEWS
    const expectedSlug = NavigationConfig.name;
    const expectedType = NavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('news') && subsection.name.toLowerCase().includes('navigation'))
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
    
    // 🔧 FIXED: Check if subsection has the correct name for NEWS
    const expectedSlug = newsSectionConfig.name;
    const hasCorrectSlug = subsection.name === expectedSlug;
    
    // Set that we have a main subsection now (only if it also has the correct name)
    setHasMainSubSection(subsection.isMain === true && hasCorrectSlug);
    
    
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
       <ClickableImage
              imageSrc="/assets/sections/news.png"
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
      
       
      {/* Section Configuration Tabs (only shown when section exists) */}
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
              sectionConfig={newsSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation} 
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