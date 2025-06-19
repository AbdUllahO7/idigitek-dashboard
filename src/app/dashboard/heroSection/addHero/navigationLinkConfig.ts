import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for navigation link section
export const navigationLinkTranslations = {
  en: {
    sectionName: "Navigation Link",
    sectionDescription: "Configure navigation links for your website",
    nameLabel: "Name of Link",
    typeLabel: "Type",
    customLinkLabel: "Custom Link",
    typeOptions: {
      default: "Default",
      custom: "Custom",
    },
  },
  ar: {
    sectionName: "رابط التنقل",
    sectionDescription: "تكوين روابط التنقل لموقعك الإلكتروني",
    nameLabel: "اسم الرابط",
    typeLabel: "النوع",
    customLinkLabel: "رابط مخصص",
    typeOptions: {
      default: "افتراضي",
      custom: "مخصص",
    },
  },
  tr: {
    sectionName: "Gezinme Bağlantısı",
    sectionDescription: "Web siteniz için gezinme bağlantılarını yapılandırın",
    nameLabel: "Bağlantı Adı",
    typeLabel: "Tür",
    customLinkLabel: "Özel Bağlantı",
    typeOptions: {
      default: "Varsayılan",
      custom: "Özel",
    },
  },
};

// Function to get translated navigation link section config
export const getNavigationLinkConfig = (language: string = "en") => {
  const translations =
    navigationLinkTranslations[language as keyof typeof navigationLinkTranslations] ||
    navigationLinkTranslations.en;

  return {
    name: translations.sectionName,
    slug: "navigation-link",
    subSectionName: translations.sectionName,
    description: translations.sectionDescription,
    isMain: true, // Marking as main for consistency with your structure
    type: "navigation",
    fields: [
      {
        id: "linkName",
        label: translations.nameLabel,
        type: "text",
        required: true,
      },
      {
        id: "linkType",
        label: translations.typeLabel,
        type: "select",
        required: true,
        options: [
          { value: "default", label: translations.typeOptions.default },
          { value: "custom", label: translations.typeOptions.custom },
        ],
      },
      {
        id: "customLink",
        label: translations.customLinkLabel,
        type: "text",
        required: false, // Only required if type is "custom"
        conditional: {
          dependsOn: "linkType",
          showWhen: "custom",
        },
      },
    ] as FieldConfig[],
    elementsMapping: {
      linkName: "Link Name",
      linkType: "Link Type",
      customLink: "Custom Link",
    },
  };
};

// Default export for backward compatibility
export const navigationLinkConfig = getNavigationLinkConfig();