// src/hooks/industry/industry-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for industry section
export const industrySectionTranslations = {
  en: {
    sectionName: "Industry Section Basic",
    sectionDescription: "Industry section for managing industry information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    industryDetailsLabel: "Industry Details",
    type: "industry",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    industryDetailsElement: "IndustryDetails"
  },
  ar: {
    sectionName: "قسم الصناعة الأساسي",
    sectionDescription: "قسم الصناعة لإدارة معلومات الصناعة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    industryDetailsLabel: "تفاصيل الصناعة",
    type: "صناعة",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    industryDetailsElement: "تفاصيل الصناعة"
  },
  tr: {
    sectionName: "Temel Endüstri Bölümü",
    sectionDescription: "Endüstri bilgilerini yönetmek için endüstri bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    industryDetailsLabel: "Endüstri Detayları",
    type: "endüstri",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    industryDetailsElement: "Endüstri Detayları"
  }
};

// Function to get translated industry section config
export const getIndustrySectionConfig = (language: string = 'en') => {
  const translations = industrySectionTranslations[language as keyof typeof industrySectionTranslations] || industrySectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "industry-main",
    subSectionName: translations.sectionName,
    description: translations.sectionDescription,
    isMain: true,
    type: translations.type,
    // Define fields with translated labels
    fields: [
      { 
        id: "sectionBadge", 
        label: translations.sectionBadgeLabel, 
        type: "text", 
        required: false 
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
      "sectionBadge": translations.badgeElement,
      "sectionTitle": translations.titleElement, 
      "sectionDescription": translations.descriptionElement,
      "industryDetails": translations.industryDetailsElement
    }
  };
};

// Default export for backward compatibility
export const industrySectionConfig = getIndustrySectionConfig();