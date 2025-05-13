// src/hooks/industry/industry-section-config.ts

import { FieldConfig } from "@/src/api/types/hooks/MultilingualSection.types";




// Define industry section configuration
export const whyChooseUsSectionConfig = {
    name: "Chose Us Section Basic",
    slug: "Choose-main",
    subSectionName: "Chose Us Section Basic",
    description: "Chose Us section for managing industry information",
    isMain: true,
    type: 'industry',
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
        "industryDetails": "Chose UsDetails"
    }
};
