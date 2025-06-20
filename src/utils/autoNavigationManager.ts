// 3. Utility functions for Auto Navigation Management
// utils/autoNavigationManager.ts

import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";

interface AutoNavigationConfig {
  baseUrl?: string;
  defaultPage?: string;
}

interface NavigationItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Language {
  _id: string;
  languageID: string;
  isDefault: boolean;
  isActive: boolean;
}

export class AutoNavigationManager {
  private config: AutoNavigationConfig;
  
  constructor(config: AutoNavigationConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://idigitek-client-dynamic.vercel.app',
      defaultPage: config.defaultPage || 'Pages/ServiceDetailsPage',
      ...config
    };
  }

  /**
   * Generate dynamic URL for an item
   */
  generateDynamicUrl(itemId: string, customPath?: string): string {
    const path = customPath || this.config.defaultPage;
    return `${this.config.baseUrl}/${path}/${itemId}`;
  }

  /**
   * Create sub-navigation elements for selected items
   */
  async createSubNavigationElements(
    selectedItems: NavigationItem[],
    navigationSubsectionId: string,
    activeLanguages: Language[],
    mutations: {
      createElement: any;
      bulkUpsertTranslations: any;
      deleteElement: any;
      deleteTranslation: any;
    }
  ): Promise<void> {
    const { createElement, bulkUpsertTranslations, deleteElement, deleteTranslation } = mutations;

    try {
      // 1. Clean up existing sub-navigation elements
      await this.cleanupExistingSubNavigation(navigationSubsectionId, deleteElement, deleteTranslation);

      // 2. Create new elements for each selected item
      for (let index = 0; index < selectedItems.length; index++) {
        const item = selectedItems[index];
        const subNavId = `subnav_${item.id}`;

        // Create title element
        const titleElement = await this.createElement(
          createElement,
          {
            name: `SubNav_${subNavId}_Title`,
            displayName: `SubNav Title ${item.name}`,
            type: 'text',
            parent: navigationSubsectionId,
            isActive: true,
            order: index * 2,
            defaultContent: item.name,
            metadata: {
              isSubNavigation: true,
              subNavId: subNavId,
              fieldType: 'title',
              sourceItemId: item.id
            }
          }
        );

        // Create URL element
        const urlElement = await this.createElement(
          createElement,
          {
            name: `SubNav_${subNavId}_URL`,
            displayName: `SubNav URL ${item.name}`,
            type: 'text',
            parent: navigationSubsectionId,
            isActive: true,
            order: index * 2 + 1,
            defaultContent: this.generateDynamicUrl(item.id),
            metadata: {
              isSubNavigation: true,
              subNavId: subNavId,
              fieldType: 'url',
              sourceItemId: item.id
            }
          }
        );

        // Create translations
        await this.createTranslations(
          item,
          titleElement._id,
          urlElement._id,
          activeLanguages,
          bulkUpsertTranslations
        );
      }
    } catch (error) {
      console.error('Error creating sub-navigation elements:', error);
      throw error;
    }
  }

  /**
   * Clean up existing sub-navigation elements
   */
  private async cleanupExistingSubNavigation(
    navigationSubsectionId: string,
    deleteElement: any,
    deleteTranslation: any
  ): Promise<void> {
    try {
      // Fetch existing sub-navigation elements
      const response = await fetch(
        `/api/content-elements?parent=${navigationSubsectionId}&isSubNavigation=true`
      );
      
      if (!response.ok) {
        console.warn('Could not fetch existing sub-navigation elements');
        return;
      }

      const existingElements = await response.json();

      if (existingElements?.data && Array.isArray(existingElements.data)) {
        for (const element of existingElements.data) {
          // Delete translations first
          if (element.translations && Array.isArray(element.translations)) {
            await Promise.all(
              element.translations.map((translation: any) => 
                deleteTranslation.mutateAsync(translation._id).catch((err: any) => 
                  console.warn(`Failed to delete translation ${translation._id}:`, err)
                )
              )
            );
          }

          // Delete element
          await deleteElement.mutateAsync(element._id).catch((err: any) => 
            console.warn(`Failed to delete element ${element._id}:`, err)
          );
        }
      }
    } catch (error) {
      console.error('Error cleaning up existing sub-navigation:', error);
      // Don't throw here, allow the process to continue
    }
  }

  /**
   * Create a content element
   */
  private async createElement(createElement: any, elementData: any): Promise<any> {
    const response = await createElement.mutateAsync(elementData);
    return response.data;
  }

  /**
   * Create translations for title and URL elements
   */
  private async createTranslations(
    item: NavigationItem,
    titleElementId: string,
    urlElementId: string,
    activeLanguages: Language[],
    bulkUpsertTranslations: any
  ): Promise<void> {
    const defaultLanguage = activeLanguages.find(lang => lang.isDefault) || activeLanguages[0];

    if (!defaultLanguage) {
      throw new Error('No default language found');
    }

    // Prepare translations
    const allTranslations: any[] = [];

    // Title translations for all languages
    activeLanguages.forEach(lang => {
      allTranslations.push({
        content: item.name, // In a real app, you might have translated names
        language: lang._id,
        contentElement: titleElementId,
        isActive: true
      });
    });

    // URL translation (only for default language)
    allTranslations.push({
      content: this.generateDynamicUrl(item.id),
      language: defaultLanguage._id,
      contentElement: urlElementId,
      isActive: true
    });

    // Bulk create translations
    await bulkUpsertTranslations.mutateAsync(allTranslations);
  }

  /**
   * Update URLs for existing sub-navigation items when item details change
   */
  async updateSubNavigationUrls(
    updatedItems: NavigationItem[],
    navigationSubsectionId: string,
    updateElement: any
  ): Promise<void> {
    try {
      // Fetch existing sub-navigation URL elements
      const response = await fetch(
        `/api/content-elements?parent=${navigationSubsectionId}&metadata.fieldType=url&metadata.isSubNavigation=true`
      );

      if (!response.ok) return;

      const existingElements = await response.json();

      if (existingElements?.data && Array.isArray(existingElements.data)) {
        for (const element of existingElements.data) {
          const sourceItemId = element.metadata?.sourceItemId;
          const updatedItem = updatedItems.find(item => item.id === sourceItemId);

          if (updatedItem) {
            // Update the element with new URL
            await updateElement.mutateAsync({
              id: element._id,
              data: {
                defaultContent: this.generateDynamicUrl(updatedItem.id)
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating sub-navigation URLs:', error);
    }
  }

  /**
   * Get current sub-navigation items
   */
  async getCurrentSubNavigationItems(navigationSubsectionId: string): Promise<string[]> {
    try {
      const response = await fetch(
        `/api/content-elements?parent=${navigationSubsectionId}&metadata.fieldType=title&metadata.isSubNavigation=true`
      );

      if (!response.ok) return [];

      const elements = await response.json();
      
      return elements?.data?.map((element: any) => element.metadata?.sourceItemId).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching current sub-navigation items:', error);
      return [];
    }
  }
}

// Hook for using the auto navigation manager
export const useAutoNavigationManager = (config?: AutoNavigationConfig) => {
  const manager = new AutoNavigationManager(config);
  return manager;
};

// Types export
export type { AutoNavigationConfig, NavigationItem, Language };