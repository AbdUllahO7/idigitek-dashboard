// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for project section
export const projectSectionTranslations = {
  en: {
    sectionName: "Project Section Basic",
    sectionDescription: "Project section for managing service information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    projectDetailsLabel: "Project Details",
    type: "Project",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    serviceDetailsElement: "ServiceDetails"
  },
  ar: {
    sectionName: "قسم المشروع الأساسي",
    sectionDescription: "قسم المشروع لإدارة معلومات الخدمة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    projectDetailsLabel: "تفاصيل المشروع",
    type: "مشروع",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    serviceDetailsElement: "تفاصيل الخدمة"
  },
  tr: {
    sectionName: "Temel Proje Bölümü",
    sectionDescription: "Hizmet bilgilerini yönetmek için proje bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    projectDetailsLabel: "Proje Detayları",
    type: "Proje",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    serviceDetailsElement: "Hizmet Detayları"
  }
};

// Function to get translated project section config
export const getProjectSectionConfig = (language: string = 'en') => {
  const translations = projectSectionTranslations[language as keyof typeof projectSectionTranslations] || projectSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "Project-main",
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
      { 
        id: "serviceDetails", 
        label: translations.projectDetailsLabel, 
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
export const projectSectionConfig = getProjectSectionConfig();