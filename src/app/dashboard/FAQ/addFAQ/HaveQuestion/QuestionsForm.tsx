"use client"

import { forwardRef, useEffect, useState, useRef, useCallback, type Key } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Save, AlertTriangle, Loader2, Eye } from "lucide-react"
import { Form } from "@/src/components/ui/form"
import { Button } from "@/src/components/ui/button"
import { Switch } from "@/src/components/ui/switch"
import { useToast } from "@/src/hooks/use-toast"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { ValidationDialog } from "./ValidationDialog"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import type { StepToDelete } from "@/src/api/types/sections/service/serviceSections.types"
import type { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types"
import type { SubSection } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { createHaveFaqQuestionsSchema } from "../../../services/addService/Utils/language-specific-schemas"
import {
  createHaveFaqQuestionsDefaultValues,
  createLanguageCodeMap,
} from "../../../services/addService/Utils/Language-default-values"
import {
  createFormRef,
  getAvailableIcons,
  getSafeIconValue,
  getSubSectionCountsByLanguage,
  useForceUpdate,
  validateSubSectionCounts,
} from "../../../services/addService/Utils/Expose-form-data"
import { processAndLoadData } from "../../../services/addService/Utils/load-form-data"
import { QuestionsLanguageCard } from "./QuestionsLanguageCard"
import type {
  faqHaveQuestionFormProps,
  faqHaveQuestionFormRef,
  FaqHaveQuestionsFormState,
} from "@/src/api/types/sections/FAQ/faqSection.types"

// Main Component
const QuestionsForm = forwardRef<faqHaveQuestionFormRef, faqHaveQuestionFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { websiteId } = useWebsiteContext()
    const formSchema = createHaveFaqQuestionsSchema(languageIds, activeLanguages)
    const defaultValues = createHaveFaqQuestionsDefaultValues(languageIds, activeLanguages)
    interface FormData {
      [key: string]: Array<{
        icon: string
        title: string
        description: string
        buttonText: string
        id?: string
      }>
    }

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
      mode: "onChange",
    })

    // State management
    const [state, setState] = useState<FaqHaveQuestionsFormState>({
      isLoadingData: !slug,
      dataLoaded: !slug,
      hasUnsavedChanges: false,
      isValidationDialogOpen: false,
      benefitCountMismatch: false,
      existingSubSectionId: null,
      contentElements: [],
      isSaving: false,
    })

    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
    const [stepToDelete, setStepToDelete] = useState<StepToDelete | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isSubSectionActive, setIsSubSectionActive] = useState<boolean>(false)
    const [showForm, setShowForm] = useState<boolean>(false)

    const updateState = useCallback((newState: Partial<FaqHaveQuestionsFormState>) => {
      setState((prev) => ({ ...prev, ...newState }))
    }, [])

    // Hooks
    const { toast } = useToast()
    const forceUpdate = useForceUpdate()
    const primaryLanguageRef = useRef<string | null>(null)
    const onDataChangeRef = useRef(onDataChange)

    // API hooks
    const { useCreate: useCreateSubSection, useGetCompleteBySlug, useToggleActive } = useSubSections()
    const {
      useCreate: useCreateContentElement,
      useUpdate: useUpdateContentElement,
      useDelete: useDeleteContentElement,
    } = useContentElements()
    const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()

    const createSubSection = useCreateSubSection()
    const toggleActive = useToggleActive()
    const createContentElement = useCreateContentElement()
    const updateContentElement = useUpdateContentElement()
    const deleteContentElement = useDeleteContentElement()
    const bulkUpsertTranslations = useBulkUpsertTranslations()

    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", Boolean(slug))

    // Update onDataChange ref
    useEffect(() => {
      onDataChangeRef.current = onDataChange
    }, [onDataChange])

    // Set primary language and initial active status
    useEffect(() => {
      console.log("useEffect for completeSubsectionData", {
        completeSubsectionData,
        isLoadingSubsection,
        slug,
        showForm,
      })
      if (languageIds.length > 0) {
        primaryLanguageRef.current = languageIds[0]
      }
      if (completeSubsectionData?.data && !showForm) {
        setShowForm(true)
        setIsSubSectionActive(completeSubsectionData.data.isActive)
      }
    }, [languageIds, completeSubsectionData, isLoadingSubsection, showForm])

    // Sync icons across languages
    const syncIcons = useCallback(
      (index: number, iconValue: string) => {
        const formValues = form.getValues()
        const allLanguages = Object.keys(formValues)
        const primaryLang = allLanguages[0]

        allLanguages.forEach((lang) => {
          if (lang !== primaryLang) {
            if (formValues[lang] && Array.isArray(formValues[lang]) && formValues[lang].length > index) {
              form.setValue(`${lang}.${index}.icon`, iconValue)
            }
          }
        })
      },
      [form],
    )

    // Validate benefit counts
    const validateFormFaqCounts = useCallback(() => {
      const values = form.getValues()
      const isValid = validateSubSectionCounts(values)
      updateState({ benefitCountMismatch: !isValid })
      return isValid
    }, [form, updateState])

    // Toggle subsection active status
    const handleToggleActive = useCallback(async () => {
      if (!state.existingSubSectionId) return

      try {
        await toggleActive.mutateAsync({
          id: state.existingSubSectionId,
          status: !isSubSectionActive,
        })
        setIsSubSectionActive(!isSubSectionActive)
        toast({
          title: `Subsection ${!isSubSectionActive ? "activated" : "deactivated"}`,
          description: `The FAQ subsection is now ${!isSubSectionActive ? "active" : "inactive"}.`,
        })
      } catch (error) {
        console.error("Error toggling subsection active status:", error)
        toast({
          title: "Error",
          description: "Failed to toggle subsection active status.",
          variant: "destructive",
        })
      }
    }, [state.existingSubSectionId, isSubSectionActive, toggleActive, toast])

    // Show form handler
    const handleShowForm = useCallback(() => {
      console.log("handleShowForm called, setting showForm to true")
      setShowForm(true)
    }, [])

    // Remove process step
    const removeProcessStep = useCallback(async () => {
      if (!stepToDelete) return

      const { langCode, index } = stepToDelete
      setIsDeleting(true)

      // Prevent removing the only FAQ
      const currentSteps = form.getValues()[langCode] || []
      if (currentSteps.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one FAQ",
          variant: "destructive",
        })
        setIsDeleting(false)
        setDeleteDialogOpen(false)
        return
      }

      if (state.existingSubSectionId && state.contentElements.length > 0) {
        try {
          const stepNumber = index + 1
          const stepElements = state.contentElements.filter((element) => {
            const match = element.name.match(/Faq (\d+)/i)
            return match && Number.parseInt(match[1]) === stepNumber
          })

          if (stepElements.length > 0) {
            await Promise.all(
              stepElements.map(async (element) => {
                await deleteContentElement.mutateAsync(element._id)
              }),
            )

            updateState({
              contentElements: state.contentElements.filter((element) => {
                const match = element.name.match(/Faq (\d+)/i)
                return !(match && Number.parseInt(match[1]) === stepNumber)
              }),
            })

            toast({
              title: "Step deleted",
              description: `Step ${stepNumber} has been deleted from the database`,
            })
          }

          const remainingElements = state.contentElements.filter((element) => {
            const match = element.name.match(/Faq (\d+)/i)
            return match && Number.parseInt(match[1]) > stepNumber
          })

          await Promise.all(
            remainingElements.map(async (element) => {
              const match = element.name.match(/Faq (\d+)/i)
              if (match) {
                const oldNumber = Number.parseInt(match[1])
                const newNumber = oldNumber - 1
                const newName = element.name.replace(`Faq ${oldNumber}`, `Faq ${newNumber}`)
                const newOrder = element.order - 4

                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: { name: newName, order: newOrder },
                })
              }
            }),
          )
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
      setDeleteDialogOpen(false)
      validateFormFaqCounts()
    }, [
      stepToDelete,
      form,
      state.existingSubSectionId,
      state.contentElements,
      deleteContentElement,
      updateContentElement,
      toast,
      validateFormFaqCounts,
      updateState,
    ])

    // Process benefits data
    const processFaqsData = useCallback(
      (subsectionData: SubSection) => {
        processAndLoadData(
          subsectionData,
          form,
          languageIds,
          activeLanguages,
          {
            groupElements: (elements) => {
              const benefitGroups: { [key: number]: ContentElement[] } = {}
              elements.forEach((element: any) => {
                const match = element.name.match(/Faq (\d+)/i)
                if (match) {
                  const benefitNumber = Number.parseInt(match[1], 10)
                  if (!benefitGroups[benefitNumber]) {
                    benefitGroups[benefitNumber] = []
                  }
                  benefitGroups[benefitNumber].push(element)
                }
              })
              return benefitGroups
            },
            processElementGroup: (benefitNumber, elements, langId, getTranslationContent) => {
              const iconElement = elements.find((el) => el.name.includes("Icon"))
              const titleElement = elements.find((el) => el.name.includes("Title"))
              const descriptionElement = elements.find((el) => el.name.includes("Description"))
              const buttonTextElement = elements.find((el) => el.name.includes("ButtonText"))

              if (titleElement && descriptionElement) {
                const title = getTranslationContent(titleElement, "")
                const description = getTranslationContent(descriptionElement, "")
                const buttonText = buttonTextElement ? getTranslationContent(buttonTextElement, "") : "Read More"
                const icon = iconElement?.defaultContent || "Clock"

                return { icon, title, description, buttonText }
              }

              return { icon: "Clock", title: "", description: "", buttonText: "Read More" }
            },
            getDefaultValue: () => [{ icon: "Clock", title: "", description: "", buttonText: "Read More" }],
          },
          {
            setExistingSubSectionId: (id) => updateState({ existingSubSectionId: id }),
            setContentElements: (elements) => updateState({ contentElements: elements }),
            setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
            setHasUnsavedChanges: (hasChanges) => updateState({ hasUnsavedChanges: hasChanges }),
            setIsLoadingData: (loading) => updateState({ isLoadingData: loading }),
            validateCounts: validateFormFaqCounts,
          },
        )
      },
      [form, languageIds, activeLanguages, updateState, validateFormFaqCounts],
    )

    // Load existing data
    useEffect(() => {
      if (!slug || state.dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return
      }

      console.log("Loading existing data, calling processFaqsData")
      updateState({ isLoadingData: true })
      processFaqsData(completeSubsectionData.data)
    }, [completeSubsectionData, isLoadingSubsection, state.dataLoaded, slug, processFaqsData])

    // Track form changes
    useEffect(() => {
      if (state.isLoadingData || !state.dataLoaded) return

      const subscription = form.watch((value) => {
        updateState({ hasUnsavedChanges: true })
        validateFormFaqCounts()
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value as FormData)
        }
      })

      return () => subscription.unsubscribe()
    }, [form, state.isLoadingData, state.dataLoaded, validateFormFaqCounts, updateState])

    // Remove benefit
    const removeFaq = useCallback(
      async (langCode: string, index: number) => {
        const currentFaqs = form.getValues()[langCode] || []
        if (currentFaqs.length <= 1) {
          toast({
            title: "Cannot remove",
            description: "You need at least one FAQ entry",
            variant: "destructive",
          })
          return
        }

        const formValues = form.getValues()
        const allLanguages = Object.keys(formValues)
        const firstLang = allLanguages[0]
        const isFirstLanguage = langCode === firstLang

        if (state.existingSubSectionId && state.contentElements.length > 0) {
          try {
            const benefitNumber = index + 1
            const benefitElements = state.contentElements.filter((element) => {
              const match = element.name.match(/Faq (\d+)/i)
              return match && Number.parseInt(match[1]) === benefitNumber
            })

            if (benefitElements.length > 0) {
              for (const element of benefitElements) {
                await deleteContentElement.mutateAsync(element._id)
              }

              updateState({
                contentElements: state.contentElements.filter((element) => {
                  const match = element.name.match(/Faq (\d+)/i)
                  return !(match && Number.parseInt(match[1]) === benefitNumber)
                }),
              })

              toast({
                title: "Faq deleted",
                description: `Faq ${benefitNumber} has been deleted from the database`,
              })
            }

            const remainingElements = state.contentElements.filter((element) => {
              const match = element.name.match(/Faq (\d+)/i)
              return match && Number.parseInt(match[1]) > benefitNumber
            })

            for (const element of remainingElements) {
              const match = element.name.match(/Faq (\d+)/i)
              if (match) {
                const oldNumber = Number.parseInt(match[1])
                const newNumber = oldNumber - 1
                const newName = element.name.replace(`Faq ${oldNumber}`, `Faq ${newNumber}`)
                const newOrder = element.order - 4

                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: { name: newName, order: newOrder },
                })
              }
            }
          } catch (error) {
            console.error("Error removing benefit elements:", error)
            toast({
              title: "Error removing benefit",
              description: "There was an error removing the benefit from the database",
              variant: "destructive",
            })
          }
        }

        if (isFirstLanguage) {
          allLanguages.forEach((lang) => {
            const langFaqs = form.getValues()[lang] || []
            if (langFaqs.length > index) {
              const updatedFaqs = [...langFaqs]
              updatedFaqs.splice(index, 1)
              form.setValue(lang, updatedFaqs)
              form.trigger(lang)
            }
          })
        } else {
          const updatedFaqs = [...currentFaqs]
          updatedFaqs.splice(index, 1)
          form.setValue(langCode, updatedFaqs)
          form.trigger(langCode)
        }

        forceUpdate()

        setTimeout(() => {
          const isValid = validateFormFaqCounts()
          updateState({ benefitCountMismatch: !isValid })
        }, 0)
      },
      [
        form,
        state.existingSubSectionId,
        state.contentElements,
        deleteContentElement,
        updateContentElement,
        toast,
        forceUpdate,
        validateFormFaqCounts,
        updateState,
      ],
    )

    // Save handler
    const handleSave = useCallback(async () => {
      const isValid = await form.trigger()
      const hasEqualFaqCounts = validateFormFaqCounts()

      if (!hasEqualFaqCounts) {
        updateState({ isValidationDialogOpen: true })
        return
      }

      if (!isValid) return

      updateState({ isSaving: true, isLoadingData: true })
      try {
        const allFormValues = form.getValues()

        let sectionId = state.existingSubSectionId
        if (!sectionId) {
          if (!ParentSectionId) {
            throw new Error("Parent section ID is required to create a subsection")
          }

          const subsectionData = {
            name: "Faqs Section",
            slug: slug || `benefits-section-${Date.now()}`,
            description: "Faqs section for the website",
            defaultContent: "",
            isActive: true,
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
            WebSiteId: websiteId,
          }

          const newSubSection = await createSubSection.mutateAsync(subsectionData)
          sectionId = newSubSection.data._id
          console.log("New subsection created", {
            sectionId,
            isActive: newSubSection.data.isActive,
            showForm,
          })
          updateState({ existingSubSectionId: sectionId })
          setIsSubSectionActive(newSubSection.data.isActive)
          setShowForm(true) // Ensure form is shown after creation
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID")
        }

        const langCodeToIdMap = activeLanguages.reduce(
          (acc: { [x: string]: any }, lang: { languageID: string | number; _id: any }) => {
            acc[lang.languageID] = lang._id
            return acc
          },
          {} as Record<string, string>,
        )

        const firstLangKey = Object.keys(allFormValues)[0]
        const benefitCount = Array.isArray(allFormValues[firstLangKey]) ? allFormValues[firstLangKey].length : 0
        const translations: ContentTranslation[] = []

        for (let i = 0; i < benefitCount; i++) {
          const benefitIndex = i + 1
          const iconElementName = `Faq ${benefitIndex} - Icon`
          const titleElementName = `Faq ${benefitIndex} - Title`
          const descElementName = `Faq ${benefitIndex} - Description`
          const buttonTextElementName = `Faq ${benefitIndex} - ButtonText`

          const iconValue = getSafeIconValue(allFormValues, i)

          let iconElement = state.contentElements.find((el) => el.name === iconElementName)
          if (!iconElement) {
            const newElement = await createContentElement.mutateAsync({
              name: iconElementName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 4,
              defaultContent: iconValue,
            })
            iconElement = newElement.data
            if (iconElement) {
              updateState({
                contentElements: [...state.contentElements, iconElement],
              })
            }
          } else {
            await updateContentElement.mutateAsync({
              id: iconElement._id,
              data: { defaultContent: iconValue },
            })
          }

          let titleElement = state.contentElements.find((el) => el.name === titleElementName)
          if (!titleElement) {
            const newElement = await createContentElement.mutateAsync({
              name: titleElementName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 4 + 1,
              defaultContent: "",
            })
            titleElement = newElement.data
            if (titleElement) {
              updateState({
                contentElements: [...state.contentElements, titleElement],
              })
            }
          }

          let descElement = state.contentElements.find((el) => el.name === descElementName)
          if (!descElement) {
            const newElement = await createContentElement.mutateAsync({
              name: descElementName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 4 + 2,
              defaultContent: "",
            })
            descElement = newElement.data
            if (descElement) {
              updateState({
                contentElements: [...state.contentElements, descElement],
              })
            }
          }

          let buttonTextElement = state.contentElements.find((el) => el.name === buttonTextElementName)
          if (!buttonTextElement) {
            const newElement = await createContentElement.mutateAsync({
              name: buttonTextElementName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 4 + 3,
              defaultContent: "Read More",
            })
            buttonTextElement = newElement.data
            if (buttonTextElement) {
              updateState({
                contentElements: [...state.contentElements, buttonTextElement],
              })
            }
          }

          Object.entries(allFormValues).forEach(([langCode, benefits]) => {
            if (!Array.isArray(benefits) || !benefits[i]) return
            const langId = langCodeToIdMap[langCode]
            if (!langId) return

            const benefit = benefits[i]
            if (titleElement) {
              translations.push({
                _id: String(benefit.id || ""),
                content: benefit.title,
                language: langId,
                contentElement: titleElement._id,
                isActive: true,
              })
            }
            if (descElement) {
              translations.push({
                _id: String(benefit.id || ""),
                content: benefit.description,
                language: langId,
                contentElement: descElement._id,
                isActive: true,
              })
            }
            if (buttonTextElement) {
              translations.push({
                _id: String(benefit.id || ""),
                content: benefit.buttonText || "Read More",
                language: langId,
                contentElement: buttonTextElement._id,
                isActive: true,
              })
            }
          })
        }

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations)
        }

        toast({
          title: state.existingSubSectionId
            ? "Faqs section updated successfully!"
            : "Faqs section created successfully!",
        })

        if (slug) {
          try {
            updateState({ isLoadingData: true, dataLoaded: false })
            const result = await refetch()
            if (result.data?.data) {
              console.log("Refetch successful, processing data")
              processFaqsData(result.data.data)
            } else {
              updateState({ isLoadingData: false })
            }
          } catch (error) {
            console.error("Error refreshing data:", error)
            updateState({ isLoadingData: false })
          }
        } else {
          console.log("Save completed, setting showForm to true")
          updateState({ hasUnsavedChanges: false, isLoadingData: false })
          setShowForm(true) // Ensure form is shown after save
        }
      } catch (error) {
        console.error("Operation failed:", error)
        toast({
          title: state.existingSubSectionId ? "Error updating benefits section" : "Error creating benefits section",
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        })
        updateState({ isLoadingData: false })
      } finally {
        updateState({ isSaving: false })
      }
    }, [
      form,
      validateFormFaqCounts,
      state.existingSubSectionId,
      ParentSectionId,
      slug,
      state.contentElements,
      activeLanguages,
      languageIds,
      createSubSection,
      createContentElement,
      updateContentElement,
      bulkUpsertTranslations,
      toast,
      refetch,
      processFaqsData,
      updateState,
      isSubSectionActive,
    ])

    // Create form ref
    createFormRef(ref, {
      form,
      hasUnsavedChanges: state.hasUnsavedChanges,
      setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
      existingSubSectionId: state.existingSubSectionId,
      contentElements: state.contentElements,
      componentName: "Faqs",
    })

    // Get language codes
    const languageCodes = createLanguageCodeMap(activeLanguages)

    // Force validation
    useEffect(() => {
      const subscription = form.watch(() => {
        if (state.dataLoaded && !state.isLoadingData) {
          validateFormFaqCounts()
        }
      })

      return () => subscription.unsubscribe()
    }, [state.dataLoaded, state.isLoadingData, form, validateFormFaqCounts])

    // Debug showForm state changes
    useEffect(() => {
      console.log("showForm state changed:", showForm)
    }, [showForm])

    // Loading state
    if (slug && (state.isLoadingData || isLoadingSubsection) && !state.dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading benefits section data...</p>
        </div>
      )
    }

    // Confirm delete step
    const confirmDeleteStep = (langCode: string, index: number) => {
      setStepToDelete({ langCode, index })
      setDeleteDialogOpen(true)
    }

    return (
      <div className="space-y-6">
        <LoadingDialog
          isOpen={state.isSaving}
          title={state.existingSubSectionId ? "Updating Faqs" : "Creating Faqs"}
          description="Please wait while we save your changes..."
        />

        {state.existingSubSectionId && (
          <div className="flex items-center justify-end mb-4 space-x-2">
            <span className="text-sm text-muted-foreground">{isSubSectionActive ? "Active" : "Inactive"}</span>
            <Switch className="data-[state=unchecked]:bg-red-500" checked={isSubSectionActive} onCheckedChange={handleToggleActive} />
          </div>
        )}

        {state.existingSubSectionId && !isSubSectionActive ? (
          <div className="text-center text-muted-foreground py-8">
            <p>This FAQ subsection is currently inactive. Activate it to edit the content.</p>
          </div>
        ) : showForm ? (
          <Form {...form}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isSubSectionActive &&
                languageIds.map((langId: Key | null | undefined, langIndex: number) => {
                  const langCode = String(langId) in languageCodes ? languageCodes[String(langId)] : String(langId)
                  const isFirstLanguage = langIndex === 0

                  return (
                    <QuestionsLanguageCard
                      key={langId}
                      langCode={langCode}
                      isFirstLanguage={isFirstLanguage}
                      form={form}
                      removeFaq={removeFaq}
                      syncIcons={syncIcons}
                      availableIcons={getAvailableIcons()}
                      onDeleteStep={confirmDeleteStep}
                    />
                  )
                })}
            </div>
          </Form>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No FAQ content available. Click below to create a new FAQ section.</p>
            <Button type="button" onClick={handleShowForm} className="mt-4">
              <Eye className="mr-2 h-4 w-4" />
              Show Form
            </Button>
          </div>
        )}

        {showForm && isSubSectionActive && (
          <div className="flex justify-end mt-6">
            {state.benefitCountMismatch && (
              <div className="flex items-center text-amber-500 mr-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">Each language must have the same number of FAQs</span>
              </div>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={state.isLoadingData || state.benefitCountMismatch || state.isSaving || !showForm}
              className="flex items-center"
            >
              {state.isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {state.existingSubSectionId ? "Update Faqs" : "Save Faqs"}
                </>
              )}
            </Button>
          </div>
        )}

        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={stepToDelete ? `Step ${stepToDelete.index + 1}` : ""}
          onConfirm={removeProcessStep}
          isDeleting={isDeleting}
          title="Delete Process"
          confirmText="Delete Process"
        />

        <ValidationDialog
          isOpen={state.isValidationDialogOpen}
          onOpenChange={(isOpen: any) => updateState({ isValidationDialogOpen: isOpen })}
          benefitCounts={getSubSectionCountsByLanguage(form.getValues())}
        />
      </div>
    )
  },
)

QuestionsForm.displayName = "FaqsForm"
export default QuestionsForm
