"use client";

import { memo } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

interface FaqItemProps {
  langCode: string;
  index: number;
  faq: { question: string; answer: string; socialLinks?: { name: string; url: string; image: string }[] };
  form: any;
  onConfirmDelete: (langCode: string, index: number) => void;
  isFirstLanguage: boolean;
  languageIds: string[];
  SocialLinkImageUploader?: React.ComponentType<any>;
}

export const FaqItem = memo(({
  langCode,
  index,
  faq,
  form,
  onConfirmDelete,
  isFirstLanguage,
  languageIds,
  SocialLinkImageUploader,
}: FaqItemProps) => {
  const socialLinks = form.watch(`${langCode}.${index}.socialLinks`) || [];

  const handleDelete = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onConfirmDelete(langCode, index);
  };

  const addSocialLink = () => {
    const newSocialLink = { name: "", url: "", image: "" };
    const currentSocialLinks = form.getValues(`${langCode}.${index}.socialLinks`) || [];
    const newSocialLinks = [...currentSocialLinks, newSocialLink];

    languageIds.forEach((lang) => {
      form.setValue(`${lang}.${index}.socialLinks`, newSocialLinks, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
    form.trigger(`${langCode}.${index}.socialLinks`);
  };

  const removeSocialLink = (socialLinkIndex: number) => {
    const currentSocialLinks = form.getValues(`${langCode}.${index}.socialLinks`) || [];
    const updatedSocialLinks = currentSocialLinks.filter((_: any, i: number) => i !== socialLinkIndex);

    languageIds.forEach((lang) => {
      form.setValue(`${lang}.${index}.socialLinks`, updatedSocialLinks, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const handleSocialLinkChange = (socialLinkIndex: number, field: string, value: string) => {
    languageIds.forEach((lang) => {
      form.setValue(`${lang}.${index}.socialLinks.${socialLinkIndex}.${field}`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  return (
    <AccordionItem value={`item-${index}`}>
      <div className="flex items-center justify-between">
        <AccordionTrigger className="flex-1">
          {faq.question || `FAQ ${index + 1}`}
        </AccordionTrigger>
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
      <AccordionContent>
        <Card className="border border-muted">
          <CardContent className="p-4 space-y-4">
            <FormField
              control={form.control}
              name={`${langCode}.${index}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter question" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${langCode}.${index}.answer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter answer"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isFirstLanguage && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Social Links</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Social Link
                  </Button>
                </div>
                {socialLinks.length > 0 ? (
                  <div className="space-y-4">
                    {socialLinks.map((link: any, socialLinkIndex: number) => (
                      <div
                        key={`${langCode}-${index}-social-${socialLinkIndex}`}
                        className="border p-4 rounded-md space-y-4 bg-muted/30"
                      >
                        <div className="flex justify-between items-center">
                          <h5 className="text-sm font-medium">Social Link {socialLinkIndex + 1}</h5>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSocialLink(socialLinkIndex)}
                          >
                            <Minus className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`${langCode}.${index}.socialLinks.${socialLinkIndex}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Social Platform Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Twitter, Facebook"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleSocialLinkChange(socialLinkIndex, "name", e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`${langCode}.${index}.socialLinks.${socialLinkIndex}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Social Link URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleSocialLinkChange(socialLinkIndex, "url", e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`${langCode}.${index}.socialLinks.${socialLinkIndex}.image`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Social Link Image</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  {SocialLinkImageUploader ? (
                                    <SocialLinkImageUploader
                                      heroIndex={index}
                                      socialLinkIndex={socialLinkIndex}
                                      langCode={langCode}
                                      onImageChange={(image: string) =>
                                        handleSocialLinkChange(socialLinkIndex, "image", image)
                                      }
                                    />
                                  ) : (
                                    <>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              const result = reader.result as string;
                                              field.onChange(result);
                                              handleSocialLinkChange(socialLinkIndex, "image", result);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                      {field.value && (
                                        <div className="relative">
                                          <img
                                            src={field.value || "/placeholder.svg"}
                                            alt={`Social Link ${socialLinkIndex + 1}`}
                                            className="w-20 h-20 object-cover rounded border"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute -top-2 -right-2"
                                            onClick={() => {
                                              field.onChange("");
                                              handleSocialLinkChange(socialLinkIndex, "image", "");
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                (applies to all languages)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No social links added yet.</p>
                    <p className="text-xs">Click "Add Social Link" to get started.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
});

FaqItem.displayName = "FaqItem";