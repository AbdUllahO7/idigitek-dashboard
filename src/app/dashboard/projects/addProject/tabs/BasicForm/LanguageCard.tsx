"use client"

import type React from "react"

import { memo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import type { UseFormReturn } from "react-hook-form"
import { CalendarIcon, ChevronDown, ChevronUp, X, FolderOpen } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { cn } from "@/src/lib/utils"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/src/context/LanguageContext"

interface LanguageCardProps {
  langCode: string
  form: UseFormReturn<any>
  isFirstLanguage?: boolean
  onClose?: (langCode: string) => void
}

export const LanguageCard = memo(
  ({ langCode, form, isFirstLanguage = false, onClose }: LanguageCardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { t } = useTranslation()
    const { language } = useLanguage()
    const currentTitle = form.watch(`${langCode}.title`) || ""
    const currentDate = form.watch(`${langCode}.date`)

    const handleClose = () => {
      if (onClose && !isFirstLanguage) {
        onClose(langCode)
      }
    }

    return (
      <Card className={""} dir={language === "ar" ? "rtl" : "ltr"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <span
                  className={cn(
                    "uppercase font-bold text-sm rounded-lg px-3 py-1.5 shadow-sm",
                    isFirstLanguage ? "bg-purple-600 text-white" : "bg-primary text-primary-foreground",
                  )}
                >
                  {langCode}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold">
                  {t("projectLanguageCard.projectSection", "Project Section")}
                </span>
                {isFirstLanguage && (
                  <span className="text-xs bg-purple-100 text-purple-700 rounded-md px-2 py-0.5 w-fit mt-1 font-medium">
                    {t("projectLanguageCard.primaryLanguage", "Primary Language")}
                  </span>
                )}
              </div>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0"
                title={
                  isCollapsed
                    ? t("projectLanguageCard.expand", "Expand")
                    : t("projectLanguageCard.collapse", "Collapse")
                }
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>

              {!isFirstLanguage && onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                  title={t("projectLanguageCard.close", "Close")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <CardDescription className="text-sm text-gray-600 mt-2">
            {t("projectLanguageCard.manageContent", "Manage project content for {{langCode}}", {
              langCode: langCode.toUpperCase(),
            })}
            {currentTitle && <span className="block text-xs mt-1 font-medium">"{currentTitle}"</span>}
            {isFirstLanguage && currentDate && (
              <span className="block text-xs text-gray-500 mt-1">
                {t("projectLanguageCard.projectDateLabel", "Project Date: {{date}}", {
                  date: format(new Date(currentDate), "PPP"),
                })}
              </span>
            )}
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
                    {t("projectLanguageCard.projectTitle", "Project Title")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("projectLanguageCard.titlePlaceholder", "Enter project title")}
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
                    {t("projectLanguageCard.projectDescription", "Project Description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("projectLanguageCard.descriptionPlaceholder", "Enter project description")}
                      className="min-h-[120px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                      {...field}
                    />
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
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.projectCategory", "Project Category")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("projectLanguageCard.categoryPlaceholder", "Enter project category")}
                      className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gallery Text Field */}
            <FormField
              control={form.control}
              name={`${langCode}.galleryText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.galleryText", "Gallery Text")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("projectLanguageCard.galleryTextPlaceholder", "Enter gallery text")}
                      className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                      {...field}
                    />
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
                    <FormLabel className="text-sm font-medium">
                      {t("projectLanguageCard.projectDate", "Project Date")}
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
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>{t("projectLanguageCard.datePlaceholder", "Select a date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Button Text Field */}
            <FormField
              control={form.control}
              name={`${langCode}.backLinkText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("projectLanguageCard.buttonText", "Button Text")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("projectLanguageCard.buttonTextPlaceholder", "Get Started")}
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
  },
)

LanguageCard.displayName = "LanguageCard"