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
import { LanguageCard, LanguageTabs } from "./HeroLanguageCard";
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
    
    // Add this ref to prevent multiple simultaneous sync operations
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Fix: Set primary language code correctly
    useEffect(() => {
      if (languageIds.length > 0 && activeLanguages.length > 0) {
        const primaryLang = activeLanguages.find(lang => lang._id === languageIds[0]);
        const primaryLangCode = primaryLang?.languageID || languageIds[0];
        primaryLanguageRef.current = primaryLangCode;
        console.log("Primary language set to:", primaryLangCode);
      }
    }, [languageIds, activeLanguages]);

    // Track if we're currently syncing to prevent infinite loops
    const isSyncing = useRef(false);

    // FIXED: Improved URL Field Syncing Effect with debouncing
    useEffect(() => {
      if (!primaryLanguageRef.current) return;
      
      const subscription = form.watch((value, { name }) => {
        // Prevent infinite loops and only sync URL fields from primary language
        if (isSyncing.current || !name || !name.startsWith(primaryLanguageRef.current!)) {
          return;
        }
        
        // Only sync URL-related fields
        const isUrlField = name.includes('exploreButtonType') || name.includes('exploreButtonUrl');
        
        if (isUrlField) {
          // Clear any existing timeout
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
          }
          
          // Debounce the sync operation
          syncTimeoutRef.current = setTimeout(() => {
            const matches = name.match(new RegExp(`${primaryLanguageRef.current}\\.(\\d+)\\.(.*)`));
            if (matches) {
              const [, index, fieldName] = matches;
              const newValue = value[primaryLanguageRef.current!]?.[parseInt(index)]?.[fieldName];
              
              console.log(`Syncing ${fieldName} from primary language:`, newValue);
              
              // Set syncing flag
              isSyncing.current = true;
              
              try {
                // Update all other languages with the same URL setting
                Object.keys(form.getValues()).forEach((langCode) => {
                  if (langCode !== primaryLanguageRef.current) {
                    form.setValue(`${langCode}.${index}.${fieldName}`, newValue, {
                      shouldDirty: false,
                      shouldValidate: false,
                    });
                  }
                });
              } catch (error) {
                console.error("Error during sync:", error);
              } finally {
                // Reset syncing flag
                setTimeout(() => {
                  isSyncing.current = false;
                }, 50);
              }
            }
          }, 100); // 100ms debounce
        }
      });

      return () => {
        subscription.unsubscribe();
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
      };
    }, [form, primaryLanguageRef.current]);

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
                const newOrder = element.order - 6; // 6 fields per hero: title, description, exploreButton, exploreButtonType, exploreButtonUrl, image

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
                  
                  // Handle multiple naming patterns including new "section" format
                  const sectionNewMatch = element.name.match(/section (\d+) - /i);
                  const heroMatch = element.name.match(/Hero (\d+)/i);
                  const sectionMatch = element.name.match(/section (\d+)/i);
                  
                  // Legacy Arabic patterns (for backward compatibility)
                  const arabicMainPanelMatch = element.name.match(/اللوح الرئيسي (\d+)/i);
                  const mainPanelMatch = element.name.match(/Main Panel (\d+)/i);
                  const heroArabicMatch = element.name.match(/البطل (\d+)/i);
                  
                  let heroNumber = null;
                  
                  if (sectionNewMatch) {
                    heroNumber = parseInt(sectionNewMatch[1], 10);
                    console.log("Found new section pattern:", heroNumber, element.name);
                  } else if (heroMatch) {
                    heroNumber = parseInt(heroMatch[1], 10);
                    console.log("Found Hero pattern:", heroNumber, element.name);
                  } else if (sectionMatch) {
                    heroNumber = parseInt(sectionMatch[1], 10);
                    console.log("Found section pattern:", heroNumber, element.name);
                  } else if (arabicMainPanelMatch) {
                    heroNumber = parseInt(arabicMainPanelMatch[1], 10);
                    console.log("Found Arabic Main Panel pattern (legacy):", heroNumber, element.name);
                  } else if (mainPanelMatch) {
                    heroNumber = parseInt(mainPanelMatch[1], 10);
                    console.log("Found Main Panel pattern (legacy):", heroNumber, element.name);
                  } else if (heroArabicMatch) {
                    heroNumber = parseInt(heroArabicMatch[1], 10);
                    console.log("Found Arabic Hero pattern (legacy):", heroNumber, element.name);
                  } else {
                    console.log("Element doesn't match any hero pattern:", element.name);
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
                
                // Enhanced element finding logic to prioritize new "section X - FieldName" format
                const findElement = (newPatterns: string[], legacyPatterns: string[] = []) => {
                  // First try to find by new "section X - FieldName" patterns
                  const newElement = elements.find((el) => 
                    newPatterns.some(pattern => el.name.toLowerCase().includes(pattern.toLowerCase()))
                  );
                  
                  if (newElement) return newElement;
                  
                  // Fallback to legacy patterns for backward compatibility
                  return elements.find((el) => 
                    legacyPatterns.some(pattern => el.name.toLowerCase().includes(pattern.toLowerCase()))
                  );
                };

                // Find elements using new "section X - FieldName" format first, then legacy names
                const titleElement = findElement(
                  [`section ${heroNumber} - title`], 
                  ["hero", "title", "العنوان", "عنوان"]
                );
                
                const descriptionElement = findElement(
                  [`section ${heroNumber} - description`], 
                  ["hero", "description", "الوصف", "وصف"]
                );
                
                const exploreButtonElement = findElement(
                  [`section ${heroNumber} - explorebutton`],
                  ["explore button", "explorebutton", "زر الاستكشاف"]
                );
                
                const exploreButtonTypeElement = findElement(
                  [`section ${heroNumber} - explorebuttontype`],
                  ["explore button", "type", "explorebutton", "زر الاستكشاف", "نوع"]
                );
                
                const exploreButtonUrlElement = findElement(
                  [`section ${heroNumber} - explorebuttonurl`],
                  ["explore button", "url", "explorebutton", "زر الاستكشاف", "رابط"]
                );

                const imageElement = elements.find((el) => {
                  const name = el.name.toLowerCase();
                  const isImageType = el.type === "image";
                  
                  // New "section X - Image" pattern has highest priority
                  const isNewSectionPattern = name.includes(`section ${heroNumber} - image`);
                  
                  // Legacy patterns
                  const hasImageName = name.includes("image") || name.includes("الصورة") || name.includes("صورة");
                  
                  return isImageType && (isNewSectionPattern || hasImageName);
                });

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
                  exploreButtonType: useTranslationContent(exploreButtonTypeElement, "default", true),
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
                  exploreButtonType: "default",
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

    // FIXED: Simplified form watch effect
    useEffect(() => {
      if (state.isLoadingData || !state.dataLoaded || isSyncing.current) return;

      const subscription = form.watch((value) => {
        // Only update state if we're not in the middle of a sync operation
        if (!isSyncing.current) {
          updateState({ hasUnsavedChanges: true });
          validateFormHeroCounts();
          
          if (onDataChangeRef.current) {
            onDataChangeRef.current(value as FormData);
          }
        }
      });

      return () => subscription.unsubscribe();
    }, [form, state.isLoadingData, state.dataLoaded, validateFormHeroCounts, updateState]);

    const addHero = useCallback(
      (langCode: string) => {
        const newHeroId = `hero-${Date.now()}`;
        const primaryLanguageCode = primaryLanguageRef.current;
        
        // Get current primary language settings for URL fields
        const primaryHeroes = primaryLanguageCode ? form.getValues()[primaryLanguageCode] || [] : [];
        
        const newHero = {
          id: newHeroId,
          title: "",
          description: "",
          exploreButton: "",
          exploreButtonType: "default",
          exploreButtonUrl: "",
          image: "",
        };

        Object.keys(form.getValues()).forEach((lang) => {
          const currentHeroes = form.getValues()[lang] || [];
          const heroIndex = currentHeroes.length; // This will be the index of the new hero
          
          // For non-primary languages, sync URL settings from primary language
          if (lang !== primaryLanguageCode && primaryHeroes[heroIndex]) {
            newHero.exploreButtonType = primaryHeroes[heroIndex].exploreButtonType || "default";
            newHero.exploreButtonUrl = primaryHeroes[heroIndex].exploreButtonUrl || "";
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
      [form, validateFormHeroCounts, updateState, toast, t]
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
      // FIXED: Reset syncing flag before validation
      isSyncing.current = false;
      
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
          // Use "section" naming convention to match field mappings
          const elementNames = {
            title: `section ${heroIndex} - Title`,
            description: `section ${heroIndex} - Description`,
            exploreButton: `section ${heroIndex} - ExploreButton`,
            exploreButtonType: `section ${heroIndex} - ExploreButtonType`,
            exploreButtonUrl: `section ${heroIndex} - ExploreButtonUrl`,
            image: `section ${heroIndex} - Image`,
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
                order: i * 6 + elementTypes.findIndex((t) => t.key === key), // 6 fields per hero
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

            // URL fields - save for all languages (they should be synced)
            if (elements.exploreButtonType) {
              translations.push({
                _id: "",
                content: hero.exploreButtonType || "default",
                language: langId,
                contentElement: elements.exploreButtonType._id,
                isActive: true,
              });
            }
            
            if (elements.exploreButtonUrl) {
              translations.push({
                _id: "",
                content: hero.exploreButtonUrl || "",
                language: langId,
                contentElement: elements.exploreButtonUrl._id,
                isActive: true,
              });
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
                    form.setValue(`${langCode}.${i}.image`, uploadResult.data.imageUrl, { shouldDirty: false });
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

        // FIXED: Improved data reloading after save
        if (slug) {
          updateState({ hasUnsavedChanges: false });
          // Wait a bit before reloading to ensure data is saved
          setTimeout(async () => {
            updateState({ isLoadingData: true, dataLoaded: false });
            try {
              const result = await refetch();
              if (result.data?.data) {
                processHeroesData(result.data.data);
              } else {
                updateState({ isLoadingData: false, dataLoaded: true });
                toast({
                  title: t("heroesForm.warning"),
                  description: t("heroesForm.failedToReloadData"),
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Error reloading data:", error);
              updateState({ isLoadingData: false, dataLoaded: true });
            }
          }, 1000);
        } else {
          updateState({ hasUnsavedChanges: false });
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
      state.contentElements,
      ParentSectionId,
      slug,
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

    if (slug && isLoadingSubsection && !state.dataLoaded) {
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
          <LanguageTabs
            languageCards={languageIds.map((langId: Key | null | undefined, langIndex: number) => {
              const langCode = String(langId) in languageCodes ? languageCodes[String(langId)] : String(langId);
              const isFirstLanguage = langIndex === 0;

              return {
                langCode,
                isFirstLanguage,
                form,
                addHero,
                removeHero: confirmDeleteStep,
                onDeleteStep: confirmDeleteStep,
                HeroImageUploader,
              };
            })}
          />
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
            disabled={state.heroCountMismatch || state.isSaving}
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