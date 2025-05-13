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
import { createLanguageCodeMap } from "../../Utils/language-utils";
import { BackgroundImageSection } from "./SimpleImageUploader";
import { LanguageCard } from "./LanguageCard";
import { processAndLoadData } from "../../Utils/load-form-data";
import { Loader2, Save } from "lucide-react";
import { createHeroDefaultValues } from "../../Utils/Language-default-values";
import {  useImageUploader } from "../../Utils/Image-uploader";
import { createFormRef } from "../../Utils/Expose-form-data";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { HeroFormProps } from "@/src/api/types/sections/service/serviceSections.types";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import { createHeroSchema } from "../../Utils/language-specific-schemas";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";


const HeroForm = forwardRef<any, HeroFormProps>((props, ref) => {
  const { 
    languageIds, 
    activeLanguages, 
    onDataChange, 
    slug, 
    ParentSectionId, 
    initialData 
  } = props;

  const { websiteId } = useWebsiteContext();

  // Setup form with schema validation
  const formSchema = createHeroSchema(languageIds, activeLanguages);
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
    existingSubSectionId: null as string | null ,
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
    handleImageUpload : handleOriginalImageUpload, 
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
      return validTypes.includes(file.type) || 'Only JPEG, PNG, GIF, or SVG files are allowed';
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
  }, [initialData, dataLoaded, defaultLangCode, form]);

  // Process hero data from API
  const processHeroData = useCallback((subsectionData: SubSection | null) => {
    processAndLoadData(
      subsectionData,
      form,
      languageIds,
      activeLanguages,
      {
        groupElements: (elements) => ({
          'hero': elements.filter(el => el.type === 'text' || (el.name === 'Background Image' && el.type === 'image'))
        }),
        processElementGroup: (groupId, elements, langId, getTranslationContent) => {
          const elementKeyMap: Record<string, keyof typeof result> = {
            'Title': 'title',
            'Description': 'description',
            'Back Link Text': 'backLinkText'
          };
          
          const result = {
            title: '',
            description: '',
            backLinkText: ''
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
          backLinkText: ''
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
      (el) => el.name === 'Background Image' && el.type === 'image'
    ) || subsectionData?.contentElements?.find(
      (el) => el.name === 'Background Image' && el.type === 'image'
    );
    
    if (bgImageElement?.imageUrl) {
      form.setValue('backgroundImage', bgImageElement.imageUrl);
    }
  }, [form, languageIds, activeLanguages]);

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
      processHeroData(completeSubsectionData.data);
      updateState({ 
        dataLoaded: true,
        isLoadingData: false
      });
      dataProcessed.current = true;
    }
  }, [completeSubsectionData, isLoadingSubsection, slug, processHeroData]);

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
          description: "Background image has been successfully uploaded."
        });
        return imageUrl;
      } 
      
      throw new Error("No image URL returned from server. Response: " + JSON.stringify(uploadResult.data));
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({
        title: "Image Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
      throw error;
    }
  }, [form, toast]);

  // Save handler with optimized process
  const handleSave = useCallback(async () => {
    // Validate form
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
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
          throw new Error("Parent section ID is required to create a subsection");
        }
        
        const subsectionData = {
          name: "Hero Section",
          slug: slug || `hero-section-${Date.now()}`,
          description: "",
          isActive: true,
          isMain: false,
          order: 0,
          defaultContent : '',
          sectionItem: ParentSectionId,
          languages: languageIds,
          WebSiteId : websiteId
        };
        
        const newSubSection = await createSubSection.mutateAsync(subsectionData);
        sectionId = newSubSection.data._id;
        updateState({ existingSubSectionId: sectionId });
      } else {
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
        throw new Error("Failed to create or retrieve subsection ID");
      }

      // Step 2: Map language codes to IDs
      const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang.languageID] = lang._id;
        return acc;
      }, {});

      // Step 3: Handle existing content or create new content
      if (contentElements.length > 0) {
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
        const elementNameToKeyMap: Record<string, 'title' | 'description' | 'backLinkText'> = {
          'Title': 'title',
          'Description': 'description',
          'Back Link Text': 'backLinkText'
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
          await bulkUpsertTranslations.mutateAsync(translations);
        }
      } else {
        // Create new content elements
        const elementTypes = [
          { type: "image", key: "backgroundImage", name: "Background Image" },
          { type: "text", key: "title", name: "Title" },
          { type: "text", key: "description", name: "Description" },
          { type: "text", key: "backLinkText", name: "Back Link Text" }
        ];

        const createdElements = [];
        for (const [index, el] of elementTypes.entries()) {
          let defaultContent = "";
          if (el.type === "image") {
            defaultContent = "image-placeholder";
          } else if (el.type === "text" && typeof allFormValues[defaultLangCode] === "object") {
            const langValues = allFormValues[defaultLangCode];
            defaultContent = langValues && typeof langValues === "object" && el.key in langValues
              ? langValues[el.key]
              : "";
          }

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
          await bulkUpsertTranslations.mutateAsync(translations);
        }
      }

      // Show success message
      toast({
        title: existingSubSectionId ? "Hero section updated successfully!" : "Hero section created successfully!",
        description: "All content has been saved."
      });

      updateState({ hasUnsavedChanges: false });

      // Update form state with saved data
      if (slug) {
        const result = await refetch();
        if (result.data?.data) {
          updateState({ dataLoaded: false });
          await processHeroData(result.data.data);
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

      return true;
    } catch (error) {
      console.error("Operation failed:", error);
      toast({
        title: existingSubSectionId ? "Error updating hero section" : "Error creating hero section",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error occurred"
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
    processHeroData, 
    refetch, 
    updateState, 
    updateSubSection, 
    uploadImage, 
    activeLanguages
  ]);

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: 'Hero',
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
        <p className="ml-2 text-muted-foreground">Loading hero section data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingDialog 
        isOpen={isSaving} 
        title={existingSubSectionId ? "Updating Hero Section" : "Creating Hero Section"}
        description="Please wait while we save your changes..."
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
            }}          onRemove={handleImageRemove}
        />
        
        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languageIds.map((langId) => {
            const langCode = languageCodes[langId] || langId;
            return (
              <LanguageCard 
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
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSubSectionId ? "Update Hero Content" : "Save Hero Content"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

HeroForm.displayName = "HeroForm";
export default HeroForm;