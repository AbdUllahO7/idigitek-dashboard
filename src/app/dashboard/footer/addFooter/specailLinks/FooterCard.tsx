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
  isFirstLanguage: boolean;
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
    const newSocialLink = { image: "", url: "", linkName: "" };
    
    // Add to current language
    form.setValue(`${langCode}.${index}.socialLinks`, [
        ...currentSocialLinks,
        newSocialLink,
    ], { shouldDirty: true, shouldValidate: true });
    
    // If this is the first language, sync structure to all other languages
    if (isFirstLanguage) {
        const allValues = form.getValues();
        Object.keys(allValues).forEach((otherLangCode) => {
            if (otherLangCode !== langCode) {
                const otherSocialLinks = form.getValues(`${otherLangCode}.${index}.socialLinks`) || [];
                form.setValue(`${otherLangCode}.${index}.socialLinks`, [
                    ...otherSocialLinks,
                    { 
                        image: "", 
                        url: "", // Will be synced when user enters URL in first language
                        linkName: "" // Each language will have its own linkName
                    },
                ], { shouldDirty: true, shouldValidate: true });
            }
        });
    }
  };

  const removeSocialLink = (socialLinkIndex: number) => {
    const currentSocialLinks = form.getValues(`${langCode}.${index}.socialLinks`) || [];
    const updatedSocialLinks = currentSocialLinks.filter((_: any, i: number) => i !== socialLinkIndex);
    
    // Remove from current language
    form.setValue(`${langCode}.${index}.socialLinks`, updatedSocialLinks, {
        shouldDirty: true,
        shouldValidate: true,
    });
    
    // If this is the first language, sync removal to all other languages
    if (isFirstLanguage) {
        const allValues = form.getValues();
        Object.keys(allValues).forEach((otherLangCode) => {
            if (otherLangCode !== langCode) {
                const otherSocialLinks = form.getValues(`${otherLangCode}.${index}.socialLinks`) || [];
                const otherUpdatedSocialLinks = otherSocialLinks.filter((_: any, i: number) => i !== socialLinkIndex);
                form.setValue(`${otherLangCode}.${index}.socialLinks`, otherUpdatedSocialLinks, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        });
    }
  };

  // Get the current social links for this language
  const currentSocialLinks = form.watch(`${langCode}.${index}.socialLinks`) || [];

  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Footer {index + 1}</CardTitle>
        {isFirstLanguage && (
          <Button type="button" variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <FormField
          control={form.control}
          name={`${langCode}.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter title" className="min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Show social links for ALL languages, but with different permissions */}
        {currentSocialLinks.length > 0 && (
          <Collapsible.Root open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
            <Collapsible.Trigger asChild>
              <Button type="button" variant="outline" className="w-full flex justify-between">
                <span>
                  Social Links 
                  {!isFirstLanguage && <span className="text-sm text-muted-foreground ml-2">(Translate Names)</span>}
                </span>
                <span>{isCollapsibleOpen ? "Collapse" : "Expand"}</span>
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-4 mt-4">
              {currentSocialLinks.map((_: any, socialLinkIndex: number) => (
                <div key={`${langCode}-${index}-social-${socialLinkIndex}`} className="border p-4 rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Social Link {socialLinkIndex + 1}</h4>
                    {/* Only allow first language to remove social links */}
                    {isFirstLanguage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeSocialLink(socialLinkIndex)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* LinkName field - EDITABLE for ALL languages */}
                  <FormField
                    control={form.control}
                    name={`${langCode}.${index}.socialLinks.${socialLinkIndex}.linkName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Link Name 
                          {!isFirstLanguage && <span className="text-sm text-muted-foreground ml-1">(Translate this)</span>}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter link name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* URL field - Different behavior for first language vs others */}
                  <FormField
                    control={form.control}
                    name={`${langCode}.${index}.socialLinks.${socialLinkIndex}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Social Link URL
                          {!isFirstLanguage && <span className="text-sm text-muted-foreground ml-1">(Synced from primary language)</span>}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter social link URL" 
                            {...field}
                            disabled={!isFirstLanguage} // Disable for non-primary languages
                            className={!isFirstLanguage ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Image upload - Only for first language */}
                  {isFirstLanguage && (
                    <>
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
                    </>
                  )}
                  
                  {/* Show note for non-primary languages about image sharing */}
                  {!isFirstLanguage && (
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      <span>📷 Image is managed from the primary language and shared across all languages</span>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add Social Link button - Only for first language */}
              {isFirstLanguage && (
                <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Social Link
                </Button>
              )}
            </Collapsible.Content>
          </Collapsible.Root>
        )}
        
        {/* Show "Add Social Link" button if no social links exist and this is first language */}
        {isFirstLanguage && currentSocialLinks.length === 0 && (
          <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
            <Plus className="mr-2 h-4 w-4" />
            Add Social Link
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

FooterCard.displayName = "FooterCard";