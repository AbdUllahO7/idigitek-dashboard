"use client";

import { forwardRef, useEffect, useState, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import apiClient from "@/src/lib/api-client";
import { useToast } from "@/src/hooks/use-toast";
import { Loader2, Save, Navigation, CalendarIcon, Calendar as CalendarLucide } from "lucide-react";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { createBlogDefaultValues, createLanguageCodeMap, createProductDefaultValues } from "@/src/app/dashboard/services/addService/Utils/Language-default-values";
import { useImageUploader } from "@/src/app/dashboard/services/addService/Utils/Image-uploader";
import { processAndLoadData } from "@/src/app/dashboard/services/addService/Utils/load-form-data";
import { createFormRef } from "@/src/app/dashboard/services/addService/Utils/Expose-form-data";
import { BackgroundImageSection } from "@/src/app/dashboard/services/addService/Components/Hero/SimpleImageUploader";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { BlogsFormProps } from "@/src/api/types/sections/blog/blogSection.types";
import {  createProductSchema } from "../../../services/addService/Utils/language-specific-schemas";
import { ProductLanguageCard } from "./ProductLanguageCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";

const ProductForm = forwardRef<any, BlogsFormProps>((props, ref) => {
  const { 
    languageIds, 
    activeLanguages, 
    onDataChange, 
    slug, 
    ParentSectionId, 
    initialData, 
    subSectionId
  } = props;

  const { websiteId } = useWebsiteContext();
  const searchParams = useSearchParams();
  const sectionIdFromUrl = searchParams.get("sectionId") || "";
  const {t} = useTranslation()
  // Setup form with schema validation - Updated to include navigation fields
  const formSchema = createProductSchema(languageIds, activeLanguages, true); // Add navigation support
  const defaultValues = createProductDefaultValues(languageIds, activeLanguages, true); // Add navigation support
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange"
  });

  // State management
  const [state, setState] = useState({
    isLoadingData: !!subSectionId,
    dataLoaded: !subSectionId,
    hasUnsavedChanges: false,
    existingSubSectionId: null as string | null,
    contentElements: [] as ContentElement[],
    isSaving: false
  });

  const updateState = useCallback((newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

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
    useUpdate: useUpdateSubSection,
    useGetBySectionItemId
  } = useSubSections();
  
  const { useCreate: useCreateContentElement } = useContentElements();
  const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations();
  
  const createSubSection = useCreateSubSection();
  const updateSubSection = useUpdateSubSection();
  const createContentElement = useCreateContentElement();
  const bulkUpsertTranslations = useBulkUpsertTranslations();

  // Dynamic URL construction function
  const constructDynamicUrl = useCallback((subsectionId: string, sectionId: string, websiteId: string) => {
    // Get base URL from environment or use default
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://idigitek-client-dynamic.vercel.app";
    
    // Construct the dynamic URL for Product details
    const dynamicUrl = `${baseUrl}/Pages/ProductDetailPage/${subsectionId}`;
    
    return dynamicUrl;
  }, []);

  // Update dynamic URL when IDs change
  useEffect(() => {
    if (existingSubSectionId && ParentSectionId && websiteId) {
      const currentDynamicUrl = form.getValues("dynamicUrl");
      if (!currentDynamicUrl) {
        const dynamicUrl = constructDynamicUrl(existingSubSectionId, ParentSectionId, websiteId);
        form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false });
      }
    }
  }, [existingSubSectionId, ParentSectionId, websiteId, constructDynamicUrl, form]);

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
    onUpload: () => updateState({ hasUnsavedChanges: true }),
    onRemove: () => updateState({ hasUnsavedChanges: true }),
    validate: (file: { type: string }) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      return validTypes.includes(file.type) || 'Only JPEG, PNG, GIF, or SVG files are allowed';
    }
  });

  // Data fetching from API
  const { 
    data: completeSubsectionData, 
    isLoading: isLoadingSubsection, 
    refetch 
  } = useGetBySectionItemId(subSectionId || '');

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
      if (initialData.content) {
        form.setValue(`${defaultLangCode}.content`, initialData.content);
      }
      if (initialData.image) {
        form.setValue('backgroundImage', initialData.image);
      }

      // Set default value for addSubNavigation if not provided
      if (initialData.addSubNavigation !== undefined) {
        form.setValue("addSubNavigation", initialData.addSubNavigation);
      }

      // Set dynamic URL if available
      if (initialData.dynamicUrl) {
        form.setValue("dynamicUrl", initialData.dynamicUrl);
      }

      updateState({ 
        dataLoaded: true, 
        hasUnsavedChanges: false 
      });
    }
  }, [initialData, dataLoaded, defaultLangCode, form]);

  // Process Product data from API
  const processProductData = useCallback((subsectionData: SubSection | null) => {
    processAndLoadData(
      subsectionData,
      form,
      languageIds,
      activeLanguages,
      {
        groupElements: (elements) => ({
          'Product': elements.filter(el => 
            el.type === 'text' || 
            (el.name === 'Background Image' && el.type === 'image') ||
            (el.name === 'Add SubNavigation' && el.type === 'boolean') ||
            (el.name === 'Dynamic URL' && el.type === 'text')
          )
        }),
        processElementGroup: (groupId, elements, langId, getTranslationContent) => {
          const elementKeyMap: Record<string, keyof typeof result> = {
            'Title': 'title',
            'Description': 'description',
            'Content': 'content',
            'Category': 'category',
            'Price': 'price',
            'Date': 'date',
            'Back Link Text': 'backLinkText',
          };
          
          const result = {
            title: '',
            description: '',
            content: '',
            category: '',
            price: '',
            date: '',
            backLinkText: '',
          };
          
          elements
            .filter(el => el.type === 'text' && el.name !== 'Dynamic URL')
            .forEach(element => {
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
          content: '',
          category: '',
          price: '',
          date: '',
          backLinkText: '',
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

    // Handle subNavigation setting
    const subNavElement = subsectionData?.elements?.find(
      (el) => el.name === 'Add SubNavigation' && el.type === 'boolean'
    ) || subsectionData?.contentElements?.find(
      (el) => el.name === 'Add SubNavigation' && el.type === 'boolean'
    );

    if (subNavElement) {
      const booleanValue = subNavElement.defaultContent === "true" || subNavElement.defaultContent === true;
      form.setValue("addSubNavigation", booleanValue);
    }

    // Handle dynamic URL
    const dynamicUrlElement = subsectionData?.elements?.find(
      (el) => el.name === 'Dynamic URL' && el.type === 'text'
    ) || subsectionData?.contentElements?.find(
      (el) => el.name === 'Dynamic URL' && el.type === 'text'
    );



    if (dynamicUrlElement?.defaultContent) {
      form.setValue("dynamicUrl", dynamicUrlElement.defaultContent);
    } else if (subsectionData?._id && ParentSectionId && websiteId) {
      // Construct dynamic URL if not found in data
      const dynamicUrl = constructDynamicUrl(subsectionData._id, sectionIdFromUrl, websiteId);
      form.setValue("dynamicUrl", dynamicUrl);
    }
  }, [form, languageIds, activeLanguages, ParentSectionId, websiteId, constructDynamicUrl]);

  // Process initial data effect
  useEffect(() => {
    if (!dataLoaded && initialData) {
      processInitialData();
    }
  }, [initialData, dataLoaded, processInitialData]);

  // Process API data effect
  useEffect(() => {
    if (!subSectionId || isLoadingSubsection || dataProcessed.current) return;
    
    if (completeSubsectionData?.data[0]) {
      updateState({ isLoadingData: true });
      processProductData(completeSubsectionData.data[0]);
      updateState({ 
        dataLoaded: true,
        isLoadingData: false
      });
      dataProcessed.current = true;
    }
  }, [completeSubsectionData, isLoadingSubsection, subSectionId, processProductData]);

  // Ensure dynamic URL is always set when data is loaded
  useEffect(() => {
    if (dataLoaded && existingSubSectionId && ParentSectionId && websiteId) {
      const currentDynamicUrl = form.getValues("dynamicUrl");
      if (!currentDynamicUrl) {
        const dynamicUrl = constructDynamicUrl(existingSubSectionId, sectionIdFromUrl, websiteId);
        form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false });
      }
    }
  }, [dataLoaded, existingSubSectionId, ParentSectionId, websiteId, constructDynamicUrl, form]);

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
  }, [form, isLoadingData, dataLoaded]);

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

  // Save handler
  const handleSave = useCallback(async () => {
    const allFormValues = form.getValues();

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
      // Step 1: Create or update subsection
      let sectionId = existingSubSectionId;
      if (!sectionId) {
        if (!ParentSectionId) {
          throw new Error("Parent section ID is required to create a subsection");
        }
        
        const subsectionData = {
          name: "Product Section",
          slug: slug || `Product-section-${Date.now()}`,
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

        // Update dynamic URL with the new subsection ID
        const dynamicUrl = constructDynamicUrl(sectionId, sectionIdFromUrl, websiteId);
        form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false });
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

        // Ensure dynamic URL is set for existing sections too
        const currentDynamicUrl = form.getValues("dynamicUrl");
        if (!currentDynamicUrl) {
          const dynamicUrl = constructDynamicUrl(sectionId, sectionIdFromUrl, websiteId);
          form.setValue("dynamicUrl", dynamicUrl, { shouldDirty: false });
        }
      }

      // Get updated form values after dynamic URL has been set
      const updatedFormValues = form.getValues();

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

        // Update subNavigation boolean element
        const subNavElement = contentElements.find((e) => e.name === "Add SubNavigation" && e.type === "boolean");
        if (subNavElement) {
          await apiClient.put(`/content-elements/${subNavElement._id}`, {
            defaultContent: String(allFormValues.addSubNavigation)
          });
        }

        // Update dynamic URL element
        const dynamicUrlElement = contentElements.find((e) => e.name === "Dynamic URL" && e.type === "text");
        if (dynamicUrlElement) {
          const finalDynamicUrl = updatedFormValues.dynamicUrl || constructDynamicUrl(sectionId, sectionIdFromUrl, websiteId);
          await apiClient.put(`/content-elements/${dynamicUrlElement._id}`, {
            defaultContent: finalDynamicUrl
          });
        }

        // Update translations for text elements
        const textElements = contentElements.filter((e) => e.type === "text" && e.name !== "Dynamic URL");
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string })[] = [];
        const elementNameToKeyMap: Record<string, 'title' | 'description' | 'backLinkText' | 'category' | 'price' | 'date' | 'content'> = {
          'Title': 'title',
          'Description': 'description',
          'Content': 'content',
          'Back Link Text': 'backLinkText',
          'Category': 'category',
          'Price': 'price',
          'Date': 'date',
        };

        Object.entries(updatedFormValues).forEach(([langCode, values]) => {
          if (langCode === "backgroundImage" || langCode === "addSubNavigation" || langCode === "dynamicUrl") return;
          
          const langId = langCodeToIdMap[langCode];
          if (!langId) return;
          
          textElements.forEach((element) => {
            const key = elementNameToKeyMap[element.name];
            if (key && values && typeof values === "object" && key in values) {
              const content = values[key];
              if (content || langCode === defaultLangCode) {
                translations.push({
                  content: content || "",
                  language: langId,
                  contentElement: element._id,
                  isActive: true
                });
              }
            }
          });
        });

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        }
      } else {
        // Create new content elements - Updated to include navigation fields
        const elementTypes = [
          { type: "image", key: "backgroundImage", name: "Background Image" },
          { type: "boolean", key: "addSubNavigation", name: "Add SubNavigation" },
          { type: "text", key: "dynamicUrl", name: "Dynamic URL" },
          { type: "text", key: "title", name: "Title" },
          { type: "text", key: "description", name: "Description" },
          { type: "text", key: "content", name: "Content" },
          { type: "text", key: "category", name: "Category" },
          { type: "text", key: "price", name: "Price" },
          { type: "text", key: "date", name: "Date" },
          { type: "text", key: "backLinkText", name: "Back Link Text" },
        ];

        const createdElements = [];
        for (const [index, el] of elementTypes.entries()) {
          let defaultContent = "";
          if (el.type === "image") {
            defaultContent = "image-placeholder";
          } else if (el.type === "boolean") {
            defaultContent = String(updatedFormValues.addSubNavigation);
          } else if (el.key === "dynamicUrl") {
            // Ensure dynamic URL is properly constructed
            const finalDynamicUrl = updatedFormValues.dynamicUrl || constructDynamicUrl(sectionId, sectionIdFromUrl, websiteId);
            defaultContent = finalDynamicUrl;
          } else if (el.type === "text" && typeof updatedFormValues[defaultLangCode] === "object") {
            const langValues = updatedFormValues[defaultLangCode];
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

        // Create translations for new text elements (excluding navigation fields)
        const textElements = createdElements.filter((e) => 
          e.key !== "backgroundImage" && 
          e.key !== "addSubNavigation" && 
          e.key !== "dynamicUrl"
        );
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string })[] = [];

        Object.entries(updatedFormValues).forEach(([langCode, langValues]) => {
          if (langCode === "backgroundImage" || langCode === "addSubNavigation" || langCode === "dynamicUrl") return;
          
          const langId = langCodeToIdMap[langCode];
          if (!langId) {
            console.warn(`No language ID found for langCode: ${langCode}`);
            return;
          }
          
          const isPrimaryLanguage = langCode === defaultLangCode;
          
          for (const element of textElements) {
            if (langValues && typeof langValues === "object" && element.key in langValues) {
              const content = langValues[element.key];
              if (content || isPrimaryLanguage) {
                if (isPrimaryLanguage && !content) {
                  console.error(`Required field ${element.key} is empty for primary language ${langCode}`);
                  throw new Error(`Required field ${element.key} is empty for primary language ${langCode}`);
                }
                translations.push({
                  content: content || "",
                  language: langId,
                  contentElement: element._id,
                  isActive: true
                });
              }
            }
          }
        });

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        } else {
          console.warn("No valid translations to save");
        }
      }

      // Show success message
      toast({
        title: existingSubSectionId ? "Product section updated successfully!" : "Product section created successfully!",
        description: "All content has been saved."
      });

      updateState({ hasUnsavedChanges: false });

      // Update form state with saved data
      if (subSectionId) {
        const result = await refetch();
        if (result.data?.data[0]) {
          updateState({ dataLoaded: false });
          dataProcessed.current = false; // Reset the processed flag
          await processProductData(result.data.data[0]);
        }
      } else {
        // For new subsections, manually update form
        const finalUpdatedData = {
          ...updatedFormValues,
          backgroundImage: form.getValues("backgroundImage"),
          addSubNavigation: form.getValues("addSubNavigation"),
          dynamicUrl: form.getValues("dynamicUrl"),
        };

        Object.entries(finalUpdatedData).forEach(([key, value]) => {
          if (key !== "backgroundImage" && key !== "addSubNavigation" && key !== "dynamicUrl") {
            Object.entries(value).forEach(([field, content]) => {
              form.setValue(`${key}.${field}`, content, { shouldDirty: false });
            });
          }
        });

        form.setValue("backgroundImage", finalUpdatedData.backgroundImage, { shouldDirty: false });
        form.setValue("addSubNavigation", finalUpdatedData.addSubNavigation, { shouldDirty: false });
        form.setValue("dynamicUrl", finalUpdatedData.dynamicUrl, { shouldDirty: false });
      }

      return true;
    } catch (error) {
      console.error("Operation failed:", error);
      toast({
        title: existingSubSectionId ? "Error updating Product section" : "Error creating Product section",
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
    subSectionId, 
    toast, 
    bulkUpsertTranslations, 
    contentElements, 
    createContentElement, 
    createSubSection, 
    defaultLangCode, 
    languageIds, 
    processProductData, 
    refetch, 
    updateState, 
    updateSubSection, 
    uploadImage, 
    activeLanguages,
    websiteId,
    slug,
    constructDynamicUrl
  ]);

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: 'Product',
    extraMethods: {
      getImageFile: () => imageFile,
      saveData: handleSave
    },
    extraData: {
      imageFile,
      existingSubSectionId,
      addSubNavigation: form.getValues("addSubNavigation"),
      dynamicUrl: form.getValues("dynamicUrl"),
    }
  });

  const languageCodes = createLanguageCodeMap(activeLanguages);

  return (
    <div className="space-y-6">
      <LoadingDialog 
        isOpen={isSaving} 
        title={existingSubSectionId ? "Updating Product Section" : "Creating Product Section"}
        description="Please wait while we save your changes..."
      />
      
      <Form {...form}>
        {/* Hidden Dynamic URL Field */}
        <FormField
          control={form.control}
          name="dynamicUrl"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

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

     

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              {t('Navigation.NavigationSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="addSubNavigation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      {t('Navigation.NavigationSettings')}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                     {t('Navigation.AddSubNavigation')}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
           {/* Publication Date Section - Moved outside language cards */}
        <Card>
       
          <CardContent className="pt-10">
            <FormField
              control={form.control}
              name={`${defaultLangCode}.date`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium">
                                  {t('editProduct.publicationdate')} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 pl-3 text-left font-normal hover:border-primary transition-colors",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>Select publication date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languageIds.map((langId, index) => {
            const langCode = languageCodes[langId] || langId;
            return (
              <ProductLanguageCard
                key={langId}
                langCode={langCode}
                form={form}
                isFirstLanguage={index === 0}
              />
            );
          })}
        </div>
        
      </Form>
      
      <div className="flex justify-end mt-6">
        <Button 
          type="button" 
          onClick={handleSave} 
          disabled={isSaving}
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
              {existingSubSectionId ? t('editProduct.update') : t('editProduct.save') }
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

ProductForm.displayName = "ProductForm";
export default ProductForm;