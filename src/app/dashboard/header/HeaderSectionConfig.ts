// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";

// Translation keys for header section - only labels that need translation
export const headerSectionTranslations = {
  en: {
    sectionBadgeLabel: "Name of Section (Header)"
  },
  ar: {
    sectionBadgeLabel: "اسم القسم (الرئيسي)"
  },
  tr: {
    sectionBadgeLabel: "Bölüm Adı (Başlık)"
  }
};

// Static values that remain the same across all languages
const HEADER_SECTION_CONSTANTS = {
  sectionName: "Header Section Basic",
  sectionDescription: "Header section for managing Header information",
  slug: "Header-main",
  type: "Header"
};

// Function to get translated header section config
export const getHeaderSectionConfig = (language: string = 'en') => {
  const translations = headerSectionTranslations[language as keyof typeof headerSectionTranslations] || headerSectionTranslations.en;
  
  return {
    name: HEADER_SECTION_CONSTANTS.sectionName,
    slug: HEADER_SECTION_CONSTANTS.slug,
    subSectionName: HEADER_SECTION_CONSTANTS.sectionName,
    description: HEADER_SECTION_CONSTANTS.sectionDescription,
    isMain: true,
    type: HEADER_SECTION_CONSTANTS.type,
    // Define fields with translated labels
    fields: [
      { 
        id: "sectionBadge", 
        label: translations.sectionBadgeLabel, 
        type: "text", 
        required: false 
      },
    ] as FieldConfig[],
    // Define element mapping
    elementsMapping: {}
  };
};

// Default export for backward compatibility
export const headerSectionConfig = getHeaderSectionConfig();