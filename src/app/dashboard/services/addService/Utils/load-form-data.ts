import { ContentElement } from '@/src/api/types/hooks/content.types';
import { Language } from '@/src/api/types/hooks/language.types';
import { SubSection } from '@/src/api/types/hooks/section.types';
import { toast } from '@/src/hooks/use-toast';
import { UseFormReturn } from 'react-hook-form';

// Common types



// Element processing options
interface ProcessElementOptions {
  // Function to create element groups (by feature, faq, benefit, etc.)
  groupElements: (elements: ContentElement[]) => Record<string, ContentElement[]>;
  
  // Function to extract data from elements and create form values for a language
  processElementGroup: (
    groupId: string, 
    elements: ContentElement[], 
    langId: string,
    getTranslationContent: (element: ContentElement | undefined, defaultValue?: string) => string
  ) => any;
  
  // Default value to use when no elements are found for a language
  getDefaultValue: () => any;
}

/**
 * Generic function to process subsection data and load it into a form
 */
export const processAndLoadData = (
  subsectionData: SubSection | null,
  form: UseFormReturn<any>,
  languageIds: string[],
  activeLanguages: Language[],
  options: ProcessElementOptions,
  callbacks: {
    setExistingSubSectionId: (id: string | null) => void;
    setContentElements?: (elements: ContentElement[]) => void;
    setDataLoaded?: (loaded: boolean) => void;
    setHasUnsavedChanges?: (hasChanges: boolean) => void;
    setIsLoadingData?: (isLoading: boolean) => void;
    validateCounts?: () => void;
  }
) => {
  if (!subsectionData) {
    console.log("No subsection data to process");
    if (callbacks.setIsLoadingData) callbacks.setIsLoadingData(false);
    return false;
  }

  try {
    console.log(`Processing subsection data:`, subsectionData);
    callbacks.setExistingSubSectionId(subsectionData._id);

    // Check if we have elements directly in the subsection data
    const elements = subsectionData.elements || subsectionData.contentElements || [];
    
    if (elements.length > 0) {
      // Store the content elements for later use
      if (callbacks.setContentElements) {
        callbacks.setContentElements(elements);
      }

      // Create a mapping of languages for easier access
      const langIdToCodeMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang._id] = lang.languageID;
        return acc;
      }, {});

      // Group elements based on the provided function
      const elementGroups = options.groupElements(elements);

      console.log("Element groups:", elementGroups);

      // Initialize form values for each language
      const languageValues: Record<string, any> = {};

      // Initialize all languages with empty values
      languageIds.forEach(langId => {
        const langCode = langIdToCodeMap[langId] || langId;
        languageValues[langCode] = Array.isArray(options.getDefaultValue()) ? [] : options.getDefaultValue();
      });

      // Helper function to get translation content for an element
      const getTranslationContent = (element?: ContentElement, defaultValue = "") => {
        if (!element) return defaultValue;

        // Process for each language
        languageIds.forEach(langId => {
          // Find translations for this language
          if (element.translations) {
            const translation = element.translations.find((t) => {
              // Handle both nested and direct language references
              if (t.language && typeof t.language === 'object' && '_id' in t.language) {
                return t.language._id === langId;
              } else {
                return t.language === langId;
              }
            });

            if (translation?.content) return translation.content;
          }
        });

        // Fall back to default content
        return element.defaultContent || defaultValue;
      };

      // Process each element group
      Object.entries(elementGroups).forEach(([groupId, groupElements]) => {
        // For each language, create entries
        languageIds.forEach(langId => {
          const langCode = langIdToCodeMap[langId] || langId;
          
          // Process the group for this language
          const value = options.processElementGroup(
            groupId, 
            groupElements, 
            langId,
            (element, defaultValue = "") => {
              if (!element) return defaultValue;

              // First check for a translation in this language
              const translation = element.translations?.find((t) => {
                // Handle both nested and direct language references
                if (t.language && typeof t.language === 'object' && '_id' in t.language) {
                  return t.language._id === langId;
                } else {
                  return t.language === langId;
                }
              });

              if (translation?.content) return translation.content;

              // Fall back to default content
              return element.defaultContent || defaultValue;
            }
          );

          // Add to language values based on structure (array or object)
          if (Array.isArray(languageValues[langCode])) {
            languageValues[langCode].push(value);
          } else {
            // For non-array types (like hero section), merge objects
            languageValues[langCode] = {
              ...languageValues[langCode],
              ...value
            };
          }
        });
      });

      console.log("Form values after processing:", languageValues);

      // Set all values in form
      Object.entries(languageValues).forEach(([langCode, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          form.setValue(langCode as any, values, { shouldDirty: false });
        } else if (Array.isArray(values) && values.length === 0) {
          // Ensure at least one default entry if none were found
          form.setValue(langCode as any, [options.getDefaultValue()], { shouldDirty: false });
        } else {
          // For non-array values (like hero section)
          form.setValue(langCode as any, values, { shouldDirty: false });
        }
      });

      // Reset form state to match the loaded values
      form.reset(form.getValues(), {
        keepValues: true,
        keepDirty: false,
      });

      if (callbacks.setDataLoaded) callbacks.setDataLoaded(true);
      if (callbacks.setHasUnsavedChanges) callbacks.setHasUnsavedChanges(false);
      if (callbacks.validateCounts) callbacks.validateCounts();

      return true;
    } else {
      console.log("No content elements found in subsection data");
      return false;
    }
  } catch (error) {
    console.error('Error processing subsection data:', error);
    toast({
      title: 'Error loading section data',
      description: error instanceof Error ? error.message : 'Unknown error occurred',
      variant: 'destructive',
    });
    return false;
  } finally {
    if (callbacks.setIsLoadingData) {
      callbacks.setIsLoadingData(false);
    }
  }
};

