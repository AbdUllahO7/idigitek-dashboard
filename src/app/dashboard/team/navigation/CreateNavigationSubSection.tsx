"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { ChevronDown, ChevronUp, Globe, Link } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { ActionButton, CancelButton, ErrorCard, LoadingCard, MainFormCard, SuccessCard, WarningCard } from "@/src/utils/MainSectionComponents"

// 🎯 NEW: Extended interface to include section info
interface CreateNavigationSubSectionProps {
  sectionId: string;
  sectionConfig: any;
  sectionInfo?: {
    id: string;
    name: {
      en: string;
      ar: string;
      tr: string;
    };
    subName: string;
    navigationData: {
      availableLanguages: string[];
      fallbackValues: {
        navigationLabel: {
          en: string;
          ar: string;
          tr: string;
        };
        navigationUrl: string;
      };
    };
  } | null;
  onSubSectionCreated?: (subsection: any) => void;
  onFormValidityChange?: (isValid: boolean, message?: string) => void;
}

// Debounce utility
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  const executedFunction = (...args: any[]) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  executedFunction.cancel = () => clearTimeout(timeout);
  return executedFunction;
}

// Helper function to find elements across different language labels
const findElementByFieldAcrossLanguages = (contentElements: any[], fieldId: string, sectionConfig: any) => {
  // First try to find by field ID (new approach)
  let element = contentElements.find(el => 
    el.name === fieldId || 
    (el.metadata && el.metadata.fieldId === fieldId)
  )
  
  if (element) return element
  
  // Try to find by current field label
  const currentField = sectionConfig.fields.find((f: any) => f.id === fieldId)
  if (currentField) {
    element = contentElements.find(el => el.name === currentField.label)
    if (element) return element
  }
  
  // Last resort: if only one element exists and one field exists, assume they match
  if (contentElements.length === 1 && sectionConfig.fields.length === 1) {
    return contentElements[0]
  }
  
  return null
}

// 🎯 NEW: Helper function to get fallback value for additional languages
const getFallbackValueForLanguage = (
  fieldId: string, 
  sectionInfo: any, 
  availableLanguages: string[] = ['en', 'ar', 'tr']
) => {
  if (!sectionInfo?.navigationData?.fallbackValues) return '';
  
  const fallbackValues = sectionInfo.navigationData.fallbackValues;
  
  // For navigation label field, use section name
  if (fieldId === 'navigationLabel' || fieldId === 'label' || fieldId === 'title' || fieldId === 'name') {
    // Try to get value from available languages in order of preference
    for (const lang of availableLanguages) {
      if (fallbackValues.navigationLabel[lang]) {
        return fallbackValues.navigationLabel[lang];
      }
    }
    // If no language-specific value, use subName as final fallback
    return sectionInfo.subName || '';
  }
  
  // For URL field, use generated URL
  if (fieldId === 'url' || fieldId === 'navigationUrl' || fieldId === 'link') {
    return fallbackValues.navigationUrl || `/${sectionInfo.subName.toLowerCase()}`;
  }
  
  // For other fields, try to get first available language value
  for (const lang of availableLanguages) {
    if (fallbackValues.navigationLabel[lang]) {
      return fallbackValues.navigationLabel[lang];
    }
  }
  
  return sectionInfo.subName || '';
};

// Language Card Component for Navigation
const NavigationLanguageCard = ({ 
  language, 
  form, 
  sectionConfig, 
  isRtl, 
  t, 
  isDefault = false,
  sectionInfo = null 
}: {
  language: any;
  form: any;
  sectionConfig: any;
  isRtl: boolean;
  t: any;
  isDefault?: boolean;
  sectionInfo?: any;
}) => {
  // Check if this language exists in section data
  const langCode = String(language.languageID);
  const hasMatchingLanguage = sectionInfo?.name?.hasOwnProperty(langCode);
  const sectionValue = hasMatchingLanguage ? sectionInfo.name[langCode] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isDefault 
          ? 'border-blue-500 dark:border-blue-400' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {/* Language Header */}
      <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${
        isDefault 
          ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' 
          : 'bg-gray-50 dark:bg-gray-800/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              isDefault 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mr-2 ml-2">
                  {language.name || language.language}
                </h3>
            
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mr-2 ml-2">
                  {language.languageID} {isDefault && '(Default)'}
                </p>
              
              </div>
            </div>
          </div>
       
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <Form {...form}>
          <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            {sectionConfig.fields.map((field: any) => {
              // Hide URL field for non-default languages
              if (field.showOnlyInDefault && !isDefault) {
                return null;
              }

              return (
                <FormField
                  key={`${language.languageID}-${field.id}`}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => {
                    // Check if this field value comes from section data
                    const isFromSectionData = hasMatchingLanguage && 
                      (field.id === 'navigationLabel' || field.id === 'label' || field.id === 'title' || field.id === 'name') &&
                      formField.value === sectionValue;
                    
                    const isURLFromSection = isDefault && 
                      (field.id === 'url' || field.id === 'navigationUrl' || field.id === 'link') &&
                      formField.value === sectionInfo?.navigationData?.fallbackValues?.navigationUrl;

                    return (
                      <FormItem className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                        <FormLabel className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                          {field.id === 'url' && <Link size={16} className="mr-2" />}
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                          
                        
                        </FormLabel>
                        
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder={field.placeholder || `${t('mainSubsection.placeholderEnter')} ${field.label.toLowerCase()} ${t('mainSubsection.forLanguage')} ${language.name || language.language}`}
                              {...formField}
                              className={`border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                (isFromSectionData || isURLFromSection) 
                                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                                  : ''
                              }`}
                            />
                            
                            {/* Show section data preview if available but not used */}
                            {hasMatchingLanguage && !isFromSectionData && 
                             (field.id === 'navigationLabel' || field.id === 'label' || field.id === 'title' || field.id === 'name') && 
                             !formField.value && (
                              <div className="absolute right-2 top-2 flex items-center space-x-2">
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  Available: "{sectionValue}"
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log(`🎯 Manual setting ${field.id} = "${sectionValue}" for ${langCode}`);
                                    formField.onChange(sectionValue);
                                  }}
                                  className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                >
                                  Use
                                </button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        
                        {/* Show section data info */}
                      
                        
                        {field.description && (
                          <FormDescription className="text-gray-500 dark:text-gray-400 text-sm italic mt-1">
                            {field.description}
                          </FormDescription>
                        )}
                        <FormMessage className="text-red-500 dark:text-red-400 font-medium text-sm mt-1" />
                      </FormItem>
                    );
                  }}
                />
              );
            })}
          </div>
        </Form>
      </div>
    </motion.div>
  );
};

export default function CreateNavigationSubSection({
  sectionId,
  sectionConfig,
  sectionInfo, // 🎯 NEW: Accept section info prop
  onSubSectionCreated,
  onFormValidityChange
}: CreateNavigationSubSectionProps) {
  // Hooks
  const { toast } = useToast()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isRtl = language === "ar"
  
  // State
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreatingElements, setIsCreatingElements] = useState(false)
  const [subsectionExists, setSubsectionExists] = useState(false)
  const [subsection, setSubsection] = useState<any>(null)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [isEditMode, setIsEditMode] = useState(true)
  const [contentElements, setContentElements] = useState<any[]>([])
  const [contentTranslations, setContentTranslations] = useState<Record<string, any[]>>({})
  const [formsInitialized, setFormsInitialized] = useState(false)
  const [hasEmptyRequiredFields, setHasEmptyRequiredFields] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [languageForms, setLanguageForms] = useState<Record<string, any>>({})
  const languagesInitialized = useRef(false)
  
  // 🔧 FIXED: Add state to track if this component is processing
  const [isProcessing, setIsProcessing] = useState(false)
  const lastProcessedDataRef = useRef<string>('')
  
  // 🔧 FIXED: Add state to track if user is actively editing
  const [userIsEditing, setUserIsEditing] = useState(false)
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { websiteId } = useWebsiteContext();

  // 🎯 NEW: Debug section info
  useEffect(() => {
    if (sectionInfo) {
      console.log("🧭 Navigation received section info:", sectionInfo);
    }
  }, [sectionInfo]);

  // API Hooks
  const {
    useCreate,
    useUpdate,
    useGetBySectionId
  } = useSubSections()
  
  const { 
    useCreate: useCreateElement,
    useUpdate: useUpdateElement,
  } = useContentElements()
  
  const { 
    useCreate: useCreateTranslation,
    useUpdate: useUpdateTranslation 
  } = useContentTranslations()
  
  const { useGetByWebsite: useGetAllLanguages } = useLanguages()
  
  // 🔧 FIXED: Add a key to track refetch requests from this component
  const navigationRefetchKey = useRef(0)
  
  // Data fetching with refetch capability
  const {
    data: completeSubsectionsData,
    isLoading: isLoadingCompleteSubsections,
    error: completeSubsectionsError,
    refetch: refetchCompleteSubsections
  } = useGetBySectionId(sectionId)

  // Mutations
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const createElementMutation = useCreateElement();
  const updateElementMutation = useUpdateElement();
  const createTranslationMutation = useCreateTranslation();
  const updateTranslationMutation = useUpdateTranslation();

  // 🔧 FIXED: More controlled form reinitialization
  useEffect(() => {
    if (completeSubsectionsData?.data && !isProcessing && !userIsEditing) {
      const dataKey = JSON.stringify(completeSubsectionsData.data)
      if (lastProcessedDataRef.current !== dataKey) {
        setFormsInitialized(false);
        lastProcessedDataRef.current = dataKey
      }
    }
  }, [completeSubsectionsData, isProcessing, userIsEditing]);
  
  // 🔧 FIXED: Only reset forms when explicitly needed, not when language changes during editing
  useEffect(() => {
    if (formsInitialized && language && !userIsEditing && !isEditMode) {
      setFormsInitialized(false)
    }
  }, [language, userIsEditing, isEditMode])
  
  const { 
    data: languagesData, 
    isLoading: isLoadingLanguages 
  } = useGetAllLanguages(websiteId)
  
  // Derived state
  const languages = languagesData?.data?.filter((lang: { isActive: any }) => lang.isActive) || []
  const defaultLanguage = languages.find((lang: { isDefault: any }) => lang.isDefault) || (languages.length > 0 ? languages[0] : null)
  
  // Build form schema with translations
  const buildFormSchema = useCallback(() => {
    const schemaObj: Record<string, any> = {}
    
    sectionConfig.fields.forEach((field: any) => {
      if (field.required) {
        if (field.type === 'text') {
          schemaObj[field.id] = z.string().min(1, `${field.label} is required`)
        }
      } else {
        if (field.type === 'text') {
          schemaObj[field.id] = z.string().optional()
        }
      }
    })
    
    return z.object(schemaObj)
  }, [sectionConfig.fields, t])
  
  const formSchema = useMemo(() => buildFormSchema(), [buildFormSchema])
  
  // 🎯 NEW: Get default values with section info fallback
  const getFormDefaultValues = useCallback((languageCode?: string) => {
    const defaults: Record<string, string> = {}
    
    sectionConfig.fields.forEach((field: any) => {
      let defaultValue = '';
      
      // If we have section info and no existing navigation data, use section data as defaults
      if (sectionInfo && !subsectionExists) {
        // For supported languages (en, ar, tr), use section name if available
        if (languageCode && ['en', 'ar', 'tr'].includes(languageCode)) {
          if (field.id === 'navigationLabel' || field.id === 'label' || field.id === 'title') {
            defaultValue = sectionInfo.name[languageCode as keyof typeof sectionInfo.name] || '';
          } else if (field.id === 'url' || field.id === 'navigationUrl' || field.id === 'link') {
            // Only set URL for default language
            const isDefaultLang = defaultLanguage && defaultLanguage.languageID === languageCode;
            defaultValue = isDefaultLang ? sectionInfo.navigationData.fallbackValues.navigationUrl : '';
          }
        } else if (languageCode) {
          // For additional languages (like fr), use fallback from first available language
          defaultValue = getFallbackValueForLanguage(field.id, sectionInfo, ['en', 'ar', 'tr']);
        }
      }
      
      defaults[field.id] = defaultValue;
    });
    
    return defaults;
  }, [sectionConfig.fields, sectionInfo, subsectionExists, defaultLanguage]);
  
  // Memoize fields
  const fields = useMemo(() => sectionConfig.fields, [sectionConfig.fields])
  
  // Pre-created form instances
  const form1 = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(),
    mode: "onChange"
  })
  
  const form2 = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(),
    mode: "onChange"
  })
  
  const form3 = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(),
    mode: "onChange"
  })
  
  const form4 = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(),
    mode: "onChange"
  })
  
  const form5 = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(),
    mode: "onChange"
  })
  
  const formInstances = useMemo(() => [form1, form2, form3, form4, form5], [form1, form2, form3, form4, form5])
  
  // 🔧 FIXED: Track user editing activity
  const markUserAsEditing = useCallback(() => {
    setUserIsEditing(true)
    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current)
    }
    editingTimeoutRef.current = setTimeout(() => {
      setUserIsEditing(false)
    }, 2000) // 2 seconds after last input
  }, [])
  
  // Map form instances to languages
  useEffect(() => {
    if (languages.length > 0) {
      const forms: Record<string, any> = {}
      languages.forEach((lang: { languageID: string | number }, index: number) => {
        if (index < formInstances.length) {
          forms[lang.languageID] = formInstances[index]
        }
      })
      setLanguageForms(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(forms)) {
          return forms
        }
        return prev
      })
    }
  }, [languages, formInstances])
  
  // 🔧 FIXED: Set up form change listeners to track user editing
  useEffect(() => {
    const subscriptions: any[] = []
    
    Object.values(languageForms).forEach((form: any) => {
      if (form) {
        const subscription = form.watch(() => {
          markUserAsEditing()
        })
        subscriptions.push(subscription)
      }
    })
    
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
    }
  }, [languageForms, markUserAsEditing])
  
  // Initialize selected languages
  useEffect(() => {
    if (languages.length > 0 && !languagesInitialized.current) {
      setSelectedLanguages(languages.map((lang: { _id: any }) => lang._id))
      languagesInitialized.current = true
    }
  }, [languages])
  
  // 🔧 FIXED: More specific filtering for NAVIGATION subsections only
  useEffect(() => {
    if (completeSubsectionsData?.data && completeSubsectionsData.data.length > 0 && !isProcessing && !userIsEditing) {
      // 🔧 FIXED: ONLY look for NAVIGATION subsections (NOT main) that match this config
      const navigationSubsection = completeSubsectionsData.data.find((sub: { name: string; type: string; isMain: boolean }) => {
        // Must NOT be main and have the correct type/name for navigation
        return sub.isMain !== true && (sub.type === sectionConfig.type || sub.name === sectionConfig.name);
      });
      
      if (navigationSubsection && JSON.stringify(navigationSubsection) !== JSON.stringify(subsection)) {
        setSubsection(navigationSubsection)
        setSubsectionExists(true)
        if (navigationSubsection.elements && navigationSubsection.elements.length > 0) {
          setContentElements(navigationSubsection.elements)
          const translationMap: Record<string, any[]> = {}
          navigationSubsection.elements.forEach((element: { translations: string | any[]; _id: string | number }) => {
            if (element.translations && element.translations.length > 0) {
              translationMap[element._id] = Array.isArray(element.translations) ? element.translations : []
            }
          })
          setContentTranslations(translationMap)
          setFormsInitialized(false)
        }
        if (onFormValidityChange) {
          onFormValidityChange(true)
        }
      } else if (!navigationSubsection) {
        setSubsection(null)
        setSubsectionExists(false)
        setContentElements([])
        setContentTranslations({})
        setFormsInitialized(false)
        if (onFormValidityChange) {
          onFormValidityChange(false, "Please enter navigation data")
        }
      }
    } else if (!completeSubsectionsData?.data || completeSubsectionsData.data.length === 0) {
      setSubsection(null)
      setSubsectionExists(false)
      setContentElements([])
      setContentTranslations({})
      setFormsInitialized(false)
      if (onFormValidityChange) {
        onFormValidityChange(false, "Please enter navigation data")
      }
    }
  }, [completeSubsectionsData, onFormValidityChange, subsection, sectionConfig.name, sectionConfig.type, isProcessing, userIsEditing])
  
  // 🎯 NEW: Initialize forms with section data when no existing navigation data
  useEffect(() => {
    if (
      sectionInfo &&
      !subsectionExists &&
      languages.length > 0 &&
      Object.keys(languageForms).length > 0 &&
      !isProcessing &&
      !userIsEditing &&
      !formsInitialized
    ) {
      console.log("🧭 Initializing navigation forms with section data");
      console.log("🧭 Section info available:", sectionInfo);
      console.log("🧭 Available language forms:", Object.keys(languageForms));
      
      // Add a small delay to ensure forms are fully ready
      setTimeout(() => {
        languages.forEach((lang: { languageID: string | number; _id: any }) => {
          const langCode = String(lang.languageID);
          const form = languageForms[langCode];
          
          if (!form) {
            console.log(`❌ No form found for language: ${langCode}`);
            return;
          }
          
          console.log(`🧭 Processing language: ${langCode}`);
          
          const fieldValues: Record<string, string> = {};
          
          fields.forEach((field: any) => {
            let value = '';
            
            // Check if this language exists in section data
            const sectionHasThisLanguage = sectionInfo.name.hasOwnProperty(langCode);
            
            if (sectionHasThisLanguage) {
              console.log(`✅ Found matching language ${langCode} in section data`);
              
              if (field.id === 'navigationLabel' || field.id === 'label' || field.id === 'title' || field.id === 'name') {
                value = sectionInfo.name[langCode as keyof typeof sectionInfo.name] || '';
                console.log(`🎯 Setting ${field.id} for ${langCode}: "${value}"`);
              } else if (field.id === 'url' || field.id === 'navigationUrl' || field.id === 'link') {
                // Only set URL for default language
                const isDefaultLang = defaultLanguage && defaultLanguage.languageID === lang.languageID;
                if (isDefaultLang) {
                  value = sectionInfo.navigationData.fallbackValues.navigationUrl;
                  console.log(`🔗 Setting URL for default language ${langCode}: "${value}"`);
                }
              }
            } else {
              console.log(`⚠️  Language ${langCode} not found in section data, using fallback`);
              // For languages not in section data, use fallback from first available language
              value = getFallbackValueForLanguage(field.id, sectionInfo, ['en', 'ar', 'tr']);
              if (value) {
                console.log(`🔄 Fallback value for ${langCode} ${field.id}: "${value}"`);
              }
            }
            
            fieldValues[field.id] = value;
          });
          
          console.log(`🧭 Final values for ${langCode}:`, fieldValues);
          
          // Force set each field individually to ensure it sticks
          Object.entries(fieldValues).forEach(([fieldId, fieldValue]) => {
            if (fieldValue) {
              console.log(`📝 Setting ${fieldId} = "${fieldValue}" for ${langCode}`);
              form.setValue(fieldId, fieldValue, { 
                shouldValidate: true, 
                shouldDirty: true, 
                shouldTouch: true 
              });
            }
          });
          
          // Also try reset as backup
          form.reset(fieldValues);
          
          // Trigger a re-render
          form.trigger();
        });
        
        setFormsInitialized(true);
        console.log("🎉 Navigation forms initialized with section data");
      }, 100); // Small delay to ensure forms are ready
    }
  }, [
    sectionInfo, 
    subsectionExists, 
    languages, 
    fields, 
    languageForms, 
    formsInitialized, 
    isProcessing, 
    userIsEditing, 
    defaultLanguage
  ]);
  
  // 🔧 FIXED: Initialize forms with existing data - only when NOT user editing
  useEffect(() => {
    if (
      contentElements.length > 0 &&
      languages.length > 0 &&
      Object.keys(languageForms).length > 0 &&
      !isProcessing &&
      !userIsEditing && // 🔧 FIXED: Don't reset while user is editing
      (!formsInitialized || (isEditMode && !formsInitialized)) // Only initialize once when entering edit mode
    ) {
      console.log("🧭 Initializing navigation forms with existing data");
      
      languages.forEach((lang: { languageID: string | number; _id: any }) => {
        const form = lang.languageID ? languageForms[String(lang.languageID)] : undefined
        if (!form) return
        const fieldValues: Record<string, string> = {}
        
        fields.forEach((field: any) => {
          const element = findElementByFieldAcrossLanguages(contentElements, field.id, sectionConfig)
          if (!element) {
            console.warn(`[NAV-${sectionConfig.name}] Could not find element for field: ${field.id} (${field.label})`)
            return
          }
          
          const translations = contentTranslations[element._id] || []
          const translation = translations.find(t =>
            (typeof t.language === 'string' && t.language === lang._id) ||
            (t.language && t.language._id === lang._id)
          )
          fieldValues[field.id] = translation
            ? translation.content || ''
            : element.defaultContent || ''
        })
        
        const currentValues = form.getValues()
        if (JSON.stringify(currentValues) !== JSON.stringify(fieldValues)) {
          form.reset(fieldValues)
        }
      })
      
      setFormsInitialized(true)
    }
  }, [contentElements, contentTranslations, languages, fields, languageForms, formsInitialized, language, sectionConfig, isProcessing, isEditMode, userIsEditing])
  
  // Check if any required fields are empty in the default language form
  const checkFormsEmpty = useCallback(() => {
    if (!defaultLanguage || !languageForms[defaultLanguage.languageID]) {
      setHasEmptyRequiredFields(true)
      return
    }
    
    const form = languageForms[defaultLanguage.languageID]
    const values = form.getValues()
    
    let isEmpty = false
    fields.forEach((field: any) => {
      if (field.required && (!values[field.id] || values[field.id].trim() === '')) {
        isEmpty = true
      }
    })
    
    setHasEmptyRequiredFields(prev => {
      if (prev !== isEmpty) {
        return isEmpty
      }
      return prev
    })
    
    if (isEmpty && isEditMode) {
      setIsExpanded(true)
    }
    
    if (onFormValidityChange) {
      onFormValidityChange(
        !isEmpty && subsectionExists,
        isEmpty ? "Please enter navigation data" : undefined
      )
    }
  }, [defaultLanguage, languageForms, fields, subsectionExists, onFormValidityChange, isEditMode, t])
  
  // Debounced checkFormsEmpty
  const debouncedCheckFormsEmpty = useCallback(
    debounce(() => {
      checkFormsEmpty()
    }, 300),
    [checkFormsEmpty]
  )
  
  // Watch for form changes to validate in real-time
  useEffect(() => {
    if (defaultLanguage && languageForms[defaultLanguage.languageID] && formsInitialized && !isProcessing && !userIsEditing) {
      const form = languageForms[defaultLanguage.languageID]
      const subscription = form.watch(() => {
        debouncedCheckFormsEmpty()
      })
      return () => {
        subscription.unsubscribe()
        debouncedCheckFormsEmpty.cancel()
      }
    }
  }, [defaultLanguage, languageForms, formsInitialized, debouncedCheckFormsEmpty, isProcessing, userIsEditing])
  
  // Validate all forms
  const validateAllForms = async () => {
    for (const lang of languages) {
      const form = lang.languageID ? languageForms[String(lang.languageID)] : undefined
      if (!form) continue
      const result = await form.trigger()
      if (!result) {
        toast({
          title: "Validation Error",
          description: `Please check form errors in ${lang.name || lang.language}.`,
          variant: "destructive"
        })
        return false
      }
    }
    return true
  }
  
  // 🔧 FIXED: Create new navigation subsection with better state management
  const handleCreateSubsection = async () => {
    if (!(await validateAllForms())) return
    try {
      setIsProcessing(true) // Prevent interference
      setIsCreating(true)
      
      const subSectionData = {
        name: sectionConfig.name,
        description: sectionConfig.description,
        type: sectionConfig.type,
        slug: `${sectionConfig.slug}-${Date.now()}`,
        defaultContent: defaultLanguage ? languageForms[defaultLanguage.languageID].getValues() : {},
        isMain: false, // 🔧 FIXED: Navigation is NOT main
        isActive: true,
        order: 1, // Different order from main
        section: sectionId,
        WebSiteId : websiteId,
        languages: selectedLanguages,
        metadata: {
          fields: sectionConfig.fields,
          elementsMapping: sectionConfig.elementsMapping,
          componentType: 'navigation', // Add identifier
          sectionInfo: sectionInfo // Store section info for reference
        }
      }

      const response = await createMutation.mutateAsync(subSectionData)
      if (response?.data) {
        const createdSubsection = response.data
        setSubsection(createdSubsection)
        setIsCreatingElements(true)
        
        // Create elements and translations
        const elementPromises = sectionConfig.fields.map(async (field: any, index: number) => {
          try {
            const elementData = {
              name: field.id,
              displayName: field.label,
              defaultContent: languageForms[defaultLanguage.languageID].getValues()[field.id],
              type: 'text',
              order: index,
              parent: createdSubsection._id,
              WebSiteId: websiteId,
              isActive: true,
              metadata: {
                fieldId: field.id,
                fieldType: field.type,
                originalLabel: field.label,
                componentType: 'navigation', // Add identifier
                sectionInfo: sectionInfo // Store section info for reference
              }
            }
            
            const elementResponse = await createElementMutation.mutateAsync(elementData)
            const createdElement = elementResponse.data
            
            if (!createdElement || !createdElement._id) {
              throw new Error(`${t('mainSubsection.errorCreatingElement')} ${field.label}`)
            }
            
            // Create translations for this element
            const translationPromises = languages.map(async (lang: { languageID: string | number; _id: any }) => {
              try {
                const form = lang.languageID ? languageForms[String(lang.languageID)] : undefined
                if (!form) return null
                const formValues = form.getValues()
                const translationData = {
                  content: formValues[field.id],
                  language: lang._id,
                  contentElement: createdElement._id,
                  isActive: true
                }
                return await createTranslationMutation.mutateAsync(translationData)
              } catch (translationError) {
                console.error(`${t('mainSubsection.errorCreatingTranslation')} ${field.label} ${t('mainSubsection.inLanguage')} ${lang.languageID}:`, translationError)
                throw translationError
              }
            })
            
            await Promise.all(translationPromises)
            return createdElement
          } catch (elementError) {
            console.error(`${t('mainSubsection.errorCreatingElement')} ${field.label}:`, elementError)
            throw elementError
          }
        })
        
        await Promise.all(elementPromises)
        
        setSubsectionExists(true)
        setHasEmptyRequiredFields(false)
        
        toast({
          title: "Success",
          description: `Navigation created successfully for ${languages.length} languages`
        })
        
        setIsEditMode(false)
        setIsExpanded(false)
        
        // 🔧 FIXED: Controlled refetch with delay and notification
        navigationRefetchKey.current += 1
        setTimeout(async () => {
          try {
            await refetchCompleteSubsections()
            // Also notify parent component immediately
            if (onSubSectionCreated) {
              onSubSectionCreated(createdSubsection)
            }
          } catch (refetchError) {
            console.error(`${t('mainSubsection.errorRefetchingData')} ${t('mainSubsection.creation')}:`, refetchError)
          } finally {
            setIsProcessing(false) // Allow processing again
          }
        }, 1000)
      }
    } catch (error: any) {
      console.error(`[NAV-${sectionConfig.name}] Error in handleCreateSubsection:`, error)
      setIsProcessing(false) // Reset on error
    } finally {
      setIsCreating(false)
      setIsCreatingElements(false)
    }
  }
  
  // 🔧 FIXED: Update existing navigation subsection with better state management
  const handleUpdateSubsection = async () => {
    if (!(await validateAllForms())) return
    try {
      setIsProcessing(true) // Prevent interference
      setIsUpdating(true)
      
      await updateMutation.mutateAsync({
        id: subsection._id,
        data: {
          defaultContent: defaultLanguage && languageForms[defaultLanguage.languageID]
            ? languageForms[defaultLanguage.languageID].getValues()
            : {}
        }
      })
      
      // Update elements and translations
      const updatePromises = contentElements.map(async (element) => {
        try {
          let field = null
          for (const f of sectionConfig.fields) {
            const foundElement = findElementByFieldAcrossLanguages([element], f.id, sectionConfig)
            if (foundElement) {
              field = f
              break
            }
          }
          
          if (!field) {
            console.warn(`[NAV-${sectionConfig.name}] Could not find matching field for element: ${element.name}`)
            return
          }
          
          if (defaultLanguage && languageForms[defaultLanguage.languageID]) {
            const defaultContent = languageForms[defaultLanguage.languageID].getValues()[field.id]
            await updateElementMutation.mutateAsync({
              id: element._id,
              data: { 
                defaultContent,
                name: field.id,
                displayName: field.label,
                metadata: {
                  fieldId: field.id,
                  fieldType: field.type,
                  originalLabel: field.label,
                  migrated: true,
                  componentType: 'navigation', // Add identifier
                  sectionInfo: sectionInfo // Store section info for reference
                }
              }
            })
          }
          
          // Update translations for this element
          const translationPromises = languages.map(async (lang: { languageID: string | number; _id: any }) => {
            try {
              const form = lang.languageID ? languageForms[String(lang.languageID)] : undefined
              if (!form) return null
              
              const formValues = form.getValues()
              const content = formValues[field.id]
              const elementTranslations = contentTranslations[element._id] || []
              
              const existingTranslation = elementTranslations.find(t => {
                const translationLangId = typeof t.language === 'string' ? t.language : (t.language?._id || t.language)
                const currentLangId = lang._id
                return translationLangId === currentLangId
              })
              
              if (existingTranslation) {
                return await updateTranslationMutation.mutateAsync({
                  id: existingTranslation._id,
                  data: { content }
                })
              } else {
                return await createTranslationMutation.mutateAsync({
                  content,
                  language: lang._id,
                  contentElement: element._id,
                  isActive: true
                })
              }
            } catch (translationError) {
              console.error(`${t('mainSubsection.errorUpdatingTranslation')} ${element.name} ${t('mainSubsection.inLanguage')} ${lang.languageID}:`, translationError)
              throw translationError
            }
          })
          
          await Promise.all(translationPromises)
        } catch (elementError) {
          console.error(`${t('mainSubsection.errorUpdatingElement')} ${element.name}:`, elementError)
          throw elementError
        }
      })
      
      await Promise.all(updatePromises)
      
      checkFormsEmpty()
      toast({
        title: "Success",
        description: `Navigation updated successfully for ${languages.length} languages`
      })
      
      setIsEditMode(false)
      setIsExpanded(false)
      
      // 🔧 FIXED: Controlled refetch with delay
      navigationRefetchKey.current += 1
      setTimeout(async () => {
        try {
          await refetchCompleteSubsections()
        } catch (refetchError) {
          console.error(`${t('mainSubsection.errorRefetchingData')} ${t('mainSubsection.update')}:`, refetchError)
        } finally {
          setIsProcessing(false) // Allow processing again
        }
      }, 1000)
    } catch (error: any) {
      console.error(`[NAV-${sectionConfig.name}] Error in handleUpdateSubsection:`, error)
      setIsProcessing(false) // Reset on error
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Render language cards
  const renderLanguageCards = () => {
    if (!languages || languages.length === 0) return null;

    return (
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {languages.map((lang: any) => {
          const form = languageForms[String(lang.languageID)]
          if (!form) return null;
          
          const isDefault = defaultLanguage && defaultLanguage.languageID === lang.languageID;
          
          return (
            <NavigationLanguageCard
              key={lang.languageID}
              language={lang}
              form={form}
              sectionConfig={sectionConfig}
              isRtl={isRtl}
              t={t}
              isDefault={isDefault}
              sectionInfo={sectionInfo} // 🎯 Pass section info to each card
            />
          );
        })}
      </div>
    );
  }
  
  // Display states
  if (isLoadingCompleteSubsections || isLoadingLanguages) {
    return <LoadingCard />
  }
  
  if (completeSubsectionsError) {
    return (
      <ErrorCard
        errorMessage={t('mainSubsection.couldNotCheckSubsection')}
        onRetry={() => {
          refetchCompleteSubsections();
        }}
      />
    )
  }
  
  if (languages.length === 0) {
    return (
      <WarningCard
        title={t('mainSubsection.noActiveLanguagesTitle')}
        message={t('mainSubsection.noActiveLanguagesMessage')}
      />
    )
  }
  
  if (subsectionExists && subsection && !isEditMode) {
    return (
      <SuccessCard
        title="🧭 Navigation Configuration Available"
        description="Navigation has been configured and is ready to use."
        onEdit={() => {
          // 🔧 FIXED: Force form reinitialization when entering edit mode
          setFormsInitialized(false);
          setIsEditMode(true);
          setIsExpanded(true);
          setUserIsEditing(false); // Reset user editing state
          
          // 🔧 FIXED: If we don't have content elements, refetch data
          if (contentElements.length === 0 || Object.keys(contentTranslations).length === 0) {
            refetchCompleteSubsections();
          }
        }}
      />
    )
  }
  
  return (
    <MainFormCard
      title={
        <div
          className="flex items-center justify-between w-full cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <Link size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
            <span>{subsectionExists ? t('Navigation.EditNavigation') : t('Navigation.CreateNavigation')}</span>
           
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full"
          >
            {isExpanded ?
              <ChevronUp size={18} className="text-gray-600 dark:text-gray-300" /> :
              <ChevronDown size={18} className="text-gray-600 dark:text-gray-300" />}
          </motion.div>
        </div>
      }
      description={
      ""
      }
    >
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
          
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                  🧭 Processing navigation changes...
                </p>
              </div>
            )}
            
           
            
            {/* Language cards container */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2 ml-2" />
               
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                  {languages.length} {t('mainSubsection.languages')}
                </span>
              </div>
              {renderLanguageCards()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-8 flex flex-col md:flex-row gap-3">
        {isExpanded ? (
          <>
            <ActionButton
              isLoading={isProcessing}
              isCreating={isCreating}
              isCreatingElements={isCreatingElements}
              isUpdating={isUpdating}
              exists={subsectionExists}
              onClick={subsectionExists ? handleUpdateSubsection : handleCreateSubsection}
              className="flex-1"
              disabled={isProcessing}
            />
            {subsectionExists && (
              <CancelButton
                onClick={() => {
                  setIsEditMode(false)
                  setIsExpanded(false)
                  setUserIsEditing(false) // Reset user editing state
                }}
                className="md:w-48"
              />
            )}
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(true)}
            disabled={isProcessing}
            className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            <div className="flex items-center justify-center">
              <ChevronDown size={18} className="mr-2" />
              <span>Show Navigation Form</span>
            </div>
          </motion.button>
        )}
      </div>
    </MainFormCard>
  )
}