"use client"

import { useEffect, useState, useRef, useMemo, useCallback, Key } from "react"
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
import { Textarea } from "@/src/components/ui/textarea"
import { TabsContent } from "@/src/components/ui/tabs"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useLanguages } from "@/src/hooks/webConfiguration/use-language"
import { ActionButton, CancelButton, ErrorCard,LanguageTabs, LoadingCard, MainFormCard, SuccessCard, WarningCard } from "./MainSectionComponents"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CreateMainSubSectionProps } from "../api/types/utils/CreateMainSubSection.types"
import { useWebsiteContext } from "../providers/WebsiteContext"
import { useContentTranslations } from "../hooks/webConfiguration/use-content-translations"
import { useTranslation } from "react-i18next"

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

export default function CreateMainSubSection({
  sectionId,
  sectionConfig,
  onSubSectionCreated,
  onFormValidityChange
}: CreateMainSubSectionProps) {
  // Hooks
  const { toast } = useToast()
  const { t } = useTranslation()
  
  // State
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreatingElements, setIsCreatingElements] = useState(false)
  const [subsectionExists, setSubsectionExists] = useState(false)
  const [subsection, setSubsection] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("")
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [isEditMode, setIsEditMode] = useState(true)
  const [contentElements, setContentElements] = useState<any[]>([])
  const [contentTranslations, setContentTranslations] = useState<Record<string, any[]>>({})
  const [formsInitialized, setFormsInitialized] = useState(false)
  const [hasEmptyRequiredFields, setHasEmptyRequiredFields] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [languageForms, setLanguageForms] = useState<Record<string, any>>({})
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

  // Reset the forms state when data changes and ensure forms are properly refreshed
  useEffect(() => {
    if (completeSubsectionsData?.data) {
      // Reset form initialization to force reload of form data
      setFormsInitialized(false);
    }
  }, [completeSubsectionsData]);
  
  const { 
    data: languagesData, 
    isLoading: isLoadingLanguages 
  } = useGetAllLanguages(websiteId)
  
  // Derived state
  const languages = languagesData?.data?.filter((lang: { isActive: any }) => lang.isActive) || []
  const defaultLanguage = languages.find((lang: { isDefault: any }) => lang.isDefault) || (languages.length > 0 ? languages[0] : null)
  
  // Build form schema
  const buildFormSchema = useCallback(() => {
    const schemaObj: Record<string, any> = {}
    
    sectionConfig.fields.forEach(field => {
      if (field.required) {
        if (field.type === 'textarea' || field.type === 'text' || field.type === 'badge') {
          schemaObj[field.id] = z.string().min(1, `${field.label} ${t('createMainSubSection.messages.required')}`)
        }
      } else {
        if (field.type === 'textarea' || field.type === 'text' || field.type === 'badge') {
          schemaObj[field.id] = z.string().optional()
        }
      }
    })
    
    return z.object(schemaObj)
  }, [sectionConfig.fields, t])
  
  const formSchema = useMemo(() => buildFormSchema(), [buildFormSchema])
  
  // Get default values
  const getFormDefaultValues = useCallback(() => {
    return sectionConfig.fields.reduce((acc, field) => {
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
  
  // Initialize selected languages and active tab
  useEffect(() => {
    if (languages.length > 0 && !languagesInitialized.current) {
      setSelectedLanguages(languages.map((lang: { _id: any }) => lang._id))
      if (defaultLanguage) {
        setActiveTab(defaultLanguage.languageID)
      }
      languagesInitialized.current = true
    }
  }, [languages, defaultLanguage])
  
  // Process complete subsection data
  useEffect(() => {
    if (completeSubsectionsData?.data && completeSubsectionsData.data.length > 0) {
      const mainSubsection = completeSubsectionsData.data.find((sub: { isMain: any }) => sub.isMain) || completeSubsectionsData.data[0]
      if (JSON.stringify(mainSubsection) !== JSON.stringify(subsection)) {
        setSubsection(mainSubsection)
        setSubsectionExists(true)
        if (mainSubsection.elements && mainSubsection.elements.length > 0) {
          setContentElements(mainSubsection.elements)
          const translationMap: Record<string, any[]> = {}
          mainSubsection.elements.forEach((element: { translations: string | any[]; _id: string | number }) => {
            if (element.translations && element.translations.length > 0) {
              translationMap[element._id] = Array.isArray(element.translations) ? element.translations : []
            }
          })
          setContentTranslations(translationMap)
          setFormsInitialized(false)
        }
      }
      if (onFormValidityChange) {
        onFormValidityChange(true)
      }
    } else {
      if (onFormValidityChange) {
        onFormValidityChange(false, t('createMainSubSection.messages.enterMainSectionData'))
      }
    }
  }, [completeSubsectionsData, onFormValidityChange, subsection, t])
  
  // Initialize forms with data
  useEffect(() => {
    if (
      contentElements.length > 0 &&
      Object.keys(contentTranslations).length > 0 &&
      !formsInitialized &&
      languages.length > 0 &&
      Object.keys(languageForms).length > 0
    ) {
      languages.forEach((lang: { languageID: string | number; _id: any }) => {
        const form = lang.languageID ? languageForms[String(lang.languageID)] : undefined
        if (!form) return
        const fieldValues: Record<string, string> = {}
        
        fields.forEach(field => {
          const element = contentElements.find(el => el.name === field.label)
          if (!element) return
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
  }, [contentElements, contentTranslations, languages, fields, languageForms, formsInitialized])
  
  // Check if any required fields are empty in the default language form
  const checkFormsEmpty = useCallback(() => {
    if (!defaultLanguage || !languageForms[defaultLanguage.languageID]) {
      setHasEmptyRequiredFields(true)
      return
    }
    
    const form = languageForms[defaultLanguage.languageID]
    const values = form.getValues()
    
    let isEmpty = false
    fields.forEach(field => {
      if (field.required && (!values[field.id] || values[field.id].trim() === '')) {
        isEmpty = true
      }
    })
    
    // Only update if there's a change to avoid unnecessary re-renders
    setHasEmptyRequiredFields(prev => {
      if (prev !== isEmpty) {
        return isEmpty
      }
      return prev
    })
    
    // Only set expanded if we're in edit mode and fields are empty
    if (isEmpty && isEditMode) {
      setIsExpanded(true)
    }
    
    if (onFormValidityChange) {
      onFormValidityChange(
        !isEmpty && subsectionExists,
        isEmpty ? t('createMainSubSection.messages.enterMainSectionData') : undefined
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
        setActiveTab(lang.languageID)
        toast({
          title: t('createMainSubSection.messages.validationError'),
          description: `${t('createMainSubSection.messages.checkFormErrors')} ${lang.name || lang.language}.`,
          variant: "destructive"
        })
        return false
      }
    }
    return true
  }
  
  // Create new subsection
  const handleCreateSubsection = async () => {
    if (!(await validateAllForms())) return
    try {
      setIsCreating(true)
      const subSectionData = {
        name: sectionConfig.name,
        description: sectionConfig.description,
        type: sectionConfig.type,
        slug: `${sectionConfig.slug}-main${Date.now()}`,
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
        
        // Create elements and translations with proper error handling
        const elementPromises = sectionConfig.fields.map(async (field, index) => {
          try {
            const elementData = {
              name: field.label,
              defaultContent: languageForms[defaultLanguage.languageID].getValues()[field.id],
              type: field.type === 'textarea' ? 'text' : 'text',
              order: index,
              parent: createdSubsection._id,
              WebSiteId: websiteId,
              isActive: true
            }
            
            const elementResponse = await createElementMutation.mutateAsync(elementData)
            const createdElement = elementResponse.data
            
            if (!createdElement || !createdElement._id) {
              throw new Error(`Failed to create content element for ${field.label}`)
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
                console.error(`Error creating translation for ${field.label} in language ${lang.languageID}:`, translationError)
                throw translationError
              }
            })
            
            await Promise.all(translationPromises)
            return createdElement
          } catch (elementError) {
            console.error(`Error creating element for ${field.label}:`, elementError)
            throw elementError
          }
        })
        
        await Promise.all(elementPromises)
        
        // After all operations are complete, refetch the data to update the UI
        setTimeout(async () => {
          try {
            await refetchCompleteSubsections()
          } catch (refetchError) {
            console.error("Error refetching data after creation:", refetchError)
          }
        }, 500)
        
        setSubsectionExists(true)
        setHasEmptyRequiredFields(false)
        
        if (onSubSectionCreated) {
          onSubSectionCreated(createdSubsection)
        }
        
        if (onFormValidityChange) {
          onFormValidityChange(true)
        }
        
        toast({
          title: t('createMainSubSection.messages.success'),
          description: `${t('createMainSubSection.messages.subsectionCreated')} ${languages.length} ${t('createMainSubSection.messages.languages')}.`
        })
        
        setIsEditMode(false)
        setIsExpanded(false)
      }
    } catch (error: any) {
      console.error("Error in handleCreateSubsection:", error)
      toast({
        title: t('createMainSubSection.messages.errorCreating'),
        description: error.message || t('createMainSubSection.messages.unexpectedError'),
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
      setIsCreatingElements(false)
    }
  }
  
  // Update existing subsection
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
      
      // Update elements and translations with proper error handling
      const updatePromises = contentElements.map(async (element) => {
        try {
          const field = sectionConfig.fields.find(f => f.label === element.name)
          if (!field) return
          
          if (defaultLanguage && languageForms[defaultLanguage.languageID]) {
            const defaultContent = languageForms[defaultLanguage.languageID].getValues()[field.id]
            await updateElementMutation.mutateAsync({
              id: element._id,
              data: { defaultContent }
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
              
              // Find the translation for this language - improved comparison
              const existingTranslation = elementTranslations.find(t => {
                // Handle both string ID and object reference cases
                const translationLangId = typeof t.language === 'string' ? t.language : (t.language?._id || t.language)
                const currentLangId = lang._id
                return translationLangId === currentLangId
              })
              
              if (existingTranslation) {
                // If translation exists, update it
                return await updateTranslationMutation.mutateAsync({
                  id: existingTranslation._id,
                  data: { content }
                })
              } else {
                // If translation doesn't exist, create it
                return await createTranslationMutation.mutateAsync({
                  content,
                  language: lang._id,
                  contentElement: element._id,
                  isActive: true
                })
              }
            } catch (translationError) {
              console.error(`Error updating translation for ${element.name} in language ${lang.languageID}:`, translationError)
              throw translationError
            }
          })
          
          await Promise.all(translationPromises)
        } catch (elementError) {
          console.error(`Error updating element ${element.name}:`, elementError)
          throw elementError
        }
      })
      
      await Promise.all(updatePromises)
      
      // After all operations are complete, refetch the data to update the UI
      setTimeout(async () => {
        try {
          await refetchCompleteSubsections()
        } catch (refetchError) {
          console.error("Error refetching data after update:", refetchError)
        }
      }, 500)
      
      checkFormsEmpty()
      toast({
        title: t('createMainSubSection.messages.success'),
        description: `${t('createMainSubSection.messages.subsectionUpdated')} ${languages.length} ${t('createMainSubSection.messages.languages')}.`
      })
      
      setIsEditMode(false)
      setIsExpanded(false)
    } catch (error: any) {
      console.error("Error in handleUpdateSubsection:", error)
      toast({
        title: t('createMainSubSection.messages.errorUpdating'),
        description: error.message || t('createMainSubSection.messages.unexpectedError'),
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Render form content for each language tab
  const renderLanguageForms = () => {
    return languages.map((lang: { languageID: Key ; name: any; language: any }) => {
      const form = languageForms[String(lang.languageID)]
      if (!form) return null
      return (
        <TabsContent key={lang.languageID} value={String(lang.languageID)}>
          <Form {...form}>
            <div className="space-y-6">
              {sectionConfig.fields.map((field) => (
                <FormField
                  key={`${lang.languageID}-${field.id}`}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => (
                    <FormItem className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                      <FormLabel className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">{t('createMainSubSection.form.requiredIndicator')}</span>}
                      </FormLabel>
                      <FormControl>
                        {field.type === 'textarea' ? (
                          <Textarea
                            placeholder={field.placeholder || t('createMainSubSection.placeholders.enterFieldFor', { 
                              field: field.label.toLowerCase(), 
                              language: lang.name || lang.language 
                            })}
                            {...formField}
                            className="min-h-[120px] border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <Input
                            placeholder={field.placeholder || t('createMainSubSection.placeholders.enterFieldFor', { 
                              field: field.label.toLowerCase(), 
                              language: lang.name || lang.language 
                            })}
                            {...formField}
                            className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
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
              ))}
            </div>
          </Form>
        </TabsContent>
      )
    })
  }
  
  // Display states
  if (isLoadingCompleteSubsections || isLoadingLanguages) {
    return <LoadingCard />
  }
  
  if (completeSubsectionsError) {
    return (
      <ErrorCard
        errorMessage={t('createMainSubSection.messages.couldNotCheck')}
        onRetry={() => {
          refetchCompleteSubsections();
        }}
      />
    )
  }
  
  if (languages.length === 0) {
    return (
      <WarningCard
        title={t('createMainSubSection.titles.noLanguages')}
        message={t('createMainSubSection.descriptions.noLanguages')}
      />
    )
  }
  
  if (subsectionExists && subsection && !isEditMode) {
    const subsectionData = {
      ...subsection,
      elements: contentElements
    }
    const metaFields = [
      { key: 'name', label: t('createMainSubSection.metaFields.name') },
      { key: 'description', label: t('createMainSubSection.metaFields.description'), condition: (data: any) => !!data.description },
      { key: 'slug', label: t('createMainSubSection.metaFields.slug') },
      { key: 'languages', label: t('createMainSubSection.metaFields.languages'), condition: (data: any) => data.languages && data.languages.length > 0 },
      { key: 'elements.length', label: t('createMainSubSection.metaFields.contentElements') }
    ]
    return (
      <SuccessCard
        title={t('createMainSubSection.titles.subsectionAvailable')}
        description={t('createMainSubSection.descriptions.subsectionAvailable')}
        onEdit={() => {
          setIsEditMode(true)
          setIsExpanded(true)
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
          <span>{subsectionExists ? t('createMainSubSection.titles.editSubsection') : t('createMainSubSection.titles.createSubsection')}</span>
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
          ? t('createMainSubSection.descriptions.editSubsection')
          : t('createMainSubSection.descriptions.createSubsection')
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
            <LanguageTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              languages={languages}
            >
              {renderLanguageForms()}
            </LanguageTabs>
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
              <span>{t('createMainSubSection.buttons.showForm')}</span>
            </div>
          </motion.button>
        )}
      </div>
    </MainFormCard>
  )
}