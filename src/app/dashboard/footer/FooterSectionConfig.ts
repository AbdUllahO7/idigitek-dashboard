// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define service section configuration
export const footerSectionConfig = {
    name: "Hero Section Basic",
    slug: "Hero-main",
    subSectionName: "Hero Section Basic",
    description: "Hero section for managing service information",
    isMain: true,
    type: 'Hero',
    // Define fields with proper typing
    fields: [
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },

    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionTitle": "Title", 
    }
};