"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import { Plus, Trash2, GripVertical, ImageIcon, FileText, List } from "lucide-react"
import { memo } from "react"
import { FeatureItem } from "./FeatureItem"

interface FeatureFormProps {
  index: number
  feature: {
    title: string
    content: {
      heading: string
      description: string
      features: string[]
    }
  }
  langCode: string
  langId: string
  languageIds: string[]
  form: any
  onRemoveFeature: (langCode: string, index: number) => void
  onAddFeatureItem: (langCode: string, index: number) => void
  onRemoveFeatureItem: (langCode: string, featureIndex: number, itemIndex: number) => void
  FeatureImageUploader: React.ComponentType<{ featureIndex: number }>
}

export const FeatureForm = memo(
  ({
    index,
    feature,
    langCode,
    langId,
    languageIds,
    form,
    onRemoveFeature,
    onAddFeatureItem,
    onRemoveFeatureItem,
    FeatureImageUploader,
  }: FeatureFormProps) => {
    const { t } = useTranslation()
    
    const handleDelete = (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onRemoveFeature(langCode, index)
    }

    const isPrimaryLanguage = langId === languageIds[0]
    const featureCount = feature.content.features.length

    return (
      <AccordionItem value={`item-${index}`} className="border rounded-lg overflow-hidden py-7">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <AccordionTrigger className="hover:no-underline p-0 border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold">
                          {feature.title || t('featuresForm.featureForm.featureTitle', { number: index + 1 })}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPrimaryLanguage && (
                          <Badge variant="secondary" className="text-xs">
                            {t('featuresForm.featureForm.badges.primary')}
                          </Badge>
                        )}
                        {featureCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {t('featuresForm.featureForm.badges.items', { count: featureCount })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="mr-4"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <AccordionContent className="pb-0">
            <CardContent className="pt-0 space-y-6">
              {/* Hidden ID field */}
              <FormField
                control={form.control}
                name={`${langCode}.${index}.id`}
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">
                    {t('featuresForm.featureForm.sections.basicInformation')}
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`${langCode}.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('featuresForm.featureForm.fields.featureTitle.label')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('featuresForm.featureForm.fields.featureTitle.placeholder')}
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${langCode}.${index}.content.heading`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('featuresForm.featureForm.fields.sectionHeading.label')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('featuresForm.featureForm.fields.sectionHeading.placeholder')}
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`${langCode}.${index}.content.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('featuresForm.featureForm.fields.description.label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('featuresForm.featureForm.fields.description.placeholder')}
                          className="min-h-[120px] transition-all focus:ring-2 focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('featuresForm.featureForm.fields.description.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Feature Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">
                      {t('featuresForm.featureForm.sections.featureItems')}
                    </Label>
                    {featureCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {featureCount}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddFeatureItem(langCode, index)}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('featuresForm.featureForm.buttons.addItem')}
                  </Button>
                </div>

                {featureCount === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('featuresForm.featureForm.emptyState.title')}</p>
                    <p className="text-xs">{t('featuresForm.featureForm.emptyState.description')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feature.content.features.map((_, featureItemIndex) => (
                      <FeatureItem
                        key={`${langCode}-${index}-feature-${featureItemIndex}`}
                        featureItemIndex={featureItemIndex}
                        langCode={langCode}
                        index={index}
                        form={form}
                        onRemoveFeatureItem={onRemoveFeatureItem}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload Section - Only for primary language */}
              {isPrimaryLanguage && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">
                        {t('featuresForm.featureForm.sections.featureImage')}
                      </Label>
                    </div>
                    <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/30">
                      <FeatureImageUploader featureIndex={index} />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    )
  },
)

FeatureForm.displayName = "FeatureForm"

export default FeatureForm