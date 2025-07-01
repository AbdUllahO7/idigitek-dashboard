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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Navigation, Users } from "lucide-react"
import CreateNavigationSubSection from "../team/navigation/CreateNavigationSubSection"
import { getTeamNavigationSectionConfig } from "../team/navigation/team-navigation-config"
import { useTranslation } from "react-i18next"
import { getproductSectionConfig } from "./ProductSectionConfig"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"



export default function ProductPage() {
  const searchParams = useSearchParams()
  const { t, i18n } = useTranslation()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext()
  const NavigationConfig = getTeamNavigationSectionConfig(i18n.language)
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)
  const currentLanguage = i18n.language;
  const ProductSectionConfig = getproductSectionConfig(currentLanguage);

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


  const Product_CONFIG = useMemo(() => ({
    title: t('ProductManagement.tabLabel'),
    description: t('ProductManagement.createSubtitle'),
    addButtonLabel: t('ProductManagement.createTitle'),
    emptyStateMessage: t('ProductManagement.errorMessage'),
    noSectionMessage: t('ProductManagement.createSubtitle'),
    mainSectionRequiredMessage: t('ProductManagement.editSubtitleDefault'),
    emptyFieldsMessage: t('ProductManagement.errorMessage'),
    sectionIntegrationTitle: t('ProductManagement.formSections.Product'),
    sectionIntegrationDescription: t('ProductManagement.editSubtitleDefault'),
    addSectionButtonLabel: t('ProductManagement.createTitle'),
    editSectionButtonLabel: t('ProductManagement.editTitle'),
    saveSectionButtonLabel: t('ProductManagement.savedMessage'),
    listTitle: t('ProductManagement.backToList'),
    editPath: "products/addProducts"
  }), [t])
  const Product_COLUMNS = [
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

  // Use the generic list hook for Product management
  const {
    section: ProductSection,
    items: ProductItems,
    isLoadingItems: isLoadingProductItems,
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
    editPath: Product_CONFIG.editPath
  })

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {    
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      setIsLoadingMainSubSection(true);
      return;
    }
    

    
    // We're done loading, now check the data
    let foundMainSubSection = false;
    let foundNavigationSubSection = false;
    let mainSubsection = null;
    
    // Use Product configurations
    const expectedProductSlug = ProductSectionConfig.name; // This is correct for Product
    const expectedNavigationSlug = NavigationConfig.name; // This is correct for Product navigation
    
  
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main Product subsection
        mainSubsection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedProductSlug
        );
        foundMainSubSection = !!mainSubsection;

        // Check for navigation subsection - be more flexible in matching
        const navigationSubsection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === NavigationConfig.type) return true;
          // Match by name
          if (sub.name === expectedNavigationSlug) return true;
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('Product') && sub.name.toLowerCase().includes('navigation')) return true;
          return false;
        });
        foundNavigationSubSection = !!navigationSubsection;
        
     
      } else {
        // Single object response - check if it's Product main or navigation
        if (sectionData.isMain === true && sectionData.name === expectedProductSlug) {
          foundMainSubSection = true;
          mainSubsection = sectionData;
        }
        
        // Check if it's a Product navigation subsection
        if (sectionData.type === NavigationConfig.type || 
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('Product') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main Product subsection
        if (!foundMainSubSection) {
          mainSubsection = websiteData.find(sub => 
            sub.isMain === true && sub.name === expectedProductSlug
          );
          foundMainSubSection = !!mainSubsection;
        }

        // Check for navigation subsection - be more flexible in matching
        if (!foundNavigationSubSection) {
          const navigationSubsection = websiteData.find(sub => {
            // Match by type first (most reliable)
            if (sub.type === NavigationConfig.type) return true;
            // Match by name
            if (sub.name === expectedNavigationSlug) return true;
            // Match by partial name (in case of slug differences)
            if (sub.name && sub.name.toLowerCase().includes('Product') && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          foundNavigationSubSection = !!navigationSubsection;
        }
        
   
      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedProductSlug) {
          foundMainSubSection = true;
          mainSubsection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === NavigationConfig.type || 
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('Product') && websiteData.name.toLowerCase().includes('navigation'))
        )) {
          foundNavigationSubSection = true;
        }
      }
    }
    

    
    setHasMainSubSection(foundMainSubSection);
    setHasNavigationSubSection(foundNavigationSubSection);
    setIsLoadingMainSubSection(false);
    
    // Extract section data from the main subsection if we found one
    if (foundMainSubSection && mainSubsection && mainSubsection.section) {
      const sectionInfo = typeof mainSubsection.section === 'string' 
        ? { _id: mainSubsection.section } 
        : mainSubsection.section;
      
      // Set local section data
      setSectionData(sectionInfo);
      
      // Update the ProductSection in useGenericList hook if not already set
      if (ProductSection === null) {
        setSection(sectionInfo);
      }
      
    }
    
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    ProductSection, 
    setSection,
    ProductSectionConfig.name,        
    NavigationConfig.name,     
    NavigationConfig.type      
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    
    // Check if subsection has the correct name
    const expectedSlug = ProductSectionConfig.name;
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

  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = (subsection: any) => {
    
    // Check if subsection has the correct name or type for Product
    const expectedSlug = NavigationConfig.name;
    const expectedType = NavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('Product') && subsection.name.toLowerCase().includes('navigation'))
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

  // Logic for disabling the add button
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);
  
  // Custom message for empty state 
  const emptyStateMessage = !ProductSection && !sectionData 
    ? Product_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? Product_CONFIG.mainSectionRequiredMessage
      : Product_CONFIG.emptyStateMessage;

  // Components
  const ProductTable = (
    <GenericTable
      columns={Product_COLUMNS}
      data={ProductItems}
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
      title={t('ProductManagement.tabLabel')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('ProductManagement.tabLabel')}
      confirmText="Confirm"
    />
  );

  return (
    <div className="space-y-6">
    <ClickableImage
        imageSrc="/assets/sections/products.png"
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
        config={Product_CONFIG}
        sectionId={sectionId}
        sectionConfig={ProductSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={ProductTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingProductItems || isLoadingMainSubSection}
        emptyCondition={ProductItems.length === 0}
        noSectionCondition={!ProductSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {/* Main subsection management (only shown when section exists) */}
      {sectionId && (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Users size={16} />
              {t('ProductManagement.formSections.Product')}
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation size={16} />
              {t('ProductManagement.formSections.navigation')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <CreateMainSubSection 
              sectionId={sectionId}
              sectionConfig={ProductSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation} 
              imageUrl ={"/assets/PartsOfSections/products.png"}
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