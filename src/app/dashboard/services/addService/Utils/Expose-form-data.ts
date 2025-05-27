import { useImperativeHandle, RefObject, useReducer } from 'react';
import { UseFormReturn } from 'react-hook-form';

// Base ref interface that all form refs extend
export interface BaseFormRef {
  form: UseFormReturn<any>;
  hasUnsavedChanges: boolean;
  resetUnsavedChanges: () => void;
  existingSubSectionId: string | null;
  contentElements: any[];
  getFormData: () => Promise<any>;
}

// Options for createFormRef
interface CreateFormRefOptions {
  form: UseFormReturn<any>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  existingSubSectionId: string | null;
  contentElements: any[];
  componentName: string;
  extraMethods?: Record<string, any>;
  extraData?: Record<string, any>;
}

/**
 * Generic function to create form refs with useImperativeHandle
 * 
 * @param ref - The ref object passed to the forwardRef component
 * @param options - Configuration options for the form ref
 */
export const createFormRef = (
  ref: any,
  options: CreateFormRefOptions
): void => {
  const {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    existingSubSectionId,
    contentElements,
    componentName,
    extraMethods = {},
    extraData = {}
  } = options;

  useImperativeHandle(ref, () => ({
    getFormData: async () => {
      const isValid = await form.trigger();
      if (!isValid) {
        throw new Error(`${componentName} form has validation errors`);
      }
      
      const formValues = form.getValues();
      return {
        ...formValues,
        ...extraData
      };
    },
    form,
    hasUnsavedChanges,
    resetUnsavedChanges: () => setHasUnsavedChanges(false),
    existingSubSectionId,
    contentElements,
    ...extraMethods
  }));
};


export const useForceUpdate = () => {
  const [, updateState] = useReducer((x) => x + 1, 0);
  return updateState;
};


/**
 * Check if all languages have the same number of benefits
 */
export const validateSubSectionCounts = (values: { [s: string]: unknown; } | ArrayLike<unknown>) => {
  // Filter out any non-array values that might be causing issues
  const validLangEntries = Object.entries(values).filter(
    ([_, langBenefits]) => Array.isArray(langBenefits)
  );

  if (validLangEntries.length <= 1) {
    // If there's only one or zero languages, no mismatch is possible
    return true;
  }

  // Get counts of benefits for each language
  const counts = validLangEntries.map(
    ([_, langBenefits]) => (langBenefits as unknown[]).length
  );

  // Check if all counts are the same as the first count
  const firstCount = counts[0];
  const allEqual = counts.every(count => count === firstCount);


  return allEqual;
};

/**
 * Get benefit counts by language
 */
export const getSubSectionCountsByLanguage = (values: ArrayLike<unknown> | { [s: string]: unknown; }) => {
  return Object.entries(values).map(([langCode, benefits]) => ({
    language: langCode,
    count: Array.isArray(benefits) ? benefits.length : 0,
  }));
};
const availableIcons = [
    'Car',
    'MonitorSmartphone',
    'Settings',
    'CreditCard',
    'Clock',
    'MessageSquare',
    'LineChart',
    'Headphones',
    'User',
    'Calendar',
    'Mail',
    'Phone',
    'MapPin',
    'Globe',
    'Lock',
    'Unlock',
    'Star',
    'Heart',
    'ThumbsUp',
    'ThumbsDown',
    'Eye',
    'EyeOff',
    'Search',
    'Filter',
    'Edit',
    'Trash',
    'Plus',
    'Minus',
    'Check',
    'X',
    'Download',
    'Upload',
    'Share',
    'Link',
    'Copy',
    'Bookmark',
    'Tag',
    'Folder',
    'File',
    'Image',
    'Video',
    'Music',
    'Play',
    'Pause',
    'Volume',
    'VolumeX',
    'Sun',
    'Moon',
    'Bell',
    'AlertCircle',
    'Info'
] as const;

export const getAvailableIcons = () => availableIcons;

/**
 * Get a safe icon value from the form data
 */
export const getSafeIconValue = (allFormValues: Record<string, { icon: string }[]>, benefitIndex: number) => {
  // Try to get from first language first
  const languages = Object.keys(allFormValues);
  if (languages.length === 0) return "Clock";

  const firstLang = languages[0];
  if (
    allFormValues[firstLang] && 
    Array.isArray(allFormValues[firstLang]) && 
    allFormValues[firstLang][benefitIndex] && 
    allFormValues[firstLang][benefitIndex].icon
  ) {
    return allFormValues[firstLang][benefitIndex].icon;
  }

  // Try other languages
  for (const lang of languages) {
    if (
      allFormValues[lang] && 
      Array.isArray(allFormValues[lang]) && 
      allFormValues[lang][benefitIndex] && 
      allFormValues[lang][benefitIndex].icon
    ) {
      return allFormValues[lang][benefitIndex].icon;
    }
  }

  // Default fallback
  return "Clock";
};

