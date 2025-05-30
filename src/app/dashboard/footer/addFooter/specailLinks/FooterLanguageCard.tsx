"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { FooterCard } from "./FooterCard";

interface LanguageCardProps {
  langCode: string;
  isFirstLanguage: boolean;
  form: any;
  addFooter: (langCode: string) => void;
  removeFooter: (langCode: string, index: number) => void;
  onDeleteStep: (langCode: string, index: number) => void;
  FooterImageUploader: React.ComponentType<any>;
  SocialLinkImageUploader?: React.ComponentType<any>;
}

export const FooterLanguageCard = memo(({
  langCode,
  isFirstLanguage,
  form,
  addFooter,
  onDeleteStep,
  FooterImageUploader,
  SocialLinkImageUploader,
}: LanguageCardProps) => {
  const footer = form.watch(langCode) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Footer Section
        </CardTitle>
        <CardDescription>Manage footer content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {footer.map((_: any, index: number) => (
          <FooterCard
            key={`${langCode}-footer-${index}`}
            langCode={langCode}
            index={index}
            form={form}
            isFirstLanguage={isFirstLanguage}
            onDelete={(langCodeParam, index) => onDeleteStep(langCodeParam, index)}
            FooterImageUploader={FooterImageUploader}
            SocialLinkImageUploader={SocialLinkImageUploader}
          />
        ))}
        {isFirstLanguage && (
          <Button type="button" variant="outline" onClick={() => addFooter(langCode)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Footer
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

FooterLanguageCard.displayName = "FooterLanguageCard";