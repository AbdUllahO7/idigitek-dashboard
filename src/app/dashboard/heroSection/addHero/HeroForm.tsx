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
import { ValidationDialog } from "./ValidationDialog";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { HeroFormProps, HeroFormRef, StepToDelete } from "@/src/api/types/sections/service/serviceSections.types";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { createHeroSectionSchema } from "../../services/addService/Utils/language-specific-schemas";
import { createHeroSectionDefaultValues, createLanguageCodeMap } from "../../services/addService/Utils/Language-default-values";
import { createFormRef, getSubSectionCountsByLanguage, useForceUpdate, validateSubSectionCounts } from "../../services/addService/Utils/Expose-form-data";
import { LanguageCard } from "./HeroLanguageCard";
import { HeroesFormState } from "@/src/api/types/sections/heroSection/HeroSection.type";
import { processAndLoadData } from "../../services/addService/Utils/load-form-data";
import apiClient from "@/src/lib/api-client";
import { useHeroImages } from "./utils/useHeroImages";

interface FormData {
  [key: string]: Array<{
    title: string;
    description: string;
    requestButton: string;
    exploreButton: string;
    image: string;
    id?: string;
  }>;
}

const HeroesForm = forwardRef<HeroFormRef, HeroFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { websiteId } = useWebsiteContext();
    const formSchema = createHeroSectionSchema(languageIds, activeLanguages);
    const defaultValues = createHeroSectionDefaultValues(languageIds, activeLanguages);

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
      mode: "onChange",
    });

    const [state, setState] = useState<HeroesFormState>({
      isLoadingData: !!slug,
      dataLoaded: !slug,
      hasUnsavedChanges: false,
      isValidationDialogOpen: false,
      heroCountMismatch: false,
      existingSubSectionId: null,
      contentElements: [],
      isSaving: false,
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [stepToDelete, setStepToDelete] = useState<StepToDelete | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const updateState = useCallback(
      (newState: Partial<HeroesFormState>) => {
        setState((prev) => ({ ...prev, ...newState }));
      },
      []
    );

    const { toast } = useToast();
    const primaryLanguageRef = useRef<string | null>(null);
    const onDataChangeRef = useRef(onDataChange);

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

    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", Boolean(slug));

    const { heroImages, handleHeroImageRemove, updateHeroImageIndices, HeroImageUploader } = useHeroImages(form);

    useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    useEffect(() => {
      if (languageIds.length > 0) {
        primaryLanguageRef.current = languageIds[0];
      }
    }, [languageIds]);

    const validateFormHeroCounts = useCallback(() => {
      const values = form.getValues();
      const isValid = validateSubSectionCounts(values);
      updateState({ heroCountMismatch: !isValid });
      return isValid;
    }, [form, updateState]);

    const removeProcessStep = useCallback(async () => {
      if (!stepToDelete) return;

      const { langCode, index } = stepToDelete;
      setIsDeleting(true);

      const currentSteps = form.getValues()[langCode] || [];
      if (currentSteps.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one hero",
          variant: "destructive",
        });
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }

      try {
        if (state.existingSubSectionId && state.contentElements.length > 0) {
          const heroNumber = index + 1;
          const heroElements = state.contentElements.filter((element) => {
            const match = element.name.match(/Hero (\d+)/i);
            return match && Number.parseInt(match[1]) === heroNumber;
          });

          if (heroElements.length > 0) {
            await Promise.all(
              heroElements.map((element) => deleteContentElement.mutateAsync(element._id))
            );

            updateState({
              contentElements: state.contentElements.filter((element) => {
                const match = element.name.match(/Hero (\d+)/i);
                return !(match && Number.parseInt(match[1]) === heroNumber);
              }),
            });

            toast({
              title: "Hero deleted",
              description: `Hero ${heroNumber} has been deleted from the database`,
            });
          }

          const remainingElements = state.contentElements.filter((element) => {
            const match = element.name.match(/Hero (\d+)/i);
            return match && Number.parseInt(match[1]) > heroNumber;
          });

          await Promise.all(
            remainingElements.map(async (element) => {
              const match = element.name.match(/Hero (\d+)/i);
              if (match) {
                const oldNumber = Number.parseInt(match[1]);
                const newNumber = oldNumber - 1;
                const newName = element.name.replace(`Hero ${oldNumber}`, `Hero ${newNumber}`);
                const newOrder = element.order - 5; // Adjusted for five fields (including image)

                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: { name: newName, order: newOrder },
                });
              }
            })
          );

          handleHeroImageRemove(index);
          for (let i = index + 1; i < currentSteps.length; i++) {
            updateHeroImageIndices(i, i - 1);
          }
        }

        Object.keys(form.getValues()).forEach((langCode) => {
          const updatedSteps = [...(form.getValues()[langCode] || [])];
          updatedSteps.splice(index, 1);
          form.setValue(langCode, updatedSteps, { shouldDirty: true, shouldValidate: true });
        });

        toast({
          title: "Hero removed",
          description: "The hero has been removed successfully.",
        });

        validateFormHeroCounts();
        updateState({ hasUnsavedChanges: true });
      } catch (error) {
        console.error("Error removing hero:", error);
        toast({
          title: "Error",
          description: "There was an error removing the hero.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setStepToDelete(null);
      }
    }, [
      stepToDelete,
      form,
      state.existingSubSectionId,
      state.contentElements,
      deleteContentElement,
      updateContentElement,
      handleHeroImageRemove,
      updateHeroImageIndices,
      toast,
      validateFormHeroCounts,
      updateState,
    ]);

    const processHeroesData = useCallback(
      (subsectionData: SubSection) => {
        updateState({ isLoadingData: true });
        try {
          processAndLoadData(
            subsectionData,
            form,
            languageIds,
            activeLanguages,
            {
              groupElements: (elements) => {
                const heroGroups: { [key: number]: ContentElement[] } = {};
                elements.forEach((element: any) => {
                  const match = element.name.match(/Hero (\d+)/i);
                  if (match) {
                    const heroNumber = parseInt(match[1], 10);
                    if (!heroGroups[heroNumber]) {
                      heroGroups[heroNumber] = [];
                    }
                    heroGroups[heroNumber].push(element);
                  }
                });
                return heroGroups;
              },
              processElementGroup: (
                heroNumber,
                elements,
                langId,
                getTranslationContent
              ) => {
                const titleElement = elements.find((el) => el.name.includes("Title"));
                const descriptionElement = elements.find((el) => el.name.includes("Description"));
                const exploreButtonElement = elements.find((el) => el.name.includes("ExploreButton"));
                const requestButtonElement = elements.find((el) => el.name.includes("RequestButton"));
                const imageElement = elements.find((el) => el.name.includes("Image") && el.type === "image");

                return {
                  id: `hero-${heroNumber}`,
                  title: getTranslationContent(titleElement, ""),
                  description: getTranslationContent(descriptionElement, ""),
                  exploreButton: getTranslationContent(exploreButtonElement, ""),
                  requestButton: getTranslationContent(requestButtonElement, ""),
                  image: imageElement?.imageUrl || "",
                };
              },
              getDefaultValue: () => [
                {
                  id: "hero-1",
                  title: "",
                  description: "",
                  exploreButton: "",
                  requestButton: "",
                  image: "",
                },
              ],
            },
            {
              setExistingSubSectionId: (id) => updateState({ existingSubSectionId: id }),
              setContentElements: (elements) => updateState({ contentElements: elements }),
              setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
              setHasUnsavedChanges: (hasChanges) => updateState({ hasUnsavedChanges: hasChanges }),
              setIsLoadingData: (loading) => updateState({ isLoadingData: loading }),
              validateCounts: validateFormHeroCounts,
            }
          );
          console.log("Form values after processHeroesData:", form.getValues());
        } catch (error) {
          console.error("Error processing hero data:", error);
          toast({
            title: "Error loading data",
            description: "Failed to load hero data. Please try again.",
            variant: "destructive",
          });
        } finally {
          updateState({ isLoadingData: false });
        }
      },
      [form, languageIds, activeLanguages, updateState, validateFormHeroCounts, toast]
    );

    useEffect(() => {
      if (!slug || state.dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }
      console.log("Refetching data:", completeSubsectionData.data);
      processHeroesData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, state.dataLoaded, slug, processHeroesData]);

    useEffect(() => {
      if (state.isLoadingData || !state.dataLoaded) return;

      const subscription = form.watch((value) => {
        updateState({ hasUnsavedChanges: true });
        validateFormHeroCounts();
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value as FormData);
        }
      });

      return () => subscription.unsubscribe();
    }, [form, state.isLoadingData, state.dataLoaded, validateFormHeroCounts, updateState]);

    const addHero = useCallback(
      (langCode: string) => {
        const newHeroId = `hero-${Date.now()}`;
        const newHero = {
          id: newHeroId,
          title: "",
          description: "",
          exploreButton: "",
          requestButton: "",
          image: "",
        };

        Object.keys(form.getValues()).forEach((lang) => {
          const currentHeroes = form.getValues()[lang] || [];
          form.setValue(lang, [...currentHeroes, newHero], {
            shouldDirty: true,
            shouldValidate: true,
          });
        });

        validateFormHeroCounts();
        updateState({ hasUnsavedChanges: true });
        toast({
          title: "Hero added",
          description: "A new hero has been added. Please fill in the details and save your changes.",
        });
      },
      [form, validateFormHeroCounts, updateState, toast]
    );

    const confirmDeleteStep = useCallback((langCode: string, index: number) => {
      const currentHeroes = form.getValues()[langCode] || [];
      if (currentHeroes.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one hero",
          variant: "destructive",
        });
        return;
      }
      setStepToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    }, [form, toast]);

    const handleSave = useCallback(async () => {
      const isValid = await form.trigger();
      const hasEqualHeroCounts = validateFormHeroCounts();

      if (!hasEqualHeroCounts) {
        updateState({ isValidationDialogOpen: true });
        toast({
          title: "Validation Error",
          description: "All languages must have the same number of heroes.",
          variant: "destructive",
        });
        return;
      }

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly.",
          variant: "destructive",
        });
        return;
      }

      updateState({ isSaving: true });

      try {
        const allFormValues = form.getValues();
        console.log("Form values before save:", allFormValues);
        let sectionId = state.existingSubSectionId;

        if (!sectionId) {
          if (!ParentSectionId) {
            throw new Error("Parent section ID is required to create a subsection");
          }

          const subsectionData = {
            name: "Heroes Section",
            slug: slug || `heroes-section-${Date.now()}`,
            description: "Heroes section for the website",
            defaultContent: "",
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

        const langCodeToIdMap = activeLanguages.reduce((acc: Record<string, string>, lang: { languageID: string; _id: string }) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {});

        const firstLangKey = Object.keys(allFormValues)[0];
        const heroCount = Array.isArray(allFormValues[firstLangKey]) ? allFormValues[firstLangKey].length : 0;
        const translations: ContentTranslation[] = [];
        const processedElementIds = new Set<string>();

        for (let i = 0; i < heroCount; i++) {
          const heroIndex = i + 1;
          const elementNames = {
            title: `Hero ${heroIndex} - Title`,
            description: `Hero ${heroIndex} - Description`,
            exploreButton: `Hero ${heroIndex} - ExploreButton`,
            requestButton: `Hero ${heroIndex} - RequestButton`,
            image: `Hero ${heroIndex} - Image`,
          };

          const elements: Record<string, ContentElement | null> = {
            title: state.contentElements.find((el) => el.name === elementNames.title) ?? null,
            description: state.contentElements.find((el) => el.name === elementNames.description) ?? null,
            exploreButton: state.contentElements.find((el) => el.name === elementNames.exploreButton) ?? null,
            requestButton: state.contentElements.find((el) => el.name === elementNames.requestButton) ?? null,
            image: state.contentElements.find((el) => el.name === elementNames.image && el.type === "image") ?? null,
          };

          const elementTypes = [
            { type: "text", key: "title", name: elementNames.title },
            { type: "text", key: "description", name: elementNames.description },
            { type: "text", key: "exploreButton", name: elementNames.exploreButton },
            { type: "text", key: "requestButton", name: elementNames.requestButton },
            { type: "image", key: "image", name: elementNames.image },
          ];

          for (const { type, key, name } of elementTypes) {
            if (!elements[key]) {
              const newElement = await createContentElement.mutateAsync({
                name,
                type,
                parent: sectionId,
                isActive: true,
                order: i * 5 + elementTypes.findIndex((t) => t.key === key),
                defaultContent: type === "image" ? "image-placeholder" : "",
              });
              elements[key] = newElement.data;
              updateState({
                contentElements: [...state.contentElements, newElement.data],
              });
            }
            if (elements[key]) {
              processedElementIds.add(elements[key]!._id);
            }
          }

          Object.entries(allFormValues).forEach(([langCode, heroes]) => {
            if (!Array.isArray(heroes) || !heroes[i]) return;
            const langId = langCodeToIdMap[langCode];
            if (!langId) return;

            const hero = heroes[i];
            if (elements.title) {
              translations.push({
                _id: "",
                content: hero.title || "",
                language: langId,
                contentElement: elements.title._id,
                isActive: true,
              });
            }
            if (elements.description) {
              translations.push({
                _id: "",
                content: hero.description || "",
                language: langId,
                contentElement: elements.description._id,
                isActive: true,
              });
            }
            if (elements.exploreButton) {
              translations.push({
                _id: "",
                content: hero.exploreButton || "",
                language: langId,
                contentElement: elements.exploreButton._id,
                isActive: true,
              });
            }
            if (elements.requestButton) {
              translations.push({
                _id: "",
                content: hero.requestButton || "",
                language: langId,
                contentElement: elements.requestButton._id,
                isActive: true,
              });
            }
          });

          const imageFile = heroImages[i];
          if (imageFile && elements.image) {
            console.log("Uploading image for hero", i, imageFile);
            try {
              const formData = new FormData();
              formData.append("image", imageFile);
              const uploadResult = await apiClient.post(`/content-elements/${elements.image._id}/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              console.log("Upload result:", uploadResult.data);

              if (uploadResult.data?.imageUrl) {
                Object.entries(allFormValues).forEach(([langCode]) => {
                  if (allFormValues[langCode] && allFormValues[langCode][i]) {
                    form.setValue(`${langCode}.${i}.image`, uploadResult.data.imageUrl, { shouldDirty: true });
                  }
                });
              } 
            } catch (uploadError) {
              console.error("Image upload failed for hero", i, uploadError);
              toast({
                title: "Image Upload Error",
                description: `Failed to upload image for Hero ${heroIndex}. Please try again.`,
                variant: "destructive",
              });
            }
          } else if (!imageFile && elements.image) {
            console.log(`No image file provided for Hero ${heroIndex}`);
          } else if (!elements.image) {
            console.error(`Image content element not found for Hero ${heroIndex}`);
            toast({
              title: "Configuration Error",
              description: `Image content element missing for Hero ${heroIndex}.`,
              variant: "destructive",
            });
          }
        }

        if (translations.length > 0) {
          const batchSize = 20;
          for (let i = 0; i < translations.length; i += batchSize) {
            const batch = translations.slice(i, i + batchSize);
            await bulkUpsertTranslations.mutateAsync(batch);
          }
        }

        const orphanedElements = state.contentElements.filter((el) => !processedElementIds.has(el._id));
        if (orphanedElements.length > 0) {
          await Promise.all(
            orphanedElements.map((element) => deleteContentElement.mutateAsync(element._id))
          );
          updateState({
            contentElements: state.contentElements.filter((el) => processedElementIds.has(el._id)),
          });
        }

        console.log("Form values after save:", form.getValues());
        toast({
          title: state.existingSubSectionId ? "Heroes section updated successfully!" : "Heroes section created successfully!",
          description: "All content has been saved.",
          duration: 5000,
        });

        if (slug) {
          updateState({ isLoadingData: true, dataLoaded: false });
          const result = await refetch();
          if (result.data?.data) {
            console.log("Refetched data:", result.data.data);
            processHeroesData(result.data.data);
          } else {
            updateState({ isLoadingData: false });
            toast({
              title: "Warning",
              description: "Failed to reload data after save.",
              variant: "destructive",
            });
          }
        } else {
          updateState({ hasUnsavedChanges: false, isLoadingData: false });
        }
      } catch (error) {
        console.error("Save operation failed:", error);
        toast({
          title: state.existingSubSectionId ? "Error updating heroes section" : "Error creating heroes section",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        updateState({ isSaving: false });
      }
    }, [
      form,
      validateFormHeroCounts,
      state.existingSubSectionId,
      ParentSectionId,
      slug,
      state.contentElements,
      activeLanguages,
      languageIds,
      createSubSection,
      createContentElement,
      deleteContentElement,
      bulkUpsertTranslations,
      heroImages,
      toast,
      refetch,
      processHeroesData,
      updateState,
    ]);

    createFormRef(ref, {
      form,
      hasUnsavedChanges: state.hasUnsavedChanges,
      setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
      existingSubSectionId: state.existingSubSectionId,
      contentElements: state.contentElements,
      componentName: "Heroes",
      extraMethods: {
        getHeroImages: () => heroImages,
      },
    });

    const languageCodes = createLanguageCodeMap(activeLanguages);

    useEffect(() => {
      const subscription = form.watch(() => {
        if (state.dataLoaded && !state.isLoadingData) {
          validateFormHeroCounts();
        }
      });
      return () => subscription.unsubscribe();
    }, [state.dataLoaded, state.isLoadingData, form, validateFormHeroCounts]);

    if (slug && ( isLoadingSubsection) && !state.dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading heroes section data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <LoadingDialog
          isOpen={state.isSaving}
          title={state.existingSubSectionId ? "Updating Heroes" : "Creating Heroes"}
          description="Please wait while we save your changes..."
        />

        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {languageIds.map((langId: Key | null | undefined, langIndex: number) => {
              const langCode = String(langId) in languageCodes ? languageCodes[String(langId)] : String(langId);
              const isFirstLanguage = langIndex === 0;

              return (
                <LanguageCard
                  key={langId}
                  langCode={langCode}
                  isFirstLanguage={isFirstLanguage}
                  form={form}
                  addHero={addHero}
                  removeHero={confirmDeleteStep}
                  onDeleteStep={confirmDeleteStep}
                  HeroImageUploader={HeroImageUploader}
                />
              );
            })}
          </div>
        </Form>

        <div className="flex justify-end mt-6">
          {state.heroCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Each language must have the same number of heroes</span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={ state.heroCountMismatch || state.isSaving}
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
                {state.existingSubSectionId ? "Update Heroes" : "Save Heroes"}
              </>
            )}
          </Button>
        </div>

        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={stepToDelete ? `Hero ${stepToDelete.index + 1}` : ""}
          onConfirm={removeProcessStep}
          isDeleting={isDeleting}
          title="Delete Hero"
          confirmText="Delete Hero"
        />

        <ValidationDialog
          isOpen={state.isValidationDialogOpen}
          onOpenChange={(isOpen: boolean) => updateState({ isValidationDialogOpen: isOpen })}
          heroCounts={getSubSectionCountsByLanguage(form.getValues())}
        />
      </div>
    );
  }
);

HeroesForm.displayName = "HeroesForm";
export default HeroesForm;