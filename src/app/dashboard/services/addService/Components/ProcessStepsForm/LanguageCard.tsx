import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Plus } from "lucide-react";
import { memo } from "react";
import { StepCard } from "./StepCard";
import { getAvailableIcons } from "../../Utils/Expose-form-data";

interface LanguageCardProps {
  langId: string;
  langCode: string;
  isFirstLanguage: boolean;
  defaultLangCode: string;
  form: any;
  onAddStep: () => void;
  onDeleteStep: ( langCode : any, index: number) => void;
}

// Memoized LanguageCard component to prevent unnecessary rerenders
export const LanguageCard = memo(({ 
  langId, 
  langCode, 
  isFirstLanguage, 
  defaultLangCode, 
  form, 
  onAddStep, 
  onDeleteStep 
}: LanguageCardProps) => {
  // Use formValues directly from form.watch to ensure re-renders when values change
  const formValues = form.watch(langCode) || [];
  
  return (
    <Card key={langId} className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Process Steps Section
          {isFirstLanguage && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Icon Control
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Manage process steps content for {langCode.toUpperCase()}
          {isFirstLanguage && (
            <span className="block text-xs text-blue-600 mt-1">
              Icons defined here will be used for all languages
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formValues.map((_: any, index: any) => (
          <StepCard
            key={`${langCode}-step-${index}`}
            index={index}
            langCode={langCode}
            isFirstLanguage={isFirstLanguage}
            defaultLangCode={defaultLangCode}
            form={form}
            onDelete={(langCode, index) => onDeleteStep(langCode,index)}
            availableIcons={[...getAvailableIcons()]}
          />
        ))}
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onAddStep}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Process Step
        </Button>
      </CardContent>
    </Card>
  );
});
LanguageCard.displayName = "LanguageCard";
