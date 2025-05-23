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
    blog: () => ({
      title: "",
      description: "",
      content : "",
      category : "",
      date : "",
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
      heroSection: () => [{
        title: "",
        description: "",
        exploreButton: "",
        requestButton: "",
        image :""
    }],
      footerSection: () => [
        {
          description: "",
          socialLinks: [],
        },
      ],
     specialLink: () => [
        {
        image: "",
        url: "",
        },
      ],
    faqHaveQuestions: () => [{
      icon: "Car",
      title: "",
      description: "",
      buttonText : "",
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
   footer: () => ({
      icon : "Car",
      title: "",
      description: "",
    }),
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


export const createProjectDefaultValues = (languageIds: string[], activeLanguages: any[]) => {
  const defaultValues: Record<string, any> = {};

  languageIds.forEach((langId) => {
    defaultValues[langId] = {
      clientName: "",
      client: "",
      industryName: "",
      industry: "",
      yearName: "",
      year: "",
      technologiesName: "",
      technologies: "",
    };
  });

  return defaultValues;
};
export const createContactInformationDefaultValues = (languageIds: string[], activeLanguages: any[]) => {
  const defaultValues: Record<string, any> = {};

  languageIds.forEach((langId) => {
    defaultValues[langId] = {
      title: "",
      fullname: "",
      fullnamePlaceHolder: "",
      email: "",
      emailPlaceHolder: "",
      message: "",
      messagePlaceHolder: "",
      subjects: [""],
      buttonText: "",
    };
  });

  return defaultValues;
};

export const createProcessStepsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.processStep);
};

export const createBenefitsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.benefit);
};

export const createHaveFaqQuestionsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.benefit);
};
export const createChooseUsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.benefit);
};

export  const createFaqDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.faq);
};


export const createFeaturesDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.feature);
};


export const createSectionsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
  return {
    logo: "",
    ...Object.fromEntries(
      languageIds.map((langId) => {
        const langCode = activeLanguages.find((lang) => lang._id === langId)?.languageID || langId;
        return [langCode, []];
      })
    ),
  };
};
export const createBlogDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.blog);
};
export const createHeroSectionDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.heroSection);
};
export const createFooterSectionDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.footerSection);
};

export const createFooterSpecialLinkSectionDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.specialLink);
};

// ex : 
// const defaultValues = createHeroDefaultValues(languageIds, activeLanguages)