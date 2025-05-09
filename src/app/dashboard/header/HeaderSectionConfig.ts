// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define service section configuration
export const headerSectionConfig = {
    name: "Header Section Basic",
    slug: "Header-main",
    subSectionName: "Header Section Basic",
    description: "Header section for managing Header information",
    isMain: true,
    type: 'Header',
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Name of Section (Header)", type: "text", required: true },
        ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        
    }
};
