
import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for team navigation section
export const teamNavigationTranslations = {
  en: {
    sectionName: "Team Navigation",
    sectionDescription: "Navigation configuration for team section",
    navigationName: "Navigation Name", 
    navigationUrl: "Navigation URL",
    navigationDescription: "Navigation Description",
    type: "TeamNavigation",
    nameElement: "Name",
    urlElement: "URL",
    descriptionElement: "Description",
    urlPlaceholder: "/team or https://example.com/team",
    urlDescription: "Enter the URL for this navigation item. Can be relative (/team) or absolute (https://example.com/team)",
    // Sub-navigation specific
    subNavigationType: "TeamMemberNavigation",
    memberNavigationName: "Team Member Navigation",
    memberNavigationDescription: "Individual team member navigation entry"
  },
  ar: {
    sectionName: "تنقل الفريق",
    sectionDescription: "إعداد التنقل لقسم الفريق",
    navigationName: "اسم التنقل",
    navigationUrl: "رابط التنقل",
    navigationDescription: "وصف التنقل",
    type: "تنقل الفريق",
    nameElement: "الاسم",
    urlElement: "الرابط",
    descriptionElement: "الوصف",
    urlPlaceholder: "/team أو https://example.com/team",
    urlDescription: "أدخل الرابط لعنصر التنقل هذا. يمكن أن يكون نسبياً (/team) أو مطلقاً (https://example.com/team)",
    // Sub-navigation specific
    subNavigationType: "تنقل عضو الفريق",
    memberNavigationName: "تنقل عضو الفريق",
    memberNavigationDescription: "مدخل التنقل الفردي لعضو الفريق"
  },
  tr: {
    sectionName: "Takım Navigasyonu",
    sectionDescription: "Takım bölümü için navigasyon yapılandırması",
    navigationName: "Navigasyon Adı",
    navigationUrl: "Navigasyon URL'si",
    navigationDescription: "Navigasyon Açıklaması",
    type: "Takım Navigasyonu",
    nameElement: "Ad",
    urlElement: "URL",
    descriptionElement: "Açıklama",
    urlPlaceholder: "/team veya https://example.com/team",
    urlDescription: "Bu navigasyon öğesi için URL'yi girin. Göreceli (/team) veya mutlak (https://example.com/team) olabilir",
    // Sub-navigation specific
    subNavigationType: "Takım Üyesi Navigasyonu",
    memberNavigationName: "Takım Üyesi Navigasyonu", 
    memberNavigationDescription: "Bireysel takım üyesi navigasyon girişi"
  }
};

// Function to get translated team navigation section config
export const getTeamNavigationSectionConfig = (language: string = 'en') => {
    const translations = teamNavigationTranslations[language as keyof typeof teamNavigationTranslations] || teamNavigationTranslations.en;
    
    return {
        name: translations.sectionName,
        slug: "Team-navigation",
        subSectionName: translations.sectionName,
        description: translations.sectionDescription,
        isMain: true,
        type: translations.type,
        // Sub-navigation configuration
        subNavigation: {
          type: translations.subNavigationType,
          name: translations.memberNavigationName,
          description: translations.memberNavigationDescription
        },
        // Define fields with translated labels
        fields: [
        { 
            id: "name", 
            label: translations.navigationName, 
            type: "text", 
            required: true 
        },
        { 
            id: "url", 
            label: translations.navigationUrl, 
            type: "text", 
            required: false,
            showOnlyInDefault: true, // Only show in default language
            placeholder: translations.urlPlaceholder,
            description: translations.urlDescription
        },
        ] as FieldConfig[],
        // Define element mapping with translated values
        elementsMapping: {
        "name": translations.nameElement,
        "url": translations.urlElement,
        }
    };
};

// Default export
export const teamNavigationSectionConfig = getTeamNavigationSectionConfig()
