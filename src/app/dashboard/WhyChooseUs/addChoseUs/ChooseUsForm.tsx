"use client";

import {
  ForwardedRef,
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
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog";
import { createChooseUsDefaultValues, createLanguageCodeMap } from "../../services/addService/Utils/Language-default-values";
import { createFormRef, getAvailableIcons, getSubSectionCountsByLanguage, getSafeIconValue, useForceUpdate, validateSubSectionCounts } from "../../services/addService/Utils/Expose-form-data";
import { processAndLoadData } from "../../services/addService/Utils/load-form-data";
import { ValidationDialog } from "../../services/addService/Components/BenefitsForm/ValidationDialog";
import { ChooseUsLanguageCard } from "./ChooseUsLanguageCard";
import { ChooseUsFormProps, ChooseUsFormRef, ChoseUsFormState } from "@/src/api/types/sections/choseUS/ChooseUs.type";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { useImageUploader } from "../../services/addService/Utils/Image-uploader";
import { BackgroundImageSection } from "../../services/addService/Components/Hero/SimpleImageUploader";
import apiClient from "@/src/lib/api-client";
import { createChooseUsSchema } from "../../services/addService/Utils/language-specific-schemas";
import { StepToDelete } from "@/src/api/types/sections/service/serviceSections.types";

const ChooseUsForm = forwardRef<ChooseUsFormRef, ChooseUsFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { websiteId } = useWebsiteContext();
    const formSchema = createChooseUsSchema(languageIds, activeLanguages);
    const defaultValues = createChooseUsDefaultValues(languageIds, activeLanguages);

 
    const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange" // Enable validation on change for better UX
  });

    // State management
    const [state, setState] = useState<ChoseUsFormState>({
      isLoadingData: !slug,
      dataLoaded: !slug,
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
      (newState: Partial<ChoseUsFormState>) => {
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
    const dataProcessed = useRef(false);

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

    // Image upload hook
    const {
      imageFile,
      imagePreview,
      handleImageUpload,
      handleImageRemove,
    } = useImageUploader({
      form,
      fieldPath: 'backgroundImage',
      initialImageUrl: form.getValues().backgroundImage,
      onUpload: () => updateState({ hasUnsavedChanges: true }),
      onRemove: () => updateState({ hasUnsavedChanges: true }),
      validate: (file: { type: string }) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        return validTypes.includes(file.type) || 'Only JPEG, PNG, GIF, or SVG files are allowed';
      },
    });

    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", Boolean(slug));

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
        const allLanguages = Object.keys(formValues).filter((key) => key !== 'backgroundImage');
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

    // Validate choseUs counts
    const validateFormBenefitCounts = useCallback(() => {
      const values = form.getValues();
      const isValid = validateSubSectionCounts(values);
      updateState({ benefitCountMismatch: !isValid });
      return isValid;
    }, [form, updateState]);

    // Image upload handler
    const uploadImage = useCallback(async (elementId: string, file: string | Blob) => {
      if (!file) return null;

      try {
        const formData = new FormData();
        formData.append("image", file);

        const uploadResult = await apiClient.post(
          `/content-elements/${elementId}/image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const imageUrl = uploadResult.data?.imageUrl ||
                        uploadResult.data?.url ||
                        uploadResult.data?.data?.imageUrl;

        if (imageUrl) {
          form.setValue("backgroundImage", imageUrl, { shouldDirty: false });
          toast({
            title: "Image Uploaded",
            description: "Background image has been successfully uploaded.",
          });
          return imageUrl;
        }

        throw new Error("No image URL returned from server. Response: " + JSON.stringify(uploadResult.data));
      } catch (error) {
        console.error("Image upload failed:", error);
        toast({
          title: "Image Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        });
        throw error;
      }
    }, [form, toast]);

    // Process choseUs data
    const processChoseUsData = useCallback(
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
                if (element.name === "Background Image" && element.type === "image") {
                  if (element.imageUrl) {
                    form.setValue("backgroundImage", element.imageUrl);
                  }
                } else {
                  const match = element.name.match(/ChoseUs (\d+)/i);
                  if (match) {
                    const benefitNumber = parseInt(match[1], 10);
                    if (!benefitGroups[benefitNumber]) {
                      benefitGroups[benefitNumber] = [];
                    }
                    benefitGroups[benefitNumber].push(element);
                  }
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
              const iconElement = elements.find((el) => el.name.includes("Icon"));
              const titleElement = elements.find((el) => el.name.includes("Title"));
              const descriptionElement = elements.find((el) => el.name.includes("Description"));

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
            setExistingSubSectionId: (id) => updateState({ existingSubSectionId: id }),
            setContentElements: (elements) => updateState({ contentElements: elements }),
            setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
            setHasUnsavedChanges: (hasChanges) => updateState({ hasUnsavedChanges: hasChanges }),
            setIsLoadingData: (loading) => updateState({ isLoadingData: loading }),
            validateCounts: validateFormBenefitCounts,
          }
        );
      },
      [form, languageIds, activeLanguages, updateState, validateFormBenefitCounts]
    );

    // Load existing data
    useEffect(() => {
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }

      updateState({ isLoadingData: true });
      processChoseUsData(completeSubsectionData.data);
      updateState({ isLoadingData: false, dataLoaded: true });
      dataProcessed.current = true;
    }, [
      completeSubsectionData,
      isLoadingSubsection,
      dataLoaded,
      slug,
      processChoseUsData,
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
    const addChoseUs = useCallback(
      (langCode: string) => {
        const formValues = form.getValues();
        const allLanguages = Object.keys(formValues).filter((key) => key !== 'backgroundImage');

        allLanguages.forEach((lang) => {
          const currentChoseUs = form.getValues()[lang] || [];
          form.setValue(lang, [
            ...currentChoseUs,
            { icon: "Clock", title: "", description: "" },
          ]);
          form.trigger(lang);
        });

        forceUpdate();

        setTimeout(() => {
          const isValid = validateFormBenefitCounts();
          updateState({ benefitCountMismatch: !isValid });
        }, 0);
      },
      [form, forceUpdate, validateFormBenefitCounts, updateState]
    );

    // Remove benefit
    const removeChoseUs = useCallback(
      async (langCode: string, index: number) => {
        const formValues = form.getValues();
        const allLanguages = Object.keys(formValues).filter((key) => key !== 'backgroundImage');
        const currentChoseUs = form.getValues()[langCode] || [];

        if (currentChoseUs.length <= 1) {
          toast({
            title: "Cannot remove",
            description: "You need at least one benefit",
            variant: "destructive",
          });
          return;
        }

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
            console.error("Error removing choseUs elements:", error);
            toast({
              title: "Error removing benefit",
              description: "There was an error removing the choseUs from the database",
              variant: "destructive",
            });
            return;
          }
        }

        allLanguages.forEach((lang) => {
          const langChoseUs = form.getValues()[lang] || [];
          if (langChoseUs.length > index) {
            const updatedChoseUs = [...langChoseUs];
            updatedChoseUs.splice(index, 1);
            form.setValue(lang, updatedChoseUs);
            form.trigger(lang);
          }
        });

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

      updateState({ isSaving: true });
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
            defaultContent: '',
            isActive: true,
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
            WebSiteId: websiteId,
          };

          const newSubSection = await createSubSection.mutateAsync(subsectionData);
          sectionId = newSubSection.data._id;
          updateState({ existingSubSectionId: sectionId });
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID");
        }

        const langCodeToIdMap = activeLanguages.reduce((acc: { [x: string]: any }, lang: { languageID: string | number; _id: any }) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {} as Record<string, string>);

        let bgImageElement = contentElements.find((el) => el.name === "Background Image" && el.type === "image");
        if (!bgImageElement && imageFile) {
          const newElement = await createContentElement.mutateAsync({
            name: "Background Image",
            type: "image",
            parent: sectionId,
            isActive: true,
            order: -1,
            defaultContent: "image-placeholder",
          });
          bgImageElement = newElement.data;
          updateState({
            contentElements: [...contentElements, newElement.data],
          });
        }

        if (bgImageElement && imageFile) {
          const imageUrl = await uploadImage(bgImageElement._id, imageFile);
          if (!imageUrl) {
            throw new Error("Failed to upload background image");
          }
        }

        const firstLangKey = Object.keys(allFormValues).filter((key) => key !== 'backgroundImage')[0];
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

          let iconElement = contentElements.find((el) => el.name === iconElementName);
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

          let titleElement = contentElements.find((el) => el.name === titleElementName);
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

          let descElement = contentElements.find((el) => el.name === descElementName);
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
            if (langCode === 'backgroundImage' || !Array.isArray(ChoseUs) || !ChoseUs[i]) return;
            const langId = langCodeToIdMap[langCode];
            if (!langId) return;

            const choseUs = ChoseUs[i];
            if (titleElement) {
              translations.push({
                _id: String(choseUs.id),
                content: choseUs.title,
                language: langId,
                contentElement: titleElement._id,
                isActive: true,
              });
            }
            if (descElement) {
              translations.push({
                _id: String(choseUs.id),
                content: choseUs.description,
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

        updateState({ hasUnsavedChanges: false });

        if (slug) {
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
          const updatedData = {
            ...allFormValues,
            backgroundImage: form.getValues("backgroundImage"),
          };
          Object.entries(updatedData).forEach(([key, value]) => {
            if (key !== "backgroundImage") {
              form.setValue(key, value, { shouldDirty: false });
            }
          });
          form.setValue("backgroundImage", updatedData.backgroundImage, { shouldDirty: false });
        }

        return true;
      } catch (error) {
        console.error("Operation failed:", error);
        toast({
          title: existingSubSectionId
            ? "Error updating choseUs section"
            : "Error creating choseUs section",
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
        return false;
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
      refetch,
      processChoseUsData,
      updateState,
      imageFile,
      uploadImage,
    ]);

    // Create form ref
    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
      existingSubSectionId,
      contentElements,
      componentName: "ChoseUs",
      extraMethods: {
        getImageFile: () => imageFile,
        saveData: handleSave,
      },
      extraData: {
        imageFile,
        existingSubSectionId,
      },
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

    // Confirm delete step
    const confirmDeleteStep = (langCode: string, index: number) => {
      setStepToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    };

    // Render content conditionally without early return
    const isLoading = slug && (isLoadingData || isLoadingSubsection) && !dataLoaded;

    return (
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p className="text-muted-foreground">Loading choseUs section data...</p>
          </div>
        ) : (
          <>
            <LoadingDialog
              isOpen={isSaving}
              title={existingSubSectionId ? "Updating ChoseUs" : "Creating ChoseUs"}
              description="Please wait while we save your changes..."
            />

            <Form {...form}>
              <BackgroundImageSection
                imagePreview={imagePreview || undefined}
                imageValue={form.getValues().backgroundImage}
                onUpload={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event.target.files && event.target.files.length > 0) {
                    handleImageUpload({ target: { files: Array.from(event.target.files) } });
                  }
                }}
                onRemove={handleImageRemove}
                imageType="background"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {languageIds.map((langId: Key | null | undefined, langIndex: number) => {
                  const langCode = String(langId) in languageCodes ? languageCodes[String(langId)] : String(langId);
                  const isFirstLanguage = langIndex === 0;

                  return (
                    <ChooseUsLanguageCard
                      key={langId}
                      langCode={langCode}
                      isFirstLanguage={isFirstLanguage}
                      form={form}
                      addBenefit={addChoseUs}
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
                    Each language must have the same number of choseUs
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
              onConfirm={async () => {
                if (stepToDelete) {
                  await removeChoseUs(stepToDelete.langCode, stepToDelete.index);
                }
              }}
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
          </>
        )}
      </div>
    );
  }
);

ChooseUsForm.displayName = "ChooseUsForm";
export default ChooseUsForm;