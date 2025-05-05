"use client"

import { forwardRef, useEffect, useState, useRef, Key } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { 
  Save, 
  Trash2, 
  Plus, 
  AlertTriangle,
  Loader2
} from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/src/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-conent-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-conent-translitions"
import { useToast } from "@/src/hooks/use-toast"
import { IconComponent, LoadingDialog } from "./MainSectionComponents"
import { createProcessStepsSchema } from "../../Utils/language-specifi-schemas"
import { createProcessStepsDefaultValues } from "../../Utils/Language-default-values"
import { createFormRef } from "../../Utils/Expose-form-data"
import { processAndLoadData } from "../../Utils/load-form-data"
import { HeroFormProps, SubSectionData } from "../../types/HeroFor.types"
import { HeroFormRef } from "../../types/BenefitsForm.types"
import { createLanguageCodeMap } from "../../Utils/language-utils"
import DeleteServiceDialog from "@/src/components/DeleteServiceDialog"

// Available icons
const availableIcons = [
  "Car",
  "MonitorSmartphone",
  "Settings",
  "CreditCard",
  "Clock",
  "MessageSquare",
  "LineChart",
  "Headphones",
]

const ProcessStepsForm = forwardRef<HeroFormRef, HeroFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const formSchema = createProcessStepsSchema(languageIds, activeLanguages)
    const [isLoadingData, setIsLoadingData] = useState(!slug)
    const [dataLoaded, setDataLoaded] = useState(!slug)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)
    const [stepCountMismatch, setStepCountMismatch] = useState(false)
    const [existingSubSectionId, setExistingSubSectionId] = useState(null)
    const [contentElements, setContentElements] = useState<Array<{ _id: string; name: string; order: number }>>([])
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    // State for delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [stepToDelete, setStepToDelete] = useState<{ langCode: string, index: number } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Get default language code for form values
    const defaultLangCode = activeLanguages.length > 0 ? activeLanguages[0].languageID : "en"
    const defaultValues = createProcessStepsDefaultValues(languageIds, activeLanguages)

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues:defaultValues
    })

    const onDataChangeRef = useRef(onDataChange)
    useEffect(() => {
      onDataChangeRef.current = onDataChange
    }, [onDataChange])

    // API hooks
    const { useCreate: useCreateSubSection, useGetCompleteBySlug } = useSubSections()
    const {
      useCreate: useCreateContentElement,
      useUpdate: useUpdateContentElement,
      useDelete: useDeleteContentElement,
    } = useContentElements()
    const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()

    const createSubSection = useCreateSubSection()
    const createContentElement = useCreateContentElement()
    const updateContentElement = useUpdateContentElement()
    const deleteContentElement = useDeleteContentElement()
    const bulkUpsertTranslations = useBulkUpsertTranslations()

    // Query for complete subsection data by slug if provided
    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", false)

    // Check if all languages have the same number of steps
    const validateStepCounts = () => {
      const values = form.getValues()
      const counts = Object.values(values).map((langSteps) => (Array.isArray(langSteps) ? langSteps.length : 0))
      const allEqual = counts.every((count) => count === counts[0])
      setStepCountMismatch(!allEqual)
      return allEqual
    }

    // Function to process and load data into the form
    const processProcessStepsData = (subsectionData: SubSectionData | null) => {
      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          // Group elements by step number
          groupElements: (elements) => {
            const stepGroups = {};
            elements.forEach((element) => {
              const match = element.name.match(/Step (\d+)/i);
              if (match) {
                const stepNumber = Number.parseInt(match[1]);
                if (!stepGroups[stepNumber]) {
                  stepGroups[stepNumber] = [];
                }
                stepGroups[stepNumber].push(element);
              }
            });
            return stepGroups;
          },
          
          // Process a step group for a language
          processElementGroup: (stepNumber, elements, langId, getTranslationContent) => {
            const iconElement = elements.find((el) => el.name.includes("Icon"));
            const titleElement = elements.find((el) => el.name.includes("Title"));
            const descriptionElement = elements.find((el) => el.name.includes("Description"));
            
            // Only create a step if we have title and description
            if (titleElement && descriptionElement) {
              const title = getTranslationContent(titleElement, "");
              const description = getTranslationContent(descriptionElement, "");
              const icon = iconElement ? (iconElement.defaultContent || "Car") : "Car";
              
              return { icon, title, description };
            }
            
            // Return default if we don't have required elements
            return { icon: "Car", title: "", description: "" };
          },
          
          // Default value for process steps
          getDefaultValue: () => [{
            icon: "Car",
            title: "",
            description: ""
          }]
        },
        {
          setExistingSubSectionId,
          setContentElements,
          setDataLoaded,
          setHasUnsavedChanges,
          setIsLoadingData,
          validateCounts: validateStepCounts
        }
      );
    };

    // Effect to populate form with existing data
    useEffect(() => {
      if (!slug) {
        return
      }

      if (dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return
      }

      setIsLoadingData(true)
      processProcessStepsData(completeSubsectionData.data)
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, form, activeLanguages, languageIds, slug])

    // Track form changes
    useEffect(() => {
      if (isLoadingData || !dataLoaded) return

      const subscription = form.watch((value) => {
        setHasUnsavedChanges(true)
        validateStepCounts()
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value)
        }
      })
      return () => subscription.unsubscribe()
    }, [form, isLoadingData, dataLoaded])

    // Function to add a new process step to all languages
    const addProcessStep = () => {
      const newStep = {
        icon: "Car",
        title: "",
        description: "",
      }

      Object.keys(form.getValues()).forEach((langCode) => {
        const currentSteps = form.getValues()[langCode] || []
        form.setValue(langCode, [...currentSteps, newStep], {
          shouldDirty: true,
          shouldValidate: true,
        })
      })

      toast({
        title: "Step added",
        description: "A new process step has been added to all languages.",
      })
    }

    // Function to trigger delete confirmation dialog
    const confirmDeleteStep = (langCode: string, index: number) => {
      setStepToDelete({ langCode, index })
      setDeleteDialogOpen(true)
    }

    // Function to remove a process step after confirmation
    const removeProcessStep = async () => {
      if (!stepToDelete) return
      
      const { langCode, index } = stepToDelete
      setIsDeleting(true)
      
      const currentSteps = form.getValues()[langCode] || []
      if (currentSteps.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one process step",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      if (existingSubSectionId && contentElements.length > 0) {
        try {
          const stepNumber = index + 1
          const stepElements = contentElements.filter((element) => {
            const match = element.name.match(/Step (\d+)/i)
            return match && Number.parseInt(match[1]) === stepNumber
          })

          if (stepElements.length > 0) {
            stepElements.forEach(async (element) => {
              try {
                await deleteContentElement.mutateAsync(element._id)
                console.log(`Deleted content element: ${element.name}`)
              } catch (error) {
                console.error(`Failed to delete content element ${element.name}:`, error)
              }
            })

            setContentElements((prev) =>
              prev.filter((element) => {
                const match = element?.name?.match(/Step (\d+)/i)
                return !(match && Number.parseInt(match[1]) === stepNumber)
              }),
            )

            toast({
              title: "Step deleted",
              description: `Step ${stepNumber} has been deleted from the database`,
            })
          }

          const remainingElements = contentElements.filter((element) => {
            const match = element.name.match(/Step (\d+)/i)
            return match && Number.parseInt(match[1]) > stepNumber
          })

          remainingElements.forEach(async (element) => {
            const match = element.name.match(/Step (\d+)/i)
            if (match) {
              const oldNumber = Number.parseInt(match[1])
              const newNumber = oldNumber - 1
              const newName = element.name.replace(`Step ${oldNumber}`, `Step ${newNumber}`)
              const newOrder = element.order - 3

              try {
                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: {
                    name: newName,
                    order: newOrder,
                  },
                })
                console.log(`Updated element ${element.name} to ${newName}`)
              } catch (error) {
                console.error(`Failed to update element ${element.name}:`, error)
              }
            }
          })
        } catch (error) {
          console.error("Error removing process step elements:", error)
          toast({
            title: "Error removing step",
            description: "There was an error removing the step from the database",
            variant: "destructive",
          })
        }
      }

      Object.keys(form.getValues()).forEach((langCode) => {
        const updatedSteps = [...(form.getValues()[langCode] || [])]
        updatedSteps.splice(index, 1)
        form.setValue(langCode, updatedSteps)
      })
      
      setIsDeleting(false)
    }

    // Function to get step counts by language
    const getStepCountsByLanguage = () => {
      const values = form.getValues()
      return Object.entries(values).map(([langCode, steps]) => ({
        language: langCode,
        count: Array.isArray(steps) ? steps.length : 0,
      }))
    }

    const handleSave = async () => {
      const isValid = await form.trigger()
      const hasEqualStepCounts = validateStepCounts()

      if (!hasEqualStepCounts) {
        setIsValidationDialogOpen(true)
        return
      }

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly",
          variant: "destructive",
        })
        return
      }

      setIsSaving(true)
      setIsLoadingData(true)
      try {
        const allFormValues = form.getValues()
        console.log("Form values at save:", allFormValues)

        let sectionId = existingSubSectionId

        if (!existingSubSectionId) {
          const subsectionData = {
            name: "Process Steps Section",
            slug: slug || `process-steps-section-${Date.now()}`,
            description: "Process steps section for the website",
            isActive: true,
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
          }

          toast({
            title: "Creating new process steps section...",
            description: "Setting up your new process steps content.",
          })

          const newSubSection = await createSubSection.mutateAsync(subsectionData)
          sectionId = newSubSection.data._id
          setExistingSubSectionId(sectionId)
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID")
        }

        const langCodeToIdMap: Record<string, string> = activeLanguages.reduce((acc, lang) => {
          acc[lang.languageID] = lang._id
          return acc
        }, {} as Record<string, string>)

        // Use the first language values just to determine the number of steps
        const firstLangCode = Object.keys(allFormValues)[0]
        const steps = allFormValues[firstLangCode]

        if (!Array.isArray(steps)) {
          throw new Error("Invalid steps data")
        }

        const updatedContentElements = [...contentElements]

        if (existingSubSectionId && contentElements.length > 0) {
          const stepGroups: { [key: number]: Array<{ _id: string; name: string; order: number; defaultContent?: string }> } = {}
          contentElements.forEach((element) => {
            const match = element.name.match(/Step (\d+)/i)
            if (match) {
              const stepNumber = Number.parseInt(match[1])
              if (!stepGroups[stepNumber]) {
                stepGroups[stepNumber] = []
              }
              stepGroups[stepNumber].push(element)
            }
          })

          const translations: { content: any; language: any; contentElement: any; isActive: boolean }[] = []
          // Process each step
          for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            const stepNumber = stepIndex + 1
            const stepElements = stepGroups[stepNumber]

            if (stepElements) {
              const iconElement = stepElements.find((el: { name: string | string[] }) => el.name.includes("Icon"))
              const titleElement = stepElements.find((el: { name: string | string[] }) => el.name.includes("Title"))
              const descriptionElement = stepElements.find((el: { name: string | string[] }) => el.name.includes("Description"))

              // Update the icon only for the first language
              const firstLangStep = allFormValues[defaultLangCode][stepIndex]
              if (iconElement && firstLangStep?.icon) {
                await updateContentElement.mutateAsync({
                  id: iconElement._id,
                  data: {
                    defaultContent: firstLangStep.icon,
                  },
                })
                const foundElement = updatedContentElements.find((e) => e._id === iconElement._id)
                if (foundElement) {
                  foundElement.defaultContent = firstLangStep.icon
                }
              }

              // Update title and description for all languages
              Object.entries(allFormValues).forEach(([langCode, langSteps]) => {
                if (!Array.isArray(langSteps) || !langSteps[stepIndex]) return
                const langId = langCodeToIdMap[langCode]
                if (!langId) return
                const step = langSteps[stepIndex]

                if (titleElement && step.title) {
                  translations.push({
                    content: step.title,
                    language: langId,
                    contentElement: titleElement._id,
                    isActive: true,
                  })
                }

                if (descriptionElement && step.description) {
                  translations.push({
                    content: step.description,
                    language: langId,
                    contentElement: descriptionElement._id,
                    isActive: true,
                  })
                }
              })
            }
          }

          // Create new steps as needed
          const existingStepCount = Object.keys(stepGroups).length
          if (steps.length > existingStepCount) {
            for (let stepNumber = existingStepCount + 1; stepNumber <= steps.length; stepNumber++) {
              const stepIndex = stepNumber - 1
              
              // Create elements with icon from first language only
              const firstLangStep = allFormValues[defaultLangCode][stepIndex]
              
              const iconElement = await createContentElement.mutateAsync({
                name: `Step ${stepNumber} - Icon`,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: (stepNumber - 1) * 3,
                defaultContent: firstLangStep?.icon || "Car",
              })

              const titleElement = await createContentElement.mutateAsync({
                name: `Step ${stepNumber} - Title`,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: (stepNumber - 1) * 3 + 1,
                defaultContent: firstLangStep?.title || "",
              })

              const descriptionElement = await createContentElement.mutateAsync({
                name: `Step ${stepNumber} - Description`,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: (stepNumber - 1) * 3 + 2,
                defaultContent: firstLangStep?.description || "",
              })

              updatedContentElements.push(iconElement.data, titleElement.data, descriptionElement.data)

              // Add translations for all languages
              Object.entries(allFormValues).forEach(([langCode, langSteps]) => {
                if (!Array.isArray(langSteps) || !langSteps[stepIndex]) return
                const langId = langCodeToIdMap[langCode]
                if (!langId) return
                const step = langSteps[stepIndex]

                if (step.title) {
                  translations.push({
                    content: step.title,
                    language: langId,
                    contentElement: titleElement.data._id,
                    isActive: true,
                  })
                }

                if (step.description) {
                  translations.push({
                    content: step.description,
                    language: langId,
                    contentElement: descriptionElement.data._id,
                    isActive: true,
                  })
                }
              })
            }
          }

          if (translations.length > 0) {
            await bulkUpsertTranslations.mutateAsync(translations)
          }
        } else {
          // Create new section from scratch
          const translations: { content: any; language: any; contentElement: any; isActive: boolean }[] = []
          for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            const stepNumber = stepIndex + 1
            // Use first language for the icon
            const firstLangStep = allFormValues[defaultLangCode][stepIndex]

            const iconElement = await createContentElement.mutateAsync({
              name: `Step ${stepNumber} - Icon`,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: stepIndex * 3,
              defaultContent: firstLangStep?.icon || "Car",
            })

            const titleElement = await createContentElement.mutateAsync({
              name: `Step ${stepNumber} - Title`,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: stepIndex * 3 + 1,
              defaultContent: firstLangStep?.title || "",
            })

            const descriptionElement = await createContentElement.mutateAsync({
              name: `Step ${stepNumber} - Description`,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: stepIndex * 3 + 2,
              defaultContent: firstLangStep?.description || "",
            })

            updatedContentElements.push(iconElement.data, titleElement.data, descriptionElement.data)

            // Add translations for all languages
            Object.entries(allFormValues).forEach(([langCode, langSteps]) => {
              if (!Array.isArray(langSteps) || !langSteps[stepIndex]) return
              const langId = langCodeToIdMap[langCode]
              if (!langId) return
              const step = langSteps[stepIndex]

              if (step.title) {
                translations.push({
                  content: step.title,
                  language: langId,
                  contentElement: titleElement.data._id,
                  isActive: true,
                })
              }

              if (step.description) {
                translations.push({
                  content: step.description,
                  language: langId,
                  contentElement: descriptionElement.data._id,
                  isActive: true,
                })
              }
            })
          }

          if (translations.length > 0) {
            await bulkUpsertTranslations.mutateAsync(translations)
          }
        }

        setContentElements(updatedContentElements)

        toast({
          title: existingSubSectionId ? "Process steps updated successfully!" : "Process steps created successfully!",
          description: "All changes have been saved.",
          duration: 5000,
        })

        if (slug) {
          toast({
            title: "Refreshing content",
            description: "Loading the updated content...",
          })

          const result = await refetch()
          if (result.data?.data) {
            setDataLoaded(false)
            await processProcessStepsData(result.data.data)
          }
        }

        setHasUnsavedChanges(false)
      } catch (error) {
        console.error("Operation failed:", error)
        toast({
          title: existingSubSectionId ? "Error updating process steps" : "Error creating process steps",
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          duration: 5000,
        })
      } finally {
        setIsLoadingData(false)
        setIsSaving(false)
      }
    }

    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      existingSubSectionId,
      contentElements,
      componentName: 'Process steps'
    });

    // Get language codes for display
    const languageCodes = createLanguageCodeMap(activeLanguages);

    // Determine if a language is the first language (for icon control)
    const isFirstLanguage = (langCode: string) => langCode === defaultLangCode;

    return (
      <div className="space-y-6">
        <LoadingDialog 
          isOpen={isSaving} 
          title={existingSubSectionId ? "Updating Process Steps" : "Creating Process Steps"} 
          description="Please wait while we save your changes..."
        />
        
        {slug && (isLoadingData || isLoadingSubsection) && !dataLoaded ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p className="text-muted-foreground">Loading process steps data...</p>
          </div>
        ) : (
          <Form {...form}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {languageIds.map((langId) => {
                const langCode = languageCodes[langId] || langId
                const isFirst = isFirstLanguage(langCode)
                
                return (
                  <Card key={langId} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
                          {langCode}
                        </span>
                        Process Steps Section
                        {isFirst && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Icon Control
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Manage process steps content for {langCode.toUpperCase()}
                        {isFirst && (
                          <span className="block text-xs text-blue-600 mt-1">
                            Icons defined here will be used for all languages
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.watch(langCode)?.map((_: any, index: Key | null | undefined) => (
                        <Card key={index} className="border border-muted">
                          <CardHeader className="p-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Step {Number(index) + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => confirmDeleteStep(langCode, Number(index))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-4">
                            {/* Only show icon selector for first language */}
                            {isFirst && (
                              <FormField
                                control={form.control}
                                name={`${langCode}.${index}.icon`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an icon">
                                            <div className="flex items-center">
                                              <span className="mr-2"><IconComponent iconName={field.value} /></span>
                                              {field.value}
                                            </div>
                                          </SelectValue>
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {availableIcons.map((icon) => (
                                          <SelectItem key={icon} value={icon}>
                                            <div className="flex items-center">
                                              <span className="mr-2"><IconComponent iconName={icon} /></span>
                                              {icon}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                            {/* For other languages, show the icon but don't allow selection */}
                            {!isFirst && (
                              <div className="mb-4">
                                <FormLabel className="text-muted-foreground">Icon (controlled by {defaultLangCode})</FormLabel>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted/10">
                                  <span className="mr-2">
                                    <IconComponent iconName={form.watch(`${defaultLangCode}.${index}.icon`) || "Car"} />
                                  </span>
                                  {form.watch(`${defaultLangCode}.${index}.icon`) || "Car"}
                                </div>
                                <input 
                                  type="hidden" 
                                  {...form.register(`${langCode}.${index}.icon`)} 
                                  value={form.watch(`${defaultLangCode}.${index}.icon`) || "Car"}
                                />
                              </div>
                            )}
                            <FormField
                              control={form.control}
                              name={`${langCode}.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`${langCode}.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Enter description" className="min-h-[80px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addProcessStep()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Process Step
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Form>
        )}
        <div className="flex justify-end mt-6">
          {stepCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Each language must have the same number of steps</span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingData || stepCountMismatch || isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {existingSubSectionId ? "Update Process Steps" : "Save Process Steps"}
              </>
            )}
          </Button>
        </div>
        
        {/* Step Count Mismatch Dialog */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Step Count Mismatch</DialogTitle>
              <DialogDescription>
                <div className="mt-4 mb-4">
                  Each language must have the same number of process steps before saving. Please add or remove steps to
                  ensure all languages have the same count:
                </div>
                <ul className="list-disc pl-6 space-y-1">
                  {getStepCountsByLanguage().map(({ language, count }) => (
                    <li key={language}>
                      <span className="font-semibold uppercase">{language}</span>: {count} steps
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Step Confirmation Dialog */}
        <DeleteServiceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={stepToDelete ? `Step ${stepToDelete.index + 1}` : ''}
          onConfirm={removeProcessStep}
          isDeleting={isDeleting}
        />
      </div>
    )
  },
)

ProcessStepsForm.displayName = "ProcessStepsForm"

export default ProcessStepsForm