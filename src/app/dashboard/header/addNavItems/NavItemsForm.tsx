"use client"

import { forwardRef, useEffect, useState, useRef, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Save, AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useToast } from "@/src/hooks/use-toast"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { createFormRef } from "../../services/addService/Utils/Expose-form-data"
import apiClient from "@/src/lib/api-client"
import { createLanguageCodeMap } from "../../services/addService/Utils/Language-default-values"
import { useImageUploader } from "../../services/addService/Utils/Image-uploader"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import { NavLanguageCard } from "./NavLanguageCard"
import { BackgroundImageSection } from "../../services/addService/Components/Hero/SimpleImageUploader"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { Language } from "@/src/api/types/hooks/language.types"
import { SubSection } from "@/src/api/types/hooks/section.types"
import { ContentElement } from "@/src/api/types/hooks/content.types"
import { createSectionsDefaultValues, createSectionsSchema, processAndLoadNavData, sectionsFormData } from "../../../../utils/sections/utils"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { useTranslation } from "react-i18next"

interface NavFormProps {
  languageIds: string[]
  activeLanguages: Language[]
  onDataChange?: (data: any) => void
  slug?: string
  ParentSectionId: string
  initialData: any
}

const NavItemsForm = forwardRef<unknown, NavFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { t } = useTranslation()
    const formSchema = useMemo(
      () => createSectionsSchema(languageIds, activeLanguages),
      [languageIds, activeLanguages]
    )

    const defaultValues = useMemo(
      () => createSectionsDefaultValues(languageIds, activeLanguages),
      [languageIds, activeLanguages]
    )

    const { websiteId } = useWebsiteContext()

    const [isLoadingData, setIsLoadingData] = useState(!slug)
    const [dataLoaded, setDataLoaded] = useState(!slug)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null)
    const [contentElements, setContentElements] = useState<ContentElement[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [navItemToDelete, setNavItemToDelete] = useState<{ langCode: string; index: number } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [navItemCountMismatch, setNavItemCountMismatch] = useState(false)
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)

    const { toast } = useToast()

    const form = useForm<sectionsFormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
    })

    const onDataChangeRef = useRef(onDataChange)
    useEffect(() => {
      onDataChangeRef.current = onDataChange
    }, [onDataChange])

    const { useCreate: useCreateSubSection, useGetCompleteBySlug, useUpdate: useUpdateSubSection } = useSubSections()
    const {
      useCreate: useCreateContentElement,
      useUpdate: useUpdateContentElement,
      useDelete: useDeleteContentElement,
    } = useContentElements()
    const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations()

    const createSubSection = useCreateSubSection()
    const updateSubSection = useUpdateSubSection()
    const createContentElement = useCreateContentElement()
    const updateContentElement = useUpdateContentElement()
    const deleteContentElement = useDeleteContentElement()
    const bulkUpsertTranslations = useBulkUpsertTranslations()

    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", !slug)

    const {
      imageFile,
      imagePreview,
      handleImageUpload: handleOriginalImageUpload,
      handleImageRemove,
    } = useImageUploader({
      form,
      fieldPath: "logo",
      initialImageUrl: form.getValues().logo,
      onUpload: () => setHasUnsavedChanges(true),
      onRemove: () => setHasUnsavedChanges(true),
      validate: (file: File) => {
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"]
        return validTypes.includes(file.type) || t("navItemsForm.messages.imageUploadFailedDescription")
      },
    })

    const validateNavItemCounts = useRef(() => {
      const values = form.getValues()
      const counts = Object.entries(values)
        .filter(([key]) => key !== "logo")
        .map(([_, langNavItems]) => (Array.isArray(langNavItems) ? langNavItems.length : 0))

      const allEqual = counts.every(count => count === counts[0])
      setNavItemCountMismatch(!allEqual)

      return allEqual
    }).current

    const processNavData = useRef((subsectionData: SubSection | null) => {
      processAndLoadNavData(subsectionData, form, languageIds, activeLanguages, {
        setExistingSubSectionId,
        setContentElements,
        setDataLoaded,
        setHasUnsavedChanges,
        setIsLoadingData,
      })
      setTimeout(validateNavItemCounts, 0)
    }).current

    useEffect(() => {
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return
      }

      setIsLoadingData(true)
      processNavData(completeSubsectionData.data)
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, slug, processNavData])

    useEffect(() => {
      if (isLoadingData || !dataLoaded) return

      const timeoutId = setTimeout(() => {
        const subscription = form.watch((value: sectionsFormData) => {
          setHasUnsavedChanges(true)
          validateNavItemCounts()
          if (onDataChangeRef.current) {
            onDataChangeRef.current(value)
          }
        })
        return () => subscription.unsubscribe()
      }, 300)

      return () => clearTimeout(timeoutId)
    }, [form, isLoadingData, dataLoaded, validateNavItemCounts])

    const addNavItem = (langCode: string) => {
      const currentItems = form.getValues()[langCode] || []
      form.setValue(
        langCode,
        [...currentItems, { navItemName: "" }],
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )

      toast({
        title: t("navItemsForm.messages.navItemAdded"),
        description: t("navItemsForm.messages.navItemAddedDescription"),
      })
    }

    const addNavItemToAllLanguages = () => {
      languageIds.forEach(langId => {
        const langCode = activeLanguages.find(lang => lang._id === langId)?.languageID || langId
        addNavItem(langCode)
      })
    }

    const confirmRemoveNavItem = (langCode: string, index: number) => {
      const currentItems = form.getValues()[langCode] || []
      if (currentItems.length <= 1) {
        toast({
          title: t("navItemsForm.messages.cannotRemove"),
          description: t("navItemsForm.messages.cannotRemoveDescription"),
          variant: "destructive",
        })
        return
      }

      setNavItemToDelete({ langCode, index })
      setDeleteDialogOpen(true)
    }

    const removeNavItem = async () => {
      if (!navItemToDelete) return

      const { langCode, index } = navItemToDelete
      setIsDeleting(true)

      try {
        if (existingSubSectionId && contentElements.length > 0) {
          const itemNumber = index + 1

          const itemElements = contentElements.filter(element => {
            return element.name === `Nav Item ${itemNumber}`
          })

          if (itemElements.length > 0) {
            await Promise.all(
              itemElements.map(async element => {
                try {
                  await deleteContentElement.mutateAsync(element._id)
                } catch (error) {
                  console.error(`Failed to delete content element ${element.name}:`, error)
                }
              })
            )

            setContentElements(prev => prev.filter(element => element.name !== `Nav Item ${itemNumber}`))

            toast({
              title: t("navItemsForm.messages.navItemDeleted"),
              description: t("navItemsForm.messages.navItemDeletedDescription", { number: itemNumber }),
            })
          }

          const remainingElements = contentElements.filter(element => {
            const match = element.name.match(/Nav Item (\d+)/)
            return match && parseInt(match[1]) > itemNumber
          })

          if (remainingElements.length > 0) {
            await Promise.all(
              remainingElements.map(async element => {
                const match = element.name.match(/Nav Item (\d+)/)
                if (match) {
                  const oldNumber = parseInt(match[1])
                  const newNumber = oldNumber - 1
                  const newName = `Nav Item ${newNumber}`
                  const newOrder = element.order - 1

                  try {
                    await updateContentElement.mutateAsync({
                      id: element._id,
                      data: {
                        name: newName,
                        order: newOrder,
                      },
                    })
                  } catch (error) {
                    console.error(`Failed to update element ${element.name}:`, error)
                  }
                }
              })
            )
          }
        }

        Object.keys(form.getValues()).forEach(currentLangCode => {
          if (currentLangCode === "logo") return

          const items = form.getValues()[currentLangCode] || []

          if (items.length > index) {
            const updatedItems = [...items]
            updatedItems.splice(index, 1)
            form.setValue(currentLangCode, updatedItems, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        })

        validateNavItemCounts()
      } catch (error) {
        console.error("Error removing navigation item:", error)
        toast({
          title: t("navItemsForm.messages.errorRemovingItem"),
          description: t("navItemsForm.messages.errorRemovingItemDescription"),
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
        setDeleteDialogOpen(false)
        setNavItemToDelete(null)
      }
    }

    const getNavItemCountsByLanguage = useMemo(
      () => {
        const values = form.getValues()
        return Object.entries(values)
          .filter(([key]) => key !== "logo")
          .map(([langCode, items]) => ({
            language: langCode,
            count: Array.isArray(items) ? items.length : 0,
          }))
      },
      [form, navItemCountMismatch]
    )

    const uploadLogo = async (elementId: string, file: File | null) => {
      if (!file) return null

      try {
        const formData = new FormData()
        formData.append("image", file)

        const uploadResult = await apiClient.post(
          `/content-elements/${elementId}/image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )

        const imageUrl =
          uploadResult.data?.imageUrl ||
          uploadResult.data?.url ||
          uploadResult.data?.data?.imageUrl

        if (imageUrl) {
          form.setValue("logo", imageUrl, { shouldDirty: false })
          toast({
            title: t("navItemsForm.messages.imageUploaded"),
            description: t("navItemsForm.messages.imageUploadedDescription"),
          })
          return imageUrl
        }

        throw new Error("No image URL returned from server. Response: " + JSON.stringify(uploadResult.data))
      } catch (error) {
        console.error("Image upload failed:", error)
        toast({
          title: t("navItemsForm.messages.imageUploadFailed"),
          description: error instanceof Error ? error.message : t("navItemsForm.messages.imageUploadFailedDescription"),
          variant: "destructive",
        })
        throw error
      }
    }

    const handleSave = async () => {
      const isValid = await form.trigger()
      const hasEqualNavItemCounts = validateNavItemCounts()

      if (!hasEqualNavItemCounts) {
        setIsValidationDialogOpen(true)
        return
      }

      if (!isValid) {
        toast({
          title: t("navItemsForm.messages.validationError"),
          description: t("navItemsForm.messages.validationErrorDescription"),
          variant: "destructive",
        })
        return
      }

      setIsSaving(true)
      setIsLoadingData(true)

      try {
        const allFormValues = form.getValues()

        let sectionId = existingSubSectionId

        if (!existingSubSectionId) {
          const subsectionData = {
            name: "Navigation Section",
            slug: slug || `nav-section-${Date.now()}`,
            description: "Navigation section for the website",
            isActive: true,
            defaultContent: '',
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
            WebSiteId: websiteId,
          }

          toast({
            title: t("navItemsForm.messages.creatingNavSection"),
            description: t("navItemsForm.messages.creatingNavSectionDescription"),
          })

          const newSubSection = await createSubSection.mutateAsync(subsectionData)
          sectionId = newSubSection.data._id
          setExistingSubSectionId(sectionId)
        } else {
          await updateSubSection.mutateAsync({
            id: sectionId,
            data: {
              isActive: true,
              languages: languageIds,
            },
          })
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID")
        }

        const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
          acc[lang.languageID] = lang._id
          return acc
        }, {})

        let logoElementId: string | null = null
        const existingLogoElement = contentElements.find(el => el.name === "Logo" && el.type === "image")

        if (!existingLogoElement) {
          const logoElement = await createContentElement.mutateAsync({
            name: "Logo",
            type: "image",
            parent: sectionId,
            isActive: true,
            order: 0,
            defaultContent: '',
          })

          logoElementId = logoElement.data._id

          if (imageFile && logoElementId) {
            const logoUrl = await uploadLogo(logoElementId, imageFile)
            if (logoUrl) {
              form.setValue("logo", logoUrl, { shouldDirty: false })
            }
          }
        } else if (imageFile) {
          const logoUrl = await uploadLogo(existingLogoElement._id, imageFile)
          if (logoUrl) {
            form.setValue("logo", logoUrl, { shouldDirty: false })
          }
        }

        const existingNavItems = contentElements
          .filter(el => el.type === "text" && el.name.startsWith("Nav Item"))
          .sort((a, b) => a.order - b.order)

        const maxNavItems = Math.max(
          ...Object.entries(allFormValues)
            .filter(([key]) => key !== "logo")
            .map(([_, langItems]) => (Array.isArray(langItems) ? langItems.length : 0))
        )

        const translations: Array<{
          content: string
          language: string
          contentElement: string
          isActive: boolean
        }> = []
        const newContentElements: ContentElement[] = []

        if (existingNavItems.length > 0) {
          Object.entries(allFormValues).forEach(([langCode, langItems]) => {
            if (langCode === "logo" || !Array.isArray(langItems)) return

            const langId = langCodeToIdMap[langCode]
            if (!langId) return

            langItems.forEach((item, index) => {
              if (index < existingNavItems.length) {
                translations.push({
                  content: item.navItemName,
                  language: langId,
                  contentElement: existingNavItems[index]._id,
                  isActive: true,
                })
              }
            })
          })

          if (maxNavItems > existingNavItems.length) {
            for (let i = existingNavItems.length; i < maxNavItems; i++) {
              let defaultContent = ""
              for (const [langCode, langItems] of Object.entries(allFormValues)) {
                if (langCode === "logo" || !Array.isArray(langItems)) continue
                if (langItems.length > i && langItems[i].navItemName) {
                  defaultContent = langItems[i].navItemName
                  break
                }
              }

              const navElement = await createContentElement.mutateAsync({
                name: `Nav Item ${i + 1}`,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: i + 1,
                defaultContent,
              })

              newContentElements.push(navElement.data)

              Object.entries(allFormValues).forEach(([langCode, langItems]) => {
                if (langCode === "logo" || !Array.isArray(langItems) || langItems.length <= i) return

                const langId = langCodeToIdMap[langCode]
                if (!langId) return

                if (langItems[i].navItemName) {
                  translations.push({
                    content: langItems[i].navItemName,
                    language: langId,
                    contentElement: navElement.data._id,
                    isActive: true,
                  })
                }
              })
            }
          }
        } else {
          for (let i = 0; i < maxNavItems; i++) {
            let defaultContent = ""
            for (const [langCode, langItems] of Object.entries(allFormValues)) {
              if (langCode === "logo" || !Array.isArray(langItems)) continue
              if (langItems.length > i && langItems[i].navItemName) {
                defaultContent = langItems[i].navItemName
                break
              }
            }

            const navElement = await createContentElement.mutateAsync({
              name: `Nav Item ${i + 1}`,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i + 1,
              defaultContent,
            })

            newContentElements.push(navElement.data)

            Object.entries(allFormValues).forEach(([langCode, langItems]) => {
              if (langCode === "logo" || !Array.isArray(langItems) || langItems.length <= i) return

              const langId = langCodeToIdMap[langCode]
              if (!langId) return

              if (langItems[i].navItemName) {
                translations.push({
                  content: langItems[i].navItemName,
                  language: langId,
                  contentElement: navElement.data._id,
                  isActive: true,
                })
              }
            })
          }
        }

        if (newContentElements.length > 0) {
          setContentElements(prev => [...prev, ...newContentElements])
        }

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations)
        }

        toast({
          title: existingSubSectionId ? t("navItemsForm.messages.navSectionUpdated") : t("navItemsForm.messages.navSectionCreated"),
          description: t("navItemsForm.messages.navSectionSuccessDescription"),
          duration: 5000,
        })

        if (slug) {
          toast({
            title: t("navItemsForm.messages.refreshingContent"),
            description: t("navItemsForm.messages.refreshingContentDescription"),
          })

          const result = await refetch()
          if (result.data?.data) {
            setDataLoaded(false)
            processNavData(result.data.data)
          }
        }

        setHasUnsavedChanges(false)
      } catch (error) {
        console.error("Operation failed:", error)
        toast({
          title: existingSubSectionId ? t("navItemsForm.messages.errorUpdatingNavSection") : t("navItemsForm.messages.errorCreatingNavSection"),
          description: error instanceof Error ? error.message : t("navItemsForm.messages.errorOperationFailedDescription"),
          variant: "destructive",
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
      componentName: 'Navigation',
      extraMethods: {
        getImageFile: () => imageFile,
        saveData: handleSave,
      },
      extraData: {
        imageFile,
        existingSubSectionId,
      },
    })

    const languageCodes = useMemo(() => createLanguageCodeMap(activeLanguages), [activeLanguages])

    const renderNavItemsFields = (control: any, langCode: string) => {
      const navItems = form.watch(langCode) || []

      return (
        <div className="space-y-4">
          {navItems.map((_: any, index: number) => (
            <div key={`${langCode}-${index}`} className="flex items-end gap-2">
              <FormField
                control={control}
                name={`${langCode}.${index}.navItemName`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("navItemsForm.placeholders.navItem", { number: index + 1 })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("navItemsForm.placeholders.navItem", { number: index + 1 })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => confirmRemoveNavItem(langCode, index)}
                disabled={navItems.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => addNavItem(langCode)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("navItemsForm.buttons.addNavItem")}
          </Button>
        </div>
      )
    }

    if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">{t("navItemsForm.form.loading")}</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <LoadingDialog
          isOpen={isSaving}
          title={existingSubSectionId ? t("navItemsForm.titles.updatingNavSection") : t("navItemsForm.titles.creatingNavSection")}
          description={t("navItemsForm.descriptions.savingChanges")}
        />

        <Form {...form}>
          <BackgroundImageSection
            imagePreview={imagePreview}
            imageValue={form.getValues().logo}
            onUpload={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (event.target.files && event.target.files.length > 0) {
                handleOriginalImageUpload({ target: { files: Array.from(event.target.files) } });
              }
            }}
            onRemove={handleImageRemove}
            imageType="logo"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {languageIds.map(langId => {
              const langCode = languageCodes[langId] || langId
              return (
                <NavLanguageCard
                  key={langId}
                  langCode={langCode}
                  form={form}
                  renderFields={(control: any, langCode: string) => renderNavItemsFields(control, langCode)}
                  onRemoveItem={(index: number) => confirmRemoveNavItem(langCode, index)}
                />
              )
            })}
          </div>

          <div className="flex justify-center mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={addNavItemToAllLanguages}
              className="mx-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("navItemsForm.buttons.addNavItemToAllLanguages")}
            </Button>
          </div>
        </Form>

        <div className="flex justify-end mt-6">
          {navItemCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 of mr-2" />
              <span className="text-sm">{t("navItemsForm.messages.navItemCountMismatchWarning")}</span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingData || navItemCountMismatch || isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("navItemsForm.form.saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {existingSubSectionId ? t("navItemsForm.buttons.updateNavContent") : t("navItemsForm.buttons.saveNavContent")}
              </>
            )}
          </Button>
        </div>

        {/* <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("navItemsForm.titles.navItemCountMismatch")}</DialogTitle>
              <DialogDescription>
                <div className="mt-4 mb-4">
                  {t("navItemsForm.descriptions.navItemCountMismatch")}
                </div>
                <ul className="list-disc pl-6 space-y-1">
                  {getNavItemCountsByLanguage.map(({ language, count }) => (
                    <li key={language}>
                      <span className="font-semibold uppercase">{language}</span>: {count} items
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)}>
                {t("navItemsForm.buttons.close")}
              </Button>
            </div>
          </DialogContent>
        </Dialog> */}

        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={navItemToDelete ? t("navItemsForm.placeholders.navItem", { number: navItemToDelete.index + 1 }) : ''}
          onConfirm={removeNavItem}
          isDeleting={isDeleting}
          title={t("navItemsForm.titles.deleteNavItem")}
          confirmText={t("navItemsForm.buttons.deleteItem")}
        />
      </div>
    )
  }
)

NavItemsForm.displayName = "NavItemsForm"

export default NavItemsForm