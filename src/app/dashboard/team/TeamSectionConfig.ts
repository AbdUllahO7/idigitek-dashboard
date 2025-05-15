// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define service section configuration
export const teamSectionConfig = {
    name: "Team Section Basic",
    slug: "Team-main",
    subSectionName: "Team Section Basic",
    description: "Team section for managing service information",
    isMain: true,
    type: 'Team',
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Section Badge", type: "text", required: true },
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },
        { id: "sectionDescription", label: "Section Description", type: "textarea", required: false },
        { id: "serviceDetails", label: "team Details", type: "badge", required: true },
    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionBadge": "Badge",
        "sectionTitle": "Title", 
        "sectionDescription": "Description",
        "serviceDetails": "ServiceDetails"
    }
};