"use client"

import { memo, useState } from "react"
import { Plus, ChevronDown, ChevronUp, ExternalLink, Trash2 } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { LabeledImageUploader } from "../../../services/addService/Utils/Image-uploader"
import { cn } from "@/src/lib/utils"
import { useTranslation } from "react-i18next"

interface SocialLinksSectionProps {
  form: any
  footerIndex: number
  primaryLangCode: string
  SocialLinkImageUploader?: React.ComponentType<any>
}

export const SocialLinksSection = memo(({
  form,
  footerIndex,
  primaryLangCode,
  SocialLinkImageUploader,
}: SocialLinksSectionProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)

  const socialLinks = form.watch(`${primaryLangCode}.${footerIndex}.socialLinks`) || []

  const addSocialLink = () => {
    const currentSocialLinks = form.getValues(`${primaryLangCode}.${footerIndex}.socialLinks`) || []
    form.setValue(`${primaryLangCode}.${footerIndex}.socialLinks`, [...currentSocialLinks, { image: "", url: "" }], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const removeSocialLink = (socialLinkIndex: number) => {
    const currentSocialLinks = form.getValues(`${primaryLangCode}.${footerIndex}.socialLinks`) || []
    const updatedSocialLinks = currentSocialLinks.filter((_: any, i: number) => i !== socialLinkIndex)
    form.setValue(`${primaryLangCode}.${footerIndex}.socialLinks`, updatedSocialLinks, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <Card className="border-2">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExternalLink className="h-5 w-5 " />
            <div className="flex flex-col">
              <CardTitle className="text-base font-semibold ">
                {t('footerForm.socialLinks.title', 'Social Links for Footer {{index}}', { index: footerIndex + 1 })}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                  {t('footerForm.socialLinks.appliesToAll', 'Applies to all languages')}
                </span>
               
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-3 "
          >
            <span className="text-xs mr-1">
              {isExpanded 
                ? t('footerForm.socialLinks.collapse', 'Collapse')
                : t('footerForm.socialLinks.expand', 'Expand')
              }
            </span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-none p-4 pt-0" : "max-h-0 p-0",
        )}
      >
        <div className="space-y-4">
          {socialLinks.length > 0 ? (
            socialLinks.map((_: any, socialLinkIndex: number) => (
              <Card
                key={`social-link-${footerIndex}-${socialLinkIndex}`}
                className=""
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {socialLinkIndex + 1}
                      </div>
                      <h5 className="text-sm font-medium">
                        {t('footerForm.socialLinks.linkTitle', 'Social Link {{index}}', { index: socialLinkIndex + 1 })}
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
                    name={`${primaryLangCode}.${footerIndex}.socialLinks.${socialLinkIndex}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t('footerForm.socialLinks.urlLabel', 'Social Link URL')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('footerForm.socialLinks.urlPlaceholder', 'https://example.com')}
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
                      {t('footerForm.socialLinks.imageLabel', 'Social Link Image')}
                    </FormLabel>
                    {SocialLinkImageUploader ? (
                      <SocialLinkImageUploader
                        heroIndex={footerIndex}
                        socialLinkIndex={socialLinkIndex}
                        langCode={primaryLangCode}
                      />
                    ) : (
                      <LabeledImageUploader
                        label=""
                        helperText={t('footerForm.socialLinks.imageHelper', 'This image will be used across all languages')}
                        imageValue={
                          form.watch(`${primaryLangCode}.${footerIndex}.socialLinks.${socialLinkIndex}.image`) || ""
                        }
                        inputId={`social-link-image-${primaryLangCode}-${footerIndex}-${socialLinkIndex}`}
                        onUpload={(file) => {
                          const reader = new FileReader()
                          reader.onload = () => {
                            form.setValue(
                              `${primaryLangCode}.${footerIndex}.socialLinks.${socialLinkIndex}.image`,
                              reader.result as string,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }
                          reader.readAsDataURL(file)
                        }}
                        onRemove={() => {
                          form.setValue(`${primaryLangCode}.${footerIndex}.socialLinks.${socialLinkIndex}.image`, "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }}
                        altText={t('footerForm.socialLinks.linkTitleImage', 'Social Link {{index}} image', { index: socialLinkIndex + 1 })}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
              <CardContent className="text-center py-8 text-blue-600">
                <ExternalLink className="h-12 w-12 mx-auto mb-3 text-blue-300" />
                <p className="text-sm font-medium">
                  {t('footerForm.socialLinks.emptyState.title', 'No social links added yet')}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {t('footerForm.socialLinks.emptyState.description', 'Click "Add Social Link" to get started')}
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialLink}
            className="w-full  hover:text-white transition-colors "
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('footerForm.socialLinks.addButton', 'Add Social Link')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

SocialLinksSection.displayName = "SocialLinksSection"