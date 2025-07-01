// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for hero section
export const heroSectionTranslations = {
  en: {
    sectionName: "Hero Section Basic",
    sectionDescription: "Hero section for managing service information",
    sectionTitleLabel: "Section Title",
    type: "Hero",
    titleElement: "Title"
  },
  ar: {
    sectionName: "Hero Section Basic",
    sectionDescription: "قسم شريط التنقل لإدارة معلومات الخدمة",
    sectionTitleLabel: "عنوان القسم",
    type: "بطل",
    titleElement: "العنوان"
  },
  tr: {
    sectionName: "Hero Section Basic",
    sectionDescription: "Hizmet bilgilerini yönetmek için ana bölüm",
    sectionTitleLabel: "Bölüm Başlığı",
    type: "Ana",
    titleElement: "Başlık"
  }
};

// Function to get translated hero section config
export const getHeroSectionConfig = (language: string = 'en') => {
  const translations = heroSectionTranslations[language as keyof typeof heroSectionTranslations] || heroSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "Hero-main",
    subSectionName: translations.sectionName,
    description: translations.sectionDescription,
    isMain: true,
    type: translations.type,
    // Define fields with translated labels
    fields: [
      { 
        id: "sectionTitle", 
        label: translations.sectionTitleLabel, 
        type: "text", 
        required: true 
      },
    ] as FieldConfig[],
    // Define element mapping with translated values
    elementsMapping: {
      "sectionTitle": translations.titleElement, 
    }
  };
};

// Default export for backward compatibility
export const heroSectionConfig = getHeroSectionConfig();