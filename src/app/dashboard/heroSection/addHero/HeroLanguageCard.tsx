"use client";
import { memo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/components/ui/button";
import { HeroCard } from "./HeroCard";
import { useLanguage } from "@/src/context/LanguageContext";

interface LanguageTabsProps {
  languageCards: Array<{
    langCode: string;
    isFirstLanguage: boolean;
    form: any;
    addHero: (langCode: string) => void;
    removeHero: (langCode: string, index: number) => void;
    onDeleteStep: (langCode: string, index: number) => void;
    HeroImageUploader: React.ComponentType<any>;
  }>;
}

export const LanguageTabs = memo(({ languageCards }: LanguageTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const { language } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="w-full dark:bg-slate-900">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-0">
          {languageCards.map((card, index) => (
            <button
              key={card.langCode}
              onClick={() => setActiveTab(index)}
              className={`relative px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 dark:bg-slate-900" ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600 dark:bg-slate-900"'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="uppercase font-bold text-xs px-2 py-1 rounded dark:text-white">
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
      <div className="min-h-[400px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {languageCards.map((card, index) => {
          const heroes = card.form.watch(card.langCode) || [];
          
          return (
            <div
              key={card.langCode}
              className={`${activeTab === index ? 'block' : 'hidden'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold ml-4 mr-4">
                    {t("HeroLanguageCard.heroSection")}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1 ml-4 mr-4">
                    {t("HeroLanguageCard.manageContentPrefix")} {card.langCode.toUpperCase()}
                    {card.isFirstLanguage && ` ${t("HeroLanguageCard.urlSettingsNote")}`}
                  </p>
                </div>
                <Button
                  onClick={() => card.addHero(card.langCode)}
                  className="flex items-center ml-4 mr-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("HeroLanguageCard.addHeroButton")}
                </Button>
              </div>

              {/* Heroes Content */}
              <div className="space-y-4">
                
                {heroes.length === 0 ? (
                  <div className="text-center  py-12 border-2 border-dashed border-gray-300 rounded-lg ">
                    <p className="text-gray-500 mb-4">No heroes yet</p>
                    <Button
                    className="mr-2 ml-2"
                      variant="outline"
                      onClick={() => card.addHero(card.langCode)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("HeroLanguageCard.addHeroButton")}
                    </Button>
                  </div>
                ) : (
                  heroes.map((_: any, heroIndex: number) => (
                    <div key={`${card.langCode}-hero-${heroIndex}`} className=" border  rounded-lg p-4">
                      <HeroCard
                        langCode={card.langCode}
                        index={heroIndex}
                        form={card.form}
                        onDelete={(langCodeParam, index) => card.onDeleteStep(langCodeParam, index)}
                        isFirstLanguage={card.isFirstLanguage}
                        HeroImageUploader={card.HeroImageUploader}
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

// Keep original LanguageCard for compatibility if needed
export const LanguageCard = memo(() => {
  return null; // This is now replaced by LanguageTabs
});

LanguageTabs.displayName = "LanguageTabs";
LanguageCard.displayName = "LanguageCard";