import { memo } from "react";
import { Accordion } from "@/src/components/ui/accordion"
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { FaqItem } from "./FaqItem";
import { Plus } from "lucide-react";

// Interface for LanguageCard props
interface LanguageCardProps {
  langId: string;
  langCode: string;
  form: any;
  onAddFaq: (langCode: string) => void;
  onConfirmDelete: (langCode: string, index: number) => void;
}

// Memoized LanguageCard component to prevent unnecessary re-renders
export const LanguageCard = memo(({ 
  langId, 
  langCode, 
  form, 
  onAddFaq, 
  onConfirmDelete 
}: LanguageCardProps) => {
  const faqs = form.watch(langCode) || [];
  
  const handleAddFaq = () => onAddFaq(langCode);
  
  return (
    <Card key={langId} className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
            {langCode}
          </span>
          FAQ Section
        </CardTitle>
        <CardDescription>
          Manage FAQ content for {langCode.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq: { question: string; answer: string; }, index: number) => (
            <FaqItem
              key={`${langCode}-faq-${index}`}
              langCode={langCode}
              index={index}
              faq={faq}
              form={form}
              onConfirmDelete={onConfirmDelete}
            />
          ))}
        </Accordion>

        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={handleAddFaq}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </CardContent>
    </Card>
  );
});

LanguageCard.displayName = "LanguageCard";
