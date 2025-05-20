"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { LabeledImageUploader, useImageUpload } from "../../services/addService/Utils/Image-uploader";

interface HeroCardProps {
  langCode: string;
  index: number;
  form: any;
  onDelete: (langCode: string, index: number) => void;
  HeroImageUploader?: React.ComponentType<any>; // Keep for compatibility
}

export const HeroCard = memo(({
  langCode,
  index,
  form,
  onDelete,
  HeroImageUploader, // Optional, for backward compatibility
}: HeroCardProps) => {
  const { imageFile, imagePreview, handleImageUpload, handleImageRemove } = useImageUpload({
    form,
    fieldPath: `${langCode}.${index}.image`,
    validate: (file) => {
      if (file.size > 2 * 1024 * 1024) {
        return "Image must be less than 2MB";
      }
      return true;
    },
  });

  const handleDelete = () => onDelete(langCode, index);

  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Hero {index + 1}</CardTitle>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <FormField
          control={form.control}
          name={`${langCode}.${index}.title`}
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

        <FormField
          control={form.control}
          name={`${langCode}.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" className="min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${langCode}.${index}.exploreButton`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Explore Button</FormLabel>
              <FormControl>
                <Input placeholder="Enter Explore Button text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${langCode}.${index}.requestButton`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Button</FormLabel>
              <FormControl>
                <Input placeholder="Enter Request Button text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {HeroImageUploader ? (
          <HeroImageUploader featureIndex={index} langCode={langCode} />
        ) : (
          <LabeledImageUploader
            label="Hero Image"
            helperText="(applies to all languages)"
            imageValue={imagePreview || form.watch(`${langCode}.${index}.image`) || ""}
            inputId={`hero-image-${langCode}-${index}`}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            altText={`Hero ${index + 1} image`}
          />
        )}
      </CardContent>
    </Card>
  );
});

HeroCard.displayName = "HeroCard";