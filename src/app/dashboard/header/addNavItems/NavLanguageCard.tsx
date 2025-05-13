"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface NavLanguageCardProps {
  langCode: string;
  form: UseFormReturn<any>;
  onAddItem?: () => void;
  onRemoveItem: (index: number) => void;
  renderFields: (control: any, langCode: string) => React.ReactNode

}

export const NavLanguageCard = memo(({ langCode, form, onAddItem, onRemoveItem }: NavLanguageCardProps) => {
  const navItems = form.getValues()[langCode] || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Navigation Section
        </CardTitle>
        <CardDescription>Manage navigation items for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {navItems.map((_: any, index: number) => (
          <div key={index} className="flex items-end gap-2">
            <FormField
              control={form.control}
              name={`${langCode}.${index}.navItemName`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nav Item {index + 1}</FormLabel>
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