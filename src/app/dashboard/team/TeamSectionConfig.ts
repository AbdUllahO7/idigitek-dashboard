import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for team section
export const teamSectionTranslations = {
  en: {
    sectionName: "Team Section Basic",
    sectionDescription: "Team section for managing team member information",
    subSectionName: "Basic",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    teamDetailsLabel: "Section Details",
    type: "Team",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    teamDetailsElement: "TeamDetails"
  },
  ar: {
    sectionName: "Team Section Basic",
    sectionDescription: "قسم الفريق لإدارة معلومات أعضاء الفريق",
    subSectionName: "أساسي",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    teamDetailsLabel: "تفاصيل القسم",
    type: "فريق",
    badgeElement: "شارة",
    titleElement: "عنوان",
    descriptionElement: "وصف",
    teamDetailsElement: "تفاصيل الفريق"
  },
  tr: {
    sectionName: "Takım Bölümü Temel",
    sectionDescription: "Takım üyesi bilgilerini yönetmek için takım bölümü",
    subSectionName: "Temel",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    teamDetailsLabel: "Bölüm Detayları",
    type: "Takım",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    teamDetailsElement: "TakımDetayları"
  }
};

// Function to get translated team section config
export const getTeamSectionConfig = (language: string = 'en') => {
    const translations = teamSectionTranslations[language as keyof typeof teamSectionTranslations] || teamSectionTranslations.en;
    
    return {
        name: translations.sectionName,
        slug: "team-main",
        subSectionName: translations.subSectionName,
        description: translations.sectionDescription,
        isMain: true,
        type: translations.type,
        // Define fields with translated labels
        fields: [
            { 
                id: "sectionBadge", 
                label: translations.sectionBadgeLabel, 
                type: "text", 
                required: true 
            },
            { 
                id: "sectionTitle", 
                label: translations.sectionTitleLabel, 
                type: "text", 
                required: true 
            },
            { 
                id: "sectionDescription", 
                label: translations.sectionDescriptionLabel, 
                type: "textarea", 
                required: false 
            },
        ] as FieldConfig[],
        // Define element mapping with translated values
        elementsMapping: {
            sectionBadge: translations.badgeElement,
            sectionTitle: translations.titleElement, 
            sectionDescription: translations.descriptionElement,
            teamDetails: translations.teamDetailsElement,
        }
    };
};

// Default export for backward compatibility
export const teamSectionConfig = getTeamSectionConfig();