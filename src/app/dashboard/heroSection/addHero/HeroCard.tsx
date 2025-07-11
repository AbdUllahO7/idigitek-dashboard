"use client";

import { memo, useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import { useLanguage } from "@/src/context/LanguageContext";

// Mock components for demonstration
const LabeledImageUploader = ({ label, helperText, imageValue, inputId, onUpload, onRemove, altText }: any) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">{helperText}</p>
        <Button type="button" variant="outline" size="sm" className="mt-2">
          {t("heroCard.uploadImageText")}
        </Button>
      </div>
    </div>
  );
};

const useImageUpload = ({ form, fieldPath, validate }: any) => ({
  imageFile: null,
  imagePreview: null,
  handleImageUpload: () => {},
  handleImageRemove: () => {},
});

interface HeroCardProps {
  langCode: string;
  index: number;
  form: any;
  onDelete: (langCode: string, index: number) => void;
  isFirstLanguage: boolean;
  HeroImageUploader?: React.ComponentType<any>;
}

export const HeroCard = memo(({
  langCode,
  index,
  form,
  onDelete,
  isFirstLanguage,
  HeroImageUploader,
}: HeroCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const {language} = useLanguage()
  const { imageFile, imagePreview, handleImageUpload, handleImageRemove } = useImageUpload({
    form,
    fieldPath: `${langCode}.${index}.image`,
    validate: (file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        return t("heroCard.imageSizeError");
      }
      return true;
    },
  });

  const handleDelete = () => onDelete(langCode, index);

  // Mock form watch function
  const mockWatch = (path: string) => {
    if (path.includes('exploreButtonType')) return 'default';
    return '';
  };

  const exploreButtonType = form?.watch ? form.watch(`${langCode}.${index}.exploreButtonType`) || "default" : mockWatch(`${langCode}.${index}.exploreButtonType`);

  return (
    <Card className="border border-muted" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">
            {t("heroCard.heroTitle", { index: index + 1 })}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0"
            aria-label={t("heroCard.expandCollapse")}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          aria-label={t("heroCard.deleteHero")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="p-4 pt-0 space-y-4">
          <FormField
            control={form?.control}
            name={`${langCode}.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("heroCard.titleLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("heroCard.titlePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form?.control}
            name={`${langCode}.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("heroCard.descriptionLabel")}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t("heroCard.descriptionPlaceholder")} 
                    className="min-h-[80px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Explore Button Section */}
          <div className="space-y-3 border-t pt-4">
            <FormField
              control={form?.control}
              name={`${langCode}.${index}.exploreButton`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("heroCard.exploreButtonTextLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("heroCard.exploreButtonPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Only show button type selection and URL for first language */}
            {isFirstLanguage && (
              <>
                <FormField
                  control={form?.control}
                  name={`${langCode}.${index}.exploreButtonType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("heroCard.exploreButtonLinkTypeLabel")}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field?.onChange}
                          defaultValue={field?.value || "default"}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="default" id={`explore-default-${index}`} />
                            <Label htmlFor={`explore-default-${index}`}>
                              {t("heroCard.defaultOption")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="special" id={`explore-special-${index}`} />
                            <Label htmlFor={`explore-special-${index}`}>
                              {t("heroCard.specialLinkOption")}
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show URL field only if special link is selected */}
                {exploreButtonType === "special" && (
                  <FormField
                    control={form?.control}
                    name={`${langCode}.${index}.exploreButtonUrl`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("heroCard.exploreButtonUrlLabel")} {" "}
                          <span className="text-muted-foreground">
                            {t("heroCard.optionalText")}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("heroCard.urlPlaceholder")} 
                            type="url"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </div>

  

          {/* Image Section */}
          <div className="border-t pt-4">
            {HeroImageUploader ? (
              <HeroImageUploader featureIndex={index} langCode={langCode} />
            ) : (
              <LabeledImageUploader
                label={t("heroCard.heroImageLabel")}
                helperText={t("heroCard.appliesToAllLanguages")}
                imageValue={imagePreview || (form?.watch ? form.watch(`${langCode}.${index}.image`) : '') || ""}
                inputId={`hero-image-${langCode}-${index}`}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                altText={t("heroCard.heroImageAlt", { index: index + 1 })}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
});

HeroCard.displayName = "HeroCard";