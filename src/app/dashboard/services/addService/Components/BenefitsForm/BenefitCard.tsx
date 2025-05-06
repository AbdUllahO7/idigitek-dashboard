"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { IconComponent, IconNames } from "@/src/utils/MainSectionComponents";


interface BenefitCardProps {
  langCode: string;
  index: number;
  form: any;
  isFirstLanguage: boolean;
  syncIcons: (index: number, value: IconNames) => void;
  availableIcons: IconNames[];
  onDelete: (langCode: string, index: number) => void;
}

/**
 * BenefitCard - Component for a single benefit within a language
 */
export const BenefitCard = memo(({
  langCode,
  index,
  form,
  isFirstLanguage,
  syncIcons,
  availableIcons,
  onDelete
} : BenefitCardProps) => {
  const handleDelete = () => onDelete(langCode, index);

  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Benefit {index + 1}</CardTitle>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Icon selector for primary language only */}
        {isFirstLanguage ? (
          <FormField
            control={form.control}
            name={`${langCode}.${index}.icon`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Sync this icon value to all other languages
                    syncIcons(index, value as IconNames);
                  }} 
                  defaultValue={field.value || "Clock"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon">
                        <div className="flex items-center">
                          <span className="mr-2"><IconComponent iconName={field.value || "Clock"} /></span>
                          {field.value || "Clock"}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center">
                          <span className="mr-2"><IconComponent iconName={icon} /></span>
                          {icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="mb-4">
            <FormLabel className="block mb-2">Icon</FormLabel>
            <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/50 text-muted-foreground">
              <span className="mr-2">
                <IconComponent iconName={form.watch(`${langCode}.${index}.icon`) || "Clock"} />
              </span>
              {form.watch(`${langCode}.${index}.icon`) || "Clock"}
              <span className="ml-2 text-xs text-muted-foreground">(Controlled by primary language)</span>
            </div>
          </div>
        )}

        {/* Title Field */}
        <FormField
          control={form.control}
          name={`${langCode}.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name={`${langCode}.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" className="min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
});

BenefitCard.displayName = "BenefitCard";