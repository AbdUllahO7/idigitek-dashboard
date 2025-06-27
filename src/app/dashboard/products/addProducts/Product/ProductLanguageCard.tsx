"use client"

import { memo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { useFormContext, type UseFormReturn } from "react-hook-form"
import { CalendarIcon, ChevronDown, ChevronUp, X, BookOpen, Clock, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { cn } from "@/src/lib/utils"

interface ProductLanguageCardProps {
  langCode: string
  form: UseFormReturn<any>
  isFirstLanguage?: boolean
  onClose?: (langCode: string) => void
}

export const ProductLanguageCard = memo(({ langCode, form, isFirstLanguage = false, onClose }: ProductLanguageCardProps) => {
  const {
    formState: { errors },
  } = useFormContext()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const currentTitle = form.watch(`${langCode}.title`) || ""
  const currentCategory = form.watch(`${langCode}.category`) || ""
  const currentPrice = form.watch(`${langCode}.price`) || ""
  const currentDate = form.watch(`${langCode}.date`)

  const handleClose = () => {
    if (onClose && !isFirstLanguage) {
      onClose(langCode)
    }
  }

  // Calculate reading time estimate based on content length
  const contentLength = form.watch(`${langCode}.content`)?.length || 0
  const readingTime = Math.max(1, Math.ceil(contentLength / 1000)) // Rough estimate: 1000 chars per minute

  return (
    <Card
      className=""
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span
                className={cn(
                  "uppercase font-bold text-sm rounded-lg px-3 py-1.5 shadow-sm",
                  isFirstLanguage ? "bg-orange-600 text-white" : "bg-primary text-primary-foreground",
                )}
              >
                {langCode}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold">Product Section</span>
              {isFirstLanguage && (
                <span className="text-xs bg-orange-100 text-orange-700 rounded-md px-2 py-0.5 w-fit mt-1 font-medium">
                  Primary Language
                </span>
              )}
            </div>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>

            {!isFirstLanguage && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CardDescription className="text-sm text-gray-600 mt-2">
          Manage Product content for {langCode.toUpperCase()}
          {currentTitle && <span className="block text-xs text-orange-600 mt-1 font-medium">"{currentTitle}"</span>}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {currentCategory && <span>Category: {currentCategory}</span>}
            {currentPrice && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Price: {currentPrice}</span>}
            {isFirstLanguage && currentDate && <span>Published: {format(new Date(currentDate), "MMM dd, yyyy")}</span>}
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 pb-0" : "max-h-none pb-6",
        )}
      >
        <div className="space-y-6">
          {/* Title Field */}
          <FormField
            control={form.control}
            name={`${langCode}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Product Title {isFirstLanguage && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Product title"
                    className="h-11 hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
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
                <FormLabel className="text-sm font-medium">
                  Product Description {isFirstLanguage && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter Product description (excerpt/summary)"
                    className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                    {...field}
                  />
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
                <FormLabel className="text-sm font-medium">
                  Product Content {isFirstLanguage && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the full Product content"
                    className="min-h-[200px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-gray-500 mt-1">
                  {field.value?.length || 0} characters • Estimated reading time: {readingTime} minute
                  {readingTime !== 1 ? "s" : ""}
                </div>
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
                <FormLabel className="text-sm font-medium">
                  Product Category {isFirstLanguage && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Electronics, Clothing, Home & Garden"
                    className="h-11 hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price Field */}
          <FormField
            control={form.control}
            name={`${langCode}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Product Price {isFirstLanguage && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="e.g., $99.99, €89.00, ¥1200"
                      className="h-11 hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </div>
                </FormControl>
                <div className="text-xs text-gray-500 mt-1">
                  Include currency symbol and format according to your target market
                </div>
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
                  <FormLabel className="text-sm font-medium">
                    Publication Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 pl-3 text-left font-normal hover:border-primary transition-colors",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>Select publication date</span>}
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
                <FormLabel className="text-sm font-medium">
                  Button Text {isFirstLanguage && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="View Details, Buy Now, Learn More"
                    className="h-11 hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
})

ProductLanguageCard.displayName = "ProductLanguageCard"