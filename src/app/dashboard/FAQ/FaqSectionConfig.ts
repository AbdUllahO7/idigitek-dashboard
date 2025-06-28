import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for FAQ section
export const faqSectionTranslations = {
    en: {
        sectionName: "FAQ Section Basic",
        sectionDescription: "FAQ section for managing service information",
        sectionBadgeLabel: "Section Badge",
        sectionTitleLabel: "Section Title",
        sectionDescriptionLabel: "Section Description",
        type: "FAQ",
        badgeElement: "Badge",
        titleElement: "Title",
        descriptionElement: "Description",
    },
    ar: {
        sectionName: "قسم الأسئلة الشائعة الأساسي",
        sectionDescription: "قسم الأسئلة الشائعة لإدارة معلومات الخدمة",
        sectionBadgeLabel: "شارة القسم",
        sectionTitleLabel: "عنوان القسم",
        sectionDescriptionLabel: "وصف القسم",
        type: "الأسئلة الشائعة",
        badgeElement: "الشارة",
        titleElement: "العنوان",
        descriptionElement: "الوصف",
    },
    tr: {
        sectionName: "Temel SSS Bölümü",
        sectionDescription: "Hizmet bilgilerini yönetmek için SSS bölümü",
        sectionBadgeLabel: "Bölüm Rozeti",
        sectionTitleLabel: "Bölüm Başlığı",
        sectionDescriptionLabel: "Bölüm Açıklaması",
        type: "SSS",
        badgeElement: "Rozet",
        titleElement: "Başlık",
        descriptionElement: "Açıklama",
    },
};

// Function to get translated FAQ section config
export const getFaqSectionConfig = (language: string = 'en') => {
  const translations = faqSectionTranslations[language as keyof typeof faqSectionTranslations] || faqSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "Faq-main",
    subSectionName: translations.sectionName,
    description: translations.sectionDescription,
    isMain: true,
    type: translations.type,
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
    elementsMapping: {
      "sectionBadge": translations.badgeElement,
      "sectionTitle": translations.titleElement,
      "sectionDescription": translations.descriptionElement,
    },
  };
};

// Default export for FAQ section
export const faqSectionConfig = getFaqSectionConfig();

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
    serviceDetailsElement: "ServiceDetails",
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
    serviceDetailsElement: "تفاصيل الخدمة",
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
    serviceDetailsElement: "Hizmet Detayları",
  },
};

// Function to get translated news section config
export const getNewsSectionConfig = (language: string = 'en') => {
  const translations = newsSectionTranslations[language as keyof typeof newsSectionTranslations] || newsSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "News-main",
    subSectionName: translations.sectionName,
    description: translations.sectionDescription,
    isMain: true,
    type: translations.type,
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
    elementsMapping: {
      "sectionBadge": translations.badgeElement,
      "sectionTitle": translations.titleElement,
      "sectionDescription": translations.descriptionElement,
      "serviceDetails": translations.serviceDetailsElement,
    },
  };
};

// Default export for news section
export const newsSectionConfig = getNewsSectionConfig();