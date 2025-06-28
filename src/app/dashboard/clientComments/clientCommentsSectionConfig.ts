import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for clientComments section
export const clientCommentsSectionTranslations = {
    en: {
        sectionName: "Client Comments Section Basic",
        sectionDescription: "Client Comments section for managing testimonials and feedback",
        subSectionName: "Basic",
        sectionBadgeLabel: "Section Badge",
        sectionTitleLabel: "Section Title", 
        sectionDescriptionLabel: "Section Description",
        clientCommentsDetailsLabel: "Client Comments Details",
        type: "ClientComments",
        badgeElement: "Badge",
        titleElement: "Title",
        descriptionElement: "Description",
        clientCommentsDetailsElement: "ClientCommentsDetails",
    },
    ar: {
        sectionName: "Client Comments Section Basic",
        sectionDescription: "قسم تعليقات العملاء لإدارة الشهادات والتعليقات",
        subSectionName: "أساسي",
        sectionBadgeLabel: "شارة القسم",
        sectionTitleLabel: "عنوان القسم",
        sectionDescriptionLabel: "وصف القسم",
        clientCommentsDetailsLabel: "تفاصيل تعليقات العملاء",
        type: "تعليقات العملاء",
        badgeElement: "شارة",
        titleElement: "عنوان",
        descriptionElement: "وصف",
        clientCommentsDetailsElement: "تفاصيل تعليقات العملاء",
    },
    tr: {
        sectionName: "Client Comments Section Basic",
        sectionDescription: "Müşteri yorumları ve geri bildirimleri yönetmek için bölüm",
        subSectionName: "Temel",
        sectionBadgeLabel: "Bölüm Rozeti",
        sectionTitleLabel: "Bölüm Başlığı",
        sectionDescriptionLabel: "Bölüm Açıklaması",
        clientCommentsDetailsLabel: "Müşteri Yorumları Detayları",
        type: "Müşteri Yorumları",
        badgeElement: "Rozet",
        titleElement: "Başlık",
        descriptionElement: "Açıklama",
        clientCommentsDetailsElement: "MüşteriYorumlarıDetayları",
    },
};

// Function to get translated clientComments section config
export const getClientCommentsSectionConfig = (language: string = 'en') => {
    const translations = clientCommentsSectionTranslations[language as keyof typeof clientCommentsSectionTranslations] || clientCommentsSectionTranslations.en;

    return {
        name: translations.sectionName,
        slug: "client-comments-main", // Fixed slug to be more descriptive
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
                required: true,
            },
            {
                id: "sectionTitle",
                label: translations.sectionTitleLabel,
                type: "text",
                required: true,
            },
            {
                id: "sectionDescription",
                label: translations.sectionDescriptionLabel,
                type: "textarea",
                required: false,
            },
        ] as FieldConfig[],
        // Define element mapping with translated values
        elementsMapping: {
            sectionBadge: translations.badgeElement,
            sectionTitle: translations.titleElement,
            sectionDescription: translations.descriptionElement,
            clientCommentsDetails: translations.clientCommentsDetailsElement,
        },
    };
};

// Default export for backward compatibility
export const clientCommentsSectionConfig = getClientCommentsSectionConfig();