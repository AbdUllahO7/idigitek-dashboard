// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define service section configuration
export const newsSectionConfig = {
    name: "News Section Basic",
    slug: "News-main",
    subSectionName: "News Section Basic",
    description: "News section for managing service information",
    isMain: true,
    type: 'News',
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Section Badge", type: "text", required: true },
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },
        { id: "sectionDescription", label: "Section Description", type: "textarea", required: false },
        { id: "serviceDetails", label: "news Details", type: "badge", required: true },
    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionBadge": "Badge",
        "sectionTitle": "Title", 
        "sectionDescription": "Description",
        "serviceDetails": "ServiceDetails"
    }
};