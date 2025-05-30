import { Language } from "@/src/api/types/hooks/language.types";
import { z } from "zod";

const createLanguageSchema = <T>(
  languageIds: string[],
  activeLanguages: Language[],
  schemaDefinitionFn: (z: any, isRequired?: boolean) => T
) => {
  const schemaShape: Record<string, any> = {};
  const firstLangCode = activeLanguages[0]?.languageID || "en";

  // Create language mapping
  const languageCodeMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
    acc[lang._id] = lang.languageID;
    return acc;
  }, {});

  // Apply the schema definition to each language
  languageIds.forEach((langId) => {
    const langCode = languageCodeMap[langId] || langId;
    // Apply required schema for the first language, optional for others
    schemaShape[langCode] = schemaDefinitionFn(z, langCode === firstLangCode);
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
    
      clientComments: (z: any) => z.array(
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
            description: z.string().min(1, { message: "Description text is required" }),
            location: z.string().min(1, { message: "Location is required" }), // Add location
            phoneText: z.string().optional(), // Make optional since collapsible
            phoneTextValue: z.string().optional(), // Make optional since collapsible
            email: z.string().optional(), // Make optional since collapsible
            emailValue: z.string().optional(), // Make optional since collapsible
            office: z.string().optional(), // Make optional since collapsible
            officeValue: z.string().optional(), // Make optional since collapsible
          }),
    ContactInSendMessage: (z: any) => z.object({
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
                title: z.string().min(1, "Title is required"), // Changed from description to title
                socialLinks: z
                    .array(
                        z.object({
                            id: z.string().optional(),
                            image: z.string().optional(), // Made optional since images might not be uploaded initially
                            url: z.string().url("Invalid URL").min(1, "Social link URL is required"),
                            linkName: z.string().min(1, "Link name is required"), // Added linkName field
                        })
                    )
                    .optional()
                    .default([]),
            })
        ).min(1, { message: "At least one footer is required" }),
    ChooseUs: (z: any) => z.object({
      title: z.string().min(1, { message: "Title is required" }),
      description: z.string().min(1, { message: "Description is required" }),
    }),

    galleryImage: (z: any) => z.object({
      Logo: z.string().min(1, { message: "Logo is required" }),
    }),

   blog: (z: any, isRequired: boolean = true) =>
    z.object({
      title: isRequired
        ? z.string().min(1, { message: "Title is required" })
        : z.string().optional(),
      description: isRequired
        ? z.string().min(1, { message: "Description is required" })
        : z.string().optional(),
      content: isRequired
        ? z.string().min(1, { message: "content is required" })
        : z.string().optional(),
      category: isRequired
        ? z.string().min(1, { message: "Category is required" })
        : z.string().optional(),
      date: z
        .string()
        .refine(
          (value: string | number | Date) => value === "" || !isNaN(new Date(value).getTime()),
          { message: "Invalid date format" }
        )
        .optional(),
      backLinkText: isRequired
        ? z.string().min(1, { message: "Back link text is required" })
        : z.string().optional(),
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
    return   createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.ContactInformationInfo);
     
};

export const createContactSendMessageSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schema = createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.ContactInSendMessage);
    return z.object({
      ...schema.shape,
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


export const createClientCommentsUsSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.clientComments);
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

export const createBlogSchema = (languageIds: string[], activeLanguages: Language[]) =>
  z.object({
    ...createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.blog).shape,
    backgroundImage: z.string().optional(),
  });

export const createHeroSectionSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.heroSection);
};
export const createFooterSectionSchema = (languageIds: string[], activeLanguages: Language[]) => {
    return createLanguageSchema(languageIds, activeLanguages, schemaDefinitions.footerSection);
};
export const createFooterSpecialLinkSectionSchema = (languageIds: string[], activeLanguages: Language[]) => {
    const schemaShape: Record<string, any> = {};
    const languageCodeMap = activeLanguages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang._id] = lang.languageID;
        return acc;
    }, {});

    languageIds.forEach((langId, index) => {
        const langCode = languageCodeMap[langId] || langId;
        const isFirstLanguage = index === 0;
        
        if (isFirstLanguage) {
            // First language has strict validation
            schemaShape[langCode] = z.array(
                z.object({
                    id: z.string().optional(),
                    title: z.string().min(1, "Title is required"),
                    socialLinks: z
                        .array(
                            z.object({
                                id: z.string().optional(),
                                image: z.string().optional(),
                                url: z.string().min(1, "Social link URL is required"),
                                linkName: z.string().min(1, "Link name is required"),
                            })
                        )
                        .optional()
                        .default([]),
                })
            ).min(1, { message: "At least one footer is required" });
        } else {
            // Other languages are more flexible - allow empty social links during sync
            schemaShape[langCode] = z.array(
                z.object({
                    id: z.string().optional(),
                    title: z.string().min(1, "Title is required"),
                    socialLinks: z
                        .array(
                            z.object({
                                id: z.string().optional(),
                                image: z.string().optional(),
                                url: z.string().optional().default(""), // Allow empty during sync
                                linkName: z.string().optional().default(""), // Allow empty during sync
                            })
                        )
                        .optional()
                        .default([]),
                })
            ).min(1, { message: "At least one footer is required" });
        }
    });

    return z.object(schemaShape);
};

// Usage remains the same
// const formSchema = createHeroSchema(languageIds, activeLanguages);