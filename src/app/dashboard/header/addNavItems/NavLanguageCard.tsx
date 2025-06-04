"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/src/context/LanguageContext";

interface NavLanguageCardProps {
  langCode: string;
  form: UseFormReturn<any>;
  onAddItem?: () => void;
  onRemoveItem: (index: number) => void;
  renderFields: (control: any, langCode: string) => React.ReactNode

}

export const NavLanguageCard = memo(({ langCode, form, onAddItem, onRemoveItem }: NavLanguageCardProps) => {
  const navItems = form.getValues()[langCode] || [];
  const { t } = useTranslation();
  const {language} = useLanguage()
  const isRtl = language === 'ar'
  return (
    <Card className="w-full" dir={isRtl ? 'rtl' :'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center" dir={isRtl ? 'rtl' :'ltr'}>
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 ml-2 mr-2 py-1">
            {langCode}
          </span>
          {t("navLanguageCard.titles.navigationSection")}
        </CardTitle>
        <CardDescription >{t("navLanguageCard.descriptions.manageNavigation")}
          <span className="pl-2 pr-2">
            {langCode.toUpperCase() }
          </span>

        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {navItems.map((_: any, index: number) => (
          <div key={index} className="flex items-end gap-2">
            <FormField
              control={form.control}
              name={`${langCode}.${index}.navItemName`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("navLanguageCard.labels.navItem")} {index + 1}</FormLabel>
                  <FormControl>
                    <Input placeholder={`Nav Item ${index + 1}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => onRemoveItem(index)}
              disabled={navItems.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
     
      </CardContent>
    </Card>
  );
});

NavLanguageCard.displayName = "NavLanguageCard";