import { Accordion } from "@/src/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { memo } from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import FeaturesForm from "./features-form";

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
export const LanguageCard = memo(({
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
            <FeaturesForm
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