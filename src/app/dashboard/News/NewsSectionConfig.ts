// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for news section
export const newsSectionTranslations = {
  en: {
    sectionName: "News Section Basic",
    sectionDescription: "News section for managing service information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    newsDetailsLabel: "News Details",
    type: "News",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    serviceDetailsElement: "ServiceDetails"
  },
  ar: {
    sectionName: "قسم الأخبار الأساسي",
    sectionDescription: "قسم الأخبار لإدارة معلومات الخدمة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    newsDetailsLabel: "تفاصيل الأخبار",
    type: "أخبار",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    serviceDetailsElement: "تفاصيل الخدمة"
  },
  tr: {
    sectionName: "Temel Haber Bölümü",
    sectionDescription: "Hizmet bilgilerini yönetmek için haber bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    newsDetailsLabel: "Haber Detayları",
    type: "Haber",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    serviceDetailsElement: "Hizmet Detayları"
  }
};

// Function to get translated news section config
export const getNewsSectionConfig = (language: string = 'en') => {
  const translations = newsSectionTranslations[language as keyof typeof newsSectionTranslations] || newsSectionTranslations.en;
  
  return {
    name: "News Section Basic",
    slug: "News-main",
    subSectionName: "translations.sectionName",
    description: "News section for managing service information",
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
      { 
        id: "serviceDetails", 
        label: translations.newsDetailsLabel, 
        type: "badge", 
        required: true 
      },
    ] as FieldConfig[],
    // Define element mapping with translated values
    elementsMapping: {
      "sectionBadge": translations.badgeElement,
      "sectionTitle": translations.titleElement, 
      "sectionDescription": translations.descriptionElement,
      "serviceDetails": translations.serviceDetailsElement
    }
  };
};

// Default export for backward compatibility
export const newsSectionConfig = getNewsSectionConfig();