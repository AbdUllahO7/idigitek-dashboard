"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import { cn } from "@/src/lib/utils";

interface BlogLanguageCardProps {
  langCode: string;
  form: UseFormReturn<any>;
  isFirstLanguage?: boolean;
}

export const BlogLanguageCard = memo(({ langCode, form, isFirstLanguage = false }: BlogLanguageCardProps) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Blog Section
        </CardTitle>
        <CardDescription>Manage blog content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title Field */}
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

        {/* Description Field */}
        <FormField
          control={form.control}
          name={`${langCode}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content Field */}
        <FormField
          control={form.control}
          name={`${langCode}.content`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>content {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter content" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name={`${langCode}.category`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter category" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Field with DatePicker - Only shown for first language */}
        {isFirstLanguage && (
          <FormField
            control={form.control}
            name={`${langCode}.date`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Select a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Back Link Text Field */}
        <FormField
          control={form.control}
          name={`${langCode}.backLinkText`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Text {isFirstLanguage && <span className="text-red-500">*</span>}</FormLabel>
              <FormControl>
                <Input placeholder="Get Started" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
});

BlogLanguageCard.displayName = "BlogLanguageCard";