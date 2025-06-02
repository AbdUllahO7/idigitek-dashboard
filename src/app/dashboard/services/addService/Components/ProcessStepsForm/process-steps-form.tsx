"use client"

import { forwardRef, useEffect, useState, useRef, memo, useMemo, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { 
  Save, 
  AlertTriangle,
  Loader2,
  Trash2
} from "lucide-react"
import { Form } from "@/src/components/ui/form"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useToast } from "@/src/hooks/use-toast"
import { createProcessStepsDefaultValues } from "../../Utils/Language-default-values"
import { createFormRef } from "../../Utils/Expose-form-data"
import { processAndLoadData } from "../../Utils/load-form-data"
import { createLanguageCodeMap } from "../../Utils/language-utils"
import { LanguageCard } from "./LanguageCard"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import { HeroFormProps, HeroFormRef } from "@/src/api/types/sections/service/serviceSections.types"
import { SubSection } from "@/src/api/types/hooks/section.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import { createProcessStepsSchema } from "../../Utils/language-specific-schemas"
import { ContentElement } from "@/src/api/types/hooks/content.types"
import { useSubsectionDeleteManager } from "@/src/hooks/DeleteSubSections/useSubsectionDeleteManager"
import { DeleteConfirmationDialog } from "@/src/components/DeleteConfirmationDialog"

const ProcessStepsForm = forwardRef<HeroFormRef, HeroFormProps>(
  (props, ref) => {
    // Memoize schema creation to prevent unnecessary recalculations
    const { 
      languageIds, 
      activeLanguages, 
      onDataChange, 
      slug, 
      ParentSectionId, 
    } = props;


      const { websiteId } = useWebsiteContext();
    
    const formSchema = useMemo(() => 
      createProcessStepsSchema(languageIds, activeLanguages), 
      [languageIds, activeLanguages]
    );

    const [isLoadingData, setIsLoadingData] = useState(!slug);
    const [dataLoaded, setDataLoaded] = useState(!slug);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [stepCountMismatch, setStepCountMismatch] = useState(false);
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null);
    const [contentElements, setContentElements] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshingAfterDelete, setIsRefreshingAfterDelete] = useState(false);
    const { toast } = useToast();

    // State for delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [stepToDelete, setStepToDelete] = useState<{ langCode: string, index: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get default language code for form values - memoized
    const defaultLangCode = useMemo(() => 
      activeLanguages.length > 0 ? activeLanguages[0].languageID : "en",
      [activeLanguages]
    );
    
    // Memoize default values to prevent unnecessary recalculations
    const defaultValues = useMemo(() => 
      createProcessStepsDefaultValues(languageIds, activeLanguages),
      [languageIds, activeLanguages]
    );

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: defaultValues,
    });

    // Store callbacks in refs to prevent unnecessary effect reruns
    const onDataChangeRef = useRef(onDataChange);
    useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    // API hooks
    const { useCreate: useCreateSubSection, useGetCompleteBySlug } = useSubSections();
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

    // Query for complete subsection data by slug if provided
    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", !slug);

    // Process data loading - extracted as a separate function
    const processProcessStepsData = useCallback((subsectionData: SubSection | null) => {
      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          // Group elements by step number
          groupElements: (elements) => {
            const stepGroups: Record<string, ContentElement[]> = {};
            elements.forEach((element) => {
              const match = element.name.match(/Step (\d+)/i);
              if (match) {
                const stepNumber = match[1];
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
    }, [form, languageIds, activeLanguages]);

    // Delete manager for entire subsection
    const deleteManager = useSubsectionDeleteManager({
      subsectionId: existingSubSectionId,
      websiteId,
      slug,
      sectionName: "process steps section",
      contentElements,
      customWarnings: [
        "All process steps will be permanently removed",
        "This action cannot be undone"
      ],
      shouldRefetch: !!slug,
      refetchFn: refetch,
      resetForm: () => {
        form.reset(defaultValues);
      },
      resetState: () => {
        setExistingSubSectionId(null);
        setContentElements([]);
        setHasUnsavedChanges(false);
        setDataLoaded(!slug);
        setStepCountMismatch(false);
      },
      onDataChange,
      onDeleteSuccess: async () => {
        setIsRefreshingAfterDelete(true);
        
        if (slug) {
          try {
            const result = await refetch();
            if (result.data?.data) {
              setIsLoadingData(true);
              await processProcessStepsData(result.data.data);
              setIsLoadingData(false);
            } else {
              setDataLoaded(true);
              setIsLoadingData(false);
            }
          } catch (refetchError) {
            console.log("Refetch after deletion resulted in expected error (subsection deleted)");
            setDataLoaded(true);
            setIsLoadingData(false);
          }
        }
        
        setIsRefreshingAfterDelete(false);
      },
    });

    // Check if all languages have the same number of steps
    const validateStepCounts = () => {
      const values = form.getValues();
      const counts = Object.values(values).map((langSteps) => (Array.isArray(langSteps) ? langSteps.length : 0));
      const allEqual = counts.every((count) => count === counts[0]);
      setStepCountMismatch(!allEqual);
      return allEqual;
    };

    // Effect to populate form with existing data
    useEffect(() => {
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }

      setIsLoadingData(true);
      processProcessStepsData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, slug, processProcessStepsData]);

    // Track form changes with debounce for better performance
    useEffect(() => {
      if (isLoadingData || !dataLoaded) return;

      const timeoutId = setTimeout(() => {
        const subscription = form.watch((value) => {
          setHasUnsavedChanges(true);
          validateStepCounts();
          if (onDataChangeRef.current) {
            onDataChangeRef.current(value);
          }
        });
        return () => subscription.unsubscribe();
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [form, isLoadingData, dataLoaded]);

    // Function to add a new process step to all languages
    const addProcessStep = () => {
      const newStep = {
        icon: "Car",
        title: "",
        description: "",
      };

      Object.keys(form.getValues()).forEach((langCode) => {
        const currentSteps = form.getValues()[langCode] || [];
        form.setValue(langCode, [...currentSteps, newStep], {
          shouldDirty: true,
          shouldValidate: true,
        });
      });

      toast({
        title: "Step added",
        description: "A new process step has been added to all languages.",
      });
    };

    // Function to trigger delete confirmation dialog
    const confirmDeleteStep = (langCode: string, index: number) => {
      setStepToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    };

    // Function to remove a process step after confirmation
    const removeProcessStep = async () => {
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
          // Filter elements related to this step
          const stepElements = contentElements.filter((element) => {
            const match = element.name.match(/Step (\d+)/i);
            return match && Number.parseInt(match[1]) === stepNumber;
          });

          // Delete step elements from DB
          if (stepElements.length > 0) {
            await Promise.all(stepElements.map(async (element) => {
              try {
                await deleteContentElement.mutateAsync(element._id);
              } catch (error) {
                console.error(`Failed to delete content element ${element.name}:`, error);
              }
            }));

            setContentElements((prev) =>
              prev.filter((element) => {
                const match = element?.name?.match(/Step (\d+)/i);
                return !(match && Number.parseInt(match[1]) === stepNumber);
              }),
            );

            toast({
              title: "Step deleted",
              description: `Step ${stepNumber} has been deleted from the database`,
            });
          }

          // Update remaining elements (renumber)
          const remainingElements = contentElements.filter((element) => {
            const match = element.name.match(/Step (\d+)/i);
            return match && Number.parseInt(match[1]) > stepNumber;
          });

          await Promise.all(remainingElements.map(async (element) => {
            const match = element.name.match(/Step (\d+)/i);
            if (match) {
              const oldNumber = Number.parseInt(match[1]);
              const newNumber = oldNumber - 1;
              const newName = element.name.replace(`Step ${oldNumber}`, `Step ${newNumber}`);
              const newOrder = element.order - 3;

              try {
                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: {
                    name: newName,
                    order: newOrder,
                  },
                });
              } catch (error) {
                console.error(`Failed to update element ${element.name}:`, error);
              }
            }
          }));
        } catch (error) {
          console.error("Error removing process step elements:", error);
          toast({
            title: "Error removing step",
            description: "There was an error removing the step from the database",
            variant: "destructive",
          });
        }
      }

      // Update form values for all languages
      Object.keys(form.getValues()).forEach((langCode) => {
        const updatedSteps = [...(form.getValues()[langCode] || [])];
        updatedSteps.splice(index, 1);
        form.setValue(langCode, updatedSteps);
      });
      
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      validateStepCounts();
    };

    // Function to get step counts by language - memoized for performance
    const getStepCountsByLanguage = useMemo(() => {
      const values = form.getValues();
      return Object.entries(values).map(([langCode, steps]) => ({
        language: langCode,
        count: Array.isArray(steps) ? steps.length : 0,
      }));
    }, [form, stepCountMismatch]);

    // Save handler with optimizations
    const handleSave = useCallback(async () => {
      // First validate before doing any expensive operations
      const isValid = await form.trigger();
      const hasEqualStepCounts = validateStepCounts();

      if (!hasEqualStepCounts) {
        setIsValidationDialogOpen(true);
        return false;
      }

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly",
          variant: "destructive",
        });
        return false;
      }

      setIsSaving(true);
      setIsLoadingData(true);
      
      try {
        const allFormValues = form.getValues();

        // If we don't have a subsection ID, create one
        let sectionId = existingSubSectionId;
        if (!existingSubSectionId) {
          const subsectionData = {
            name: "Process Steps Section",
            slug: slug || `process-steps-section-${Date.now()}`,
            description: "Process steps section for the website",
            isActive: true,
            order: 0,
            defaultContent : '',
            sectionItem: ParentSectionId,
            languages: languageIds,
            WebSiteId : websiteId

          };

          toast({
            title: "Creating new process steps section...",
            description: "Setting up your new process steps content.",
          });

          const newSubSection = await createSubSection.mutateAsync(subsectionData);
          sectionId = newSubSection.data._id;
          setExistingSubSectionId(sectionId);
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID");
        }

        // Create language mapping
        const langCodeToIdMap = activeLanguages.reduce((acc: Record<string, string>, lang) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {});

        // Use the first language values to determine the number of steps
        const firstLangCode = Object.keys(allFormValues)[0];
        const steps = allFormValues[firstLangCode];

        if (!Array.isArray(steps)) {
          throw new Error("Invalid steps data");
        }

        const updatedContentElements = [...contentElements];
        const translations: { content: any; language: any; contentElement: any; isActive: boolean }[] = [];

        // Handle existing content vs creating new content
        if (existingSubSectionId && contentElements.length > 0) {
          // Organize existing elements by step numbers
          const stepGroups: Record<number, Array<{ _id: string; name: string; order: number; defaultContent?: string }>> = {};
          contentElements.forEach((element) => {
            const match = element.name.match(/Step (\d+)/i);
            if (match) {
              const stepNumber = Number.parseInt(match[1]);
              if (!stepGroups[stepNumber]) {
                stepGroups[stepNumber] = [];
              }
              stepGroups[stepNumber].push(element);
            }
          });

          // Process each step
          for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            const stepNumber = stepIndex + 1;
            const stepElements = stepGroups[stepNumber];

            if (stepElements) {
              // Update existing elements
              const iconElement = stepElements.find((el) => el.name.includes("Icon"));
              const titleElement = stepElements.find((el) => el.name.includes("Title"));
              const descriptionElement = stepElements.find((el) => el.name.includes("Description"));

              // Update the icon only for the first language
              const firstLangStep = allFormValues[defaultLangCode][stepIndex];
              if (iconElement && firstLangStep?.icon) {
                await updateContentElement.mutateAsync({
                  id: iconElement._id,
                  data: {
                    defaultContent: firstLangStep.icon,
                  },
                });
                
                // Update in our local state too
                const foundElementIndex = updatedContentElements.findIndex(e => e._id === iconElement._id);
                if (foundElementIndex !== -1) {
                  updatedContentElements[foundElementIndex] = {
                    ...updatedContentElements[foundElementIndex],
                    defaultContent: firstLangStep.icon
                  };
                }
              }

              // Prepare translations for all languages
              Object.entries(allFormValues).forEach(([langCode, langSteps]) => {
                if (!Array.isArray(langSteps) || !langSteps[stepIndex]) return;
                const langId = langCodeToIdMap[langCode];
                if (!langId) return;
                const step = langSteps[stepIndex];

                if (titleElement && step.title) {
                  translations.push({
                    content: step.title,
                    language: langId,
                    contentElement: titleElement._id,
                    isActive: true,
                  });
                }

                if (descriptionElement && step.description) {
                  translations.push({
                    content: step.description,
                    language: langId,
                    contentElement: descriptionElement._id,
                    isActive: true,
                  });
                }
              });
            }
          }

          // Create new steps as needed
          const existingStepCount = Object.keys(stepGroups).length;
          if (steps.length > existingStepCount) {
            for (let stepNumber = existingStepCount + 1; stepNumber <= steps.length; stepNumber++) {
              const stepIndex = stepNumber - 1;
              
              // Create elements with icon from first language only
              const firstLangStep = allFormValues[defaultLangCode][stepIndex];
              
              // Create new elements in parallel for better performance
              const [iconElement, titleElement, descriptionElement] = await Promise.all([
                createContentElement.mutateAsync({
                  name: `Step ${stepNumber} - Icon`,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: (stepNumber - 1) * 3,
                  defaultContent: firstLangStep?.icon || "Car",
                }),
                createContentElement.mutateAsync({
                  name: `Step ${stepNumber} - Title`,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: (stepNumber - 1) * 3 + 1,
                  defaultContent: "",
                }),
                createContentElement.mutateAsync({
                  name: `Step ${stepNumber} - Description`,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: (stepNumber - 1) * 3 + 2,
                  defaultContent: "",
                })
              ]);

              updatedContentElements.push(
                iconElement.data, 
                titleElement.data, 
                descriptionElement.data
              );

              // Add translations for all languages
              Object.entries(allFormValues).forEach(([langCode, langSteps]) => {
                if (!Array.isArray(langSteps) || !langSteps[stepIndex]) return;
                const langId = langCodeToIdMap[langCode];
                if (!langId) return;
                const step = langSteps[stepIndex];

                if (step.title) {
                  translations.push({
                    content: step.title,
                    language: langId,
                    contentElement: titleElement.data._id,
                    isActive: true,
                  });
                }

                if (step.description) {
                  translations.push({
                    content: step.description,
                    language: langId,
                    contentElement: descriptionElement.data._id,
                    isActive: true,
                  });
                }
              });
            }
          }
        } else {
          // Create new section from scratch - create all elements in parallel for better performance
          const stepCreationPromises = [];
          
          for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            const stepNumber = stepIndex + 1;
            // Use first language for the icon
            const firstLangStep = allFormValues[defaultLangCode][stepIndex];

            stepCreationPromises.push(
              (async () => {
                const [iconElement, titleElement, descriptionElement] = await Promise.all([
                  createContentElement.mutateAsync({
                    name: `Step ${stepNumber} - Icon`,
                    type: "text",
                    parent: sectionId,
                    isActive: true,
                    order: stepIndex * 3,
                    defaultContent: firstLangStep?.icon || "Car",
                  }),
                  createContentElement.mutateAsync({
                    name: `Step ${stepNumber} - Title`,
                    type: "text",
                    parent: sectionId,
                    isActive: true,
                    order: stepIndex * 3 + 1,
                    defaultContent: "",
                  }),
                  createContentElement.mutateAsync({
                    name: `Step ${stepNumber} - Description`,
                    type: "text",
                    parent: sectionId,
                    isActive: true,
                    order: stepIndex * 3 + 2,
                    defaultContent: "",
                  })
                ]);

                updatedContentElements.push(
                  iconElement.data, 
                  titleElement.data, 
                  descriptionElement.data
                );

                // Add translations for all languages
                Object.entries(allFormValues).forEach(([langCode, langSteps]) => {
                  if (!Array.isArray(langSteps) || !langSteps[stepIndex]) return;
                  const langId = langCodeToIdMap[langCode];
                  if (!langId) return;
                  const step = langSteps[stepIndex];

                  if (step.title) {
                    translations.push({
                      content: step.title,
                      language: langId,
                      contentElement: titleElement.data._id,
                      isActive: true,
                    });
                  }

                  if (step.description) {
                    translations.push({
                      content: step.description,
                      language: langId,
                      contentElement: descriptionElement.data._id,
                      isActive: true,
                    });
                  }
                });
              })()
            );
          }

          // Wait for all steps to be created
          await Promise.all(stepCreationPromises);
        }

        // Bulk upsert translations for better performance
        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        }

        setContentElements(updatedContentElements);

        toast({
          title: existingSubSectionId ? "Process steps updated successfully!" : "Process steps created successfully!",
          description: "All changes have been saved.",
          duration: 5000,
        });

        if (slug) {
          toast({
            title: "Refreshing content",
            description: "Loading the updated content...",
          });

          const result = await refetch();
          if (result.data?.data) {
            setDataLoaded(false);
            await processProcessStepsData(result.data.data);
          }
        }

        setHasUnsavedChanges(false);
        return true;
      } catch (error) {
        console.error("Operation failed:", error);
        toast({
          title: existingSubSectionId ? "Error updating process steps" : "Error creating process steps",
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          duration: 5000,
        });
        return false;
      } finally {
        setIsLoadingData(false);
        setIsSaving(false);
      }
    }, [
      form,
      validateStepCounts,
      toast,
      existingSubSectionId,
      slug,
      ParentSectionId,
      languageIds,
      websiteId,
      createSubSection,
      activeLanguages,
      contentElements,
      updateContentElement,
      defaultLangCode,
      createContentElement,
      bulkUpsertTranslations,
      refetch,
      processProcessStepsData,
    ]);

    // Create form ref for parent component access
    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      existingSubSectionId,
      contentElements,
      componentName: 'Process steps',
      extraMethods: {
        saveData: handleSave,
        deleteData: deleteManager.handleDelete,
      },
      extraData: {
        existingSubSectionId,
      },
    });

    // Get language codes for display
    const languageCodes = useMemo(() => 
      createLanguageCodeMap(activeLanguages),
      [activeLanguages]
    );

    // Determine if a language is the first language (for icon control)
    const isFirstLanguage = (langCode: string) => langCode === defaultLangCode;

    // Loading state
    if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading process steps data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Loading Dialogs */}
        <LoadingDialog 
          isOpen={isSaving} 
          title={existingSubSectionId ? "Updating Process Steps" : "Creating Process Steps"} 
          description="Please wait while we save your changes..."
        />

        <LoadingDialog
          isOpen={deleteManager.isDeleting}
          title="Deleting Process Steps"
          description="Please wait while we delete the process steps section..."
        />

        <LoadingDialog
          isOpen={isRefreshingAfterDelete}
          title="Refreshing Data"
          description="Updating the interface after deletion..."
        />
        
        {/* Delete Confirmation Dialog for entire section */}
        <DeleteConfirmationDialog
          {...deleteManager.confirmationDialogProps}
          title="Delete Process Steps Section"
          description="Are you sure you want to delete this entire process steps section? This action cannot be undone."
        />
        
        {/* Main Form */}
        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {languageIds.map((langId) => {
              const langCode = languageCodes[langId] || langId;
              
              return (
                <LanguageCard
                  key={langId}
                  langId={langId}
                  langCode={langCode}
                  isFirstLanguage={isFirstLanguage(langCode)}
                  defaultLangCode={defaultLangCode}
                  form={form}
                  onAddStep={addProcessStep}
                  onDeleteStep={confirmDeleteStep}
                />
              );
            })}
          </div>
        </Form>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          {/* Delete Button - Only show if there's an existing subsection */}
          {existingSubSectionId && (
            <Button
              type="button"
              variant="destructive"
              onClick={deleteManager.openDeleteDialog}
              disabled={
                isLoadingData || 
                isSaving || 
                deleteManager.isDeleting || 
                isRefreshingAfterDelete ||
                stepCountMismatch
              }
              className="flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Process Steps
            </Button>
          )}

          {/* Save Button */}
          <div className={existingSubSectionId ? "" : "ml-auto"}>
            {stepCountMismatch && (
              <div className="flex items-center text-amber-500 mr-4 mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">Each language must have the same number of steps</span>
              </div>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                isLoadingData || 
                stepCountMismatch || 
                isSaving || 
                deleteManager.isDeleting || 
                isRefreshingAfterDelete
              }
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
                  {getStepCountsByLanguage.map(({ language, count }) => (
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
        
        {/* Delete Individual Step Confirmation Dialog */}
        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={stepToDelete ? `Step ${stepToDelete.index + 1}` : ''}
          onConfirm={removeProcessStep}
          isDeleting={isDeleting}
          title="Delete Process"
          confirmText="Delete Process"
        />
      </div>
    );
  }
);

ProcessStepsForm.displayName = "ProcessStepsForm";

export default ProcessStepsForm;