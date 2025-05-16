"use client";

import React, { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import { Separator } from "@/src/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useFieldArray } from "react-hook-form";

interface SendUsaMessageFormLanguageCardProps {
  langCode: string;
  form: UseFormReturn<any>;
  isFirstLanguage?: boolean;
}

export const SendUsaMessageFormLanguageCard = memo(({ langCode, form, isFirstLanguage = false }: SendUsaMessageFormLanguageCardProps) => {
  const [openSections, setOpenSections] = useState({
    formFields: true,
    phone: false,
    email: false,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${langCode}.subjects`,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Contact Form
        </CardTitle>
        <CardDescription>Manage contact form content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Fields Collapsible Section */}
        <Collapsible open={openSections.formFields} onOpenChange={() => toggleSection("formFields")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">Form Fields</span>
              {openSections.formFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter form title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.fullname`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name Text {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.fullnamePlaceHolder`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Text {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.emailPlaceHolder`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.message`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Text {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter message label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.messagePlaceHolder`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Placeholder</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter message placeholder" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Subjects {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 mt-2">
                  <FormControl>
                    <Input
                      placeholder={`Enter subject ${index + 1}`}
                      {...form.register(`${langCode}.subjects.${index}`)}
                    />
                  </FormControl>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append("")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name={`${langCode}.buttonText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Text {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter button text" {...field} />
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

SendUsaMessageFormLanguageCard.displayName = "SendUsaMessageFormLanguageCard";