import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for process section
export const processSectionTranslations = {
  en: {
    sectionName: "Process Section Basic",
    sectionDescription: "Process section for managing workflow and procedure information",
    subSectionName: "Basic",
    sectionBadgeLabel: "Section Badge",
    sectionTitleLabel: "Section Title",
    sectionDescriptionLabel: "Section Description",
    processDetailsLabel: "Section Details",
    type: "Process",
    badgeElement: "Badge",
    titleElement: "Title",
    descriptionElement: "Description",
    processDetailsElement: "ProcessDetails"
  },
  ar: {
    sectionName: "قسم العملية الأساسي",
    sectionDescription: "قسم العملية لإدارة معلومات سير العمل والإجراءات",
    subSectionName: "أساسي",
    sectionBadgeLabel: "شارة القسم",
    sectionTitleLabel: "عنوان القسم",
    sectionDescriptionLabel: "وصف القسم",
    processDetailsLabel: "تفاصيل القسم",
    type: "عملية",
    badgeElement: "شارة",
    titleElement: "عنوان",
    descriptionElement: "وصف",
    processDetailsElement: "تفاصيل العملية"
  },
  tr: {
    sectionName: "Süreç Bölümü Temel",
    sectionDescription: "İş akışı ve prosedür bilgilerini yönetmek için süreç bölümü",
    subSectionName: "Temel",
    sectionBadgeLabel: "Bölüm Rozeti",
    sectionTitleLabel: "Bölüm Başlığı",
    sectionDescriptionLabel: "Bölüm Açıklaması",
    processDetailsLabel: "Bölüm Detayları",
    type: "Süreç",
    badgeElement: "Rozet",
    titleElement: "Başlık",
    descriptionElement: "Açıklama",
    processDetailsElement: "SüreçDetayları"
  }
};

// Function to get translated process section config
export const getProcessSectionConfig = (language: string = 'en') => {
  const translations = processSectionTranslations[language as keyof typeof processSectionTranslations] || processSectionTranslations.en;
  
  return {
    name: translations.sectionName,
    slug: "process-main",
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
      processDetails: translations.processDetailsElement,
    }
  };
};

// Default export for backward compatibility
export const processSectionConfig = getProcessSectionConfig();