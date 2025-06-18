// src/hooks/industry/industry-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for why choose us section
export const whyChooseUsSectionTranslations = {
  en: {
    sectionName: "Chose Us Section Basic",
    sectionDescription: "Chose Us section for managing industry information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    choseUsDetailsLabel: "Chose Us Details",
    type: "industry",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    choseUsDetailsElement: "Chose UsDetails"
  },
  ar: {
    sectionName: "قسم لماذا تختارنا الأساسي",
    sectionDescription: "قسم لماذا تختارنا لإدارة معلومات الصناعة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    choseUsDetailsLabel: "تفاصيل لماذا تختارنا",
    type: "صناعة",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    choseUsDetailsElement: "تفاصيل اختيارنا"
  },
  tr: {
    sectionName: "Neden Bizi Seçin Temel Bölümü",
    sectionDescription: "Endüstri bilgilerini yönetmek için neden bizi seçin bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    choseUsDetailsLabel: "Neden Bizi Seçin Detayları",
    type: "endüstri",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    choseUsDetailsElement: "Bizi Seçin Detayları"
  }
};

// Function to get translated why choose us section config
export const getWhyChooseUsSectionConfig = (language: string = 'en') => {
  const translations = whyChooseUsSectionTranslations[language as keyof typeof whyChooseUsSectionTranslations] || whyChooseUsSectionTranslations.en;
  
  return {
    name: "Chose Us Section Basic",
    slug: "Choose-main",
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
      "sectionBadge": translations.badgeElement,
      "sectionTitle": translations.titleElement, 
      "sectionDescription": translations.descriptionElement,
      "industryDetails": translations.choseUsDetailsElement
    }
  };
};

// Default export for backward compatibility
export const whyChooseUsSectionConfig = getWhyChooseUsSectionConfig();