// src/hooks/service/contact-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for contact section
export const contactSectionTranslations = {
  en: {
    sectionName: "Contact Section Basic",
    sectionDescription: "Contact section for managing service information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    contactDetailsLabel: "Contact Details",
    type: "Contact",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    contactDetailsElement: "ContactDetails"
  },
  ar: {
    sectionName: "قسم الاتصال الأساسي",
    sectionDescription: "قسم الاتصال لإدارة معلومات الخدمة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    contactDetailsLabel: "تفاصيل الاتصال",
    type: "اتصال",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    contactDetailsElement: "تفاصيل الاتصال"
  },
  tr: {
    sectionName: "Temel İletişim Bölümü",
    sectionDescription: "Hizmet bilgilerini yönetmek için iletişim bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    contactDetailsLabel: "İletişim Detayları",
    type: "İletişim",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    contactDetailsElement: "İletişim Detayları"
  }
};

// Function to get translated contact section config
export const getContactSectionConfig = (language: string = 'en') => {
  const translations = contactSectionTranslations[language as keyof typeof contactSectionTranslations] || contactSectionTranslations.en;
  
  return {
    name: "Contact Section Basic",
    slug: "Contact-main",
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
      { 
        id: "contactDetails", 
        label: translations.contactDetailsLabel, 
        type: "badge", 
        required: true 
      },
    ] as FieldConfig[],
    // Define element mapping with translated values
    elementsMapping: {
      "sectionBadge": translations.badgeElement,
      "sectionTitle": translations.titleElement, 
      "sectionDescription": translations.descriptionElement,
      "contactDetails": translations.contactDetailsElement
    }
  };
};

// Default export for backward compatibility
export const contactSectionConfig = getContactSectionConfig();