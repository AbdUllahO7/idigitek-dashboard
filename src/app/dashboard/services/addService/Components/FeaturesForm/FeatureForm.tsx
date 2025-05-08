import { AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { memo } from "react";
import { FeatureItem } from "./FeatureItem";

interface FeatureFormProps {
  index: number;
  feature: {
    title: string;
    content: {
      heading: string;
      description: string;
      features: any[];
    };
  };
  langCode: string;
  langId: string;
  languageIds: string[];
  form: any;
  onRemoveFeature: (langCode: string, index: number) => void;
  onAddFeatureItem: (langCode: string, index: number) => void;
  onRemoveFeatureItem: (langCode: string, featureIndex: number, itemIndex: number) => void;
  FeatureImageUploader: React.ComponentType<{ featureIndex: number }>;
}

// Feature Form component - memoized to prevent unnecessary re-renders
export const FeatureForm = memo(({
  index,
  feature,
  langCode,
  langId,
  languageIds,
  form,
  onRemoveFeature,
  onAddFeatureItem,
  onRemoveFeatureItem,
  FeatureImageUploader
} :FeatureFormProps ) => {
  const handleDelete = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    onRemoveFeature(langCode, index);
  };

  return (
    <AccordionItem key={index} value={`item-${index}`}>
      <div className="flex items-center justify-between">
        <AccordionTrigger className="flex-1">
          {feature.title || `Feature ${index + 1}`}
        </AccordionTrigger>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="mr-4"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <AccordionContent>
        <Card className="border border-muted">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${langCode}.${index}.id` as any}
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>ID</FormLabel>
                    <FormControl>
                      <Input placeholder="feature-id" {...field} />
                    </FormControl>
                    <FormDescription>A unique identifier for this feature</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${langCode}.${index}.title` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Feature title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${langCode}.${index}.content.heading` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading</FormLabel>
                    <FormControl>
                      <Input placeholder="Feature heading" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name={`${langCode}.${index}.content.description` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Feature description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Feature List</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddFeatureItem(langCode, index)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
                {feature.content.features.map((featureItem, featureItemIndex) => (
                  <FeatureItem
                    key={`${langCode}-${index}-feature-${featureItemIndex}`}
                    featureItemIndex={featureItemIndex}
                    langCode={langCode}
                    index={index}
                    form={form}
                    onRemoveFeatureItem={onRemoveFeatureItem}
                  />
                ))}
                </div>
            {langId === languageIds[0] && (
              <div className="grid grid-cols-1 gap-4">
                <FeatureImageUploader featureIndex={index} />
              </div>
            )}
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
});

FeatureForm.displayName = "FeatureForm";