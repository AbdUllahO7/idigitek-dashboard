"use client";

import { memo, useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { LabeledImageUploader, useImageUpload } from "../../../services/addService/Utils/Image-uploader";
import * as Collapsible from "@radix-ui/react-collapsible";

interface FooterCardProps {
  langCode: string;
  index: number;
  form: any;
  onDelete: (langCode: string, index: number) => void;
  FooterImageUploader?: React.ComponentType<any>;
  SpecialLinkImageUploader?: React.ComponentType<any>;
}

export const SpecialFooterCard = memo(({ langCode, index, form, onDelete, FooterImageUploader, SpecialLinkImageUploader }: FooterCardProps) => {
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

  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const handleDelete = () => onDelete(langCode, index);

  const addSpecialLink = () => {
    const currentSpecialLinks = form.getValues(`${langCode}.${index}.specialLinks`) || [];
    form.setValue(`${langCode}.${index}.specialLinks`, [
      ...currentSpecialLinks,
      { image: "", url: "" },
    ], { shouldDirty: true, shouldValidate: true });
  };

  const removeSpecialLink = (specialLinkIndex: number) => {
    const currentSpecialLinks = form.getValues(`${langCode}.${index}.specialLinks`) || [];
    const updatedSpecialLinks = currentSpecialLinks.filter((_: any, i: number) => i !== specialLinkIndex);
    form.setValue(`${langCode}.${index}.specialLinks`, updatedSpecialLinks, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Footer {index + 1}</CardTitle>
        <Button type="button" variant="destructive" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
      
        <Collapsible.Root open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
          <Collapsible.Trigger asChild>
            <Button type="button" variant="outline" className="w-full flex justify-between">
              <span>Special Links</span>
              <span>{isCollapsibleOpen ? "Collapse" : "Expand"}</span>
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-4 mt-4">
            {form.watch(`${langCode}.${index}.specialLinks`)?.map((_: any, specialLinkIndex: number) => (
              <div key={`${langCode}-${index}-special-${specialLinkIndex}`} className="border p-4 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Special Link {specialLinkIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeSpecialLink(specialLinkIndex)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`${langCode}.${index}.specialLinks.${specialLinkIndex}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Link URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter special link URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
          
                  <LabeledImageUploader
                    label={`Special Link ${specialLinkIndex + 1} Image`}
                    helperText="(applies to all languages)"
                    imageValue={form.watch(`${langCode}.${index}.specialLinks.${specialLinkIndex}.image`) || ""}
                    inputId={`special-link-image-${langCode}-${index}-${specialLinkIndex}`}
                    onUpload={(file) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        form.setValue(`${langCode}.${index}.specialLinks.${specialLinkIndex}.image`, reader.result as string, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                    onRemove={() => {
                      form.setValue(`${langCode}.${index}.specialLinks.${specialLinkIndex}.image`, "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    altText={`Special Link ${specialLinkIndex + 1} image`}
                  />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addSpecialLink}>
              <Plus className="mr-2 h-4 w-4" />
              Add Special Link
            </Button>
          </Collapsible.Content>
        </Collapsible.Root>
      </CardContent>
    </Card>
  );
});

SpecialFooterCard.displayName = "SpecialFooterCard";