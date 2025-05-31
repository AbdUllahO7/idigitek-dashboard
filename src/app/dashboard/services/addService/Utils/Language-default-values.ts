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
  callback: (langCode: string, isPrimary: boolean) => T
): Record<string, T> => {
  const result: Record<string, T> = {};
  const languageCodeMap = createLanguageCodeMap(activeLanguages);
  const primaryLangId = languageIds[0] || "en";

  languageIds.forEach((langId) => {
    const langCode = languageCodeMap[langId] || langId;
    result[langCode] = callback(langCode, langId === primaryLangId);
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
      overView: () => ({
      description: "",
    }),
    blog: () => ({
    title: "",
    description: "",
    content: "",
    category: "",
    date: "", // Empty string for all languages
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
        teamSection: () => [{
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
      specialLink: (isPrimary: boolean, primaryValues?: any) => [
         {
        id: "footer-1",
        title: "", // Changed from description to title
        socialLinks: [],
          },
        ],
    faqHaveQuestions: () => [{
      icon: "Car",
      title: "",
      description: "",
      buttonText : "",
    }],
   faq: () => ({
    sectionTitle: "",
    faqs: [{ question: "", answer: "" }],
  }),
      clientComments: () => [{
      icon: "Car",
      title: "",
      description: "",
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
  defaultValueFn: (isPrimary: boolean, primaryValues?: any) => T,
  extraFields: Record<string, any> = {}
) => {
  const defaultValues: Record<string, any> = { ...extraFields };
  let primaryValues: any;

  const languageValues = forEachLanguage(
    languageIds,
    activeLanguages,
    (langCode, isPrimary) => {
      const values = defaultValueFn(isPrimary, primaryValues);
      if (isPrimary) {
        primaryValues = values;
      }
      return values;
    }
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
export const createOverDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(
      languageIds,
      activeLanguages,
      defaultValueDefinitions.hero,
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
export const createContactSendMessageDefaultValues = (languageIds: string[], activeLanguages: any[]) => {
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

export const createClientCommentsDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.clientComments);
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

export const createTeamSectionDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.teamSection);
};


export const createFooterSectionDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.footerSection);
};

export const createFooterSpecialLinkSectionDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {
  return createLanguageDefaultValues(languageIds, activeLanguages, defaultValueDefinitions.specialLink);
};


const contactInformationDefaultDefinition = () => ({
  title: "",
  description: "",
  location: "",
  phoneText: "",
  phoneTextValue: "",
  email: "",
  emailValue: "",
  office: "",
  officeValue: "",
});

export const createContactInformationDefaultValues = (languageIds: string[], activeLanguages: Language[]) => {

  const languageValues = languageIds.reduce<Record<string, any>>((acc, langId) => {
    const langCode = activeLanguages.find((lang) => lang._id === langId)?.languageID || langId;
    acc[langCode] = contactInformationDefaultDefinition();
    return acc;
  }, {});

  return {  ...languageValues };
};

// ex : 
// const defaultValues = createHeroDefaultValues(languageIds, activeLanguages)