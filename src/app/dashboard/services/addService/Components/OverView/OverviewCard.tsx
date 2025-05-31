// OverviewCard Component
"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Textarea } from "@/src/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface OverviewCardProps {
  langCode: string;
  form: UseFormReturn<any>;
}

export const OverviewCard = memo(({ langCode, form }: OverviewCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Form Overview
        </CardTitle>
        <CardDescription>Manage overview content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description Field Only */}
        <FormField
          control={form.control}
          name={`${langCode}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter description" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
});

OverviewCard.displayName = "OverviewCard";