import { memo, useState } from "react"
import { Accordion } from "@/src/components/ui/accordion"
import { Button } from "@/src/components/ui/button"
import { FaqItem } from "./FaqItem"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

// Interface for LanguageCard props
interface LanguageCardProps {
  langId: string
  langCode: string
  form: any
  onAddFaq: (langCode: string) => void
  onConfirmDelete: (langCode: string, index: number) => void
}

interface LanguageTabsProps {
  languageCards: Array<{
    langId: string
    langCode: string
    form: any
    onAddFaq: (langCode: string) => void
    onConfirmDelete: (langCode: string, index: number) => void
  }>
}

export const LanguageTabs = memo(({ languageCards }: LanguageTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-0">
          {languageCards.map((card, index) => (
            <button
              key={card.langCode}
              onClick={() => setActiveTab(index)}
              className={`relative px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === index
                    ? 'border-blue-500 text-blue-600 dark:bg-slate-900"'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="uppercase font-bold text-xs px-2 py-1 rounded ">
                  {card.langCode}
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {languageCards.map((card, index) => {
          const faqs = card.form.watch(card.langCode) || [];
          
          return (
            <div
              key={card.langCode}
              className={`${activeTab === index ? 'block' : 'hidden'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {t('faqLanguageCard.title')}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {t('faqLanguageCard.description', { language: card.langCode.toUpperCase() })}
                  </p>
                </div>
                <Button
                  onClick={() => card.onAddFaq(card.langCode)}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('faqLanguageCard.addFaqButton')}
                </Button>
              </div>

              {/* FAQs Content */}
              <div className="space-y-4">
                {faqs.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">No FAQs yet</p>
                    <Button
                      variant="outline"
                      onClick={() => card.onAddFaq(card.langCode)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('faqLanguageCard.addFaqButton')}
                    </Button>
                  </div>
                ) : (
                  <div className=" rounded-lg p-4">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq: { question: string; answer: string }, faqIndex: number) => (
                        <FaqItem
                          key={`${card.langCode}-faq-${faqIndex}`}
                          langCode={card.langCode}
                          index={faqIndex}
                          faq={faq}
                          form={card.form}
                          onConfirmDelete={card.onConfirmDelete}
                          isFirstLanguage={card.langCode === 'en'} // Assuming English is the first language
                        />
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Keep original LanguageCard for compatibility
export const LanguageCard = memo(({ 
  langId, 
  langCode, 
  form, 
  onAddFaq, 
  onConfirmDelete 
}: LanguageCardProps) => {
  const { t } = useTranslation()
  const faqs = form.watch(langCode) || []
  
  const handleAddFaq = () => onAddFaq(langCode)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-3 py-1.5 mr-3">
            {langCode}
          </span>
          <div>
            <h3 className="text-lg font-semibold">{t('faqLanguageCard.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('faqLanguageCard.description', { language: langCode.toUpperCase() })}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddFaq}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('faqLanguageCard.addFaqButton')}
        </Button>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq: { question: string; answer: string }, index: number) => (
            <FaqItem
              key={`${langCode}-faq-${index}`}
              langCode={langCode}
              index={index}
              faq={faq}
              form={form}
              onConfirmDelete={onConfirmDelete}
              isFirstLanguage={langCode === 'en'} // Assuming English is the first language
            />
          ))}
        </Accordion>
      </div>
    </div>
  )
})

LanguageTabs.displayName = "LanguageTabs";
LanguageCard.displayName = "LanguageCard";