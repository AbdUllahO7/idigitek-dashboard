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
import { getHeroSectionConfig } from "./HeroSectionConfig"
import { useTranslation } from "react-i18next"
import CreateNavigationSubSection from "../team/navigation/CreateNavigationSubSection"
import { getTeamNavigationSectionConfig } from "../team/navigation/team-navigation-config"
import { ClickableImage } from "@/src/components/ClickableImage"
import { useSections } from "@/src/hooks/webConfiguration/use-section"
import { add } from "date-fns"

// Column definitions with translation support
const getHeroColumns = (t: any) => [
  {
    header: t('servicesPage.table.columns.name', 'Name'),
    accessor: "name",
    className: "font-medium"
  },
  {
    header: t('servicesPage.table.columns.description', 'Description'),
    accessor: "description",
    cell: TruncatedCell
  },
  {
    header: t('servicesPage.table.columns.status', 'Status'),
    accessor: "isActive",
    cell: (item: any, value: boolean) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {StatusCell(item, value)}
          {item.isMain && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {t('servicesPage.table.badges.main', 'Main')}
            </span>
          )}
        </div>
      </div>
    )
  },
  {
    header: t('servicesPage.table.columns.order', 'Order'),
    accessor: "order"
  },
  {
    header: t('servicesPage.table.columns.subsections', 'Subsections'),
    accessor: "subsections.length",
    cell: CountBadgeCell
  }
]

export default function HeroPage() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const { websiteId } = useWebsiteContext()
  const { t, i18n } = useTranslation()
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)
  const NavigationConfig = getTeamNavigationSectionConfig(i18n.language)
  
  const {useGetBasicInfoByWebsiteId} = useSections()
  const { data: basicInfo } = useGetBasicInfoByWebsiteId(websiteId)
  
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

  // Use the generic list hook for Hero management
  const {
    section: heroSection,
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
    editPath: "heroSection/addHero"
  })

  // Determine if we should show the add button (hide it when items exist)
  const shouldShowAddButton = navItems.length === 0;

  // Memoized configuration for the Hero page with translations
  // Only include addButtonLabel when we should show the add button
  const Hero_CONFIG = useMemo(() => {
    const baseConfig = {
      title: t('HeroManagement.tabLabel', 'Hero Management'),
      description: t('HeroManagement.createSubtitle', 'Manage your hero inventory and multilingual hero content'),
      emptyStateMessage: t('HeroManagement.errorMessage', 'No hero found. Create your first hero by clicking the "Add New Hero" button.'),
      noSectionMessage: t('HeroManagement.createSubtitle', 'Please create a hero section first before adding hero.'),
      mainSectionRequiredMessage: t('HeroManagement.editSubtitleDefault', 'Please enter your main section data before adding hero.'),
      emptyFieldsMessage: t('HeroManagement.errorMessage', 'Please complete all required fields in the main section before adding hero.'),
      sectionIntegrationTitle: t('HeroManagement.formSections.hero', 'Hero Section Management'),
      sectionIntegrationDescription: t('HeroManagement.editSubtitleDefault', 'Manage your hero section content in multiple languages.'),
      addSectionButtonLabel: t('HeroManagement.createTitle', 'Add Hero Section'),
      editSectionButtonLabel: t('HeroManagement.editTitle', 'Edit Hero Section'),
      saveSectionButtonLabel: t('HeroManagement.savedMessage', 'Save Hero Section'),
      listTitle: t('HeroManagement.backToList', 'Hero List'),
      editPath: "heroSection/addHero",
      addButtonLabel: '',
    };

    // Only add addButtonLabel if no items exist (this helps hide the button)
    if (shouldShowAddButton) {
      baseConfig.addButtonLabel = t('HeroManagement.createTitle', 'Add New Hero');
    }

    return baseConfig;
  }, [t, shouldShowAddButton]);

  // Get translated column definitions
  const Hero_COLUMNS = useMemo(() => getHeroColumns(t), [t])
  
  // Refs to track previous values for debugging
  const prevHasMainSubSection = useRef(hasMainSubSection)
  const isFirstRender = useRef(true)

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

  const currentLanguage = i18n.language // 'en', 'ar', 'tr'
  const heroSectionConfig = getHeroSectionConfig(currentLanguage)

  // Debug changes in hasMainSubSection
  useEffect(() => {
    prevHasMainSubSection.current = hasMainSubSection
    if (isFirstRender.current) {
      isFirstRender.current = false
    }
  }, [hasMainSubSection])

  // Determine if main subsection exists when data loads & set section data if needed
  useEffect(() => {
    // First check if we are still loading
    if (isLoadingCompleteSubsections || (sectionId && isLoadingSectionSubsections)) {
      setIsLoadingMainSubSection(true)
      return
    }

    // We're done loading, now check the data
    let foundMainSubSection = false
    let foundNavigationSubSection = false
    let mainSubSection = null

    // Use Hero configurations
    const expectedHeroSlug = heroSectionConfig.name
    const expectedNavigationSlug = NavigationConfig.name

    // If we have a sectionId, prioritize checking the section-specific subsections
    if (sectionId && sectionSubsections?.data) {
      const sectionData = sectionSubsections.data

      if (Array.isArray(sectionData)) {
        // Find the main Hero subsection
        mainSubSection = sectionData.find(sub =>
          sub.isMain === true && sub.name === expectedHeroSlug
        )
        foundMainSubSection = !!mainSubSection

        // Check for navigation subsection - be more flexible in matching
        const navigationSubSection = sectionData.find(sub => {
          // Match by type first (most reliable)
          if (sub.type === NavigationConfig.type) return true
          // Match by name
          if (sub.name === expectedNavigationSlug) return true
          // Match by partial name (in case of slug differences)
          if (sub.name && sub.name.toLowerCase().includes('hero') && sub.name.toLowerCase().includes('navigation')) return true
          return false
        })
        foundNavigationSubSection = !!navigationSubSection
      } else {
        // Single object response - check if it's hero main or navigation
        if (sectionData.isMain === true && sectionData.name === expectedHeroSlug) {
          foundMainSubSection = true
          mainSubSection = sectionData
        }

        // Check if it's a hero navigation subsection
        if (sectionData.type === NavigationConfig.type ||
            sectionData.name === expectedNavigationSlug ||
            (sectionData.name && sectionData.name.toLowerCase().includes('hero') && sectionData.name.toLowerCase().includes('navigation'))) {
          foundNavigationSubSection = true
        }
      }
    }

    // If we didn't find anything in the section-specific data, check the website-wide data
    if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
      const websiteData = mainSubSectionData.data

      if (Array.isArray(websiteData)) {
        // Find the main Hero subsection
        if (!foundMainSubSection) {
          mainSubSection = websiteData.find(sub =>
            sub.isMain === true && sub.name === expectedHeroSlug
          )
          foundMainSubSection = !!mainSubSection
        }

        // Check for navigation subsection - be more flexible in matching
        if (!foundNavigationSubSection) {
          const navigationSubSection = websiteData.find(sub => {
            // Match by type first (most reliable)
            if (sub.type === NavigationConfig.type) return true
            // Match by name
            if (sub.name === expectedNavigationSlug) return true
            // Match by partial name (in case of slug differences)
            if (sub.name && sub.name.toLowerCase().includes('hero') && sub.name.toLowerCase().includes('navigation')) return true
            return false
          })
          foundNavigationSubSection = !!navigationSubSection
        }
      } else {
        // Single object response - check what type it is
        if (!foundMainSubSection && websiteData.isMain === true && websiteData.name === expectedHeroSlug) {
          foundMainSubSection = true
          mainSubSection = websiteData
        }

        // Check if it's a navigation subsection
        if (!foundNavigationSubSection && (
          websiteData.type === NavigationConfig.type ||
          websiteData.name === expectedNavigationSlug ||
          (websiteData.name && websiteData.name.toLowerCase().includes('hero') && websiteData.name.toLowerCase().includes('navigation'))
        )) {
          foundNavigationSubSection = true
        }
      }
    }

    setHasMainSubSection(foundMainSubSection)
    setHasNavigationSubSection(foundNavigationSubSection)
    setIsLoadingMainSubSection(false)

    // Extract section data from the main subsection if we found one
    if (foundMainSubSection && mainSubSection && mainSubSection.section) {
      const sectionInfo = typeof mainSubSection.section === 'string'
        ? { _id: mainSubSection.section }
        : mainSubSection.section

      // Set local section data
      setSectionData(sectionInfo)

      // Update the heroSection in useGenericList hook if not already set
      if (heroSection === null) {
        setSection(sectionInfo)
      }
    }

  }, [
    mainSubSectionData,
    sectionSubsections,
    isLoadingCompleteSubsections,
    isLoadingSectionSubsections,
    sectionId,
    heroSection,
    setSection,
    heroSectionConfig.name,
    NavigationConfig.name,
    NavigationConfig.type
  ])

  // Handle navigation subsection creation
  const handleNavigationSubSectionCreated = (subsection: any) => {
    // Check if subsection has the correct name or type for Hero
    const expectedSlug = NavigationConfig.name
    const expectedType = NavigationConfig.type
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug ||
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('hero') && subsection.name.toLowerCase().includes('navigation'))
    )

    // Set that we have a navigation subsection now
    setHasNavigationSubSection(hasCorrectIdentifier)

    // Force refetch of all subsection data
    if (refetchMainSubSection) {
      setTimeout(() => {
        refetchMainSubSection()
      }, 1000) // Give it a bit more time to ensure data is saved
    }
  }

  // Handle main subsection creation
  const handleMainSubSectionCreated = (subsection: any) => {
    // Check if subsection has the correct name
    const expectedName = heroSectionConfig.subSectionName
    const hasCorrectName = subsection.name === expectedName

    // Set that we have a main subsection now (only if it also has the correct name)
    setHasMainSubSection(subsection.isMain === true && hasCorrectName)

    // If we have section data from the subsection, update it
    if (subsection.section) {
      const sectionInfo = typeof subsection.section === 'string'
        ? { _id: subsection.section }
        : subsection.section

      setSectionData(sectionInfo)
      setSection(sectionInfo)
    }

    // Refetch the main subsection data to ensure we have the latest
    if (refetchMainSubSection) {
      refetchMainSubSection()
    }
  }

  // Updated button disabling logic - removed the navItems.length check since we're now hiding instead
  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);

  // Custom message for empty state
  const emptyStateMessage = !heroSection && !sectionData
    ? Hero_CONFIG.noSectionMessage
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? Hero_CONFIG.mainSectionRequiredMessage
      : Hero_CONFIG.emptyStateMessage

  // Components
  const NavItemsTable = (
    <GenericTable
      columns={Hero_COLUMNS}
      data={navItems}
      onEdit={handleEdit}
      onDelete={showDeleteDialog}
    />
  )

  const CreateDialog = (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('HeroManagement.tabLabel')}
    />
  )

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('HeroManagement.tabLabel')}
      confirmText="Confirm"
    />
  )

  return (
    <div className="space-y-6">
      {/* Hero Image Section */}
      <ClickableImage
        imageSrc="/assets/sections/hero.png"
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
        config={Hero_CONFIG}
        sectionId={sectionId}
        sectionConfig={heroSectionConfig}
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

     

      {/* Navigation subsection management (only shown when section exists) */}
      {sectionId && (
        <CreateNavigationSubSection
          sectionId={sectionId}
          sectionConfig={NavigationConfig}
          sectionInfo={sectionInfoForNavigation}
          onSubSectionCreated={handleNavigationSubSectionCreated}
          onFormValidityChange={() => {/* We don't need to track form validity */}}
        />
      )}
    </div>
  )
}