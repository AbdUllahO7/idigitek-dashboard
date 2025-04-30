// src/hooks/service/service-section-config.ts

import { FieldConfig } from "@/src/api/types";


// Define service section configuration
export const serviceSectionConfig = {
    name: "Service Section Basic",
    slug: "services-main",
    subSectionName: "Service Section Basic",
    description: "Service section for managing service information",
    isMain: true,
    
    // Define fields with proper typing
    fields: [
        { id: "sectionBadge", label: "Section Badge", type: "text", required: true },
        { id: "sectionTitle", label: "Section Title", type: "text", required: true },
        { id: "sectionDescription", label: "Section Description", type: "textarea", required: true },
        { id: "serviceDetails", label: "Service Details", type: "badge", required: true },
    ] as FieldConfig[],

  // Define element mapping
    elementsMapping: {
        "sectionBadge": "Badge",
        "sectionTitle": "Title", 
        "sectionDescription": "Description",
        "serviceDetails": "ServiceDetails"
    }
};


