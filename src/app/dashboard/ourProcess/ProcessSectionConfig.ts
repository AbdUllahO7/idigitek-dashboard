// src/hooks/service/process-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for process section
export const processSectionTranslations = {
  en: {
    sectionName: "Process Section Basic",
    sectionDescription: "Process section for managing service information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    type: "Process",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description"
  },
  ar: {
    sectionName: "قسم العملية الأساسي",
    sectionDescription: "قسم العملية لإدارة معلومات الخدمة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    type: "عملية",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف"
  },
  tr: {
    sectionName: "Temel Süreç Bölümü",
    sectionDescription: "Hizmet bilgilerini yönetmek için süreç bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    type: "Süreç",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama"
  }
};

// Function to get translated process section config
export const getProcessSectionConfig = (language: string = 'en') => {
  const translations = processSectionTranslations[language as keyof typeof processSectionTranslations] || processSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "Process-main",
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
    }
  };
};

// Default export for backward compatibility
export const processSectionConfig = getProcessSectionConfig();