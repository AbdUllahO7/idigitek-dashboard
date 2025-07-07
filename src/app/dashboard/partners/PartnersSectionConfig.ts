// src/hooks/industry/industry-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for partners section
export const partnersSectionTranslations = {
  en: {
    sectionName: "Partners Section Basic",
    sectionDescription: "Partners section for managing industry information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    partnersDetailsLabel: "Section Details",
    type: "Partners",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    partnersDetailsElement: "PartnersDetails"
  },
  ar: {
    sectionName: "القسم  الأساسي",
    sectionDescription: " القسم لإدارة معلومات الصناعة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    partnersDetailsLabel: "تفاصيل القسم",
    type: "شركاء",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    partnersDetailsElement: "تفاصيل القسم"
  },
  tr: {
    sectionName: "Temel Ortak Bölümü",
    sectionDescription: "Sektör bilgilerini yönetmek için ortak bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    partnersDetailsLabel: "Bölüm Detayları",
    type: "Ortak",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    partnersDetailsElement: "Bölüm Detayları"
  }
};

// Function to get translated partners section config
export const getPartnersSectionConfig = (language: string = 'en' , sectionData?: any) => {
  const translations = partnersSectionTranslations[language as keyof typeof partnersSectionTranslations] || partnersSectionTranslations.en;
   const baseSlug = "Partners-main";
  let sectionSlug = baseSlug;


 if (sectionData?.isDuplicate && sectionData?.uniqueIdentifier) {
    sectionSlug = `${baseSlug}-${sectionData.uniqueIdentifier}`;
  } else if (sectionData?.duplicateIndex) {
    sectionSlug = `${baseSlug}-duplicate-${sectionData.duplicateIndex}`;
  }
  
  return {
    name: "Partners Section Basic",
    slug: "Partners-main",
    subSectionName: translations.sectionName,
    description: translations.sectionDescription,
    isMain: true,
    type: translations.type,
    isDuplicate: sectionData?.isDuplicate || false,
    duplicateIndex: sectionData?.duplicateIndex,
    uniqueIdentifier: sectionData?.uniqueIdentifier,
    originalSectionId: sectionData?.originalSectionId,
    

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
        id: "partnersDetails", 
        label: translations.partnersDetailsLabel, 
        type: "badge", 
        required: true 
      },
    ] as FieldConfig[],
    // Define element mapping with translated values
    elementsMapping: {
      "sectionBadge": translations.badgeElement,
      "sectionTitle": translations.titleElement, 
      "sectionDescription": translations.descriptionElement,
      "partnersDetails": translations.partnersDetailsElement
    }
  };
};

// Default export for backward compatibility
export const partnersSectionConfig = getPartnersSectionConfig();

// Original static config (deprecated - use getPartnersSectionConfig instead)
export const legacyPartnersSectionConfig = {
    name: "Partners Section Basic",
    slug: "Partners-main",
    subSectionName: "Partners Section Basic",
    description: "Partners section for managing industry information",
    isMain: true,
    type: 'industry',
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Section Badge", type: "text", required: true },
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },
        { id: "sectionDescription", label: "Section Description", type: "textarea", required: false },
    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionBadge": "Badge",
        "sectionTitle": "Title", 
        "sectionDescription": "Description",
        "industryDetails": "PartnersDetails"
    }
};