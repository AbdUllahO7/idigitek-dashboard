"use client";

import { forwardRef, useEffect, useState, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections";
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements";
import { useToast } from "@/src/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Trash2 } from "lucide-react";
import { LoadingDialog } from "@/src/utils/MainSectionComponents";
import { ContentElement, ContentTranslation } from "@/src/api/types/hooks/content.types";
import { SubSection } from "@/src/api/types/hooks/section.types";
import { useWebsiteContext } from "@/src/providers/WebsiteContext";
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations";
import {  createContactSendMessageDefaultValues, createLanguageCodeMap } from "@/src/app/dashboard/services/addService/Utils/Language-default-values";
import { processAndLoadData } from "@/src/app/dashboard/services/addService/Utils/load-form-data";
import { createFormRef } from "@/src/app/dashboard/services/addService/Utils/Expose-form-data";
import { ContactFormProps } from "@/src/api/types/sections/contact/contactSection.type";
import {  createContactSendMessageSchema } from "@/src/app/dashboard/services/addService/Utils/language-specific-schemas";
import { SendUsaMessageFormLanguageCard } from "./SendUsaMessageFormLanguageCard";
import apiClient from '@/src/lib/api-client';
import { useSubsectionDeleteManager } from "@/src/hooks/DeleteSubSections/useSubsectionDeleteManager";
import { DeleteConfirmationDialog } from "@/src/components/DeleteConfirmationDialog";
import { useTranslation } from "react-i18next";

const SendUsaMessageForm = forwardRef<any, ContactFormProps>((props, ref) => {
  const {
    languageIds,
    activeLanguages,
    onDataChange,
    slug,
    ParentSectionId,
    initialData,
  } = props;

  const { websiteId } = useWebsiteContext();
  const { t } = useTranslation();

  // Setup form with schema validation
  const formSchema = createContactSendMessageSchema(languageIds, activeLanguages);
  const defaultValues = createContactSendMessageDefaultValues(languageIds, activeLanguages);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // State management
  const [state, setState] = useState({
    isLoadingData: !slug,
    dataLoaded: !slug,
    hasUnsavedChanges: false,
    existingSubSectionId: null as string | null,
    contentElements: [] as ContentElement[],
    isSaving: false,
    showDeleteConfirm: false,
    isRefreshingAfterDelete: false,
  });

  const updateState = useCallback((newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const { isLoadingData, dataLoaded, hasUnsavedChanges, existingSubSectionId, contentElements, isSaving, showDeleteConfirm, isRefreshingAfterDelete } = state;

  // Hooks
  const { toast } = useToast();
  const dataProcessed = useRef(false);
  const onDataChangeRef = useRef(onDataChange);
  const defaultLangCode = activeLanguages[0]?.languageID || "en";

  // Services
  const {
    useCreate: useCreateSubSection,
    useGetCompleteBySlug,
    useUpdate: useUpdateSubSection,
  } = useSubSections();
  const { useCreate: useCreateContentElement } = useContentElements();
  const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations();

  const createSubSection = useCreateSubSection();
  const updateSubSection = useUpdateSubSection();
  const createContentElement = useCreateContentElement();
  const bulkUpsertTranslations = useBulkUpsertTranslations();

  // Custom delete mutation with backend cascade delete
  const queryClient = useQueryClient();
  const deleteSubSection = useMutation({
    mutationFn: async (id: string) => {
      // Use backend cascade delete - much simpler and more reliable
      const { data } = await apiClient.delete(`/subsections/${id}`, {
        params: { 
          hardDelete: true,
          cascadeDelete: true  // Let backend handle cascade deletion
        }
      });
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['subsections'] });
      queryClient.invalidateQueries({ queryKey: ['content-elements'] });
      queryClient.invalidateQueries({ queryKey: ['content-translations'] });
      
      // If we have a slug, also invalidate the specific slug query
      if (slug) {
        queryClient.invalidateQueries({ queryKey: ['subsections', 'slug', slug] });
      }
      
      // Invalidate website-specific queries if we have websiteId
      if (websiteId) {
        queryClient.invalidateQueries({ queryKey: ['subsections', 'website', websiteId] });
      }
      
      // Show success message with details
      toast({
        title: t('sendUsaMessageForm.delete.success.title', 'Contact form deleted successfully!'),
        description: data.deletedElements 
          ? t('sendUsaMessageForm.delete.success.withElements', 'Deleted subsection and {{count}} content elements.', { count: data.deletedElements })
          : t('sendUsaMessageForm.delete.success.simple', 'The contact form has been removed.'),
      });
    },
    onError: (error) => {
      console.error("Delete mutation failed:", error);
      toast({
        title: t('sendUsaMessageForm.delete.error.title', 'Failed to delete contact form'),
        variant: "destructive",
        description: error instanceof Error ? error.message : t('sendUsaMessageForm.delete.error.unknown', 'Unknown error occurred'),
      });
    },
  });

  // Data fetching from API
  const {
    data: completeSubsectionData,
    isLoading: isLoadingSubsection,
    refetch,
  } = useGetCompleteBySlug(slug || "", Boolean(slug));

  // Update reference when onDataChange changes
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Process initial data from parent
  const processInitialData = useCallback(() => {
    if (initialData && !dataLoaded) {
      if (initialData.title) {
        form.setValue(`${defaultLangCode}.title`, initialData.title);
      }
      updateState({
        dataLoaded: true,
        hasUnsavedChanges: false,
      });
    }
  }, [initialData, dataLoaded, defaultLangCode, form]);

  // Process contact data from API
  const processContactData = useCallback(
    (subsectionData: SubSection | null) => {
      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          groupElements: (elements) => ({
            contact: elements.filter(
              (el) => el.type === "text" || (el.name === "Background Image" && el.type === "image")
            ),
          }),
          processElementGroup: (groupId, elements, langId, getTranslationContent) => {
            const elementKeyMap: Record<string, keyof typeof result> = {
              Title: "title",
              Fullname: "fullname",
              FullnamePlaceHolder: "fullnamePlaceHolder",
              Email: "email",
              EmailPlaceHolder: "emailPlaceHolder",
              Message: "message",
              MessagePlaceHolder: "messagePlaceHolder",
              SubjectTitle : "subjectTitle",
              Subjects: "subjects",
              ButtonText: "buttonText",
            };

            const result = {
              title: "",
              fullname: "",
              fullnamePlaceHolder: "",
              email: "",
              emailPlaceHolder: "",
              subjectTitle : "",
              message: "",
              messagePlaceHolder: "",
              subjects: [] as string[],
              phoneText: "",
              phoneTextValue: "",
              emailText: "",
              buttonText : ""
            };

            elements
              .filter((el) => el.type === "text")
              .forEach((element) => {
                const key = elementKeyMap[element.name];
                if (key) {
                  if (key === "subjects") {
                    const content = getTranslationContent(element, "") || "";
                    result.subjects = content ? content.split(",") : [];
                  } else {
                    result[key] = getTranslationContent(element, "") || "";
                  }
                }
              });

            return result;
          },
          getDefaultValue: () => ({
            title: "",
            fullname: "",
            fullnamePlaceHolder: "",
            email: "",
            emailPlaceHolder: "",
            subjectTitle : "",
            message: "",
            messagePlaceHolder: "",
            subjects: [],
            phoneText: "",
            phoneTextValue: "",
            emailText: "",
            buttonText : ""
          }),
        },
        {
          setExistingSubSectionId: (id) => updateState({ existingSubSectionId: id }),
          setContentElements: (elements) => updateState({ contentElements: elements }),
          setDataLoaded: (loaded) => updateState({ dataLoaded: loaded }),
          setHasUnsavedChanges: (hasChanges) => updateState({ hasUnsavedChanges: hasChanges }),
          setIsLoadingData: (loading) => updateState({ isLoadingData: loading }),
        }
      );
    },
    [form, languageIds, activeLanguages]
  );

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
        isLoadingData: false,
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

  // Delete handler
 const deleteManager = useSubsectionDeleteManager({
    subsectionId: existingSubSectionId,
    websiteId,
    slug,
    sectionName: t('sendUsaMessageForm.deleteManager.sectionName', 'contact form'),
    contentElements,
    customWarnings: [
      t('sendUsaMessageForm.deleteManager.warning1', 'All form submissions will be lost'),
      t('sendUsaMessageForm.deleteManager.warning2', 'Email notification settings will be removed')
    ],
    shouldRefetch: !!slug,
    refetchFn: refetch,
    resetForm: () => {
      form.reset(defaultValues);
    },
    resetState: () => {
      updateState({
        existingSubSectionId: null,
        contentElements: [],
        hasUnsavedChanges: false,
        dataLoaded: !slug,
      });
      dataProcessed.current = false;
    },
    onDataChange,
    onDeleteSuccess: async () => {
      // Custom success handling after deletion
      updateState({ isRefreshingAfterDelete: true });
      
      if (slug) {
        try {
          const result = await refetch();
          if (result.data?.data) {
            updateState({ isLoadingData: true });
            await processContactData(result.data.data);
            updateState({ isLoadingData: false });
            dataProcessed.current = true;
          } else {
            updateState({ 
              dataLoaded: true,
              isLoadingData: false 
            });
          }
        } catch (refetchError) {
          console.log("Refetch after deletion resulted in expected error (subsection deleted)");
          updateState({ 
            dataLoaded: true,
            isLoadingData: false 
          });
        }
      }
      
      updateState({ isRefreshingAfterDelete: false });
    },
  });

  // Save handler with optimized process
  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: t('sendUsaMessageForm.validation.error', 'Validation Error'),
        description: t('sendUsaMessageForm.validation.fillRequired', 'Please fill all required fields correctly'),
        variant: "destructive",
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
          name: t('sendUsaMessageForm.subsection.name', 'Contact Form'),
          slug: slug || `contact-form-${Date.now()}`,
          description: "",
          isActive: true,
          isMain: false,
          order: 0,
          defaultContent: "",
          sectionItem: ParentSectionId,
          languages: languageIds,
          WebSiteId: websiteId,
        };

        const newSubSection = await createSubSection.mutateAsync(subsectionData);
        sectionId = newSubSection.data._id;
        updateState({ existingSubSectionId: sectionId });
      } else {
        const updateData = {
          isActive: true,
          isMain: false,
          languages: languageIds,
        };

        await updateSubSection.mutateAsync({
          id: sectionId,
          data: updateData,
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
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string })[] = [];
        const elementNameToKeyMap: Record<string, keyof typeof allFormValues[string]> = {
          Title: "title",
          Fullname: "fullname",
          FullnamePlaceHolder: "fullnamePlaceHolder",
          Email: "email",
          EmailPlaceHolder: "emailPlaceHolder",
          SubjectTitle: "subjectTitle",
          Message: "message",
          MessagePlaceHolder: "messagePlaceHolder",
          Subjects: "subjects",
          PhoneText: "phoneText",
          PhoneTextValue: "phoneTextValue",
          EmailText: "emailText",
          ButtonText : "buttonText"
        };

        Object.entries(allFormValues).forEach(([langCode, values]) => {
          const langId = langCodeToIdMap[langCode];
          if (!langId) return;

          textElements.forEach((element) => {
            const key = elementNameToKeyMap[element.name];
            if (key && values && typeof values === "object") {
              if (key === "subjects") {
                const subjects = values[key] as string[];
                if (subjects && subjects.length > 0) {
                  translations.push({
                    content: subjects.join(","),
                    language: langId,
                    contentElement: element._id,
                    isActive: true,
                  });
                }
              } else if (key in values) {
                translations.push({
                  content: values[key],
                  language: langId,
                  contentElement: element._id,
                  isActive: true,
                });
              }
            }
          });
        });

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        }
      } else {
        const elementTypes = [
          { type: "text", key: "title", name: "Title" },
          { type: "text", key: "fullname", name: "Fullname" },
          { type: "text", key: "fullnamePlaceHolder", name: "FullnamePlaceHolder" },
          { type: "text", key: "email", name: "Email" },
          { type: "text", key: "emailPlaceHolder", name: "EmailPlaceHolder" },
          { type: "text", key: "subjectTitle", name: "SubjectTitle" },
          { type: "text", key: "message", name: "Message" },
          { type: "text", key: "messagePlaceHolder", name: "MessagePlaceHolder" },
          { type: "text", key: "subjects", name: "Subjects" },
          { type: "text", key: "buttonText", name: "ButtonText" },
        ];

        const createdElements = [];
        for (const [index, el] of elementTypes.entries()) {
          let defaultContent = "";
          if (el.type === "text" && typeof allFormValues[defaultLangCode] === "object") {
            const langValues = allFormValues[defaultLangCode];
            if (el.key === "subjects") {
              defaultContent = langValues && typeof langValues === "object" && el.key in langValues
                ? (langValues[el.key] as string[]).join(",")
                : "";
            } else {
              defaultContent = langValues && typeof langValues === "object" && el.key in langValues
                ? langValues[el.key]
                : "";
            }
          }

          const elementData = {
            name: el.name,
            type: el.type,
            parent: sectionId,
            isActive: true,
            order: index,
            defaultContent,
          };

          const newElement = await createContentElement.mutateAsync(elementData);
          createdElements.push({ ...newElement.data, key: el.key });
        }

        updateState({ contentElements: createdElements.map((e) => ({ ...e, translations: [] })) });

        const textElements = createdElements.filter((e) => e.key !== "backgroundImage");
        const translations: (Omit<ContentTranslation, "_id"> & { id?: string })[] = [];

        Object.entries(allFormValues).forEach(([langCode, langValues]) => {
          const langId = langCodeToIdMap[langCode];
          if (!langId) return;

          for (const element of textElements) {
            if (langValues && typeof langValues === "object" && element.key in langValues) {
              if (element.key === "subjects") {
                const subjects = langValues[element.key] as string[];
                if (subjects && subjects.length > 0) {
                  translations.push({
                    content: subjects.join(","),
                    language: langId,
                    contentElement: element._id,
                    isActive: true,
                  });
                }
              } else {
                translations.push({
                  content: langValues[element.key],
                  language: langId,
                  contentElement: element._id,
                  isActive: true,
                });
              }
            }
          }
        });

        if (translations.length > 0) {
          await bulkUpsertTranslations.mutateAsync(translations);
        }
      }

      toast({
        title: existingSubSectionId 
          ? t('sendUsaMessageForm.success.updated', 'Contact form updated successfully!')
          : t('sendUsaMessageForm.success.created', 'Contact form created successfully!'),
        description: t('sendUsaMessageForm.success.saved', 'All content has been saved.'),
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
        title: existingSubSectionId 
          ? t('sendUsaMessageForm.error.updating', 'Error updating contact form')
          : t('sendUsaMessageForm.error.creating', 'Error creating contact form'),
        variant: "destructive",
        description: error instanceof Error ? error.message : t('sendUsaMessageForm.error.unknown', 'Unknown error occurred'),
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
    t,
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
    activeLanguages,
  ]);

  // Create form ref for parent component
  createFormRef(ref, {
    form,
    hasUnsavedChanges,
    setHasUnsavedChanges: (value) => updateState({ hasUnsavedChanges: value }),
    existingSubSectionId,
    contentElements,
    componentName: "ContactForm",
    extraMethods: {
      saveData: handleSave,
      deleteData: deleteManager.handleDelete,
    },
    extraData: {
      existingSubSectionId,
    },
  });

  const languageCodes = createLanguageCodeMap(activeLanguages);

  // Loading state
  if (slug && (isLoadingData || isLoadingSubsection) && !dataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{t('sendUsaMessageForm.loading.data', 'Loading contact form data...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingDialog
        isOpen={isSaving}
        title={existingSubSectionId 
          ? t('sendUsaMessageForm.loading.updating', 'Updating Contact Form')
          : t('sendUsaMessageForm.loading.creating', 'Creating Contact Form')
        }
        description={t('sendUsaMessageForm.loading.saveDescription', 'Please wait while we save your changes...')}
      />

      <LoadingDialog
        isOpen={deleteSubSection.isPending}
        title={t('sendUsaMessageForm.loading.deleting', 'Deleting Contact Form')}
        description={t('sendUsaMessageForm.loading.deleteDescription', 'Please wait while we delete the contact form...')}
      />

      <LoadingDialog
        isOpen={isRefreshingAfterDelete}
        title={t('sendUsaMessageForm.loading.refreshing', 'Refreshing Data')}
        description={t('sendUsaMessageForm.loading.refreshDescription', 'Updating the interface after deletion...')}
      />

      {/* Delete Confirmation Dialog */}
        {/* <DeleteConfirmationDialog
        {...deleteManager.confirmationDialogProps}
        title={t('sendUsaMessageForm.delete.dialog.title', 'Delete Contact Form')}
        description={t('sendUsaMessageForm.delete.dialog.description', 'Are you sure you want to delete this contact form? This action cannot be undone.')}
      /> */}

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languageIds.map((langId, index) => {
            const langCode = languageCodes[langId] || langId;
            return (
              <SendUsaMessageFormLanguageCard
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
        {/* Delete Button - Only show if there's an existing subsection */}
        {/* {existingSubSectionId && (
          <Button
            type="button"
            variant="destructive"
            onClick={deleteManager.openDeleteDialog}
            disabled={isLoadingData || isSaving || deleteManager.isDeleting || isRefreshingAfterDelete}
            className="flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('sendUsaMessageForm.button.delete', 'Delete Contact Form')}
          </Button>
        )} */}

        {/* Save Button */}
        <div className={existingSubSectionId ? "" : "ml-auto"}>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingData || isSaving || deleteSubSection.isPending || isRefreshingAfterDelete}
            className="flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('sendUsaMessageForm.button.saving', 'Saving...')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {existingSubSectionId 
                  ? t('sendUsaMessageForm.button.update', 'Update Contact Form')
                  : t('sendUsaMessageForm.button.save', 'Save Contact Form')
                }
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

SendUsaMessageForm.displayName = "SendUsaMessageForm";
export default SendUsaMessageForm;