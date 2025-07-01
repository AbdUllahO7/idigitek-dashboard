import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for blog section
export const blogSectionTranslations = {
  en: {
    sectionName: "Blog Section Basic",
    sectionDescription: "Blog section for managing service information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    blogDetailsLabel: "Blog Details",
    type: "Blog",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    serviceDetailsElement: "ServiceDetails"
  },
  ar: {
    sectionName: "القسم  الأساسي",
    sectionDescription: "قسم  لإدارة معلومات الخدمة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    blogDetailsLabel: "تفاصيل القسم",
    type: "مدونة",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    serviceDetailsElement: "تفاصيل الخدمة"
  },
  tr: {
    sectionName: "Temel Blog Bölümü",
    sectionDescription: "Hizmet bilgilerini yönetmek için blog bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    blogDetailsLabel: "Blog Detayları",
    type: "Blog",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    serviceDetailsElement: "Hizmet Detayları"
  }
};

// Function to get translated blog section config
export const getBlogSectionConfig = (language: string = 'en') => {
  const translations = blogSectionTranslations[language as keyof typeof blogSectionTranslations] || blogSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "Blog-main",
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
        label: translations.blogDetailsLabel, 
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
