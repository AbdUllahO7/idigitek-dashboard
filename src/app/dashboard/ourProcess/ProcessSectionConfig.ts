// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define service section configuration
export const processSectionConfig = {
    name: "Process Section Basic",
    slug: "Process-main",
    subSectionName: "Process Section Basic",
    description: "Process section for managing service information",
    isMain: true,
    type: 'Process',
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Section Badge", type: "text", required: true },
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },
        { id: "sectionDescription", label: "Section Description", type: "textarea", required: false },
    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionBadge": "Badge",
        "sectionTitle": "Title", 
        "sectionDescription": "Description",
    }
};