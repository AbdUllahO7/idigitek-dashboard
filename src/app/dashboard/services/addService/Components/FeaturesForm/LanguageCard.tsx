// Language Card Component with i18n Integration

import { Accordion } from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeatureForm } from "./FeatureForm";

interface LanguageCardProps {
  langId: string;
  langCode: string;
  languageIds: string[];
  form: any;
  onRemoveFeature: (langCode: string, index: number) => void;
  onAddFeature: (langCode: string) => void;
  onAddFeatureItem: (langCode: string, featureIndex: number) => void;
  onRemoveFeatureItem: (langCode: string, featureIndex: number, itemIndex: number) => void;
  FeatureImageUploader: React.ComponentType<any>;
}

interface LanguageTabsProps {
  languageCards: Array<{
    langId: string;
    langCode: string;
    languageIds: string[];
    form: any;
    onRemoveFeature: (langCode: string, index: number) => void;
    onAddFeature: (langCode: string) => void;
    onAddFeatureItem: (langCode: string, featureIndex: number) => void;
    onRemoveFeatureItem: (langCode: string, featureIndex: number, itemIndex: number) => void;
    FeatureImageUploader: React.ComponentType<any>;
  }>;
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
                  ? 'border-blue-500 text-blue-600 dark:text-green-700 '
                  : 'border-transparent text-gray-500 dark:text-white hover:text-gray-700'
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
          const features = card.form.watch(`${card.langCode}` as any) || [];
          
          return (
            <div
              key={card.langCode}
              className={`${activeTab === index ? 'block' : 'hidden'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {t('featuresForm.languageCard.title')}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {t('featuresForm.languageCard.description', { language: card.langCode.toUpperCase() })}
                  </p>
                </div>
                <Button
                  onClick={() => card.onAddFeature(card.langCode)}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('featuresForm.languageCard.addFeature')}
                </Button>
              </div>

              {/* Features Content */}
              <div className="space-y-4">
                {features.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">No features yet</p>
                    <Button
                      variant="outline"
                      onClick={() => card.onAddFeature(card.langCode)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('featuresForm.languageCard.addFeature')}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg p-4">
                    <Accordion type="single" collapsible className="w-full">
                      {features.map((feature: { title: string; content: { heading: string; description: string; features: any[] } }, featureIndex: number) => (
                        <FeatureForm
                          key={`${card.langCode}-feature-${featureIndex}`}
                          index={featureIndex}
                          feature={feature}
                          langCode={card.langCode}
                          langId={card.langId}
                          languageIds={card.languageIds}
                          form={card.form}
                          onRemoveFeature={card.onRemoveFeature}
                          onAddFeatureItem={card.onAddFeatureItem}
                          onRemoveFeatureItem={card.onRemoveFeatureItem}
                          FeatureImageUploader={card.FeatureImageUploader}
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
const LanguageCard = memo(({
  langId,
  langCode,
  languageIds,
  form,
  onRemoveFeature,
  onAddFeature,
  onAddFeatureItem,
  onRemoveFeatureItem,
  FeatureImageUploader
}: LanguageCardProps) => {
  const { t } = useTranslation();
  const features = form.watch(`${langCode}` as any) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-3 py-1.5 mr-3">
            {langCode}
          </span>
          <div>
            <h3 className="text-lg font-semibold">{t('featuresForm.languageCard.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('featuresForm.languageCard.description', { language: langCode.toUpperCase() })}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => onAddFeature(langCode)}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('featuresForm.languageCard.addFeature')}
        </Button>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {features.map((feature: { title: string; content: { heading: string; description: string; features: any[] } }, index: number) => (
            <FeatureForm
              key={`${langCode}-feature-${index}`}
              index={index}
              feature={feature}
              langCode={langCode}
              langId={langId}
              languageIds={languageIds}
              form={form}
              onRemoveFeature={onRemoveFeature}
              onAddFeatureItem={onAddFeatureItem}
              onRemoveFeatureItem={onRemoveFeatureItem}
              FeatureImageUploader={FeatureImageUploader}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
});

LanguageTabs.displayName = "LanguageTabs";
LanguageCard.displayName = "LanguageCard";

export default LanguageCard;