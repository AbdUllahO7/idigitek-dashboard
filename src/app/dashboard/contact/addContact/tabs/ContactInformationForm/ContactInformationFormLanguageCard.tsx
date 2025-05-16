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

interface ContactInformationFormLanguageCardPops {
  langCode: string;
  form: UseFormReturn<any>;
  isFirstLanguage?: boolean;
}

export const ContactInformationFormLanguageCard = memo(({ langCode, form, isFirstLanguage = false }: ContactInformationFormLanguageCardPops) => {
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
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Contact Section
        </CardTitle>
        <CardDescription>Manage contact content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title and Description Fields (Always Visible) */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`${langCode}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${langCode}.location`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Map URL)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter map URL (e.g., Google Maps embed URL)" {...field} />
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
              <span className="text-lg font-semibold">Phone</span>
              {openSections.phone ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.phoneText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone text" {...field} />
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
                  <FormLabel>Phone Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
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
              <span className="text-lg font-semibold">Email</span>
              {openSections.email ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email text" {...field} />
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
                  <FormLabel>Email Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
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
              <span className="text-lg font-semibold">Office</span>
              {openSections.office ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.office`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter office text" {...field} />
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
                  <FormLabel>Office Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter office address" className="min-h-[100px]" {...field} />
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