import {  FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { memo } from "react";
import {  AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { Button } from "@/src/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { useTranslation } from "react-i18next";


// Define the props interface
interface FaqItemProps {
  langCode: string;
  index: number;
  faq: { question: string; answer: string };
  form: any; // Replace 'any' with your actual form type
  onConfirmDelete: (langCode: string, index: number) => void;
}

// Memoized FaqItem component to prevent unnecessary re-renders
export const FaqItem = memo(({ 
  langCode, 
  index, 
  faq, 
  form, 
  onConfirmDelete 
}: FaqItemProps) => {
  const { t } = useTranslation(); // Add translation hook
  
  const handleDelete = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    onConfirmDelete(langCode, index);
  };

  return (
      <AccordionItem value={`item-${index}`} className="border bg-[#020817]  rounded-lg overflow-hidden mb-10 py-3">
      <div className="flex items-center justify-between">
        <AccordionTrigger className="flex-1 mr-2 ml-2">
          {faq.question || t("faqForm.item.defaultTitle", { number: index + 1 })}
        </AccordionTrigger>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="mr-4 ml-4"
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
                  <FormLabel>{t("faqForm.item.fields.question.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("faqForm.item.fields.question.placeholder")} {...field} />
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
                  <FormLabel>{t("faqForm.item.fields.answer.label")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("faqForm.item.fields.answer.placeholder")} 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
});

FaqItem.displayName = "FaqItem";