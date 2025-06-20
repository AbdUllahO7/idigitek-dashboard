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
import { CreateMainSubSectionProps } from "@/src/api/types/utils/CreateMainSubSection.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { ActionButton, CancelButton, ErrorCard, LoadingCard, MainFormCard, SuccessCard, WarningCard } from "@/src/utils/MainSectionComponents"
import { SubNavigationManager } from "./SubNavigationManager"

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


// Language Card Component for Navigation
const NavigationLanguageCard = ({ 
  language, 
  form, 
  sectionConfig, 
  isRtl, 
  t, 
  isDefault = false 
}: {
  language: any;
  form: any;
  sectionConfig: any;
  isRtl: boolean;
  t: any;
  isDefault?: boolean;
}) => {
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mr-2 ml-2">
                {language.name || language.language}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mr-2 ml-2">
                {language.languageID} {isDefault && '(Default)'}
              </p>
            </div>
          </div>
          {isDefault && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
              {t('mainSubsection.defaultLanguage')}
            </span>
          )}
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
                  render={({ field: formField }) => (
                    <FormItem className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                      <FormLabel className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                        {field.id === 'url' && <Link size={16} className="mr-2" />}
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={field.placeholder || `${t('mainSubsection.placeholderEnter')} ${field.label.toLowerCase()} ${t('mainSubsection.forLanguage')} ${language.name || language.language}`}
                          {...formField}
                          className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </FormControl>
                      {field.description && (
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-sm italic mt-1">
                          {field.description}
                        </FormDescription>
                      )}
                      <FormMessage className="text-red-500 dark:text-red-400 font-medium text-sm mt-1" />
                    </FormItem>
                  )}
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
  onSubSectionCreated,
  onFormValidityChange
}: CreateMainSubSectionProps) {
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
  const [isRefreshingData, setIsRefreshingData] = useState(false)
  const languagesInitialized = useRef(false)

  const { websiteId } = useWebsiteContext();

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

  // Reset the forms state when data changes
  useEffect(() => {
    if (completeSubsectionsData?.data) {
      setFormsInitialized(false);
    }
  }, [completeSubsectionsData]);
  
  // Force form reinitialization when language changes
  useEffect(() => {
    if (formsInitialized && language) {
      setFormsInitialized(false)
    }
  }, [language])
  
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
  
  // Get default values
  const getFormDefaultValues = useCallback(() => {
    return sectionConfig.fields.reduce((acc: any, field: any) => {
      acc[field.id] = ''
      return acc
    }, {} as Record<string, string>)
  }, [sectionConfig.fields])
  
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
  
  // Initialize selected languages
  useEffect(() => {
    if (languages.length > 0 && !languagesInitialized.current) {
      setSelectedLanguages(languages.map((lang: { _id: any }) => lang._id))
      languagesInitialized.current = true
    }
  }, [languages])
  
  // Process complete subsection data - look for navigation subsection
  useEffect(() => {
    if (completeSubsectionsData?.data && completeSubsectionsData.data.length > 0) {
      // Find navigation subsection by name or type - be more flexible in matching
      const navigationSubsection = completeSubsectionsData.data.find((sub: { name: string; type: string; isMain: boolean }) => {
        // Match by type first (most reliable)
        if (sub.type === sectionConfig.type) return true;
        // Match by name
        if (sub.name === sectionConfig.name) return true;
        // Match by partial name (in case of slug differences)
        if (sub.name && sub.name.toLowerCase().includes('navigation')) return true;
        return false;
      });
      
      if (navigationSubsection && JSON.stringify(navigationSubsection) !== JSON.stringify(subsection)) {
        console.log('Found navigation subsection:', navigationSubsection);
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
        // Reset state if no navigation subsection found
        setSubsection(null)
        setSubsectionExists(false)
        setContentElements([])
        setContentTranslations({})
        setFormsInitialized(false)
        if (onFormValidityChange) {
          onFormValidityChange(false, "Please enter navigation data")
        }
      }
    } else {
      // Reset state if no data
      setSubsection(null)
      setSubsectionExists(false)
      setContentElements([])
      setContentTranslations({})
      setFormsInitialized(false)
      if (onFormValidityChange) {
        onFormValidityChange(false, "Please enter navigation data")
      }
    }
  }, [completeSubsectionsData, onFormValidityChange, subsection, sectionConfig.name, sectionConfig.type])
  
  // Initialize forms with data
  useEffect(() => {
    if (
      contentElements.length > 0 &&
      Object.keys(contentTranslations).length > 0 &&
      !formsInitialized &&
      languages.length > 0 &&
      Object.keys(languageForms).length > 0
    ) {
      console.log('Initializing navigation forms with language:', language)
      
      languages.forEach((lang: { languageID: string | number; _id: any }) => {
        const form = lang.languageID ? languageForms[String(lang.languageID)] : undefined
        if (!form) return
        const fieldValues: Record<string, string> = {}
        
        fields.forEach((field: any) => {
          const element = findElementByFieldAcrossLanguages(contentElements, field.id, sectionConfig)
          if (!element) {
            console.warn(`Could not find element for field: ${field.id} (${field.label})`)
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
  }, [contentElements, contentTranslations, languages, fields, languageForms, formsInitialized, language, sectionConfig])
  
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
    if (defaultLanguage && languageForms[defaultLanguage.languageID] && formsInitialized) {
      const form = languageForms[defaultLanguage.languageID]
      const subscription = form.watch(() => {
        debouncedCheckFormsEmpty()
      })
      return () => {
        subscription.unsubscribe()
        debouncedCheckFormsEmpty.cancel()
      }
    }
  }, [defaultLanguage, languageForms, formsInitialized, debouncedCheckFormsEmpty])
  
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
  
  // Create new navigation subsection
  const handleCreateSubsection = async () => {
    if (!(await validateAllForms())) return
    try {
      setIsCreating(true)
      const subSectionData = {
        name: sectionConfig.name,
        description: sectionConfig.description,
        type: sectionConfig.type,
        slug: `${sectionConfig.slug}-${Date.now()}`,
        defaultContent: defaultLanguage ? languageForms[defaultLanguage.languageID].getValues() : {},
        isMain: true,
        isActive: true,
        order: 0,
        section: sectionId,
        WebSiteId : websiteId,
        languages: selectedLanguages,
        metadata: {
          fields: sectionConfig.fields,
          elementsMapping: sectionConfig.elementsMapping
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
                originalLabel: field.label
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
        
        // After all operations are complete, refetch the data to update the UI
        setTimeout(async () => {
          try {
            await refetchCompleteSubsections()
            // Also notify parent component immediately
            if (onSubSectionCreated) {
              onSubSectionCreated(createdSubsection)
            }
          } catch (refetchError) {
            console.error(`${t('mainSubsection.errorRefetchingData')} ${t('mainSubsection.creation')}:`, refetchError)
          }
        }, 500)
      }
    } catch (error: any) {
      console.error("Error in handleCreateSubsection:", error)
      toast({
        title: "Error Creating Navigation",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
      setIsCreatingElements(false)
    }
  }
  
  // Update existing navigation subsection
  const handleUpdateSubsection = async () => {
    if (!(await validateAllForms())) return
    try {
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
            console.warn(`Could not find matching field for element: ${element.name}`)
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
                  migrated: true
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
      
      setTimeout(async () => {
        try {
          await refetchCompleteSubsections()
        } catch (refetchError) {
          console.error(`${t('mainSubsection.errorRefetchingData')} ${t('mainSubsection.update')}:`, refetchError)
        }
      }, 500)
    } catch (error: any) {
      console.error("Error in handleUpdateSubsection:", error)
      toast({
        title: "Error Updating Navigation",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      })
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
  
  if (subsectionExists && subsection) {
      return (
        <div className="space-y-6">
          {!isEditMode && (
            <SuccessCard
              title="Navigation Configuration Available"
              description="Team navigation has been configured and is ready to use. Sub-navigation items are managed automatically from the team list."
              onEdit={() => {
                setIsEditMode(true)
                setIsExpanded(true)
              }}
            />
          )}
          
          {/* Show form when in edit mode */}
          {isEditMode && (
            <MainFormCard
              title={
                <div
                  className="flex items-center justify-between w-full cursor-pointer"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex items-center">
                    <Link size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
                    <span>Edit Team Navigation</span>
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
              description="Update the navigation name and URL for the team section. Sub-navigation items are managed from the team list."
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
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2 ml-2" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Navigation Languages
                        </h3>
                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                          {languages.length} languages
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
                      isLoading={false}
                      isCreating={isCreating}
                      isCreatingElements={isCreatingElements}
                      isUpdating={isUpdating}
                      exists={subsectionExists}
                      onClick={handleUpdateSubsection}
                      className="flex-1"
                    />
                    <CancelButton
                      onClick={() => {
                        setIsEditMode(false)
                        setIsExpanded(false)
                      }}
                      className="md:w-48"
                    />
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsExpanded(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-center">
                      <ChevronDown size={18} className="mr-2" />
                      <span>Show Navigation Form</span>
                    </div>
                  </motion.button>
                )}
              </div>
            </MainFormCard>
          )}
          
          {/* Info card about automatic sub-navigation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Link size={16} className="text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Automatic Sub-Navigation Management
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>Sub-navigation items are now managed automatically from the team list below. Simply check the "Add to Navigation" checkbox for any team member you want to include in the navigation menu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <span>{subsectionExists ? 'Edit Team Navigation' : 'Create Team Navigation'}</span>
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
        subsectionExists
          ? "Update the navigation name and URL for the team section."
          : "Configure the navigation settings for your team section."
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
            {/* Language cards container */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2 ml-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Navigation Languages
                </h3>
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
              isLoading={false}
              isCreating={isCreating}
              isCreatingElements={isCreatingElements}
              isUpdating={isUpdating}
              exists={subsectionExists}
              onClick={subsectionExists ? handleUpdateSubsection : handleCreateSubsection}
              className="flex-1"
            />
            {subsectionExists && (
              <CancelButton
                onClick={() => {
                  setIsEditMode(false)
                  setIsExpanded(false)
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
            className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
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