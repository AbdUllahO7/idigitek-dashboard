"use client";

import { forwardRef, useEffect, useState, useRef, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, AlertTriangle, Loader2 } from "lucide-react";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import { useToast } from "@/src/hooks/use-toast";
import { createFaqDefaultValues } from "../../Utils/Language-default-values";
import { createFormRef } from "../../Utils/Expose-form-data";
import { processAndLoadData } from "../../Utils/load-form-data";
import { LanguageCard } from "./LanguageCard";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { FaqFormProps } from "@/src/api/types/sections/service/serviceSections.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { createLanguageCodeMap } from "../../Utils/language-utils";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import { createFaqSchema } from "../../Utils/language-specific-schemas";

const FaqForm = forwardRef<any, FaqFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const formSchema = useMemo(() => createFaqSchema(languageIds, activeLanguages), [languageIds, activeLanguages]);
    const { websiteId } = useWebsiteContext();

    const defaultValues = useMemo(() => createFaqDefaultValues(languageIds, activeLanguages), [languageIds, activeLanguages]);

    const [isLoadingData, setIsLoadingData] = useState(!slug);
    const [dataLoaded, setDataLoaded] = useState(!slug);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [faqCountMismatch, setFaqCountMismatch] = useState(false);
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null);
    const [contentElements, setContentElements] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<{ langCode: string; index: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { toast } = useToast();

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: defaultValues,
    });

    const onDataChangeRef = useRef(onDataChange);
    useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

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

    const { data: completeSubsectionData, isLoading: isLoadingSubsection, refetch } = useGetCompleteBySlug(slug || "", !slug);

    const validateFaqCounts = useRef(() => {
      const values = form.getValues();
      const counts = Object.values(values).map((langData: any) => (Array.isArray(langData.faqs) ? langData.faqs.length : 0));
      const allEqual = counts.every((count) => count === counts[0]);
      setFaqCountMismatch(!allEqual);
      return allEqual;
    }).current;

    const processFaqData = useRef((subsectionData: SubSection | null) => {
      let sectionTitleElements: any[] = []; // Store sectionTitleElements in closure

      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          groupElements: (elements) => {
            const faqGroups: Record<number, any[]> = {};
            sectionTitleElements = []; // Reset sectionTitleElements
            elements.forEach((element) => {
              if (element.name.includes("Section Title")) {
                sectionTitleElements.push(element);
              } else {
                const match = element.name.match(/FAQ (\d+)/i);
                if (match) {
                  const faqNumber = Number.parseInt(match[1]);
                  if (!faqGroups[faqNumber]) {
                    faqGroups[faqNumber] = [];
                  }
                  faqGroups[faqNumber].push(element);
                }
              }
            });
            return faqGroups; // Return only faqGroups as expected by processAndLoadData
          },
          processElementGroup: (faqNumber, elements, langId, getTranslationContent) => {
            const questionElement = elements.find((el: any) => el.name.includes("Question"));
            const answerElement = elements.find((el: any) => el.name.includes("Answer"));
            // Find sectionTitleElement for the current language
            const langCode = activeLanguages.find((lang) => lang._id === langId)?.languageID || langId;
            const sectionTitleElement = sectionTitleElements.find((el: any) => el.name === `Section Title - ${langCode}`);

            return {
              sectionTitle: sectionTitleElement ? getTranslationContent(sectionTitleElement, "") : "",
              faqs: [
                {
                  question: questionElement ? getTranslationContent(questionElement, "") : "",
                  answer: answerElement ? getTranslationContent(answerElement, "") : "",
                },
              ],
            };
          },
          getDefaultValue: () => ({
            sectionTitle: "",
            faqs: [{ question: "", answer: "" }],
          }),
        },
        {
          setExistingSubSectionId,
          setContentElements,
          setDataLoaded,
          setHasUnsavedChanges,
          setIsLoadingData,
          validateCounts: validateFaqCounts,
        }
      );
    }).current;

    useEffect(() => {
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }
      setIsLoadingData(true);
      processFaqData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, slug, processFaqData]);

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

    const addFaq = (langCode: string) => {
      const currentFaqs = form.getValues(`${langCode}.faqs`) || [];
      form.setValue(
        `${langCode}.faqs`,
        [...currentFaqs, { question: "", answer: "" }],
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
      toast({
        title: "FAQ added",
        description: "A new FAQ has been added to the section.",
      });
    };

    const confirmRemoveFaq = (langCode: string, index: any) => {
      const currentFaqs = form.getValues(`${langCode}.faqs`) || [];
      if (currentFaqs.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one FAQ",
          variant: "destructive",
        });
        return;
      }
      setFaqToDelete({ langCode, index });
      setDeleteDialogOpen(true);
    };

    const removeFaq = async () => {
      if (!faqToDelete) return;
      const { langCode, index } = faqToDelete;
      setIsDeleting(true);
      try {
        if (existingSubSectionId && contentElements.length > 0) {
          const faqNumber = index + 1;
          const faqElements = contentElements.filter((element) => {
            const match = element.name.match(/FAQ (\d+)/i);
            return match && Number.parseInt(match[1]) === faqNumber;
          });
          if (faqElements.length > 0) {
            await Promise.all(
              faqElements.map(async (element) => {
                try {
                  await deleteContentElement.mutateAsync(element._id);
                } catch (error) {
                  console.error(`Failed to delete content element ${element.name}:`, error);
                }
              })
            );
            setContentElements((prev) =>
              prev.filter((element) => {
                const match = element.name.match(/FAQ (\d+)/i);
                return !(match && Number.parseInt(match[1]) === faqNumber);
              })
            );
            toast({
              title: "FAQ deleted",
              description: `FAQ ${faqNumber} has been deleted from the database`,
            });
          }
          const remainingElements = contentElements.filter((element) => {
            const match = element.name.match(/FAQ (\d+)/i);
            return match && Number.parseInt(match[1]) > faqNumber;
          });
          if (remainingElements.length > 0) {
            await Promise.all(
              remainingElements.map(async (element) => {
                const match = element.name.match(/FAQ (\d+)/i);
                if (match) {
                  const oldNumber = Number.parseInt(match[1]);
                  const newNumber = oldNumber - 1;
                  const newName = element.name.replace(`FAQ ${oldNumber}`, `FAQ ${newNumber}`);
                  const newOrder = element.order - 2;
                  try {
                    await updateContentElement.mutateAsync({
                      id: element._id,
                      data: { name: newName, order: newOrder },
                    });
                  } catch (error) {
                    console.error(`Failed to update element ${element.name}:`, error);
                  }
                }
              })
            );
          }
        }
        Object.keys(form.getValues()).forEach((currentLangCode) => {
          const faqs = form.getValues(`${currentLangCode}.faqs`) || [];
          if (faqs.length > index) {
            const updatedFaqs = [...faqs];
            updatedFaqs.splice(index, 1);
            form.setValue(`${currentLangCode}.faqs`, updatedFaqs, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        });
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

    const getFaqCountsByLanguage = useMemo(() => {
      const values = form.getValues();
      return Object.entries(values).map(([langCode, langData]: [string, any]) => ({
        language: langCode,
        count: Array.isArray(langData.faqs) ? langData.faqs.length : 0,
      }));
    }, [form, faqCountMismatch]);

    const handleSave = async () => {
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
        const allFormValues = form.getValues();
        let sectionId = existingSubSectionId;
        if (!existingSubSectionId) {
          const subsectionData = {
            name: "FAQ Section",
            slug: slug || `faq-section-${Date.now()}`,
            description: "FAQ section for the website",
            isActive: true,
            defaultContent: "",
            order: 0,
            sectionItem: ParentSectionId,
            languages: languageIds,
            WebSiteId: websiteId,
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
        const langCodeToIdMap = activeLanguages.reduce((acc: any, lang) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {});
        const maxFaqCount = Math.max(
          ...Object.values(allFormValues).map((langData: any) => (Array.isArray(langData.faqs) ? langData.faqs.length : 0))
        );
        const translations: { content: any; language: any; contentElement: any; isActive: boolean }[] = [];
        const newContentElements: any[] = [];
        if (existingSubSectionId && contentElements.length > 0) {
          const faqGroups: Record<number, any[]> = {};
          const sectionTitleElements: any[] = [];
          contentElements.forEach((element) => {
            if (element.name.includes("Section Title")) {
              sectionTitleElements.push(element);
            } else {
              const match = element.name.match(/FAQ (\d+)/i);
              if (match) {
                const faqNumber = Number.parseInt(match[1]);
                if (!faqGroups[faqNumber]) {
                  faqGroups[faqNumber] = [];
                }
                faqGroups[faqNumber].push(element);
              }
            }
          });
          Object.entries(allFormValues).forEach(([langCode, langData]: [string, any]) => {
            const langId = langCodeToIdMap[langCode];
            if (!langId) return;
            const sectionTitleElement = sectionTitleElements.find((el) => el.name === `Section Title - ${langCode}`);
            if (langData.sectionTitle && sectionTitleElement) {
              translations.push({
                content: langData.sectionTitle,
                language: langId,
                contentElement: sectionTitleElement._id,
                isActive: true,
              });
            }
            if (!Array.isArray(langData.faqs)) return;
            langData.faqs.forEach((faq: any, index: number) => {
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
          const existingFaqCount = Object.keys(faqGroups).length;
          if (maxFaqCount > existingFaqCount) {
            const newElementPromises = [];
            for (let faqNumber = existingFaqCount + 1; faqNumber <= maxFaqCount; faqNumber++) {
              const faqIndex = faqNumber - 1;
              let defaultQuestion = "";
              let defaultAnswer = "";
              for (const [langCode, langData] of Object.entries(allFormValues)) {
                if (Array.isArray((langData as any).faqs) && (langData as any).faqs.length > faqIndex) {
                  const faq = (langData as any).faqs[faqIndex];
                  if (faq) {
                    defaultQuestion = faq.question || "";
                    defaultAnswer = faq.answer || "";
                    break;
                  }
                }
              }
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
                    }),
                  ]);
                  newContentElements.push(questionElement.data, answerElement.data);
                  Object.entries(allFormValues).forEach(([langCode, langData]: [string, any]) => {
                    if (!Array.isArray(langData.faqs) || langData.faqs.length < faqNumber) return;
                    const langId = langCodeToIdMap[langCode];
                    if (!langId) return;
                    const faq = langData.faqs[faqNumber - 1];
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
            await Promise.all(newElementPromises);
          }
          const missingSectionTitles = Object.keys(allFormValues).filter(
            (langCode) => !sectionTitleElements.some((el) => el.name === `Section Title - ${langCode}`)
          );
          if (missingSectionTitles.length > 0) {
            const sectionTitlePromises = missingSectionTitles.map(async (langCode) => {
              const langId = langCodeToIdMap[langCode];
              if (!langId) return;
              const sectionTitleElement = await createContentElement.mutateAsync({
                name: `Section Title - ${langCode}`,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: -1,
                defaultContent: (allFormValues[langCode] as any).sectionTitle || "",
              });
              newContentElements.push(sectionTitleElement.data);
              if ((allFormValues[langCode] as any).sectionTitle) {
                translations.push({
                  content: (allFormValues[langCode] as any).sectionTitle,
                  language: langId,
                  contentElement: sectionTitleElement.data._id,
                  isActive: true,
                });
              }
            });
            await Promise.all(sectionTitlePromises);
          }
        } else {
          const createElementPromises = [];
          const firstLangFaqs = (Object.values(allFormValues)[0] as any).faqs;
          const faqCount = Array.isArray(firstLangFaqs) ? firstLangFaqs.length : 0;
          for (let faqIndex = 0; faqIndex < faqCount; faqIndex++) {
            createElementPromises.push(
              (async () => {
                const faqNumber = faqIndex + 1;
                const firstLangCode = Object.keys(allFormValues)[0];
                const firstLangData = allFormValues[firstLangCode] as any;
                const defaultQuestion = Array.isArray(firstLangData.faqs) && firstLangData.faqs[faqIndex] ? firstLangData.faqs[faqIndex].question : "";
                const defaultAnswer = Array.isArray(firstLangData.faqs) && firstLangData.faqs[faqIndex] ? firstLangData.faqs[faqIndex].answer : "";
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
                  }),
                ]);
                newContentElements.push(questionElement.data, answerElement.data);
                Object.entries(allFormValues).forEach(([langCode, langData]: [string, any]) => {
                  if (!Array.isArray(langData.faqs) || langData.faqs.length <= faqIndex) return;
                  const langId = langCodeToIdMap[langCode];
                  if (!langId) return;
                  const faq = langData.faqs[faqIndex];
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
          Object.entries(allFormValues).forEach(([langCode, langData]: [string, any]) => {
            const langId = langCodeToIdMap[langCode];
            if (!langId || !langData.sectionTitle) return;
            createElementPromises.push(
              createContentElement.mutateAsync({
                name: `Section Title - ${langCode}`,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: -1,
                defaultContent: langData.sectionTitle,
              }).then((sectionTitleElement) => {
                newContentElements.push(sectionTitleElement.data);
                translations.push({
                  content: langData.sectionTitle,
                  language: langId,
                  contentElement: sectionTitleElement.data._id,
                  isActive: true,
                });
              })
            );
          });
          await Promise.all(createElementPromises);
        }
        if (newContentElements.length > 0) {
          setContentElements((prev) => [...prev, ...newContentElements]);
        }
        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        }
        toast({
          title: existingSubSectionId ? "FAQ section updated successfully!" : "FAQ section created successfully!",
          description: "All changes have been saved.",
          duration: 5000,
        });
        if (slug) {
          toast({
            title: "Refreshing content",
            description: "Loading the updated content...",
          });
          const result = await refetch();
          if (result.data?.data) {
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

    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      existingSubSectionId,
      contentElements,
      componentName: "FAQ",
    });

    const languageCodes = useMemo(() => createLanguageCodeMap(activeLanguages), [activeLanguages]);

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
        <LoadingDialog
          isOpen={isSaving}
          title={existingSubSectionId ? "Updating FAQ Section" : "Creating FAQ Section"}
          description="Please wait while we save your changes..."
        />
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
        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={faqToDelete ? `FAQ ${faqToDelete.index + 1}` : ""}
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