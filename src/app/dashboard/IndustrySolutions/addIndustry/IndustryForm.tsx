"use client";

import { forwardRef, useEffect, useState, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import apiClient from "@/src/lib/api-client";
import { useToast } from "@/src/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import { createIndustrySchema } from "../../services/addService/Utils/language-specific-schemas";
import { createHeroDefaultValues, createLanguageCodeMap } from "../../services/addService/Utils/Language-default-values";
import { useImageUploader } from "../../services/addService/Utils/Image-uploader";
import { processAndLoadData } from "../../services/addService/Utils/load-form-data";
import { createFormRef } from "../../services/addService/Utils/Expose-form-data";
import { BackgroundImageSection } from "../../services/addService/Components/Hero/SimpleImageUploader";
import { IndustryFormProps } from "@/src/api/types/sections/industry/industrySections.types";
import { IndustryLanguageCard } from "./IndustryLanguageCard";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/src/context/LanguageContext";
// Import your translation hook - adjust the import path as needed

const IndustryForm = forwardRef<any, IndustryFormProps>((props, ref) => {
  const { 
    languageIds, 
    activeLanguages, 
    onDataChange, 
    slug, 
    ParentSectionId, 
    initialData 
  } = props;

  const { websiteId } = useWebsiteContext();
  
  // Get translation function
  const { t } = useTranslation(); // Adjust based on your translation hook
  const {language} = useLanguage()
  // Setup form with schema validation
  const formSchema = createIndustrySchema(languageIds, activeLanguages);
  const defaultValues = createHeroDefaultValues(languageIds, activeLanguages);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange" // Enable validation on change for better UX
  });

  // State management
  const [state, setState] = useState({
    isLoadingData: !slug,
    dataLoaded: !slug,
    hasUnsavedChanges: false,
    existingSubSectionId: null as string | null,
    contentElements: [] as ContentElement[],
    isSaving: false
  });

  // Use object state update for better performance and readability
  const updateState = useCallback((newState: { isLoadingData?: boolean; dataLoaded?: boolean; hasUnsavedChanges?: boolean; existingSubSectionId?: string | null; contentElements?: any[]; isSaving?: boolean; }) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Extract state variables for readability
  const { 
    isLoadingData, 
    dataLoaded, 
    hasUnsavedChanges, 
    existingSubSectionId, 
    contentElements, 
    isSaving 
  } = state;

  // Hooks
  const { toast } = useToast();
  const dataProcessed = useRef(false);
  const onDataChangeRef = useRef(onDataChange);
  const defaultLangCode = activeLanguages[0]?.languageID || 'en';
  
  // Services
  const { 
    useCreate: useCreateSubSection, 
    useGetCompleteBySlug, 
    useUpdate: useUpdateSubSection 
  } = useSubSections();
  
  const { useCreate: useCreateContentElement } = useContentElements();
  const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations();
  
  const createSubSection = useCreateSubSection();
  const updateSubSection = useUpdateSubSection();
  const createContentElement = useCreateContentElement();
  const bulkUpsertTranslations = useBulkUpsertTranslations();

  // Image upload hook
  const { 
    imageFile, 
    imagePreview, 
    handleImageUpload: handleOriginalImageUpload, 
    handleImageRemove 
  } = useImageUploader({
    form,
    fieldPath: 'backgroundImage',
    initialImageUrl: initialData?.image || form.getValues().backgroundImage,
    onUpload: () => updateState({
      hasUnsavedChanges: true,
    }),
    onRemove: () => updateState({
      hasUnsavedChanges: true,
    }),
    validate: (file: { type: string; }) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      return validTypes.includes(file.type) || t("industryForm.invalidFileType");
    }
  });

  // Data fetching from API
  const { 
    data: completeSubsectionData, 
    isLoading: isLoadingSubsection, 
    refetch 
  } = useGetCompleteBySlug(slug || '', Boolean(slug));

  // Update reference when onDataChange changes
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Process initial data from parent
  const processInitialData = useCallback(() => {
    if (initialData && !dataLoaded) {
      console.log(t("industryForm.processingInitialData"));
      
      if (initialData.description) {
        form.setValue(`${defaultLangCode}.description`, initialData.description);
      }
      
      if (initialData.image) {
        form.setValue('backgroundImage', initialData.image);
      }
      
      updateState({ 
        dataLoaded: true, 
        hasUnsavedChanges: false 
      });
    }
  }, [initialData, dataLoaded, defaultLangCode, form, t]);

  // Process hero data from API
  const processIndustryData = useCallback((subsectionData: SubSection | null) => {
    console.log(t("industryForm.processingIndustryData"));
    
    processAndLoadData(
      subsectionData,
      form,
      languageIds,
      activeLanguages,
      {
        groupElements: (elements) => ({
          'hero': elements.filter(el => el.type === 'text' || (el.name === t("industryForm.backgroundImageName") && el.type === 'image'))
        }),
        processElementGroup: (groupId, elements, langId, getTranslationContent) => {
          const elementKeyMap: Record<string, keyof typeof result> = {
            [t("industryForm.titleElementName")]: 'title',
            [t("industryForm.descriptionElementName")]: 'description',
          };
          
          const result = {
            title: '',
            description: '',
          };
          
          elements.filter(el => el.type === 'text').forEach(element => {
            const key = elementKeyMap[element.name];
            if (key) {
              result[key] = getTranslationContent(element, '');
            }
          });
          
          return result;
        },
        getDefaultValue: () => ({
          title: '',
          description: '',
        })
      },
      {
        setExistingSubSectionId: (id) => updateState({ existingSubSectionId: id }),
        setContentElements: (elements) => updateState({ contentElements: elements }),
        setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
        setHasUnsavedChanges: (hasChanges) => updateState({ hasUnsavedChanges: hasChanges }),
        setIsLoadingData: (loading) => updateState({ isLoadingData: loading })
      }
    );

    // Handle background image
    const bgImageElement = subsectionData?.elements?.find(
      (el) => el.name === t("industryForm.backgroundImageName") && el.type === 'image'
    ) || subsectionData?.contentElements?.find(
      (el) => el.name === t("industryForm.backgroundImageName") && el.type === 'image'
    );
    
    if (bgImageElement?.imageUrl) {
      form.setValue('backgroundImage', bgImageElement.imageUrl);
    }
  }, [form, languageIds, activeLanguages, t]);

  // Process initial data effect
  useEffect(() => {
    if (!dataLoaded && initialData) {
      processInitialData();
    }
  }, [initialData, dataLoaded, processInitialData]);

  // Process API data effect
  useEffect(() => {
    if (!slug || isLoadingSubsection || dataProcessed.current) return;
    
    if (completeSubsectionData?.data) {
      updateState({ isLoadingData: true });
      processIndustryData(completeSubsectionData.data);
      updateState({ 
        dataLoaded: true,
        isLoadingData: false
      });
      dataProcessed.current = true;
    }
  }, [completeSubsectionData, isLoadingSubsection, slug, processIndustryData]);

  // Form watch effect for unsaved changes
  useEffect(() => {
    if (isLoadingData || !dataLoaded) return;
    
    const subscription = form.watch((value) => {
      updateState({ hasUnsavedChanges: true });
      if (onDataChangeRef.current) {
        onDataChangeRef.current(value);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, isLoadingData, dataLoaded, updateState]);

  // Image upload handler
  const uploadImage = useCallback(async (elementId: any, file: string | Blob) => {
    if (!file) return null;
    
    try {
      console.log(t("industryForm.uploadingImage"));
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
          title: t("industryForm.imageUploaded"),
          description: t("industryForm.imageUploadedDesc")
        });
        return imageUrl;
      } 
      
      throw new Error(t("industryForm.noImageUrlReturned") + " " + JSON.stringify(uploadResult.data));
    } catch (error) {
      console.error(t("industryForm.imageUploadError"), error);
      toast({
        title: t("industryForm.imageUploadFailed"),
        description: error instanceof Error ? error.message : t("industryForm.imageUploadFailedDesc"),
        variant: "destructive"
      });
      throw error;
    }
  }, [form, toast, t]);

  // Save handler with optimized process
  const handleSave = useCallback(async () => {
    // Validate form
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: t("industryForm.validationError"),
        description: t("industryForm.fillRequiredFields"),
        variant: "destructive"
      });
      return false;
    }

    updateState({ isSaving: true });
    
    try {
      const allFormValues = form.getValues();

      // Step 1: Create or update subsection
      let sectionId = existingSubSectionId;
      if (!sectionId) {
        if (!ParentSectionId) {
          throw new Error(t("industryForm.parentSectionRequired"));
        }
        
        console.log(t("industryForm.creatingSubsection"));
        const subsectionData = {
          name: t("industryForm.sectionName"),
          slug: slug || `${t("industryForm.heroSectionSlug")}-${Date.now()}`,
          description: "",
          isActive: true,
          isMain: false,
          order: 0,
          defaultContent: '',
          sectionItem: ParentSectionId,
          languages: languageIds,
          WebSiteId: websiteId
        };
        
        const newSubSection = await createSubSection.mutateAsync(subsectionData);
        sectionId = newSubSection.data._id;
        updateState({ existingSubSectionId: sectionId });
      } else {
        console.log(t("industryForm.updatingSubsection"));
        const updateData = {
          isActive: true,
          isMain: false,
          languages: languageIds
        };
        
        await updateSubSection.mutateAsync({
          id: sectionId,
          data: updateData
        });
      }

      if (!sectionId) {
        throw new Error(t("industryForm.failedToCreateSubsection"));
      }

      // Step 2: Map language codes to IDs
      console.log(t("industryForm.mappingLanguageCodes"));
      const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc: { [x: string]: any; }, lang: { languageID: string | number; _id: any; }) => {
        acc[lang.languageID] = lang._id;
        return acc;
      }, {});

      // Step 3: Handle existing content or create new content
      if (contentElements.length > 0) {
        console.log(t("industryForm.handlingExistingContent"));
        // Handle existing content elements
        if (imageFile) {
          const imageElement = contentElements.find((e) => e.type === "image");
          if (imageElement) {
            await uploadImage(imageElement._id, imageFile);
          }
        }

        // Update translations for text elements
        const textElements = contentElements.filter((e) => e.type === "text");
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string; })[] | { content: any; language: string; contentElement: string; isActive: boolean; }[] = [];
        const elementNameToKeyMap: Record<string, 'title' | 'description'> = {
          [t("industryForm.titleElementName")]: 'title',
          [t("industryForm.descriptionElementName")]: 'description',
        };

        Object.entries(allFormValues).forEach(([langCode, values]) => {
          if (langCode === "backgroundImage") return;
          
          const langId = langCodeToIdMap[langCode];
          if (!langId) return;
          
          textElements.forEach((element) => {
            const key = elementNameToKeyMap[element.name];
            if (key && values && typeof values === "object" && key in values) {
              translations.push({
                content: values[key],
                language: langId,
                contentElement: element._id,
                isActive: true
              });
            }
          });
        });

        if (translations.length > 0) {
          console.log(t("industryForm.updatingTranslations"));
          await bulkUpsertTranslations.mutateAsync(translations);
        }
      } else {
        console.log(t("industryForm.creatingNewContent"));
        // Create new content elements
        const elementTypes = [
          { type: "image", key: "backgroundImage", name: t("industryForm.backgroundImageName") },
          { type: "text", key: "title", name: t("industryForm.titleElementName") },
          { type: "text", key: "description", name: t("industryForm.descriptionElementName") },
        ];

        const createdElements = [];
        for (const [index, el] of elementTypes.entries()) {
          let defaultContent = "";
          if (el.type === "image") {
            defaultContent = t("industryForm.imagePlaceholder");
          } else if (el.type === "text" && typeof allFormValues[defaultLangCode] === "object") {
            const langValues = allFormValues[defaultLangCode];
            defaultContent = langValues && typeof langValues === "object" && el.key in langValues
              ? langValues[el.key]
              : "";
          }

          console.log(t("industryForm.creatingContentElement"), el.name);
          const elementData = {
            name: el.name,
            type: el.type,
            parent: sectionId,
            isActive: true,
            order: index,
            defaultContent: defaultContent
          };

          const newElement = await createContentElement.mutateAsync(elementData);
          createdElements.push({ ...newElement.data, key: el.key });
        }

        updateState({ contentElements: createdElements.map((e) => ({ ...e, translations: [] })) });

        // Handle image upload for new elements
        const bgImageElement = createdElements.find((e) => e.key === "backgroundImage");
        if (bgImageElement && imageFile) {
          await uploadImage(bgImageElement._id, imageFile);
        }

        // Create translations for new elements
        const textElements = createdElements.filter((e) => e.key !== "backgroundImage");
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string; })[] | { content: any; language: string; contentElement: any; isActive: boolean; }[] = [];
        
        Object.entries(allFormValues).forEach(([langCode, langValues]) => {
          if (langCode === "backgroundImage") return;
          
          const langId = langCodeToIdMap[langCode];
          if (!langId) return;
          
          for (const element of textElements) {
            if (langValues && typeof langValues === "object" && element.key in langValues) {
              translations.push({
                content: langValues[element.key],
                language: langId,
                contentElement: element._id,
                isActive: true
              });
            }
          }
        });

        if (translations.length > 0) {
          console.log(t("industryForm.updatingTranslations"));
          await bulkUpsertTranslations.mutateAsync(translations);
        }
      }

      // Show success message
      toast({
        title: existingSubSectionId ? t("industryForm.industryUpdated") : t("industryForm.industryCreated"),
        description: t("industryForm.allContentSaved")
      });

      updateState({ hasUnsavedChanges: false });

      // Update form state with saved data
      if (slug) {
        const result = await refetch();
        if (result.data?.data) {
          updateState({ dataLoaded: false });
          await processIndustryData(result.data.data);
        }
      } else {
        // For new subsections, manually update form
        const updatedData = {
          ...allFormValues,
          backgroundImage: form.getValues("backgroundImage")
        };
        
        Object.entries(updatedData).forEach(([key, value]) => {
          if (key !== "backgroundImage") {
            Object.entries(value).forEach(([field, content]) => {
              form.setValue(`${key}.${field}`, content, { shouldDirty: false });
            });
          }
        });
        
        form.setValue("backgroundImage", updatedData.backgroundImage, { shouldDirty: false });
      }

      console.log(t("industryForm.saveCompleted"));
      return true;
    } catch (error) {
      console.error(t("industryForm.operationFailed"), error);
      toast({
        title: existingSubSectionId ? t("industryForm.errorUpdatingSection") : t("industryForm.errorCreatingSection"),
        variant: "destructive",
        description: error instanceof Error ? error.message : t("industryForm.unknownError")
      });
      return false;
    } finally {
      updateState({ isSaving: false });
    }
  }, [
    existingSubSectionId, 
    form, 
    imageFile, 
    ParentSectionId, 
    slug, 
    toast, 
    bulkUpsertTranslations, 
    contentElements, 
    createContentElement, 
    createSubSection, 
    defaultLangCode, 
    languageIds, 
    processIndustryData, 
    refetch, 
    updateState, 
    updateSubSection, 
    uploadImage, 
    activeLanguages,
    websiteId,
    t
  ]);

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: 'Industry',
    extraMethods: {
      getImageFile: () => imageFile,
      saveData: handleSave
    },
    extraData: {
      imageFile,
      existingSubSectionId
    }
  });

  const languageCodes = createLanguageCodeMap(activeLanguages);

  // Loading state
  if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{t("industryForm.loadingHeroData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingDialog 
        isOpen={isSaving} 
        title={existingSubSectionId ? t("industryForm.updatingIndustrySection") : t("industryForm.creatingIndustrySection")}
        description={t("industryForm.dialogDescription")}
      />
      
      <Form {...form}>
        {/* Background Image Section */}
        <BackgroundImageSection 
          imagePreview={imagePreview || undefined} 
          imageValue={form.getValues().backgroundImage}
          onUpload={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (event.target.files && event.target.files.length > 0) {
                handleOriginalImageUpload({ target: { files: Array.from(event.target.files) } });
            }
            }}
          onRemove={handleImageRemove}
          imageType="logo"
        />
        
        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir = {language === 'ar' ? 'rtl' : 'ltr'}>
          {languageIds.map((langId) => {
            const langCode = languageCodes[langId] || langId;
            return (
              <IndustryLanguageCard 
                key={langId}
                langCode={langCode}
                form={form}
              />
            );
          })}
        </div>
      </Form>
      
      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button 
          type="button" 
          onClick={handleSave} 
          disabled={isLoadingData || isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("industryForm.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSubSectionId ? t("industryForm.updateIndustryContent") : t("industryForm.saveIndustryContent")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

IndustryForm.displayName = "IndustryForm";
export default IndustryForm;