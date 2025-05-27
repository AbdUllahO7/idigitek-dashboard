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
    team: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      job: z.string().min(1, { message: "Job is required" }),
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

    faqQuestions: (z: any) => z.array(
      z.object({
        icon: z.string().min(1, { message: "Icon is required" }),
        title: z.string().min(1, { message: "Title is required" }),
        description: z.string().min(1, { message: "Description is required" }),
        buttonText: z.string().min(1, { message: "Button Text is required" }),

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
      date: z.any().optional(),
      backLinkText: z.string().min(1, { message: "Button text is required" }),
      
      // Optional fields
      client: z.string().optional(),
      industry: z.string().optional(),
      year: z.string().optional(),
      technologies: z.string().optional(),
    }),
    ContactInformationInfo: (z: any) => z.object({
        title: z.string().min(1, { message: "Title is required" }),
    fullname: z.string().min(1, { message: "Full name text is required" }),
    fullnamePlaceHolder: z.string().optional(),
    email: z.string().min(1, { message: "Email text is required" }),
    emailPlaceHolder: z.string().optional(),
    message: z.string().min(1, { message: "Message text is required" }),
    messagePlaceHolder: z.string().optional(),
    subjects: z
      .array(z.string().min(1, { message: "Subject cannot be empty" }))
      .min(1, { message: "At least one subject is required" }),
    buttonText: z.string().min(1, { message: "Button text is required" }),

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
    
    heroSection: (z: any) => z.array(
        z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        exploreButton: z.string().min(1, "Explore Button text is required"),
        requestButton: z.string().min(1, "Request Button text is required"),
        image : z.string().min(1, "Request Button text is required"),
      })
    ).min(1, { message: "At least one feature is required" }),
    footerSection: (z: any) =>
          z.array(

            z.object({
              id: z.string().optional(),
              description: z.string().min(1, "Description is required"),
              socialLinks: z
                .array(
                  z.object({
                    id: z.string().optional(),
                    image: z.string().min(1, "Social link image is required"),
                    url: z.string().url("Invalid URL").min(1, "Social link URL is required"),
                  })
                )
                .optional()
                .default([]),
            })
    ).min(1, { message: "At least one hero is required" }),
      specialLink: (z: any) =>
           z.array(
                  z.object({
                    id: z.string().optional(),
                    image: z.string().min(1, "Social link image is required"),
                    url: z.string().url("Invalid URL").min(1, "Social link URL is required"),
                  })
                )
                .optional()
                .default([]),
  
    ChooseUs: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
    }),

    galleryImage: (z: any) => z.object({
      Logo: z.string().min(1, { message: "Logo is required" }),
    }),

    blog: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
      newsContent: z.string().min(1, { message: "Content is required" }),
      category : z.string().min(1, { message: "category is required" }),
      date: z.date().optional(),
      backLinkText: z.string().min(1, { message: "Back link text is required" }),
    }),
};

export const createHeroSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.hero);
    return z.object({
      ...schema.shape,
    });
};
export const createProcessSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.process);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};
export const createTeamSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.team);
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

export const createContactInformationInfoSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.ContactInformationInfo);
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


export const createHaveFaqQuestionsSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.faqQuestions);
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

export const createBlogSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.blog);
    return z.object({
      ...schema.shape,
      backgroundImage: z.string().optional(),
    });
};

export const createHeroSectionSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.heroSection);
};
export const createFooterSectionSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.footerSection);
};
export const createFooterSpecialLinkSectionSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.specialLink);
};

// Usage remains the same
// const formSchema = createHeroSchema(languageIds, activeLanguages);