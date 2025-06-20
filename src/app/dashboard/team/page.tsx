// Fixed Team Page with Sub-Navigation Control and Proper State Loading
"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useSectionItems } from "@/src/hooks/webConfiguration/use-section-items"
import { useGenericList } from "@/src/hooks/useGenericList"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { CountBadgeCell, GenericTable, StatusCell, TruncatedCell } from "@/src/components/dashboard/MainSections/GenericTable"
import { GenericListPage } from "@/src/components/dashboard/MainSections/GenericListPage"
import DialogCreateSectionItem from "@/src/components/DialogCreateSectionItem"
import CreateMainSubSection from "@/src/utils/CreateMainSubSection"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { getTeamSectionConfig } from "./TeamSectionConfig"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Users, Navigation, Settings } from "lucide-react"
import { getTeamNavigationSectionConfig } from "../navigation/navigation-config"
import CreateNavigationSubSection from "../navigation/CreateNavigationSubSection"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Button } from "@/src/components/ui/button"
import { useToast } from "@/src/hooks/use-toast"
import { Badge } from "@/src/components/ui/badge"
import { Switch } from "@/src/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"

// Interface for sub-navigation items
interface SubNavigationItem {
  id: string;
  translations: Record<string, string>;
  url: string;
}

export default function Team() {
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const [hasMainSubSection, setHasMainSubSection] = useState<boolean>(false)
  const [hasNavigationSubSection, setHasNavigationSubSection] = useState<boolean>(false)
  const [isLoadingMainSubSection, setIsLoadingMainSubSection] = useState<boolean>(true)
  const [sectionData, setSectionData] = useState<any>(null)
  const [navigationSubsectionId, setNavigationSubsectionId] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [isSavingNavigation, setIsSavingNavigation] = useState<boolean>(false)
  const [isLoadingExistingNav, setIsLoadingExistingNav] = useState<boolean>(false)
  const [existingSubNavItems, setExistingSubNavItems] = useState<Set<string>>(new Set())
  const [navigationElements, setNavigationElements] = useState<any[]>([])
  
  // Sub-Navigation Control State
  const [enableSubNavigation, setEnableSubNavigation] = useState<boolean>(true)
  
  const { websiteId } = useWebsiteContext();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // Get translated configurations
  const teamSectionConfig = getTeamSectionConfig(i18n.language);
  const teamNavigationConfig = getTeamNavigationSectionConfig(i18n.language);

  // API Hooks
  const { useCreate: useCreateElement, useUpdate: useUpdateElement, useDelete: useDeleteElement } = useContentElements();
  const { useBulkUpsert: useBulkUpsertTranslations, useDelete: useDeleteTranslation } = useContentTranslations();
  const { useGetByWebsite: useGetAllLanguages } = useLanguages();
  
  const createElementMutation = useCreateElement();
  const updateElementMutation = useUpdateElement();
  const deleteElementMutation = useDeleteElement();
  const bulkUpsertTranslationsMutation = useBulkUpsertTranslations();
  const deleteTranslationMutation = useDeleteTranslation();

  // Get languages
  const { data: languagesData } = useGetAllLanguages(websiteId);
  const activeLanguages = languagesData?.data?.filter((lang: any) => lang.isActive) || [];
  const defaultLanguage = activeLanguages.find((lang: { isDefault: any }) => lang.isDefault) || activeLanguages[0];

  // Configuration
  const TEAM_CONFIG = {
    title: t('teamManagement.title'),
    description: t('teamManagement.description'),
    addButtonLabel: t('teamManagement.addButtonLabel'),
    emptyStateMessage: t('teamManagement.emptyStateMessage'),
    noSectionMessage: t('teamManagement.noSectionMessage'),
    mainSectionRequiredMessage: t('teamManagement.mainSectionRequiredMessage'),
    emptyFieldsMessage: t('teamManagement.emptyFieldsMessage'),
    sectionIntegrationTitle: t('teamManagement.sectionIntegrationTitle'),
    sectionIntegrationDescription: t('teamManagement.sectionIntegrationDescription'),
    addSectionButtonLabel: t('teamManagement.addSectionButtonLabel'),
    editSectionButtonLabel: t('teamManagement.editSectionButtonLabel'),
    saveSectionButtonLabel: t('teamManagement.saveSectionButtonLabel'),
    listTitle: t('teamManagement.listTitle'),
    editPath: "team/addTeam"
  };

  // Use the generic list hook
  const {
    section: teamSection,
    items: teamItems,
    isLoadingItems: isLoadingTeamItems,
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
    editPath: TEAM_CONFIG.editPath
  })

  // Check subsections logic
  const { useGetMainByWebSiteId, useGetBySectionId } = useSubSections()
  
  const {
    data: mainSubSectionData,
    isLoading: isLoadingCompleteSubsections,
    refetch: refetchMainSubSection
  } = useGetMainByWebSiteId(websiteId)

  const {
    data: sectionSubsections,
    isLoading: isLoadingSectionSubsections
  } = useGetBySectionId(sectionId || "")

  // Generate dynamic URL for team item
  const generateTeamItemUrl = (itemId: string) => {
    return `https://idigitek-client-dynamic.vercel.app/Pages/ServiceDetailsPage/${itemId}`;
  };

  // Load existing sub-navigation items using the sectionSubsections data
  const loadExistingSubNavItems = useCallback(() => {
    if (!navigationSubsectionId || !sectionSubsections?.data) return;

    setIsLoadingExistingNav(true);
    console.log('Loading existing sub-navigation items for subsection:', navigationSubsectionId);
    
    try {
      // Find the navigation subsection and get its elements
      let navSubsection = null;
      const sectionData = sectionSubsections.data;
      
      if (Array.isArray(sectionData)) {
        navSubsection = sectionData.find((sub: any) => sub._id === navigationSubsectionId);
      } else if (sectionData._id === navigationSubsectionId) {
        navSubsection = sectionData;
      }
      
      if (navSubsection && navSubsection.elements) {
        console.log('Found navigation subsection with elements:', navSubsection.elements.length);
        
        // Filter for sub-navigation elements
        const subNavElements = navSubsection.elements.filter((el: any) => 
          el.metadata?.isSubNavigation && el.metadata?.fieldType === 'title'
        );
        
        console.log('Found sub-navigation elements:', subNavElements.length);
        
        setNavigationElements(navSubsection.elements);
        
        // Extract team item IDs from the sub-navigation elements
        const teamItemIds = new Set<string>();
        
        subNavElements.forEach((element: any) => {
          console.log('Processing element:', element.name);
          
          // The element name pattern is: SubNav_subnav_{teamItemId}_Title
          const nameMatch = element.name.match(/SubNav_subnav_([^_]+)_Title/);
          if (nameMatch && nameMatch[1]) {
            console.log('Extracted team item ID from name:', nameMatch[1]);
            teamItemIds.add(nameMatch[1]);
          }
          
          // Also check metadata for sourceItemId if available
          if (element.metadata?.sourceItemId) {
            console.log('Found sourceItemId in metadata:', element.metadata.sourceItemId);
            teamItemIds.add(element.metadata.sourceItemId);
          }
        });
        
        console.log('Final team item IDs:', Array.from(teamItemIds));
        
        setExistingSubNavItems(teamItemIds);
        setCheckedItems(teamItemIds);
        
        if (teamItemIds.size > 0) {
          toast({
            title: "Navigation State Loaded",
            description: `${teamItemIds.size} items found in navigation`,
            duration: 3000
          });
        }
      } else {
        console.log('No navigation subsection or elements found');
        setExistingSubNavItems(new Set());
        setCheckedItems(new Set());
      }
    } catch (error) {
      console.error('Error loading existing sub-navigation items:', error);
      setExistingSubNavItems(new Set());
      setCheckedItems(new Set());
    } finally {
      setIsLoadingExistingNav(false);
    }
  }, [navigationSubsectionId, sectionSubsections, toast]);

  // Clean up existing sub-navigation elements before creating new ones
  const cleanupExistingSubNavigation = useCallback(async () => {
    if (navigationElements.length === 0) return;

    try {
      // Filter for sub-navigation elements
      const subNavElements = navigationElements.filter((el: any) => 
        el.metadata?.isSubNavigation || el.name?.startsWith('SubNav_')
      );

      console.log('Cleaning up existing sub-navigation elements:', subNavElements.length);

      for (const element of subNavElements) {
        // Delete translations first if they exist
        if (element.translations && Array.isArray(element.translations)) {
          for (const translation of element.translations) {
            try {
              await deleteTranslationMutation.mutateAsync(translation._id);
            } catch (error) {
              console.warn(`Failed to delete translation ${translation._id}:`, error);
            }
          }
        }

        // Delete element
        try {
          await deleteElementMutation.mutateAsync(element._id);
        } catch (error) {
          console.warn(`Failed to delete element ${element._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up existing sub-navigation:', error);
      throw error;
    }
  }, [navigationElements, deleteElementMutation, deleteTranslationMutation]);

  // Handle checkbox change with visual feedback
  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    console.log('Checkbox changed:', { itemId, checked });
    
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
        toast({
          title: "Added to Navigation",
          description: "Item added to navigation selection",
          duration: 2000
        });
      } else {
        newSet.delete(itemId);
        toast({
          title: "Removed from Navigation", 
          description: "Item removed from navigation selection",
          duration: 2000
        });
      }
      
      console.log('New checked items:', Array.from(newSet));
      return newSet;
    });
  };

  // Convert checked team items to SubNavigationItem format
  const convertTeamItemsToSubNavItems = useCallback((): SubNavigationItem[] => {
    const checkedTeamItems = teamItems.filter((item: any) => checkedItems.has(item._id));
    
    return checkedTeamItems.map((item: any) => {
      // Create translations object for all languages
      const translations: Record<string, string> = {};
      activeLanguages.forEach(lang => {
        if (lang && lang.languageID) {
          translations[lang.languageID] = item.name;
        }
      });

      return {
        id: `subnav_${item._id}`,
        translations,
        url: generateTeamItemUrl(item._id)
      };
    });
  }, [teamItems, checkedItems, activeLanguages]);

  // Save sub-navigation items
  const saveSubNavItems = useCallback(async () => {
    if (!navigationSubsectionId || activeLanguages.length === 0) {
      toast({
        title: "Error",
        description: "Navigation section not found or no languages available",
        variant: "destructive"
      });
      return;
    }

    setIsSavingNavigation(true);

    try {
      // First cleanup existing sub-navigation elements
      await cleanupExistingSubNavigation();

      // Convert checked items to SubNavigationItem format
      const subNavItems = convertTeamItemsToSubNavItems();
      
      if (subNavItems.length === 0) {
        toast({
          title: "Success",
          description: "Navigation cleared - all items removed from navigation",
        });
        
        // Update the existing items to reflect cleared state
        setExistingSubNavItems(new Set());
        setNavigationElements([]);
        setIsSavingNavigation(false);
        return;
      }

      // Create new sub-navigation elements
      for (const item of subNavItems) {
        const hasContent = item.translations && Object.values(item.translations).some(title => title && title.trim());
        if (!hasContent) continue;
        
        // Create title element
        const titleElementData = {
          name: `SubNav_${item.id}_Title`,
          displayName: `${teamNavigationConfig.subNavigation?.titleElement || 'SubNavTitle'} ${item.id}`,
          type: 'text',
          parent: navigationSubsectionId,
          isActive: true,
          order: 0,
          defaultContent: item.translations[defaultLanguage?.languageID] || '',
          metadata: {
            isSubNavigation: true,
            subNavId: item.id,
            fieldType: 'title'
          }
        };
        
        const titleElementResponse = await createElementMutation.mutateAsync(titleElementData);
        const titleElement = titleElementResponse.data;
        
        // Create URL element
        const urlElementData = {
          name: `SubNav_${item.id}_URL`,
          displayName: `${teamNavigationConfig.subNavigation?.urlElement || 'SubNavURL'} ${item.id}`,
          type: 'text',
          parent: navigationSubsectionId,
          isActive: true,
          order: 1,
          defaultContent: item.url || '',
          metadata: {
            isSubNavigation: true,
            subNavId: item.id,
            fieldType: 'url'
          }
        };
        
        const urlElementResponse = await createElementMutation.mutateAsync(urlElementData);
        const urlElement = urlElementResponse.data;
        
        // Create translations for title (all languages)
        const titleTranslations = activeLanguages
          .filter((lang: { languageID: any; _id: any }) => lang && lang.languageID && lang._id)
          .map((lang: { languageID: string | number; _id: any }) => ({
            content: item.translations[lang.languageID] || '',
            language: lang._id,
            contentElement: titleElement._id,
            isActive: true
          }));
        
        if (titleTranslations.length > 0) {
          await bulkUpsertTranslationsMutation.mutateAsync(titleTranslations);
        }
        
        // Create translation for URL (default language only)
        if (item.url && defaultLanguage) {
          const urlTranslation = {
            content: item.url,
            language: defaultLanguage._id,
            contentElement: urlElement._id,
            isActive: true
          };
          
          await bulkUpsertTranslationsMutation.mutateAsync([urlTranslation]);
        }
      }
      
      // Update existing items to reflect what was saved (including empty state)
      const savedItemIds = Array.from(checkedItems);
      setExistingSubNavItems(new Set(savedItemIds));
      
      toast({
        title: "Success",
        description: `Sub-navigation updated successfully (${subNavItems.length} items)`,
      });
      
    } catch (error) {
      console.error("Error saving sub-navigation items:", error);
      toast({
        title: "Error",
        description: "Failed to save sub-navigation items",
        variant: "destructive"
      });
    } finally {
      setIsSavingNavigation(false);
    }
  }, [
    navigationSubsectionId,
    activeLanguages,
    defaultLanguage,
    teamNavigationConfig,
    createElementMutation,
    bulkUpsertTranslationsMutation,
    convertTeamItemsToSubNavItems,
    checkedItems,
    cleanupExistingSubNavigation,
    toast
  ]);

  // Enhanced team table columns with conditional checkbox
  const TEAM_COLUMNS = [
    // Only show checkbox column if sub-navigation is enabled
    ...(enableSubNavigation ? [{
      header: () => (
        <div className="flex items-center space-x-2">
          <span>Add to Navigation</span>
          {checkedItems.size > 0 && (
            <Badge variant="secondary" className="ml-2">
              {checkedItems.size} selected
            </Badge>
          )}
          {hasChanges() && (
            <Badge variant="outline" className="ml-2 border-orange-500 text-orange-600">
              Changes pending
            </Badge>
          )}
        </div>
      ),
      accessor: "_id",
      cell: (item: any) => {
        const isChecked = checkedItems.has(item._id);
        const isInExisting = existingSubNavItems.has(item._id);
        
        return (
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckboxChange(item._id, checked as boolean)}
                disabled={!hasNavigationSubSection || isLoadingExistingNav}
                className={isChecked ? "border-green-500 data-[state=checked]:bg-green-500" : ""}
              />
              {isChecked && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Selected
                </span>
              )}
              {isInExisting && !isChecked && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  In Nav
                </span>
              )}
            </div>
          </div>
        );
      },
      className: "w-40 text-center"
    }] : []),
    {
      header: t('teamManagement.name'),
      accessor: "name",
      className: "font-medium",
      cell: (item: any, value: string) => (
        <div className="flex items-center space-x-2">
          <span>{value}</span>
          {enableSubNavigation && checkedItems.has(item._id) && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
              Selected for Nav
            </Badge>
          )}
          {enableSubNavigation && existingSubNavItems.has(item._id) && !checkedItems.has(item._id) && (
            <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
              In Navigation
            </Badge>
          )}
        </div>
      )
    },
    {
      header: t('teamManagement.description'),
      accessor: "description",
      cell: TruncatedCell
    },
    // Only show Dynamic URL column if sub-navigation is enabled
    ...(enableSubNavigation ? [{
      header: "Dynamic URL",
      accessor: "_id",
      cell: (item: any) => (
        <div className="text-xs text-blue-600 dark:text-blue-400 max-w-64 truncate" title={generateTeamItemUrl(item._id)}>
          {generateTeamItemUrl(item._id)}
        </div>
      )
    }] : []),
    {
      header: t('teamManagement.status'),
      accessor: "isActive",
      cell: (item: any, value: boolean) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            {StatusCell(item, value)}
            {item.isMain && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t('teamManagement.main')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('teamManagement.order'),
      accessor: "order"
    },
    {
      header: t('teamManagement.subsections'),
      accessor: "subsections.length",
      cell: CountBadgeCell
    }
  ];

  // Load existing navigation state
  useEffect(() => {
    if (!isLoadingCompleteSubsections && !isLoadingSectionSubsections) {
      let foundMainSubSection = false;
      let foundNavigationSubSection = false;
      let mainSubSection = null;
      let navSubsectionId = null;
      
      const expectedTeamSlug = teamSectionConfig.name;
      const expectedNavigationSlug = teamNavigationConfig.name;
      
      // Check section-specific subsections first
      if (sectionId && sectionSubsections?.data) {
        const sectionData = sectionSubsections.data;
        
        if (Array.isArray(sectionData)) {
          mainSubSection = sectionData.find(sub => 
            sub.isMain === true && sub.name === expectedTeamSlug
          );
          foundMainSubSection = !!mainSubSection;

          const navigationSubSection = sectionData.find(sub => {
            if (sub.type === teamNavigationConfig.type) return true;
            if (sub.name === expectedNavigationSlug) return true;
            if (sub.name && sub.name.toLowerCase().includes('navigation')) return true;
            return false;
          });
          
          if (navigationSubSection) {
            foundNavigationSubSection = true;
            navSubsectionId = navigationSubSection._id;
          }
        }
      }
      
      // Fallback to website-wide data
      if ((!foundMainSubSection || !foundNavigationSubSection) && mainSubSectionData?.data) {
        const websiteData = mainSubSectionData.data;
        
        if (Array.isArray(websiteData)) {
          if (!foundMainSubSection) {
            mainSubSection = websiteData.find(sub => 
              sub.isMain === true && sub.name === expectedTeamSlug
            );
            foundMainSubSection = !!mainSubSection;
          }

          if (!foundNavigationSubSection) {
            const navigationSubSection = websiteData.find(sub => {
              if (sub.type === teamNavigationConfig.type) return true;
              if (sub.name === expectedNavigationSlug) return true;
              if (sub.name && sub.name.toLowerCase().includes('navigation')) return true;
              return false;
            });
            
            if (navigationSubSection) {
              foundNavigationSubSection = true;
              navSubsectionId = navigationSubSection._id;
            }
          }
        }
      }
      
      setHasMainSubSection(foundMainSubSection);
      setHasNavigationSubSection(foundNavigationSubSection);
      setNavigationSubsectionId(navSubsectionId);
      setIsLoadingMainSubSection(false);
      
      if (foundMainSubSection && mainSubSection && mainSubSection.section) {
        const sectionInfo = typeof mainSubSection.section === 'string' 
          ? { _id: mainSubSection.section } 
          : mainSubSection.section;
        
        setSectionData(sectionInfo);
        
        if (teamSection === null) {
          setSection(sectionInfo);
        }
      }
    }
  }, [
    mainSubSectionData, 
    sectionSubsections, 
    isLoadingCompleteSubsections, 
    isLoadingSectionSubsections, 
    sectionId, 
    teamSection, 
    setSection,
    teamSectionConfig.name,
    teamNavigationConfig.name,
    teamNavigationConfig.type
  ]);

  // Load existing sub-navigation items when navigation subsection is available
  useEffect(() => {
    if (navigationSubsectionId && hasNavigationSubSection && sectionSubsections?.data && enableSubNavigation) {
      loadExistingSubNavItems();
    }
  }, [navigationSubsectionId, hasNavigationSubSection, sectionSubsections, loadExistingSubNavItems, enableSubNavigation]);

  // Event handlers
  const handleMainSubSectionCreated = (subsection: any) => {
    const expectedSlug = teamSectionConfig.name;
    const hasCorrectSlug = subsection.name === expectedSlug;
    
    setHasMainSubSection(subsection.isMain === true && hasCorrectSlug);
    
    if (subsection.section) {
      const sectionInfo = typeof subsection.section === 'string' 
        ? { _id: subsection.section } 
        : subsection.section;
        
      setSectionData(sectionInfo);
      setSection(sectionInfo);
    }
    
    if (refetchMainSubSection) {
      refetchMainSubSection();
    }
  };

  const handleNavigationSubSectionCreated = (subsection: any) => {
    const expectedSlug = teamNavigationConfig.name;
    const expectedType = teamNavigationConfig.type;
    const hasCorrectIdentifier = (
      subsection.name === expectedSlug || 
      subsection.type === expectedType ||
      (subsection.name && subsection.name.toLowerCase().includes('navigation'))
    );
    
    setHasNavigationSubSection(hasCorrectIdentifier);
    
    if (hasCorrectIdentifier) {
      setNavigationSubsectionId(subsection._id);
    }
    
    if (refetchMainSubSection) {
      setTimeout(() => {
        refetchMainSubSection();
      }, 1000);
    }
  };

  const isAddButtonDisabled: boolean = 
    Boolean(defaultAddButtonDisabled) || 
    isLoadingMainSubSection ||
    (Boolean(sectionId) && !hasMainSubSection);
  
  const emptyStateMessage = !teamSection && !sectionData 
    ? TEAM_CONFIG.noSectionMessage 
    : (!hasMainSubSection && !isLoadingMainSubSection && sectionId)
      ? TEAM_CONFIG.mainSectionRequiredMessage
      : TEAM_CONFIG.emptyStateMessage;

  // Check if there are changes compared to existing state
  const hasChanges = useCallback(() => {
    // Convert Sets to arrays for comparison
    const currentItems = Array.from(checkedItems).sort();
    const existingItems = Array.from(existingSubNavItems).sort();
    
    // Compare arrays
    return JSON.stringify(currentItems) !== JSON.stringify(existingItems);
  }, [checkedItems, existingSubNavItems]);

  // Clear all selections
  const clearAllSelections = () => {
    setCheckedItems(new Set());
    toast({
      title: "Selections Cleared",
      description: "All navigation selections have been cleared. Click 'Save Navigation' to apply changes.",
      duration: 3000
    });
  };

  // Sub-Navigation Control Component
  const SubNavigationControl = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Sub-Navigation Settings
        </CardTitle>
        <CardDescription>
          Control whether to show sub-navigation management features for team items.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3">
          <Switch
            id="enable-sub-navigation"
            checked={enableSubNavigation}
            onCheckedChange={setEnableSubNavigation}
          />
          <div className="flex flex-col">
            <label htmlFor="enable-sub-navigation" className="text-sm font-medium cursor-pointer">
              Enable Sub-Navigation Management
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {enableSubNavigation 
                ? "Users can add team items to navigation menu" 
                : "Sub-navigation features are hidden"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Components
  const TeamTable = (
    <div className="space-y-4">
      {/* Sub-Navigation Control */}
      <SubNavigationControl />

      {/* Loading indicator for existing navigation - only show if sub-nav is enabled */}
      {enableSubNavigation && isLoadingExistingNav && (
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Loading existing navigation items...
            </span>
          </div>
        </div>
      )}

      {/* Selection summary - show if sub-nav is enabled AND there are changes */}
      {enableSubNavigation && hasChanges() && (
        <div className={`border rounded-lg p-4 ${
          checkedItems.size === 0 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {checkedItems.size === 0 ? (
                <>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    All items will be removed from navigation
                  </Badge>
                  <span className="text-sm text-red-700 dark:text-red-300">
                    Click "Clear Navigation" to apply changes
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {checkedItems.size} items selected for navigation
                  </Badge>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Ready to save to navigation menu
                  </span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllSelections}
              className={`${
                checkedItems.size === 0 
                  ? 'text-gray-600 border-gray-300 hover:bg-gray-100' 
                  : 'text-blue-600 border-blue-300 hover:bg-blue-100'
              }`}
              disabled={checkedItems.size === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      <GenericTable
        columns={TEAM_COLUMNS}
        data={teamItems}
        onEdit={handleEdit}
        onDelete={showDeleteDialog}
      />
      
      {/* Save button - show if sub-nav is enabled AND there are changes */}
      {enableSubNavigation && hasNavigationSubSection && hasChanges() && (
        <div className="flex justify-end">
          <Button 
            onClick={saveSubNavItems}
            disabled={isSavingNavigation}
            className={`flex items-center ${checkedItems.size === 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isSavingNavigation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Navigation...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                {checkedItems.size === 0 
                  ? 'Clear Navigation (Remove All)' 
                  : `Save Navigation (${checkedItems.size} items)`}
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Warning message - only show if sub-nav is enabled */}
      {enableSubNavigation && !hasNavigationSubSection && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Create the navigation configuration first to enable automatic sub-navigation management.
          </p>
        </div>
      )}
    </div>
  );

  const CreateDialog = (
    <DialogCreateSectionItem
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
      sectionId={sectionId || ""}
      onServiceCreated={handleItemCreated}
      title={t('teamManagement.team')}
    />
  );

  const DeleteDialog = (
    <DeleteSectionDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      serviceName={itemToDelete?.name || ""}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
      title={t('teamManagement.deleteTeamItem')}
      confirmText={t('teamManagement.confirm')}
    />
  );

  return (
    <div className="space-y-6">
      <GenericListPage
        config={TEAM_CONFIG}
        sectionId={sectionId}
        sectionConfig={teamSectionConfig}
        isAddButtonDisabled={isAddButtonDisabled}
        tableComponent={TeamTable}
        createDialogComponent={CreateDialog}
        deleteDialogComponent={DeleteDialog}
        onAddNew={handleAddNew}
        isLoading={isLoadingTeamItems || isLoadingMainSubSection}
        emptyCondition={teamItems.length === 0}
        noSectionCondition={!teamSection && !sectionData}
        customEmptyMessage={emptyStateMessage}
      />
      
      {sectionId && (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Users size={16} />
              Content Configuration
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation size={16} />
              Navigation Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <CreateMainSubSection 
              sectionId={sectionId}
              sectionConfig={teamSectionConfig}
              onSubSectionCreated={handleMainSubSectionCreated}
              onFormValidityChange={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            <CreateNavigationSubSection 
              sectionId={sectionId}
              sectionConfig={teamNavigationConfig}
              onSubSectionCreated={handleNavigationSubSectionCreated}
              onFormValidityChange={() => {}}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}