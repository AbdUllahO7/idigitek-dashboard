"use client";

import { memo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { IconNames } from "@/src/utils/MainSectionComponents";
import { ClientCommentsCard } from "./ClientCommentsCard";
import { useTranslation } from "react-i18next";

interface LanguageCardProps {
  langCode: string;
  isFirstLanguage: boolean;
  form: any;
  addBenefit: (langCode: string) => void;
  removeBenefit: (langCode: string, index: number) => void;
  syncIcons: (index: number, iconValue: string) => void;
  availableIcons: readonly IconNames[];
  onDeleteStep: (langCode: any, index: number) => void;
}

interface LanguageTabsProps {
  languageCards: Array<{
    langCode: string;
    isFirstLanguage: boolean;
    form: any;
    addBenefit: (langCode: string) => void;
    removeBenefit: (langCode: string, index: number) => void;
    syncIcons: (index: number, iconValue: string) => void;
    availableIcons: readonly IconNames[];
    onDeleteStep: (langCode: any, index: number) => void;
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
                            ? 'border-blue-500 text-blue-600 dark:bg-slate-900"'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="uppercase font-bold text-xs px-2 py-1 rounded ">
                  {card.langCode}
                </span>
                {card.isFirstLanguage && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {languageCards.map((card, index) => {
          const benefits = card.form.watch(card.langCode) || [];
          
          return (
            <div
              key={card.langCode}
              className={`${activeTab === index ? 'block' : 'hidden'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {t('clientCommentsLanguageCard.title', 'Client Comments Section')}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {t('clientCommentsLanguageCard.description', 'Manage Client Comments content for {{langCode}}', { langCode: card.langCode.toUpperCase() })}
                  </p>
                </div>
                <Button
                  onClick={() => card.addBenefit(card.langCode)}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('clientCommentsLanguageCard.addComment', 'Add Comment')}
                </Button>
              </div>

              {/* Comments Content */}
              <div className="space-y-4">
                {benefits.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">No client comments yet</p>
                    <Button
                      variant="outline"
                      onClick={() => card.addBenefit(card.langCode)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('clientCommentsLanguageCard.addComment', 'Add Comment')}
                    </Button>
                  </div>
                ) : (
                  benefits.map((_: any, commentIndex: number) => (
                    <div key={`${card.langCode}-clientComments-${commentIndex}`} className=" rounded-lg p-4">
                      <ClientCommentsCard
                        langCode={card.langCode}
                        index={commentIndex}
                        form={card.form}
                        isFirstLanguage={card.isFirstLanguage}
                        syncIcons={card.syncIcons}
                        availableIcons={card.availableIcons}
                        onDelete={(langCodeParam, index) => card.onDeleteStep(langCodeParam, index)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Keep original ClientCommentsLanguageCardCard for compatibility
export const ClientCommentsLanguageCardCard = memo(({
  langCode,
  isFirstLanguage,
  form,
  addBenefit,
  syncIcons,
  availableIcons,
  onDeleteStep
}: LanguageCardProps) => {
  const { t } = useTranslation();
  const benefits = form.watch(langCode) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-3 py-1.5 mr-3">
            {langCode}
          </span>
          <div>
            <h3 className="text-lg font-semibold">{t('clientCommentsLanguageCard.title', 'Client Comments Section')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('clientCommentsLanguageCard.description', 'Manage Client Comments content for {{langCode}}', { langCode: langCode.toUpperCase() })}
            </p>
          </div>
          {isFirstLanguage && (
            <span className="ml-3 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Primary
            </span>
          )}
        </div>
        <Button
          type="button"
          onClick={() => addBenefit(langCode)}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('clientCommentsLanguageCard.addComment', 'Add Comment')}
        </Button>
      </div>

      <div className="space-y-4">
        {benefits.map((_: any, index: number) => (
          <ClientCommentsCard
            key={`${langCode}-clientComments-${index}`}
            langCode={langCode}
            index={index}
            form={form}
            isFirstLanguage={isFirstLanguage}
            syncIcons={syncIcons}
            availableIcons={availableIcons}
            onDelete={(langCodeParam, index) => onDeleteStep(langCodeParam, index)}
          />
        ))}
      </div>
    </div>
  );
});

LanguageTabs.displayName = "LanguageTabs";
ClientCommentsLanguageCardCard.displayName = "ClientCommentsLanguageCardCard";