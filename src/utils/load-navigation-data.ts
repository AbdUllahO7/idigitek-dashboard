// src/app/dashboard/navigationSection/utils/load-navigation-data.ts

import { ContentElement } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";

interface NavigationStateCallbacks {
  setExistingSubSectionId: (id: string | null) => void;
  setContentElements: (elements: ContentElement[]) => void;
  setDataLoaded: (loaded: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setIsLoadingData: (loading: boolean) => void;
  validateCounts: () => boolean;
}

// Process and load navigation data from subsection
export const processAndLoadNavigationData = (
  subsectionData: SubSection,
  form: any,
  languageIds: string[],
  activeLanguages: any[],
  type: 'navigation' | 'subNavigation',
  callbacks: NavigationStateCallbacks,
  t: (key: string, params?: any) => string
) => {
  callbacks.setIsLoadingData(true);
  
  try {
    // Create language code mapping
    const languageCodes = activeLanguages.reduce((acc, lang) => {
      acc[lang._id] = lang.languageID;
      return acc;
    }, {} as Record<string, string>);

    // Set existing subsection ID
    callbacks.setExistingSubSectionId(subsectionData._id);

    // Get content elements
    const contentElements = subsectionData.elements || [];
    callbacks.setContentElements(contentElements);

    // Group elements by navigation item
    const navigationGroups: { [key: number]: ContentElement[] } = {};
    const prefix = type === 'subNavigation' ? 'SubNav' : 'Navigation';
    
    contentElements.forEach((element: ContentElement) => {
      const match = element.name.match(new RegExp(`${prefix} (\\d+)`, 'i'));
      if (match) {
        const navigationNumber = parseInt(match[1], 10);
        if (!navigationGroups[navigationNumber]) {
          navigationGroups[navigationNumber] = [];
        }
        navigationGroups[navigationNumber].push(element);
      }
    });

    // Process each language
    const processedData: Record<string, any[]> = {};
    
    languageIds.forEach((langId) => {
      const langCode = languageCodes[langId] || langId;
      processedData[langCode] = [];

      // Process each navigation group
      Object.keys(navigationGroups)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach((navigationNumber) => {
          const elements = navigationGroups[parseInt(navigationNumber)];
          
          const getTranslationContent = (element: ContentElement | undefined, fallback: string, forceUsePrimaryLang = false) => {
            if (!element) return fallback;
            
            // For URL fields, use primary language values for all languages
            const primaryLangId = activeLanguages[0]?._id;
            if (forceUsePrimaryLang && langId !== primaryLangId) {
              const primaryTranslation = element.translations?.find((t: any) => t.language._id === primaryLangId);
              return primaryTranslation?.content || fallback;
            }
            
            const translation = element.translations?.find((t: any) => t.language._id === langId);
            return translation?.content || fallback;
          };

          if (type === 'subNavigation') {
            const nameElement = elements.find((el) => el.name.includes("Name"));
            const urlElement = elements.find((el) => el.name.includes("Url"));
            const orderElement = elements.find((el) => el.name.includes("Order"));

            processedData[langCode].push({
              id: `subnav-${navigationNumber}`,
              name: getTranslationContent(nameElement, ""),
              url: getTranslationContent(urlElement, "", true), // Use primary language
              order: parseInt(getTranslationContent(orderElement, "0", true)) || 0, // Use primary language
              isActive: true,
            });
          } else {
            const titleElement = elements.find((el) => el.name.includes("Title"));
            const displayTextElement = elements.find((el) => el.name.includes("DisplayText"));
            const urlElement = elements.find((el) => el.name.includes("Url"));
            const orderElement = elements.find((el) => el.name.includes("Order"));

            processedData[langCode].push({
              id: `nav-${navigationNumber}`,
              title: getTranslationContent(titleElement, ""),
              displayText: getTranslationContent(displayTextElement, ""),
              url: getTranslationContent(urlElement, "", true), // Use primary language
              order: parseInt(getTranslationContent(orderElement, "0", true)) || 0, // Use primary language
            });
          }
        });

      // If no data found, create default item
      if (processedData[langCode].length === 0) {
        if (type === 'subNavigation') {
          processedData[langCode] = [{
            id: "subnav-1",
            name: "",
            url: "",
            order: 0,
            isActive: true,
          }];
        } else {
          processedData[langCode] = [{
            id: "nav-1",
            title: "",
            displayText: "",
            url: "",
            order: 0,
          }];
        }
      }
    });

    // Set form values
    Object.entries(processedData).forEach(([langCode, items]) => {
      form.setValue(langCode, items, { shouldDirty: false });
    });

    callbacks.setDataLoaded(true);
    callbacks.setHasUnsavedChanges(false);
    callbacks.validateCounts();

    console.log("Navigation data processed successfully:", processedData);
    
  } catch (error) {
    console.error("Error processing navigation data:", error);
    throw error;
  } finally {
    callbacks.setIsLoadingData(false);
  }
};