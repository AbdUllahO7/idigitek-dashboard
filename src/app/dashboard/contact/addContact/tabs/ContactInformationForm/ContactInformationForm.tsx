"use title";

import { forwardRef, useEffect, useState, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import { useToast } from "@/src/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { createContactInformationDefaultValues, createLanguageCodeMap } from "@/src/app/dashboard/services/addService/Utils/Language-default-values";
import { processAndLoadData } from "@/src/app/dashboard/services/addService/Utils/load-form-data";
import { createFormRef } from "@/src/app/dashboard/services/addService/Utils/Expose-form-data";
import { ContactFormProps } from "@/src/api/types/sections/contact/contactSection.type";
import { ContactInformationFormLanguageCard } from "./ContactInformationFormLanguageCard";
import { createContactInformationInfoSchema } from "@/src/app/dashboard/services/addService/Utils/language-specific-schemas";


const ContactInformationForm = forwardRef<any, ContactFormProps>((props, ref) => {
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
  const formSchema = createContactInformationInfoSchema(languageIds, activeLanguages);
  const defaultValues = createContactInformationDefaultValues(languageIds, activeLanguages);
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

  // Data fetching from API
  const { 
    data: completeSubsectionData, 
    isLoading: isLoadingSubsection, 
    refetch 
  } = useGetCompleteBySlug(slug || '', Boolean(slug));

  console.log("completeSubsectionData", completeSubsectionData)

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
      

      
      updateState({ 
        dataLoaded: true, 
        hasUnsavedChanges: false 
      });
    }
  }, [initialData, dataLoaded, defaultLangCode, form]);

  // Process contact data from API
  const processContactData = useCallback((subsectionData: SubSection | null) => {
  processAndLoadData(
    subsectionData,
    form,
    languageIds,
    activeLanguages,
    {
      groupElements: (elements) => ({
        'contact': elements.filter(el => el.type === 'text' || (el.name === 'Background Image' && el.type === 'image'))
      }),
      processElementGroup: (groupId, elements, langId, getTranslationContent) => {
      const elementKeyMap: Record<string, keyof typeof result> = {
          Title: "title",
          Description: "description",
          Location: "location", 
          PhoneText: "phoneText",
          PhoneTextValue: "phoneTextValue",
          Email: "email",
          EmailValue: "emailValue",
          Office: "office",
          OfficeValue: "officeValue",
        };

      const result = {
        title: "",
        description: "",
        location: "", // New field
        phoneText: "",
        phoneTextValue: "",
        email: "",
        emailValue: "",
        office: "",
        officeValue: "",
      };

        elements
          .filter((el) => el.type === "text")
          .forEach((element) => {
            const key = elementKeyMap[element.name];
            if (key) {
              result[key] = getTranslationContent(element, "") || ""; // Fallback to empty string
            }
          });

        return result;
      },
      getDefaultValue: () => ({
        title: '',
        description: '', 
        phoneText: '',
        phoneTextValue: '', 
        email: '',
        emailValue: '', 
        office: '',
        officeValue: '', 
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
      processContactData(completeSubsectionData.data);
      updateState({ 
        dataLoaded: true,
        isLoadingData: false
      });
      dataProcessed.current = true;
    }
  }, [completeSubsectionData, isLoadingSubsection, slug, processContactData]);

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

  // Save handler with optimized process
  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    console.log("Form Errors:", form.formState.errors); // Add this to debug validation errors
          const allFormValues = form.getValues();
        console.log(allFormValues)
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

      let sectionId = existingSubSectionId;
      if (!sectionId) {
        if (!ParentSectionId) {
          throw new Error("Parent section ID is required to create a subsection");
        }

        const subsectionData = {
          name: "Contact Section",
          slug: slug || `contact-section-${Date.now()}`,
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

      const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang.languageID] = lang._id;
        return acc;
      }, {});

      if (contentElements.length > 0) {
        const textElements = contentElements.filter((e) => e.type === "text");
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string; })[] = [];
        const elementNameToKeyMap: Record<string, keyof typeof allFormValues[string]> = {
            'Title': 'title',
            'Description': 'description', 
            'PhoneText': 'phoneText',
            'PhoneTextValue': 'phoneTextValue',
            'Email': 'email',
            'EmailValue': 'emailValue', 
            'Office': 'office',
            'OfficeValue': 'officeValue', 
        };

        Object.entries(allFormValues).forEach(([langCode, values]) => {
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
        const elementTypes = [
          { type: "text", key: "title", name: "Title" },
          { type: "text", key: "description", name: "Description" }, 
          { type: "text", key: "location", name: "Location" }, 
          { type: "text", key: "phoneText", name: "PhoneText" },
          { type: "text", key: "phoneTextValue", name: "PhoneTextValue" }, 
          { type: "text", key: "email", name: "Email" },
          { type: "text", key: "emailValue", name: "EmailValue" }, 
          { type: "text", key: "office", name: "Office" },
          { type: "text", key: "officeValue", name: "OfficeValue" }, 
        ];

        const createdElements = [];
        for (const [index, el] of elementTypes.entries()) {
          let defaultContent = "";
          if (el.type === "text" && typeof allFormValues[defaultLangCode] === "object") {
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

        const textElements = createdElements.filter((e) => e.key !== "backgroundImage");
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string; })[] = [];

        Object.entries(allFormValues).forEach(([langCode, langValues]) => {
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

      toast({
        title: existingSubSectionId ? "Contact section updated successfully!" : "Contact section created successfully!",
        description: "All content has been saved."
      });

      updateState({ hasUnsavedChanges: false });

      if (slug) {
        const result = await refetch();
        if (result.data?.data) {
          updateState({ dataLoaded: false });
          await processContactData(result.data.data);
        }
      }

      return true;
    } catch (error) {
      console.error("Operation failed:", error);
      toast({
        title: existingSubSectionId ? "Error updating contact section" : "Error creating contact section",
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
    ParentSectionId,
    slug,
    toast,
    bulkUpsertTranslations,
    contentElements,
    createContentElement,
    createSubSection,
    defaultLangCode,
    languageIds,
    processContactData,
    refetch,
    updateState,
    updateSubSection,
    activeLanguages
  ]);

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: 'Contact',
    extraMethods: {
      saveData: handleSave
    },
    extraData: {
      existingSubSectionId
    }
  });

  const languageCodes = createLanguageCodeMap(activeLanguages);

  // Loading state
  if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading contact section data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingDialog 
        isOpen={isSaving} 
        title={existingSubSectionId ? "Updating Contact Section" : "Creating Contact Section"}
        description="Please wait while we save your changes..."
      />
      
      <Form {...form}>
        
        {/* Language Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languageIds.map((langId, index) => {
          const langCode = languageCodes[langId] || langId;
          return (
            <ContactInformationFormLanguageCard 
              key={langId}
              langCode={langCode}
              form={form}
              isFirstLanguage={index === 0} // Only pass true for the first language
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
              {existingSubSectionId ? "Update Contact Content" : "Save Contact Content"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

ContactInformationForm.displayName = "ContactInformationForm";
export default ContactInformationForm;