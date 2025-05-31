import { memo } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Trash2 } from "lucide-react";

interface FaqItemProps {
  langCode: string;
  index: number;
  faq: { question: string; answer: string };
  form: any;
  onConfirmDelete: (langCode: string, index: number) => void;
}

export const FaqItem = memo(({ langCode, index, faq, form, onConfirmDelete }: FaqItemProps) => {
  return (
    <AccordionItem value={`faq-${index}`}>
      <AccordionTrigger>FAQ {index + 1}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`${langCode}.faqs[${index}].question`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Input placeholder="Enter FAQ question" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${langCode}.faqs[${index}].answer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Answer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter FAQ answer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onConfirmDelete(langCode, index)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete FAQ
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

FaqItem.displayName = "FaqItem";