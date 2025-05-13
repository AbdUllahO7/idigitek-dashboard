// src/hooks/industry/industry-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define industry section configuration
export const industrySectionConfig = {
    name: "Industry Section Basic",
    slug: "industry-main",
    subSectionName: "Industry Section Basic",
    description: "Industry section for managing industry information",
    isMain: true,
    type: 'industry',
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Section Badge", type: "text", required: true },
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },
        { id: "sectionDescription", label: "Section Description", type: "textarea", required: false },
        { id: "industryDetails", label: "Industry Details", type: "badge", required: true },
    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionBadge": "Badge",
        "sectionTitle": "Title", 
        "sectionDescription": "Description",
        "industryDetails": "IndustryDetails"
    }
};
