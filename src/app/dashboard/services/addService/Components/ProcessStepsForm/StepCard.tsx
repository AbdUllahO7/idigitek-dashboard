import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button";
import { Trash2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { IconComponent, IconNames } from "@/src/utils/MainSectionComponents";

interface StepCardProps {
  index: number;
  langCode: string;
  isFirstLanguage: boolean;
  defaultLangCode: string;
  form: any;
  onDelete: (langCode: string, index: number) => void;
  availableIcons: IconNames[];
}

// Memoized StepCard component to prevent unnecessary rerenders
export const StepCard = memo(({ 
  index, 
  langCode, 
  isFirstLanguage, 
  defaultLangCode, 
  form, 
  onDelete,
  availableIcons
}: StepCardProps) => {
  const handleDelete = () => onDelete(langCode, index);
  
  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Step {index + 1}</CardTitle>
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
        {isFirstLanguage ? (
          <FormField
            control={form.control}
            name={`${langCode}.${index}.icon`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon">
                        <div className="flex items-center">
                          <span className="mr-2"><IconComponent iconName={field.value} /></span>
                          {field.value}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center">
                          <span className="mr-2"><IconComponent iconName={icon} /></span>
                          {icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="mb-4">
            <FormLabel className="text-muted-foreground">Icon (controlled by {defaultLangCode})</FormLabel>
            <div className="flex items-center h-10 px-3 border rounded-md bg-muted/10">
              <span className="mr-2">
                <IconComponent iconName={form.watch(`${defaultLangCode}.${index}.icon`) || "Car"} />
              </span>
              {form.watch(`${defaultLangCode}.${index}.icon`) || "Car"}
            </div>
            <input 
              type="hidden" 
              {...form.register(`${langCode}.${index}.icon`)} 
              value={form.watch(`${defaultLangCode}.${index}.icon`) || "Car"}
            />
          </div>
        )}
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
      </CardContent>
    </Card>
  );
});

StepCard.displayName = "StepCard";

