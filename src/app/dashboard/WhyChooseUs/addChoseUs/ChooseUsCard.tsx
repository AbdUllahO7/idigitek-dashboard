"use client"

import { memo, useState } from "react"
import { ChevronDown, ChevronUp, Trash2, GripVertical } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { IconComponent, type IconNames } from "@/src/utils/MainSectionComponents"
import { cn } from "@/src/lib/utils"
import { useTranslation } from "react-i18next"

interface BenefitCardProps {
  langCode: string
  index: number
  form: any
  isFirstLanguage: boolean
  syncIcons: (index: number, value: IconNames) => void
  availableIcons: readonly IconNames[]
  onDelete: (langCode: string, index: number) => void
}

/**
 * ChooseUsCard - Component for a single benefit within a language
 */
export const ChooseUsCard = memo(
  ({ langCode, index, form, isFirstLanguage, syncIcons, availableIcons, onDelete }: BenefitCardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const {t} = useTranslation()
    const handleDelete = () => onDelete(langCode, index)

    const currentIcon = form.watch(`${langCode}.${index}.icon`) || "Clock"
    const currentTitle = form.watch(`${langCode}.${index}.title`) || ""
    const currentDescription = form.watch(`${langCode}.${index}.description`) || ""

    return (
      <Card className="">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    isFirstLanguage ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700",
                  )}
                >
                  {index + 1}
                </div>
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold flex items-center">
                  <span className="mr-2 ml-2">
                    <IconComponent iconName={currentIcon} />
                  </span>
                  {t("ChooseUsCard.reason")} {index + 1}
                  {currentTitle && <span className="ml-2 text-sm font-normal text-gray-600">- {currentTitle}</span>}
                </CardTitle>
                {currentDescription && (
                  <CardDescription className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {currentDescription}
                  </CardDescription>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0 "
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isCollapsed ? "max-h-0 p-0" : "max-h-none p-4 pt-0",
          )}
        >
          <div className="space-y-4">
            {/* Icon selector for primary language only */}
            <div className="space-y-2">
              {isFirstLanguage ? (
                <FormField
                  control={form.control}
                  name={`${langCode}.${index}.icon`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t("ChooseUsCard.icon_label")}</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Sync this icon value to all other languages
                          syncIcons(index, value as IconNames)
                        }}
                        defaultValue={field.value || "Clock"}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 hover:border-primary transition-colors">
                            <SelectValue placeholder={t("icon_placeholder")}>
                              <div className="flex items-center">
                                <span className="mr-2">
                                  <IconComponent iconName={field.value || "Clock"} />
                                </span>
                                {field.value || "Clock"}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center">
                                <span className="mr-2">
                                  <IconComponent iconName={icon} />
                                </span>
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
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-muted-foreground">{t("ChooseUsCard.icon_label")}</FormLabel>
                  <div className="flex items-center h-11 px-3 border-2 rounded-md">
                    <span className="mr-2">
                      <IconComponent iconName={currentIcon} />
                    </span>
                    <span className="text-gray-600">{currentIcon}</span>
                    <span className="ml-2 text-xs text-muted-foreground italic">{t("ChooseUsCard.controlled_by_primary_language")}</span>
                  </div>
                  <input type="hidden" {...form.register(`${langCode}.${index}.icon`)} value={currentIcon} />
                </div>
              )}
            </div>

            {/* Title Field */}
            <FormField
              control={form.control}
              name={`${langCode}.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t("ChooseUsCard.title_label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("ChooseUsCard.title_placeholder")}
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
              name={`${langCode}.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t("ChooseUsCard.description_label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("ChooseUsCard.description_placeholder")}
                      className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
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

ChooseUsCard.displayName = "ChooseUsCard"