"use client"

import type React from "react"
import { forwardRef, useEffect, useState, useRef, memo, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/src/components/ui/button"
import {
  Form,
} from "@/src/components/ui/form"
import {  Save, AlertTriangle, X, Loader2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import apiClient from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { createFeaturesDefaultValues } from "../../Utils/Language-default-values"
import { createFormRef } from "../../Utils/Expose-form-data"
import { processAndLoadData } from "../../Utils/load-form-data"
import { createLanguageCodeMap } from "../../Utils/language-utils"
import { useFeatureImages } from "../../Utils/Image-uploader"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import { SubSection } from "@/src/api/types/hooks/section.types"
import { Feature } from "@/src/api/types/hooks/MultilingualSection.types"
import { ContentTranslation } from "@/src/api/types/hooks/content.types"
import { useWebsiteContext } from "@/src/providers/WebsiteContext"
import { DeleteConfirmationDialog } from "@/src/components/DeleteConfirmationDialog"

// Helper type to infer the schema type
type FeaturesSchemaType = ReturnType<typeof createFeaturesSchema>

// FeatureItem Component
import DeleteSectionDialog from "@/src/components/DeleteSectionDialog"
import { createFeaturesSchema } from "../../Utils/language-specific-schemas"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-content-translations"
import LanguageCard, { LanguageTabs } from "./LanguageCard"
import { useSubsectionDeleteManager } from "@/src/hooks/DeleteSubSections/useSubsectionDeleteManager"
import { useTranslation } from "react-i18next"

// Main Features Form Component
interface FeaturesFormProps {
  languageIds: string[];
  activeLanguages: any[];
  onDataChange?: (value: any) => void;
  slug?: string;
  ParentSectionId?: string;
  initialData?:any
}

const FeaturesForm = forwardRef<any, FeaturesFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    const { websiteId } = useWebsiteContext();
    const { t } = useTranslation(); // Add translation hook
    
    // Track feature item IDs to prevent duplicates
    const [featureItemIds, setFeatureItemIds] = useState<Record<string, Set<string>>>({});
    
    // Memoize schema and default values
    const featuresSchema = useMemo(() => 
      createFeaturesSchema(languageIds, activeLanguages),
      [languageIds, activeLanguages]
    );
    
    const defaultValues = useMemo(() => 
      createFeaturesDefaultValues(languageIds, activeLanguages),
      [languageIds, activeLanguages]
    );

    // Enhanced state management with delete-related states
    const [isLoadingData, setIsLoadingData] = useState(!!slug); // Fixed: should be true if slug exists initially
    const [dataLoaded, setDataLoaded] = useState(!slug);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [featureCountMismatch, setFeatureCountMismatch] = useState(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null);
    const [contentElements, setContentElements] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshingAfterDelete, setIsRefreshingAfterDelete] = useState(false);
    
    // Delete feature dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [featureToDelete, setFeatureToDelete] = useState<{ langCode: string; index: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Delete feature item dialog state
    const [deleteFeatureItemDialogOpen, setDeleteFeatureItemDialogOpen] = useState(false);
    const [featureItemToDelete, setFeatureItemToDelete] = useState<{ 
      langCode: string; 
      featureIndex: number; 
      itemIndex: number 
    } | null>(null);
    const [isDeletingFeatureItem, setIsDeletingFeatureItem] = useState(false);
    
    const { toast } = useToast();

    const form = useForm<z.infer<FeaturesSchemaType>>({
      resolver: zodResolver(featuresSchema),
      defaultValues: defaultValues,
      mode: "onChange" // Enable onChange validation for better UX
    });

    // Initialize useFeatureImages hook
    const { featureImages, handleFeatureImageRemove, updateFeatureImageIndices, FeatureImageUploader } = useFeatureImages(form);

    // Use ref to prevent unnecessary effect reruns
    const onDataChangeRef = useRef(onDataChange);
    useEffect(() => {
      onDataChangeRef.current = onDataChange;
    }, [onDataChange]);

    // API hooks
    const { useCreate: useCreateSubSection, useGetCompleteBySlug } = useSubSections();
    const {
      useCreate: useCreateContentElement,
      useDelete: useDeleteContentElement,
    } = useContentElements();
    const { useBulkUpsert: useBulkUpsertTranslations } = useContentTranslations();

    const createSubSection = useCreateSubSection();
    const createContentElement = useCreateContentElement();
    const deleteContentElement = useDeleteContentElement();
    const bulkUpsertTranslations = useBulkUpsertTranslations();

    // Query for complete subsection data by slug if provided
    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", Boolean(slug));

    // Function to process and load data into the form
    const processFeaturesData = (subsectionData: SubSection | null) => {
      if (!subsectionData) return;
      
      setIsLoadingData(true);
      
      try {
        // Create tracking structure for feature items
        const featureItemTracking: Record<string, Set<string>> = {};
        
        processAndLoadData(
          subsectionData,
          form,
          languageIds,
          activeLanguages,
          {
            groupElements: (elements) => {
              const featureGroups: Record<string, any[]> = {};
              
              // First sort elements by name to ensure consistent order
              elements.sort((a, b) => {
                // Extract feature numbers
                const aMatch = a.name.match(/Feature (\d+)/i);
                const bMatch = b.name.match(/Feature (\d+)/i);
                
                const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
                const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
                
                // Sort by feature number first
                if (aNum !== bNum) return aNum - bNum;
                
                // Then sort by element type/name
                return a.name.localeCompare(b.name);
              });
              
              // Group elements by feature
              elements.forEach((element) => {
                const featureIdMatch = element.name.match(/Feature (\d+)/i);
                if (featureIdMatch) {
                  const featureId = featureIdMatch[1];
                  if (!featureGroups[featureId]) {
                    featureGroups[featureId] = [];
                  }
                  featureGroups[featureId].push(element);
                  
                  // Track feature item elements
                  if (element.name.includes("Feature Item")) {
                    if (!featureItemTracking[featureId]) {
                      featureItemTracking[featureId] = new Set();
                    }
                    featureItemTracking[featureId].add(element.name);
                  }
                }
              });
              
              // Store feature item tracking information
              setFeatureItemIds(featureItemTracking);
              
              return featureGroups;
            },
            processElementGroup: (featureId, elements, langId, getTranslationContent) => {
              const titleElement = elements.find((el) => el.name.includes("Title"));
              const headingElement = elements.find((el) => el.name.includes("Heading"));
              const descriptionElement = elements.find((el) => el.name.includes("Description"));
              const imageElement = elements.find((el) => el.name.includes("Image") && el.type === "image");
              
              // Get feature item elements sorted by index number
              const featureListElements = elements
                .filter((el) => el.name.includes("Feature Item"))
                .sort((a, b) => {
                  const aMatch = a.name.match(/Feature Item (\d+)/i);
                  const bMatch = b.name.match(/Feature Item (\d+)/i);
                  
                  const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
                  const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
                  
                  return aNum - bNum;
                });

              const featureItems = featureListElements
                .map((el) => getTranslationContent(el, ""))
                .filter(Boolean);

              if (featureItems.length === 0) {
                featureItems.push("");
              }

              const imageUrl = imageElement?.imageUrl || "";
              return {
                id: `feature-${featureId}`,
                title: getTranslationContent(titleElement, ""),
                content: {
                  heading: getTranslationContent(headingElement, ""),
                  description: getTranslationContent(descriptionElement, ""),
                  features: featureItems,
                  image: imageUrl,
                  imagePosition: "right", // Default value
                },
              };
            },
            getDefaultValue: () => [{
              id: "feature-1",
              title: "",
              content: {
                heading: "",
                description: "",
                features: [""],
                image: "",
                imagePosition: "right",
              },
            }],
          },
          {
            setExistingSubSectionId,
            setContentElements,
            setDataLoaded,
            setHasUnsavedChanges,
            setIsLoadingData,
            validateCounts: validateFeatureCounts,
          }
        );
      } catch (error) {
        console.error("Error processing features data:", error);
        toast({
          title: t("featuresForm.featureForm.toast.errorLoading"),
          description: t("featuresForm.featureForm.toast.errorLoading"),
          variant: "destructive",
        });
        setIsLoadingData(false);
      }
    };

    // Delete functionality using the delete manager
    const deleteManager = useSubsectionDeleteManager({
      subsectionId: existingSubSectionId,
      websiteId,
      slug,
      sectionName: t("featuresForm.featureForm.dialogs.deleteSection.title"),
      contentElements,
      customWarnings: [
        t("featuresForm.featureForm.dialogs.deleteSection.warnings.0"),
        t("featuresForm.featureForm.dialogs.deleteSection.warnings.1"),
        t("featuresForm.featureForm.dialogs.deleteSection.warnings.2"),
        t("featuresForm.featureForm.dialogs.deleteSection.warnings.3")
      ],
      shouldRefetch: !!slug,
      refetchFn: refetch,
      resetForm: () => {
        form.reset(defaultValues);
        // Clear feature images
        Object.keys(featureImages).forEach(index => {
          handleFeatureImageRemove(parseInt(index));
        });
      },
      resetState: () => {
        setExistingSubSectionId(null);
        setContentElements([]);
        setHasUnsavedChanges(false);
        setDataLoaded(!slug);
        setFeatureCountMismatch(false);
        setFeatureItemIds({});
      },
      onDataChange,
      onDeleteSuccess: async () => {
        // Custom success handling after deletion
        setIsRefreshingAfterDelete(true);
        
        if (slug) {
          try {
            const result = await refetch();
            if (result.data?.data) {
              setIsLoadingData(true);
              await processFeaturesData(result.data.data);
              setIsLoadingData(false);
            } else {
              setDataLoaded(true);
              setIsLoadingData(false);
            }
          } catch (refetchError) {
            setDataLoaded(true);
            setIsLoadingData(false);
          }
        }
        
        setIsRefreshingAfterDelete(false);
      },
    });

    // Get a unique feature item name that doesn't exist yet
    const getUniqueFeatureItemName = (featureNum: number, itemIndex: number): string => {
      const baseName = `Feature ${featureNum} - Feature Item ${itemIndex + 1}`;
      
      // Check if this name already exists in content elements
      const nameExists = contentElements.some(el => el.name === baseName);
      
      if (!nameExists) {
        return baseName;
      }
      
      // Find a unique name by appending a counter
      let counter = 1;
      let uniqueName = `${baseName} (${counter})`;
      
      while (contentElements.some(el => el.name === uniqueName)) {
        counter++;
        uniqueName = `${baseName} (${counter})`;
      }
      
      return uniqueName;
    };

    // Check if all languages have the same number of features
    const validateFeatureCounts = () => {
      const values = form.getValues();
      const counts = Object.values(values).map((features) => features?.length || 0);
      const allEqual = counts.every((count) => count === counts[0]);
      setFeatureCountMismatch(!allEqual);
      return allEqual;
    };

    // Effect to populate form with existing data
    useEffect(() => {
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }
      processFeaturesData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, slug]);

    // Track form changes with debounce
    useEffect(() => {
      if (isLoadingData || !dataLoaded) return;
      
      const timeoutId = setTimeout(() => {
        const subscription = form.watch((value) => {
          setHasUnsavedChanges(true);
          validateFeatureCounts();
          if (onDataChangeRef.current) {
            onDataChangeRef.current(value);
          }
        });
        return () => subscription.unsubscribe();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }, [form, isLoadingData, dataLoaded]);

    // Function to add a feature item - fixed to prevent duplications
    const addFeatureItem = (langCode: string, featureIndex: number) => {
      // Take a snapshot of current form values
      const snapshot = { ...form.getValues() };
      const updates: Record<string, any[]> = {};
      
      // For each language, update the feature items
      Object.keys(snapshot).forEach((lang) => {
        const features = [...(snapshot[lang] || [])];
        if (!features[featureIndex]) return;
        
        const feature = { ...features[featureIndex] };
        const featureItems = [...(feature.content.features || [])];
        
        // Add a new empty item
        featureItems.push("");
        
        // Update feature
        feature.content = {
          ...feature.content,
          features: featureItems,
        };
        
        features[featureIndex] = feature;
        updates[lang] = features;
      });
      
      // Apply all updates at once to maintain consistency
      Object.entries(updates).forEach(([lang, features]) => {
        form.setValue(lang as any, features, { 
          shouldDirty: true, 
          shouldValidate: true 
        });
      });
      
      // Validate after updates
      setTimeout(() => {
        validateFeatureCounts();
      }, 0);
      
      toast({
        title: t("featuresForm.featureForm.toast.itemAdded"),
        description: t("featuresForm.featureForm.toast.itemAddedDesc"),
      });
    };

    // Function to confirm feature item deletion - opens dialog
    const confirmRemoveFeatureItem = (langCode: string, featureIndex: number, itemIndex: number) => {
      const currentFeatures = form.getValues()[langCode] || [];
      const currentFeature = currentFeatures[featureIndex];
      
      if (!currentFeature || !currentFeature.content || !Array.isArray(currentFeature.content.features) || currentFeature.content.features.length <= 1) {
        toast({
          title: t("featuresForm.featureForm.validation.cannotRemove"),
          description: t("featuresForm.featureForm.validation.needAtLeastOneItem"),
          variant: "destructive",
        });
        return;
      }
      
      // Set the feature item to delete and open the dialog
      setFeatureItemToDelete({ langCode, featureIndex, itemIndex });
      setDeleteFeatureItemDialogOpen(true);
    };

    // Function to execute the feature item removal - called from dialog
    const removeFeatureItem = async () => {
      if (!featureItemToDelete) return;
      
      const { langCode, featureIndex, itemIndex } = featureItemToDelete;
      setIsDeletingFeatureItem(true);
      
      try {
        // Handle deletion from the server if we have existing content
        if (existingSubSectionId && contentElements.length > 0) {
          const featureNum = featureIndex + 1;
          
          // Find elements by feature number and type (Feature Item)
          const featureItemElements = contentElements.filter(
            element => element.name.includes(`Feature ${featureNum}`) && 
                     element.name.includes("Feature Item")
          );
          
          // Sort by item number
          featureItemElements.sort((a, b) => {
            const getItemNumber = (name: string) => {
              const match = name.match(/Feature Item (\d+)/i);
              return match ? parseInt(match[1], 10) : 999;
            };
            return getItemNumber(a.name) - getItemNumber(b.name);
          });
          
          // Get the element at the specific index position
          if (featureItemElements.length > itemIndex) {
            const elementToDelete = featureItemElements[itemIndex];
            
            if (elementToDelete) {
              await deleteContentElement.mutateAsync(elementToDelete._id);
              
              // Update content elements state
              setContentElements(prev => 
                prev.filter(item => item._id !== elementToDelete._id)
              );
              
              // Update tracking
              const featureKey = `${featureNum}`;
              if (featureItemIds[featureKey]) {
                const updatedIds = { ...featureItemIds };
                updatedIds[featureKey].delete(elementToDelete.name);
                setFeatureItemIds(updatedIds);
              }
            }
          }
        }

        // Update form values for all languages consistently
        const snapshot = { ...form.getValues() };
        const updates: Record<string, any[]> = {};
        
        Object.keys(snapshot).forEach((lang) => {
          const features = [...(snapshot[lang] || [])];
          if (!features[featureIndex]) return;
          
          const feature = { ...features[featureIndex] };
          if (!feature.content || !Array.isArray(feature.content.features)) return;
          
          const featureItems = [...feature.content.features];
          if (itemIndex >= 0 && itemIndex < featureItems.length) {
            featureItems.splice(itemIndex, 1);
            
            // Ensure at least one item remains
            if (featureItems.length === 0) {
              featureItems.push("");
            }
            
            feature.content = {
              ...feature.content,
              features: featureItems,
            };
            
            features[featureIndex] = feature;
            updates[lang] = features;
          }
        });
        
        // Apply all updates at once to maintain consistency
        Object.entries(updates).forEach(([lang, features]) => {
          form.setValue(lang as any, features, { shouldDirty: true });
        });
        
        validateFeatureCounts();
        
        toast({
          title: t("featuresForm.featureForm.toast.itemRemoved"),
          description: t("featuresForm.featureForm.toast.itemRemovedDesc"),
        });
      } catch (error) {
        console.error("Error removing feature item:", error);
        toast({
          title: t("featuresForm.featureForm.toast.errorRemoving"),
          description: t("featuresForm.featureForm.toast.errorRemoving"),
          variant: "destructive",
        });
      } finally {
        setIsDeletingFeatureItem(false);
        setDeleteFeatureItemDialogOpen(false);
        setFeatureItemToDelete(null);
      }
    };

    // Function to add a new feature
    const addFeature = (langCode: string) => {
      const newFeatureId = `feature-${Date.now()}`;
      const newFeature: Feature = {
        id: newFeatureId,
        title: "",
        content: {
          title: "",
          heading: "",
          description: "",
          features: [""],
          image: "",
          imagePosition: "right"
        },
      };

      // Add the feature to all languages simultaneously
      Object.keys(form.getValues()).forEach((lang) => {
        const currentFeatures = form.getValues()[lang] || [];
        const updatedFeatures = [...currentFeatures, newFeature];
        form.setValue(lang as any, updatedFeatures, { 
          shouldDirty: true, 
          shouldTouch: true, 
          shouldValidate: true 
        });
      });

      validateFeatureCounts();
      setHasUnsavedChanges(true);
      toast({
        title: t("featuresForm.featureForm.toast.featureAdded"),
        description: t("featuresForm.featureForm.toast.featureAddedDesc"),
      });
    };

    // Function to confirm feature deletion - opens dialog
    const confirmRemoveFeature = (langCode: string, featureIndex: number) => {
      const currentFeatures = form.getValues()[langCode] || [];
      if (currentFeatures.length <= 1) {
        toast({
          title: t("featuresForm.featureForm.validation.cannotRemove"),
          description: t("featuresForm.featureForm.validation.needAtLeastOneFeature"),
          variant: "destructive",
        });
        return;
      }
      
      // Set the feature to delete and open the dialog
      setFeatureToDelete({ langCode, index: featureIndex });
      setDeleteDialogOpen(true);
    };

    // Function to execute the feature removal - called from dialog
    const removeFeature = async () => {
      if (!featureToDelete) return;
      
      const { langCode, index: featureIndex } = featureToDelete;
      setIsDeleting(true);
      
      try {
        const currentFeatures = form.getValues()[langCode] || [];
        
        if (existingSubSectionId && contentElements.length > 0) {
          const featureNum = featureIndex + 1;
          const featureElements = contentElements.filter(
            (element) => element.name.includes(`Feature ${featureNum}`)
          );

          // Delete elements in parallel
          if (featureElements.length > 0) {
            await Promise.all(featureElements.map(element => 
              deleteContentElement.mutateAsync(element._id)
            ));
            
            // Update content elements state
            setContentElements(prev => 
              prev.filter(element => !element.name.includes(`Feature ${featureNum}`))
            );
            
            // Update tracking state
            const updatedIds = { ...featureItemIds };
            delete updatedIds[`${featureNum}`];
            setFeatureItemIds(updatedIds);
          }
        }

        // Update form values for all languages
        Object.keys(form.getValues()).forEach((lang) => {
          const features = [...(form.getValues()[lang] || [])];
          features.splice(featureIndex, 1);
          form.setValue(lang as any, features, { shouldDirty: true });
        });

        // Update feature image indices
        for (let i = featureIndex + 1; i < currentFeatures.length; i++) {
          updateFeatureImageIndices(i, i - 1);
        }

        // Remove the feature image
        handleFeatureImageRemove(featureIndex);

        setHasUnsavedChanges(true);
        validateFeatureCounts();
        
        toast({
          title: t("featuresForm.featureForm.toast.featureRemoved"),
          description: t("featuresForm.featureForm.toast.featureRemovedDesc"),
        });
      } catch (error) {
        console.error("Error removing feature:", error);
        toast({
          title: t("featuresForm.featureForm.toast.errorRemoving"),
          description: t("featuresForm.featureForm.toast.errorRemoving"),
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setFeatureToDelete(null);
      }
    };

    // Function to get feature counts by language - memoized
    const getFeatureCountsByLanguage = useMemo(() => {
      const values = form.getValues();
      return Object.entries(values).map(([langCode, features]) => ({
        language: langCode,
        count: Array.isArray(features) ? features.length : 0,
      }));
    }, [form, featureCountMismatch]);

    // Handle form save - optimized with parallel operations
    const handleSave = async () => {
      // Validate first before doing expensive operations
      const isValid = await form.trigger();
      const hasEqualFeatureCounts = validateFeatureCounts();
      
      if (!hasEqualFeatureCounts) {
        setIsValidationDialogOpen(true);
        return;
      }

      if (!isValid) {
        toast({
          title: t("featuresForm.featureForm.validation.fillRequiredFields"),
          description: t("featuresForm.featureForm.validation.fillRequiredFields"),
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      try {
        const allFormValues = form.getValues();
        let sectionId = existingSubSectionId;

        // Create subsection if needed
        if (!existingSubSectionId) {
          const subsectionData = {
            name: "Features Section",
            slug: slug || `features-section-${Date.now()}`,
            description: "Features section for the website",
            isActive: true,
            order: 0,
            defaultContent: "",
            sectionItem: ParentSectionId,
            languages: languageIds as string[],
            WebSiteId: websiteId
          };
          
          const newSubSection = await createSubSection.mutateAsync(subsectionData);
          sectionId = newSubSection.data._id;
          setExistingSubSectionId(sectionId);
        }

        if (!sectionId) {
          throw new Error("Failed to create or retrieve subsection ID");
        }

        // Create language map for quick lookups
        const langCodeToIdMap = activeLanguages.reduce((acc, lang) => {
          acc[lang.languageID] = lang._id;
          return acc;
        }, {});

        const firstLangCode = Object.keys(allFormValues)[0];
        const features = allFormValues[firstLangCode];

        if (!Array.isArray(features)) {
          throw new Error("Invalid features data");
        }

        // Find highest feature number for proper ordering
        let highestFeatureNum = 0;
        contentElements.forEach((element) => {
          const featureMatch = element.name.match(/Feature (\d+)/i);
          if (featureMatch) {
            const num = parseInt(featureMatch[1], 10);
            if (num > highestFeatureNum) {
              highestFeatureNum = num;
            }
          }
        });

        // Keep track of processed elements to avoid orphaned elements
        const processedElementIds = new Set<string>();
        
        // Keep track of next available item number for each feature
        const featureItemNumbers: Record<number, number> = {};
        
        // Process each feature
        for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
          const featureNum = featureIndex + 1;
          const headingElementName = `Feature ${featureNum} - Heading`;
          const titleElementName = `Feature ${featureNum} - Title`;
          const descElementName = `Feature ${featureNum} - Description`;
          const imageElementName = `Feature ${featureNum} - Image`;
          
          // Check if this feature already exists
          const existingHeading = contentElements.find((e) => e.name === headingElementName);
          const existingTitle = contentElements.find((e) => e.name === titleElementName);
          const existingDesc = contentElements.find((e) => e.name === descElementName);
          const existingImage = contentElements.find((e) => e.type === "image" && e.name === imageElementName);

          if (existingHeading || existingTitle) {
            // Update existing feature
            const translations: (Omit<ContentTranslation, "_id"> & { id?: string })[] | { content: any; language: any; contentElement: any; isActive: boolean }[] = [];
            
            // Mark these elements as processed
            if (existingHeading) processedElementIds.add(existingHeading._id);
            if (existingTitle) processedElementIds.add(existingTitle._id);
            if (existingDesc) processedElementIds.add(existingDesc._id);
            if (existingImage) processedElementIds.add(existingImage._id);
            
            // Process translations for all languages
            Object.entries(allFormValues).forEach(([langCode, langFeatures]) => {
              const langId = langCodeToIdMap[langCode];
              if (!langId || !Array.isArray(langFeatures) || !langFeatures[featureIndex]) return;

              const feature = langFeatures[featureIndex];
              
              // Add base elements translations
              if (existingHeading) {
                translations.push({
                  content: feature.content.heading || "",
                  language: langId,
                  contentElement: existingHeading._id,
                  isActive: true,
                });
              }

              if (existingTitle) {
                translations.push({
                  content: feature.title || "",
                  language: langId,
                  contentElement: existingTitle._id,
                  isActive: true,
                });
              }

              if (existingDesc) {
                translations.push({
                  content: feature.content.description || "",
                  language: langId,
                  contentElement: existingDesc._id,
                  isActive: true,
                });
              }

              // Get existing feature item elements
              const featureItems = feature.content.features || [];
              
              // Sort existing feature item elements by their index
              const existingFeatureItems = contentElements
                .filter(e => e.name.includes(`Feature ${featureNum}`) && e.name.includes("Feature Item"))
                .sort((a, b) => {
                  const aMatch = a.name.match(/Feature Item (\d+)/i);
                  const bMatch = b.name.match(/Feature Item (\d+)/i);
                  return aMatch && bMatch 
                    ? parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10) 
                    : 0;
                });
                
              // Initialize next available number for feature items
              if (!featureItemNumbers[featureNum]) {
                featureItemNumbers[featureNum] = 1;
                
                // Find the highest existing item number
                existingFeatureItems.forEach(item => {
                  const match = item.name.match(/Feature Item (\d+)/i);
                  if (match) {
                    const num = parseInt(match[1], 10);
                    if (num >= featureItemNumbers[featureNum]) {
                      featureItemNumbers[featureNum] = num + 1;
                    }
                  }
                });
              }
              
              // Process each feature item - match with existing elements when possible
              for (let itemIndex = 0; itemIndex < featureItems.length; itemIndex++) {
                const item = featureItems[itemIndex];
                
                // Try to use an existing element if available at this index
                let itemElement = existingFeatureItems[itemIndex];
                
                if (itemElement) {
                  // Mark as processed
                  processedElementIds.add(itemElement._id);
                  
                  // Add translation
                  translations.push({
                    content: item,
                    language: langId,
                    contentElement: itemElement._id,
                    isActive: true,
                  });
                } else {
                  // Create a new feature item element with unique name
                  const itemName = getUniqueFeatureItemName(featureNum, featureItemNumbers[featureNum] - 1);
                  featureItemNumbers[featureNum]++;
                  
                  // Create the element
                  createContentElement.mutateAsync({
                    name: itemName,
                    type: "text",
                    parent: sectionId,
                    isActive: true,
                    order: itemIndex,
                    defaultContent: item || "",
                  }).then((newElement) => {
                    // Add the new element to our content elements
                    setContentElements(prev => [...prev, newElement.data]);
                    
                    // Add translation
                    bulkUpsertTranslations.mutateAsync([{
                      content: item,
                      language: langId,
                      contentElement: newElement.data._id,
                      isActive: true,
                    }]);
                  });
                }
              }
            });

            // Send translations in batches for better reliability
            if (translations.length > 0) {
              const batchSize = 20;
              for (let i = 0; i < translations.length; i += batchSize) {
                const batch = translations.slice(i, i + batchSize);
                await bulkUpsertTranslations.mutateAsync(batch);
              }
            }

            // Handle image upload if available
            const imageFile = featureImages[featureIndex];
            if (imageFile && existingImage) {
              const formData = new FormData();
              formData.append("image", imageFile);
              const uploadResult = await apiClient.post(`/content-elements/${existingImage._id}/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              
              if (uploadResult.data?.imageUrl) {
                Object.keys(allFormValues).forEach((langCode) => {
                  if (allFormValues[langCode] && allFormValues[langCode][featureIndex]) {
                    form.setValue(`${langCode}.${featureIndex}.content.image` as any, uploadResult.data.imageUrl);
                  }
                });
              }
            }
          } else {
            // Create new feature with a unique feature number
            const actualFeatureNum = highestFeatureNum + 1;
            highestFeatureNum = actualFeatureNum;

            // Define element types to create
            const elementTypes = [
              { type: "image", key: "image", name: `Feature ${actualFeatureNum} - Image` },
              { type: "text", key: "title", name: `Feature ${actualFeatureNum} - Title` },
              { type: "text", key: "heading", name: `Feature ${actualFeatureNum} - Heading` },
              { type: "text", key: "description", name: `Feature ${actualFeatureNum} - Description` },
            ];

            // Create elements in parallel
            const elementPromises = elementTypes.map(async (el, index) => {
              let defaultContent = "";
              if (el.type === "image") {
                defaultContent = "image-placeholder";
              } else if (el.type === "text" && allFormValues[firstLangCode]) {
                const feature = allFormValues[firstLangCode][featureIndex];
                if (el.key === "title") {
                  defaultContent = feature.title || "";
                } else if (feature?.content && el.key in feature.content) {
                  defaultContent = feature.content[el.key] || "";
                }
              }

              const elementData = {
                name: el.name,
                type: el.type,
                parent: sectionId,
                isActive: true,
                order: index,
                defaultContent: defaultContent,
              };
              
              const newElement = await createContentElement.mutateAsync(elementData);
              processedElementIds.add(newElement.data._id);
              return { ...newElement.data, key: el.key };
            });
            
            const createdElements = await Promise.all(elementPromises);

            // Initialize feature item counter
            featureItemNumbers[actualFeatureNum] = 1;
            
            // Create feature items with guaranteed unique names
            const featureItems = features[featureIndex].content.features || [];
            const itemPromises = featureItems.map(async (item: any, itemIndex: number) => {
              const itemName = `Feature ${actualFeatureNum} - Feature Item ${featureItemNumbers[actualFeatureNum]}`;
              featureItemNumbers[actualFeatureNum]++;
              
              const elementData = {
                name: itemName,
                type: "text",
                parent: sectionId,
                isActive: true,
                order: itemIndex,
                defaultContent: item || "",
              };
              
              const newElement = await createContentElement.mutateAsync(elementData);
              processedElementIds.add(newElement.data._id);
              return { ...newElement.data, itemIndex };
            });
            
            const featureItemElements = await Promise.all(itemPromises);

            // Handle image upload for new feature
            const imageElement = createdElements.find((e) => e.key === "image");
            const imageFile = featureImages[featureIndex];
            if (imageElement && imageFile) {
              const formData = new FormData();
              formData.append("image", imageFile);
              const uploadResult = await apiClient.post(`/content-elements/${imageElement._id}/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              
              if (uploadResult.data?.imageUrl) {
                Object.keys(allFormValues).forEach((langCode) => {
                  if (allFormValues[langCode] && allFormValues[langCode][featureIndex]) {
                    form.setValue(`${langCode}.${featureIndex}.content.image` as any, uploadResult.data.imageUrl);
                  }
                });
              }
            }

            // Prepare translations for all languages
            const translations = [];
            for (const [langCode, langFeatures] of Object.entries(allFormValues)) {
              const langId = langCodeToIdMap[langCode];
              if (!langId || !Array.isArray(langFeatures) || !langFeatures[featureIndex]) continue;

              const feature = langFeatures[featureIndex];
              
              // Add translations for base elements
              for (const element of createdElements) {
                if (element.key === "image") continue;
                
                if (element.key === "title") {
                  translations.push({
                    content: feature.title || "",
                    language: langId,
                    contentElement: element._id,
                    isActive: true,
                  });
                } else if (feature.content && element.key in feature.content) {
                  translations.push({
                    content: feature.content[element.key] || "",
                    language: langId,
                    contentElement: element._id,
                    isActive: true,
                  });
                }
              }

              // Add feature item translations
              const items = feature.content?.features || [];
              for (let i = 0; i < items.length && i < featureItemElements.length; i++) {
                translations.push({
                  content: items[i] || "",
                  language: langId,
                  contentElement: featureItemElements[i]._id,
                  isActive: true,
                });
              }
            }

            // Send translations in batches for better reliability
            if (translations.length > 0) {
              const batchSize = 20;
              for (let i = 0; i < translations.length; i += batchSize) {
                const batch = translations.slice(i, i + batchSize);
                await bulkUpsertTranslations.mutateAsync(batch);
              }
            }
          }
        }
        
        // Clean up orphaned elements - those that weren't processed but exist
        const orphanedElements = contentElements.filter(el => !processedElementIds.has(el._id));
        
        if (orphanedElements.length > 0) {
          await Promise.all(orphanedElements.map(element => 
            deleteContentElement.mutateAsync(element._id)
          ));
          
          // Update content elements state
          setContentElements(prev => 
            prev.filter(el => !orphanedElements.some(orphan => orphan._id === el._id))
          );
        }

        toast({
          title: existingSubSectionId ? t("featuresForm.featureForm.toast.sectionUpdated") : t("featuresForm.featureForm.toast.sectionCreated"),
          description: t("featuresForm.featureForm.toast.contentSaved"),
          duration: 5000,
        });

        setHasUnsavedChanges(false);

        // Reload data after save if we have a slug
        if (slug) {
          const result = await refetch();
          if (result.data?.data) {
            setDataLoaded(false);
            processFeaturesData(result.data.data);
          }
        }
      } catch (error) {
        console.error("Operation failed:", error);
        toast({
          title: existingSubSectionId ? t("featuresForm.featureForm.toast.errorUpdating") : t("featuresForm.featureForm.toast.errorCreating"),
          variant: "destructive",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          duration: 5000,
        });
      } finally {
        setIsSaving(false);
      }
    };

    // Expose form ref for parent component
    createFormRef(ref, {
      form,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      existingSubSectionId,
      contentElements,
      componentName: 'Features',
      extraMethods: {
        getFeatureImages: () => featureImages,
        saveData: handleSave,
        deleteData: deleteManager.handleDelete,
      },
      extraData: {
        existingSubSectionId
      }
    });

    // Get language codes for display
    const languageCodes = useMemo(() => 
      createLanguageCodeMap(activeLanguages),
      [activeLanguages]
    );

    return (
      <div className="space-y-6">
        {/* Loading Dialogs */}
        <LoadingDialog
          isOpen={isSaving}
          title={existingSubSectionId ? t("featuresForm.featureForm.loading.updatingSection") : t("featuresForm.featureForm.loading.creatingSection")}
          description={t("featuresForm.featureForm.loading.pleaseWait")}
        />
        
        <LoadingDialog
          isOpen={deleteManager.isDeleting}
          title={t("featuresForm.featureForm.loading.deletingSection")}
          description={t("featuresForm.featureForm.loading.pleaseWait")}
        />

        <LoadingDialog
          isOpen={isRefreshingAfterDelete}
          title={t("featuresForm.featureForm.loading.refreshingData")}
          description={t("featuresForm.featureForm.loading.pleaseWait")}
        />

        {/* Subsection Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          {...deleteManager.confirmationDialogProps}
          title={t("featuresForm.featureForm.dialogs.deleteSection.title")}
          description={t("featuresForm.featureForm.dialogs.deleteSection.description")}
        />
        
        {/* Individual Feature Delete Dialog */}
        <DeleteSectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={featureToDelete ? t("featuresForm.featureForm.featureTitle", { number: featureToDelete.index + 1 }) : ''}
          onConfirm={removeFeature}
          isDeleting={isDeleting}
          title={t("featuresForm.featureForm.dialogs.deleteFeature.title")}
          confirmText={t("featuresForm.featureForm.dialogs.deleteFeature.confirmText")}
        />
        
        {/* Individual Feature Item Delete Dialog */}
        <DeleteSectionDialog
          open={deleteFeatureItemDialogOpen}
          onOpenChange={setDeleteFeatureItemDialogOpen}
          serviceName={featureItemToDelete ? t("featuresForm.featureItem.placeholder", { number: featureItemToDelete.itemIndex + 1 }) : ''}
          onConfirm={removeFeatureItem}
          isDeleting={isDeletingFeatureItem}
          title={t("featuresForm.featureForm.dialogs.deleteFeatureItem.title")}
          confirmText={t("featuresForm.featureForm.dialogs.deleteFeatureItem.confirmText")}
        />
        
        {/* Main Form */}
       <Form {...form}>
          <LanguageTabs
            languageCards={languageIds.map((langId) => {
              const langCode = languageCodes[langId] || langId;
              return {
                langId,
                langCode,
                languageIds,
                form,
                onAddFeature: addFeature,
                onRemoveFeature: confirmRemoveFeature,
                onAddFeatureItem: addFeatureItem,
                onRemoveFeatureItem: confirmRemoveFeatureItem,
                FeatureImageUploader,
              };
            })}
          />
        </Form>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          {/* Delete Section Button - Only show if there's an existing subsection */}
          {existingSubSectionId && (
            <Button
              type="button"
              variant="destructive"
              onClick={deleteManager.openDeleteDialog}
              disabled={isLoadingData || isSaving || deleteManager.isDeleting || isRefreshingAfterDelete}
              className="flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("featuresForm.featureForm.actions.delete")}
            </Button>
          )}

          {/* Save Button and Validation Warning */}
          <div className={`flex items-center gap-4 ${existingSubSectionId ? "" : "ml-auto"}`}>
            {featureCountMismatch && (
              <div className="flex items-center text-amber-500">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">{t("featuresForm.featureForm.validation.featureCountMismatch")}</span>
              </div>
            )}
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || featureCountMismatch || deleteManager.isDeleting || isRefreshingAfterDelete}
              className="flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("featuresForm.featureForm.actions.saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {existingSubSectionId ? t("featuresForm.featureForm.actions.update") : t("featuresForm.featureForm.actions.save")}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Feature Count Mismatch Dialog */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("featuresForm.featureForm.dialogs.validationError.title")}</DialogTitle>
              <DialogDescription>
                <div className="mt-4 mb-4">
                  {t("featuresForm.featureForm.dialogs.validationError.description")}
                </div>
                <ul className="list-disc pl-6 space-y-1">
                  {getFeatureCountsByLanguage.map(({ language, count }) => (
                    <li key={language}>
                      <span className="font-semibold uppercase">{language}</span>: {count} features
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
    );
  }
);

FeaturesForm.displayName = "FeaturesForm";
export default FeaturesForm;