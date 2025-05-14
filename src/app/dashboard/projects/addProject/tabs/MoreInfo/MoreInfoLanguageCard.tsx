"use client";

import React, { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import { Separator } from "@/src/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface LanguageCardProps {
  langCode: string;
  form: UseFormReturn<any>;
  isFirstLanguage?: boolean;
}

export const MoreInfoLanguageCard = memo(({ langCode, form, isFirstLanguage = false }: LanguageCardProps) => {
  const [openSections, setOpenSections] = React.useState({
    client: false, 
    industry: false, 
    year: false, 
    technologies: false, 
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
          Project Section
        </CardTitle>
        <CardDescription>Manage project content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Field Group */}
        <Collapsible open={openSections.client} onOpenChange={() => toggleSection("client")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">Client</span>
              {openSections.client ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <FormField
              control={form.control}
              name={`${langCode}.clientName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Custom Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter custom name for client" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.client`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Industry Field Group */}
        <Collapsible open={openSections.industry} onOpenChange={() => toggleSection("industry")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">Industry</span>
              {openSections.industry ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
         
            <FormField
              control={form.control}
              name={`${langCode}.industryName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry Custom Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter custom name for industry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.industry`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter industry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Year Field Group */}
        <Collapsible open={openSections.year} onOpenChange={() => toggleSection("year")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">Year</span>
              {openSections.year ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
          
            <FormField
              control={form.control}
              name={`${langCode}.yearName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Custom Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter custom name for year" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.year`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter year" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Technologies Field Group */}
        <Collapsible open={openSections.technologies} onOpenChange={() => toggleSection("technologies")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center">
              <span className="text-lg font-semibold">Technologies</span>
              {openSections.technologies ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
          
            <FormField
              control={form.control}
              name={`${langCode}.technologiesName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Custom Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter custom name for technologies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.technologies`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Value</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter technologies" className="min-h-[100px]" {...field} />
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

MoreInfoLanguageCard.displayName = "MoreInfoLanguageCard";