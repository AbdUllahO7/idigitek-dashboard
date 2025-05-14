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
    process: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
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

    chooseUs: (z: any) => z.array(
      z.object({
        icon: z.string().min(1, { message: "Icon is required" }),
        title: z.string().min(1, { message: "Title is required" }),
        description: z.string().min(1, { message: "Description is required" }),
      })
    ).min(1, { message: "At least one benefit is required" }),
    
    projectBasicInfo: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
      category: z.string().min(1, { message: "Category is required" }),
      date: z.date().optional(),
      backLinkText: z.string().min(1, { message: "Button text is required" }),
      
      // Optional fields
      client: z.string().optional(),
      industry: z.string().optional(),
      year: z.string().optional(),
      technologies: z.string().optional(),
    }),

    projectMoreInfo: (z: any) => z.object({
      client: z.string().min(1, { message: "client is required" }),
      industry: z.string().min(1, { message: "Industry is required" }),
      year: z.string().min(1, { message: "Year is required" }),
      technologies: z.string().min(1, { message: "Technologies  is required" }),
    }),
    projectImageForm: (z: any) => z.object({
      client: z.string().min(1, { message: "client is required" }),
      industry: z.string().min(1, { message: "Industry is required" }),
      year: z.string().min(1, { message: "Year is required" }),
      technologies: z.string().min(1, { message: "Technologies  is required" }),
    }),
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

    ChooseUs: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
    }),
      galleryImage: (z: any) => z.object({
      Logo: z.string().min(1, { message: "Logo is required" }),
    }),
};

export const createHeroSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.hero);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};
export const createProcessSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.process);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};
export const createProjectBasicInfoSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.projectBasicInfo);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};
export const createProjectMoreInfoInfoSchema = (languageIds: string[], activeLanguages: any[]) => {
  const languageSchemas: Record<string, z.ZodObject<any>> = {};

  languageIds.forEach((langId) => {
    languageSchemas[langId] = z.object({
      clientName: z.string().optional(), // Allow empty or undefined
      client: z.string().optional(),
      industryName: z.string().optional(),
      industry: z.string().optional(),
      yearName: z.string().optional(),
      year: z.string().optional(),
      technologiesName: z.string().optional(),
      technologies: z.string().optional(),
    });
  });

  return z.object(languageSchemas);
};



export const createIndustrySchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.industry);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};

export const createSectionsSchema = (languageIds: string[], activeLanguages: Language[]) => {
  return z.object({
    logo: z.string().optional(),
    ...Object.fromEntries(
      languageIds.map((langId) => {
        const langCode = activeLanguages.find((lang) => lang._id === langId)?.languageID || langId;
        return [
          langCode,
          z.array(
            z.object({
              navItemImage: z.string().optional(),
            })
          ),
        ];
      })
    ),
  });
};

export const createProcessStepsSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.processStep);
};
  
export const createBenefitsSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.benefit);
};
  
export const createChooseUsSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.chooseUs);
};
  
export const createFaqSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.faq);
};
  
export const createFeaturesSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.feature);
};

export const createImageGallerySchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.galleryImage);
};


// Usage remains the same
// const formSchema = createHeroSchema(languageIds, activeLanguages);