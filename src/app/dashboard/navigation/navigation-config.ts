// src/app/dashboard/team/navigation/team-navigation-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for Navigation section
export const teamNavigationTranslations = {
  en: {
    sectionName: "Navigation",
    sectionDescription: "Navigation configuration for team section",
    navigationName: "Navigation Name",
    navigationUrl: "Navigation URL",
    navigationDescription: "Navigation Description",
    subNavigationTitle: "Sub-Navigation Items",
    subNavigationDescription: "Manage sub-navigation items for this section",
    subNavItemTitle: "Sub-Navigation Title",
    subNavItemUrl: "Sub-Navigation URL",
    addSubNavItem: "Add Sub-Navigation Item",
    removeSubNavItem: "Remove",
    subNavPlaceholder: "Enter sub-navigation title",
    subNavUrlPlaceholder: "/team/about or https://example.com/about",
    type: "TeamNavigation",
    nameElement: "Name",
    urlElement: "URL",
    descriptionElement: "Description",
    subNavTitleElement: "SubNavTitle",
    subNavUrlElement: "SubNavURL",
    urlPlaceholder: "/team or https://example.com/team",
    urlDescription: "Enter the URL for this navigation item. Can be relative (/team) or absolute (https://example.com/team)",
    subNavUrlDescription: "Enter the URL for this sub-navigation item"
  },
  ar: {
    sectionName: "Navigation",
    sectionDescription: "إعداد التنقل لقسم الفريق",
    navigationName: "اسم التنقل",
    navigationUrl: "رابط التنقل",
    navigationDescription: "وصف التنقل",
    subNavigationTitle: "عناصر التنقل الفرعية",
    subNavigationDescription: "إدارة عناصر التنقل الفرعية لهذا القسم",
    subNavItemTitle: "عنوان التنقل الفرعي",
    subNavItemUrl: "رابط التنقل الفرعي",
    addSubNavItem: "إضافة عنصر تنقل فرعي",
    removeSubNavItem: "إزالة",
    subNavPlaceholder: "أدخل عنوان التنقل الفرعي",
    subNavUrlPlaceholder: "/team/about أو https://example.com/about",
    type: "تنقل الفريق",
    nameElement: "الاسم",
    urlElement: "الرابط",
    descriptionElement: "الوصف",
    subNavTitleElement: "عنوان التنقل الفرعي",
    subNavUrlElement: "رابط التنقل الفرعي",
    urlPlaceholder: "/team أو https://example.com/team",
    urlDescription: "أدخل الرابط لعنصر التنقل هذا. يمكن أن يكون نسبياً (/team) أو مطلقاً (https://example.com/team)",
    subNavUrlDescription: "أدخل الرابط لعنصر التنقل الفرعي هذا"
  },
  tr: {
    sectionName: "Navigation",
    sectionDescription: "Takım bölümü için navigasyon yapılandırması",
    navigationName: "Navigasyon Adı",
    navigationUrl: "Navigasyon URL'si",
    navigationDescription: "Navigasyon Açıklaması",
    subNavigationTitle: "Alt Navigasyon Öğeleri",
    subNavigationDescription: "Bu bölüm için alt navigasyon öğelerini yönetin",
    subNavItemTitle: "Alt Navigasyon Başlığı",
    subNavItemUrl: "Alt Navigasyon URL'si",
    addSubNavItem: "Alt Navigasyon Öğesi Ekle",
    removeSubNavItem: "Kaldır",
    subNavPlaceholder: "Alt navigasyon başlığını girin",
    subNavUrlPlaceholder: "/team/about veya https://example.com/about",
    type: "Takım Navigasyonu",
    nameElement: "Ad",
    urlElement: "URL",
    descriptionElement: "Açıklama",
    subNavTitleElement: "Alt Nav Başlığı",
    subNavUrlElement: "Alt Nav URL",
    urlPlaceholder: "/team veya https://example.com/team",
    urlDescription: "Bu navigasyon öğesi için URL'yi girin. Göreceli (/team) veya mutlak (https://example.com/team) olabilir",
    subNavUrlDescription: "Bu alt navigasyon öğesi için URL'yi girin"
  }
};

// Sub-navigation item type
export interface SubNavigationItem {
  id: string;
  title: string;
  url: string;
}

// Function to get translated Navigation section config
export const getTeamNavigationSectionConfig = (language: string = 'en') => {
    const translations = teamNavigationTranslations[language as keyof typeof teamNavigationTranslations] || teamNavigationTranslations.en;
    
    return {
        name: translations.sectionName,
        slug: "Team-navigation",
        subSectionName: translations.sectionName,
        description: translations.sectionDescription,
        isMain: true,
        type: translations.type,
        // Define fields with translated labels
        fields: [
        { 
            id: "name", 
            label: translations.navigationName, 
            type: "text", 
            required: true 
        },
        { 
            id: "url", 
            label: translations.navigationUrl, 
            type: "text", 
            required: false,
            showOnlyInDefault: true, // Only show in default language
            placeholder: translations.urlPlaceholder,
            description: translations.urlDescription
        },
        ] as FieldConfig[],
        // Define element mapping with translated values
        elementsMapping: {
        "name": translations.nameElement,
        "url": translations.urlElement,
        },
        // Sub-navigation configuration
        subNavigation: {
            title: translations.subNavigationTitle,
            description: translations.subNavigationDescription,
            itemTitle: translations.subNavItemTitle,
            itemUrl: translations.subNavItemUrl,
            addButton: translations.addSubNavItem,
            removeButton: translations.removeSubNavItem,
            titlePlaceholder: translations.subNavPlaceholder,
            urlPlaceholder: translations.subNavUrlPlaceholder,
            urlDescription: translations.subNavUrlDescription,
            titleElement: translations.subNavTitleElement,
            urlElement: translations.subNavUrlElement
        }
    };
};

// Default export
export const teamNavigationSectionConfig = getTeamNavigationSectionConfig();