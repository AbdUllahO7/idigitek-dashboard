import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for why choose us section
export const whyChooseUsSectionTranslations = {
  en: {
    sectionName: "Why Choose Us Section Basic",
    sectionDescription: "Why Choose Us section for managing competitive advantages and benefits",
    subSectionName: "Basic",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    whyChooseUsDetailsLabel: "Why Choose Us Details",
    type: "WhyChooseUs",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    whyChooseUsDetailsElement: "WhyChooseUsDetails"
  },
  ar: {
    sectionName: "قسم لماذا تختارنا الأساسي",
    sectionDescription: "قسم لماذا تختارنا لإدارة المزايا التنافسية والفوائد",
    subSectionName: "أساسي",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    whyChooseUsDetailsLabel: "تفاصيل لماذا تختارنا",
    type: "لماذا تختارنا",
    badgeElement: "شارة",
    titleElement: "عنوان",
    descriptionElement: "وصف",
    whyChooseUsDetailsElement: "تفاصيل لماذا تختارنا"
  },
  tr: {
    sectionName: "Neden Bizi Seçin Temel Bölümü",
    sectionDescription: "Rekabet avantajları ve faydaları yönetmek için neden bizi seçin bölümü",
    subSectionName: "Temel",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    whyChooseUsDetailsLabel: "Neden Bizi Seçin Detayları",
    type: "Neden Bizi Seçin",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    whyChooseUsDetailsElement: "Neden Bizi Seçin Detayları"
  }
};

// Function to get translated why choose us section config
export const getWhyChooseUsSectionConfig = (language: string = 'en') => {
  const translations = whyChooseUsSectionTranslations[language as keyof typeof whyChooseUsSectionTranslations] || whyChooseUsSectionTranslations.en;
  
  return {
    name: "Why Choose Us Section Basic",
    slug: "why-choose-us-main",
    subSectionName: translations.subSectionName,
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
      sectionBadge: translations.badgeElement,
      sectionTitle: translations.titleElement, 
      sectionDescription: translations.descriptionElement,
      whyChooseUsDetails: translations.whyChooseUsDetailsElement
    }
  };
};

// Default export for backward compatibility
export const whyChooseUsSectionConfig = getWhyChooseUsSectionConfig();