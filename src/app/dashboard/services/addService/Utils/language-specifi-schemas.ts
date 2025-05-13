import { Language } from "@/src/api/types/hooks/language.types";
import { z } from "zod";

const createLanguageSchema = <T>(
    languageIds: string[], 
    activeLanguages: Language[], 
    schemaDefinitionFn: (z: any) => T
  ) => {
    const schemaShape: Record<string, any> = {};
    
    // Create language mapping (same in all functions)
    const languageCodeMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
      acc[lang._id] = lang.languageID;
      return acc;
    }, {});
    
    // Apply the schema definition to each language
    languageIds.forEach((langId) => {
      const langCode = languageCodeMap[langId] || langId;
      schemaShape[langCode] = schemaDefinitionFn(z);
    });
    
    return z.object(schemaShape);
};
  
const schemaDefinitions = {
    hero: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
      backLinkText: z.string().min(1, { message: "Back link text is required" }),
    }),

      industry: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
    }),
    
    processStep: (z: any) => z.array(
      z.object({
        icon: z.string().min(1, { message: "Icon is required" }),
        title: z.string().min(1, { message: "Title is required" }),
        description: z.string().min(1, { message: "Description is required" }),
      })
    ).min(1, { message: "At least one process step is required" }),
    
    benefit: (z: any) => z.array(
      z.object({
        icon: z.string().min(1, { message: "Icon is required" }),
        title: z.string().min(1, { message: "Title is required" }),
        description: z.string().min(1, { message: "Description is required" }),
      })
    ).min(1, { message: "At least one benefit is required" }),
    
    faq: (z: any) => z.array(
      z.object({
        question: z.string().min(1, { message: "Question is required" }),
        answer: z.string().min(1, { message: "Answer is required" }),
      })
    ).min(1, { message: "At least one FAQ is required" }),
    
    feature: (z: any) => z.array(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
        title: z.string().min(1, { message: "Title is required" }),
        content: z.object({
          heading: z.string().min(1, { message: "Heading is required" }),
          description: z.string().min(1, { message: "Description is required" }),
          features: z.array(
            z.string().min(1, { message: "Feature cannot be empty" })
          ).min(1, { message: "At least one feature is required" }),
          image: z.string().min(1, { message: "Image is required" }),
        }),
      })
    ).min(1, { message: "At least one feature is required" }),
};

export const createHeroSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.hero);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};

export const createIndustrySchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.industry);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};

export const createProcessStepsSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.processStep);
};
  
export const createBenefitsSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.benefit);
};
  
export const createFaqSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.faq);
};
  
export const createFeaturesSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.feature);
};




// Usage remains the same
// const formSchema = createHeroSchema(languageIds, activeLanguages);