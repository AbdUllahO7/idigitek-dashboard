"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { HeroCard } from "./HeroCard";

interface LanguageCardProps {
  langCode: string;
  isFirstLanguage: boolean;
  form: any;
  addHero: (langCode: string) => void;
  removeHero: (langCode: string, index: number) => void;
  onDeleteStep: (langCode: string, index: number) => void;
  HeroImageUploader: React.ComponentType<any>;
}

export const LanguageCard = memo(({
  langCode,
  isFirstLanguage,
  form,
  addHero,
  onDeleteStep,
  HeroImageUploader,
}: LanguageCardProps) => {
  const hero = form.watch(langCode) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Hero Section
        </CardTitle>
        <CardDescription>Manage hero content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hero.map((_: any, index: number) => (
          <HeroCard
            key={`${langCode}-hero-${index}`}
            langCode={langCode}
            index={index}
            form={form}
            onDelete={(langCodeParam, index) => onDeleteStep(langCodeParam, index)}
            HeroImageUploader={HeroImageUploader}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addHero(langCode)}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Hero
        </Button>
      </CardContent>
    </Card>
  );
});

LanguageCard.displayName = "LanguageCard";