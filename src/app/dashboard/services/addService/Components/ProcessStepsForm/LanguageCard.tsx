import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { memo, useState } from "react";
import { StepCard } from "./StepCard";
import { getAvailableIcons } from "../../Utils/Expose-form-data";
import { useTranslation } from "react-i18next";

interface LanguageCardProps {
  langId: string;
  langCode: string;
  isFirstLanguage: boolean;
  defaultLangCode: string;
  form: any;
  onAddStep: () => void;
  onDeleteStep: ( langCode : any, index: number) => void;
}

interface LanguageTabsProps {
  languageCards: Array<{
    langId: string;
    langCode: string;
    isFirstLanguage: boolean;
    defaultLangCode: string;
    form: any;
    onAddStep: () => void;
    onDeleteStep: ( langCode : any, index: number) => void;
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
          const formValues = card.form.watch(card.langCode) || [];
          
          return (
            <div
              key={card.langCode}
              className={`${activeTab === index ? 'block' : 'hidden'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {t("processStepsForm.languageCard.title")}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {t("processStepsForm.languageCard.description", { language: card.langCode.toUpperCase() })}
                  </p>
                  {card.isFirstLanguage && (
                    <div className="mt-2">
                      <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {t("processStepsForm.stepForm.badges.iconControl")}
                      </span>
                      <p className="text-xs text-blue-600 mt-1">
                        {t("processStepsForm.languageCard.iconControlDesc")}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => card.onAddStep()}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("processStepsForm.stepForm.buttons.addStep")}
                </Button>
              </div>

              {/* Steps Content */}
              <div className="space-y-4">
                {formValues.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">No process steps yet</p>
                    <Button
                      variant="outline"
                      onClick={() => card.onAddStep()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("processStepsForm.stepForm.buttons.addStep")}
                    </Button>
                  </div>
                ) : (
                  formValues.map((_: any, stepIndex: any) => (
                    <div key={`${card.langCode}-step-${stepIndex}`} className=" rounded-lg p-4 ">
                      <StepCard
                        index={stepIndex}
                        langCode={card.langCode}
                        isFirstLanguage={card.isFirstLanguage}
                        defaultLangCode={card.defaultLangCode}
                        form={card.form}
                        onDelete={(langCode, index) => card.onDeleteStep(langCode, index)}
                        availableIcons={[...getAvailableIcons()]}
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

// Keep original LanguageCard for compatibility
export const LanguageCard = memo(({ 
  langId, 
  langCode, 
  isFirstLanguage, 
  defaultLangCode, 
  form, 
  onAddStep, 
  onDeleteStep 
}: LanguageCardProps) => {
  const { t } = useTranslation();
  const formValues = form.watch(langCode) || [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-3 py-1.5 mr-3">
            {langCode}
          </span>
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              {t("processStepsForm.languageCard.title")}
              {isFirstLanguage && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {t("processStepsForm.stepForm.badges.iconControl")}
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("processStepsForm.languageCard.description", { language: langCode.toUpperCase() })}
            </p>
            {isFirstLanguage && (
              <p className="text-xs text-blue-600 mt-1">
                {t("processStepsForm.languageCard.iconControlDesc")}
              </p>
            )}
          </div>
        </div>
        <Button
          type="button"
          onClick={onAddStep}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("processStepsForm.stepForm.buttons.addStep")}
        </Button>
      </div>

      <div className="space-y-4">
        {formValues.map((_: any, index: any) => (
          <StepCard
            key={`${langCode}-step-${index}`}
            index={index}
            langCode={langCode}
            isFirstLanguage={isFirstLanguage}
            defaultLangCode={defaultLangCode}
            form={form}
            onDelete={(langCode, index) => onDeleteStep(langCode, index)}
            availableIcons={[...getAvailableIcons()]}
          />
        ))}
      </div>
    </div>
  );
});

LanguageTabs.displayName = "LanguageTabs";
LanguageCard.displayName = "LanguageCard";