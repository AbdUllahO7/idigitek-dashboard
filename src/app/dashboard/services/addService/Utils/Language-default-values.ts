import { Language } from "@/src/api/types/hooks/language.types";

export const createLanguageCodeMap = (activeLanguages: Language[]): Record<string, string> => {
    return activeLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang._id] = lang.languageID;
        return acc;
    }, {});
};

const forEachLanguage = <T>(
    languageIds: string[],
    activeLanguages: Language[],
    callback: (langCode: string) => T
  ): Record<string, T> => {
    const result: Record<string, T> = {};
    const languageCodeMap = createLanguageCodeMap(activeLanguages);
    
    languageIds.forEach((langId) => {
      const langCode = languageCodeMap[langId] || langId;
      result[langCode] = callback(langCode);
    });
    
    return result;
    
};
// Simplified default values creation functions
const defaultValueDefinitions = {
    hero: () => ({
      title: "",
      description: "",
      backLinkText: "",
    }),
    
    processStep: () => [{
      icon: "Clock",
      title: "",
      description: "",
    }],
    
    benefit: () => [{
      icon: "Car",
      title: "",
      description: "",
    }],
    
    faq: () => [{
      question: "",
      answer: "",
    }],
    
    feature: () => [{
      id: "feature-1",
      title: "",
      content: {
        heading: "",
        description: "",
        features: [""],
        image: "",
      },
    }],
};

const createLanguageDefaultValues = <T>(
    languageIds: string[],
    activeLanguages: Language[],
    defaultValueFn: () => T,
    extraFields: Record<string, any> = {}
  ) => {
    const defaultValues: Record<string, any> = { ...extraFields };
    
    const languageValues = forEachLanguage(
      languageIds,
      activeLanguages,
      () => defaultValueFn()
    );
    
    return { ...defaultValues, ...languageValues };
};

export const createHeroDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(
      languageIds,
      activeLanguages,
      defaultValueDefinitions.hero,
      { backgroundImage: "" }
    );
};

export const createProcessStepsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.processStep);
};

export const createBenefitsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.benefit);
};

export  const createFaqDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.faq);
};

export const createFeaturesDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.feature);
};



// ex : 
// const defaultValues = createHeroDefaultValues(languageIds, activeLanguages)