// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for service section
export const serviceSectionTranslations = {
    en: {
        sectionName: "Service Section Basic",
        sectionDescription: "Service section for managing service information",
        sectionBadgeLabel: "Section Badge",
        sectionTitleLabel: "Section Title",
        sectionDescriptionLabel: "Section Description",
        serviceDetailsLabel: "Service Details",
        type: "Service",
        badgeElement: "Badge",
        titleElement: "Title",
        descriptionElement: "Description",
        serviceDetailsElement: "ServiceDetails"
    },
    ar: {
        sectionName: "قسم الخدمات الأساسي",
        sectionDescription: "قسم الخدمات لإدارة معلومات الخدمة",
        sectionBadgeLabel: "شارة القسم",
        sectionTitleLabel: "عنوان القسم",
        sectionDescriptionLabel: "وصف القسم",
        serviceDetailsLabel: "تفاصيل الخدمة",
        type: "خدمة",
        badgeElement: "الشارة",
        titleElement: "العنوان",
        descriptionElement: "الوصف",
        serviceDetailsElement: "تفاصيل الخدمة"
    },
    tr: {
        sectionName: "Temel Hizmet Bölümü",
        sectionDescription: "Hizmet bilgilerini yönetmek için hizmet bölümü",
        sectionBadgeLabel: "Bölüm Rozeti",
        sectionTitleLabel: "Bölüm Başlığı",
        sectionDescriptionLabel: "Bölüm Açıklaması",
        serviceDetailsLabel: "Hizmet Detayları",
        type: "Hizmet",
        badgeElement: "Rozet",
        titleElement: "Başlık",
        descriptionElement: "Açıklama",
        serviceDetailsElement: "Hizmet Detayları"
    }
};

// Function to get translated service section config
export const getServiceSectionConfig = (language: string = 'en') => {
    const translations = serviceSectionTranslations[language as keyof typeof serviceSectionTranslations] || serviceSectionTranslations.en;
    
    return {
        name: "Service Section Basic",
        slug: "services-main",
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
            label: translations.serviceDetailsLabel, 
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
export const serviceSectionConfig = getServiceSectionConfig();