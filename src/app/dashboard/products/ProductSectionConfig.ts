import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for product section
export const productSectionTranslations = {
  en: {
    sectionName: "product Section Basic",
    sectionDescription: "product section for managing service information",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    productDetailsLabel: "product Details",
    type: "product",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    serviceDetailsElement: "ServiceDetails"
  },
  ar: {
    sectionName: "product Section Basic",
    sectionDescription: "قسم المدونة لإدارة معلومات الخدمة",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    productDetailsLabel: "تفاصيل المدونة",
    type: "مدونة",
    badgeElement: "الشارة",
    titleElement: "العنوان",
    descriptionElement: "الوصف",
    serviceDetailsElement: "تفاصيل الخدمة"
  },
  tr: {
    sectionName: "product Section Basic",
    sectionDescription: "Hizmet bilgilerini yönetmek için product bölümü",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    productDetailsLabel: "product Detayları",
    type: "product",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    serviceDetailsElement: "Hizmet Detayları"
  }
};

// Function to get translated product section config
export const getproductSectionConfig = (language: string = 'en') => {
  const translations = productSectionTranslations[language as keyof typeof productSectionTranslations] || productSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "product-main",
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
        label: translations.productDetailsLabel, 
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
