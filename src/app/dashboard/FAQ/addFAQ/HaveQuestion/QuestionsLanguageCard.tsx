  "use client";

  import { memo } from "react";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { IconNames } from "@/src/utils/MainSectionComponents";
import { QuestionCard } from "./QuestionCard";

interface LanguageCardProps {
  langCode: string;
  isFirstLanguage: boolean;
  form: any;
  removeFaq: (langCode: string, index: number) => void;
  syncIcons: (index: number, iconValue: string) => void;
  availableIcons: readonly IconNames[];
  onDeleteStep: ( langCode : any , index: number ) => void;
}
  
export const QuestionsLanguageCard = memo(({ 
  langCode, 
  isFirstLanguage, 
  form, 
  syncIcons, 
  availableIcons,
  onDeleteStep
} :LanguageCardProps ) => {
  const benefits = form.watch(langCode) || [];
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Questions Section
          {isFirstLanguage && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded-md px-2 py-1">
              Primary Language (Icon Control)
            </span>
          )}
        </CardTitle>
        <CardDescription>Manage benefits content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {benefits.map((_: any, index: number) => (
          <QuestionCard
            key={`${langCode}-benefit-${index}`}
            langCode={langCode}
            index={index}
            form={form}
            isFirstLanguage={isFirstLanguage}
            syncIcons={syncIcons}
            availableIcons={availableIcons}
            onDelete={(langCodeParam, index) => onDeleteStep(langCodeParam,index)}

          />
        ))}

     
      </CardContent>
    </Card>
  );
});

  QuestionsLanguageCard.displayName = "QuestionsLanguageCard";