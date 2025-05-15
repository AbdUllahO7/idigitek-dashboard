"use client"

import { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import type { UseFormReturn } from "react-hook-form"

interface LanguageCardProps {
  langCode: string
  form: UseFormReturn<any>
}

export const TeamLanguageCard = memo(({ langCode, form }: LanguageCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          Team Section
        </CardTitle>
        <CardDescription>Manage team content for {langCode.toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name={`${langCode}.title`}
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
      {/* Title Field */}
        <FormField
          control={form.control}
          name={`${langCode}.job`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job</FormLabel>
              <FormControl>
                <Input placeholder="Enter job" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      
      </CardContent>
    </Card>
  )
})

TeamLanguageCard.displayName = "TeamLanguageCard"
