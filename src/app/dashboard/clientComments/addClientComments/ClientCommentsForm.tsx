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
import { Save, AlertTriangle, Loader2 } from "lucide-react";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import {  StepToDelete } from "@/src/api/types/sections/service/serviceSections.types";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog";
import {  createChooseUsSchema } from "../../services/addService/Utils/language-specific-schemas";
import { createChooseUsDefaultValues, createLanguageCodeMap } from "../../services/addService/Utils/Language-default-values";
import { createFormRef, getAvailableIcons, getSubSectionCountsByLanguage ,  getSafeIconValue, useForceUpdate, validateSubSectionCounts } from "../../services/addService/Utils/Expose-form-data";
import { processAndLoadData } from "../../services/addService/Utils/load-form-data";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { clientCommentFormRef, clientCommentsFormProps, ClientCommentsFormState } from "@/src/api/types/sections/clientComments/clientComments.type";
import { ClientCommentsLanguageCardCard } from "./ClientCommentsLanguageCard";
import { ValidationDialog } from "../../services/addService/Components/BenefitsForm/ValidationDialog";


// Main Component
const ClientCommentsForm = forwardRef<clientCommentFormRef, clientCommentsFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId , subSectionId},ref) => {
    const { websiteId } = useWebsiteContext();
    const formSchema = createChooseUsSchema(languageIds, activeLanguages);

    const defaultValues = createChooseUsDefaultValues(
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

    // State management
    const [state, setState] = useState<ClientCommentsFormState>({
      isLoadingData: !subSectionId,
      dataLoaded: !subSectionId,
      hasUnsavedChanges: false,
      isValidationDialogOpen: false,
      benefitCountMismatch: false,
      existingSubSectionId: null,
      contentElements: [],
      isSaving: false,
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [stepToDelete, setStepToDelete] = useState<StepToDelete | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const updateState = useCallback(
      (newState: Partial<ClientCommentsFormState>) => {
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
    } = state;

    // Hooks
    const { toast } = useToast();
    const forceUpdate = useForceUpdate();
    const primaryLanguageRef = useRef<string | null>(null);
    const onDataChangeRef = useRef(onDataChange);

    // API hooks
    const { useCreate: useCreateSubSection, useGetCompleteBySlug , useGetBySectionItemId } =
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
    } = useGetBySectionItemId(subSectionId || '');

    console.log(completeSubsectionData)

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

    // Validate clientComments counts
    const validateFormClientCommentCounts = useCallback(() => {
      const values = form.getValues();
      const isValid = validateSubSectionCounts(values);
      updateState({ benefitCountMismatch: !isValid });
      return isValid;
    }, [form, updateState]);
    // Remove process step
    const removeProcessStep = useCallback(async () => {
      if (!stepToDelete) return;

      const { langCode, index } = stepToDelete;
      setIsDeleting(true);

      const currentSteps = form.getValues()[langCode] || [];
      if (currentSteps.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one process step",
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
            const match = element.name.match(/ChoseUs (\d+)/i);
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
                const match = element.name.match(/ChoseUs (\d+)/i);
                return !(match && Number.parseInt(match[1]) === stepNumber);
              }),
            });

            toast({
              title: "Step deleted",
              description: `Step ${stepNumber} has been deleted from the database`,
            });
          }

          const remainingElements = contentElements.filter((element) => {
            const match = element.name.match(/ChoseUs (\d+)/i);
            return match && Number.parseInt(match[1]) > stepNumber;
          });

          await Promise.all(
            remainingElements.map(async (element) => {
              const match = element.name.match(/ChoseUs (\d+)/i);
              if (match) {
                const oldNumber = Number.parseInt(match[1]);
                const newNumber = oldNumber - 1;
                const newName = element.name.replace(
                  `ChoseUs ${oldNumber}`,
                  `ChoseUs ${newNumber}`
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
            title: "Error removing step",
            description: "There was an error removing the step from the database",
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
      validateFormClientCommentCounts();
    }, [
      stepToDelete,
      form,
      existingSubSectionId,
      contentElements,
      deleteContentElement,
      updateContentElement,
      toast,
      validateFormClientCommentCounts,
      updateState,
    ]);

    // Process clientComments data
    const processChoseUsData = useCallback(
      (subsectionData: SubSection) => {
        processAndLoadData(
          subsectionData,
          form,
          languageIds,
          activeLanguages,
          {
            groupElements: (elements ) => {
              const benefitGroups: { [key: number]: ContentElement[] } = {};
              elements.forEach((element : any) => {
                const match = element.name.match(/ChoseUs (\d+)/i);
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
            validateCounts: validateFormClientCommentCounts,
          }
        );
      },
      [form, languageIds, activeLanguages, updateState, validateFormClientCommentCounts]
    );

    // Load existing data
    useEffect(() => {
      if (!subSectionId || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data[0]) {
        return;
      }

      updateState({ isLoadingData: true });
      processChoseUsData(completeSubsectionData.data[0]);
    }, [
      completeSubsectionData,
      isLoadingSubsection,
      dataLoaded,
      subSectionId,
      processChoseUsData,
    ]);

    // Track form changes
    useEffect(() => {
      if (isLoadingData || !dataLoaded) return;

      const subscription = form.watch((value) => {
        updateState({ hasUnsavedChanges: true });
        validateFormClientCommentCounts();
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value as FormData);
        }
      });

      return () => subscription.unsubscribe();
    }, [
      form,
      isLoadingData,
      dataLoaded,
      validateFormClientCommentCounts,
      updateState,
    ]);

    // Add benefit
    const addClientComment = useCallback(
      (langCode: string) => {
        const currentChoseUs = form.getValues()[langCode] || [];
        form.setValue(langCode, [
          ...currentChoseUs,
          { icon: "Clock", title: "", description: "" },
        ]);

        const formValues = form.getValues();
        const allLanguages = Object.keys(formValues);
        const firstLang = allLanguages[0];

        if (langCode === firstLang) {
          allLanguages.forEach((lang) => {
            if (lang !== firstLang) {
              const otherLangChoseUs = formValues[lang] || [];
              form.setValue(lang, [
                ...otherLangChoseUs,
                { icon: "Clock", title: "", description: "" },
              ]);
            }
          });
        }

        form.trigger(langCode);
        forceUpdate();

        setTimeout(() => {
          const isValid = validateFormClientCommentCounts();
          updateState({ benefitCountMismatch: !isValid });
        }, 0);
      },
      [form, forceUpdate, validateFormClientCommentCounts, updateState]
    );

    // Remove benefit
    const removeChoseUs = useCallback(
      async (langCode: string, index: number) => {
        const currentChoseUs = form.getValues()[langCode] || [];
        if (currentChoseUs.length <= 1) {
          toast({
            title: "Cannot remove",
            description: "You need at least one benefit",
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
              const match = element.name.match(/ChoseUs (\d+)/i);
              return match && Number.parseInt(match[1]) === benefitNumber;
            });

            if (benefitElements.length > 0) {
              for (const element of benefitElements) {
                await deleteContentElement.mutateAsync(element._id);
              }

              updateState({
                contentElements: contentElements.filter((element) => {
                  const match = element.name.match(/ChoseUs (\d+)/i);
                  return !(match && Number.parseInt(match[1]) === benefitNumber);
                }),
              });

              toast({
                title: "ChoseUs deleted",
                description: `ChoseUs ${benefitNumber} has been deleted from the database`,
              });
            }

            const remainingElements = contentElements.filter((element) => {
              const match = element.name.match(/ChoseUs (\d+)/i);
              return match && Number.parseInt(match[1]) > benefitNumber;
            });

            for (const element of remainingElements) {
              const match = element.name.match(/ChoseUs (\d+)/i);
              if (match) {
                const oldNumber = Number.parseInt(match[1]);
                const newNumber = oldNumber - 1;
                const newName = element.name.replace(
                  `ChoseUs ${oldNumber}`,
                  `ChoseUs ${newNumber}`
                );
                const newOrder = element.order - 3;



                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: { name: newName, order: newOrder },
                });
              }
            }
          } catch (error) {
            console.error("Error removing clientComments elements:", error);
            toast({
              title: "Error removing benefit",
              description: "There was an error removing the clientComments from the database",
              variant: "destructive",
            });
          }
        }

        if (isFirstLanguage) {
          allLanguages.forEach((lang) => {
            const langChoseUs = form.getValues()[lang] || [];
            if (langChoseUs.length > index) {
              const updatedChoseUs = [...langChoseUs];
              updatedChoseUs.splice(index, 1);
              form.setValue(lang, updatedChoseUs);
              form.trigger(lang);
            }
          });
        } else {
          const updatedChoseUs = [...currentChoseUs];
          updatedChoseUs.splice(index, 1);
          form.setValue(langCode, updatedChoseUs);
          form.trigger(langCode);
        }

        forceUpdate();

        setTimeout(() => {
          const isValid = validateFormClientCommentCounts();
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
        forceUpdate,
        validateFormClientCommentCounts,
        updateState,
      ]
    );

    // Save handler
    const handleSave = useCallback(async () => {
      const isValid = await form.trigger();
      const hasEqualClientCommentCounts = validateFormClientCommentCounts();

      if (!hasEqualClientCommentCounts) {
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
            throw new Error("Parent section ID is required to create a subsection");
          }

          const subsectionData = {
            name: "ChoseUs Section",
            slug: slug || `ChoseUs-section-${Date.now()}`,
            description: "ChoseUs section for the website",
            defaultContent :'',
            isActive: true,
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
            WebSiteId : websiteId
          };

          const newSubSection = await createSubSection.mutateAsync(subsectionData);
          sectionId = newSubSection.data._id;
          updateState({ existingSubSectionId: sectionId });
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID");
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
          const iconElementName = `ChoseUs ${benefitIndex} - Icon`;
          const titleElementName = `ChoseUs ${benefitIndex} - Title`;
          const descElementName = `ChoseUs ${benefitIndex} - Description`;

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

          Object.entries(allFormValues).forEach(([langCode, ChoseUs]) => {
            if (!Array.isArray(ChoseUs) || !ChoseUs[i]) return;
            const langId = langCodeToIdMap[langCode];
            if (!langId) return;

            const clientComments = ChoseUs[i];
            if (titleElement) {
              translations.push({
                _id : String(clientComments.id),
                content: clientComments.title,
                language: langId,
                contentElement: titleElement._id,
                isActive: true,
              });
            }
            if (descElement) {
              translations.push({
                _id : String(clientComments.id),
                content: clientComments.description,
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

        toast({
          title: existingSubSectionId
            ? "ChoseUs section updated successfully!"
            : "ChoseUs section created successfully!",
        });

        if (subSectionId) {
          try {
            updateState({ isLoadingData: true, dataLoaded: false });
            const result = await refetch();
            if (result.data?.data) {
              processChoseUsData(result.data.data);
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
        toast({
          title: existingSubSectionId
            ? "Error updating clientComments section"
            : "Error creating clientComments section",
          variant: "destructive",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        updateState({ isLoadingData: false });
      } finally {
        updateState({ isSaving: false });
      }
    }, [
      form,
      validateFormClientCommentCounts,
      existingSubSectionId,
      ParentSectionId,
      subSectionId,
      contentElements,
      activeLanguages,
      languageIds,
      createSubSection,
      createContentElement,
      updateContentElement,
      bulkUpsertTranslations,
      toast,
      refetch,
      processChoseUsData,
      updateState,
    ]);

    // Create form ref
    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
      existingSubSectionId,
      contentElements,
      componentName: "ChoseUs",
    });

    // Get language codes
    const languageCodes = createLanguageCodeMap(activeLanguages);

    // Force validation
    useEffect(() => {
      const subscription = form.watch(() => {
        if (dataLoaded && !isLoadingData) {
          validateFormClientCommentCounts();
        }
      });

      return () => subscription.unsubscribe();
    }, [dataLoaded, isLoadingData, form, validateFormClientCommentCounts]);

    // Loading state
    if (subSectionId && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading clientComments section data...</p>
        </div>
      );
    }
    // Confirm delete step
    const confirmDeleteStep = (langCode: string, index: number) => {
      setStepToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    };

    return (
      <div className="space-y-6">
        <LoadingDialog
          isOpen={isSaving}
          title={existingSubSectionId ? "Updating ChoseUs" : "Creating ChoseUs"}
          description="Please wait while we save your changes..."
        />

        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {languageIds.map((langId: Key | null | undefined, langIndex: number) => {
              const langCode = String(langId) in languageCodes ? languageCodes[String(langId)] : String(langId);
              const isFirstLanguage = langIndex === 0;

              return (
                <ClientCommentsLanguageCardCard
                  key={langId}
                  langCode={langCode}
                  isFirstLanguage={isFirstLanguage}
                  form={form}
                  addBenefit={addClientComment}
                  removeBenefit={removeChoseUs}
                  syncIcons={syncIcons}
                  availableIcons={getAvailableIcons()}
                  onDeleteStep={confirmDeleteStep}
                />
              );
            })}
          </div>
        </Form>

        <div className="flex justify-end mt-6">
          {benefitCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Each language must have the same number of clientComments
              </span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingData || benefitCountMismatch || isSaving}
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
                {existingSubSectionId ? "Update ChoseUs" : "Save ChoseUs"}
              </>
            )}
          </Button>
        </div>

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

ClientCommentsForm.displayName = "ClientCommentsForm";
export default ClientCommentsForm;
