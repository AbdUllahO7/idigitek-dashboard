// src/hooks/service/team-navigation-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for team navigation section
export const teamNavigationTranslations = {
  en: {
    sectionName: "Navigation",
    sectionDescription: "{t('Navigation.NavigationConfiguration')} for team section",
    navigationName: "Navigation Name",
    navigationUrl: "Navigation URL",
    navigationDescription: "Navigation Description",
    type: "TeamNavigation",
    nameElement: "Name",
    urlElement: "URL",
    descriptionElement: "Description",
    urlPlaceholder: "/team or https://example.com/team",
    urlDescription: "Enter the URL for this navigation item. Can be relative (/team) or absolute (https://example.com/team)"
  },
  ar: {
    sectionName: "Navigation",
    sectionDescription: "إعداد التنقل لقسم الفريق",
    navigationName: "اسم التنقل",
    navigationUrl: "رابط التنقل",
    navigationDescription: "وصف التنقل",
    type: "تنقل الفريق",
    nameElement: "الاسم",
    urlElement: "الرابط",
    descriptionElement: "الوصف",
    urlPlaceholder: "/team أو https://example.com/team",
    urlDescription: "أدخل الرابط لعنصر التنقل هذا. يمكن أن يكون نسبياً (/team) أو مطلقاً (https://example.com/team)"
  },
  tr: {
    sectionName: "Navigation",
    sectionDescription: "Takım bölümü için navigasyon yapılandırması",
    navigationName: "Navigasyon Adı",
    navigationUrl: "Navigasyon URL'si",
    navigationDescription: "Navigasyon Açıklaması",
    type: "Takım Navigasyonu",
    nameElement: "Ad",
    urlElement: "URL",
    descriptionElement: "Açıklama",
    urlPlaceholder: "/team veya https://example.com/team",
    urlDescription: "Bu navigasyon öğesi için URL'yi girin. Göreceli (/team) veya mutlak (https://example.com/team) olabilir"
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
        // Define fields with translated labels
        fields: [
        { 
            id: "name", 
            label: translations.navigationName, 
            type: "text", 
            required: true 
        },
     
        ] as FieldConfig[],
        // Define element mapping with translated values
        elementsMapping: {
        "name": translations.nameElement,
        }
    };
};

// Default export
export const teamNavigationSectionConfig = getTeamNavigationSectionConfig();