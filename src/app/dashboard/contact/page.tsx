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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import CreateNavigationSubSection from "../team/navigation/CreateNavigationSubSection"
import { Navigation, Users } from "lucide-react"
import { getTeamNavigationSectionConfig } from "../team/navigation/team-navigation-config"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { add } from "date-fns"

// Contact Navigation Configuration Function
const getContactNavigationSectionConfig = (language: string = 'en') => {
  const configs = {
    en: {
      name: "Contact Navigation",
      type: "contactNavigation",
      description: "Navigation settings for contact section",
      title: "Contact Navigation Configuration",
      subtitle: "Configure navigation settings for your contact section"
    },
    ar: {
      name: "تنقل جهات الاتصال",
      type: "contactNavigation", 
      description: "إعدادات التنقل لقسم جهات الاتصال",
      title: "تكوين تنقل جهات الاتصال",
      subtitle: "تكوين إعدادات التنقل لقسم جهات الاتصال الخاص بك"
    },
    tr: {
      name: "İletişim Navigasyonu",
      type: "contactNavigation",
      description: "İletişim bölümü için navigasyon ayarları", 
      title: "İletişim Navigasyon Yapılandırması",
      subtitle: "İletişim bölümünüz için navigasyon ayarlarını yapılandırın"
    }
  };
  
  return configs[language as keyof typeof configs] || configs.en;
};

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
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)
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
  
  // Use Contact Navigation instead of Team
  const contactNavigationConfig = getTeamNavigationSectionConfig(i18n.language);

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
    editPath: "contact/addContact"
  })

  // Determine if we should show the add button (hide it when items exist)
  const shouldShowAddButton = contactItems.length === 0;

  // Memoized configuration for the Contact page with translations
  // Only include addButtonLabel when we should show the add button
  const CONTACTS_CONFIG = useMemo(() => {
    const baseConfig = {
      title: t('contactPage.config.title', 'Contact Management'),
      description: t('contactPage.config.description', 'Manage your contact inventory and multilingual content'),
      emptyStateMessage: t('contactPage.config.emptyStateMessage', 'No contacts found. Create your first contact by clicking the "Add New Contact" button.'),
      noSectionMessage: t('contactPage.config.noSectionMessage', 'Please create a contact section first before adding contacts.'),
      mainSectionRequiredMessage: t('contactPage.config.mainSectionRequiredMessage', 'Please enter your main section data before adding contacts.'),
      emptyFieldsMessage: t('contactPage.config.emptyFieldsMessage', 'Please complete all required fields in the main section before adding contacts.'),
      sectionIntegrationTitle: t('contactPage.config.sectionIntegrationTitle', 'Contact Section Content'),
      sectionIntegrationDescription: t('contactPage.config.sectionIntegrationDescription', 'Manage your contact section content in multiple languages.'),
      addSectionButtonLabel: t('contactPage.config.addSectionButtonLabel', 'Add Contact Section'),
      editSectionButtonLabel: t('contactPage.config.editSectionButtonLabel', 'Edit Contact Section'),
      saveSectionButtonLabel: t('contactPage.config.saveSectionButtonLabel', 'Save Contact Section'),
      listTitle: t('contactPage.config.listTitle', 'Contact List'),
      editPath: "contact/addContact",
      addButtonLabel: '', 
    };

    // Only add addButtonLabel if no items exist (this helps hide the button)
    if (shouldShowAddButton) {
      baseConfig.addButtonLabel = t('contactPage.config.addButtonLabel', 'Add New Contact');
    }

    return baseConfig;
  }, [t, shouldShowAddButton]);

  // Contact table column definitions with translations
  const CONTACTS_COLUMNS = useMemo(() => [
    {
      header: t('contactPage.table.columns.name', 'Name'),
      accessor: "name",
      className: "font-medium"
    },
    {
      header: t('contactPage.table.columns.description', 'Description'),
      accessor: "description", 
      cell: TruncatedCell
    },
    {
      header: t('contactPage.table.columns.status', 'Status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value, { 
              active: t('contactPage.table.status.active', 'Active'), 
              inactive: t('contactPage.table.status.inactive', 'Inactive') 
            })}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('contactPage.table.status.main', 'Main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('contactPage.table.columns.order', 'Order'),
      accessor: "order"
    },
    {
      header: t('contactPage.table.columns.subsections', 'Subsections'),
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

  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = (subsection: any) => {
    // Check if subsection has the correct name or type for CONTACT
    const expectedSlug = contactNavigationConfig.name;
    const expectedType = contactNavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('contact') && subsection.name.toLowerCase().includes('navigation'))
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
    let mainSubSection = null;
    
    // Use CONTACT configurations
    const expectedContactSlug = contactSectionConfig.name;
    const expectedNavigationSlug = contactNavigationConfig.name;
    
    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        // Find the main CONTACT subsection
        mainSubSection = sectionData.find(sub => 
          sub.isMain === true && sub.name === expectedContactSlug
        );
        foundMainSubSection = !!mainSubSection;

        // Check for navigation subsection - be more flexible in matching
        const navigationSubSection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === contactNavigationConfig.type) return true;
          // Match by name
          if (sub.name === expectedNavigationSlug) return true;
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('contact') && sub.name.toLowerCase().includes('navigation')) return true;
          return false;
        });
        foundNavigationSubSection = !!navigationSubSection;

      } else {
        // Single object response - check if it's contact main or navigation
        if (sectionData.isMain === true && sectionData.name === expectedContactSlug) {
          foundMainSubSection = true;
          mainSubSection = sectionData;
        }
        
        // Check if it's a contact navigation subsection
        if (sectionData.type === contactNavigationConfig.type || 
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('contact') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true;
        }
      }
    }
    
    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data;
      
      if (Array.isArray(websiteData)) {
        // Find the main CONTACT subsection
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub => 
            sub.isMain === true && sub.name === expectedContactSlug
          );
          foundMainSubSection = !!mainSubSection;
        }

        // Check for navigation subsection - be more flexible in matching
        if (!foundNavigationSubSection) {
          const navigationSubSection = websiteData.find(sub => {
            // Match by type first (most reliable)
            if (sub.type === contactNavigationConfig.type) return true;
            // Match by name
            if (sub.name === expectedNavigationSlug) return true;
            // Match by partial name (in case of slug differences)
            if (sub.name && sub.name.toLowerCase().includes('contact') && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          foundNavigationSubSection = !!navigationSubSection;
        }

      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedContactSlug) {
          foundMainSubSection = true;
          mainSubSection = websiteData;
        }
        
        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === contactNavigationConfig.type || 
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('contact') && websiteData.name.toLowerCase().includes('navigation'))
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
    contactSectionConfig.name,
    contactNavigationConfig.name,
    contactNavigationConfig.type
  ]);

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    // Check if subsection has the correct name
    const expectedSlug = contactSectionConfig.name;
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

  // Updated button disabling logic - removed the contactItems.length check since we're now hiding instead
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);

  // Custom message for empty state with translations
  const emptyStateMessage = !contactSection && !sectionData 
    ? CONTACTS_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? CONTACTS_CONFIG.mainSectionRequiredMessage
      : CONTACTS_CONFIG.emptyStateMessage;

  // Components with translations
  const ContactTable = (
    <GenericTable
      columns={CONTACTS_COLUMNS}
      data={contactItems}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
      actionColumnHeader={t('contactPage.actions.edit', 'Actions')}
      emptyMessage={t('contactPage.messages.noData', 'No contacts available')}
      loading={isLoadingContactItems}
    />
  );

  const CreateDialog = (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('contactPage.dialogs.create.title', 'Contact')}
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
       <ClickableImage
              imageSrc="/assets/sections/contact.png"
              imageAlt={t('HeroManagement.tabLabel', 'Hero Section')}
              size="large"
              title={t('HeroManagement.tabLabel', 'Hero Section')}
              subtitle={t('HeroManagement.createSubtitle', 'Click to view full size')}
              t={t}
              priority
              className="w-full"
              previewClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl h-64 md:h-80 lg:h-96"
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
              sectionConfig={contactSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              sectionInfo={sectionInfoForNavigation}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              imageUrl ={"/assets/PartsOfSections/contact.png"}
            />
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            <CreateNavigationSubSection 
              sectionId={sectionId}
              sectionConfig={contactNavigationConfig}
              onSubSectionCreated={handleNavigationSubSectionCreated}
              onFormValidityChange={() => {/* We don't need to track form validity */}}
              sectionInfo={sectionInfoForNavigation}
            />
          </TabsContent>
        </Tabs>
      )}

       {/* Main list page with table and section integration */}
      <GenericListPage
        config={CONTACTS_CONFIG}
        sectionId={sectionId}
        sectionConfig={contactSectionConfig}
        isAddButtonDisabled={false}
        tableComponent={ContactTable}
        createDialogComponent={CreateDialog}
        showAddButton={shouldShowAddButton} // Only show button when we should
        onAddNew={shouldShowAddButton ? handleAddNew : () => {}} // Only pass handler when we should show button
        deleteDialogComponent={DeleteDialog}
        isLoading={isLoadingContactItems || isLoadingMainSubSection}
        emptyCondition={contactItems.length === 0}
        noSectionCondition={false}
        customEmptyMessage={emptyStateMessage}
      />
      
    </div>
  );
}