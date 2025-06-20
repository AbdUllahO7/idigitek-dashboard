"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Link, Globe, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/hooks/use-toast";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { useTranslation } from "react-i18next";

interface SubNavigationItem {
  id: string;
  translations: Record<string, string>; // languageID -> title
  url: string;
}

interface SubNavigationManagerProps {
  subsectionId: string;
  languages: any[];
  sectionConfig: any;
  existingElements?: any[];
  existingTranslations?: Record<string, any[]>;
  onSubNavigationChange?: (items: SubNavigationItem[], shouldRefresh?: boolean) => void;
}

export const SubNavigationManager = ({
  subsectionId,
  languages,
  sectionConfig,
  existingElements = [],
  existingTranslations = {},
  onSubNavigationChange
}: SubNavigationManagerProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // State
  const [subNavItems, setSubNavItems] = useState<SubNavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  
  // API Hooks
  const { useCreate: useCreateElement, useUpdate: useUpdateElement, useDelete: useDeleteElement } = useContentElements();
  const { useBulkUpsert: useBulkUpsertTranslations, useDelete: useDeleteTranslation } = useContentTranslations();
  
  const createElementMutation = useCreateElement();
  const updateElementMutation = useUpdateElement();
  const deleteElementMutation = useDeleteElement();
  const bulkUpsertTranslationsMutation = useBulkUpsertTranslations();
  const deleteTranslationMutation = useDeleteTranslation();

  const defaultLanguage = languages.find(lang => lang.isDefault) || languages[0];

  // Initialize sub-navigation items from existing elements
  useEffect(() => {
    if (existingElements.length > 0 && languages.length > 0) {
      // Filter sub-navigation elements (they should have metadata indicating they're sub-nav)
      const subNavElements = existingElements.filter(el => 
        el.metadata?.isSubNavigation || 
        el.name?.startsWith('SubNav_') ||
        el.type === 'subnav'
      );
      
      // Group elements by sub-navigation item (title and url pairs)
      const groupedItems: Record<string, { titleElement?: any, urlElement?: any }> = {};
      
      subNavElements.forEach(element => {
        const itemId = element.metadata?.subNavId || element.name?.split('_')[1] || 'default';
        if (!groupedItems[itemId]) {
          groupedItems[itemId] = {};
        }
        
        if (element.name?.includes('Title') || element.metadata?.fieldType === 'title') {
          groupedItems[itemId].titleElement = element;
        } else if (element.name?.includes('URL') || element.metadata?.fieldType === 'url') {
          groupedItems[itemId].urlElement = element;
        }
      });
      
      // Convert to SubNavigationItem array
      const items: SubNavigationItem[] = Object.entries(groupedItems).map(([itemId, elements]) => {
        const titleTranslations = elements.titleElement ? existingTranslations[elements.titleElement._id] || [] : [];
        const urlTranslations = elements.urlElement ? existingTranslations[elements.urlElement._id] || [] : [];
        
        // Build translations object for all languages
        const translations: Record<string, string> = {};
        languages.forEach(lang => {
          if (lang && lang.languageID && lang._id) {
            const titleTranslation = titleTranslations.find(t => 
              (typeof t.language === 'string' && t.language === lang._id) ||
              (t.language && t.language._id === lang._id)
            );
            translations[lang.languageID] = titleTranslation?.content || elements.titleElement?.defaultContent || '';
          }
        });
        
        // URL is only in default language
        const defaultUrlTranslation = urlTranslations.find(t => 
          (typeof t.language === 'string' && t.language === defaultLanguage?._id) ||
          (t.language && t.language._id === defaultLanguage?._id)
        );
        
        return {
          id: itemId,
          translations,
          url: defaultUrlTranslation?.content || elements.urlElement?.defaultContent || ''
        };
      });
      
      setSubNavItems(items);
      
      // Set default expanded state for existing items (collapsed by default)
      const expandedState: Record<string, boolean> = {};
      items.forEach(item => {
        expandedState[item.id] = false; // Start collapsed
      });
      setExpandedCards(expandedState);
    }
  }, [existingElements, existingTranslations, defaultLanguage, languages]);

  // Add new sub-navigation item
  const addSubNavItem = useCallback(() => {
    const translations: Record<string, string> = {};
    languages.forEach(lang => {
      if (lang && lang.languageID) {
        translations[lang.languageID] = '';
      }
    });
    
    const newItem: SubNavigationItem = {
      id: `subnav_${Date.now()}`,
      translations,
      url: ''
    };
    
    setSubNavItems(prev => [...prev, newItem]);
    
    // Set new items as expanded by default
    setExpandedCards(prev => ({
      ...prev,
      [newItem.id]: true
    }));
  }, [languages]);

  // Toggle card expansion
  const toggleCardExpansion = useCallback((itemId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  // Expand all cards
  const expandAllCards = useCallback(() => {
    const newExpandedState: Record<string, boolean> = {};
    subNavItems.forEach(item => {
      newExpandedState[item.id] = true;
    });
    setExpandedCards(newExpandedState);
  }, [subNavItems]);

  // Collapse all cards
  const collapseAllCards = useCallback(() => {
    const newExpandedState: Record<string, boolean> = {};
    subNavItems.forEach(item => {
      newExpandedState[item.id] = false;
    });
    setExpandedCards(newExpandedState);
  }, [subNavItems]);

  // Remove sub-navigation item
  const removeSubNavItem = useCallback(async (itemId: string) => {
    try {
      setIsLoading(true);
      
      // Find elements for this sub-nav item
      const titleElement = existingElements.find(el => 
        el.metadata?.subNavId === itemId && el.metadata?.fieldType === 'title'
      );
      const urlElement = existingElements.find(el => 
        el.metadata?.subNavId === itemId && el.metadata?.fieldType === 'url'
      );
      
      // Delete elements and their translations
      if (titleElement) {
        // Delete translations first
        const titleTranslations = existingTranslations[titleElement._id] || [];
        await Promise.all(titleTranslations.map(t => deleteTranslationMutation.mutateAsync(t._id)));
        
        // Delete element
        await deleteElementMutation.mutateAsync(titleElement._id);
      }
      
      if (urlElement) {
        // Delete translations first
        const urlTranslations = existingTranslations[urlElement._id] || [];
        await Promise.all(urlTranslations.map(t => deleteTranslationMutation.mutateAsync(t._id)));
        
        // Delete element
        await deleteElementMutation.mutateAsync(urlElement._id);
      }
      
      // Remove from local state
      const updatedItems = subNavItems.filter(item => item.id !== itemId);
      setSubNavItems(updatedItems);
      
      // Remove from expanded cards state
      setExpandedCards(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      
      toast({
        title: "Success",
        description: "Sub-navigation item removed successfully"
      });
      
      // Notify parent component to refresh data
      if (onSubNavigationChange) {
        onSubNavigationChange(updatedItems, true);
      }
      
    } catch (error) {
      console.error("Error removing sub-navigation item:", error);
      toast({
        title: "Error",
        description: "Failed to remove sub-navigation item",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [existingElements, existingTranslations, deleteElementMutation, deleteTranslationMutation, toast, subNavItems, onSubNavigationChange]);

  // Update sub-navigation item
  const updateSubNavItem = useCallback((itemId: string, field: 'url' | string, value: string, languageId?: string) => {
    setSubNavItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      if (field === 'url') {
        return { ...item, url: value };
      } else if (field === 'title' && languageId) {
        return {
          ...item,
          translations: {
            ...item.translations,
            [languageId]: value
          }
        };
      }
      return item;
    }));
  }, []);

  // Save sub-navigation items
  const saveSubNavItems = useCallback(async () => {
    try {
      setIsSaving(true);
      
      const createdElements = [...existingElements]; // Track new elements
      
      for (const item of subNavItems) {
        // Skip empty items (check if all translations are empty)
        const hasContent = item.translations && Object.values(item.translations).some(title => title && title.trim());
        if (!hasContent) continue;
        
        // Create or update title element
        let titleElement = existingElements.find(el => 
          el.metadata?.subNavId === item.id && el.metadata?.fieldType === 'title'
        );
        
        if (!titleElement) {
          // Create new title element
          const titleElementData = {
            name: `SubNav_${item.id}_Title`,
            displayName: `${sectionConfig.subNavigation?.titleElement || 'SubNavTitle'} ${item.id}`,
            type: 'text',
            parent: subsectionId,
            isActive: true,
            order: existingElements.length,
            defaultContent: item.translations[defaultLanguage?.languageID] || '',
            metadata: {
              isSubNavigation: true,
              subNavId: item.id,
              fieldType: 'title'
            }
          };
          
          const response = await createElementMutation.mutateAsync(titleElementData);
          titleElement = response.data;
          createdElements.push(titleElement); // Add to tracking array
        } else {
          // Update existing title element
          await updateElementMutation.mutateAsync({
            id: titleElement._id,
            data: {
              defaultContent: item.translations[defaultLanguage?.languageID] || ''
            }
          });
        }
        
        // Create or update URL element (only for default language)
        let urlElement = existingElements.find(el => 
          el.metadata?.subNavId === item.id && el.metadata?.fieldType === 'url'
        );
        
        if (!urlElement) {
          // Create new URL element
          const urlElementData = {
            name: `SubNav_${item.id}_URL`,
            displayName: `${sectionConfig.subNavigation?.urlElement || 'SubNavURL'} ${item.id}`,
            type: 'text',
            parent: subsectionId,
            isActive: true,
            order: existingElements.length + 1,
            defaultContent: item.url || '',
            metadata: {
              isSubNavigation: true,
              subNavId: item.id,
              fieldType: 'url'
            }
          };
          
          const response = await createElementMutation.mutateAsync(urlElementData);
          urlElement = response.data;
          createdElements.push(urlElement); // Add to tracking array
        } else {
          // Update existing URL element
          await updateElementMutation.mutateAsync({
            id: urlElement._id,
            data: {
              defaultContent: item.url || ''
            }
          });
        }
        
        // Create/update translations for title (all languages)
        const titleTranslations = languages
          .filter(lang => lang && lang.languageID && lang._id)
          .map(lang => ({
            content: item.translations[lang.languageID] || '',
            language: lang._id,
            contentElement: titleElement._id,
            isActive: true
          }));
        
        if (titleTranslations.length > 0) {
          await bulkUpsertTranslationsMutation.mutateAsync(titleTranslations);
        }
        
        // Create/update translation for URL (default language only)
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
      
      toast({
        title: "Success",
        description: "Sub-navigation items saved successfully"
      });
      
      // Notify parent component with both items and request for data refresh
      if (onSubNavigationChange) {
        onSubNavigationChange(subNavItems, true); // Pass refresh flag
      }
      
    } catch (error) {
      console.error("Error saving sub-navigation items:", error);
      toast({
        title: "Error",
        description: "Failed to save sub-navigation items",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    subNavItems,
    existingElements,
    subsectionId,
    languages,
    defaultLanguage,
    sectionConfig,
    createElementMutation,
    updateElementMutation,
    bulkUpsertTranslationsMutation,
    toast,
    onSubNavigationChange
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {sectionConfig.subNavigation?.title || 'Sub-Navigation Items'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sectionConfig.subNavigation?.description || 'Manage sub-navigation items for this section'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {subNavItems.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={expandAllCards}
                disabled={isLoading}
                className="text-xs"
              >
                <ChevronDown size={14} className="mr-1" />
                Expand All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={collapseAllCards}
                disabled={isLoading}
                className="text-xs"
              >
                <ChevronUp size={14} className="mr-1" />
                Collapse All
              </Button>
            </>
          )}
          <Button onClick={addSubNavItem} disabled={isLoading} className="flex items-center">
            <Plus size={16} className="mr-2" />
            {sectionConfig.subNavigation?.addButton || 'Add Sub-Navigation Item'}
          </Button>
        </div>
      </div>

      {/* Sub-navigation items */}
      {subNavItems.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Link size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No sub-navigation items yet. Add your first item to get started.
          </div>
          <Button onClick={addSubNavItem} disabled={isLoading} variant="outline">
            <Plus size={16} className="mr-2" />
            {sectionConfig.subNavigation?.addButton || 'Add Sub-Navigation Item'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {subNavItems.map((item, index) => {
              const isExpanded = expandedCards[item.id] ?? false;
              const defaultTitle = item.translations?.[defaultLanguage?.languageID] || 'Untitled';
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center cursor-pointer flex-1"
                          onClick={() => toggleCardExpansion(item.id)}
                        >
                          <motion.div
                            animate={{ rotate: isExpanded ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                            className="mr-2"
                          >
                            <ChevronDown size={18} className="text-gray-500" />
                          </motion.div>
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center">
                              Sub-Navigation Item #{index + 1}
                              {defaultTitle && defaultTitle !== 'Untitled' && (
                                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                  ({defaultTitle})
                                </span>
                              )}
                            </CardTitle>
                            {!isExpanded && item.url && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                URL: {item.url}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardExpansion(item.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubNavItem(item.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} className="mr-1" />
                            {sectionConfig.subNavigation?.removeButton || 'Remove'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <CardContent>
                            <div className="grid gap-6">
                              {languages.map(language => {
                                if (!language || !language.languageID) return null;
                                
                                const isDefaultLang = language.languageID === defaultLanguage?.languageID;
                                
                                return (
                                  <div key={language.languageID} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center mb-4">
                                      <div className="flex items-center space-x-2">
                                        <Globe size={16} className="text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {language.name || language.language}
                                        </span>
                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                          {language.languageID.toUpperCase()}
                                        </span>
                                        {isDefaultLang && (
                                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                            Default
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                                          {sectionConfig.subNavigation?.itemTitle || 'Title'}
                                        </label>
                                        <Input
                                          placeholder={sectionConfig.subNavigation?.titlePlaceholder || 'Enter title'}
                                          value={item.translations?.[language.languageID] || ''}
                                          onChange={(e) => updateSubNavItem(item.id, 'title', e.target.value, language.languageID)}
                                          className="w-full"
                                        />
                                      </div>
                                      
                                      {isDefaultLang && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                                            {sectionConfig.subNavigation?.itemUrl || 'URL'}
                                          </label>
                                          <Input
                                            placeholder={sectionConfig.subNavigation?.urlPlaceholder || 'Enter URL'}
                                            value={item.url || ''}
                                            onChange={(e) => updateSubNavItem(item.id, 'url', e.target.value)}
                                            className="w-full"
                                          />
                                          <p className="text-xs text-gray-500 mt-1">
                                            {sectionConfig.subNavigation?.urlDescription || 'Enter the URL for this item'}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Save button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={saveSubNavItems}
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Sub-Navigation
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};