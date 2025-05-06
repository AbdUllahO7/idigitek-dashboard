"use client"

import { forwardRef, useEffect, useState, useRef,  useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Save,  AlertTriangle, Loader2 } from "lucide-react"
import { Form} from "@/src/components/ui/form"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-conent-translitions"
import { useToast } from "@/src/hooks/use-toast"
import DeleteServiceDialog from "@/src/components/DeleteServiceDialog"
import { createFaqSchema } from "../../Utils/language-specifi-schemas"
import { createFaqDefaultValues} from "../../Utils/Language-default-values"
import { createFormRef } from "../../Utils/Expose-form-data"
import { processAndLoadData } from "../../Utils/load-form-data"

import { LanguageCard } from "./LanguageCard"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import { FaqFormProps } from "@/src/api/types/sections/service/serviceSections.types"
import { SubSection } from "@/src/api/types/hooks/section.types"
import { createLanguageCodeMap } from "../../Utils/language-utils"




const FaqForm = forwardRef<any, FaqFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    // Memoize schema and default values to prevent unnecessary recalculations
    const formSchema = useMemo(() => 
      createFaqSchema(languageIds, activeLanguages), 
      [languageIds, activeLanguages]
    );
    
    const defaultValues = useMemo(() => 
      createFaqDefaultValues(languageIds, activeLanguages), 
      [languageIds, activeLanguages]
    );

    const [isLoadingData, setIsLoadingData] = useState(!slug);
    const [dataLoaded, setDataLoaded] = useState(!slug);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [faqCountMismatch, setFaqCountMismatch] = useState(false);
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null);
    const [contentElements, setContentElements] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<{ langCode: string; index: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { toast } = useToast();

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: defaultValues,
    });

    // Use ref for callback to prevent unnecessary effect reruns
    const onDataChangeRef = useRef(onDataChange);
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
    const bulkUpsertTranslations = useBulkUpsertTranslations();
    const deleteContentElement = useDeleteContentElement();

    // Query for complete subsection data by slug if provided
    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", !slug);

    // Check if all languages have the same number of FAQs
    const validateFaqCounts = useRef(() => {
      const values = form.getValues();
      const counts = Object.values(values).map((langFaqs) => 
        (Array.isArray(langFaqs) ? langFaqs.length : 0)
      );

      // Check if all counts are the same
      const allEqual = counts.every((count) => count === counts[0]);
      setFaqCountMismatch(!allEqual);

      return allEqual;
    }).current;

    // Function to process and load data into the form
    const processFaqData = useRef((subsectionData: SubSection | null) => {
      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          // Group elements by FAQ number
          groupElements: (elements) => {
            const faqGroups = {} as any;
            elements.forEach((element) => {
              const match = element.name.match(/FAQ (\d+)/i);
              if (match) {
                const faqNumber = Number.parseInt(match[1]);
                if (!faqGroups[faqNumber]) {
                  faqGroups[faqNumber] = [];
                }
                faqGroups[faqNumber].push(element);
              }
            });
            return faqGroups;
          },
          
          // Process an FAQ group for a language
          processElementGroup: (faqNumber, elements, langId, getTranslationContent) => {
            const questionElement = elements.find((el) => el.name.includes("Question"));
            const answerElement = elements.find((el) => el.name.includes("Answer"));
            
            if (questionElement && answerElement) {
              const question = getTranslationContent(questionElement, "");
              const answer = getTranslationContent(answerElement, "");
              
              return { question, answer };
            }
            
            return { question: "", answer: "" };
          },
          
          // Default value for FAQs
          getDefaultValue: () => [{
            question: "",
            answer: ""
          }]
        },
        {
          setExistingSubSectionId,
          setContentElements,
          setDataLoaded,
          setHasUnsavedChanges,
          setIsLoadingData,
          validateCounts: validateFaqCounts
        }
      );
    }).current;

    // Effect to populate form with existing data from complete subsection
    useEffect(() => {
      // Skip this effect entirely if no slug is provided
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }

      setIsLoadingData(true);
      processFaqData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, slug, processFaqData]);

    // Track form changes, but only after initial data is loaded, with debounce
    useEffect(() => {
      if (isLoadingData || !dataLoaded) return;

      const timeoutId = setTimeout(() => {
        const subscription = form.watch((value) => {
          setHasUnsavedChanges(true);
          validateFaqCounts();
          if (onDataChangeRef.current) {
            onDataChangeRef.current(value);
          }
        });
        return () => subscription.unsubscribe();
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [form, isLoadingData, dataLoaded, validateFaqCounts]);

    // Function to add a new FAQ
    const addFaq = (langCode: string) => {
      const currentFaqs = form.getValues()[langCode] || [];
      form.setValue(langCode, [
        ...currentFaqs,
        {
          question: "",
          answer: "",
        },
      ], {
        shouldDirty: true,
        shouldValidate: true,
      });
      
      toast({
        title: "FAQ added",
        description: "A new FAQ has been added to the section.",
      });
    };

    // Function to confirm FAQ deletion - opens the dialog
  const confirmRemoveFaq = (langCode: string, index: any) => {
    const currentFaqs = form.getValues()[langCode] || [];
    if (currentFaqs.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one FAQ",
        variant: "destructive",
      });
      return;
    }
    
    // Set the FAQ to delete and open the dialog
    setFaqToDelete({ langCode  , index });
    setDeleteDialogOpen(true);
  };
  
  // Function to execute the actual FAQ removal - called from dialog
  const removeFaq = async () => {
    if (!faqToDelete) return;
    
    const { langCode, index } = faqToDelete;
    setIsDeleting(true);
    
    try {
      // If we have existing content elements and a subsection ID, delete the elements from the database
      if (existingSubSectionId && contentElements.length > 0) {
        // Find the FAQ number (1-based index)
        const faqNumber = index + 1;

        // Find elements associated with this FAQ
        const faqElements = contentElements.filter((element) => {
          const match = element.name.match(/FAQ (\d+)/i);
          return match && Number.parseInt(match[1]) === faqNumber;
        });

        if (faqElements.length > 0) {
          // Delete each element in parallel for better performance
          await Promise.all(faqElements.map(async (element) => {
            try {
              await deleteContentElement.mutateAsync(element._id);
              console.log(`Deleted content element: ${element.name}`);
            } catch (error) {
              console.error(`Failed to delete content element ${element.name}:`, error);
            }
          }));

          // Update the contentElements state to remove the deleted elements
          setContentElements((prev) =>
            prev.filter((element) => {
              const match = element.name.match(/FAQ (\d+)/i);
              return !(match && Number.parseInt(match[1]) === faqNumber);
            }),
          );

          toast({
            title: "FAQ deleted",
            description: `FAQ ${faqNumber} has been deleted from the database`,
          });
        }

        // Renumber the remaining FAQ elements in the database
        const remainingElements = contentElements.filter((element) => {
          const match = element.name.match(/FAQ (\d+)/i);
          return match && Number.parseInt(match[1]) > faqNumber;
        });

        // Update the names and orders of the remaining elements in parallel
        if (remainingElements.length > 0) {
          await Promise.all(remainingElements.map(async (element) => {
            const match = element.name.match(/FAQ (\d+)/i);
            if (match) {
              const oldNumber = Number.parseInt(match[1]);
              const newNumber = oldNumber - 1;
              const newName = element.name.replace(`FAQ ${oldNumber}`, `FAQ ${newNumber}`);
              const newOrder = element.order - 2; // Assuming question and answer are consecutive

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
          }));
        }
      }

      // Update the form state for all languages to keep counts consistent
      Object.keys(form.getValues()).forEach((currentLangCode) => {
        const faqs = form.getValues()[currentLangCode] || [];
        
        // Only remove if this language has enough FAQs
        if (faqs.length > index) {
          const updatedFaqs = [...faqs];
          updatedFaqs.splice(index, 1);
          form.setValue(currentLangCode, updatedFaqs, { 
            shouldDirty: true, 
            shouldValidate: true 
          });
        }
      });
      
      // Re-validate counts
      validateFaqCounts();
    } catch (error) {
      console.error("Error removing FAQ elements:", error);
      toast({
        title: "Error removing FAQ",
        description: "There was an error removing the FAQ from the database",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

    // Function to get FAQ counts by language
    const getFaqCountsByLanguage = useMemo(() => {
      const values = form.getValues();
      return Object.entries(values).map(([langCode, faqs]) => ({
        language: langCode,
        count: Array.isArray(faqs) ? faqs.length : 0,
      }));
    }, [form, faqCountMismatch]);

    // Optimized save handler
    const handleSave = async () => {
      // Validate first before doing expensive operations
      const isValid = await form.trigger();
      const hasEqualFaqCounts = validateFaqCounts();

      if (!hasEqualFaqCounts) {
        setIsValidationDialogOpen(true);
        return;
      }

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields correctly",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      setIsLoadingData(true);
      
      try {
        // Get current form values before any processing
        const allFormValues = form.getValues();
        console.log("Form values at save:", allFormValues);

        let sectionId = existingSubSectionId;

        // Create subsection if it doesn't exist
        if (!existingSubSectionId) {
          const subsectionData = {
            name: "FAQ Section",
            slug: slug || `faq-section-${Date.now()}`, // Use provided slug or generate one
            description: "FAQ section for the website",
            isActive: true,
            defaultContent : '',
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
          };

          toast({
            title: "Creating new FAQ section...",
            description: "Setting up your new FAQ content.",
          });

          const newSubSection = await createSubSection.mutateAsync(subsectionData);
          sectionId = newSubSection.data._id;
          setExistingSubSectionId(sectionId);
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID");
        }

        // Get language code to ID mapping
        const langCodeToIdMap = activeLanguages.reduce((acc, lang) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {});

        // Get the maximum number of FAQs across all languages
        const maxFaqCount = Math.max(
          ...Object.values(allFormValues).map((langFaqs) => 
            (Array.isArray(langFaqs) ? langFaqs.length : 0)
          ),
        );

        // Prepare translations array for bulk operations
        const translations: { content: any; language: any; contentElement: any; isActive: boolean }[] = [];
        const newContentElements: any[] = [];

        if (existingSubSectionId && contentElements.length > 0) {
          // Group content elements by FAQ number for faster lookup
          const faqGroups: Record<number, any[]> = {};
          contentElements.forEach((element) => {
            const match = element.name.match(/FAQ (\d+)/i);
            if (match) {
              const faqNumber = Number.parseInt(match[1]);
              if (!faqGroups[faqNumber]) {
                faqGroups[faqNumber] = [];
              }
              faqGroups[faqNumber].push(element);
            }
          });

          // Process each language's FAQs
          Object.entries(allFormValues).forEach(([langCode, langFaqs]) => {
            if (!Array.isArray(langFaqs)) return;

            const langId = langCodeToIdMap[langCode];
            if (!langId) return;

            // Process each FAQ in this language
            langFaqs.forEach((faq, index) => {
              const faqNumber = index + 1;
              const faqElements = faqGroups[faqNumber];

              if (faqElements) {
                const questionElement = faqElements.find((el) => el.name.includes("Question"));
                const answerElement = faqElements.find((el) => el.name.includes("Answer"));

                if (questionElement && faq.question) {
                  translations.push({
                    content: faq.question,
                    language: langId,
                    contentElement: questionElement._id,
                    isActive: true,
                  });
                }

                if (answerElement && faq.answer) {
                  translations.push({
                    content: faq.answer,
                    language: langId,
                    contentElement: answerElement._id,
                    isActive: true,
                  });
                }
              }
            });
          });

          // Create new elements for FAQs that don't exist yet
          const existingFaqCount = Object.keys(faqGroups).length;

          if (maxFaqCount > existingFaqCount) {
            // Create new elements for additional FAQs in parallel
            const newElementPromises = [];
            
            for (let faqNumber = existingFaqCount + 1; faqNumber <= maxFaqCount; faqNumber++) {
              // Find the first language that has this FAQ for default content
              let defaultQuestion = "";
              let defaultAnswer = "";
              
              const faqIndex = faqNumber - 1;
              
              // Find first language with this FAQ
              for (const [langCode, langFaqs] of Object.entries(allFormValues)) {
                if (Array.isArray(langFaqs) && langFaqs.length > faqIndex) {
                  const faq = langFaqs[faqIndex];
                  if (faq) {
                    defaultQuestion = faq.question || "";
                    defaultAnswer = faq.answer || "";
                    break;
                  }
                }
              }
              
              // Create question and answer elements in parallel
              newElementPromises.push(
                (async () => {
                  const [questionElement, answerElement] = await Promise.all([
                    createContentElement.mutateAsync({
                      name: `FAQ ${faqNumber} - Question`,
                      type: "text",
                      parent: sectionId,
                      isActive: true,
                      order: (faqNumber - 1) * 2,
                      defaultContent: defaultQuestion,
                    }),
                    createContentElement.mutateAsync({
                      name: `FAQ ${faqNumber} - Answer`,
                      type: "text",
                      parent: sectionId,
                      isActive: true,
                      order: (faqNumber - 1) * 2 + 1,
                      defaultContent: defaultAnswer,
                    })
                  ]);
                  
                  newContentElements.push(questionElement.data, answerElement.data);
                  
                  // Add translations for all languages
                  Object.entries(allFormValues).forEach(([langCode, langFaqs]) => {
                    if (!Array.isArray(langFaqs) || langFaqs.length < faqNumber) return;
                    
                    const langId = langCodeToIdMap[langCode];
                    if (!langId) return;
                    
                    const faq = langFaqs[faqNumber - 1];
                    if (faq) {
                      if (faq.question) {
                        translations.push({
                          content: faq.question,
                          language: langId,
                          contentElement: questionElement.data._id,
                          isActive: true,
                        });
                      }
                      
                      if (faq.answer) {
                        translations.push({
                          content: faq.answer,
                          language: langId,
                          contentElement: answerElement.data._id,
                          isActive: true,
                        });
                      }
                    }
                  });
                })()
              );
            }
            
            // Wait for all new elements to be created
            await Promise.all(newElementPromises);
          }
        } else {
          // Create new elements for each FAQ in parallel
          const createElementPromises = [];
          
          // Get the first language's FAQs to determine how many to create
          const firstLangFaqs = Object.values(allFormValues)[0];
          const faqCount = Array.isArray(firstLangFaqs) ? firstLangFaqs.length : 0;
          
          for (let faqIndex = 0; faqIndex < faqCount; faqIndex++) {
            createElementPromises.push(
              (async () => {
                const faqNumber = faqIndex + 1;
                
                // Get default content from the first language
                const firstLangCode = Object.keys(allFormValues)[0];
                const firstLangFaqs = allFormValues[firstLangCode];
                const defaultQuestion = Array.isArray(firstLangFaqs) && firstLangFaqs[faqIndex] 
                  ? firstLangFaqs[faqIndex].question 
                  : "";
                const defaultAnswer = Array.isArray(firstLangFaqs) && firstLangFaqs[faqIndex] 
                  ? firstLangFaqs[faqIndex].answer 
                  : "";
                
                // Create question and answer elements in parallel
                const [questionElement, answerElement] = await Promise.all([
                  createContentElement.mutateAsync({
                    name: `FAQ ${faqNumber} - Question`,
                    type: "text",
                    parent: sectionId,
                    isActive: true,
                    order: faqIndex * 2,
                    defaultContent: defaultQuestion,
                  }),
                  createContentElement.mutateAsync({
                    name: `FAQ ${faqNumber} - Answer`,
                    type: "text",
                    parent: sectionId,
                    isActive: true,
                    order: faqIndex * 2 + 1,
                    defaultContent: defaultAnswer,
                  })
                ]);
                
                newContentElements.push(questionElement.data, answerElement.data);
                
                // Add translations for each language
                Object.entries(allFormValues).forEach(([langCode, langFaqs]) => {
                  if (!Array.isArray(langFaqs) || langFaqs.length <= faqIndex) return;
                  
                  const langId = langCodeToIdMap[langCode];
                  if (!langId) return;
                  
                  const faq = langFaqs[faqIndex];
                  if (faq) {
                    if (faq.question) {
                      translations.push({
                        content: faq.question,
                        language: langId,
                        contentElement: questionElement.data._id,
                        isActive: true,
                      });
                    }
                    
                    if (faq.answer) {
                      translations.push({
                        content: faq.answer,
                        language: langId,
                        contentElement: answerElement.data._id,
                        isActive: true,
                      });
                    }
                  }
                });
              })()
            );
          }
          
          // Wait for all elements to be created
          await Promise.all(createElementPromises);
        }
        
        // Update content elements state with new elements
        if (newContentElements.length > 0) {
          setContentElements(prev => [...prev, ...newContentElements]);
        }

        // Bulk upsert translations for better performance
        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        }

        toast({
          title: existingSubSectionId ? "FAQ section updated successfully!" : "FAQ section created successfully!",
          description: "All changes have been saved.",
          duration: 5000,
        });

        // Refresh data immediately after save
        if (slug) {
          toast({
            title: "Refreshing content",
            description: "Loading the updated content...",
          });
          
          const result = await refetch();
          if (result.data?.data) {
            // Reset form with the new data
            setDataLoaded(false);
            processFaqData(result.data.data);
          }
        }

        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Operation failed:", error);
        toast({
          title: existingSubSectionId ? "Error updating FAQ section" : "Error creating FAQ section",
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          duration: 5000,
        });
      } finally {
        setIsLoadingData(false);
        setIsSaving(false);
      }
    };

    // Create form ref for parent component access
    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      existingSubSectionId,
      contentElements,
      componentName: 'FAQ'
    });

    // Get language codes for display
    const languageCodes = useMemo(() => 
      createLanguageCodeMap(activeLanguages),
      [activeLanguages]
    );

    // Loading state
    if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading FAQ section data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Loading Dialog */}
        <LoadingDialog 
          isOpen={isSaving} 
          title={existingSubSectionId ? "Updating FAQ Section" : "Creating FAQ Section"}
          description="Please wait while we save your changes..."
        />
        
        {/* Main Form */}
        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {languageIds.map((langId) => {
              const langCode = languageCodes[langId] || langId;
              return (
                <LanguageCard
                  key={langId}
                  langId={langId}
                  langCode={langCode}
                  form={form}
                  onAddFaq={addFaq}
                  onConfirmDelete={confirmRemoveFaq}
                />
              );
            })}
          </div>
        </Form>
        
        {/* Save Button */}
        <div className="flex justify-end mt-6">
          {faqCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Each language must have the same number of FAQs</span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingData || faqCountMismatch || isSaving}
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
                {existingSubSectionId ? "Update FAQ Content" : "Save FAQ Content"}
              </>
            )}
          </Button>
        </div>

        {/* Validation Dialog */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>FAQ Count Mismatch</DialogTitle>
              <DialogDescription>
                <div className="mt-4 mb-4">
                  Each language must have the same number of FAQs before saving. Please add or remove FAQs to ensure all
                  languages have the same count:
                </div>
                <ul className="list-disc pl-6 space-y-1">
                  {getFaqCountsByLanguage.map(({ language, count }) => (
                    <li key={language}>
                      <span className="font-semibold uppercase">{language}</span>: {count} FAQs
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

        {/* Delete FAQ Confirmation Dialog */}
        <DeleteServiceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={faqToDelete ? `FAQ ${faqToDelete.index + 1}` : ''}
          onConfirm={removeFaq}
          isDeleting={isDeleting}
          title="Delete FAQ"
          confirmText="Delete FAQ"
        />
      </div>
    );
  }
);

FaqForm.displayName = "FaqForm";

export default FaqForm;