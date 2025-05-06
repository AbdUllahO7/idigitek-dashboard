"use client"

import type React from "react"
import { forwardRef, useEffect, useState, useRef, memo, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Form,
} from "@/src/components/ui/form"
import { Plus,  Save, AlertTriangle, X, Loader2 } from "lucide-react"
import { Accordion } from "@/src/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubSections } from "@/src/hooks/webConfiguration/use-subSections"
import { useContentElements } from "@/src/hooks/webConfiguration/use-content-elements"
import { useContentTranslations } from "@/src/hooks/webConfiguration/use-conent-translitions"
import apiClient from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { createFeaturesSchema } from "../../Utils/language-specifi-schemas"
import { createFeaturesDefaultValues } from "../../Utils/Language-default-values"
import { createFormRef } from "../../Utils/Expose-form-data"
import { processAndLoadData } from "../../Utils/load-form-data"
import { createLanguageCodeMap } from "../../Utils/language-utils"
import { useFeatureImages } from "../../Utils/Image-uploader"
import { LoadingDialog } from "@/src/utils/MainSectionComponents"
import DeleteServiceDialog from "@/src/components/DeleteServiceDialog"
import { FeatureForm } from "./FeatureForm"
import { SubSection } from "@/src/api/types/hooks/section.types"
import { Feature } from "@/src/api/types/hooks/MultilingualSection.types"
import { ContentTranslation } from "@/src/api/types/hooks/content.types"

// Helper type to infer the schema type
type FeaturesSchemaType = ReturnType<typeof createFeaturesSchema>




interface LanguageCardProps {
  langId: string;
  langCode: string;
  languageIds: string[];
  form: any;
  onRemoveFeature: (langCode: string, index: number) => void;
  onAddFeature: (langCode: string) => void;
  onAddFeatureItem: (langCode: string, featureIndex: number) => void;
  onRemoveFeatureItem: (langCode: string, featureIndex: number, itemIndex: number) => void;
  FeatureImageUploader: React.ComponentType<any>;
}

// Language Card component - memoized to prevent unnecessary re-renders
const LanguageCard = memo(({
  langId,
  langCode,
  languageIds,
  form,
  onRemoveFeature,
  onAddFeature,
  onAddFeatureItem,
  onRemoveFeatureItem,
  FeatureImageUploader
}: LanguageCardProps) => {
  const features = form.watch(`${langCode}` as any) || [];
  
  return (
    <Card key={langId} className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Features Section
        </CardTitle>
        <CardDescription>Manage features content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {features.map((feature: { title: string; content: { heading: string; description: string; features: any[] } }, index: number) => (
            <FeatureForm
              key={`${langCode}-feature-${index}`}
              index={index}
              feature={feature}
              langCode={langCode}
              langId={langId}
              languageIds={languageIds}
              form={form}
              onRemoveFeature={onRemoveFeature}
              onAddFeatureItem={onAddFeatureItem}
              onRemoveFeatureItem={onRemoveFeatureItem}
              FeatureImageUploader={FeatureImageUploader}
            />
          ))}
        </Accordion>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => onAddFeature(langCode)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </CardContent>
    </Card>
  );
});

LanguageCard.displayName = "LanguageCard";

interface FeaturesFormProps {
  languageIds: string[];
  activeLanguages: any[];
  onDataChange?: (value: any) => void;
  slug?: string;
  ParentSectionId?: string;
}

const FeaturesForm = forwardRef<any, FeaturesFormProps>(
  ({ languageIds, activeLanguages, onDataChange, slug, ParentSectionId }, ref) => {
    // Memoize schema and default values
    const featuresSchema = useMemo(() => 
      createFeaturesSchema(languageIds, activeLanguages),
      [languageIds, activeLanguages]
    );
    
    const defaultValues = useMemo(() => 
      createFeaturesDefaultValues(languageIds, activeLanguages),
      [languageIds, activeLanguages]
    );

    const [isLoadingData, setIsLoadingData] = useState(!slug);
    const [dataLoaded, setDataLoaded] = useState(!slug);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [featureCountMismatch, setFeatureCountMismatch] = useState(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [existingSubSectionId, setExistingSubSectionId] = useState<string | null>(null);
    const [contentElements, setContentElements] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
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
    });

    // Initialize useFeatureImages hook
    const { featureImages, handleFeatureImageUpload, handleFeatureImageRemove, updateFeatureImageIndices, FeatureImageUploader } = useFeatureImages(form);

    // Use ref to prevent unnecessary effect reruns
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
    const deleteContentElement = useDeleteContentElement();
    const bulkUpsertTranslations = useBulkUpsertTranslations();

    // Query for complete subsection data by slug if provided
    const {
      data: completeSubsectionData,
      isLoading: isLoadingSubsection,
      refetch,
    } = useGetCompleteBySlug(slug || "", Boolean(slug));

    // Check if all languages have the same number of features
    const validateFeatureCounts = useRef(() => {
      const values = form.getValues();
      const counts = Object.values(values).map((features) => features?.length || 0);
      const allEqual = counts.every((count) => count === counts[0]);
      setFeatureCountMismatch(!allEqual);
      return allEqual;
    }).current;

    // Function to process and load data into the form - memoized
    const processFeaturesData = useRef((subsectionData: SubSection | null) => {
      processAndLoadData(
        subsectionData,
        form,
        languageIds,
        activeLanguages,
        {
          groupElements: (elements) => {
            const featureGroups: Record<string, any[]> = {};
            elements.forEach((element) => {
              const featureIdMatch = element.name.match(/Feature (\d+)/i);
              if (featureIdMatch) {
                const featureId = featureIdMatch[1];
                if (!featureGroups[featureId]) {
                  featureGroups[featureId] = [];
                }
                featureGroups[featureId].push(element);
              }
            });
            return featureGroups;
          },
          processElementGroup: (featureId, elements, langId, getTranslationContent) => {
            const titleElement = elements.find((el) => el.name.includes("Title"));
            const headingElement = elements.find((el) => el.name.includes("Heading"));
            const descriptionElement = elements.find((el) => el.name.includes("Description"));
            const imageElement = elements.find((el) => el.name.includes("Image") && el.type === "image");
            const featureListElements = elements.filter((el) => el.name.includes("Feature Item"));

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
    }).current;

    // Effect to populate form with existing data
    useEffect(() => {
      if (!slug || dataLoaded || isLoadingSubsection || !completeSubsectionData?.data) {
        return;
      }
      setIsLoadingData(true);
      processFeaturesData(completeSubsectionData.data);
    }, [completeSubsectionData, isLoadingSubsection, dataLoaded, slug, processFeaturesData]);

    // Track form changes with debounce for better performance
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
    }, [form, isLoadingData, dataLoaded, validateFeatureCounts]);

    // Function to add a feature item
    const addFeatureItem = (langCode: string, featureIndex: number) => {
      Object.keys(form.getValues()).forEach((lang) => {
        const features = [...(form.getValues()[lang] || [])];
        if (features[featureIndex]) {
          const feature = { ...features[featureIndex] };
          const featureItems = [...(feature.content.features || [])];
          featureItems.push("");
          feature.content = {
            ...feature.content,
            features: featureItems,
          };
          features[featureIndex] = feature;
          form.setValue(lang as any, features, { 
            shouldDirty: true, 
            shouldValidate: true 
          });
        }
      });
      
      toast({
        title: "Feature item added",
        description: "A new feature item has been added to the list.",
      });
    };

    // Function to confirm feature item deletion - opens dialog
    const confirmRemoveFeatureItem = (langCode: string, featureIndex: number, itemIndex: number) => {
      const currentFeatures = form.getValues()[langCode] || [];
      const currentFeature = currentFeatures[featureIndex];
      
      if (!currentFeature || currentFeature.content.features.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one feature item",
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
        if (existingSubSectionId && contentElements.length > 0) {
          const featureNum = featureIndex + 1;
          const itemNum = itemIndex + 1;
          const featureItemElement = contentElements.find(
            (element) => element.name === `Feature ${featureNum} - Feature Item ${itemNum}`
          );
          
          if (featureItemElement) {
            await deleteContentElement.mutateAsync(featureItemElement._id);
            
            // Update content elements state after deletion
            setContentElements(prev => 
              prev.filter(item => item._id !== featureItemElement._id)
            );
          }
        }

        // Update form values for all languages
        Object.keys(form.getValues()).forEach((lang) => {
          const features = [...(form.getValues()[lang] || [])];
          if (features[featureIndex]) {
            const feature = { ...features[featureIndex] };
            const featureItems = [...(feature.content.features || [])];
            featureItems.splice(itemIndex, 1);
            feature.content = {
              ...feature.content,
              features: featureItems,
            };
            features[featureIndex] = feature;
            form.setValue(lang as any, features, { shouldDirty: true });
          }
        });
        
        toast({
          title: "Item removed",
          description: "The feature item has been removed successfully.",
        });
      } catch (error) {
        console.error("Error removing feature item:", error);
        toast({
          title: "Error",
          description: "There was an error removing the feature item.",
          variant: "destructive",
        });
      } finally {
        setIsDeletingFeatureItem(false);
      }
    };

    // Function to add a new feature
    const addFeature = (langCode: string) => {
      const newFeatureId = `feature-${Date.now()}`;
      const newFeature: Feature = {
        id: newFeatureId,
        title: "",
        content: {
          title:"",
          heading: "",
          description: "",
          features: [""],
          image: "",
          imagePosition : "right"
        },
      };

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
        title: "Feature added",
        description: "A new feature has been added. Please fill in the details and save your changes.",
      });
    };

    // Function to confirm feature deletion - opens dialog
    const confirmRemoveFeature = (langCode: string, featureIndex: number) => {
      const currentFeatures = form.getValues()[langCode] || [];
      if (currentFeatures.length <= 1) {
        toast({
          title: "Cannot remove",
          description: "You need at least one feature",
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

          // Delete elements in parallel for better performance
          if (featureElements.length > 0) {
            await Promise.all(featureElements.map(element => 
              deleteContentElement.mutateAsync(element._id)
            ));
            
            // Update content elements state after deletion
            setContentElements(prev => 
              prev.filter(element => !element.name.includes(`Feature ${featureNum}`))
            );
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
          title: "Feature removed",
          description: "The feature has been removed successfully.",
        });
      } catch (error) {
        console.error("Error removing feature:", error);
        toast({
          title: "Error",
          description: "There was an error removing the feature.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
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
          title: "Validation Error",
          description: "Please fill all required fields correctly",
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
            defaultContent : "",
            sectionItem: ParentSectionId,
            languages: languageIds as string[],
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

        // Process each feature
        const featurePromises = [];
        for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
          featurePromises.push((async () => {
            const featureNum = featureIndex + 1;
            const headingElementName = `Feature ${featureNum} - Heading`;
            const titleElementName = `Feature ${featureNum} - Title`;
            const existingHeading = contentElements.find((e) => e.name === headingElementName);
            const existingTitle = contentElements.find((e) => e.name === titleElementName);

            if (existingHeading || existingTitle) {
              // Update existing feature
              const translations: (Omit<ContentTranslation, "_id"> & { id?: string })[] | { content: any; language: any; contentElement: any; isActive: boolean }[] = [];
              
              Object.entries(allFormValues).forEach(([langCode, langFeatures]) => {
                const langId = langCodeToIdMap[langCode];
                if (!langId || !Array.isArray(langFeatures) || !langFeatures[featureIndex]) return;

                const feature = langFeatures[featureIndex];
                const headingElement = contentElements.find((e) => e.name === `Feature ${featureNum} - Heading`);
                const titleElement = contentElements.find((e) => e.name === `Feature ${featureNum} - Title`);
                const descriptionElement = contentElements.find((e) => e.name === `Feature ${featureNum} - Description`);

                if (headingElement) {
                  translations.push({
                    content: feature.content.heading,
                    language: langId,
                    contentElement: headingElement._id,
                    isActive: true,
                  });
                }

                if (titleElement) {
                  translations.push({
                    content: feature.title,
                    language: langId,
                    contentElement: titleElement._id,
                    isActive: true,
                  });
                }

                if (descriptionElement) {
                  translations.push({
                    content: feature.content.description,
                    language: langId,
                    contentElement: descriptionElement._id,
                    isActive: true,
                  });
                }

                const featureItems = feature.content.features || [];
                featureItems.forEach((item: any, itemIndex: number) => {
                  const itemName = `Feature ${featureNum} - Feature Item ${itemIndex + 1}`;
                  const itemElement = contentElements.find((e) => e.name === itemName);

                  if (itemElement) {
                    translations.push({
                      content: item,
                      language: langId,
                      contentElement: itemElement._id,
                      isActive: true,
                    });
                  } else {
                    // Create new feature item element
                    createContentElement.mutateAsync({
                      name: itemName,
                      type: "text",
                      parent: sectionId,
                      isActive: true,
                      order: itemIndex,
                      defaultContent: item,
                    }).then((newElement) => {
                      bulkUpsertTranslations.mutateAsync([{
                        content: item,
                        language: langId,
                        contentElement: newElement.data._id,
                        isActive: true,
                      }]);
                    });
                  }
                });
              });

              // Batch translations for better performance
              if (translations.length > 0) {
                await bulkUpsertTranslations.mutateAsync(translations);
              }

              // Handle image upload if available
              const imageFile = featureImages[featureIndex];
              if (imageFile) {
                const imageElement = contentElements.find((e) => e.type === "image" && e.name === `Feature ${featureNum} - Image`);
                if (imageElement) {
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
              }
            } else {
              // Create new feature
              const actualFeatureNum = highestFeatureNum + 1;
              highestFeatureNum = actualFeatureNum;

              const elementTypes = [
                { type: "image", key: "image", name: `Feature ${actualFeatureNum} - Image` },
                { type: "text", key: "title", name: `Feature ${actualFeatureNum} - Title` },
                { type: "text", key: "heading", name: `Feature ${actualFeatureNum} - Heading` },
                { type: "text", key: "description", name: `Feature ${actualFeatureNum} - Description` },
              ];

              // Create elements in parallel for better performance
              const elementPromises = elementTypes.map(async (el, index) => {
                let defaultContent = "";
                if (el.type === "image") {
                  defaultContent = "image-placeholder";
                } else if (el.type === "text" && allFormValues[firstLangCode]) {
                  const feature = allFormValues[firstLangCode][featureIndex];
                  if (el.key === "title") {
                    defaultContent = feature.title || "";
                  } else if (feature?.content && el.key in feature.content) {
                    defaultContent = feature.content[el.key];
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
                return { ...newElement.data, key: el.key };
              });
              
              const createdElements = await Promise.all(elementPromises);

              // Create feature items in parallel
              const featureItems = features[featureIndex].content.features || [];
              const itemPromises = featureItems.map(async (item: any, itemIndex: number) => {
                const itemName = `Feature ${actualFeatureNum} - Feature Item ${itemIndex + 1}`;
                const elementData = {
                  name: itemName,
                  type: "text",
                  parent: sectionId,
                  isActive: true,
                  order: itemIndex,
                  defaultContent: item || "",
                };
                
                const newElement = await createContentElement.mutateAsync(elementData);
                return { ...newElement.data, itemIndex };
              });
              
              const featureItemElements = await Promise.all(itemPromises);

              // Handle image upload
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
                for (const element of createdElements) {
                  if (element.key === "image") continue;
                  if (element.key === "title") {
                    translations.push({
                      content: feature.title,
                      language: langId,
                      contentElement: element._id,
                      isActive: true,
                    });
                  } else if (feature.content && element.key in feature.content) {
                    translations.push({
                      content: feature.content[element.key],
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
                    content: items[i],
                    language: langId,
                    contentElement: featureItemElements[i]._id,
                    isActive: true,
                  });
                }
              }

              // Send translations in smaller batches for better reliability
              if (translations.length > 0) {
                const batchSize = 20;
                for (let i = 0; i < translations.length; i += batchSize) {
                  const batch = translations.slice(i, i + batchSize);
                  await bulkUpsertTranslations.mutateAsync(batch);
                }
              }
            }
          })());
        }

        // Wait for all features to be processed
        await Promise.all(featurePromises);

        toast({
          title: existingSubSectionId ? "Features section updated successfully!" : "Features section created successfully!",
          description: "All content has been saved.",
          duration: 5000,
        });

        setHasUnsavedChanges(false);

        // Reload data after save if we have a slug
        if (slug) {
          const result = await refetch();
          if (result.data?.data) {
            setDataLoaded(false);
            await processFeaturesData(result.data.data);
          }
        }
      } catch (error) {
        console.error("Operation failed:", error);
        toast({
          title: existingSubSectionId ? "Error updating features section" : "Error creating features section",
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
      },
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
          <p className="text-muted-foreground">Loading features section data...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Loading Dialog */}
        <LoadingDialog
          isOpen={isSaving}
          title={existingSubSectionId ? "Updating Features Section" : "Creating Features Section"}
          description="Please wait while we save your changes..."
        />
        
        {/* Main Form */}
        <Form {...form}>
          <div className="grid grid-cols-1 gap-6">
            {languageIds.map((langId) => {
              const langCode = languageCodes[langId] || langId;
              return (
                <LanguageCard
                  key={langId}
                  langId={langId}
                  langCode={langCode}
                  languageIds={languageIds}
                  form={form}
                  onAddFeature={addFeature}
                  onRemoveFeature={confirmRemoveFeature}
                  onAddFeatureItem={addFeatureItem}
                  onRemoveFeatureItem={confirmRemoveFeatureItem}
                  FeatureImageUploader={FeatureImageUploader}
                />
              );
            })}
          </div>
        </Form>
        
        {/* Save Button */}
        <div className="flex justify-end mt-6">
          {featureCountMismatch && (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Each language must have the same number of features</span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingData || isSaving || featureCountMismatch}
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
                {existingSubSectionId ? "Update Features Content" : "Save Features Content"}
              </>
            )}
          </Button>
        </div>
        
        {/* Feature Count Mismatch Dialog */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feature Count Mismatch</DialogTitle>
              <DialogDescription>
                <div className="mt-4 mb-4">
                  Each language must have the same number of features before saving. Please add or remove features to
                  ensure all languages have the same count:
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
        
        {/* Delete Feature Confirmation Dialog */}
        <DeleteServiceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          serviceName={featureToDelete ? `Feature ${featureToDelete.index + 1}` : ''}
          onConfirm={removeFeature}
          isDeleting={isDeleting}
          title="Delete Feature"
          confirmText="Delete Feature"
        />
        
        {/* Delete Feature Item Confirmation Dialog */}
        <DeleteServiceDialog
          open={deleteFeatureItemDialogOpen}
          onOpenChange={setDeleteFeatureItemDialogOpen}
          serviceName={featureItemToDelete ? `Feature Item ${featureItemToDelete.itemIndex + 1}` : ''}
          onConfirm={removeFeatureItem}
          isDeleting={isDeletingFeatureItem}
          title="Delete Feature Item"
          confirmText="Delete Item"
        />
      </div>
    );
  }
);

FeaturesForm.displayName = "FeaturesForm";
export default FeaturesForm;