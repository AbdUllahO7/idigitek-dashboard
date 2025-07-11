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
import { useTranslation } from "react-i18next";
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
import { useLanguage } from "@/src/context/LanguageContext";

interface FormData {
  [key: string]: Array<{
    title: string;
    description: string;

    exploreButton: string;
    exploreButtonType: string,
    exploreButtonUrl: string,
    image: string;
    id?: string;
  }>;
}

const HeroesForm = forwardRef<HeroFormRef, HeroFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { websiteId } = useWebsiteContext();
    const { t } = useTranslation();
    const formSchema = createHeroSectionSchema(languageIds, activeLanguages);
    const defaultValues = createHeroSectionDefaultValues(languageIds, activeLanguages);
    const {language} = useLanguage()

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

    // Fix: Set primary language code instead of ID
    useEffect(() => {
      if (languageIds.length > 0) {
        const primaryLangCode = activeLanguages.find(lang => lang._id === languageIds[0])?.languageID || languageIds[0];
        primaryLanguageRef.current = primaryLangCode;
      }
    }, [languageIds, activeLanguages]);

    // Track if we're currently syncing to prevent infinite loops
    const isSyncing = useRef(false);

    // URL Field Syncing Effect - sync from primary language to others
    useEffect(() => {
      if (!primaryLanguageRef.current) return;
      
      const subscription = form.watch((value, { name }) => {
        // Prevent infinite loops
        if (isSyncing.current) return;
        
        // Only sync URL-related fields from primary language to other languages
        if (name && name.startsWith(primaryLanguageRef.current)) {
          const isUrlField = name.includes('exploreButtonType') || 
                            name.includes('exploreButtonUrl')
          
          if (isUrlField) {
            // Extract the field name and index
            const matches = name.match(new RegExp(`${primaryLanguageRef.current}\\.(\\d+)\\.(.*)`));
            if (matches) {
              const [, index, fieldName] = matches;
              const newValue = value[primaryLanguageRef.current]?.[parseInt(index)]?.[fieldName];
              
              // Set syncing flag to prevent recursive calls
              isSyncing.current = true;
              
              // Update all other languages with the same URL setting
              try {
                Object.keys(form.getValues()).forEach((langCode) => {
                  if (langCode !== primaryLanguageRef.current) {
                    form.setValue(`${langCode}.${index}.${fieldName}`, newValue, {
                      shouldDirty: false,
                      shouldValidate: false, // Prevent validation during sync
                    });
                  }
                });
              } finally {
                // Reset syncing flag after a brief delay
                setTimeout(() => {
                  isSyncing.current = false;
                }, 10);
              }
            }
          }
        }
      });

      return () => subscription.unsubscribe();
    }, [form]);

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
          title: t("heroesForm.cannotRemove"),
          description: t("heroesForm.needAtLeastOneHero"),
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
              title: t("heroesForm.heroDeleted"),
              description: t("heroesForm.heroDeletedFromDatabase", { heroNumber }),
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
                const newOrder = element.order - 9; // Updated for 9 fields (including URL fields)

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
          title: t("heroesForm.heroRemoved"),
          description: t("heroesForm.heroRemovedSuccessfully"),
        });

        validateFormHeroCounts();
        updateState({ hasUnsavedChanges: true });
      } catch (error) {
        console.error(t("heroesForm.errorRemovingHeroConsole"), error);
        toast({
          title: t("heroesForm.errorRemoving"),
          description: t("heroesForm.errorRemovingHero"),
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
      t,
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
  console.log("All elements to group:", elements);
  const heroGroups: { [key: number]: ContentElement[] } = {};
  
  elements.forEach((element: any) => {
    console.log("Processing element:", element.name, element.type);
    
    // Handle both "Hero X" and "section X" patterns
    const heroMatch = element.name.match(/Hero (\d+)/i);
    const sectionMatch = element.name.match(/section (\d+)/i);
    
    let heroNumber = null;
    
    if (heroMatch) {
      heroNumber = parseInt(heroMatch[1], 10);
      console.log("Found Hero pattern:", heroNumber, element.name);
    } else if (sectionMatch) {
      heroNumber = parseInt(sectionMatch[1], 10);
      console.log("Found section pattern:", heroNumber, element.name);
    } else {
      console.log("Element doesn't match hero or section pattern:", element.name);
    }
    
    if (heroNumber) {
      if (!heroGroups[heroNumber]) {
        heroGroups[heroNumber] = [];
      }
      heroGroups[heroNumber].push(element);
    }
  });
  
  console.log("Final hero groups:", heroGroups);
  return heroGroups;
},
         processElementGroup: (
  heroNumber,
  elements,
  langId,
  getTranslationContent
) => {
  console.log(`Processing group for hero ${heroNumber}, language ${langId}`);
  console.log("Elements in group:", elements.map(el => ({ name: el.name, type: el.type })));
  
  // Updated element finding logic to handle both old and new naming patterns
  const findElement = (patterns: string[]) => {
    return elements.find((el) => 
      patterns.some(pattern => el.name.toLowerCase().includes(pattern.toLowerCase()))
    );
  };

  // Handle both "section X - Title" and "Hero X Title" patterns
  const titleElement = findElement(["title"]);
  const descriptionElement = findElement(["description"]);
  const exploreButtonElement = findElement(["explorebutton"]) && !findElement(["explorebuttontype", "explorebuttonurl"]) 
    ? findElement(["explorebutton"]) 
    : elements.find((el) => 
        el.name.toLowerCase().includes("explorebutton") && 
        !el.name.toLowerCase().includes("type") && 
        !el.name.toLowerCase().includes("url")
      );
  
  const exploreButtonTypeElement = findElement(["explorebuttontype", "explorebutton"]) && 
    elements.find((el) => el.name.toLowerCase().includes("type"));
  
  const exploreButtonUrlElement = findElement(["explorebuttonurl", "explorebutton"]) && 
    elements.find((el) => el.name.toLowerCase().includes("url"));
  

  


  const imageElement = elements.find((el) => 
    el.name.toLowerCase().includes("image") && el.type === "image"
  );

  console.log("Found elements:", {
    title: titleElement?.name,
    description: descriptionElement?.name,
    exploreButton: exploreButtonElement?.name,
    exploreButtonType: exploreButtonTypeElement?.name,
    exploreButtonUrl: exploreButtonUrlElement?.name,
    image: imageElement?.name
  });

  // For URL fields, use primary language values for all languages
  const primaryLangId = activeLanguages[0]?._id;
  const useTranslationContent = (element: ContentElement | undefined, fallback: string, forceUsePrimaryLang = false) => {
    if (!element) {
      console.log("No element found, using fallback:", fallback);
      return fallback;
    }
    
    console.log("Element translations:", element.translations);
    
    if (forceUsePrimaryLang && langId !== primaryLangId) {
      // Find translation for primary language
      const primaryTranslation = element.translations?.find((t: any) => t.language._id === primaryLangId);
      console.log("Primary language translation:", primaryTranslation);
      return primaryTranslation?.content || fallback;
    }
    const content = getTranslationContent(element, fallback);
    console.log("Final content:", content);
    return content;
  };

  const result = {
    id: `hero-${heroNumber}`,
    title: useTranslationContent(titleElement, ""),
    description: useTranslationContent(descriptionElement, ""),
    exploreButton: useTranslationContent(exploreButtonElement, ""),
    exploreButtonType: useTranslationContent(exploreButtonTypeElement, t("heroesForm.defaultButtonType"), true),
    exploreButtonUrl: useTranslationContent(exploreButtonUrlElement, "", true),
    image: imageElement?.imageUrl || "",
  };
  
  console.log(`Final processed hero ${heroNumber} for language ${langId}:`, result);
  return result;
},
              getDefaultValue: () => [
                {
                  id: "hero-1",
                  title: "",
                  description: "",
                  exploreButton: "",
                  exploreButtonType: t("heroesForm.defaultButtonType"),
                  exploreButtonUrl: "",
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
        } catch (error) {
          console.error(t("heroesForm.errorProcessingHeroData"), error);
          toast({
            title: t("heroesForm.errorLoadingData"),
            description: t("heroesForm.failedToLoadHeroData"),
            variant: "destructive",
          });
        } finally {
          updateState({ isLoadingData: false });
        }
      },
      [form, languageIds, activeLanguages, updateState, validateFormHeroCounts, toast, t]
    );

    useEffect(() => {
      if (!slug || state.dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }
      processHeroesData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, state.dataLoaded, slug, processHeroesData, t]);

    // Combined form watch effect - handles all form changes
    useEffect(() => {
      if (state.isLoadingData || !state.dataLoaded) return;

      const subscription = form.watch((value) => {
        // Skip if we're currently syncing URL fields
        if (isSyncing.current) return;
        
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
          exploreButtonType: t("heroesForm.defaultButtonType"),
          exploreButtonUrl: "",
          image: "",
        };

        Object.keys(form.getValues()).forEach((lang) => {
          const currentHeroes = form.getValues()[lang] || [];
          
          // For non-primary languages, sync URL settings from primary language if adding to existing index
          if (lang !== primaryLanguageRef.current && currentHeroes.length > 0) {
            const primaryHeroes = form.getValues()[primaryLanguageRef.current] || [];
            const heroIndex = currentHeroes.length; // This will be the index of the new hero
            
            if (primaryHeroes[heroIndex]) {
              newHero.exploreButtonType = primaryHeroes[heroIndex].exploreButtonType || t("heroesForm.defaultButtonType");
              newHero.exploreButtonUrl = primaryHeroes[heroIndex].exploreButtonUrl || "";
            }
          }
          
          form.setValue(lang, [...currentHeroes, newHero], {
            shouldDirty: true,
            shouldValidate: true,
          });
        });

        validateFormHeroCounts();
        updateState({ hasUnsavedChanges: true });
        toast({
          title: t("heroesForm.heroAdded"),
          description: t("heroesForm.heroAddedDescription"),
        });
      },
      [form, validateFormHeroCounts, updateState, toast, primaryLanguageRef, t]
    );

    const confirmDeleteStep = useCallback((langCode: string, index: number) => {
      const currentHeroes = form.getValues()[langCode] || [];
      if (currentHeroes.length <= 1) {
        toast({
          title: t("heroesForm.cannotRemove"),
          description: t("heroesForm.needAtLeastOneHero"),
          variant: "destructive",
        });
        return;
      }
      setStepToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    }, [form, toast, t]);

    const handleSave = useCallback(async () => {
      const isValid = await form.trigger();
      const hasEqualHeroCounts = validateFormHeroCounts();

      if (!hasEqualHeroCounts) {
        updateState({ isValidationDialogOpen: true });
        toast({
          title: t("heroesForm.validationError"),
          description: t("heroesForm.allLanguagesSameCount"),
          variant: "destructive",
        });
        return;
      }

      if (!isValid) {
        toast({
          title: t("heroesForm.validationError"),
          description: t("heroesForm.fillAllRequiredFields"),
          variant: "destructive",
        });
        return;
      }

      updateState({ isSaving: true });

      try {
        const allFormValues = form.getValues();
        let sectionId = state.existingSubSectionId;

        if (!sectionId) {
          if (!ParentSectionId) {
            throw new Error(t("heroesForm.parentSectionRequired"));
          }

          const subsectionData = {
            name: t("heroesForm.sectionName"),
            slug: slug || `heroes-section-${Date.now()}`,
            description: t("heroesForm.sectionDescription"),
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
          throw new Error(t("heroesForm.failedToCreateSubsection"));
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
            title: t("heroesForm.heroTitle", { heroIndex }),
            description: t("heroesForm.heroDescription", { heroIndex }),
            exploreButton: t("heroesForm.heroExploreButton", { heroIndex }),
            exploreButtonType: t("heroesForm.heroExploreButtonType", { heroIndex }),
            exploreButtonUrl: t("heroesForm.heroExploreButtonUrl", { heroIndex }),
            image: t("heroesForm.heroImage", { heroIndex }),
          };

          const elements: Record<string, ContentElement | null> = {
            title: state.contentElements.find((el) => el.name === elementNames.title) ?? null,
            description: state.contentElements.find((el) => el.name === elementNames.description) ?? null,
            exploreButton: state.contentElements.find((el) => el.name === elementNames.exploreButton) ?? null,
            exploreButtonType: state.contentElements.find((el) => el.name === elementNames.exploreButtonType) ?? null,
            exploreButtonUrl: state.contentElements.find((el) => el.name === elementNames.exploreButtonUrl) ?? null,
            image: state.contentElements.find((el) => el.name === elementNames.image && el.type === "image") ?? null,
          };

          const elementTypes = [
            { type: "text", key: "title", name: elementNames.title },
            { type: "text", key: "description", name: elementNames.description },
            { type: "text", key: "exploreButton", name: elementNames.exploreButton },
            { type: "text", key: "exploreButtonType", name: elementNames.exploreButtonType },
            { type: "text", key: "exploreButtonUrl", name: elementNames.exploreButtonUrl },
            { type: "image", key: "image", name: elementNames.image },
          ];

          for (const { type, key, name } of elementTypes) {
            if (!elements[key]) {
              const newElement = await createContentElement.mutateAsync({
                name,
                type,
                parent: sectionId,
                isActive: true,
                order: i * 9 + elementTypes.findIndex((t) => t.key === key), // Updated for 9 fields
                defaultContent: type === "image" ? t("heroesForm.imagePlaceholder") : "",
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
            
            // Standard text fields for all languages
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
           

            // URL fields - only save from primary language to avoid duplicates
            const primaryLangCode = activeLanguages[0]?.languageID;
            if (langCode === primaryLangCode) {
              if (elements.exploreButtonType) {
                const exploreButtonTypeContent = hero.exploreButtonType || t("heroesForm.defaultButtonType");
                translations.push({
                  _id: "",
                  content: exploreButtonTypeContent,
                  language: langId,
                  contentElement: elements.exploreButtonType._id,
                  isActive: true,
                });
              }
              
              // Only create translation if URL is not empty
              if (elements.exploreButtonUrl && hero.exploreButtonUrl && hero.exploreButtonUrl.trim() !== "") {
                translations.push({
                  _id: "",
                  content: hero.exploreButtonUrl.trim(),
                  language: langId,
                  contentElement: elements.exploreButtonUrl._id,
                  isActive: true,
                });
              }
              
         
              
              // Only create translation if URL is not empty
            
            }
          });

          const imageFile = heroImages[i];
          if (imageFile && elements.image) {
            try {
              const formData = new FormData();
              formData.append("image", imageFile);
              const uploadResult = await apiClient.post(`/content-elements/${elements.image._id}/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });

              if (uploadResult.data?.imageUrl) {
                Object.entries(allFormValues).forEach(([langCode]) => {
                  if (allFormValues[langCode] && allFormValues[langCode][i]) {
                    form.setValue(`${langCode}.${i}.image`, uploadResult.data.imageUrl, { shouldDirty: true });
                  }
                });
              } 
            } catch (uploadError) {
              console.error(t("heroesForm.imageUploadError"), i, uploadError);
              toast({
                title: t("heroesForm.imageUploadError"),
                description: t("heroesForm.failedToUploadImage", { heroIndex }),
                variant: "destructive",
              });
            }
          } else if (!imageFile && elements.image) {
          } else if (!elements.image) {
            console.error(t("heroesForm.imageElementNotFound", { heroIndex }));
            toast({
              title: t("heroesForm.configurationError"),
              description: t("heroesForm.imageMissingForHero", { heroIndex }),
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

        toast({
          title: state.existingSubSectionId ? t("heroesForm.heroesUpdatedSuccessfully") : t("heroesForm.heroesCreatedSuccessfully"),
          description: t("heroesForm.allContentSaved"),
          duration: 5000,
        });

        if (slug) {
          updateState({ isLoadingData: true, dataLoaded: false });
          const result = await refetch();
          if (result.data?.data) {
            processHeroesData(result.data.data);
          } else {
            updateState({ isLoadingData: false });
            toast({
              title: t("heroesForm.warning"),
              description: t("heroesForm.failedToReloadData"),
              variant: "destructive",
            });
          }
        } else {
          updateState({ hasUnsavedChanges: false, isLoadingData: false });
        }
      } catch (error) {
        console.error(t("heroesForm.saveOperationFailed"), error);
        toast({
          title: state.existingSubSectionId ? t("heroesForm.errorUpdatingHeroes") : t("heroesForm.errorCreatingHeroes"),
          description: error instanceof Error ? error.message : t("heroesForm.unknownError"),
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
      t,
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

    if (slug && ( isLoadingSubsection) && !state.dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">{t("heroesForm.loadingHeroData")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <LoadingDialog
          isOpen={state.isSaving}
          title={state.existingSubSectionId ? t("heroesForm.updatingHeroes") : t("heroesForm.creatingHeroes")}
          description={t("heroesForm.saveDescription")}
        />

        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
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
              <span className="text-sm">{t("heroesForm.samNumberOfHeroes")}</span>
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
                {t("heroesForm.saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {state.existingSubSectionId ? t("heroesForm.updateHeroes") : t("heroesForm.saveHeroes")}
              </>
            )}
          </Button>
        </div>

        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={stepToDelete ? t("heroesForm.deleteHeroService", { index: stepToDelete.index + 1 }) : ""}
          onConfirm={removeProcessStep}
          isDeleting={isDeleting}
          title={t("heroesForm.deleteHero")}
          confirmText={t("heroesForm.deleteHeroConfirm")}
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