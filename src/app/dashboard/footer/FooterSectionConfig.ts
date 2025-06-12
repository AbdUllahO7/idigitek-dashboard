// src/hooks/service/footer-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for footer section
export const footerSectionTranslations = {
  en: {
    sectionName: "Footer Section Basic",
    sectionDescription: "Footer section for managing service information",
    sectionTitleLabel: "Section Title",
    footerDetailsLabel: "Footer Details",
    type: "Footer",
    titleElement: "Title",
    footerDetailsElement: "FooterDetails"
  },
  ar: {
    sectionName: "قسم الشريط الأساسي",
    sectionDescription: "قسم الشريط لإدارة معلومات الخدمة",
    sectionTitleLabel: "عنوان القسم",
    footerDetailsLabel: "تفاصيل الشريط",
    type: "شريط",
    titleElement: "العنوان",
    footerDetailsElement: "تفاصيل الشريط"
  },
  tr: {
    sectionName: "Temel Alt Bilgi Bölümü",
    sectionDescription: "Hizmet bilgilerini yönetmek için alt bilgi bölümü",
    sectionTitleLabel: "Bölüm Başlığı",
    footerDetailsLabel: "Alt Bilgi Detayları",
    type: "Alt Bilgi",
    titleElement: "Başlık",
    footerDetailsElement: "Alt Bilgi Detayları"
  }
};

// Function to get translated footer section config
export const getFooterSectionConfig = (language: string = 'en') => {
  const translations = footerSectionTranslations[language as keyof typeof footerSectionTranslations] || footerSectionTranslations.en;
  
  return {
    name: "Footer Section Basic",
    slug: "Footer-main",
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
      { 
        id: "footerDetails", 
        label: translations.footerDetailsLabel, 
        type: "textarea", 
        required: false 
      },
    ] as FieldConfig[],
    // Define element mapping with translated values
    elementsMapping: {
      "sectionTitle": translations.titleElement,
      "footerDetails": translations.footerDetailsElement
    }
  };
};

// Default export for backward compatibility
export const footerSectionConfig = getFooterSectionConfig();