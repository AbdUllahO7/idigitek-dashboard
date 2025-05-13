// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define service section configuration
export const headerSectionConfig = {
    name: "Industry Section Basic",
    slug: "Industry-main",
    subSectionName: "Industry Section Basic",
    description: "Industry section for managing Industry information",
    isMain: true,
    type: 'Industry',
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Name of Section (Industry)", type: "text", required: true },
        ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        
    }
};
