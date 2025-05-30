// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define service section configuration
export const footerSectionConfig = {
    name: "Footer Section Basic",
    slug: "Footer-main",
    subSectionName: "Footer Section Basic",
    description: "Footer section for managing service information",
    isMain: true,
    type: 'Footer',
    // Define fields with proper typing
    fields: [
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },

    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionTitle": "Title", 
    }
};