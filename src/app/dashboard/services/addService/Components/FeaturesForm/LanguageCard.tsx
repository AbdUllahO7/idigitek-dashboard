// Language Card Component with i18n Integration

import { Accordion } from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Plus } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next"; // or your i18n hook
import { FeatureForm } from "./FeatureForm";

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
  const { t } = useTranslation(); // i18n hook
  const features = form.watch(`${langCode}` as any) || [];
  
  return (
    <Card key={langId} className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 ml-2 mr-2">
            {langCode}
          </span>
          {t('featuresForm.languageCard.title')}
        </CardTitle>
        <CardDescription>
          {t('featuresForm.languageCard.description', { language: langCode.toUpperCase() })}
        </CardDescription>
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
          {t('featuresForm.languageCard.addFeature')}
        </Button>
      </CardContent>
    </Card>
  );
});

export default LanguageCard;

LanguageCard.displayName = "LanguageCard";