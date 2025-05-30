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
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import apiClient from "@/src/lib/api-client";
import { createFooterSectionSchema, createFooterSpecialLinkSectionSchema } from "../../../services/addService/Utils/language-specific-schemas";
import { createFooterSectionDefaultValues, createFooterSpecialLinkSectionDefaultValues, createLanguageCodeMap } from "../../../services/addService/Utils/Language-default-values";
import { createFormRef, getSubSectionCountsByLanguage, useForceUpdate, validateSubSectionCounts } from "../../../services/addService/Utils/Expose-form-data";
import { processAndLoadData } from "../../../services/addService/Utils/load-form-data";
import { FooterLanguageCard } from "./FooterLanguageCard";
import { FooteresFormState, FooterFormProps } from "@/src/api/types/sections/footer/footerSection.type";
import { StepToDelete } from "@/src/api/types/sections/service/serviceSections.types";
import { useHeroImages } from "../utils/FooterImageUploader";

// Updated interface to reflect new field structure
interface FormData {
  [key: string]: Array<{
    title: string; // Changed from description to title
    socialLinks: Array<{
      id: any;
      image: string;
      url: string;
      linkName: string; // Added linkName field
    }>;
    id?: string;
  }>;
}

const SpecialFormBasicForm = forwardRef<any, FooterFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { websiteId } = useWebsiteContext();
    const formSchema = createFooterSpecialLinkSectionSchema(languageIds, activeLanguages);
    const defaultValues = createFooterSpecialLinkSectionDefaultValues(languageIds, activeLanguages);

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
      mode: "onChange",
    });

    const [state, setState] = useState<FooteresFormState>({
      isLoadingData: !!slug,
      dataLoaded: !slug,
      hasUnsavedChanges: false,
      isValidationDialogOpen: false,
      footerCountMismatch: false,
      existingSubSectionId: null,
      contentElements: [],
      isSaving: false,
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [stepToDelete, setStepToDelete] = useState<StepToDelete | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isUrlSyncing, setIsUrlSyncing] = useState<boolean>(false);

    const updateState = useCallback(
      (newState: Partial<FooteresFormState>) => {
        setState((prev) => ({ ...prev, ...newState }));
      },
      []
    );

    const { toast } = useToast();
    const forceUpdate = useForceUpdate();
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

    const { heroImages, socialLinkImages, handleHeroImageRemove, updateHeroImageIndices, HeroImageUploader, SocialLinkImageUploader } = useHeroImages(form);

    useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    useEffect(() => {
      if (languageIds.length > 0) {
        primaryLanguageRef.current = languageIds[0];
      }
    }, [languageIds]);

    // Updated function to sync both URLs and link names across all languages
      const syncSocialLinkData = useCallback((changedPath: string, newValue: string) => {
          if (isUrlSyncing) return;
          
          // Only sync URLs, not linkNames
          const urlMatch = changedPath.match(/^([^.]+)\.(\d+)\.socialLinks\.(\d+)\.url$/);
          if (!urlMatch) return; // Don't sync linkName changes

          const [, changedLangCode, footerIndex, socialLinkIndex] = urlMatch;
          
          setIsUrlSyncing(true);
          
          const allValues = form.getValues();
          
          // Update the URL in all other languages (but keep their own linkNames)
          Object.keys(allValues).forEach((langCode) => {
              if (langCode !== changedLangCode && allValues[langCode] && allValues[langCode][parseInt(footerIndex)]) {
                  const currentFooter = allValues[langCode][parseInt(footerIndex)];
                  if (currentFooter.socialLinks && currentFooter.socialLinks[parseInt(socialLinkIndex)]) {
                      form.setValue(
                          `${langCode}.${footerIndex}.socialLinks.${socialLinkIndex}.url`,
                          newValue,
                          { shouldDirty: true, shouldValidate: true }
                      );
                      // Note: We're NOT syncing linkName anymore
                  }
              }
          });
          
          setIsUrlSyncing(false);
      }, [form, isUrlSyncing]);

    const validateFormFooterCounts = useCallback(() => {
      const values = form.getValues();
      const isValid = validateSubSectionCounts(values);
      updateState({ footerCountMismatch: !isValid });
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
          description: "You need at least one footer",
          variant: "destructive",
        });
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }

      try {
        if (state.existingSubSectionId && state.contentElements.length > 0) {
          const footerNumber = index + 1;
          const footerElements = state.contentElements.filter((element) => {
            const match = element.name.match(/Footer (\d+)/i);
            return match && Number.parseInt(match[1]) === footerNumber;
          });

          if (footerElements.length > 0) {
            await Promise.all(
              footerElements.map((element) => deleteContentElement.mutateAsync(element._id))
            );

            updateState({
              contentElements: state.contentElements.filter((element) => {
                const match = element.name.match(/Footer (\d+)/i);
                return !(match && Number.parseInt(match[1]) === footerNumber);
              }),
            });

            toast({
              title: "Footer deleted",
              description: `Footer ${footerNumber} has been deleted from the database`,
            });
          }

          const remainingElements = state.contentElements.filter((element) => {
            const match = element.name.match(/Footer (\d+)/i);
            return match && Number.parseInt(match[1]) > footerNumber;
          });

          await Promise.all(
            remainingElements.map(async (element) => {
              const match = element.name.match(/Footer (\d+)/i);
              if (match) {
                const oldNumber = Number.parseInt(match[1]);
                const newNumber = oldNumber - 1;
                const newName = element.name.replace(`Footer ${oldNumber}`, `Footer ${newNumber}`);
                const newOrder = element.order - (5 + (currentSteps[index].socialLinks?.length || 0) * 3); // Updated to account for linkName field
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
          title: "Footer removed",
          description: "The footer has been removed successfully.",
        });

        validateFormFooterCounts();
        updateState({ hasUnsavedChanges: true });
      } catch (error) {
        console.error("Error removing footer:", error);
        toast({
          title: "Error",
          description: "There was an error removing the footer.",
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
      validateFormFooterCounts,
      updateState,
    ]);

   const processFooteresData = useCallback(
  (subsectionData: SubSection) => {
    updateState({ isLoadingData: true });
    try {
      const footerGroups = processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          groupElements: (elements) => {
            const footerGroups: { [key: number]: ContentElement[] } = {};
            elements.forEach((element: any) => {
              const footerMatch = element.name.match(/Footer (\d+)/i);
              if (footerMatch) {
                const footerNumber = parseInt(footerMatch[1], 10);
                if (!footerGroups[footerNumber]) {
                  footerGroups[footerNumber] = [];
                }
                footerGroups[footerNumber].push(element);
              }
            });
            return footerGroups;
          },
          processElementGroup: (
          footerNumber,
          elements,
          langId,
          getTranslationContent
          ) => {
            // Updated to look for Title instead of Description
              const titleElement = elements.find((el) => el.name.includes("Title"));
              const socialLinkElements = elements.filter((el) => el.name.match(/Footer \d+ - SocialLink \d+/i));
         const socialLinks = socialLinkElements.reduce((acc, el) => {
        const match = el.name.match(/Footer \d+ - SocialLink (\d+)/i);
        if (match) {
            const socialLinkIndex = parseInt(match[1], 10) - 1;
            const isImage = el.type === "image";
            const isUrl = el.name.includes("Url");
            const isLinkName = el.name.includes("LinkName");
            if (!acc[socialLinkIndex]) acc[socialLinkIndex] = { image: "", url: "", linkName: "" };
            if (isImage) acc[socialLinkIndex].image = el.imageUrl || "";
            if (isUrl) acc[socialLinkIndex].url = getTranslationContent(el, "");
            if (isLinkName) acc[socialLinkIndex].linkName = getTranslationContent(el, ""); // This will be different per language
        }
        return acc;
    }, [] as { image: string; url: string; linkName: string }[]);
    return {
        id: `footer-${footerNumber}`,
        title: getTranslationContent(titleElement, ""),
        socialLinks,
    };
          },
          getDefaultValue: () => [
            {
              id: "footer-1",
              title: "", // Changed from description to title
              socialLinks: [],
            },
          ],
        },
        {
          setExistingSubSectionId: (id) => updateState({ existingSubSectionId: id }),
          setContentElements: (elements) => updateState({ contentElements: elements }),
          setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
          setHasUnsavedChanges: (hasChanges) => updateState({ hasUnsavedChanges: hasChanges }),
          setIsLoadingData: (loading) => updateState({ isLoadingData: loading }),
          validateCounts: validateFormFooterCounts,
        }
      );

      // Normalize footer counts across languages and sync social link data
      const allFormValues = form.getValues();
      const firstLangKey = Object.keys(allFormValues)[0];
      const maxFooterCount = allFormValues[firstLangKey]?.length || 1;

      Object.keys(allFormValues).forEach((langCode) => {
        const currentFooters = allFormValues[langCode] || [];
        if (currentFooters.length < maxFooterCount) {
          const additionalFooters = Array(maxFooterCount - currentFooters.length).fill({
            id: `footer-${Date.now()}`,
            title: "", // Changed from description to title
            socialLinks: [],
          });
          form.setValue(langCode, [...currentFooters, ...additionalFooters], {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      });

      // Sync social link data from the first language to all other languages
      if (firstLangKey && allFormValues[firstLangKey]) {
        const primaryLanguageData = allFormValues[firstLangKey];
        Object.keys(allFormValues).forEach((langCode) => {
          if (langCode !== firstLangKey && allFormValues[langCode]) {
            primaryLanguageData.forEach((footer, footerIndex) => {
              if (footer.socialLinks && allFormValues[langCode][footerIndex]) {
                footer.socialLinks.forEach((socialLink, socialLinkIndex) => {
                  if (allFormValues[langCode][footerIndex].socialLinks[socialLinkIndex]) {
                    // Sync both URL and linkName from primary language
                    
                    form.setValue(
                      `${langCode}.${footerIndex}.socialLinks.${socialLinkIndex}.url`,
                      socialLink.url,
                      { shouldDirty: false, shouldValidate: false }
                    );
                  }
                });
              }
            });
          }
        });
      }

      validateFormFooterCounts();
    } catch (error) {
      console.error("Error processing footer data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load footer data. Please try again.",
        variant: "destructive",
      });
    } finally {
      updateState({ isLoadingData: false });
    }
  },
  [form, languageIds, activeLanguages, updateState, validateFormFooterCounts, toast]
  );

    useEffect(() => {
      if (!slug || state.dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }
      processFooteresData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, state.dataLoaded, slug, processFooteresData]);

    // Modified useEffect to include social link data synchronization
    useEffect(() => {
      if (state.isLoadingData || !state.dataLoaded) return;

      const subscription = form.watch((value, { name }) => {
        updateState({ hasUnsavedChanges: true });
        validateFormFooterCounts();
        
        // Sync social link data if a URL or linkName field was changed
        if (name && typeof value === 'string') {
          syncSocialLinkData(name, value);
        }
        
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value as FormData);
        }
      });

      return () => subscription.unsubscribe();
    }, [form, state.isLoadingData, state.dataLoaded, validateFormFooterCounts, updateState, syncSocialLinkData]);

    const addFooter = useCallback(
      (langCode: string) => {
        const newFooterId = `footer-${Date.now()}`;
        const newFooter = {
          id: newFooterId,
          title: "", // Changed from description to title
          socialLinks: [],
        };

        Object.keys(form.getValues()).forEach((lang) => {
          const currentFooteres = form.getValues()[lang] || [];
          form.setValue(lang, [...currentFooteres, newFooter], {
            shouldDirty: true,
            shouldValidate: true,
          });
        });

        validateFormFooterCounts();
        updateState({ hasUnsavedChanges: true });
        toast({
          title: "Footer added",
          description: "A new footer has been added. Please fill in the details and save your changes.",
        });
      },
      [form, validateFormFooterCounts, updateState, toast]
    );

    const confirmDeleteStep = useCallback((langCode: string, index: number) => {
      const currentFooteres = form.getValues()[langCode] || [];
      if (currentFooteres.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one footer",
          variant: "destructive",
        });
        return;
      }
      setStepToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    }, [form, toast]);

const syncSocialLinksBeforeValidation = useCallback(() => {
    const allValues = form.getValues();
    const firstLangKey = Object.keys(allValues)[0];
    const firstLangData = allValues[firstLangKey];
    
    if (!firstLangData) return;

    // Sync social links structure and URLs (but NOT linkNames) from first language to all other languages
    Object.keys(allValues).forEach((langCode) => {
        if (langCode !== firstLangKey && allValues[langCode]) {
            firstLangData.forEach((footer: any, footerIndex: number) => {
                if (footer.socialLinks && allValues[langCode][footerIndex]) {
                    const targetLength = footer.socialLinks.length;
                    const currentSocialLinks = allValues[langCode][footerIndex].socialLinks || [];
                    
                    // Create new social links array with the same length as first language
                    const newSocialLinks = [];
                    for (let i = 0; i < targetLength; i++) {
                        const sourceLink = footer.socialLinks[i];
                        const existingLink = currentSocialLinks[i];
                        
                        newSocialLinks.push({
                            id: existingLink?.id || sourceLink?.id,
                            image: existingLink?.image || sourceLink?.image || "",
                            url: sourceLink?.url || "", // Sync URL from first language
                            linkName: existingLink?.linkName || "", // Keep existing linkName for translation
                        });
                    }
                    
                    form.setValue(`${langCode}.${footerIndex}.socialLinks`, newSocialLinks, {
                        shouldDirty: false,
                        shouldValidate: false,
                    });
                }
            });
        }
    });
}, [form]);


    const handleSave = useCallback(async () => {
          syncSocialLinksBeforeValidation();

              await new Promise(resolve => setTimeout(resolve, 100));

      const isValid = await form.trigger();
      const hasEqualFooterCounts = validateFormFooterCounts();
      const allFormValues = form.getValues();
      console.log(allFormValues)
      
      if (!hasEqualFooterCounts) {
        updateState({ isValidationDialogOpen: true });
        toast({
          title: "Validation Error",
          description: "All languages must have the same number of footeres.",
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
        let sectionId = state.existingSubSectionId;

        if (!sectionId) {
          if (!ParentSectionId) {
            throw new Error("Parent section ID is required to create a subsection");
          }

          const subsectionData = {
            name: "Footeres Section",
            slug: slug || `footeres-section-${Date.now()}`,
            description: "Footeres section for the website",
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
        const footerCount = Array.isArray(allFormValues[firstLangKey]) ? allFormValues[firstLangKey].length : 0;
        const translations: ContentTranslation[] = [];
        const processedElementIds = new Set<string>();

        for (let i = 0; i < footerCount; i++) {
          const footerIndex = i + 1;
          const elementNames = {
            title: `Special Footer ${footerIndex} - Title`, // Changed from Description to Title
          };

          const elements: Record<string, ContentElement | null> = {
            title: state.contentElements.find((el) => el.name === elementNames.title) ?? null, // Changed from description to title
          };

          const elementTypes = [
            { type: "text", key: "title", name: elementNames.title }, // Changed from description to title
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

          const socialLinks = allFormValues[firstLangKey][i]?.socialLinks || [];
          const socialLinkElements: Record<string, ContentElement | null>[] = [];
          for (let j = 0; j < socialLinks.length; j++) {
            const socialLinkIndex = j + 1;
            const socialLinkNames = {
              url: `Special Footer ${footerIndex} - SocialLink ${socialLinkIndex} - Url`,
              image: `Special Footer ${footerIndex} - SocialLink ${socialLinkIndex} - Image`,
              linkName: `Special Footer ${footerIndex} - SocialLink ${socialLinkIndex} - LinkName`, // Added linkName
            };

            socialLinkElements[j] = {
              url: state.contentElements.find((el) => el.name === socialLinkNames.url) ?? null,
              image: state.contentElements.find((el) => el.name === socialLinkNames.image && el.type === "image") ?? null,
              linkName: state.contentElements.find((el) => el.name === socialLinkNames.linkName) ?? null, // Added linkName
            };

            // Create URL element if it doesn't exist
            if (!socialLinkElements[j].url) {
              const newElement = await createContentElement.mutateAsync({
                name: socialLinkNames.url,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: i * 5 + elementTypes.length + j * 3, // Updated to account for 3 fields per social link
                defaultContent: "",
              });
              socialLinkElements[j].url = newElement.data;
              updateState({
                contentElements: [...state.contentElements, newElement.data],
              });
            }

            // Create Image element if it doesn't exist
            if (!socialLinkElements[j].image) {
              const newElement = await createContentElement.mutateAsync({
                name: socialLinkNames.image,
                type: "image",
                parent: sectionId,
                isActive: true,
                order: i * 5 + elementTypes.length + j * 3 + 1, // Updated order
                defaultContent: "image-placeholder",
              });
              socialLinkElements[j].image = newElement.data;
              updateState({
                contentElements: [...state.contentElements, newElement.data],
              });
            }

            // Create LinkName element if it doesn't exist
            if (!socialLinkElements[j].linkName) {
              const newElement = await createContentElement.mutateAsync({
                name: socialLinkNames.linkName,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: i * 5 + elementTypes.length + j * 3 + 2, // Added linkName order
                defaultContent: "",
              });
              socialLinkElements[j].linkName = newElement.data;
              updateState({
                contentElements: [...state.contentElements, newElement.data],
              });
            }

            processedElementIds.add(socialLinkElements[j].url!._id);
            processedElementIds.add(socialLinkElements[j].image!._id);
            processedElementIds.add(socialLinkElements[j].linkName!._id); // Added linkName to processed elements
          }

          Object.entries(allFormValues).forEach(([langCode, footeres]) => {
            if (!Array.isArray(footeres) || !footeres[i]) return;
            const langId = langCodeToIdMap[langCode];
            if (!langId) return;

            const footer = footeres[i];
      
            // Changed from description to title
            if (elements.title) {
              translations.push({
                _id: "",
                content: footer.title || "",
                language: langId,
                contentElement: elements.title._id,
                isActive: true,
              });
            }

            footer.socialLinks?.forEach((socialLink: any, j: number) => {
              // Add URL translation
              if (socialLinkElements[j].url) {
                translations.push({
                  _id: "",
                  content: socialLink.url || "",
                  language: langId,
                  contentElement: socialLinkElements[j].url!._id,
                  isActive: true,
                });
              }

              // Add LinkName translation
              if (socialLinkElements[j].linkName) {
                translations.push({
                  _id: "",
                  content: socialLink.linkName || "",
                  language: langId,
                  contentElement: socialLinkElements[j].linkName!._id,
                  isActive: true,
                });
              }
            });
          });

          const imageFile = heroImages[i];
          if (imageFile && elements.image) {
            const formData = new FormData();
            formData.append("image", imageFile);
            const uploadResult = await apiClient.post(`/content-elements/${elements.image._id}/image`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }

          socialLinks.forEach((socialLink: any, j: number) => {
            const socialLinkImage = socialLinkImages[i]?.[j];
            if (socialLinkImage && socialLinkElements[j].image) {
              const formData = new FormData();
              formData.append("image", socialLinkImage);
              apiClient
                .post(`/content-elements/${socialLinkElements[j].image!._id}/image`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                })
                .then((uploadResult) => {
                  if (uploadResult.data?.imageUrl) {
                    Object.entries(allFormValues).forEach(([langCode]) => {
                      if (allFormValues[langCode] && allFormValues[langCode][i]) {
                        form.setValue(`${langCode}.${i}.socialLinks.${j}.image`, uploadResult.data.imageUrl, {
                          shouldDirty: true,
                        });
                      }
                    });
                  }
                })
                .catch((uploadError) => {
                  console.error(`Image upload failed for Social Link ${j + 1} of Footer ${footerIndex}`, uploadError);
                  toast({
                    title: "Image Upload Error",
                    description: `Failed to upload image for Social Link ${j + 1} of Footer ${footerIndex}.`,
                    variant: "destructive",
                  });
                });
            }
          });
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
          title: state.existingSubSectionId ? "Footeres section updated successfully!" : "Footeres section created successfully!",
          description: "All content has been saved.",
          duration: 5000,
        });

        if (slug) {
          updateState({ isLoadingData: true, dataLoaded: false });
          const result = await refetch();
          if (result.data?.data) {
            processFooteresData(result.data.data);
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
          title: state.existingSubSectionId ? "Error updating footeres section" : "Error creating footeres section",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        updateState({ isSaving: false });
      }
    }, [
      form,
      validateFormFooterCounts,
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
      socialLinkImages,
      toast,
      refetch,
      processFooteresData,
      updateState,
    ]);

    createFormRef(ref, {
      form,
      hasUnsavedChanges: state.hasUnsavedChanges,
      setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
      existingSubSectionId: state.existingSubSectionId,
      contentElements: state.contentElements,
      componentName: "Footeres",
      extraMethods: {
        getFooterImages: () => heroImages,
        getSocialLinkImages: () => socialLinkImages,
      },
    });

    const languageCodes = createLanguageCodeMap(activeLanguages);

    useEffect(() => {
      const subscription = form.watch(() => {
        if (state.dataLoaded && !state.isLoadingData) {
          validateFormFooterCounts();
        }
      });
      return () => subscription.unsubscribe();
    }, [state.dataLoaded, state.isLoadingData, form, validateFormFooterCounts]);

    if (slug && isLoadingSubsection && !state.dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading footeres section data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <LoadingDialog
          isOpen={state.isSaving}
          title={state.existingSubSectionId ? "Updating Footeres" : "Creating Footeres"}
          description="Please wait while we save your changes..."
        />

        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {languageIds.map((langId: Key | null | undefined, langIndex: number) => {
              const langCode = String(langId) in languageCodes ? languageCodes[String(langId)] : String(langId);
              const isFirstLanguage = langIndex === 0;

              return (
                <FooterLanguageCard
                  key={langId}
                  langCode={langCode}
                  isFirstLanguage={isFirstLanguage}
                  form={form}
                  addFooter={addFooter}
                  removeFooter={confirmDeleteStep}
                  onDeleteStep={confirmDeleteStep}
                  FooterImageUploader={HeroImageUploader}
                  SocialLinkImageUploader={SocialLinkImageUploader}
                />
              );
            })}
          </div>
        </Form>

        <div className="flex justify-end mt-6">
          {state.footerCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Each language must have the same number of footeres</span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={state.footerCountMismatch || state.isSaving}
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
                {state.existingSubSectionId ? "Update Footeres" : "Save Footeres"}
              </>
            )}
          </Button>
        </div>

        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={stepToDelete ? `Footer ${stepToDelete.index + 1}` : ""}
          onConfirm={removeProcessStep}
          isDeleting={isDeleting}
          title="Delete Footer"
          confirmText="Delete Footer"
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

SpecialFormBasicForm.displayName = "SpecialFormBasicForm";
export default SpecialFormBasicForm; 