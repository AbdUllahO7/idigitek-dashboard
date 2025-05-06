import { Button } from "@/src/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { X } from "lucide-react";
import { memo } from "react";

interface FeatureItemProps {
  featureItemIndex: number;
  langCode: string;
  index: number;
  form: any; // Replace 'any' with your actual form type
  onRemoveFeatureItem: (langCode: string, index: number, featureItemIndex: number) => void;
}

// Feature Item component - memoized to prevent unnecessary re-renders
export const FeatureItem = memo(({
    featureItemIndex,
    langCode,
    index,
    form,
    onRemoveFeatureItem
  } : FeatureItemProps) => {
    const handleRemove = () => onRemoveFeatureItem(langCode, index, featureItemIndex);
    
    return (
      <FormField
        key={featureItemIndex}
        control={form.control}
        name={`${langCode}.${index}.content.features.${featureItemIndex}` as any}
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <div className="flex-1">
              <FormControl>
                <Input placeholder={`Feature ${featureItemIndex + 1}`} {...field} />
              </FormControl>
              <FormMessage />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </FormItem>
        )}
      />
    );
  });
  
  FeatureItem.displayName = "FeatureItem";