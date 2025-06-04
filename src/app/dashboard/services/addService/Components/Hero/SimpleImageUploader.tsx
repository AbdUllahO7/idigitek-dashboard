"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { useLanguage } from "@/src/context/LanguageContext";
import { ImageIcon } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

/**
 * SimpleImageUploader - Reusable image upload component
 */
interface SimpleImageUploaderProps {
  imageValue?: string;
  inputId: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  altText?: string;
  acceptedTypes?: string;
}

export const SimpleImageUploader = memo(({
  imageValue,
  inputId,
  onUpload,
  onRemove,
  altText = "Image preview",
  acceptedTypes = "image/jpeg,image/png,image/gif,image/svg+xml"
}: SimpleImageUploaderProps) => {
  const { t } = useTranslation();
  const {language} = useLanguage();
  const isRtl = language === 'ar'
  return (
    <div className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-primary transition-colors" dir={isRtl ? 'rtl' : 'ltr'}>
        {imageValue ? (
          <div className="relative w-full">
            <div className="w-full aspect-video relative rounded-md overflow-hidden">
              <img 
                src={imageValue} 
                alt={altText} 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex justify-center mt-2 space-x-2">
              <label 
                htmlFor={inputId}
                className="inline-flex items-center px-3 py-1.5 border border-primary text-xs rounded-md font-medium bg-white text-primary cursor-pointer hover:bg-primary/10 transition-colors"
              >
                {t("simpleImageUploader.buttons.replaceImage")}
              </label>
              <button 
                type="button"
                onClick={onRemove}
                className="inline-flex items-center px-3 py-1.5 border border-destructive text-xs rounded-md font-medium bg-white text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
              >
                {t("simpleImageUploader.buttons.remove")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">{t("simpleImageUploader.labels.dragAndDrop")}</p>
            <label 
              htmlFor={inputId}
              className="inline-flex items-center px-4 py-2 border border-primary text-sm rounded-md font-medium bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
            >
              {t("simpleImageUploader.buttons.uploadImage")}
            </label>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept={acceptedTypes}
          onChange={onUpload}
          className="hidden"
        />
      </div>
    </div>
  );
});

SimpleImageUploader.displayName = "SimpleImageUploader";

/**
 * BackgroundImageSection - Component for managing the hero background image
 */
interface BackgroundImageSectionProps {
  imagePreview?: string;
  imageValue?: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  imageType?: string;
}

export const BackgroundImageSection = memo(({
  imagePreview,
  imageValue,
  onUpload,
  onRemove,
  imageType
}: BackgroundImageSectionProps) => {
  const { t } = useTranslation();
  const {language} = useLanguage();
  const isRtl = language === 'ar'
  return (
    <div className="mb-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {imageType === "logo" 
              ? t("backgroundImageSection.titles.logoImage") 
              : t("backgroundImageSection.titles.sectionImage")}
          </CardTitle>
          <CardDescription>
            {imageType === "logo"
              ? t("backgroundImageSection.descriptions.logoImage")
              : t("backgroundImageSection.descriptions.sectionImage")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                {imageType === "logo"
                  ? t("backgroundImageSection.labels.logo")
                  : t("backgroundImageSection.labels.backgroundImage")}
                <span className="text-xs text-muted-foreground">
                  {t("backgroundImageSection.labels.appliesToAllLanguages")}
                </span>
              </Label>
              <SimpleImageUploader
                imageValue={imagePreview || imageValue}
                inputId="file-upload-background-image"
                onUpload={onUpload}
                onRemove={onRemove}
                altText={t("simpleImageUploader.altText", { defaultValue: "Image preview" })}
                acceptedTypes="image/jpeg,image/png,image/gif,image/svg+xml"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BackgroundImageSection.displayName = "BackgroundImageSection";