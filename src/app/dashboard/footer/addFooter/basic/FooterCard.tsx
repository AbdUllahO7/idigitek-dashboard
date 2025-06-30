"use client"

import type React from "react"

import { memo, useState } from "react"
import { Trash2, Plus, Minus, ChevronDown, ChevronUp, GripVertical, ExternalLink } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { LabeledImageUploader, useImageUpload } from "../../../services/addService/Utils/Image-uploader"
import { cn } from "@/src/lib/utils"
import { useTranslation } from "react-i18next"

interface FooterCardProps {
  langCode: string
  index: number
  form: any
  isFirstLanguage: boolean
  onDelete: (langCode: string, index: number) => void
  FooterImageUploader?: React.ComponentType<any>
  SocialLinkImageUploader?: React.ComponentType<any>
}

export const FooterCard = memo(
  ({
    langCode,
    index,
    form,
    isFirstLanguage,
    onDelete,
    FooterImageUploader,
    SocialLinkImageUploader,
  }: FooterCardProps) => {
    const { t } = useTranslation()
    
    const { imageFile, imagePreview, handleImageUpload, handleImageRemove } = useImageUpload({
      form,
      fieldPath: `${langCode}.${index}.image`,
      validate: (file) => {
        if (file.size > 2 * 1024 * 1024) {
          return "Image must be less than 2MB"
        }
        return true
      },
    })

    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isSocialLinksExpanded, setIsSocialLinksExpanded] = useState(true)

    const handleDelete = () => onDelete(langCode, index)

    const socialLinks = form.watch(`${langCode}.${index}.socialLinks`) || []
    const currentDescription = form.watch(`${langCode}.${index}.description`) || ""

    const addSocialLink = () => {
      const currentSocialLinks = form.getValues(`${langCode}.${index}.socialLinks`) || []
      form.setValue(`${langCode}.${index}.socialLinks`, [...currentSocialLinks, { image: "", url: "" }], {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    const removeSocialLink = (socialLinkIndex: number) => {
      const currentSocialLinks = form.getValues(`${langCode}.${index}.socialLinks`) || []
      const updatedSocialLinks = currentSocialLinks.filter((_: any, i: number) => i !== socialLinkIndex)
      form.setValue(`${langCode}.${index}.socialLinks`, updatedSocialLinks, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    return (
      <Card
        className=""
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    isFirstLanguage ? "bg-slate-100 text-slate-700" : "bg-gray-100 text-gray-700",
                  )}
                >
                  {index + 1}
                </div>
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">
                  {t('footerForm.card.title', 'Footer Section {{index}}', { index: index + 1 })}
                </CardTitle>
                {currentDescription && (
                  <CardDescription className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {currentDescription.substring(0, 80)}
                    {currentDescription.length > 80 ? "..." : ""}
                  </CardDescription>
                )}
                {socialLinks.length > 0 && isFirstLanguage && (
                  <div className="flex items-center gap-1 mt-1">
                    <ExternalLink className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">
                      {socialLinks.length} {t('footerForm.card.socialLinks.count', 'social link(s)')}
                    </span>
                  </div>
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
          <div className="space-y-6">
            {/* Description Field */}
            <FormField
              control={form.control}
              name={`${langCode}.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('footerForm.card.description', 'Footer Description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('footerForm.card.descriptionPlaceholder', 'Enter footer description')}
                      className="min-h-[100px] hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Links Section - Only for first language */}
            {isFirstLanguage && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">
                      {t('footerForm.card.socialLinks.title', 'Social Links')}
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                      {t('footerForm.card.socialLinks.appliesToAll', 'Applies to all languages')}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSocialLinksExpanded(!isSocialLinksExpanded)}
                    className="h-8 px-3 hover:bg-gray-100"
                  >
                    <span className="text-xs mr-1">
                      {isSocialLinksExpanded 
                        ? t('footerForm.card.socialLinks.collapse', 'Collapse')
                        : t('footerForm.card.socialLinks.expand', 'Expand')
                      }
                    </span>
                    {isSocialLinksExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>

                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isSocialLinksExpanded ? "max-h-none" : "max-h-0",
                  )}
                >
                  <div className="space-y-4">
                    {socialLinks.length > 0 ? (
                      socialLinks.map((_: any, socialLinkIndex: number) => (
                        <Card
                          key={`${langCode}-${index}-social-${socialLinkIndex}`}
                          className=""
                        >
                          <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                  {socialLinkIndex + 1}
                                </div>
                                <h5 className="text-sm font-medium">
                                  {t('footerForm.card.socialLinks.linkTitle', 'Social Link {{index}}', { index: socialLinkIndex + 1 })}
                                </h5>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSocialLink(socialLinkIndex)}
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`${langCode}.${index}.socialLinks.${socialLinkIndex}.url`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">
                                    {t('footerForm.card.socialLinks.urlLabel', 'Social Link URL')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('footerForm.card.socialLinks.urlPlaceholder', 'https://example.com')}
                                      className="h-10 hover:border-primary transition-colors"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <FormLabel className="text-sm font-medium">
                                {t('footerForm.card.socialLinks.imageLabel', 'Social Link Image')}
                              </FormLabel>
                              {SocialLinkImageUploader ? (
                                <SocialLinkImageUploader
                                  heroIndex={index}
                                  socialLinkIndex={socialLinkIndex}
                                  langCode={langCode}
                                />
                              ) : (
                                <LabeledImageUploader
                                  label=""
                                  helperText={t('footerForm.card.socialLinks.imageHelper', 'This image will be used across all languages')}
                                  imageValue={
                                    form.watch(`${langCode}.${index}.socialLinks.${socialLinkIndex}.image`) || ""
                                  }
                                  inputId={`social-link-image-${langCode}-${index}-${socialLinkIndex}`}
                                  onUpload={(file) => {
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      form.setValue(
                                        `${langCode}.${index}.socialLinks.${socialLinkIndex}.image`,
                                        reader.result as string,
                                        {
                                          shouldDirty: true,
                                          shouldValidate: false,
                                        },
                                      )
                                    }
                                    reader.readAsDataURL(file)
                                  }}
                                  onRemove={() => {
                                    form.setValue(`${langCode}.${index}.socialLinks.${socialLinkIndex}.image`, "", {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    })
                                  }}
                                  altText={t('footerForm.card.socialLinks.linkTitle', 'Social Link {{index}} image', { index: socialLinkIndex + 1 })}
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="border-2 border-dashed border-gray-200">
                        <CardContent className="text-center py-8 text-gray-500">
                          <ExternalLink className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium">
                            {t('footerForm.card.socialLinks.emptyState.title', 'No social links added yet')}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {t('footerForm.card.socialLinks.emptyState.description', 'Click "Add Social Link" to get started')}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialLink}
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('footerForm.card.socialLinks.addButton', 'Add Social Link')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  },
)

FooterCard.displayName = "FooterCard"