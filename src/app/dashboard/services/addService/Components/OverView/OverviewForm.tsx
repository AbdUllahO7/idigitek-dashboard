"use client";

import { forwardRef, useEffect, useState, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { useToast } from "@/src/hooks/use-toast";
import { createLanguageCodeMap } from "../../Utils/language-utils";
import { processAndLoadData } from "../../Utils/load-form-data";
import { Loader2, Save } from "lucide-react";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { OverviewCard } from "./OverviewCard";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";

interface OverviewFormProps {
    languageIds: string[];
    activeLanguages: Array<{ _id: string; languageID: string; }>;
    onDataChange?: (data: any) => void;
    slug?: string;
    ParentSectionId?: string;
    initialData?: {
        description?: string;
    };
}

const OverviewForm = forwardRef<any, OverviewFormProps>((props, ref) => {
    const { 
        languageIds, 
        activeLanguages, 
        onDataChange, 
        slug, 
        ParentSectionId,
        initialData 
    } = props;

    const { websiteId } = useWebsiteContext();

    // Create language code mapping first
    const languageCodes = createLanguageCodeMap(activeLanguages);
    console.log("Language Codes Mapping:", languageCodes);
    console.log("Language IDs:", languageIds);
    console.log("Active Languages:", activeLanguages);

    // Create schema for overview form (description only)
    const createOverviewSchema = (langIds: string[], activeLangs: any[]) => {
        const { z } = require("zod");
        
        const languageSchema = z.object({
            description: z.string().min(1, "Description is required")
        });

        const schemaObject: Record<string, any> = {};
        
        // Use languageCodes mapping to ensure consistency
        langIds.forEach(langId => {
            const langCode = languageCodes[langId] || langId;
            console.log(`Creating schema for langId: ${langId}, langCode: ${langCode}`);
            schemaObject[langCode] = languageSchema;
        });

        console.log("Final Schema Object:", schemaObject);
        return z.object(schemaObject);
    };

    // Create default values for all languages
    const createDefaultValues = () => {
        const defaultValues: Record<string, any> = {};
        languageIds.forEach(langId => {
            const langCode = languageCodes[langId] || langId;
            console.log(`Creating default value for langId: ${langId}, langCode: ${langCode}`);
            defaultValues[langCode] = {
                description: ""
            };
        });
        console.log("Default Values:", defaultValues);
        return defaultValues;
    };

    // Setup form with schema validation and default values
    const formSchema = createOverviewSchema(languageIds, activeLanguages);
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: createDefaultValues() // Add default values
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

    const updateState = useCallback((newState: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...newState }));
    }, []);

    const { isLoadingData, dataLoaded, hasUnsavedChanges, existingSubSectionId, contentElements, isSaving } = state;

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

    // Update reference when onDataChange changes
    useEffect(() => {
        onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    // Process initial data from parent
    const processInitialData = useCallback(() => {
        if (initialData && !dataLoaded) {
            if (initialData.description) {
                // Set for the default language first
                const defaultLangCodeMapped = languageCodes[activeLanguages[0]?._id] || defaultLangCode;
                form.setValue(`${defaultLangCodeMapped}.description`, initialData.description);
            }
            
            updateState({ 
                dataLoaded: true, 
                hasUnsavedChanges: false 
            });
        }
    }, [initialData, dataLoaded, defaultLangCode, form, languageCodes, activeLanguages]);

    // Process overview data from API
    const processOverviewData = useCallback((subsectionData: SubSection | null) => {
        processAndLoadData(
            subsectionData,
            form,
            languageIds,
            activeLanguages,
            {
                groupElements: (elements) => ({
                    'overview': elements.filter(el => el.type === 'text')
                }),
                processElementGroup: (groupId, elements, langId, getTranslationContent) => {
                    const result = {
                        description: ''
                    };
                    
                    elements.filter(el => el.type === 'text').forEach(element => {
                        if (element.name === 'Description') {
                            result.description = getTranslationContent(element, '');
                        }
                    });
                    
                    return result;
                },
                getDefaultValue: () => ({
                    description: ''
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
            processOverviewData(completeSubsectionData.data);
            updateState({ 
                dataLoaded: true,
                isLoadingData: false
            });
            dataProcessed.current = true;
        }
    }, [completeSubsectionData, isLoadingSubsection, slug, processOverviewData]);

    // Form watch effect for unsaved changes
    useEffect(() => {
        if (isLoadingData || !dataLoaded) return;
        
        const subscription = form.watch((value) => {
            console.log("Form value changed:", value);
            updateState({ hasUnsavedChanges: true });
            if (onDataChangeRef.current) {
                onDataChangeRef.current(value);
            }
        });
        
        return () => subscription.unsubscribe();
    }, [form, isLoadingData, dataLoaded, updateState]);

    // Debug effect to monitor form state
    useEffect(() => {
        console.log("Form state changed:");
        console.log("- Is Valid:", form.formState.isValid);
        console.log("- Errors:", form.formState.errors);
        console.log("- Values:", form.getValues());
        console.log("- Dirty Fields:", form.formState.dirtyFields);
    }, [form.formState.errors, form.formState.isValid, form.formState.dirtyFields]);

    // Save handler
    const handleSave = useCallback(async () => {
        console.log("=== SAVE HANDLER CALLED ===");
        
        try {
            console.log("Getting form values...");
            const allFormValues = form.getValues();
            console.log("Form Values:", allFormValues);
            
            console.log("Getting form errors...");
            console.log("Form Errors:", form.formState.errors);
            
            console.log("Triggering form validation...");
            const isValid = await form.trigger();
            console.log("Form is valid:", isValid);
            
            // Check if all required fields have values
            const hasEmptyFields = Object.entries(allFormValues).some(([langCode, values]) => {
                console.log(`Checking ${langCode}:`, values);
                return !values || typeof values !== "object" || !values.description || values.description.trim() === "";
            });
            
            console.log("Has empty fields:", hasEmptyFields);

            if (!isValid || hasEmptyFields) {
                console.log("Validation failed - showing error toast");
                toast({
                    title: "Validation Error", 
                    description: "Please fill all required fields correctly",
                    variant: "destructive"
                });
                return false;
            }

            updateState({ isSaving: true });
            
            // Step 1: Create or update subsection
            let sectionId = existingSubSectionId;
            if (!sectionId) {
                if (!ParentSectionId) {
                    throw new Error("Parent section ID is required to create a subsection");
                }
                
                const subsectionData = {
                    name: "Overview Section",
                    slug: slug || `overview-section-${Date.now()}`,
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

            // Step 2: Map language codes to IDs (reverse mapping)
            const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
                const langCode = languageCodes[lang._id] || lang.languageID;
                acc[langCode] = lang._id;
                return acc;
            }, {});

            // Step 3: Handle existing content or create new content
            if (contentElements.length > 0) {
                // Update translations for existing text elements
                const textElements = contentElements.filter((e) => e.type === "text");
                const translations: (Omit<ContentTranslation, "_id"> & { id?: string; })[] = [];

                Object.entries(allFormValues).forEach(([langCode, values]) => {
                    const langId = langCodeToIdMap[langCode];
                    if (!langId) return;
                    
                    textElements.forEach((element) => {
                        if (element.name === 'Description' && values && typeof values === "object" && 'description' in values) {
                            translations.push({
                                content: values.description,
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
                // Create new content element for description
                const defaultLangCodeMapped = languageCodes[activeLanguages[0]?._id] || activeLanguages[0]?.languageID || 'en';
                const defaultContent = typeof allFormValues[defaultLangCodeMapped] === "object" && allFormValues[defaultLangCodeMapped]
                    ? allFormValues[defaultLangCodeMapped].description || ""
                    : "";

                const elementData = {
                    name: "Description",
                    type: "text",
                    parent: sectionId,
                    isActive: true,
                    order: 0,
                    defaultContent: defaultContent
                };

                const newElement = await createContentElement.mutateAsync(elementData);
                const createdElement = { ...newElement.data, key: "description" };

                updateState({ contentElements: [{ ...createdElement, translations: [] }] });

                // Create translations for new element
                const translations: (Omit<ContentTranslation, "_id"> & { id?: string; })[] = [];
                
                Object.entries(allFormValues).forEach(([langCode, langValues]) => {
                    const langId = langCodeToIdMap[langCode];
                    if (!langId) return;
                    
                    if (langValues && typeof langValues === "object" && 'description' in langValues) {
                        translations.push({
                            content: langValues.description,
                            language: langId,
                            contentElement: createdElement._id,
                            isActive: true
                        });
                    }
                });

                if (translations.length > 0) {
                    await bulkUpsertTranslations.mutateAsync(translations);
                }
            }

            // Show success message
            toast({
                title: existingSubSectionId ? "Overview updated successfully!" : "Overview created successfully!",
                description: "All content has been saved."
            });

            updateState({ hasUnsavedChanges: false });

            // Update form state with saved data
            if (slug) {
                const result = await refetch();
                if (result.data?.data) {
                    updateState({ dataLoaded: false });
                    await processOverviewData(result.data.data);
                }
            } else {
                // For new subsections, manually update form
                Object.entries(allFormValues).forEach(([key, value]) => {
                    if (typeof value === "object" && value && 'description' in value) {
                        form.setValue(`${key}.description`, value.description, { shouldDirty: false });
                    }
                });
            }

            return true;
        } catch (error) {
            console.error("Save operation failed:", error);
            toast({
                title: existingSubSectionId ? "Error updating overview" : "Error creating overview",
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
        processOverviewData, 
        refetch, 
        updateState, 
        updateSubSection, 
        activeLanguages,
        websiteId,
        languageCodes
    ]);

    // Loading state
    if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading overview data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <LoadingDialog 
                isOpen={isSaving} 
                title={existingSubSectionId ? "Updating Overview" : "Creating Overview"}
                description="Please wait while we save your changes..."
            />
            
            <Form {...form}>
                {/* Language Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {languageIds.map((langId) => {
                        const langCode = languageCodes[langId] || langId;
                        return (
                            <OverviewCard 
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
                    onClick={() => {
                        console.log("Save button clicked!");
                        handleSave();
                    }}
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
                            {existingSubSectionId ? "Update Overview" : "Save Overview"}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
});

OverviewForm.displayName = "OverviewForm";
export default OverviewForm;