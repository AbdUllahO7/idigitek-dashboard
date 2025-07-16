"use client";

import { memo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { FooterCard } from "./FooterCard";
import { useTranslation } from "react-i18next";

interface LanguageCardProps {
  langCode: string;
  isFirstLanguage: boolean;
  form: any;
  addFooter: (langCode: string) => void;
  removeFooter: (langCode: string, index: number) => void;
  onDeleteStep: (langCode: string, index: number) => void;
  FooterImageUploader: React.ComponentType<any>;
  SocialLinkImageUploader?: React.ComponentType<any>;
}

interface LanguageTabsProps {
  languageCards: Array<{
    langCode: string;
    isFirstLanguage: boolean;
    form: any;
    addFooter: (langCode: string) => void;
    removeFooter: (langCode: string, index: number) => void;
    onDeleteStep: (langCode: string, index: number) => void;
    FooterImageUploader: React.ComponentType<any>;
    SocialLinkImageUploader?: React.ComponentType<any>;
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
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {languageCards.map((card, index) => {
          const footer = card.form.watch(card.langCode) || [];
          
          return (
            <div
              key={card.langCode}
              className={`${activeTab === index ? 'block' : 'hidden'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {t("specialLinks.languageCard.title")}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {t("specialLinks.languageCard.description", { langCode: card.langCode.toUpperCase() })}
                  </p>
                </div>
                {card.isFirstLanguage && (
                  <Button
                    onClick={() => card.addFooter(card.langCode)}
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("specialLinks.languageCard.buttons.addFooter")}
                  </Button>
                )}
              </div>

              {/* Footer Content */}
              <div className="space-y-4">
                {footer.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">No footer sections yet</p>
                    {card.isFirstLanguage && (
                      <Button
                        variant="outline"
                        onClick={() => card.addFooter(card.langCode)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t("specialLinks.languageCard.buttons.addFooter")}
                      </Button>
                    )}
                  </div>
                ) : (
                  footer.map((_: any, footerIndex: number) => (
                    <div key={`${card.langCode}-footer-${footerIndex}`} className=" rounded-lg p-4">
                      <FooterCard
                        langCode={card.langCode}
                        index={footerIndex}
                        form={card.form}
                        isFirstLanguage={card.isFirstLanguage}
                        onDelete={(langCodeParam, index) => card.onDeleteStep(langCodeParam, index)}
                        FooterImageUploader={card.FooterImageUploader}
                        SocialLinkImageUploader={card.SocialLinkImageUploader}
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

// Keep original FooterLanguageCard for compatibility
export const FooterLanguageCard = memo(({
  langCode,
  isFirstLanguage,
  form,
  addFooter,
  onDeleteStep,
  FooterImageUploader,
  SocialLinkImageUploader,
}: LanguageCardProps) => {
  const { t } = useTranslation();
  const footer = form.watch(langCode) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-3 py-1.5 mr-3">
            {langCode}
          </span>
          <div>
            <h3 className="text-lg font-semibold">{t("specialLinks.languageCard.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("specialLinks.languageCard.description", { langCode: langCode.toUpperCase() })}
            </p>
          </div>
        </div>
        {isFirstLanguage && (
          <Button
            type="button"
            onClick={() => addFooter(langCode)}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("specialLinks.languageCard.buttons.addFooter")}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {footer.map((_: any, index: number) => (
          <FooterCard
            key={`${langCode}-footer-${index}`}
            langCode={langCode}
            index={index}
            form={form}
            isFirstLanguage={isFirstLanguage}
            onDelete={(langCodeParam, index) => onDeleteStep(langCodeParam, index)}
            FooterImageUploader={FooterImageUploader}
            SocialLinkImageUploader={SocialLinkImageUploader}
          />
        ))}
      </div>
    </div>
  );
});

LanguageTabs.displayName = "LanguageTabs";
FooterLanguageCard.displayName = "FooterLanguageCard";