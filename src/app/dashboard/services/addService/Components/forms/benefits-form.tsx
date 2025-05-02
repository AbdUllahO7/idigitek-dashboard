"use client"

import { forwardRef, useImperativeHandle, useEffect, useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Save, 
  Trash2, 
  Plus, 
  AlertTriangle, 

  Loader2
} from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-conent-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-conent-translitions"
import { useToast } from "@/src/hooks/use-toast"
import { IconComponent, LoadingDialog } from "./MainSectionComponents"
import { Language } from "../../types/HeroFor.types"
import { BenefitCount, BenefitItem, BenefitsFormProps, BenefitsFormRef, FormValues, SubsectionData, Translation } from "../../types/BenefitsForm.types"
import { ContentElement } from "@/src/api/types"
import { createBenefitsSchema } from "../../Utils/language-specifi-schemas"

// Define interfaces for component data structures
// Available icons
const availableIcons = [
  "Car",
  "MonitorSmartphone",
  "Settings",
  "CreditCard",
  "Clock",
  "MessageSquare",
  "LineChart",
  "Headphones",
] as const;




const createDefaultValues = (languageIds: string[], activeLanguages: Language[]): FormValues => {
  const defaultValues: FormValues = {};

  const languageCodeMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
    acc[lang._id] = lang.languageID;
    return acc;
  }, {});

  languageIds.forEach((langId) => {
    const langCode = languageCodeMap[langId] || langId;
    defaultValues[langCode] = [
      {
        icon: "Clock",
        title: "",
        description: "",
      },
    ];
  });

  return defaultValues;
};

const BenefitsForm = forwardRef<BenefitsFormRef, BenefitsFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    // Create schema with proper type safety
    const formSchema = createBenefitsSchema(languageIds, activeLanguages);
    type FormSchemaType = z.infer<typeof formSchema>;
    
    const [isLoadingData, setIsLoadingData] = useState<boolean>(!slug);
    const [dataLoaded, setDataLoaded] = useState<boolean>(!slug);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState<boolean>(false);
    const [benefitCountMismatch, setBenefitCountMismatch] = useState<boolean>(false);
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null);
    const [contentElements, setContentElements] = useState<ContentElement[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { toast } = useToast();

    const form = useForm<FormSchemaType>({
      resolver: zodResolver(formSchema),
      defaultValues: createDefaultValues(languageIds, activeLanguages) as z.infer<typeof formSchema>,
    });

    // Expose form data to parent component
    useImperativeHandle(ref, () => ({
      getFormData: async () => {
        const isValid = await form.trigger();
        if (!isValid) {
          throw new Error("Benefits form has validation errors");
        }
        return form.getValues();
      },
      form: form,
      hasUnsavedChanges,
      resetUnsavedChanges: () => setHasUnsavedChanges(false),
      existingSubSectionId,
      contentElements,
    }));

    const onDataChangeRef = useRef<((data: FormValues) => void) | undefined>(onDataChange);
    useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

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

    // Query for complete subsection data by slug if provided
    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", Boolean(slug));

    // Check if all languages have the same number of benefits
    const validateBenefitCounts = (): boolean => {
      // Get current form values directly
      const values = form.getValues();
      
      // Filter out any non-array values that might be causing issues
      const validLangEntries = Object.entries(values).filter(
        ([_, langBenefits]) => Array.isArray(langBenefits)
      );
      
      if (validLangEntries.length <= 1) {
        // If there's only one or zero languages, no mismatch is possible
        setBenefitCountMismatch(false);
        return true;
      }
      
      // Get counts of benefits for each language
      const counts = validLangEntries.map(
        ([_, langBenefits]) => langBenefits.length
      );
      
      // Check if all counts are the same as the first count
      const firstCount = counts[0];
      const allEqual = counts.every(count => count === firstCount);
      
      console.log("Benefit counts validation:", { counts, allEqual, validLangEntries: validLangEntries.length });
      
      // Update the state immediately
      setBenefitCountMismatch(!allEqual);
      
      return allEqual;
    };

    // Function to process and load data into the form
    const processAndLoadData = (subsectionData: SubsectionData): void => {
      if (!subsectionData) return;

      try {
        console.log("Processing subsection data:", subsectionData);
        setExistingSubSectionId(subsectionData._id);

        // Check if we have elements directly in the subsection data (API response structure)
        const elements = subsectionData.elements || subsectionData.contentElements || [];
        
        if (elements.length > 0) {
          // Store the content elements for later use
          setContentElements(elements);

          // Create a mapping of languages for easier access
          const langIdToCodeMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
            acc[lang._id] = lang.languageID;
            return acc;
          }, {});

          // Group content elements by benefit number
          const benefitGroups: Record<string, ContentElement[]> = {};

          elements.forEach((element) => {
            // Extract benefit number from element name (e.g., "Benefit 1 - Title")
            const match = element.name.match(/Benefit (\d+)/i);
            if (match) {
              const benefitNumber = parseInt(match[1], 10);
              if (!benefitGroups[benefitNumber]) {
                benefitGroups[benefitNumber] = [];
              }
              benefitGroups[benefitNumber].push(element);
            }
          });

          console.log("Benefit groups:", benefitGroups);

          // Initialize form values for each language
          const languageValues: Record<string, BenefitItem[]> = {};

          // Initialize all languages with empty arrays
          languageIds.forEach(langId => {
            const langCode = langIdToCodeMap[langId] || langId;
            languageValues[langCode] = [];
          });

          // Process each benefit group
          Object.entries(benefitGroups).forEach(([benefitNumber, elements]) => {
            const iconElement = elements.find(el => el.name.includes("Icon"));
            const titleElement = elements.find(el => el.name.includes("Title"));
            const descriptionElement = elements.find(el => el.name.includes("Description"));

            if (titleElement && descriptionElement) {
              // For each language, create a benefit entry
              languageIds.forEach(langId => {
                const langCode = langIdToCodeMap[langId] || langId;

                // Find translations for this language
                let titleTranslation;
                let descriptionTranslation;

                // Check for translations with different data structures
                if (titleElement.translations) {
                  titleTranslation = titleElement.translations.find((t) => {
                    // Handle both nested and direct language references
                    if (t.language && typeof t.language === 'object' && 'language' in t && '_id' in t.language) {
                      return t.language._id === langId;
                    } else {
                      return t.language === langId;
                    }
                  });
                }

                if (descriptionElement.translations) {
                  descriptionTranslation = descriptionElement.translations.find((t) => {
                    // Handle both nested and direct language references
                    if (t.language && typeof t.language === 'object' && 'language' in t && '_id' in t.language) {
                      return t.language._id === langId;
                    } else {
                      return t.language === langId;
                    }
                  });
                }

                // Use translation content or default content
                const title = titleTranslation?.content || titleElement.defaultContent || "";
                const description = descriptionTranslation?.content || descriptionElement.defaultContent || "";

                // Get icon value
                const icon = iconElement?.defaultContent || "Clock";

                // Add to language values
                languageValues[langCode].push({ icon, title, description });
              });
            }
          });

          console.log("Form values after processing:", languageValues);

          // Set all values in form
          Object.entries(languageValues).forEach(([langCode, benefits]) => {
            if (benefits.length > 0) {
              form.setValue(langCode as any, benefits);
            } else {
              // Ensure at least one empty benefit if none were found
              form.setValue(langCode as any, [{ icon: "Clock", title: "", description: "" }]);
            }
          });
        }

        setDataLoaded(true);
        setHasUnsavedChanges(false);

        // Validate benefit counts after loading data
        validateBenefitCounts();
      } catch (error) {
        console.error("Error processing benefits data:", error);
        toast({
          title: "Error loading benefits data",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    // Effect to populate form with existing data from complete subsection
    useEffect(() => {
      // Skip this effect entirely if no slug is provided
      if (!slug) {
        return;
      }

      if (dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }

      setIsLoadingData(true);
      processAndLoadData(completeSubsectionData.data as SubsectionData);
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, form, activeLanguages, languageIds, slug]);

    // Track form changes, but only after initial data is loaded
    useEffect(() => {
      if (isLoadingData || !dataLoaded) return;

      const subscription = form.watch((value) => {
        setHasUnsavedChanges(true);
        validateBenefitCounts();
        if (onDataChangeRef.current) {
          onDataChangeRef.current(value as FormValues);
        }
      });
      return () => subscription.unsubscribe();
    }, [form, isLoadingData, dataLoaded]);

    // Function to add a new benefit
    const addBenefit = (langCode: string): void => {
      const currentBenefits = form.getValues()[langCode] || [];
      
      // Update the form
      form.setValue(langCode as any, [
        ...currentBenefits,
        {
          icon: "Clock",
          title: "",
          description: "",
        },
      ]);
      
      // Force update the form to ensure React re-renders
      form.trigger(langCode as any);
      
      // Force immediate validation after adding a benefit
      setTimeout(() => {
        const isValid = validateBenefitCounts();
        console.log(`Added benefit to ${langCode}, mismatch: ${!isValid}`);
        setBenefitCountMismatch(!isValid);
      }, 0);
    };

    // Function to remove a benefit
    const removeBenefit = (langCode: string, index: number): void => {
      const currentBenefits = form.getValues()[langCode] || [];
      if (currentBenefits.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one benefit",
          variant: "destructive",
        });
        return;
      }

      // If we have existing content elements and a subsection ID, delete the elements from the database
      if (existingSubSectionId && contentElements.length > 0) {
        try {
          // Find the benefit number (1-based index)
          const benefitNumber = index + 1;

          // Find elements associated with this benefit
          const benefitElements = contentElements.filter((element) => {
            const match = element.name.match(/Benefit (\d+)/i);
            return match && Number.parseInt(match[1]) === benefitNumber;
          });

          if (benefitElements.length > 0) {
            // Delete each element
            benefitElements.forEach(async (element) => {
              try {
                await deleteContentElement.mutateAsync(element._id);
                console.log(`Deleted content element: ${element.name}`);
              } catch (error) {
                console.error(`Failed to delete content element ${element.name}:`, error);
              }
            });

            // Update the contentElements state to remove the deleted elements
            setContentElements((prev) =>
              prev.filter((element) => {
                const match = element.name.match(/Benefit (\d+)/i);
                return !(match && Number.parseInt(match[1]) === benefitNumber);
              }),
            );

            toast({
              title: "Benefit deleted",
              description: `Benefit ${benefitNumber} has been deleted from the database`,
            });
          }

          // Renumber the remaining benefit elements in the database
          const remainingElements = contentElements.filter((element) => {
            const match = element.name.match(/Benefit (\d+)/i);
            return match && Number.parseInt(match[1]) > benefitNumber;
          });

          // Update the names and orders of the remaining elements
          remainingElements.forEach(async (element) => {
            const match = element.name.match(/Benefit (\d+)/i);
            if (match) {
              const oldNumber = Number.parseInt(match[1]);
              const newNumber = oldNumber - 1;
              const newName = element.name.replace(`Benefit ${oldNumber}`, `Benefit ${newNumber}`);
              const newOrder = element.order - 3; // Assuming icon, title, and description are consecutive

              try {
                await updateContentElement.mutateAsync({
                  id: element._id,
                  data: {
                    name: newName,
                    order: newOrder,
                  },
                });
                console.log(`Updated element ${element.name} to ${newName}`);
              } catch (error) {
                console.error(`Failed to update element ${element.name}:`, error);
              }
            }
          });
        } catch (error) {
          console.error("Error removing benefit elements:", error);
          toast({
            title: "Error removing benefit",
            description: "There was an error removing the benefit from the database",
            variant: "destructive",
          });
        }
      }
      const updatedBenefits = [...currentBenefits];
      updatedBenefits.splice(index, 1);
      form.setValue(langCode as any, updatedBenefits);
      
      // Force update the form to ensure React re-renders
      form.trigger(langCode as any);
      
      // Force immediate validation after removing a benefit
      setTimeout(() => {
        const isValid = validateBenefitCounts();
        console.log(`Removed benefit from ${langCode}, mismatch: ${!isValid}`);
        setBenefitCountMismatch(!isValid);
      }, 0);
    };

    // Function to get benefit counts by language
    const getBenefitCountsByLanguage = (): BenefitCount[] => {
      const values = form.getValues();
      return Object.entries(values).map(([langCode, benefits]) => ({
        language: langCode,
        count: Array.isArray(benefits) ? benefits.length : 0,
      }));
    };

    const handleSave = async (): Promise<void> => {
      const isValid = await form.trigger();
      const hasEqualBenefitCounts = validateBenefitCounts();
    
      if (!hasEqualBenefitCounts) {
        setIsValidationDialogOpen(true);
        return;
      }
    
      if (!isValid) return;
    
      setIsSaving(true);
      setIsLoadingData(true);
      try {
        // Get current form values before any processing
        const allFormValues = form.getValues();
        console.log("Form values at save:", allFormValues);
    
        let sectionId = existingSubSectionId;
    
        // Create or update logic here
        if (!existingSubSectionId) {
          // Create new subsection
          const subsectionData = {
            name: "Benefits Section",
            slug: slug || `benefits-section-${Date.now()}`, // Use provided slug or generate one
            description: "Benefits section for the website",
            isActive: true,
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
          };
    
          const newSubSection = await createSubSection.mutateAsync(subsectionData);
          sectionId = newSubSection.data._id;
          // Save the ID for future reference
          setExistingSubSectionId(sectionId);
        }
    
        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID");
        }
    
        // Process content elements
        // Get all benefit data from form
        console.log("Processing form values for content elements:", allFormValues);
        
        // Get language mapping for translations
        const langCodeToIdMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {});
        
        // If we're updating existing content elements
        if (existingSubSectionId && contentElements.length > 0) {
          console.log("Updating existing content elements");
          
          // Process each language
          for (const [langCode, benefits] of Object.entries(allFormValues)) {
            // Skip if not an array (might be other form properties)
            if (!Array.isArray(benefits)) continue;
            
            const langId = langCodeToIdMap[langCode];
            if (!langId) continue;
            
            // Update each benefit for this language
            for (let i = 0; i < benefits.length; i++) {
              const benefitIndex = i + 1;
              const benefit = benefits[i] as BenefitItem;
              
              // Find elements for this benefit
              const iconElementName = `Benefit ${benefitIndex} - Icon`;
              const titleElementName = `Benefit ${benefitIndex} - Title`;
              const descElementName = `Benefit ${benefitIndex} - Description`;
              
              // Find or create elements
              let iconElement = contentElements.find(el => el.name === iconElementName);
              let titleElement = contentElements.find(el => el.name === titleElementName);
              let descElement = contentElements.find(el => el.name === descElementName);
              
              // Create elements if they don't exist (new benefit)
              if (!iconElement) {
                console.log(`Creating new icon element: ${iconElementName}`);
                const newElement = await createContentElement.mutateAsync({
                  name: iconElementName,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: (benefitIndex - 1) * 3,
                  defaultContent: benefit.icon,
                });
                iconElement = newElement.data;
                // Add to content elements array
                setContentElements(prev => [...prev, iconElement]);
              } else {
                // Update existing icon element
                await updateContentElement.mutateAsync({
                  id: iconElement._id,
                  data: {
                    defaultContent: benefit.icon,
                  },
                });
              }
              
              // Create or update title element
              if (!titleElement) {
                console.log(`Creating new title element: ${titleElementName}`);
                const newElement = await createContentElement.mutateAsync({
                  name: titleElementName,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: (benefitIndex - 1) * 3 + 1,
                  defaultContent: "",
                });
                titleElement = newElement.data;
                setContentElements(prev => [...prev, titleElement]);
              }
              
              // Create or update description element
              if (!descElement) {
                console.log(`Creating new description element: ${descElementName}`);
                const newElement = await createContentElement.mutateAsync({
                  name: descElementName,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: (benefitIndex - 1) * 3 + 2,
                  defaultContent: "",
                });
                descElement = newElement.data;
                setContentElements(prev => [...prev, descElement]);
              }
              
              // Create translations for title and description
              const translations: Translation[] = [];
              
              // Only add translations if element and language exist
              if (titleElement && langId) {
                translations.push({
                  content: benefit.title,
                  language: langId,
                  contentElement: titleElement._id,
                  isActive: true,
                });
              }
              
              if (descElement && langId) {
                translations.push({
                  content: benefit.description,
                  language: langId,
                  contentElement: descElement._id,
                  isActive: true,
                });
              }
              
              // Bulk upsert translations if we have any
              if (translations.length > 0) {
                console.log(`Upserting ${translations.length} translations for benefit ${benefitIndex}`);
                await bulkUpsertTranslations.mutateAsync(translations);
              }
            }
          }
        } else {
          // Create new content elements for new subsection
          console.log("Creating new content elements for new subsection");
          
          // Get the benefit count (should be the same for all languages)
          const firstLangCode = Object.keys(allFormValues).find(key => Array.isArray(allFormValues[key]));
          const benefits = firstLangCode ? allFormValues[firstLangCode] as BenefitItem[] : [];
          
          if (!benefits || !Array.isArray(benefits) || benefits.length === 0) {
            throw new Error("No benefits found in form values");
          }
          
          const benefitCount = benefits.length;
          console.log(`Creating elements for ${benefitCount} benefits`);
          
          // Create all elements first
          const createdElements: ContentElement[] = [];
          
          // For each benefit, create icon, title, and description elements
          for (let i = 0; i < benefitCount; i++) {
            const benefitIndex = i + 1;
            const defaultIcon = benefits[i].icon || "Clock";
            
            // Create icon element
            const iconElement = await createContentElement.mutateAsync({
              name: `Benefit ${benefitIndex} - Icon`,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 3,
              defaultContent: defaultIcon,
            });
            createdElements.push(iconElement.data);
            
            // Create title element
            const titleElement = await createContentElement.mutateAsync({
              name: `Benefit ${benefitIndex} - Title`,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 3 + 1,
              defaultContent: "",
            });
            createdElements.push(titleElement.data);
            
            // Create description element
            const descElement = await createContentElement.mutateAsync({
              name: `Benefit ${benefitIndex} - Description`,
              type: "text",
              parent: sectionId,
              isActive: true,
              order: i * 3 + 2,
              defaultContent: "",
            });
            createdElements.push(descElement.data);
          }
          
          // Update content elements state
          setContentElements(createdElements);
          
          // Create translations for all languages
          const translations: Translation[] = [];
          
          // Process each language's benefits
          for (const [langCode, langBenefits] of Object.entries(allFormValues)) {
            if (!Array.isArray(langBenefits)) continue;
            
            const langId = langCodeToIdMap[langCode];
            if (!langId) continue;
            
            // Process each benefit for this language
            for (let i = 0; i < langBenefits.length; i++) {
              const benefitIndex = i + 1;
              const benefit = langBenefits[i] as BenefitItem;
              
              // Find the title and description elements we just created
              const titleElement = createdElements.find(el => el.name === `Benefit ${benefitIndex} - Title`);
              const descElement = createdElements.find(el => el.name === `Benefit ${benefitIndex} - Description`);
              
              // Add translations for title and description
              if (titleElement) {
                translations.push({
                  content: benefit.title,
                  language: langId,
                  contentElement: titleElement._id,
                  isActive: true,
                });
              }
              
              if (descElement) {
                translations.push({
                  content: benefit.description,
                  language: langId,
                  contentElement: descElement._id,
                  isActive: true,
                });
              }
            }
          }
          
          // Bulk upsert all translations
          if (translations.length > 0) {
            console.log(`Upserting ${translations.length} translations for all benefits`);
            await bulkUpsertTranslations.mutateAsync(translations);
          }
        }
    
        toast({
          title: existingSubSectionId
            ? "Benefits section updated successfully!"
            : "Benefits section created successfully!",
        });
    
        // Refresh data immediately after save
        if (slug) {
          try {
            // First set loading state to show loading indicator
            setIsLoadingData(true);
            setDataLoaded(false);
            
            // Refetch data
            const result = await refetch();
            
            if (result.data?.data) {
              console.log("Refetched data:", result.data.data);
              
              // Clear form cache first
              form.reset();
              
              // Process and load the new data
              processAndLoadData(result.data.data as SubsectionData);
            } else {
              console.warn("No data returned from refetch");
            }
          } catch (refetchError) {
            console.error("Error refetching data:", refetchError);
            toast({
              title: "Error refreshing data",
              description: "Could not refresh the data after saving",
              variant: "destructive",
            });
          }
        }
    
        // Reset form state
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Operation failed:", error);
        toast({
          title: existingSubSectionId ? "Error updating benefits section" : "Error creating benefits section",
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        setIsLoadingData(false);
        setIsSaving(false);
      }
    };

    // Get language codes for display
    const languageCodes = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
      acc[lang._id] = lang.languageID;
      return acc;
    }, {});

    useEffect(() => {
      // Force validation whenever the form is changed
      const subscription = form.watch(() => {
        if (dataLoaded && !isLoadingData) {
          validateBenefitCounts();
        }
      });
      
      return () => subscription.unsubscribe();
    }, [dataLoaded, isLoadingData]);

    return (
      <div className="space-y-6">
        {/* Loading Dialog */}
        <LoadingDialog 
          isOpen={isSaving} 
          title={existingSubSectionId ? "Updating Benefits" : "Creating Benefits"}
          description="Please wait while we save your changes..."
        />
        
        {slug && (isLoadingData || isLoadingSubsection) && !dataLoaded ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p className="text-muted-foreground">Loading benefits section data...</p>
          </div>
        ) : (
          <Form {...form}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {languageIds.map((langId) => {
                const langCode = languageCodes[langId] || langId
                return (
                  <Card key={langId} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
                          {langCode}
                        </span>
                        Benefits Section
                      </CardTitle>
                      <CardDescription>Manage benefits content for {langCode.toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.watch(langCode)?.map((_, index) => (
                        <Card key={index} className="border border-muted">
                          <CardHeader className="p-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Benefit {index + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeBenefit(langCode, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 space-y-4">
                            <FormField
                              control={form.control}
                              name={`${langCode}.${index}.icon`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Icon</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select an icon">
                                          <div className="flex items-center">
                                            <span className="mr-2"><IconComponent iconName={field.value} /></span>
                                            {field.value}
                                          </div>
                                        </SelectValue>
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {availableIcons.map((icon) => (
                                        <SelectItem key={icon} value={icon}>
                                          <div className="flex items-center">
                                            <span className="mr-2"><IconComponent iconName={icon} /></span>
                                            {icon}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`${langCode}.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`${langCode}.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Enter description" className="min-h-[80px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}

                      <Button type="button" variant="outline" size="sm" onClick={() => addBenefit(langCode)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Benefit
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Form>
        )}
        <div className="flex justify-end mt-6">
          {benefitCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Each language must have the same number of benefits</span>
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
                {existingSubSectionId ? "Update Benefits" : "Save Benefits"}
              </>
            )}
          </Button>
        </div>

        {/* Validation Dialog */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Benefit Count Mismatch</DialogTitle>
              <DialogDescription>
                <div className="mt-4 mb-4">
                  Each language must have the same number of benefits before saving. Please add or remove benefits to
                  ensure all languages have the same count:
                </div>
                <ul className="list-disc pl-6 space-y-1">
                  {getBenefitCountsByLanguage().map(({ language, count }) => (
                    <li key={language}>
                      <span className="font-semibold uppercase">{language}</span>: {count} benefits
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

BenefitsForm.displayName = "BenefitsForm"

export default BenefitsForm