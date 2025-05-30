"use client";

import { memo, useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { LabeledImageUploader, useImageUpload } from "../../../services/addService/Utils/Image-uploader";
import * as Collapsible from "@radix-ui/react-collapsible";

interface FooterCardProps {
  langCode: string;
  index: number;
  form: any;
  isFirstLanguage: boolean; // Add isFirstLanguage to props
  onDelete: (langCode: string, index: number) => void;
  FooterImageUploader?: React.ComponentType<any>;
  SocialLinkImageUploader?: React.ComponentType<any>;
}

export const FooterCard = memo(({ langCode, index, form, isFirstLanguage, onDelete, FooterImageUploader, SocialLinkImageUploader }: FooterCardProps) => {
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

  const addSocialLink = () => {
    const currentSocialLinks = form.getValues(`${langCode}.${index}.socialLinks`) || [];
    form.setValue(`${langCode}.${index}.socialLinks`, [
      ...currentSocialLinks,
      { image: "", url: "" },
    ], { shouldDirty: true, shouldValidate: true });
  };

  const removeSocialLink = (socialLinkIndex: number) => {
    const currentSocialLinks = form.getValues(`${langCode}.${index}.socialLinks`) || [];
    const updatedSocialLinks = currentSocialLinks.filter((_: any, i: number) => i !== socialLinkIndex);
    form.setValue(`${langCode}.${index}.socialLinks`, updatedSocialLinks, {
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
        {isFirstLanguage && ( // Only render social links section for the first language
          <Collapsible.Root open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
            <Collapsible.Trigger asChild>
              <Button type="button" variant="outline" className="w-full flex justify-between">
                <span>Social Links</span>
                <span>{isCollapsibleOpen ? "Collapse" : "Expand"}</span>
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-4 mt-4">
              {form.watch(`${langCode}.${index}.socialLinks`)?.map((_: any, socialLinkIndex: number) => (
                <div key={`${langCode}-${index}-social-${socialLinkIndex}`} className="border p-4 rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Social Link {socialLinkIndex + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSocialLink(socialLinkIndex)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`${langCode}.${index}.socialLinks.${socialLinkIndex}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Link URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter social link URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {SocialLinkImageUploader ? (
                    <SocialLinkImageUploader
                      heroIndex={index}
                      socialLinkIndex={socialLinkIndex}
                      langCode={langCode}
                    />
                  ) : (
                    <LabeledImageUploader
                      label={`Social Link ${socialLinkIndex + 1} Image`}
                      helperText="(applies to all languages)"
                      imageValue={form.watch(`${langCode}.${index}.socialLinks.${socialLinkIndex}.image`) || ""}
                      inputId={`social-link-image-${langCode}-${index}-${socialLinkIndex}`}
                      onUpload={(file) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          form.setValue(`${langCode}.${index}.socialLinks.${socialLinkIndex}.image`, reader.result as string, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                      onRemove={() => {
                        form.setValue(`${langCode}.${index}.socialLinks.${socialLinkIndex}.image`, "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      altText={`Social Link ${socialLinkIndex + 1} image`}
                    />
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                <Plus className="mr-2 h-4 w-4" />
                Add Social Link
              </Button>
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </CardContent>
    </Card>
  );
});

FooterCard.displayName = "FooterCard";