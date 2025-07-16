"use client";

import {
  forwardRef,
  useEffect,
  useState,
  useRef,
  useCallback,
  Key,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next"; // or your i18n hook
import { Save, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
import { createBenefitsSchema } from "../../Utils/language-specific-schemas";
import { createBenefitsDefaultValues } from "../../Utils/Language-default-values";
import { createFormRef, getAvailableIcons, getSafeIconValue, getSubSectionCountsByLanguage, useForceUpdate, validateSubSectionCounts } from "../../Utils/Expose-form-data";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import { processAndLoadData } from "../../Utils/load-form-data";
import { ValidationDialog } from "./ValidationDialog";
import { LanguageCard, LanguageTabs } from "./LanguageCard";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { BenefitsFormState, HeroFormProps, HeroFormRef, StepToDelete } from "@/src/api/types/sections/service/serviceSections.types";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { createLanguageCodeMap } from "../../Utils/language-utils";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { useSubsectionDeleteManager } from "@/src/hooks/DeleteSubSections/useSubsectionDeleteManager";

// Main Component
const BenefitsForm = forwardRef<HeroFormRef, HeroFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { t } = useTranslation(); // i18n hook
    const { websiteId } = useWebsiteContext();
    const formSchema = createBenefitsSchema(languageIds, activeLanguages);
    const defaultValues = createBenefitsDefaultValues(
      languageIds,
      activeLanguages
    );
    
    interface FormData {
      [key: string]: Array<{
        icon: string;
        title: string;
        description: string;
        id?: string;
      }>;
    }
    
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
      mode: "onChange",
    });

    // Enhanced state management with delete-related states
    const [state, setState] = useState<BenefitsFormState & {
      isRefreshingAfterDelete: boolean;
    }>({
      isLoadingData: !!slug, // Fixed: should be true if slug exists initially
      dataLoaded: !slug,
      hasUnsavedChanges: false,
      isValidationDialogOpen: false,
      benefitCountMismatch: false,
      existingSubSectionId: null,
      contentElements: [],
      isSaving: false,
      isRefreshingAfterDelete: false,
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [stepToDelete, setStepToDelete] = useState<StepToDelete | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const updateState = useCallback(
      (newState: Partial<BenefitsFormState & { isRefreshingAfterDelete: boolean }>) => {
        setState((prev) => ({ ...prev, ...newState }));
      },
      []
    );
    
    const {
      isLoadingData,
      dataLoaded,
      hasUnsavedChanges,
      isValidationDialogOpen,
      benefitCountMismatch,
      existingSubSectionId,
      contentElements,
      isSaving,
      isRefreshingAfterDelete,
    } = state;

    // Hooks
    const { toast } = useToast();
    const forceUpdate = useForceUpdate();
    const primaryLanguageRef = useRef<string | null>(null);
    const onDataChangeRef = useRef(onDataChange);

    // API hooks
    const { useCreate: useCreateSubSection, useGetCompleteBySlug } =
      useSubSections();
    const {
      useCreate: useCreateContentElement,
      useUpdate: useUpdateContentElement,
      useDelete: useDeleteContentElement,
    } = useContentElements();
    const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations();

    const createSubSection = useCreateSubSection();
    const createContentElement = useCreateContentElement();
    const updateContentElement = useUpdateContentElement();
    const deleteContentElement = useDeleteContentElement();
    const bulkUpsertTranslations = useBulkUpsertTranslations();

    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", Boolean(slug));

    // Process benefits data
    const processBenefitsData = useCallback(
      (subsectionData: SubSection) => {
        processAndLoadData(
          subsectionData,
          form,
          languageIds,
          activeLanguages,
          {
            groupElements: (elements) => {
              const benefitGroups: { [key: number]: ContentElement[] } = {};
              elements.forEach((element: any) => {
                const match = element.name.match(/Benefit (\d+)/i);
                if (match) {
                  const benefitNumber = parseInt(match[1], 10);
                  if (!benefitGroups[benefitNumber]) {
                    benefitGroups[benefitNumber] = [];
                  }
                  benefitGroups[benefitNumber].push(element);
                }
              });
              return benefitGroups;
            },
            processElementGroup: (
              benefitNumber,
              elements,
              langId,
              getTranslationContent
            ) => {
              const iconElement = elements.find((el) =>
                el.name.includes("Icon")
              );
              const titleElement = elements.find((el) =>
                el.name.includes("Title")
              );
              const descriptionElement = elements.find((el) =>
                el.name.includes("Description")
              );

              if (titleElement && descriptionElement) {
                const title = getTranslationContent(titleElement, "");
                const description = getTranslationContent(descriptionElement, "");
                const icon = iconElement?.defaultContent || "Clock";
                return { icon, title, description };
              }

              return { icon: "Clock", title: "", description: "" };
            },
            getDefaultValue: () => [
              { icon: "Clock", title: "", description: "" },
            ],
          },
          {
            setExistingSubSectionId: (id) =>
              updateState({ existingSubSectionId: id }),
            setContentElements: (elements) =>
              updateState({ contentElements: elements }),
            setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
            setHasUnsavedChanges: (hasChanges) =>
              updateState({ hasUnsavedChanges: hasChanges }),
            setIsLoadingData: (loading) =>
              updateState({ isLoadingData: loading }),
            validateCounts: validateFormBenefitCounts,
          }
        );
      },
      [form, languageIds, activeLanguages, updateState]
    );

    // Delete functionality using the delete manager
    const deleteManager = useSubsectionDeleteManager({
      subsectionId: existingSubSectionId,
      websiteId,
      slug,
      sectionName: t('benefitsFormForm.deleteDialogs.section.title'),
      contentElements,
      customWarnings: [
        "All benefit icons and descriptions will be removed",
        "Benefits data for all languages will be deleted",
        "This may affect the features presentation on your website"
      ],
      shouldRefetch: !!slug,
      refetchFn: refetch,
      resetForm: () => {
        form.reset(defaultValues);
      },
      resetState: () => {
        updateState({
          existingSubSectionId: null,
          contentElements: [],
          hasUnsavedChanges: false,
          dataLoaded: !slug,
          benefitCountMismatch: false,
        });
      },
      onDataChange,
      onDeleteSuccess: async () => {
        // Custom success handling after deletion
        updateState({ isRefreshingAfterDelete: true });
        
        if (slug) {
          try {
            const result = await refetch();
            if (result.data?.data) {
              updateState({ isLoadingData: true });
              await processBenefitsData(result.data.data);
              updateState({ isLoadingData: false });
            } else {
              updateState({ 
                dataLoaded: true,
                isLoadingData: false 
              });
            }
          } catch (refetchError) {
            updateState({ 
              dataLoaded: true,
              isLoadingData: false 
            });
          }
        }
        
        updateState({ isRefreshingAfterDelete: false });
      },
    });

    // Update onDataChange ref
    useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    // Set primary language
    useEffect(() => {
      if (languageIds.length > 0) {
        primaryLanguageRef.current = languageIds[0];
      }
    }, [languageIds]);

    // Sync icons across languages
    const syncIcons = useCallback(
      (index: number, iconValue: string) => {
        const formValues = form.getValues();
        const allLanguages = Object.keys(formValues);
        const primaryLang = allLanguages[0];

        allLanguages.forEach((lang) => {
          if (lang !== primaryLang) {
            if (
              formValues[lang] &&
              Array.isArray(formValues[lang]) &&
              formValues[lang].length > index
            ) {
              form.setValue(`${lang}.${index}.icon`, iconValue);
            }
          }
        });
      },
      [form]
    );

    // Validate benefit counts
    const validateFormBenefitCounts = useCallback(() => {
      const values = form.getValues();
      const isValid = validateSubSectionCounts(values);
      updateState({ benefitCountMismatch: !isValid });
      return isValid;
    }, [form, updateState]);

    // Remove process step (individual benefit deletion)
    const removeProcessStep = useCallback(async () => {
      if (!stepToDelete) return;

      const { langCode, index } = stepToDelete;
      setIsDeleting(true);

      const currentSteps = form.getValues()[langCode] || [];
      if (currentSteps.length <= 1) {
        toast({
          title: t('benefitsFormForm.toasts.cannotRemove.title'),
          description: t('benefitsFormForm.validation.minimumRequired'),
          variant: "destructive",
        });
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }

      if (existingSubSectionId && contentElements.length > 0) {
        try {
          const stepNumber = index + 1;
          const stepElements = contentElements.filter((element) => {
            const match = element.name.match(/Benefit (\d+)/i);
            return match && Number.parseInt(match[1]) === stepNumber;
          });

          if (stepElements.length > 0) {
            await Promise.all(
              stepElements.map(async (element) => {
                await deleteContentElement.mutateAsync(element._id);
              })
            );

            updateState({
              contentElements: contentElements.filter((element) => {
                const match = element.name.match(/Benefit (\d+)/i);
                return !(match && Number.parseInt(match[1]) === stepNumber);
              }),
            });

            toast({
              title: t('benefitsFormForm.toasts.stepDeleted.title'),
              description: t('benefitsFormForm.toasts.stepDeleted.description', { number: stepNumber }),
            });
          }

          const remainingElements = contentElements.filter((element) => {
            const match = element.name.match(/Benefit (\d+)/i);
            return match && Number.parseInt(match[1]) > stepNumber;
          });

          await Promise.all(
            remainingElements.map(async (element) => {
              const match = element.name.match(/Benefit (\d+)/i);
              if (match) {
                const oldNumber = Number.parseInt(match[1]);
                const newNumber = oldNumber - 1;
                const newName = element.name.replace(
                  `Benefit ${oldNumber}`,
                  `Benefit ${newNumber}`
                );
                const newOrder = element.order - 3;

                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: { name: newName, order: newOrder },
                });
              }
            })
          );
        } catch (error) {
          console.error("Error removing process step elements:", error);
          toast({
            title: t('benefitsFormForm.toasts.errorRemovingStep.title'),
            description: t('benefitsFormForm.toasts.errorRemovingStep.description'),
            variant: "destructive",
          });
        }
      }

      Object.keys(form.getValues()).forEach((langCode) => {
        const updatedSteps = [...(form.getValues()[langCode] || [])];
        updatedSteps.splice(index, 1);
        form.setValue(langCode, updatedSteps);
      });

      setIsDeleting(false);
      setDeleteDialogOpen(false);
      validateFormBenefitCounts();
    }, [
      stepToDelete,
      form,
      existingSubSectionId,
      contentElements,
      deleteContentElement,
      updateContentElement,
      toast,
      t,
      validateFormBenefitCounts,
      updateState,
    ]);

    // Load existing data
    useEffect(() => {
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }

      updateState({ isLoadingData: true });
      processBenefitsData(completeSubsectionData.data);
    }, [
      completeSubsectionData,
      isLoadingSubsection,
      dataLoaded,
      slug,
      processBenefitsData,
      updateState,
    ]);

    // Track form changes
    useEffect(() => {
      if (isLoadingData || !dataLoaded) return;

      const subscription = form.watch((value) => {
        updateState({ hasUnsavedChanges: true });
        validateFormBenefitCounts();
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value as FormData);
        }
      });

      return () => subscription.unsubscribe();
    }, [
      form,
      isLoadingData,
      dataLoaded,
      validateFormBenefitCounts,
      updateState,
    ]);

    // Add benefit
    const addBenefit = useCallback(
      (langCode: string) => {
        const currentBenefits = form.getValues()[langCode] || [];
        form.setValue(langCode, [
          ...currentBenefits,
          { icon: "Clock", title: "", description: "" },
        ]);

        const formValues = form.getValues();
        const allLanguages = Object.keys(formValues);
        const firstLang = allLanguages[0];

        if (langCode === firstLang) {
          allLanguages.forEach((lang) => {
            if (lang !== firstLang) {
              const otherLangBenefits = formValues[lang] || [];
              form.setValue(lang, [
                ...otherLangBenefits,
                { icon: "Clock", title: "", description: "" },
              ]);
            }
          });
        }

        form.trigger(langCode);
        forceUpdate();

        setTimeout(() => {
          const isValid = validateFormBenefitCounts();
          updateState({ benefitCountMismatch: !isValid });
        }, 0);
      },
      [form, forceUpdate, validateFormBenefitCounts, updateState]
    );

    // Remove benefit (individual benefit removal)
    const removeBenefit = useCallback(
      async (langCode: string, index: number) => {
        const currentBenefits = form.getValues()[langCode] || [];
        if (currentBenefits.length <= 1) {
          toast({
            title: t('benefitsFormForm.toasts.cannotRemove.title'),
            description: t('benefitsFormForm.toasts.cannotRemove.description'),
            variant: "destructive",
          });
          return;
        }

        const formValues = form.getValues();
        const allLanguages = Object.keys(formValues);
        const firstLang = allLanguages[0];
        const isFirstLanguage = langCode === firstLang;

        if (existingSubSectionId && contentElements.length > 0) {
          try {
            const benefitNumber = index + 1;
            const benefitElements = contentElements.filter((element) => {
              const match = element.name.match(/Benefit (\d+)/i);
              return match && Number.parseInt(match[1]) === benefitNumber;
            });

            if (benefitElements.length > 0) {
              for (const element of benefitElements) {
                await deleteContentElement.mutateAsync(element._id);
              }

              updateState({
                contentElements: contentElements.filter((element) => {
                  const match = element.name.match(/Benefit (\d+)/i);
                  return !(match && Number.parseInt(match[1]) === benefitNumber);
                }),
              });

              toast({
                title: t('benefitsFormForm.toasts.benefitDeleted.title'),
                description: t('benefitsFormForm.toasts.benefitDeleted.description', { number: benefitNumber }),
              });
            }

            const remainingElements = contentElements.filter((element) => {
              const match = element.name.match(/Benefit (\d+)/i);
              return match && Number.parseInt(match[1]) > benefitNumber;
            });

            for (const element of remainingElements) {
              const match = element.name.match(/Benefit (\d+)/i);
              if (match) {
                const oldNumber = Number.parseInt(match[1]);
                const newNumber = oldNumber - 1;
                const newName = element.name.replace(
                  `Benefit ${oldNumber}`,
                  `Benefit ${newNumber}`
                );
                const newOrder = element.order - 3;

                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: { name: newName, order: newOrder },
                });
              }
            }
          } catch (error) {
            console.error("Error removing benefit elements:", error);
            toast({
              title: t('benefitsFormForm.toasts.errorRemoving.title'),
              description: t('benefitsFormForm.toasts.errorRemoving.description'),
              variant: "destructive",
            });
          }
        }

        if (isFirstLanguage) {
          allLanguages.forEach((lang) => {
            const langBenefits = form.getValues()[lang] || [];
            if (langBenefits.length > index) {
              const updatedBenefits = [...langBenefits];
              updatedBenefits.splice(index, 1);
              form.setValue(lang, updatedBenefits);
              form.trigger(lang);
            }
          });
        } else {
          const updatedBenefits = [...currentBenefits];
          updatedBenefits.splice(index, 1);
          form.setValue(langCode, updatedBenefits);
          form.trigger(langCode);
        }

        forceUpdate();

        setTimeout(() => {
          const isValid = validateFormBenefitCounts();
          updateState({ benefitCountMismatch: !isValid });
        }, 0);
      },
      [
        form,
        existingSubSectionId,
        contentElements,
        deleteContentElement,
        updateContentElement,
        toast,
        t,
        forceUpdate,
        validateFormBenefitCounts,
        updateState,
      ]
    );

    // Save handler
    const handleSave = useCallback(async () => {
      const isValid = await form.trigger();
      const hasEqualBenefitCounts = validateFormBenefitCounts();

      if (!hasEqualBenefitCounts) {
        updateState({ isValidationDialogOpen: true });
        return;
      }

      if (!isValid) return;

      updateState({ isSaving: true, isLoadingData: true });
      try {
        const allFormValues = form.getValues();

        let sectionId = existingSubSectionId;
        if (!sectionId) {
          if (!ParentSectionId) {
            throw new Error(t('benefitsFormForm.errors.parentSectionRequired'));
          }

          const subsectionData = {
            name: "Benefits Section",
            slug: slug || `benefits-section-${Date.now()}`,
            description: "Benefits section for the website",
            defaultContent: '',
            isActive: true,
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
            WebSiteId: websiteId
          };

          const newSubSection = await createSubSection.mutateAsync(subsectionData);
          sectionId = newSubSection.data._id;
          updateState({ existingSubSectionId: sectionId });
        }

        if (!sectionId) {
          throw new Error(t('benefitsFormForm.errors.failedToCreateSection'));
        }

        const langCodeToIdMap = activeLanguages.reduce((acc: { [x: string]: any; }, lang: { languageID: string | number; _id: any; }) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {} as Record<string, string>);

        const firstLangKey = Object.keys(allFormValues)[0];
        const benefitCount = Array.isArray(allFormValues[firstLangKey])
          ? allFormValues[firstLangKey].length
          : 0;
        const translations: ContentTranslation[] = [];

        for (let i = 0; i < benefitCount; i++) {
          const benefitIndex = i + 1;
          const iconElementName = `Benefit ${benefitIndex} - Icon`;
          const titleElementName = `Benefit ${benefitIndex} - Title`;
          const descElementName = `Benefit ${benefitIndex} - Description`;

          const iconValue = getSafeIconValue(allFormValues, i);

          let iconElement = contentElements.find(
            (el) => el.name === iconElementName
          );
          if (!iconElement) {
            const newElement = await createContentElement.mutateAsync({
              name: iconElementName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 3,
              defaultContent: iconValue,
            });
            iconElement = newElement.data;
            if (iconElement) {
              updateState({
                contentElements: [...contentElements, iconElement],
              });
            }
          } else {
            await updateContentElement.mutateAsync({
              id: iconElement._id,
              data: { defaultContent: iconValue },
            });
          }

          let titleElement = contentElements.find(
            (el) => el.name === titleElementName
          );
          if (!titleElement) {
            const newElement = await createContentElement.mutateAsync({
              name: titleElementName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 3 + 1,
              defaultContent: "",
            });
            titleElement = newElement.data;
            if (titleElement) {
              updateState({
                contentElements: [...contentElements, titleElement],
              });
            }
          }

          let descElement = contentElements.find(
            (el) => el.name === descElementName
          );
          if (!descElement) {
            const newElement = await createContentElement.mutateAsync({
              name: descElementName,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 3 + 2,
              defaultContent: "",
            });
            descElement = newElement.data;
            if (descElement) {
              updateState({
                contentElements: [...contentElements, descElement],
              });
            }
          }

          Object.entries(allFormValues).forEach(([langCode, benefits]) => {
            if (!Array.isArray(benefits) || !benefits[i]) return;
            const langId = langCodeToIdMap[langCode];
            if (!langId) return;

            const benefit = benefits[i];
            if (titleElement) {
              translations.push({
                _id: String(benefit.id),
                content: benefit.title,
                language: langId,
                contentElement: titleElement._id,
                isActive: true,
              });
            }
            if (descElement) {
              translations.push({
                _id: String(benefit.id),
                content: benefit.description,
                language: langId,
                contentElement: descElement._id,
                isActive: true,
              });
            }
          });
        }

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        }

        const successMessage = existingSubSectionId
          ? t('benefitsFormForm.toasts.success.updated')
          : t('benefitsFormForm.toasts.success.created');

        toast({
          title: successMessage,
        });

        if (slug) {
          try {
            updateState({ isLoadingData: true, dataLoaded: false });
            const result = await refetch();
            if (result.data?.data) {
              processBenefitsData(result.data.data);
            } else {
              updateState({ isLoadingData: false });
            }
          } catch (error) {
            console.error("Error refreshing data:", error);
            updateState({ isLoadingData: false });
          }
        } else {
          updateState({ hasUnsavedChanges: false, isLoadingData: false });
        }
      } catch (error) {
        console.error("Operation failed:", error);
        const errorMessage = existingSubSectionId
          ? t('benefitsFormForm.toasts.error.updated')
          : t('benefitsFormForm.toasts.error.created');

        toast({
          title: errorMessage,
          variant: "destructive",
          description: error instanceof Error ? error.message : t('benefitsFormForm.errors.unknownError'),
        });
        updateState({ isLoadingData: false });
      } finally {
        updateState({ isSaving: false });
      }
    }, [
      form,
      validateFormBenefitCounts,
      existingSubSectionId,
      ParentSectionId,
      slug,
      contentElements,
      activeLanguages,
      languageIds,
      createSubSection,
      createContentElement,
      updateContentElement,
      bulkUpsertTranslations,
      toast,
      t,
      refetch,
      processBenefitsData,
      updateState,
      websiteId,
    ]);

    // Create form ref
    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
      existingSubSectionId,
      contentElements,
      componentName: "Benefits",
      extraMethods: {
        saveData: handleSave,
        deleteData: deleteManager.handleDelete,
      },
      extraData: {
        existingSubSectionId
      }
    });

    // Get language codes
    const languageCodes = createLanguageCodeMap(activeLanguages);

    // Force validation
    useEffect(() => {
      const subscription = form.watch(() => {
        if (dataLoaded && !isLoadingData) {
          validateFormBenefitCounts();
        }
      });

      return () => subscription.unsubscribe();
    }, [dataLoaded, isLoadingData, form, validateFormBenefitCounts]);

    // Confirm delete step (individual benefit deletion)
    const confirmDeleteStep = (langCode: string, index: number) => {
      setStepToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    };

    return (
      <div className="space-y-6">
        {/* Loading Dialogs */}
        <LoadingDialog
          isOpen={isSaving}
          title={existingSubSectionId 
            ? t('benefitsFormForm.loadingDialogs.updating.title')
            : t('benefitsFormForm.loadingDialogs.creating.title')
          }
          description={existingSubSectionId 
            ? t('benefitsFormForm.loadingDialogs.updating.description')
            : t('benefitsFormForm.loadingDialogs.creating.description')
          }
        />

        <LoadingDialog
          isOpen={deleteManager.isDeleting}
          title={t('benefitsFormForm.loadingDialogs.deleting.title')}
          description={t('benefitsFormForm.loadingDialogs.deleting.description')}
        />

        <LoadingDialog
          isOpen={isRefreshingAfterDelete}
          title={t('benefitsFormForm.loadingDialogs.refreshing.title')}
          description={t('benefitsFormForm.loadingDialogs.refreshing.description')}
        />
        
        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={stepToDelete ? `Benefit ${stepToDelete.index + 1}` : ""}
          onConfirm={removeProcessStep}
          isDeleting={isDeleting}
          title={t('benefitsFormForm.deleteDialogs.benefit.title')}
          confirmText={t('benefitsFormForm.deleteDialogs.benefit.confirmText')}
        />

       <Form {...form}>
          <LanguageTabs
            languageCards={languageIds.map((langId: Key | null | undefined, langIndex: number) => {
              const langCode = String(langId) in languageCodes ? languageCodes[String(langId)] : String(langId);
              const isFirstLanguage = langIndex === 0;

              return {
                langCode,
                isFirstLanguage,
                form,
                addBenefit,
                removeBenefit,
                syncIcons,
                availableIcons: getAvailableIcons(),
                onDeleteStep: confirmDeleteStep,
              };
            })}
          />
        </Form>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
       

          {/* Save Button and Validation Warning */}
          <div className={`flex items-center gap-4 ${existingSubSectionId ? "" : "ml-auto"}`}>
            {benefitCountMismatch && (
              <div className="flex items-center text-amber-500">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {t('benefitsFormForm.validation.countMismatch')}
                </span>
              </div>
            )}
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={benefitCountMismatch || isSaving || deleteManager.isDeleting || isRefreshingAfterDelete}
              className="flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('benefitsFormForm.buttons.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {existingSubSectionId 
                    ? t('benefitsFormForm.buttons.update')
                    : t('benefitsFormForm.buttons.save')
                  }
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Validation Dialog */}
        <ValidationDialog
          isOpen={isValidationDialogOpen}
          onOpenChange={(isOpen: any) =>
            updateState({ isValidationDialogOpen: isOpen })
          }
          benefitCounts={getSubSectionCountsByLanguage(form.getValues())}
        />
      </div>
    );
  }
);

BenefitsForm.displayName = "BenefitsForm";
export default BenefitsForm;