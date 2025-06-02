"use client";

import { memo, useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";

// Mock components for demonstration
const LabeledImageUploader = ({ label, helperText, imageValue, inputId, onUpload, onRemove, altText }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
      <p className="text-sm text-muted-foreground">{helperText}</p>
      <Button type="button" variant="outline" size="sm" className="mt-2">
        Upload Image
      </Button>
    </div>
  </div>
);

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
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const { imageFile, imagePreview, handleImageUpload, handleImageRemove } = useImageUpload({
    form,
    fieldPath: `${langCode}.${index}.image`,
    validate: (file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        return "Image must be less than 2MB";
      }
      return true;
    },
  });

  const handleDelete = () => onDelete(langCode, index);

  // Mock form watch function
  const mockWatch = (path: string) => {
    if (path.includes('exploreButtonType')) return 'default';
    if (path.includes('requestButtonType')) return 'default';
    return '';
  };

  const exploreButtonType = form?.watch ? form.watch(`${langCode}.${index}.exploreButtonType`) || "default" : mockWatch(`${langCode}.${index}.exploreButtonType`);
  const requestButtonType = form?.watch ? form.watch(`${langCode}.${index}.requestButtonType`) || "default" : mockWatch(`${langCode}.${index}.requestButtonType`);

  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Hero {index + 1}</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0"
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
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" className="min-h-[80px]" {...field} />
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
                  <FormLabel>Explore Button Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Explore Button text" {...field} />
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
                      <FormLabel>Explore Button Link Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field?.onChange}
                          defaultValue={field?.value || "default"}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="default" id={`explore-default-${index}`} />
                            <Label htmlFor={`explore-default-${index}`}>Default</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="special" id={`explore-special-${index}`} />
                            <Label htmlFor={`explore-special-${index}`}>Special Link</Label>
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
                        <FormLabel>Explore Button URL <span className="text-muted-foreground">(optional)</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com" 
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

          {/* Request Button Section */}
          <div className="space-y-3 border-t pt-4">
            <FormField
              control={form?.control}
              name={`${langCode}.${index}.requestButton`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Button Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Request Button text" {...field} />
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
                  name={`${langCode}.${index}.requestButtonType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Button Link Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field?.onChange}
                          defaultValue={field?.value || "default"}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="default" id={`request-default-${index}`} />
                            <Label htmlFor={`request-default-${index}`}>Default</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="special" id={`request-special-${index}`} />
                            <Label htmlFor={`request-special-${index}`}>Special Link</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show URL field only if special link is selected */}
                {requestButtonType === "special" && (
                  <FormField
                    control={form?.control}
                    name={`${langCode}.${index}.requestButtonUrl`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Button URL <span className="text-muted-foreground">(optional)</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com" 
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
                label="Hero Image"
                helperText="(applies to all languages)"
                imageValue={imagePreview || (form?.watch ? form.watch(`${langCode}.${index}.image`) : '') || ""}
                inputId={`hero-image-${langCode}-${index}`}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                altText={`Hero ${index + 1} image`}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
});

HeroCard.displayName = "HeroCard";

// Demo component to show the HeroCard in action
export default function HeroCardDemo() {
  const [heroCards, setHeroCards] = useState([
    { id: 1, langCode: 'en', index: 0 },
    { id: 2, langCode: 'en', index: 1 },
  ]);

  const handleDelete = (langCode: string, index: number) => {
    setHeroCards(prev => prev.filter(card => !(card.langCode === langCode && card.index === index)));
  };

  const mockForm = {
    control: {},
    watch: () => '',
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Collapsible Hero Cards</h1>
      {heroCards.map((card) => (
        <HeroCard
          key={card.id}
          langCode={card.langCode}
          index={card.index}
          form={mockForm}
          onDelete={handleDelete}
          isFirstLanguage={true}
        />
      ))}
    </div>
  );
}
