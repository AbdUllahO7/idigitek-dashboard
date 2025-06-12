"use client";

import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import { Separator } from "@/src/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "react-i18next";

interface ContactInformationFormLanguageCardPops {
  langCode: string;
  form: UseFormReturn<any>;
  isFirstLanguage?: boolean;
}

export const ContactInformationFormLanguageCard = memo(({ langCode, form, isFirstLanguage = false }: ContactInformationFormLanguageCardPops) => {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = React.useState({
    phone: false, 
    email: false, 
    office: false, 
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 ml-2 mr-2">
            {langCode}
          </span>
          {t('contactInformationFormCard.title', 'Contact Section')}
        </CardTitle>
        <CardDescription>
          {t('contactInformationFormCard.description', 'Manage contact content for {{langCode}}', { langCode: langCode.toUpperCase() })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title and Description Fields (Always Visible) */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`${langCode}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('contactInformationFormCard.fields.title', 'Title')} {isFirstLanguage && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('contactInformationFormCard.placeholders.title', 'Enter title')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${langCode}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contactInformationFormCard.fields.description', 'Description')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('contactInformationFormCard.placeholders.description', 'Enter description')} className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         
        </div>

        <Separator />

        {/* Phone Field Group */}
        <Collapsible open={openSections.phone} onOpenChange={() => toggleSection("phone")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">{t('contactInformationFormCard.sections.phone', 'Phone')}</span>
              {openSections.phone ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.phoneText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contactInformationFormCard.fields.phoneText', 'Phone Text')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contactInformationFormCard.placeholders.phoneText', 'Enter phone text')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.phoneTextValue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contactInformationFormCard.fields.phoneValue', 'Phone Value')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contactInformationFormCard.placeholders.phoneValue', 'Enter phone number')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Email Field Group */}
        <Collapsible open={openSections.email} onOpenChange={() => toggleSection("email")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">{t('contactInformationFormCard.sections.email', 'Email')}</span>
              {openSections.email ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contactInformationFormCard.fields.emailText', 'Email Text')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contactInformationFormCard.placeholders.emailText', 'Enter email text')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.emailValue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contactInformationFormCard.fields.emailValue', 'Email Value')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contactInformationFormCard.placeholders.emailValue', 'Enter email address')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Office Field Group */}
        <Collapsible open={openSections.office} onOpenChange={() => toggleSection("office")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">{t('contactInformationFormCard.sections.office', 'Office')}</span>
              {openSections.office ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.office`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contactInformationFormCard.fields.officeText', 'Office Text')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contactInformationFormCard.placeholders.officeText', 'Enter office text')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.officeValue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contactInformationFormCard.fields.officeAddress', 'Office Address')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('contactInformationFormCard.placeholders.officeAddress', 'Enter office address')} className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
});

ContactInformationFormLanguageCard.displayName = "ContactInformationFormLanguageCard";